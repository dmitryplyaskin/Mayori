import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile, rename, rm, stat, opendir, link } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { mediaConfig } from './config.js'
import { mediaId } from '../shared/image.js'
import { WorkQueue } from '../../../shared/resources.js'

/** Original bytes are durable resources; size variants are disposable disk caches. */
export class ImageStore {
  constructor(root, options = {}) {
    this.root = root; this.config = mediaConfig(options); this.pending = new Map(); this.work = new WorkQueue(this.config.concurrency, this.config.maxQueue)
    this.variants = new Map(); this.leases = new Map(); this.variantBytes = 0; this.pruning = Promise.resolve()
  }
  async put(value) {
    if (!value) return value
    if (mediaId(value)) return value
    if (typeof value !== 'string' || !/^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new TypeError('Некорректное изображение.')
    const bytes = Buffer.from(value.slice(value.indexOf(',') + 1), 'base64')
    if (bytes.length > 16 * 1024 * 1024) throw new RangeError('Изображение превышает 16 МБ.')
    const type = value.slice(5, value.indexOf(';'))
    const id = createHash('sha256').update(bytes).digest('hex')
    await mkdir(this.root, { recursive: true })
    await this._publish(join(this.root, `${id}.original`), bytes)
    await this._publish(join(this.root, `${id}.json`), JSON.stringify({ type }))
    return `mayori-media:${id}`
  }
  async read(id, variant) {
    if (!/^[a-f0-9]{64}$/.test(id) || !['avatar', 'gallery', 'preview', 'original'].includes(variant)) throw new TypeError('Некорректное изображение.')
    const meta = JSON.parse(await readFile(join(this.root, `${id}.json`), 'utf8'))
    if (variant === 'original') return { path: join(this.root, `${id}.original`), type: meta.type, etag: `"${id}-original"` }
    const size = this.config[`${variant}Size`]
    const key = `${id}-v1-${size}-${this.config.quality}`
    const path = join(this.root, 'cache', `${key}.webp`)
    this.leases.set(path, (this.leases.get(path) ?? 0) + 1)
    let released = false
    const release = () => {
      if (released) return; released = true
      const count = this.leases.get(path) - 1
      if (count) this.leases.set(path, count); else this.leases.delete(path)
      void this._prune()
    }
    if (!this.pending.has(key)) {
      const work = this._variant(path, id, size).finally(() => this.pending.delete(key))
      this.pending.set(key, work)
    }
    try {
      await this.pending.get(key)
      await this._initDiskCache()
      const size = (await stat(path)).size
      this._touch(path, size)
      await this._prune()
      return { path, type: 'image/webp', etag: `"${key}"`, release }
    } catch (error) { release(); throw error }
  }
  async _variant(path, id, size) {
    await mkdir(join(this.root, 'cache'), { recursive: true })
    try { await stat(path); return } catch (error) { if (error.code !== 'ENOENT') throw error }
    return this.work.run(async () => {
      const temporary = `${path}.${randomUUID()}.tmp`
      try {
        const input = await readFile(join(this.root, `${id}.original`))
        await sharp(input, { limitInputPixels: this.config.maxPixels, sequentialRead: true })
          .rotate().resize(size, size, { fit: 'inside', withoutEnlargement: true }).webp({ quality: this.config.quality }).toFile(temporary)
        await rename(temporary, path)
      } finally { await rm(temporary, { force: true }) }
    })
  }
  async _publish(path, bytes) {
    try { await stat(path); return } catch (error) { if (error.code !== 'ENOENT') throw error }
    const temporary = `${path}.${randomUUID()}.tmp`
    try {
      await writeFile(temporary, bytes, { flag: 'wx', flush: true })
      try { await link(temporary, path) } catch (error) {
        if (['EPERM', 'ENOTSUP', 'EOPNOTSUPP', 'EXDEV'].includes(error.code)) await rename(temporary, path)
        else if (error.code !== 'EEXIST') throw error
      }
    } finally { await rm(temporary, { force: true }) }
  }
  _touch(path, size) {
    this.variantBytes -= this.variants.get(path) ?? 0
    this.variants.delete(path); this.variants.set(path, size); this.variantBytes += size
  }
  _initDiskCache() {
    return this.diskReady ??= (async () => {
      const directory = await opendir(join(this.root, 'cache'))
      for await (const file of directory) if (file.isFile() && /^[a-f0-9]{64}-v1-\d+-\d+\.webp$/.test(file.name)) {
        const path = join(this.root, 'cache', file.name)
        try { this._touch(path, (await stat(path)).size); await this._prune() } catch (error) { if (error.code !== 'ENOENT') throw error }
      }
    })()
  }
  _prune() {
    const run = async () => {
      for (const [path, size] of this.variants) {
        if (this.variantBytes <= this.config.thumbnailCacheBytes && this.variants.size <= this.config.maxVariantFiles) break
        if (this.leases.has(path)) continue
        try { await rm(path, { force: true }); this.variants.delete(path); this.variantBytes -= size } catch {}
      }
    }
    this.pruning = this.pruning.then(run, run)
    return this.pruning
  }
  async close() { this.work.close(); await Promise.allSettled([...this.pending.values()]); await this.pruning }
}
