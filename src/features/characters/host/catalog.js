import { DatabaseSync } from 'node:sqlite'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { mediaId } from '../../media/shared/image.js'

/** Rebuildable metadata index. Queries never materialize the entire catalog. */
export class CharacterCatalog {
  constructor(root) { this.root = join(root, 'cache'); this.path = join(this.root, 'catalog-v1.sqlite') }
  async open() {
    await mkdir(this.root, { recursive: true })
    let db
    try { db = this._open(); db.prepare('SELECT count(*) FROM cards').get(); db.close() }
    catch (error) {
      try { db?.close() } catch {}
      if (!/malformed|not a database|no such column|no such table/i.test(error.message)) throw error
      for (const suffix of ['', '-wal', '-shm']) await rm(this.path + suffix, { force: true })
      this._open().close()
    }
  }
  _open() {
    const db = new DatabaseSync(this.path)
    try { db.exec(`PRAGMA busy_timeout=2000; PRAGMA cache_size=-1024; PRAGMA temp_store=FILE;
      CREATE TABLE IF NOT EXISTS cards(id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, summary TEXT NOT NULL,
        haystack TEXT NOT NULL, name TEXT NOT NULL, creator TEXT NOT NULL, imported REAL NOT NULL, portrait INTEGER NOT NULL, seen TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS cards_recent ON cards(imported DESC, name, id);
      CREATE INDEX IF NOT EXISTS cards_name ON cards(name, id);`) }
    catch (error) { db.close(); throw error }
    return db
  }
  startScan() { this.scanner = this._open(); this.scanner.exec('PRAGMA journal_mode=WAL; BEGIN') }
  checkpoint() { this.scanner.exec('COMMIT; BEGIN') }
  stopScan() { if (this.scanner) { try { this.scanner.exec('COMMIT') } finally { this.scanner.close(); this.scanner = undefined } } }
  use(operation) { if (this.scanner) return operation(this.scanner); const db = this._open(); try { return operation(db) } finally { db.close() } }
  fingerprint(id) { return this.use(db => db.prepare('SELECT fingerprint FROM cards WHERE id=?').get(id)?.fingerprint) }
  mark(id, generation) { this.use(db => db.prepare('UPDATE cards SET seen=? WHERE id=?').run(generation, id)) }
  upsert(record, fingerprint, seen) {
    const data = record.card.data
    const tags = Array.isArray(data.tags) ? [...new Set(data.tags.filter(tag => typeof tag === 'string' && tag.trim()).map(tag => tag.trim()))] : []
    const asset = Array.isArray(data.assets) ? data.assets.find(a => a?.type === 'icon' && a.name === 'main') ?? data.assets.find(a => a?.type === 'icon') : null
    const portrait = record.hasImage || /^data:image\/(png|jpeg|webp|gif);base64,/.test(asset?.uri ?? '')
    const creator = typeof data.creator === 'string' ? data.creator.trim() : ''
    const resource = mediaId(record.imageReference)
    const summary = { id: record.id, name: record.name, importedAt: record.importedAt, data: { creator, tags },
      image: portrait ? resource ? `/mayori/characters/media/${resource}/gallery` : `/mayori/characters/card-image/${record.id}/gallery` : null }
    const haystack = [record.name, data.creator, data.description, data.personality, ...tags].filter(v => typeof v === 'string').join('\n').toLocaleLowerCase('ru')
    this.use(db => db.prepare('INSERT OR REPLACE INTO cards VALUES(?,?,?,?,?,?,?,?,?)').run(record.id, fingerprint, JSON.stringify(summary), haystack,
      record.name.toLocaleLowerCase('ru'), creator, record.importedAt, Number(Boolean(portrait)), seen))
  }
  remove(id) { this.use(db => db.prepare('DELETE FROM cards WHERE id=?').run(id)) }
  finish(generation) { this.use(db => db.prepare('DELETE FROM cards WHERE seen<>?').run(generation)) }
  query(input = {}) {
    const pageSize = input.pageSize ?? 20, page = input.page ?? 1
    if (!Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 60 || !Number.isSafeInteger(page) || page < 1
      || typeof (input.query ?? '') !== 'string' || (input.query?.length ?? 0) > 1000
      || !['newest', 'name', 'creator'].includes(input.sort ?? 'newest') || !['all', 'with', 'without'].includes(input.portrait ?? 'all')
      || typeof (input.creator ?? 'all') !== 'string' || !Array.isArray(input.tags ?? []) || (input.tags?.length ?? 0) > 100
      || input.tags?.some(tag => typeof tag !== 'string' || tag.length > 1000)) throw new TypeError('Некорректные фильтры каталога.')
    return this.use(db => {
      const clauses = [], values = []
      if (input.query?.trim()) { clauses.push('instr(haystack,?)>0'); values.push(input.query.trim().toLocaleLowerCase('ru')) }
      if (input.creator && input.creator !== 'all') { clauses.push('creator=?'); values.push(input.creator) }
      if (input.portrait && input.portrait !== 'all') { clauses.push('portrait=?'); values.push(input.portrait === 'with' ? 1 : 0) }
      for (const tag of input.tags ?? []) { clauses.push("EXISTS(SELECT 1 FROM json_each(summary,'$.data.tags') WHERE value=?)"); values.push(tag) }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
      const total = db.prepare('SELECT count(*) AS n FROM cards').get().n
      const filteredTotal = db.prepare(`SELECT count(*) AS n FROM cards ${where}`).get(...values).n
      const actualPage = Math.min(page, Math.max(1, Math.ceil(filteredTotal / pageSize)))
      const order = input.sort === 'name' ? 'name,id' : input.sort === 'creator' ? 'creator,name,id' : 'imported DESC,name,id'
      const cards = db.prepare(`SELECT summary FROM cards ${where} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...values, pageSize, (actualPage - 1) * pageSize).map(row => JSON.parse(row.summary))
      const creators = db.prepare("SELECT DISTINCT creator FROM cards WHERE creator<>'' ORDER BY creator").all().map(row => row.creator)
      const tags = db.prepare("SELECT value AS tag, count(*) AS count FROM cards,json_each(summary,'$.data.tags') GROUP BY value ORDER BY count DESC,value").all().map(row => [row.tag, row.count])
      return { cards, total, filteredTotal, page: actualPage, pageSize, facets: { creators, tags } }
    })
  }
}
