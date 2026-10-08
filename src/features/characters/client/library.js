import { call } from '../../../client/infrastructure/rpc.js'

/** Browser proxy for the Host-owned Character Library Service. */

const EMPTY_SNAPSHOT = Object.freeze({ status: 'loading', cards: Object.freeze([]), error: null, revision: 0 })

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

  getSnapshot = () => this.#snapshot

  subscribe = (listener) => {
    this.#listeners.add(listener)
    void this.#ensureLoaded()
    return () => { this.#listeners.delete(listener) }
  }

  async importFiles(files) {
    await this.#ensureLoaded()
    const prepared = await Promise.all([...files].map(async file => ({
      name: file.name || 'character-card',
      type: file.type || '',
      base64: toBase64(new Uint8Array(await file.arrayBuffer())),
    })))
    const result = { imported: 0, rejected: [] }
    for (let offset = 0; offset < prepared.length; offset += 2) {
      const partial = await call('import', { files: prepared.slice(offset, offset + 2) })
      result.imported += partial.imported
      result.rejected.push(...partial.rejected)
    }
    await this.refresh()
    return result
  }

  async remove(id) {
    await call('remove', { id })
    await this.refresh()
  }

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
    this.#publish('loading', this.#snapshot.cards, null)
    try {
      const result = await call('list', {})
      if (revision === this.#revision) this.#publish('ready', Array.isArray(result.cards) ? result.cards : [], null)
    } catch (error) {
      if (revision === this.#revision) {
        this.#loading = undefined
        this.#publish('error', this.#snapshot.cards, error instanceof Error ? error.message : String(error))
      }
      throw error
    }
  }

  #publish(status, cards, error) {
    this.#snapshot = Object.freeze({
      status,
      cards: Object.freeze(cards),
      error,
      revision: this.#snapshot.revision + 1,
    })
    for (const listener of [...this.#listeners]) listener()
  }
}
