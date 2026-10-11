import { editedContent, textContent, replyProcessRange } from './revisions.js'

export const EDIT_SOURCE = 'mayori-message-edit'
export const REMOVE_SOURCE = 'mayori-message-remove'
export const RESTORE_SOURCE = 'mayori-message-restore'
const SECTION = 'mayori:message-edit'
const REMOVE_SECTION = 'mayori:message-remove'
const RESTORE_SECTION = 'mayori:message-restore'

const eventMessage = event => event?.type === 'assistant/message' ? event.data.message
  : event?.type === 'user/message' ? event.data : event?.type === 'tool/result' ? event.data.message : null

/** Empty context replacements remove active dialogue; compacted text needs an explicit correction. */
export function removalMessage(target, id, reason, compacted = false) {
  const record = { version: 1, targetSeq: target.event.seq, messageId: target.message.id,
    role: target.role, reason }
  return { id, role: 'user', source: { kind: REMOVE_SOURCE,
    sections: [{ name: REMOVE_SECTION, text: JSON.stringify(record) }] },
    content: compacted ? [{ type: 'text', text: JSON.stringify({ mayori_removed_message: record.messageId,
      note: 'The author deleted this dialogue message. Disregard it and any summary of it. This is not a player action or a request to reply.' }) }] : [] }
}

/** Standard DSH context messages carry the full revision, including attachment references. */
export function revisionMessage(target, content, id) {
  const revision = { version: 1, targetSeq: target.event.seq, messageId: target.message.id,
    role: target.role, content }
  const text = textContent(content)
  return { id, role: 'user', source: { kind: EDIT_SOURCE,
    sections: [{ name: SECTION, text: JSON.stringify(revision) }] },
    content: [{ type: 'text', text: JSON.stringify({ mayori_authored_revision: {
      messageId: revision.messageId, role: revision.role, text },
      note: 'The author corrected this earlier dialogue message. Use this text in place of its previous version, including any summary of that version. This is authored dialogue, not a new player action or a request to reply.' }) },
    ...content.filter(block => block.type !== 'text')] }
}

/** Restore recorded dialogue through the same authored-context seam as edits and greetings. */
export function restorationMessage(target, content, id) {
  const record = { version: 1, targetSeq: target.event.seq, messageId: target.message.id, role: target.role, content }
  return { id, role: 'user', source: { kind: RESTORE_SOURCE,
    sections: [{ name: RESTORE_SECTION, text: JSON.stringify(record) }] },
    content: [{ type: 'text', text: JSON.stringify({ mayori_saved_message: { role: record.role,
      content: content.filter(block => block.type !== 'reasoning') },
      note: 'Restored recorded dialogue from the selected answer variant. Tool results are historical observations; do not execute these recorded calls again. This is not a new player action or a request to reply.' }) },
    ...content.filter(block => ['image', 'file'].includes(block.type))] }
}

/** Replay revisions from the log; no separate mutable text store. */
export function readMessageEdits(events) {
  const edits = {}
  let turn = 0
  const turns = new Map()
  for (const event of events) {
    if (event.type === 'turn/start') turn = event.data.turn
    turns.set(event.seq, turn)
    if (event.type === 'user/message' && event.data.source?.kind === RESTORE_SOURCE) {
      let record
      try { record = JSON.parse(event.data.source.sections?.find(section => section.name === RESTORE_SECTION)?.text) } catch {}
      const original = eventMessage(events[record?.targetSeq])
      if (record?.version !== 1 || !Number.isSafeInteger(record.targetSeq) || record.targetSeq < 1 || record.targetSeq >= event.seq
        || !original || original.id !== record.messageId || original.role !== record.role || !Array.isArray(record.content)) {
        throw new Error('Восстановление сообщения в журнале повреждено.')
      }
      edits[record.targetSeq] = { ...record, eventSeq: event.seq, restored: true, turn: turns.get(record.targetSeq), text: textContent(record.content) }
      continue
    }
    if (event.type === 'user/message' && event.data.source?.kind === REMOVE_SOURCE) {
      let record
      try { record = JSON.parse(event.data.source.sections?.find(section => section.name === REMOVE_SECTION)?.text) }
      catch { throw new Error('Удаление сообщения в журнале повреждено.') }
      const original = eventMessage(events[record?.targetSeq])
      if (record?.version !== 1 || !Number.isSafeInteger(record.targetSeq) || record.targetSeq < 1
        || record.targetSeq >= event.seq || !original || original.id !== record.messageId || original.role !== record.role
        || !['delete', 'regenerate'].includes(record.reason)) throw new Error('Удаление сообщения в журнале повреждено.')
      edits[record.targetSeq] = { ...record, eventSeq: event.seq, turn: turns.get(record.targetSeq),
        ...(record.reason === 'delete' && record.role === 'assistant' ? { processRange: replyProcessRange(events, record.targetSeq) } : {}),
        deleted: true, text: '', content: [] }
      continue
    }
    if (event.type !== 'user/message' || event.data.source?.kind !== EDIT_SOURCE) continue
    const section = event.data.source.sections?.find(section => section.name === SECTION)
    let record
    try { record = JSON.parse(section?.text) } catch { throw new Error('Правка сообщения в журнале повреждена.') }
    const original = eventMessage(events[record?.targetSeq])
    if (record?.version !== 1 || !Number.isSafeInteger(record.targetSeq) || record.targetSeq >= event.seq
      || !original || original.id !== record.messageId || original.role !== record.role
      || edits[record.targetSeq]?.deleted
      || !['user', 'assistant'].includes(record.role) || !Array.isArray(record.content)
      || record.content.some(block => !block || ['reasoning', 'tool-call'].includes(block.type))
      || !textContent(record.content).trim()) throw new Error('Правка сообщения в журнале повреждена.')
    edits[record.targetSeq] = { ...record, eventSeq: event.seq, text: textContent(record.content) }
  }
  return edits
}

export function revisedMessage(event, edits) {
  const message = eventMessage(event)
  const edit = edits[event?.seq]
  if (edit?.deleted) return null
  if (edit?.restored && message) return { ...message, content: edit.content }
  return edit && message ? { ...message, content: editedContent(edit.content, edit.text) } : message
}

/** Replace the latest active version, or append an explicit correction after compaction. */
export function revisionSurface(session, target, edits) {
  const events = session.snapshotEvents()
  const previous = edits[target.event.seq]?.eventSeq
  const seq = session.surface.nodes.find(seq => seq === previous || seq === target.event.seq
    || target.greeting && eventMessage(events[seq])?.source?.kind === 'mayori-greeting'
      && eventMessage(events[seq]).id.startsWith(`${target.message.id}:swipe:`))
  return seq === undefined ? { surfaceOp: 'append' }
    : { surfaceOp: { op: 'replace', startSeq: seq, endSeq: seq }, sourceEventSeqs: [seq] }
}
