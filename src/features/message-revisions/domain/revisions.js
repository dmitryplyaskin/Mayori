export const MANUAL_PROVIDER = 'mayori-authored-message'

export function textContent(content) {
  return content.filter(block => block.type === 'text').map(block => block.text).join('\n')
}

/** Authored edits retain attachments, but never manufacture reasoning or tool calls. */
export function editedContent(content, text) {
  if (typeof text !== 'string' || !text.trim()) throw new TypeError('Введите текст сообщения.')
  const attachments = content.filter(block => !['text', 'reasoning', 'tool-call'].includes(block.type))
  return [{ type: 'text', text }, ...attachments]
}

export function humanMessage(event) {
  return event.type === 'user/message' && ['user', 'steering'].includes(event.data.source?.kind)
}

/** Repeat the nearest human input; keep everything before that input in its original order. */
export function regenerationInput(events, targetSeq) {
  const input = events.slice(0, targetSeq).findLast(humanMessage)
  if (!input || input.seq < 1) throw new Error('У этого ответа нет реплики игрока для повторной генерации.')
  return input
}

/** A manual reply is authored material, with no model stream or fabricated usage. */
export function authoredReply(events, messageId, content, time) {
  const turn = events.reduce((last, event) => event.type === 'turn/start' ? Math.max(last, event.data.turn) : last, 0) + 1
  const additions = [
    { type: 'turn/start', data: { turn } },
    { type: 'step/start', data: { turn, step: 1 } },
    { type: 'assistant/message', surfaceOp: 'append', data: { turn, step: 1, stream: [], message: {
      id: messageId, role: 'assistant', source: { kind: 'model', provider: MANUAL_PROVIDER, model: 'manual-edit' }, content,
    } } },
    { type: 'step/end', data: { turn, step: 1 } },
    { type: 'turn/end', data: { turn, reason: { kind: 'completed' } } },
  ]
  return additions.map((event, index) => ({ ...event, seq: events.length + index, time }))
}

/** Native parent links own branch navigation; no second version store is needed. */
export function branchRows(snapshot, sessionId) {
  const rows = snapshot.byId
  const rootOf = id => {
    const seen = new Set()
    while (rows[id]?.parentId && rows[rows[id].parentId] && !seen.has(id)) {
      seen.add(id)
      id = rows[id].parentId
    }
    return id
  }
  const root = rootOf(sessionId)
  return snapshot.ids.filter(id => rows[id]?.origin !== 'subagent' && rootOf(id) === root)
    .sort((a, b) => (a === root ? -1 : b === root ? 1 : (rows[a].updatedAt ?? 0) - (rows[b].updatedAt ?? 0) || a.localeCompare(b)))
    .map((id, index) => ({ id, label: index === 0 ? 'Исходный чат' : `Ветка ${index} · ${rows[id].title?.trim() || 'Чат без названия'}` }))
}
