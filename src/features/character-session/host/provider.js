/** Coordinate character selection, session events and scoped prompt contributions. */
import { mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { joinContextSections } from '@deepseek-ai/dsh-system-prompt'
import { DEFAULT_PERSONA, renderTemplate } from '../../../shared/templates.js'
import { validateCardId, validateSessionId, characterSnapshot, buildCharacterContext } from '../domain/character.js'
import { CharacterSessionService } from './service.js'
import { FileSystemCharacterSessionStore } from './store.js'
import { greetingSeed } from './greeting.js'
import { PRESET_SOURCE } from '../../presets/shared/preset.js'
import { imageSource } from '../../media/shared/image.js'

const CHARACTER_CONTEXT_NAME = 'mayori:active-character'
const CHARACTER_CONTEXT_VARIABLE = 'mayori_active_character_text'

export class PersistentCharacterSessionProvider extends CharacterSessionService {
  _library
  _ownerCtx
  _bindings = new WeakMap()
  _defaultCampaignPath
  _store
  _pending = new Map()

  constructor(ctx, library, config) {
    super(ctx)
    if (typeof config?.campaignsRoot !== 'string' || config.campaignsRoot.trim() === '') {
      throw new TypeError('campaignsPath must be a non-empty string')
    }
    this._library = library
    this._ownerCtx = ctx
    this._defaultCampaignPath = resolve(config.campaignsRoot.trim(), 'default')
    this._store = new FileSystemCharacterSessionStore(config.campaignsRoot)
    this._personas = config.personas
    this._media = config.media
    ctx.on('agent/created', async ({ agent }) => { await this._restore(agent) })
    ctx.on('agent/disposed', ({ agent }) => {
      this._bindings.get(agent)?.()
      this._bindings.delete(agent)
    })
  }

  get defaultCampaignPath() { return this._defaultCampaignPath }

  async restoreActiveAgents() {
    await Promise.all(this.ctx.agents.list().map(agent => agent.runMaintenance(() => this._restore(agent))))
  }

  async _restore(agent) {
    let character = await this._store.read(agent.id)
    if (character === null && agent.session.header.parentSession !== undefined) {
      character = await this._store.read(agent.session.header.parentSession)
      if (character !== null) {
        try { await this._store.save(agent.id, character, () => this._assertLive(agent)) } catch (error) {
          if (error.code !== 'EEXIST') throw error
          character = await this._store.read(agent.id)
        }
      }
    }
    if (character !== null) {
      this._assertLive(agent)
      if (character.image === undefined) {
        character.image = (this._library.get ? await this._library.get(character.id).catch(error => {
          if (error.code === 'ENOENT') return null
          throw error
        }) : (await this._library.list()).find(card => card.id === character.id))?.image ?? null
        await this._store.update(agent.id, character, () => this._assertLive(agent))
      }
      if (this._media && [character.image, character.persona?.avatar].some(value => value?.startsWith('data:image/'))) {
        character.image = await this._media.put(character.image)
        if (character.persona?.avatar) character.persona.avatar = await this._media.put(character.persona.avatar)
        await this._store.update(agent.id, character, () => this._assertLive(agent))
      }
      this._bind(agent, character)
    }
  }

  async prepareCampaign() {
    await mkdir(this._defaultCampaignPath, { recursive: true })
    return { path: this._defaultCampaignPath }
  }

  select(sessionId, characterId) {
    const safeSessionId = validateSessionId(sessionId)
    const safeCharacterId = validateCardId(characterId)
    const previous = this._pending.get(safeSessionId) ?? Promise.resolve()
    // Each caller receives its own failure; a failed predecessor must not poison the queue.
    const operation = previous.then(() => undefined, () => undefined)
      .then(() => this._select(safeSessionId, safeCharacterId))
    this._pending.set(safeSessionId, operation)
    const release = () => {
      if (this._pending.get(safeSessionId) === operation) this._pending.delete(safeSessionId)
    }
    void operation.then(release, release)
    return operation
  }

  _assertLive(agent) {
    if (this.ctx.agents.get(agent.id) !== agent) throw new Error('Чат закрыт. Создайте новый чат из галереи.')
  }

  _assertEmpty(agent) {
    this._assertLive(agent)
    if (agent.status !== 'idle') throw new Error('Дождитесь окончания ответа перед выбором персонажа.')
    const events = agent.session.snapshotEvents()
    if (agent.session.surface.nodes.some(seq => events[seq]?.type !== 'system/message'
      && !(events[seq]?.type === 'user/message' && [PRESET_SOURCE, 'runtime-context'].includes(events[seq].data.source?.kind)))) {
      throw new Error('Для другого персонажа создайте новый чат из галереи.')
    }
  }

  async _select(safeSessionId, safeCharacterId) {
    const agent = this.ctx.agents.get(safeSessionId)
    if (agent === undefined) throw new Error('Чат закрыт. Создайте новый чат из галереи.')
    return agent.runMaintenance(signal => this._selectWhileIdle(agent, safeSessionId, safeCharacterId, signal))
  }

  async _selectWhileIdle(agent, safeSessionId, safeCharacterId, signal) {
    const current = await this._store.read(safeSessionId)
    if (current !== null) {
      if (current.id !== safeCharacterId) throw new Error('Для другого персонажа создайте новый чат из галереи.')
      this._assertLive(agent)
      this._bind(agent, current)
      return { sessionId: safeSessionId, character: { id: current.id, name: current.name } }
    }

    const card = this._library.get ? await this._library.get(safeCharacterId) : (await this._library.list()).find(item => item.id === safeCharacterId)
    if (card === undefined) throw new Error('Персонаж больше не найден в галерее.')
    const character = characterSnapshot(card)
    character.image ??= null
    character.persona = await this._personas?.resolve() ?? { ...DEFAULT_PERSONA }
    character.templateTime = Date.now()
    await this._store.save(safeSessionId, character, () => {
      signal.throwIfAborted()
      this._assertEmpty(agent)
    })
    this._assertEmpty(agent)
    this._bind(agent, character)
    return { sessionId: safeSessionId, character: { id: character.id, name: character.name } }
  }

  /** Prepare and persist a seeded chat before the browser adopts it through sessions.create. */
  async create(characterId, workspaceId, greetingIndex = 0) {
    validateCardId(characterId)
    if (!Number.isSafeInteger(greetingIndex) || greetingIndex < 0) throw new TypeError('Некорректный вариант приветствия.')
    const workspace = this.ctx.workspaceRegistry.get(workspaceId)
    if (!workspace) throw new Error('Кампания не найдена. Обновите страницу.')
    const card = this._library.get ? await this._library.get(characterId) : (await this._library.list()).find(card => card.id === characterId)
    if (!card) throw new Error('Персонаж больше не найден в галерее.')
    const character = characterSnapshot(card)
    character.image ??= null
    character.persona = await this._personas?.resolve() ?? { ...DEFAULT_PERSONA }
    character.templateTime = Date.now()
    const greetings = [character.data.first_mes, ...character.data.alternate_greetings]
    if (greetingIndex >= greetings.length) throw new TypeError('Приветствие больше не найдено в карточке.')
    character.greeting = { index: greetingIndex, messageId: randomUUID(),
      text: renderTemplate(greetings[greetingIndex], character, character.persona, character.templateTime) }
    const sessionId = `session-${randomUUID()}`
    const preset = await this.ctx.agentPresets.resolve()
    await this._store.save(sessionId, character, () => {})
    const handle = await this.ctx.agents.create({
      sessionId, meta: { cwd: workspace.path, agentPreset: preset.id },
      seed: greetingSeed(character.greeting),
      setup: async agentCtx => { await this.ctx.agentPresets.mount(agentCtx, preset.id) },
    })
    try {
      await workspace.attachSession(sessionId)
      await this.ctx.sessions.flush(handle.agent.session)
    } finally {
      // Release our temporary owner. Browser adoption resumes with the normal API configuration.
      await handle.dispose()
    }
    return { sessionId }
  }

  _isOpening(event, character) {
    const message = event?.type === 'assistant/message' ? event.data.message : event?.type === 'user/message' ? event.data : null
    return message && (message.source?.provider === 'mayori-character-card' || message.source?.kind === 'mayori-greeting')
      && (message.id === character.greeting.messageId || message.id.startsWith(`${character.greeting.messageId}:swipe:`))
  }

  _opening(agent, character) {
    if (!character.greeting) return null
    const events = agent.session.snapshotEvents()
    return agent.session.surface.nodes.map(seq => events[seq]).find(event => this._isOpening(event, character)) ?? null
  }

  _canSwipe(agent, character) {
    if (!character.greeting || agent.status !== 'idle') return false
    const events = agent.session.snapshotEvents()
    return !events.some(event => event.type === 'user/message' && !['mayori-greeting', 'runtime-context', PRESET_SOURCE].includes(event.data.source?.kind)
      || event.type === 'turn/start' && event.data.turn > 1)
      && !(agent.inbox?.nextTurn.length || agent.inbox?.nextStep.length)
  }

  _state(agent, character) {
    if (!character) return null
    const surfaceOpening = this._opening(agent, character)
    // Compaction can shadow model history, but the human transcript still owns
    // the last authored selection in the append-only log.
    const opening = surfaceOpening ?? (character.greeting
      ? agent.session.snapshotEvents().findLast(event => this._isOpening(event, character)) : null)
    const message = opening?.type === 'user/message' ? opening.data : opening?.data.message
    const match = message?.id.match(/:swipe:(\d+):/)
    const content = message?.content.map(block => block.type === 'text' ? block.text : '').join('') ?? ''
    const persona = character.persona ?? DEFAULT_PERSONA
    return { character: { id: character.id, name: character.name, image: imageSource(character.image), originalImage: imageSource(character.image, 'original') },
      persona: { ...persona, avatar: imageSource(persona.avatar) ?? '', originalAvatar: imageSource(persona.avatar, 'original') },
      greeting: character.greeting ? { messageId: character.greeting.messageId,
        eventSeq: opening?.seq ?? null,
        index: match ? Number(match[1]) : character.greeting.index,
        count: 1 + character.data.alternate_greetings.length,
        text: opening?.type === 'user/message' ? JSON.parse(content).mayori_authored_opening : content,
        canSwipe: this._canSwipe(agent, character) && surfaceOpening !== null } : null }
  }

  async state(sessionId) {
    const id = validateSessionId(sessionId)
    let agent = this.ctx.agents.get(id)
    if (!agent && this.ctx.sessionController?.resolveAgent) {
      const result = await this.ctx.sessionController.resolveAgent(id)
      if (result.error) throw new Error('Не удалось открыть чат персонажа.', { cause: result.error })
      agent = result.agent
    }
    if (!agent) throw new Error('Чат закрыт. Откройте его снова.')
    let character = await this._store.read(sessionId)
    if (character && this._media && [character.image, character.persona?.avatar].some(value => value?.startsWith('data:image/'))) {
      // The normal restore boundary persists legacy presentation references.
      // A read of an externally replaced snapshot must not delay a running reply.
      character.image = await this._media.put(character.image)
      if (character.persona?.avatar) character.persona.avatar = await this._media.put(character.persona.avatar)
    }
    return this._state(agent, character)
  }

  _replaceGreeting(agent, character, index) {
    const opening = this._opening(agent, character)
    if (!opening) return
    const text = renderTemplate([character.data.first_mes, ...character.data.alternate_greetings][index],
      character, character.persona ?? DEFAULT_PERSONA, character.templateTime ?? 0)
    // DSH assistant settlements cannot cite replacement coverage. Use its public
    // user-role context seam to replace the authored scenario, keeping the source
    // explicit so it cannot be confused with a player's voluntary action.
    agent.session.append('user/message', {
      id: `${character.greeting.messageId}:swipe:${index}:${randomUUID()}`, role: 'user', source: { kind: 'mayori-greeting' },
      content: [{ type: 'text', text: JSON.stringify({ mayori_authored_opening: text, character: character.name,
        note: 'Selected authored opening; scenario material, not a player action.' }, null, 2) }],
    }, { surfaceOp: { op: 'replace', startSeq: opening.seq, endSeq: opening.seq }, sourceEventSeqs: [opening.seq] })
  }

  async swipe(sessionId, index) {
    const agent = this.ctx.agents.get(validateSessionId(sessionId))
    if (!agent) throw new Error('Чат закрыт. Откройте его снова.')
    return agent.runMaintenance(async signal => {
      const character = await this._store.read(sessionId)
      signal.throwIfAborted()
      this._assertLive(agent)
      if (!character || !this._canSwipe(agent, character) || !this._opening(agent, character)) {
        throw new Error('Приветствие можно менять только до первого хода игрока.')
      }
      if (!Number.isSafeInteger(index) || index < 0 || index > character.data.alternate_greetings.length) {
        throw new TypeError('Некорректный вариант приветствия.')
      }
      this._replaceGreeting(agent, character, index)
      await this.ctx.sessions.flush(agent.session)
      return this._state(agent, character)
    })
  }

  async setPersona(sessionId, personaId) {
    const agent = this.ctx.agents.get(validateSessionId(sessionId))
    if (!agent) throw new Error('Чат закрыт. Откройте его снова.')
    return agent.runMaintenance(async signal => {
      const character = await this._store.read(sessionId)
      if (!character) throw new Error('Выберите чат персонажа из галереи.')
      character.persona = await this._personas.resolve(personaId)
      signal.throwIfAborted()
      this._assertLive(agent)
      await this._store.update(sessionId, character, () => { signal.throwIfAborted(); this._assertLive(agent) })
      const state = this._state(agent, character)
      if (state.greeting?.canSwipe) this._replaceGreeting(agent, character, state.greeting.index)
      this._bind(agent, character)
      await this.ctx.sessions.flush(agent.session)
      return this._state(agent, character)
    })
  }

  _bind(agent, character) {
    this._bindings.get(agent)?.()
    const text = buildCharacterContext(character)
    // DSH interpolates contexts strictly but variable values are literal, single-pass
    // data. Keep imported ST expressions out of DSH's variable namespace entirely.
    const disposeVariable = agent.ctx.systemPrompt.variable(CHARACTER_CONTEXT_VARIABLE, () => text)
    let disposeContext
    let disposePrefix
    try {
      disposeContext = agent.ctx.systemPrompt.section({
        name: CHARACTER_CONTEXT_NAME,
        order: 20000,
        text: `{{${CHARACTER_CONTEXT_VARIABLE}}}`,
      })
      this._retireLegacyContext(agent)
      // Capable adapters may append changed system prompts after a cached greeting.
      // A new request series asks DSH to consolidate them at the reserved head.
      disposePrefix = agent.ctx.on('agent/pre-step', async (_payload, next) => {
        const decision = await next()
        return decision.kind === 'enter' ? { ...decision, startsRequestSeries: true } : decision
      })
    } catch (error) {
      disposePrefix?.()
      disposeContext?.()
      disposeVariable()
      throw error
    }
    const dispose = this._ownerCtx.effect(
      () => () => { disposePrefix(); disposeContext(); disposeVariable() },
      `mayori: active character context (${agent.id})`,
    )
    this._bindings.set(agent, dispose)
  }

  /** Keep old request inputs intact; retire only the card's former runtime seat. */
  _retireLegacyContext(agent) {
    const events = agent.session.snapshotEvents()
    for (const seq of [...agent.session.surface.nodes]) {
      const event = events[seq]
      const message = event?.type === 'user/message' ? event.data : null
      if (message?.source.kind !== 'runtime-context'
        || !message.source.sections?.some(section => section.name === CHARACTER_CONTEXT_NAME)) continue
      const sections = message.source.sections.filter(section => section.name !== CHARACTER_CONTEXT_NAME)
      agent.session.append('user/message', { ...message, id: randomUUID(),
        source: { ...message.source, sections },
        content: [{ type: 'text', text: sections.length ? joinContextSections(sections)
          : 'Character context now belongs to the active character section of the system prompt.' }],
      }, { surfaceOp: { op: 'replace', startSeq: seq, endSeq: seq }, sourceEventSeqs: [seq] })
    }
  }
}
