/** Browser proxy for the Host-owned Character Library Service. */

const EMPTY_SNAPSHOT = Object.freeze({ status: 'loading', cards: Object.freeze([]), error: null, revision: 0 })

/** Service Definition consumed by gallery UI. */
export class CharacterLibraryService {
  getSnapshot() { throw new Error('CharacterLibraryService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('CharacterLibraryService.subscribe() is not implemented') }
  importFiles() { throw new Error('CharacterLibraryService.importFiles() is not implemented') }
  remove() { throw new Error('CharacterLibraryService.remove() is not implemented') }
  prepareCampaign() { throw new Error('CharacterLibraryService.prepareCampaign() is not implemented') }
  play() { throw new Error('CharacterLibraryService.play() is not implemented') }
}

function toBase64(bytes) {
  const chunkSize = 0x8000
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }
  return btoa(binary)
}

function unwrap(result) {
  if (result.ok) return result.value
  throw new Error(typeof result.error === 'string' ? result.error : 'Не удалось выполнить операцию с библиотекой.')
}

async function call(endpoint, payload) {
  const response = await fetch(`/mayori/characters/${endpoint}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const result = await response.json().catch(() => ({ ok: false, error: `HTTP ${response.status}` }))
  if (!response.ok && result.ok !== false) throw new Error(`HTTP ${response.status}`)
  return unwrap(result)
}

/** Client Provider that keeps only an observable snapshot; Host owns persistence. */
export class RemoteCharacterLibraryProvider extends CharacterLibraryService {
  #snapshot = EMPTY_SNAPSHOT
  #listeners = new Set()
  #loading

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
    await this.#reload()
    return result
  }

  async remove(id) {
    await call('remove', { id })
    await this.#reload()
  }

  async play(characterId, sessionId) {
    return call('play', { characterId, sessionId })
  }

  async prepareCampaign() {
    return call('prepare-campaign', {})
  }

  async #ensureLoaded() {
    this.#loading ??= this.#reload().catch((error) => {
      this.#publish('error', [], error instanceof Error ? error.message : String(error))
    })
    return this.#loading
  }

  async #reload() {
    const result = await call('list', {})
    this.#publish('ready', Array.isArray(result.cards) ? result.cards : [], null)
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
