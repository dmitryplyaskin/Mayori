/** Read-only reconstruction of request input through DSH's public surface fold. */
import { Service } from '@deepseek-ai/cordis'
import { deriveEventMessage, foldSurface, foldRequestHeader } from '@deepseek-ai/dsh-session'
import { MANUAL_PROVIDER } from '../../message-revisions/domain/revisions.js'

export class TrajectoryContextService extends Service {
  constructor(ctx) { super(ctx, 'mayoriTrajectoryContext') }
  inspect() { throw new Error('TrajectoryContextService.inspect() is not implemented') }
}

/** The settlement prefix is the frozen input of a completed streaming attempt. */
export function reconstructTrajectoryContext(events, selection, projections = []) {
  const positions = new Map()
  let turn = 0, step = 0, startSeq = 0, startedAt = null
  for (const event of events) {
    if (event.type === 'turn/start') { turn = event.data.turn; step = 0 }
    if (event.type === 'step/start') { step = event.data.step; startSeq = event.seq; startedAt = event.time }
    positions.set(event.seq, { time: event.time, turn: event.data.turn ?? turn, step: event.data.step ?? step, startSeq, startedAt })
  }
  const requests = events.filter(event => (event.type === 'assistant/message' || event.type === 'assistant/attempt')
    && !['mayori-character-card', MANUAL_PROVIDER].includes(event.data.message?.source?.provider)).map((event, index) => ({
    seq: event.seq, number: index + 1, turn: event.data.turn, step: event.data.step,
    failed: event.type === 'assistant/attempt',
    time: event.time, startSeq: positions.get(event.seq).startSeq, startedAt: positions.get(event.seq).startedAt,
  }))
  const selected = selection === 'current' ? null : selection === undefined || selection === null
    ? requests.at(-1) ?? null : requests.find(request => request.seq === selection)
  if (selected === undefined) throw new TypeError('Запрос не найден в журнале чата.')
  const prefix = selected ? events.slice(0, selected.seq) : events
  const folded = foldSurface(prefix, projections)
  const messages = folded.nodes.flatMap(seq => {
    const message = deriveEventMessage(prefix[seq], folded.projectedMessages)
    // DeepSeek's wire serializer omits empty user messages. Metadata snapshots
    // remain in the full log, but contribute no content to the model input.
    return message && !(message.role === 'user' && message.content.length === 0) ? [{ seq, message, ...positions.get(seq) }] : []
  })
  return { requests, selectedSeq: selected?.seq ?? 'current',
    boundarySeq: prefix.at(-1)?.seq ?? null, messages,
    header: foldRequestHeader(prefix) ?? null }
}

export class SessionTrajectoryContextProvider extends TrajectoryContextService {
  inspect(sessionId, selection) {
    if (typeof sessionId !== 'string' || !sessionId.trim()) throw new TypeError('Некорректный идентификатор чата.')
    if (selection !== undefined && selection !== null && selection !== 'current'
      && (!Number.isSafeInteger(selection) || selection < 0)) throw new TypeError('Некорректный запрос в журнале.')
    const agent = this.ctx.agents.get(sessionId)
    if (!agent) throw new Error('Чат закрыт. Откройте его снова.')
    return reconstructTrajectoryContext(agent.session.snapshotEvents(), selection, this.ctx.sessions.messageProjections)
  }
}
