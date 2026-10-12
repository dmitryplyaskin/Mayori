import { call } from '../../../client/infrastructure/rpc.js'

export class PersonaService {
  getSnapshot() { throw new Error('PersonaService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('PersonaService.subscribe() is not implemented') }
  refresh() { throw new Error('PersonaService.refresh() is not implemented') }
  save() { throw new Error('PersonaService.save() is not implemented') }
  remove() { throw new Error('PersonaService.remove() is not implemented') }
  setDefault() { throw new Error('PersonaService.setDefault() is not implemented') }
}

export class RemotePersonaProvider extends PersonaService {
  // Unsaved UI drafts live with this reversible browser provider, never in model context.
  draft = null
  #snapshot = { status: 'loading', personas: [], defaultId: null, error: null }
  #listeners = new Set()
  #loading
  #revision = 0
  getSnapshot = () => this.#snapshot
  subscribe = listener => {
    this.#listeners.add(listener)
    this.#loading ??= this.refresh().catch(() => {})
    return () => { this.#listeners.delete(listener) }
  }
  #publish(value) {
    this.#snapshot = value
    for (const listener of this.#listeners) listener()
  }
  async refresh() {
    const revision = ++this.#revision
    try {
      const value = await call('persona-list', {})
      if (revision === this.#revision) this.#publish({ ...value, status: 'ready', error: null })
    } catch (error) {
      if (revision === this.#revision) this.#publish({ ...this.#snapshot, status: 'error', error: error.message })
      throw error
    }
  }
  async save(persona) { const result = await call('persona-save', persona); await this.refresh(); return result }
  async remove(id) { await call('persona-remove', { id }); await this.refresh() }
  async setDefault(id) { await call('persona-default', { id }); await this.refresh() }
}
