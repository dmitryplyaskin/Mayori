import { tr } from '../../localization/client/service.js'
import { call } from '../../../client/infrastructure/rpc.js'

/** A refreshed browser must never send a save to the older generating edit API. */
export function assertSafeEdit(value) {
  if (value?.editRunsModel !== false || !Array.isArray(value.editModes)
    || !['current', 'branch'].every(mode => value.editModes.includes(mode))) {
    throw new Error(tr("Редактор обновлён, но Host использует старую версию. Перезапустите Mayori и обновите страницу перед редактированием."))
  }
}

export function assertCurrentRegeneration(value) {
  if (value?.regenerateMode !== 'current') throw new Error(tr("Host использует старый повтор с созданием ветки. Перезапустите Mayori и обновите страницу."))
  if (value.regenerateKeepsVariants !== true) throw new Error(tr("Для сохранения вариантов перезапустите Mayori и обновите страницу."))
}

export class MessageRevisionClient {
  getSnapshot() { throw new Error('MessageRevisionClient.getSnapshot() is not implemented') }
  subscribe() { throw new Error('MessageRevisionClient.subscribe() is not implemented') }
  inspect() { throw new Error('MessageRevisionClient.inspect() is not implemented') }
  edit() { throw new Error('MessageRevisionClient.edit() is not implemented') }
  remove() { throw new Error('MessageRevisionClient.remove() is not implemented') }
  regenerate() { throw new Error('MessageRevisionClient.regenerate() is not implemented') }
  selectVariant() { throw new Error('MessageRevisionClient.selectVariant() is not implemented') }
}

export class RemoteMessageRevisionProvider extends MessageRevisionClient {
  #snapshot = { busy: false, edits: {}, variants: [] }
  #listeners = new Set()
  #loading
  #revision = 0
  #editReady = false
  #currentReady = false
  constructor(sessionId, open, loadThrough = async () => {}) {
    super(); this.sessionId = sessionId; this.open = open; this.loadThrough = loadThrough
  }
  async #loadVariants(variants) {
    const selected = variants.filter(group => group.replySeq !== null).map(group => group.startSeq).filter(Number.isSafeInteger)
    if (selected.length) await this.loadThrough(Math.min(...selected))
  }
  getSnapshot = () => this.#snapshot
  subscribe = listener => { this.#listeners.add(listener); return () => { this.#listeners.delete(listener) } }
  #publish(update) { this.#snapshot = { ...this.#snapshot, ...update }; for (const listener of this.#listeners) listener() }
  refresh() {
    if (this.#loading) return this.#loading
    const revision = this.#revision
    this.#loading = Promise.all([call('message-revisions', { sessionId: this.sessionId }),
      call('message-variants', { sessionId: this.sessionId })]).then(async ([edits, variants]) => {
      if (revision === this.#revision) {
        this.#publish({ edits, variants, error: null })
        await this.#loadVariants(variants)
      }
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
    this.#currentReady = value?.regenerateMode === 'current' && value.regenerateKeepsVariants === true
    return value
  }
  async #change(endpoint, input) {
    if (this.#snapshot.busy) throw new Error(tr("Дождитесь сохранения текущей реплики."))
    this.#publish({ busy: true, error: null })
    let submitted = false
    try {
      if (endpoint === 'message-edit' && !this.#editReady) assertSafeEdit(await this.inspect(input.seq))
      if (endpoint === 'message-regenerate' && !this.#currentReady) assertCurrentRegeneration(await this.inspect(input.seq))
      submitted = true
      const value = await call(endpoint, { sessionId: this.sessionId, ...input })
      if (value.changed && value.sessionId !== this.sessionId) await this.open(value.sessionId)
      if (value.changed && value.sessionId === this.sessionId) {
        ++this.#revision
        if (value.edits) this.#publish({ edits: value.edits, ...(value.variants ? { variants: value.variants } : {}) })
        else { await this.#loading; await this.refresh() }
        if (value.variants) await this.#loadVariants(value.variants)
      }
      return value
    } catch (error) {
      if (submitted && !(endpoint === 'message-edit' && input.mode === 'branch')) {
        ++this.#revision
        await this.#loading
        await this.refresh()
      }
      throw error
    } finally { this.#publish({ busy: false }) }
  }
  edit(seq, text, mode = 'current') { return this.#change('message-edit', { seq, text, mode }) }
  remove(seq) { return this.#change('message-remove', { seq }) }
  regenerate(seq) { return this.#change('message-regenerate', { seq }) }
  selectVariant(seq, index) { return this.#change('message-variant', { seq, index }) }
  dispose() { ++this.#revision; this.#listeners.clear() }
}
