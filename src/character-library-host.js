/** Host-side Character Library capability and filesystem provider. */

import { randomUUID } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { Service } from '@deepseek-ai/cordis'

import { importCharacterCardBytes } from './character-card.js'
import { PersistentCharacterSessionProvider } from './character-play-host.js'

const RECORD_FORMAT = 1
const CARD_ID = /^[a-f0-9]{64}$/
const MAX_IMPORT_FILES = 64
const MAX_REQUEST_BYTES = 64 * 1024 * 1024
const ROUTE_PATH = '/mayori/characters'

function message(error) {
  return error instanceof Error ? error.message : String(error)
}

function validateId(id) {
  if (typeof id !== 'string' || !CARD_ID.test(id)) {
    throw new TypeError('Некорректный идентификатор карточки.')
  }
  return id
}

function decodeBase64(value) {
  if (typeof value !== 'string' || value.length === 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    throw new TypeError('Файл карточки содержит некорректные данные.')
  }
  return new Uint8Array(Buffer.from(value, 'base64'))
}

function validateImportPayload(payload) {
  if (payload === null || typeof payload !== 'object' || !Array.isArray(payload.files)) {
    throw new TypeError('Ожидался список файлов карточек.')
  }
  if (payload.files.length > MAX_IMPORT_FILES) {
    throw new TypeError(`За один раз можно импортировать не больше ${MAX_IMPORT_FILES} файлов.`)
  }
  return payload.files.map((file) => {
    if (file === null || typeof file !== 'object') throw new TypeError('Некорректное описание файла карточки.')
    return {
      name: typeof file.name === 'string' && file.name.trim() !== '' ? file.name : 'character-card',
      type: typeof file.type === 'string' ? file.type : '',
      bytes: decodeBase64(file.base64),
    }
  })
}

function isLoopbackRequest(req) {
  const rawHost = req.headers.host
  const origin = req.headers.origin
  if (typeof rawHost !== 'string' || typeof origin !== 'string') return false
  let host
  try {
    host = new URL(`http://${rawHost}`).hostname.toLowerCase()
  } catch {
    return false
  }
  const loopback = host === 'localhost'
    || host.endsWith('.localhost')
    || host === '::1'
    || host === '[::1]'
    || /^127(?:\.\d{1,3}){3}$/.test(host)
  if (!loopback || (req.headers['sec-fetch-site'] !== undefined && req.headers['sec-fetch-site'] !== 'same-origin')) {
    return false
  }
  return origin === `http://${rawHost}` || origin === `https://${rawHost}`
}

async function readJsonBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.byteLength
    if (size > MAX_REQUEST_BYTES) throw new RangeError('Запрос импорта превышает лимит 64 МБ.')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  })
  res.end(body)
}

/** Service Definition for durable imported Character Cards. */
export class CharacterLibraryService extends Service {
  constructor(ctx) { super(ctx, 'mayoriCharacters') }
  list() { throw new Error('CharacterLibraryService.list() is not implemented') }
  import(payload) { throw new Error('CharacterLibraryService.import() is not implemented') }
  remove() { throw new Error('CharacterLibraryService.remove() is not implemented') }
}

/** Filesystem storage implementation rooted below the configured DSH home. */
export class FileSystemCharacterLibraryStore {
  #root
  #writes = Promise.resolve()

  constructor(root) {
    if (typeof root !== 'string' || root.trim() === '') {
      throw new TypeError('charactersPath must be a non-empty string')
    }
    this.#root = resolve(root)
  }

