const blank = () => ({ name: '', instructions: '' })

/** Presentation draft owned by the catalog provider, surviving panel unmounts. */
export class PresetEditor {
  #snapshot = { initialized: false, draft: blank(), saved: blank(), busy: false, error: '', notice: '' }
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
    this.update({ initialized: true, draft: { ...preset }, saved: preset.id ? { ...preset } : blank(), error: '', notice: '' })
  }
  change(key, value) { this.update({ draft: { ...this.#snapshot.draft, [key]: value }, notice: '' }) }
  accept(preset) { this.update({ draft: { ...preset }, saved: { ...preset } }) }
  reset() { this.update({ draft: { ...this.#snapshot.saved }, error: '', notice: '' }) }
}
