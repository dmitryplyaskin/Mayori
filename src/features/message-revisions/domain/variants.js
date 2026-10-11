import { humanMessage, textContent } from './revisions.js'
import { revisedMessage } from './edits.js'

export const VARIANT_SOURCE = 'mayori-answer-variants'
const SECTION = 'mayori:answer-variants'
const dialogue = event => humanMessage(event) || ['assistant/message', 'tool/result'].includes(event.type)

export function variantMessage(decision, id) {
  return { id, role: 'user', source: { kind: VARIANT_SOURCE,
    sections: [{ name: SECTION, text: JSON.stringify({ version: 1, ...decision }) }] }, content: [] }
}

/** One saved continuation owns its real messages, attachments and recorded tool results. */
export function variantSnapshot(id, replySeq, events, edits, derive = event => revisedMessage(event, edits)) {
  return { id, replySeq, entries: events.filter(event => dialogue(event) && !edits[event.seq]?.deleted)
    .map(event => ({ seq: event.seq, message: derive(event) })) }
}

function validSnapshot(snapshot, events, boundary) {
  return typeof snapshot?.id === 'string' && snapshot.id.length > 0 && Array.isArray(snapshot.entries)
    && (snapshot.replySeq === null || snapshot.entries.some(entry => entry.seq === snapshot.replySeq && entry.message?.role === 'assistant'))
    && snapshot.entries.every((entry, index) => Number.isSafeInteger(entry.seq) && entry.seq >= 1 && entry.seq < boundary
      && (index === 0 || entry.seq > snapshot.entries[index - 1].seq)
      && dialogue(events[entry.seq] ?? {}) && entry.message?.id === revisedMessage(events[entry.seq], {})?.id
      && entry.message.role === revisedMessage(events[entry.seq], {})?.role && Array.isArray(entry.message.content))
}

/** Checkpoints and the matching regenerated input reconstruct variants without a side store. */
export function readAnswerVariants(events, edits = {}) {
  const groups = new Map()
  for (const event of events) {
    if (event.type !== 'user/message' || event.data.source?.kind !== VARIANT_SOURCE) continue
    let record
    try { record = JSON.parse(event.data.source.sections?.find(section => section.name === SECTION)?.text) } catch {}
    if (record?.version !== 1 || !Number.isSafeInteger(record.groupId) || record.groupId < 1
      || record.groupId >= event.seq || events[record.groupId]?.type !== 'assistant/message'
      || !['regenerate', 'select'].includes(record.action) || !validSnapshot(record.previous, events, event.seq)) {
      throw new Error('Варианты ответа в журнале повреждены.')
    }
    const group = groups.get(record.groupId) ?? { groupId: record.groupId, variants: [] }
    const index = group.variants.findIndex(variant => variant.id === record.previous.id)
    if (index < 0) group.variants.push(record.previous)
    else group.variants[index] = record.previous
    if (record.action === 'regenerate') {
      if (typeof record.nextId !== 'string' || !record.nextId || group.variants.some(variant => variant.id === record.nextId)) {
        throw new Error('Варианты ответа в журнале повреждены.')
      }
      group.variants.push({ id: record.nextId, replySeq: null, entries: [] })
      group.selectedId = record.nextId
    } else {
      if (!group.variants.some(variant => variant.id === record.selectedId && variant.replySeq !== null)) {
        throw new Error('Вариант ответа не найден в журнале.')
      }
      group.selectedId = record.selectedId
    }
    group.checkpointSeq = event.seq
    groups.set(group.groupId, group)
  }
  const result = []
  for (const group of groups.values()) {
    let selected = group.variants.find(variant => variant.id === group.selectedId)
    const additions = events.slice(group.checkpointSeq + 1).filter(dialogue)
    if (selected.replySeq === null) {
      const inputIndex = events.findIndex(event => humanMessage(event) && event.data.id === selected.id)
      if (inputIndex >= 0 && edits[events[inputIndex].seq]?.deleted) continue
      const end = inputIndex < 0 ? -1 : events.findIndex((event, index) => index > inputIndex && event.type === 'turn/end')
      const reply = end < 0 ? null : events.slice(inputIndex, end).findLast(event => event.type === 'assistant/message'
        && !event.data.message.content.some(block => block.type === 'tool-call') && textContent(event.data.message.content).trim())
      // An explicit fork can cut off this settlement and replace it with authored text.
      if (!reply && events.some(event => event.type === 'session/end-seed' && event.seq > group.checkpointSeq)) continue
      selected = { ...selected, replySeq: reply?.seq ?? null }
    }
    const seqs = new Set([...selected.entries.map(entry => entry.seq), ...additions.map(event => event.seq)])
    const current = variantSnapshot(selected.id, selected.replySeq, events.filter(event => seqs.has(event.seq)), edits)
    // A selected continuation may include a nested reply whose variant was changed later.
    const active = group.variants.find(variant => variant.replySeq !== null && !edits[variant.replySeq]?.deleted)
    if (current.replySeq !== null && edits[current.replySeq]?.deleted) {
      if (!active) continue
      group.selectedId = active.id
      selected = active
    } else {
      group.variants[group.variants.findIndex(variant => variant.id === current.id)] = current
      selected = current
    }
    result.push({ ...group, selectedId: selected.id,
      selectedIndex: group.variants.filter(variant => variant.replySeq !== null).findIndex(variant => variant.id === selected.id),
      replySeq: selected.replySeq, variants: group.variants })
  }
  return result
}
