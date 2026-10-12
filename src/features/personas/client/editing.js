import { DEFAULT_PROMPT } from '../shared/persona.js'

export const emptyPersona = () => ({ name: '', title: '', description: '', avatar: '', blocks: [],
  prompt: { ...DEFAULT_PROMPT }, characterIds: [], descriptionOverride: null })
export const personaDraft = persona => ({ ...emptyPersona(), ...structuredClone(persona ?? {}) })
export const personaChanged = (draft, saved) => JSON.stringify(personaDraft(draft)) !== JSON.stringify(personaDraft(saved))

/** Updates preserve prompt order and the single group level. */
export function updatePersonaNode(blocks, id, patch) {
  return blocks.map(node => node.id === id ? { ...node, ...patch }
    : node.type === 'group' ? { ...node, items: updatePersonaNode(node.items, id, patch) } : node)
}
export function removePersonaNode(blocks, id) {
  return blocks.filter(node => node.id !== id).map(node => node.type === 'group'
    ? { ...node, items: removePersonaNode(node.items, id) } : node)
}
export function movePersonaNode(blocks, id, offset) {
  const index = blocks.findIndex(node => node.id === id)
  if (index < 0) return blocks.map(node => node.type === 'group'
    ? { ...node, items: movePersonaNode(node.items, id, offset) } : node)
  const target = index + offset
  if (target < 0 || target >= blocks.length) return blocks
  const next = [...blocks]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

/** Browser-only drafts survive library switches and panel unmounts. */
export class PersonaDrafts {
  #values = new Map()
  remember(draft) { this.#values.set(draft.id ?? ':new', structuredClone(draft)) }
  open(saved) { return personaDraft(this.#values.get(saved?.id ?? ':new') ?? saved) }
  forget(id) { this.#values.delete(id ?? ':new') }
  changed(saved) { const draft = this.#values.get(saved?.id ?? ':new'); return !!draft && personaChanged(draft, saved) }
}
