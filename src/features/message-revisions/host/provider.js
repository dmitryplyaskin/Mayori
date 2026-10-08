import { randomUUID } from 'node:crypto'
import { buildForkSeed } from '@deepseek-ai/dsh-session/fork'
import { MessageRevisionService } from './service.js'
import { authoredReply, editedContent, humanMessage, regenerationInput, textContent, MANUAL_PROVIDER } from '../domain/revisions.js'
import { presetSelectionMessage, readPresetSelection } from '../../presets/shared/preset.js'

/** Use native forks and logged authored settlements; the source session is never rewritten. */
export class SessionMessageRevisionProvider extends MessageRevisionService {
  constructor(ctx, characterSessions) { super(ctx); this.characters = characterSessions; this.changing = new Set() }

  _agent(sessionId) {
    if (typeof sessionId !== 'string' || !sessionId.trim()) throw new TypeError('Некорректный идентификатор чата.')
    const agent = this.ctx.agents.get(sessionId)
    if (!agent) throw new Error('Чат закрыт. Откройте его снова.')
    return agent
  }

  async _resolveAgent(sessionId) {
    if (typeof sessionId !== 'string' || !sessionId.trim()) throw new TypeError('Некорректный идентификатор чата.')
    let agent = this.ctx.agents.get(sessionId)
    if (!agent && this.ctx.sessionController.resolveAgent) {
      const result = await this.ctx.sessionController.resolveAgent(sessionId)
      if (result.error) throw new Error('Не удалось открыть чат для редактирования.', { cause: result.error })
      agent = result.agent
    }
    if (!agent) throw new Error('Чат закрыт. Откройте его снова.')
    if (agent.session.header.origin === 'subagent') throw new Error('Редактирование доступно в чате персонажа.')
    return agent
  }

  async _maintain(agent, operation) {
    if (this.changing.has(agent.id)) throw new Error('Дождитесь сохранения текущей реплики.')
    this._idle(agent)
    this.changing.add(agent.id)
    try { return await agent.runMaintenance(operation) }
    finally { this.changing.delete(agent.id) }
  }

  _idle(agent) {
    if (this.ctx.agents.get(agent.id) !== agent || agent.status !== 'idle'
      || agent.inbox?.nextTurn.length || agent.inbox?.nextStep.length) {
      throw new Error('Дождитесь завершения ответа и отправки сообщений из очереди.')
    }
  }

  async _target(agent, seq) {
    if (!Number.isSafeInteger(seq) || seq < 1) throw new TypeError('Некорректная реплика.')
    const state = await this.characters.state(agent.id)
    if (!state?.character) throw new Error('Редактирование доступно в чате персонажа.')
    const { events } = await this.ctx.sessionQuery.readSession(agent.id)
    const event = events[seq]
    if (!event || !(event.type === 'assistant/message' || humanMessage(event))) throw new Error('Реплика не найдена в журнале чата.')
    const message = agent.session.deriveEventMessage(event)
    if (!message) throw new Error('Реплика не содержит сообщения.')
    if (message.content.some(block => block.type === 'tool-call')) throw new Error('Вызовы инструментов нельзя редактировать как реплику.')
    const greeting = state.greeting?.messageId === message.id
    const text = greeting ? state.greeting.text : textContent(message.content)
    if (!text.trim()) throw new Error('У этой реплики нет текста для редактирования.')
    return { events, event, message, text, greeting, role: message.role,
      manual: message.source?.provider === MANUAL_PROVIDER }
  }

  async inspect(sessionId, seq) {
    const agent = await this._resolveAgent(sessionId)
    const target = await this._target(agent, seq)
    let canRegenerate = false
    if (target.role === 'assistant' && !target.greeting) {
      try { regenerationInput(target.events, seq); canRegenerate = true } catch {}
    }
    return { seq, text: target.text, role: target.role, manual: target.manual, canRegenerate }
  }

