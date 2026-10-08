import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { SessionPresetService } from './service.js'
import { PRESET_SECTION, PRESET_SOURCE, presetContext, presetSelectionMessage, readPresetSelection } from '../shared/preset.js'

/** Restore from the exact inherited log prefix, never the parent's current catalog. */
export class LoggedSessionPresetProvider extends SessionPresetService {
  // Cordis service consumers use proxy receivers; state must work through them.
  _bindings = new WeakMap()
  _selections = new WeakMap()
  _changing = new Set()
  constructor(ctx, presets) {
    super(ctx)
    this.presets = presets
    ctx.on('agent/created', ({ agent }) => this.restore(agent))
    ctx.on('agent/disposed', ({ agent }) => {
      this._bindings.get(agent)?.()
      this._bindings.delete(agent)
      this._selections.delete(agent)
    })
  }
  async restoreActiveAgents() {
    for (const agent of this.ctx.agents.list()) await agent.runMaintenance(() => this.restore(agent))
  }
  async restore(agent) {
    if (agent.session.header.origin === 'subagent') return
    const { events } = await this.ctx.sessionQuery.readSession(agent.id)
    const preset = readPresetSelection(events)
    if (preset !== undefined) this._bind(agent, preset)
    else await this._record(agent, await this.presets.resolve())
  }
  _bind(agent, preset) {
    this._bindings.get(agent)?.()
    const section = agent.ctx.systemPrompt.section({
      name: PRESET_SECTION, order: 10, interpolate: false, text: presetContext(preset),
    })
    let prefix
    try {
      prefix = agent.ctx.on('agent/pre-step', async (_payload, next) => {
        const decision = await next()
        return decision.kind === 'enter' ? { ...decision, startsRequestSeries: true } : decision
      })
    } catch (error) { section(); throw error }
    const dispose = this.ctx.effect(() => () => { prefix(); section() }, `mayori: session preset (${agent.id})`)
    this._bindings.set(agent, dispose)
    this._selections.set(agent, preset)
  }
  _idle(agent) {
    if (this.ctx.agents.get(agent.id) !== agent || agent.status !== 'idle'
      || agent.inbox?.nextTurn.length || agent.inbox?.nextStep.length) {
      throw new Error('Дождитесь завершения ответа и отправки сообщений из очереди.')
    }
  }
  async _record(agent, preset, signal) {
    const previous = this._selections.get(agent)
    const { events } = await this.ctx.sessionQuery.readSession(agent.id)
    signal?.throwIfAborted()
    if (signal) this._idle(agent)
    try {
      this._bind(agent, preset)
      const previousSeq = agent.session.surface.nodes.findLast(seq => {
        const event = events[seq]
        return event?.type === 'user/message' && [PRESET_SOURCE, 'runtime-context'].includes(event.data.source?.kind)
          && event.data.source.sections?.some(section => section.name === PRESET_SECTION)
      })
      // A user-role configuration snapshot may be logged outside a model step.
      // Full instructions live in its source metadata; the loop records the actual
      // rendered system message at its own canonical admission boundary.
      agent.session.append('user/message', createUserMessage(presetSelectionMessage(preset)),
        { surfaceOp: previousSeq === undefined ? 'append' : { op: 'replace', startSeq: previousSeq, endSeq: previousSeq },
        ...(previousSeq === undefined ? {} : { sourceEventSeqs: [previousSeq] }) })
    } catch (error) {
      if (previous !== undefined) this._bind(agent, previous)
      else { this._bindings.get(agent)?.(); this._selections.delete(agent); this._bindings.delete(agent) }
      throw error
    }
    await this.ctx.sessions.flush(agent.session)
  }
  async _agent(sessionId) {
    if (typeof sessionId !== 'string' || !sessionId.trim()) throw new TypeError('Некорректный идентификатор чата.')
    let agent = this.ctx.agents.get(sessionId)
    if (!agent) {
      const result = await this.ctx.sessionController.resolveAgent(sessionId)
      if (result.error) throw new Error('Не удалось открыть чат.', { cause: result.error })
      agent = result.agent
    }
    if (!agent || agent.session.header.origin === 'subagent') throw new Error('Выберите основной чат для игры.')
    return agent
  }
  async state(sessionId) {
    const agent = await this._agent(sessionId)
    return { preset: this._selections.get(agent) ?? null }
  }
  async select(sessionId, presetId) {
    const agent = await this._agent(sessionId)
    if (this._changing.has(sessionId)) throw new Error('Дождитесь сохранения текущего пресета.')
    this._idle(agent)
    this._changing.add(sessionId)
    try {
      return await agent.runMaintenance(async signal => {
        this._idle(agent)
        const preset = await this.presets.resolve(presetId)
        await this._record(agent, preset, signal)
        return { preset }
      })
    } finally { this._changing.delete(sessionId) }
  }
}
