import { compilePresetNodes, MAX_PRESET_DEPTH, MAX_PRESET_NODES, movePresetNode, presetNodeEntries, presetNodes, PRESET_COMPILER_VERSION } from '../shared/tree.js'

export const blankPreset = () => ({ name: '', instructions: '' })
const blank = blankPreset

/** Presentation draft owned by the catalog provider, surviving panel unmounts. */
export class PresetEditor {
  #snapshot = { initialized: false, draft: blank(), saved: blank(), busy: false, error: '', notice: '', selectedNodeId: 'main-instructions', collapsed: [], preview: false, undo: null }
  #listeners = new Set()
  getSnapshot = () => this.#snapshot
  subscribe = listener => { this.#listeners.add(listener); return () => this.#listeners.delete(listener) }
  update(value) {
    this.#snapshot = { ...this.#snapshot, ...value }
    for (const listener of this.#listeners) listener()
  }
  initialize(catalog) {
    if (this.#snapshot.initialized || catalog.status !== 'ready') return
    this.choose(catalog.presets.find(preset => preset.id === catalog.defaultId) ?? catalog.presets[0] ?? blank())
  }
  choose(preset) {
    this.update({ initialized: true, draft: structuredClone(preset), saved: preset.id ? structuredClone(preset) : blank(), error: '', notice: '',
      selectedNodeId: presetNodes(preset)[0]?.id ?? null, collapsed: [], preview: false, undo: null })
  }
  change(key, value) { this.update({ draft: { ...this.#snapshot.draft, [key]: value }, notice: '', undo: null }) }
  accept(preset) { this.update({ draft: structuredClone(preset), saved: structuredClone(preset), undo: null }) }
  reset() {
    this.update({ draft: structuredClone(this.#snapshot.saved), selectedNodeId: presetNodes(this.#snapshot.saved)[0]?.id ?? null,
      collapsed: [], preview: false, undo: null, error: '', notice: '' })
  }
  selectNode(id) { this.update({ selectedNodeId: id, preview: false }) }
  toggleGroup(id) {
    const collapsed = new Set(this.#snapshot.collapsed)
    collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id)
    this.update({ collapsed: [...collapsed] })
  }
  #edit(operation, notice = '') {
    if (this.#snapshot.busy) return
    try {
      const nodes = structuredClone(presetNodes(this.#snapshot.draft))
      const result = operation(nodes) ?? nodes
      const entries = presetNodeEntries(result)
      if (entries.length > MAX_PRESET_NODES) throw new TypeError(`В пресете может быть не больше ${MAX_PRESET_NODES} блоков и групп.`)
      if (entries.some(entry => entry.ancestors.length >= MAX_PRESET_DEPTH)) throw new TypeError(`Используйте не больше ${MAX_PRESET_DEPTH} уровней вложенности.`)
      this.update({ draft: { ...this.#snapshot.draft, nodes: result, instructions: compilePresetNodes(result), compilerVersion: PRESET_COMPILER_VERSION }, error: '', notice })
      return true
    } catch (error) { this.update({ error: error.message }); return false }
  }
  changeNode(id, key, value) {
    if (this.#snapshot.busy || !['title', 'text', 'enabled'].includes(key)) return
    this.#edit(nodes => {
      const node = presetNodeEntries(nodes).find(entry => entry.node.id === id)?.node
      if (!node || (key === 'text' && node.kind !== 'block')) return
      node[key] = value
    })
    // Later text edits invalidate a whole-tree undo instead of losing new text.
    this.update({ undo: null })
  }
  addNode(kind) {
    if (!['block', 'group'].includes(kind)) return
    const id = crypto.randomUUID()
    const previous = { draft: structuredClone(this.#snapshot.draft), selectedNodeId: this.#snapshot.selectedNodeId }
    const selection = presetNodeEntries(presetNodes(this.#snapshot.draft)).find(entry => entry.node.id === this.#snapshot.selectedNodeId)
    if (this.#edit(nodes => {
      const entry = presetNodeEntries(nodes).find(entry => entry.node.id === this.#snapshot.selectedNodeId)
      const destination = entry?.node.kind === 'group' ? entry.node.children : entry?.siblings ?? nodes
      destination.push({ id, kind, title: kind === 'group' ? 'Новая группа' : 'Новый блок', enabled: true,
        ...(kind === 'group' ? { children: [] } : { text: '' }) })
    })) this.update({ selectedNodeId: id, preview: false, undo: previous,
      collapsed: this.#snapshot.collapsed.filter(id => id !== selection?.node.id) })
  }
  removeNode(id) {
    const previous = { draft: structuredClone(this.#snapshot.draft), selectedNodeId: this.#snapshot.selectedNodeId }
    if (this.#edit(nodes => {
      const entry = presetNodeEntries(nodes).find(entry => entry.node.id === id)
      if (entry) entry.siblings.splice(entry.siblings.indexOf(entry.node), 1)
    }, 'Элемент удалён. Можно отменить действие.')) {
      const entries = presetNodeEntries(presetNodes(this.#snapshot.draft))
      this.update({ undo: previous, selectedNodeId: entries.some(entry => entry.node.id === this.#snapshot.selectedNodeId) ? this.#snapshot.selectedNodeId : entries[0]?.node.id ?? null })
    }
  }
  duplicateNode(id) {
    const previous = { draft: structuredClone(this.#snapshot.draft), selectedNodeId: this.#snapshot.selectedNodeId }
    let copyId
    if (this.#edit(nodes => {
      const entry = presetNodeEntries(nodes).find(entry => entry.node.id === id)
      if (!entry) return
      const copy = structuredClone(entry.node)
      for (const { node } of presetNodeEntries([copy])) node.id = crypto.randomUUID()
      copy.title = `${copy.title} — копия`.slice(0, 120)
      copyId = copy.id
      entry.siblings.splice(entry.siblings.indexOf(entry.node) + 1, 0, copy)
    })) this.update({ undo: previous, selectedNodeId: copyId ?? id })
  }
  moveNode(sourceId, targetId, position) {
    const previous = { draft: structuredClone(this.#snapshot.draft), selectedNodeId: this.#snapshot.selectedNodeId }
    const nodes = presetNodes(this.#snapshot.draft)
    const title = presetNodeEntries(nodes).find(entry => entry.node.id === sourceId)?.node.title
    if (!this.#edit(() => movePresetNode(nodes, sourceId, targetId, position), `«${title}» перемещён. Можно отменить действие.`)) return false
    this.update({ undo: previous, selectedNodeId: sourceId,
      collapsed: position === 'inside' ? this.#snapshot.collapsed.filter(id => id !== targetId) : this.#snapshot.collapsed })
    return true
  }
  undo() {
    if (this.#snapshot.busy || !this.#snapshot.undo) return
    this.update({ ...this.#snapshot.undo, undo: null, error: '', notice: 'Действие отменено.' })
  }
}
