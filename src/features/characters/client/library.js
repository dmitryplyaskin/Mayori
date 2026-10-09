import { call } from '../../../client/infrastructure/rpc.js'

/** Browser proxy for the Host-owned Character Library Service. */

const EMPTY_SNAPSHOT = Object.freeze({ status: 'loading', cards: Object.freeze([]), total: 0, filteredTotal: 0, page: 1, pageSize: 5, facets: { creators: [], tags: [] }, error: null, revision: 0 })

/** Service Definition consumed by gallery UI. */
export class CharacterLibraryService {
  getSnapshot() { throw new Error('CharacterLibraryService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('CharacterLibraryService.subscribe() is not implemented') }
  refresh() { throw new Error('CharacterLibraryService.refresh() is not implemented') }
  importFiles() { throw new Error('CharacterLibraryService.importFiles() is not implemented') }
  remove() { throw new Error('CharacterLibraryService.remove() is not implemented') }
  prepareCampaign() { throw new Error('CharacterLibraryService.prepareCampaign() is not implemented') }
  play() { throw new Error('CharacterLibraryService.play() is not implemented') }
  start() { throw new Error('CharacterLibraryService.start() is not implemented') }
  get() { throw new Error('CharacterLibraryService.get() is not implemented') }
}

function toBase64(bytes) {
  const chunkSize = 0x8000
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

/** Client Provider that keeps only an observable snapshot; Host owns persistence. */
export class RemoteCharacterLibraryProvider extends CharacterLibraryService {
  #snapshot = EMPTY_SNAPSHOT
  #listeners = new Set()
  #loading
  #revision = 0
  #controller
  #poll
  #gallery
  constructor(options = {}, owner) { super(); this.options = { page: 1, pageSize: 5, ...options }; this.owner = owner ?? this }
  gallery() { return this.#gallery ??= new RemoteCharacterLibraryProvider({ pageSize: 20 }, this) }
  get(id) { return call('get', { id }) }
  setQuery(options) {
    const next = { ...this.options, ...options }
    if (JSON.stringify(next) === JSON.stringify(this.options)) return
    this.options = next
    void this.refresh().catch(() => {})
  }

  getSnapshot = () => this.#snapshot

  subscribe = (listener) => {
    this.#listeners.add(listener)
    void this.#ensureLoaded()
    if (this.#snapshot.indexing && !this.#poll) this.#poll = setTimeout(() => { void this.refresh().catch(() => {}) }, 400)
    return () => {
      this.#listeners.delete(listener)
      if (!this.#listeners.size) { clearTimeout(this.#poll); this.#poll = undefined }
    }
  }

  async importFiles(files) {
    await this.#ensureLoaded()
    const result = { imported: 0, rejected: [] }
    const inputs = [...files]
    for (let offset = 0; offset < inputs.length; offset += 2) {
      const prepared = []
      for (const file of inputs.slice(offset, offset + 2)) {
        if (file.size > 16 * 1024 * 1024) { result.rejected.push({ name: file.name, error: 'Файл превышает 16 МБ.' }); continue }
        prepared.push({ name: file.name || 'character-card', type: file.type || '', base64: toBase64(new Uint8Array(await file.arrayBuffer())) })
      }
      if (!prepared.length) continue
      const partial = await call('import', { files: prepared })
      result.imported += partial.imported
      result.rejected.push(...partial.rejected)
    }
    await this.owner.refreshAll()
    return result
  }

  async remove(id) {
    await call('remove', { id })
    await this.owner.refreshAll()
  }
  async refreshAll() { await Promise.all([this.refresh(), this.#gallery?.refresh()]) }

  async start(characterId, workspaceId, greetingIndex = 0) {
    return call('start', { characterId, workspaceId, greetingIndex })
  }

  async play(characterId, sessionId) {
    return call('play', { characterId, sessionId })
  }

  async prepareCampaign() {
    return call('prepare-campaign', {})
  }

  async #ensureLoaded() {
    this.#loading ??= this.refresh().catch(() => {})
    return this.#loading
  }

  async refresh() {
    const revision = ++this.#revision
    this.#controller?.abort()
    const controller = this.#controller = new AbortController()
    this.#publish('loading', this.#snapshot.cards, null)
    try {
      const result = await call('list', this.options, { signal: controller.signal })
      if (revision === this.#revision) {
        this.#publish('ready', Array.isArray(result.cards) ? result.cards : [], null, result)
        clearTimeout(this.#poll)
        if (result.indexing && this.#listeners.size) this.#poll = setTimeout(() => { void this.refresh().catch(() => {}) }, 400)
      }
    } catch (error) {
      if (revision === this.#revision && !controller.signal.aborted) {
        this.#loading = undefined
        this.#publish('error', this.#snapshot.cards, error instanceof Error ? error.message : String(error))
      }
      throw error
    }
  }

  dispose() { ++this.#revision; this.#controller?.abort(); clearTimeout(this.#poll); this.#listeners.clear(); this.#gallery?.dispose(); this.#snapshot = EMPTY_SNAPSHOT }

  #publish(status, cards, error, result = {}) {
    this.#snapshot = Object.freeze({
      ...this.#snapshot, ...result, status,
      cards: Object.freeze(cards),
      error,
      revision: this.#snapshot.revision + 1,
    })
    for (const listener of [...this.#listeners]) listener()
  }
}