  async _fork(agent, atSeq, signal) {
    signal.throwIfAborted()
    this._idle(agent)
    await this.ctx.sessions.flush(agent.session)
    signal.throwIfAborted()
    this._idle(agent)
    const value = await this.ctx.sessionController.fork({ sessionId: agent.id, atSeq })
    const child = this._agent(value.sessionId)
    try {
      // Native fork uses deployment defaults; repeat with the source chat's selected route.
      const { events } = await this.ctx.sessionQuery.readSession(agent.id)
      const selection = this._selection(events, agent)
      await this.ctx.sessionController.selectModel({ sessionId: child.id,
        provider: selection.provider, model: selection.model,
        ...(selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort }) })
      signal.throwIfAborted()
    } catch (error) {
      throw new Error(`Ветка ${child.id} сохранена, но модель не выбрана. Откройте её в истории чатов.`, { cause: error })
    }
    return child
  }

  _selection(events, agent) {
    const selected = events.findLast(event => event.type === 'model/selection')
    const requested = events.findLast(event => event.type === 'request/header')
    const selection = selected && (!requested || selected.seq > requested.seq)
      ? selected.data : requested?.data.header.config ?? selected?.data ?? agent.options
    return { provider: selection.provider, model: selection.model,
      ...(selection.reasoningEffort === undefined ? {} : { reasoningEffort: selection.reasoningEffort }) }
  }

  async _authoredFork(agent, target, content, signal) {
    signal.throwIfAborted()
    this._idle(agent)
    await this.ctx.sessions.flush(agent.session)
    signal.throwIfAborted()
    const { events } = await this.ctx.sessionQuery.readSession(agent.id)
    // An opening has no player input to preserve. Start before its turn so a
    // repeated manual opening remains the first turn, with no empty predecessor.
    const opening = !events.slice(0, target.event.seq).some(humanMessage)
    const inheritedEventCount = opening ? 0 : target.event.seq
    const seed = opening
      ? [{ type: 'session/end-seed', seq: 0, time: Date.now(), data: { inherited: true } }]
      : buildForkSeed(events, target.event.seq - 1)
    // Seed the completed authored turn before constructing Agent. Its loop must
    // initialize its next turn from the same durable history as cold replay.
    seed.push(...authoredReply(seed, randomUUID(), content, Date.now()))
    if (opening) {
      // This branch has no inherited prefix. Carry the chat's exact instructions,
      // including null, so restoration cannot substitute the catalog default.
      const roleplayPreset = readPresetSelection(events)
      if (roleplayPreset !== undefined) seed.push({ type: 'user/message', seq: seed.length, time: Date.now(),
        surfaceOp: 'append', data: presetSelectionMessage(roleplayPreset, randomUUID()) })
    }
    const selection = this._selection(events, agent)
    seed.push({ type: 'model/selection', data: selection, seq: seed.length, time: Date.now() })
    const presetId = events.findLast(event => event.type === 'agent-preset/selected')?.data.agentPreset
      ?? agent.session.header.agentPreset
    const preset = await this.ctx.agentPresets.resolve(presetId)
    signal.throwIfAborted()
    const sessionId = `session-${randomUUID()}`
    const handle = await this.ctx.agents.create({ sessionId, seed, inheritedEventCount,
      meta: { ...(agent.session.header.cwd === undefined ? {} : { cwd: agent.session.header.cwd }),
        parentSession: agent.id, isSeeded: true, agentPreset: preset.id },
      agentOptions: selection,
      setup: async agentCtx => { await this.ctx.agentPresets.mount(agentCtx, preset.id) },
    })
    try {
      const workspace = this.ctx.workspaceRegistry.list().find(workspace => workspace.sessionIds.includes(agent.id))
      await workspace?.attachSession(sessionId)
      await this.ctx.sessions.flush(handle.agent.session)
    } catch (error) {
      throw new Error(`Ветка ${sessionId} создана. Откройте её в истории чатов, чтобы продолжить.`, { cause: error })
    } finally {
      // Browser adoption resumes the complete log with the native API setup.
      await handle.dispose()
    }
    return sessionId
  }

  async edit(sessionId, seq, text) {
    const agent = await this._resolveAgent(sessionId)
    return this._maintain(agent, async signal => {
      this._idle(agent)
      const target = await this._target(agent, seq)
      signal.throwIfAborted()
      const content = editedContent(target.message.content, text)
      if (text === target.text) return { sessionId, changed: false }
      if (target.role === 'assistant') {
        return { sessionId: await this._authoredFork(agent, target, content, signal), changed: true }
      }
      const child = await this._fork(agent, seq - 1, signal)
      try {
        child.followup({ ...target.message, id: randomUUID(), content, source: { kind: 'user' } })
        await this.ctx.sessions.flush(child.session)
      } catch (error) {
        throw new Error(`Ветка ${child.id} сохранена. Откройте её в истории чатов, чтобы продолжить.`, { cause: error })
      }
      return { sessionId: child.id, changed: true }
    })
  }

  async regenerate(sessionId, seq) {
    const agent = await this._resolveAgent(sessionId)
    return this._maintain(agent, async signal => {
      this._idle(agent)
      const target = await this._target(agent, seq)
      if (target.role !== 'assistant' || target.greeting) throw new Error('Авторское приветствие нельзя генерировать заново.')
      const input = regenerationInput(target.events, seq)
      const child = await this._fork(agent, input.seq - 1, signal)
      try {
        child.followup({ ...input.data, id: randomUUID(), source: { kind: 'user' } })
        await this.ctx.sessions.flush(child.session)
      } catch (error) {
        throw new Error(`Ветка ${child.id} сохранена. Откройте её в истории чатов, чтобы продолжить.`, { cause: error })
      }
      return { sessionId: child.id, changed: true }
    })
  }
}