  get root() { return this.#root }

  async list() {
    await this.#writes
    await mkdir(this.#root, { recursive: true })
    const names = await readdir(this.#root)
    const cards = await Promise.all(names
      .filter(name => CARD_ID.test(name.slice(0, -5)) && name.endsWith('.json'))
      .map(name => this.#readRecord(name)))
    cards.sort((left, right) => right.importedAt - left.importedAt || left.name.localeCompare(right.name))
    return cards
  }

  import(payload) {
    const files = validateImportPayload(payload)
    return this.#enqueue(async () => {
      await mkdir(this.#root, { recursive: true })
      const settled = await Promise.allSettled(files.map(file => importCharacterCardBytes(file.bytes, {
        mediaType: file.type,
        fileName: file.name,
      })))
      const rejected = []
      let imported = 0
      for (let index = 0; index < settled.length; index += 1) {
        const result = settled[index]
        if (result.status === 'rejected') {
          rejected.push({ name: files[index].name, error: message(result.reason) })
          continue
        }
        await this.#writeRecord(result.value)
        imported += 1
      }
      return { imported, rejected }
    })
  }

  remove(id) {
    const safeId = validateId(id)
    return this.#enqueue(async () => {
      await Promise.all([
        rm(this.#recordPath(safeId), { force: true }),
        rm(this.#imagePath(safeId), { force: true }),
      ])
    })
  }

  #enqueue(operation) {
    const result = this.#writes.then(operation)
    this.#writes = result.then(() => undefined, () => undefined)
    return result
  }

  async #readRecord(name) {
    const id = validateId(name.slice(0, -5))
    const serialized = JSON.parse(await readFile(this.#recordPath(id), 'utf8'))
    if (serialized?.format !== RECORD_FORMAT || serialized.id !== id || serialized.card?.data?.name === undefined) {
      throw new Error(`Файл ${name} не является карточкой Mayori.`)
    }
    let image = null
    if (serialized.hasImage === true) {
      try {
        image = `data:image/png;base64,${(await readFile(this.#imagePath(id))).toString('base64')}`
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error
      }
    }
    return Object.freeze({
      id,
      spec: serialized.spec,
      specVersion: serialized.specVersion,
      name: serialized.name,
      data: serialized.card.data,
      card: serialized.card,
      warnings: Array.isArray(serialized.warnings) ? serialized.warnings : [],
      importedAt: serialized.importedAt,
      sourceName: serialized.sourceName,
      image,
    })
  }

  async #writeRecord(record) {
    const id = validateId(record.id)
    const hasImage = record.imageBytes !== null
    if (hasImage) await writeFile(this.#imagePath(id), record.imageBytes)
    else await rm(this.#imagePath(id), { force: true })
    const serialized = JSON.stringify({
      format: RECORD_FORMAT,
      id,
      spec: record.spec,
      specVersion: record.specVersion,
      name: record.name,
      card: record.card,
      warnings: record.warnings,
      importedAt: record.importedAt,
      sourceName: record.sourceName,
      hasImage,
    }, null, 2)
    const temporary = resolve(this.#root, `${id}.${randomUUID()}.tmp`)
    await writeFile(temporary, `${serialized}\n`, { encoding: 'utf8', flag: 'wx' })
    try {
      await rename(temporary, this.#recordPath(id))
    } catch (error) {
      if (error?.code !== 'EEXIST' && error?.code !== 'EPERM') throw error
      await rm(this.#recordPath(id), { force: true })
      await rename(temporary, this.#recordPath(id))
    } finally {
      await rm(temporary, { force: true })
    }
  }

  #recordPath(id) { return resolve(this.#root, `${id}.json`) }
  #imagePath(id) { return resolve(this.#root, `${id}.png`) }
}

/** Cordis Provider that publishes the filesystem implementation through ctx. */
export class FileSystemCharacterLibraryProvider extends CharacterLibraryService {
  _store

  constructor(ctx, config) {
    super(ctx)
    this._store = new FileSystemCharacterLibraryStore(config.root)
  }

  get root() { return this._store.root }
  list() { return this._store.list() }
  import(payload) { return this._store.import(payload) }
  remove(id) { return this._store.remove(id) }
}

/** Register the Host library and its reversible browser transport. */
export function registerCharacterLibrary(ctx, root, campaignsRoot) {
  const library = new FileSystemCharacterLibraryProvider(ctx, { root })
  ctx.inject(['webServer', 'agents'], async (consumerCtx) => {
    const characterSessions = new PersistentCharacterSessionProvider(consumerCtx, library, { campaignsRoot })
    await characterSessions.restoreActiveAgents()
    const route = {
      kind: 'prefix',
      path: ROUTE_PATH,
      handler: async (req, res) => {
        if (!isLoopbackRequest(req)) {
          res.writeHead(403); res.end('forbidden'); return
        }
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST' }); res.end(); return
        }
        const endpoint = new URL(req.url, 'http://dsh.internal').pathname.slice(ROUTE_PATH.length + 1)
        let payload
        try {
          payload = await readJsonBody(req)
        } catch (error) {
          sendJson(res, error instanceof RangeError ? 413 : 400, { ok: false, error: message(error) })
          return
        }
        try {
          if (endpoint === 'list') sendJson(res, 200, { ok: true, value: { cards: await library.list() } })
          else if (endpoint === 'import') sendJson(res, 200, { ok: true, value: await library.import(payload) })
          else if (endpoint === 'remove') {
            if (payload === null || typeof payload !== 'object') throw new TypeError('Ожидался идентификатор карточки.')
            await library.remove(payload.id)
            sendJson(res, 200, { ok: true, value: { removed: true } })
          } else if (endpoint === 'prepare-campaign') {
            sendJson(res, 200, { ok: true, value: await characterSessions.prepareCampaign() })
          } else if (endpoint === 'play') {
            if (payload === null || typeof payload !== 'object') throw new TypeError('Ожидались персонаж и сессия.')
            sendJson(res, 200, { ok: true, value: await characterSessions.select(payload.sessionId, payload.characterId) })
          } else sendJson(res, 404, { ok: false, error: 'Неизвестная операция библиотеки.' })
        } catch (error) {
          sendJson(res, 400, { ok: false, error: message(error) })
        }
      },
    }
    consumerCtx.effect(
      () => consumerCtx.webServer.register(route),
      'mayori: character library route',
    )
  })
  return library
}
