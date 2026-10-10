import { createElement } from 'react'
import { remapChildProps } from '../../../client/infrastructure/slot-mirror.js'
import { EDIT_SOURCE } from '../domain/edits.js'

/** Logged author corrections update their original rows, not a second context bubble. */
export function RevisionContextMessage({ stock, stockChildren, childPrefix, ...props }) {
  if (props.node.data.source?.kind === EDIT_SOURCE) return null
  return createElement(stock, remapChildProps(props, stockChildren, childPrefix))
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
