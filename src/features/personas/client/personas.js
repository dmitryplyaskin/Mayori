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
  #snapshot = { status: 'loading', personas: [], defaultId: null, error: null }
  #listeners = new Set()
  #loading
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
    try { this.#publish({ ...await call('persona-list', {}), status: 'ready', error: null }) }
    catch (error) { this.#publish({ ...this.#snapshot, status: 'error', error: error.message }); throw error }
  }
  async save(persona) { const result = await call('persona-save', persona); await this.refresh(); return result }
  async remove(id) { await call('persona-remove', { id }); await this.refresh() }
  async setDefault(id) { await call('persona-default', { id }); await this.refresh() }
}
