/** Character-library capability: Service Definition plus IndexedDB Provider. */

import { importCharacterCardFile } from './character-card.js'

const EMPTY_SNAPSHOT = Object.freeze({ status: 'loading', cards: Object.freeze([]), error: null, revision: 0 })

/**
 * Service Definition for the browser-local imported Character Card library.
 * Providers publish immutable snapshots and own persistence; UI consumers do
 * not reach IndexedDB directly.
 */
export class CharacterLibraryService {
  getSnapshot() { throw new Error('CharacterLibraryService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('CharacterLibraryService.subscribe() is not implemented') }
  importFiles() { throw new Error('CharacterLibraryService.importFiles() is not implemented') }
  remove() { throw new Error('CharacterLibraryService.remove() is not implemented') }
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener('success', () => { resolve(request.result) }, { once: true })
    request.addEventListener('error', () => { reject(request.error ?? new Error('IndexedDB request failed')) }, { once: true })
  })
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener('complete', resolve, { once: true })
    transaction.addEventListener('abort', () => { reject(transaction.error ?? new Error('IndexedDB transaction aborted')) }, { once: true })
    transaction.addEventListener('error', () => { reject(transaction.error ?? new Error('IndexedDB transaction failed')) }, { once: true })
  })
}

function openDatabase(indexedDb) {
  return new Promise((resolve, reject) => {
    const request = indexedDb.open('mayori-character-library', 1)
    request.addEventListener('upgradeneeded', () => {
      const database = request.result
      if (!database.objectStoreNames.contains('characters')) {
        const store = database.createObjectStore('characters', { keyPath: 'id' })
        store.createIndex('importedAt', 'importedAt')
      }
    })
    request.addEventListener('success', () => { resolve(request.result) }, { once: true })
    request.addEventListener('error', () => { reject(request.error ?? new Error('IndexedDB open failed')) }, { once: true })
  })
}

/** IndexedDB Provider. Imported cards survive browser reloads on this origin. */
export class IndexedDbCharacterLibraryProvider extends CharacterLibraryService {
  #indexedDb
  #database
  #snapshot = EMPTY_SNAPSHOT
  #listeners = new Set()
  #loading

  constructor(indexedDb = globalThis.indexedDB) {
    super()
    this.#indexedDb = indexedDb
  }

  getSnapshot = () => this.#snapshot

  subscribe = (listener) => {
    this.#listeners.add(listener)
    void this.#ensureLoaded()
    return () => { this.#listeners.delete(listener) }
  }

  async importFiles(files) {
    await this.#ensureLoaded()
    if (this.#snapshot.status === 'error') throw new Error(this.#snapshot.error)
    const settled = await Promise.allSettled([...files].map(file => importCharacterCardFile(file)))
    const records = settled.flatMap(result => result.status === 'fulfilled' ? [result.value] : [])
    const rejected = settled.flatMap((result, index) => result.status === 'rejected'
      ? [{ name: files[index]?.name ?? 'character-card', error: result.reason instanceof Error ? result.reason.message : String(result.reason) }]
      : [])
    if (records.length > 0) {
      const database = await this.#db()
      const transaction = database.transaction('characters', 'readwrite')
      const store = transaction.objectStore('characters')
      for (const record of records) store.put(record)
      await transactionDone(transaction)
      await this.#reload()
    }
    return { imported: records.length, rejected }
  }

  async remove(id) {
    await this.#ensureLoaded()
    const database = await this.#db()
    const transaction = database.transaction('characters', 'readwrite')
    transaction.objectStore('characters').delete(id)
    await transactionDone(transaction)
    await this.#reload()
  }

  async #db() {
    if (this.#indexedDb === undefined) throw new Error('IndexedDB недоступен в этом браузере.')
    this.#database ??= openDatabase(this.#indexedDb)
    return this.#database
  }

  async #ensureLoaded() {
    this.#loading ??= this.#reload().catch((error) => {
      this.#publish('error', [], error instanceof Error ? error.message : String(error))
    })
    return this.#loading
  }

  async #reload() {
    const database = await this.#db()
    const transaction = database.transaction('characters', 'readonly')
    const cards = await requestResult(transaction.objectStore('characters').getAll())
    await transactionDone(transaction)
    cards.sort((left, right) => right.importedAt - left.importedAt || left.name.localeCompare(right.name))
    this.#publish('ready', cards, null)
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
