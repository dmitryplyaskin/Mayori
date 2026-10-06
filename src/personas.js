import { call } from './character-library.js'

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

/** Observable per-chat consumer of the Host Character Session capability. */
export class CharacterChatService {
  getSnapshot() { throw new Error('CharacterChatService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('CharacterChatService.subscribe() is not implemented') }
  refresh() { throw new Error('CharacterChatService.refresh() is not implemented') }
  swipe() { throw new Error('CharacterChatService.swipe() is not implemented') }
  setPersona() { throw new Error('CharacterChatService.setPersona() is not implemented') }
}

export class RemoteCharacterChatProvider extends CharacterChatService {
  #snapshot = { status: 'loading', value: null, error: null }
  #listeners = new Set()
  #loading
  #revision = 0
  #changing = false
  constructor(sessionId) { super(); this.sessionId = sessionId }
  getSnapshot = () => this.#snapshot
  subscribe = listener => {
    this.#listeners.add(listener)
    this.#loading ??= this.refresh()
    return () => { this.#listeners.delete(listener) }
  }
  #publish(value) { this.#snapshot = value; for (const listener of this.#listeners) listener() }
  async refresh() {
    if (this.#changing) return
    const revision = ++this.#revision
    try {
      const value = await call('session-state', { sessionId: this.sessionId })
      if (revision === this.#revision) this.#publish({ status: 'ready', value, error: null })
    } catch (error) {
      if (revision === this.#revision) this.#publish({ ...this.#snapshot, status: 'error', error: error.message })
    }
  }
  async #change(endpoint, input) {
    if (this.#changing) throw new Error('Дождитесь сохранения текущего выбора.')
    this.#changing = true
    ++this.#revision
    this.#publish({ ...this.#snapshot, status: 'saving', error: null })
    try {
      const value = await call(endpoint, { sessionId: this.sessionId, ...input })
      ++this.#revision
      this.#publish({ status: 'ready', value, error: null })
      return value
    } catch (error) {
      this.#changing = false
      await this.refresh()
      this.#publish({ ...this.#snapshot, error: error.message })
      throw error
    } finally { this.#changing = false }
  }
  swipe(index) { return this.#change('swipe', { index }) }
  setPersona(personaId) { return this.#change('session-persona', { personaId }) }
}
