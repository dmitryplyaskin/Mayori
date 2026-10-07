import { randomUUID } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { importCharacterCardBytes } from '../shared/card.js'

const RECORD_FORMAT = 1
const CARD_ID = /^[a-f0-9]{64}$/
const MAX_IMPORT_FILES = 64

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
