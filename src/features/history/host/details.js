/** Read-only presentation of saved character choices and session messages. */
import { Service } from '@deepseek-ai/cordis'
import { deriveEventMessage, foldSurface } from '@deepseek-ai/dsh-session'
import { FileSystemCharacterSessionStore } from '../../character-session/host/store.js'
import { imageSource } from '../../media/shared/image.js'
import { ByteCache, WorkQueue } from '../../../shared/resources.js'
import { PreviewCache } from './cache.js'
import { randomUUID } from 'node:crypto'
import { historyConfig } from './config.js'
import { readMessageEdits, revisedMessage } from '../../message-revisions/domain/edits.js'

export class HistoryDetailsService extends Service {
  constructor(ctx) { super(ctx, 'mayoriHistoryDetails') }
  read() { throw new Error('HistoryDetailsService.read() is not implemented') }
}

/** Stop after 181 code points instead of copying arbitrarily large replies. */
export function previewText(parts) {
  const characters = []
  let space = false
  for (const part of parts) {
    if (characters.length) space = true
    for (const character of part) {
      if (/\s/u.test(character)) { if (characters.length) space = true; continue }
      if (space) { characters.push(' '); space = false }
      characters.push(character)
      if (characters.length > 180) return characters.slice(0, 180).join('') + '…'
    }
  }
  return characters.join('')
}

export function messagePreview(events, projections = []) {
  const folded = foldSurface(events, projections)
  const edits = readMessageEdits(events)
  // Conversation history survives model-context compaction. Walk dialogue
  // settlements in log order, using the folded projections for revised content.
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index]
    if (!['user/message', 'assistant/message'].includes(event.type)) continue
    const message = edits[event.seq] ? revisedMessage(event, edits) : deriveEventMessage(event, folded.projectedMessages)
    if (!message || !['user', 'assistant'].includes(message.role)) continue
    const source = message.source
    if (message.role === 'user' && !['user', 'steering', 'mayori-greeting'].includes(source?.kind)) continue
    let parts = message.content.filter(block => block.type === 'text').map(block => block.text)
    if (source?.kind === 'mayori-greeting') {
      try { const text = JSON.parse(parts.join(' ')).mayori_authored_opening; parts = [typeof text === 'string' ? text : ''] } catch { continue }
    }
    const text = previewText(parts)
    if (text) return text
    if (message.content.some(block => block.type === 'image')) return 'Изображение'
    if (source?.kind === 'mayori-greeting') return ''
  }
  return ''
}

/** Reads cold logs via the public query service; creates no Agent or new store. */
export class SessionHistoryDetailsProvider extends HistoryDetailsService {
  constructor(ctx, campaignsRoot, media, options) {
    super(ctx)
    this.selections = new FileSystemCharacterSessionStore(campaignsRoot)
    this.media = media
    const config = historyConfig(options)
    this.cache = new ByteCache(config.cacheEntries, config.cacheBytes)
    this.disk = new PreviewCache(campaignsRoot, config.diskEntries)
    this.work = new WorkQueue(config.concurrency, config.maxPending)
    this.pending = new Map()
    this.epoch = randomUUID()
    this.projections = new WeakMap()
    this.projectionId = 0
    ctx.effect?.(() => () => { this.work.close(); this.cache.clear() }, 'mayori: preview readers')
  }

  async _token(id) {
    // Revisions promise equality only within one persistence service instance.
    const persistence = this.ctx.sessionPersistence
    if (!persistence?.stat || !this.selections.fingerprint) return null
    if (this.persistence !== persistence.identity) { this.persistence = persistence.identity; this.epoch = randomUUID(); this.cache.clear() }
    const snapshot = await persistence.stat(id)
    if (!snapshot) return null
    const selection = await this.selections.fingerprint(id)
    const parent = snapshot.header?.parentSession
    const inherited = selection === 'missing' && parent ? await this.selections.fingerprint(parent) : ''
    const projections = this.ctx.sessions.messageProjections.map(projection => {
      if (!this.projections.has(projection)) this.projections.set(projection, ++this.projectionId)
      return this.projections.get(projection)
    }).join(',')
    return JSON.stringify([this.epoch, snapshot.revision, this.ctx.agents?.get(id)?.session.seq ?? null, selection, inherited, projections])
  }

  async _read(id) {
    const token = await this._token(id)
    const key = `${id}:${token}`
    const cached = token ? this.cache.get(key) ?? await this.disk.get(id, token).catch(() => undefined) : undefined
    if (cached) { this.cache.set(key, cached); return cached }
    if (this.pending.has(key)) return this.pending.get(key)
    const operation = this.work.run(async () => {
      const log = await this.ctx.sessionQuery.readSession(id)
      const character = await this.selections.read(id)
        ?? (log.session.parentSession ? await this.selections.read(log.session.parentSession) : null)
      const image = this.media ? await this.media.put(character?.image) : character?.image
      const value = { characterName: character?.name ?? null, avatar: imageSource(image),
        preview: messagePreview(log.events, this.ctx.sessions.messageProjections) }
      // A changed log must not be cached under the old revision during replay.
      if (token && await this._token(id) === token && !this.work.closed) {
        this.cache.set(key, value); await this.disk.put(id, token, value).catch(() => {})
      }
      return value
    }).finally(() => this.pending.delete(key))
    this.pending.set(key, operation)
    return operation
  }

  async read(ids) {
    if (!Array.isArray(ids) || ids.length > 60 || ids.some(id => typeof id !== 'string' || !id.trim())) {
      throw new TypeError('Некорректный список чатов (не более 60).')
    }
    const details = []
    const unique = [...new Set(ids)]
    for (let offset = 0; offset < unique.length; offset += 4) {
      const batch = await Promise.all(unique.slice(offset, offset + 4).map(async id => {
        try {
          return [id, await this._read(id)]
        } catch { return [id, { error: 'Не удалось загрузить данные чата.' }] }
      }))
      details.push(...batch)
    }
    return Object.fromEntries(details)
  }
}
