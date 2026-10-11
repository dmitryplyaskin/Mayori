import { createElement, useEffect, useSyncExternalStore } from 'react'
import { remapChildProps } from '../../../client/infrastructure/slot-mirror.js'
import { EDIT_SOURCE, REMOVE_SOURCE, RESTORE_SOURCE } from '../domain/edits.js'
import { VARIANT_SOURCE } from '../domain/variants.js'
import { AnswerVariantNavigation } from './variants.js'

/** Logged author corrections update their original rows, not a second context bubble. */
export function RevisionContextMessage({ stock, stockChildren, childPrefix, ...props }) {
  if ([EDIT_SOURCE, REMOVE_SOURCE, RESTORE_SOURCE, VARIANT_SOURCE].includes(props.node.data.source?.kind)) return null
  return createElement(stock, remapChildProps(props, stockChildren, childPrefix))
}

const PROCESS_KINDS = new Set(['assistant-step', 'tool-call', 'turn-process', 'turn-tail', 'turn-trigger', 'model-retry', 'turn-error', 'turn-max-tokens'])

/** Deleted replies retire their process; regeneration retires the whole old turn. */
export function removedNode(node, edits = {}) {
  const data = node.data
  const seq = node.kind === 'turn-tail' ? data.closing?.finalNode?.seq
    : node.kind === 'assistant-step' ? data.finalNode?.seq : data.seq
  if (edits[seq]?.deleted) return true
  const turn = node.location?.turn?.turn ?? data.turn
  return Object.values(edits).some(edit => {
    if (!edit.deleted) return false
    if (turn !== undefined && edit.reason === 'regenerate' && edit.turn === turn) return true
    if (!edit.processRange || !PROCESS_KINDS.has(node.kind)) return false
    if (node.kind === 'turn-process' && edit.turn === turn) return true
    const anchor = seq ?? node.anchorSeq ?? data.root?.seq
    return anchor >= edit.processRange.startSeq && anchor <= edit.processRange.endSeq
  })
}

/** Filter native flow entries so retired turns do not leave empty process group headers. */
export function visibleRevisionEntries(entries, nodes, groups, edits) {
  return entries.filter(entry => {
    if (entry.kind === 'node') {
      const node = nodes.get(entry.key)
      return !node || !removedNode(node, edits)
    }
    const group = groups?.groupSource(entry.key).getSnapshot()
    if (group?.data?.turn !== undefined && Object.values(edits ?? {}).some(edit => edit.deleted
      && edit.reason === 'regenerate' && edit.turn === group.data.turn)) return false
    if (group?.data?.turn !== undefined && Object.values(edits ?? {}).some(edit => edit.deleted
      && edit.processRange && edit.turn === group.data.turn)) {
      const process = group.members.map(member => nodes.get(member.key)).filter(node => node && PROCESS_KINDS.has(node.kind))
      if (process.length && process.every(node => removedNode(node, edits))) return false
    }
    return !group || !group.members.length || group.members.some(member => {
      const node = nodes.get(member.key)
      return !node || !removedNode(node, edits)
    })
  })
}

export function RevisionChatFlow({ stock, stockChildren, childPrefix, revisionFor, IconButton, ...props }) {
  const revisions = revisionFor(props.sessionId)
  const snapshot = useSyncExternalStore(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot)
  const nodes = props.useChat(state => state.nodes)
  const groups = props.useConversation(state => state.views.grouped('chat'))
  const activity = props.useSession?.(state => state.running || (state.pendingSubmissions?.length ?? 0) > 0)
  useEffect(() => { void revisions.refresh() }, [revisions, activity])
  return [createElement(stock, { ...remapChildProps(props, stockChildren, childPrefix), key: 'flow',
    entries: visibleRevisionEntries(props.entries, nodes, groups, snapshot.edits) }),
  ...(!activity ? snapshot.variants.filter(group => group.replySeq === null
    || !nodes.values().some(node => node.kind === 'assistant-step' && node.data.finalNode?.seq === group.replySeq))
    .map(group => createElement(AnswerVariantNavigation,
    { key: group.groupId, group, revisions, useSession: props.useSession, IconButton })) : [])]
}

/** Apply a logged text edit to the native display/copy node without inventing model output. */
export function editedNode(node, edits) {
  const data = node.data
  const seq = node.kind === 'turn-tail' ? data.closing?.finalNode?.seq
    : node.kind === 'assistant-step' ? data.finalNode?.seq : data.seq
  const edit = edits?.[seq]
  if (!edit) return node
  const blocks = original => [{ kind: 'text', text: edit.text },
    ...(original ?? []).filter(block => block.kind !== 'text')]
  if (node.kind === 'turn-tail') return { ...node, data: { ...data, mayoriEdited: true,
    closing: { ...data.closing, blocks: blocks(data.closing.blocks),
      finalNode: { ...data.closing.finalNode, blocks: blocks(data.closing.finalNode.blocks) } } } }
  if (node.kind === 'assistant-step') return { ...node, data: { ...data, mayoriEdited: true, blocks: blocks(data.blocks) } }
  return { ...node, data: { ...data, content: edit.content } }
}
