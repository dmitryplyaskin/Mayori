import { editedContent, textContent } from './revisions.js'

export const EDIT_SOURCE = 'mayori-message-edit'
const SECTION = 'mayori:message-edit'

const eventMessage = event => event?.type === 'assistant/message' ? event.data.message
  : event?.type === 'user/message' ? event.data : null

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

/** Replay revisions from the log; no separate mutable text store. */
export function readMessageEdits(events) {
  const edits = {}
  for (const event of events) {
    if (event.type !== 'user/message' || event.data.source?.kind !== EDIT_SOURCE) continue
    const section = event.data.source.sections?.find(section => section.name === SECTION)
    let record
    try { record = JSON.parse(section?.text) } catch { throw new Error('Правка сообщения в журнале повреждена.') }
    const original = eventMessage(events[record?.targetSeq])
    if (record?.version !== 1 || !Number.isSafeInteger(record.targetSeq) || record.targetSeq >= event.seq
      || !original || original.id !== record.messageId || original.role !== record.role
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
