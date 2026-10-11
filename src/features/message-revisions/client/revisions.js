import { call } from '../../../client/infrastructure/rpc.js'

/** A refreshed browser must never send a save to the older generating edit API. */
export function assertSafeEdit(value) {
  if (value?.editRunsModel !== false || !Array.isArray(value.editModes)
    || !['current', 'branch'].every(mode => value.editModes.includes(mode))) {
    throw new Error('Редактор обновлён, но Host использует старую версию. Перезапустите Mayori и обновите страницу перед редактированием.')
  }
}

export class MessageRevisionClient {
  getSnapshot() { throw new Error('MessageRevisionClient.getSnapshot() is not implemented') }
  subscribe() { throw new Error('MessageRevisionClient.subscribe() is not implemented') }
  inspect() { throw new Error('MessageRevisionClient.inspect() is not implemented') }
  edit() { throw new Error('MessageRevisionClient.edit() is not implemented') }
  regenerate() { throw new Error('MessageRevisionClient.regenerate() is not implemented') }
}

export class RemoteMessageRevisionProvider extends MessageRevisionClient {
  #snapshot = { busy: false, edits: {} }
  #listeners = new Set()
  #loading
  #revision = 0
  #editReady = false
  constructor(sessionId, open) { super(); this.sessionId = sessionId; this.open = open }
  getSnapshot = () => this.#snapshot
  subscribe = listener => { this.#listeners.add(listener); return () => { this.#listeners.delete(listener) } }
  #publish(update) { this.#snapshot = { ...this.#snapshot, ...update }; for (const listener of this.#listeners) listener() }
  refresh() {
    if (this.#loading) return this.#loading
    const revision = this.#revision
    this.#loading = call('message-revisions', { sessionId: this.sessionId }).then(edits => {
      if (revision === this.#revision) this.#publish({ edits, error: null })
      return edits
    }).catch(error => {
      if (revision === this.#revision) this.#publish({ error: error.message })
      return null
    }).finally(() => { this.#loading = undefined })
    return this.#loading
  }
  async inspect(seq) {
    const value = await call('message-inspect', { sessionId: this.sessionId, seq })
    try { assertSafeEdit(value); this.#editReady = true } catch { this.#editReady = false }
    return value
  }
  async #change(endpoint, input) {
    if (this.#snapshot.busy) throw new Error('Дождитесь сохранения текущей реплики.')
    this.#publish({ busy: true, error: null })
    let submitted = false
    try {
      if (endpoint === 'message-edit' && !this.#editReady) assertSafeEdit(await this.inspect(input.seq))
      submitted = true
      const value = await call(endpoint, { sessionId: this.sessionId, ...input })
      if (value.changed && value.sessionId !== this.sessionId) await this.open(value.sessionId)
      if (value.changed && value.sessionId === this.sessionId) {
        ++this.#revision
        if (value.edits) this.#publish({ edits: value.edits })
        else { await this.#loading; await this.refresh() }
      }
      return value
    } catch (error) {
      if (submitted && endpoint === 'message-edit' && input.mode === 'current') {
        ++this.#revision
        await this.#loading
        await this.refresh()
      }
      throw error
    } finally { this.#publish({ busy: false }) }
  }
  edit(seq, text, mode = 'current') { return this.#change('message-edit', { seq, text, mode }) }
  regenerate(seq) { return this.#change('message-regenerate', { seq }) }
  dispose() { ++this.#revision; this.#listeners.clear() }
}
