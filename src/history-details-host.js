/** Read-only presentation of saved character choices and session messages. */
import { Service } from '@deepseek-ai/cordis'
import { deriveEventMessage, foldSurface } from '@deepseek-ai/dsh-session'
import { FileSystemCharacterSessionStore } from './character-play-host.js'

export class HistoryDetailsService extends Service {
  constructor(ctx) { super(ctx, 'mayoriHistoryDetails') }
  read() { throw new Error('HistoryDetailsService.read() is not implemented') }
}

export function messagePreview(events, projections = []) {
  const folded = foldSurface(events, projections)
  // Conversation history survives model-context compaction. Walk dialogue
  // settlements in log order, using the folded projections for revised content.
  for (const event of [...events].reverse()) {
    if (!['user/message', 'assistant/message'].includes(event.type)) continue
    const message = deriveEventMessage(event, folded.projectedMessages)
    if (!message || !['user', 'assistant'].includes(message.role)) continue
    const source = message.source
    if (message.role === 'user' && !['user', 'steering', 'mayori-greeting'].includes(source?.kind)) continue
    let text = message.content.filter(block => block.type === 'text').map(block => block.text).join(' ')
    if (source?.kind === 'mayori-greeting') {
      try { text = JSON.parse(text).mayori_authored_opening ?? '' } catch { continue }
    }
    text = text.replace(/\s+/gu, ' ').trim()
    if (text) {
      const characters = Array.from(text)
      return characters.slice(0, 180).join('') + (characters.length > 180 ? '…' : '')
    }
    if (message.content.some(block => block.type === 'image')) return 'Изображение'
    if (source?.kind === 'mayori-greeting') return ''
  }
  return ''
}

/** Reads cold logs via the public query service; creates no Agent or new store. */
export class SessionHistoryDetailsProvider extends HistoryDetailsService {
  constructor(ctx, campaignsRoot) {
    super(ctx)
    this.selections = new FileSystemCharacterSessionStore(campaignsRoot)
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
          const log = await this.ctx.sessionQuery.readSession(id)
          const character = await this.selections.read(id)
            ?? (log.session.parentSession ? await this.selections.read(log.session.parentSession) : null)
          return [id, { characterName: character?.name ?? null, avatar: character?.image ?? null,
            preview: messagePreview(log.events, this.ctx.sessions.messageProjections) }]
        } catch { return [id, { error: 'Не удалось загрузить данные чата.' }] }
      }))
      details.push(...batch)
    }
    return Object.fromEntries(details)
  }
}
