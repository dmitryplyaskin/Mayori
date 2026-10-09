import { randomUUID } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { mkdir, readFile, readdir, rename, rm, writeFile, stat, link, copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { importCharacterCardBytes } from '../shared/card.js'
import { CharacterCatalog } from './catalog.js'

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
      base64: file.base64,
    }
  })
}

/** Filesystem storage implementation rooted below the configured DSH home. */
export class FileSystemCharacterLibraryStore {
  #root
  #writes = Promise.resolve()
  #ready
  #scan
  #closed = false
  #errors = 0

  constructor(root, media) {
    if (typeof root !== 'string' || root.trim() === '') {
      throw new TypeError('charactersPath must be a non-empty string')
    }
    this.#root = resolve(root)
    this.media = media
    this.catalog = new CharacterCatalog(this.#root)
  }

  get root() { return this.#root }

  async query(input) {
    await this.#writes
    await this.#ensureIndex()
    return { ...this.catalog.query(input), indexing: Boolean(this.#scan), unavailable: this.#errors }
  }

  #ensureIndex() {
    if (this.#ready) return this.#ready
    let release, reject
    this.#ready = new Promise((accept, refuse) => { release = accept; reject = refuse })
    this.#scan = (async () => {
      await mkdir(this.#root, { recursive: true })
      await this.catalog.open()
      const names = (await readdir(this.#root)).filter(name => /^[a-f0-9]{64}\.json$/.test(name))
      const generation = randomUUID()
      this.catalog.startScan()
      for (let index = 0; index < names.length && !this.#closed; index++) {
        const name = names[index], id = name.slice(0, -5)
        try {
          const meta = await stat(this.#recordPath(id)), fingerprint = `${meta.size}:${meta.mtimeMs}:${meta.ctimeMs}`
          if (this.catalog.fingerprint(id) === fingerprint) this.catalog.mark(id, generation)
          else this.catalog.upsert(await this.#serialized(id), fingerprint, generation)
        } catch { this.#errors++; this.catalog.remove(id) }
        if (index === 59) release()
        if (index % 20 === 0) { this.catalog.checkpoint(); await new Promise(resolve => setImmediate(resolve)) }
      }
      if (!this.#closed) this.catalog.finish(generation)
      release()
    })().catch(error => { this.#ready = undefined; reject(error); throw error }).finally(() => { this.catalog.stopScan(); this.#scan = undefined })
    void this.#scan.catch(() => {})
    return this.#ready
  }

  async close() { this.#closed = true; await this.#scan?.catch(() => {}); await this.#writes.catch(() => {}) }
  async get(id) { await this.#writes; return this.#readRecord(`${validateId(id)}.json`) }
  async image(id, variant) {
    validateId(id)
    await this.#writes
    await stat(this.#recordPath(id))
    const cachePath = resolve(this.#root, 'cache', `${id}.media.json`)
    let source
    try { source = JSON.parse(await readFile(cachePath, 'utf8')).reference } catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error }
    if (source?.match(/^mayori-media:[a-f0-9]{64}$/) && this.media) return this.media.read(source.slice('mayori-media:'.length), variant)
    const serialized = await this.#serialized(id)
    source = serialized.imageReference
    if (!source) {
      if (serialized.hasImage) source = `data:image/png;base64,${(await readFile(this.#imagePath(id))).toString('base64')}`
      else {
        const assets = Array.isArray(serialized.card.data.assets) ? serialized.card.data.assets : []
        source = (assets.find(a => a?.type === 'icon' && a.name === 'main') ?? assets.find(a => a?.type === 'icon'))?.uri
      }
    }
    if (!source || !this.media) { const error = new Error('Портрет не найден.'); error.code = 'ENOENT'; throw error }
    const reference = await this.media.put(source)
    await this.#cacheImage(id, reference)
    return this.media.read(reference.slice('mayori-media:'.length), variant)
  }

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
      await this.#ensureIndex()
      await this.#scan
      const rejected = []
      let imported = 0
      for (const file of files) {
        try {
          const record = await importCharacterCardBytes(decodeBase64(file.base64), { mediaType: file.type, fileName: file.name })
          const imageReference = await this.#writeRecord(record)
          const meta = await stat(this.#recordPath(record.id))
          this.catalog.upsert({ ...record, imageReference, hasImage: record.imageBytes !== null }, `${meta.size}:${meta.mtimeMs}:${meta.ctimeMs}`, 'import')
          imported++
        } catch (error) { rejected.push({ name: file.name, error: message(error) }) }
      }
      return { imported, rejected }
    })
  }

  remove(id) {
    const safeId = validateId(id)
    return this.#enqueue(async () => {
      await this.#ensureIndex()
      await this.#scan
      await Promise.all([
        rm(this.#recordPath(safeId), { force: true }),
        rm(this.#imagePath(safeId), { force: true }),
      ])
      this.catalog.remove(safeId)
      await rm(resolve(this.#root, 'cache', `${safeId}.media.json`), { force: true })
    })
  }

  #enqueue(operation) {
    const result = this.#writes.then(operation)
    this.#writes = result.then(() => undefined, () => undefined)
    return result
  }

  async #readRecord(name) {
    const id = validateId(name.slice(0, -5))
    const serialized = await this.#serialized(id)
    let image = serialized.imageReference ?? null
    if (serialized.hasImage === true && (!image || !this.media)) {
      try {
        image = `data:image/png;base64,${(await readFile(this.#imagePath(id))).toString('base64')}`
        if (this.media) image = await this.media.put(image)
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

  async #serialized(id) {
    const record = JSON.parse(await readFile(this.#recordPath(id), 'utf8'))
    if (record?.format !== RECORD_FORMAT || record.id !== id || typeof record.name !== 'string' || !record.name.trim()
      || typeof record.card?.data?.name !== 'string' || !Number.isFinite(record.importedAt)) throw new Error(`Файл ${id}.json не является карточкой Mayori.`)
    return record
  }

  async #writeRecord(record) {
    const id = validateId(record.id)
    const hasImage = record.imageBytes !== null
    const imageReference = hasImage && this.media ? await this.media.put(`data:image/png;base64,${Buffer.from(record.imageBytes).toString('base64')}`) : undefined
    if (imageReference) {
      const file = await this.media.read(imageReference.slice('mayori-media:'.length), 'original')
      const temporaryImage = resolve(this.#root, `${id}.${randomUUID()}.png.tmp`)
      try {
        try { await link(file.path, temporaryImage) } catch (error) {
          if (!['EPERM', 'ENOTSUP', 'EOPNOTSUPP', 'EXDEV'].includes(error.code)) throw error
          await copyFile(file.path, temporaryImage)
        }
        await rename(temporaryImage, this.#imagePath(id))
      }
      finally { await rm(temporaryImage, { force: true }) }
      await this.#cacheImage(id, imageReference)
    } else if (hasImage) await writeFile(this.#imagePath(id), record.imageBytes)
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
      ...(imageReference ? { imageReference } : {}),
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
    if (!imageReference) await rm(resolve(this.#root, 'cache', `${id}.media.json`), { force: true })
    return imageReference
  }

  async #cacheImage(id, reference) {
    const directory = resolve(this.#root, 'cache')
    await mkdir(directory, { recursive: true })
    const temporary = resolve(directory, `${id}.${randomUUID()}.tmp`)
    try {
      await writeFile(temporary, JSON.stringify({ reference }), { flag: 'wx' })
      await rename(temporary, resolve(directory, `${id}.media.json`))
    } finally { await rm(temporary, { force: true }) }
  }

  #recordPath(id) { return resolve(this.#root, `${id}.json`) }
  #imagePath(id) { return resolve(this.#root, `${id}.png`) }
}
