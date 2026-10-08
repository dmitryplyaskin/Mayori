import { call } from '../../../client/infrastructure/rpc.js'
import { PresetEditor } from './editor.js'

export class RoleplayPresetService {
  getSnapshot() { throw new Error('RoleplayPresetService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('RoleplayPresetService.subscribe() is not implemented') }
  refresh() { throw new Error('RoleplayPresetService.refresh() is not implemented') }
  save() { throw new Error('RoleplayPresetService.save() is not implemented') }
  remove() { throw new Error('RoleplayPresetService.remove() is not implemented') }
  setDefault() { throw new Error('RoleplayPresetService.setDefault() is not implemented') }
}

export class RemoteRoleplayPresetProvider extends RoleplayPresetService {
  editor = new PresetEditor()
  #snapshot = { status: 'loading', presets: [], defaultId: null, error: null }
  #listeners = new Set()
  #loading
  #revision = 0
  getSnapshot = () => this.#snapshot
  subscribe = listener => {
    this.#listeners.add(listener)
    this.#loading ??= this.refresh().catch(() => {})
    return () => { this.#listeners.delete(listener) }
  }
  #publish(value) { this.#snapshot = value; for (const listener of this.#listeners) listener() }
  async refresh() {
    const revision = ++this.#revision
    try {
      const value = await call('preset-list', {})
      if (revision === this.#revision) this.#publish({ ...value, status: 'ready', error: null })
    } catch (error) {
      if (revision === this.#revision) this.#publish({ ...this.#snapshot, status: 'error', error: error.message })
      throw error
    }
  }
  async save(preset) { const value = await call('preset-save', preset); await this.refresh(); return value }
  async remove(id) { await call('preset-remove', { id }); await this.refresh() }
  async setDefault(id) { await call('preset-default', { id }); await this.refresh() }
}

export class SessionPresetService {
  getSnapshot() { throw new Error('SessionPresetService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('SessionPresetService.subscribe() is not implemented') }
  refresh() { throw new Error('SessionPresetService.refresh() is not implemented') }
  select() { throw new Error('SessionPresetService.select() is not implemented') }
}

export class RemoteSessionPresetProvider extends SessionPresetService {
  #snapshot = { status: 'loading', preset: null, error: null }
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
      const value = await call('session-preset-state', { sessionId: this.sessionId })
      if (revision === this.#revision) this.#publish({ ...value, status: 'ready', error: null })
    } catch (error) {
      if (revision === this.#revision) this.#publish({ ...this.#snapshot, status: 'error', error: error.message })
    }
  }
  async select(presetId) {
    if (this.#changing) throw new Error('Дождитесь сохранения текущего пресета.')
    this.#changing = true
    ++this.#revision
    this.#publish({ ...this.#snapshot, status: 'saving', error: null })
    try {
      const value = await call('session-preset', { sessionId: this.sessionId, presetId })
      ++this.#revision
      this.#publish({ ...value, status: 'ready', error: null })
      return value
    } catch (error) {
      this.#changing = false
      await this.refresh()
      this.#publish({ ...this.#snapshot, error: error.message })
      throw error
    } finally { this.#changing = false }
  }
}
