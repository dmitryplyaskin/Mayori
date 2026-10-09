import { DatabaseSync } from 'node:sqlite'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

/** Disposable, bounded preview read model. Opaque revisions are scoped to a boot. */
export class PreviewCache {
  constructor(root, maxEntries = 512) { this.root = join(root, 'cache'); this.path = join(this.root, 'previews-v1.sqlite'); this.maxEntries = maxEntries }
  async use(operation) {
    await mkdir(this.root, { recursive: true })
    let db
    try {
      db = new DatabaseSync(this.path)
      db.exec('PRAGMA cache_size=-512; PRAGMA busy_timeout=2000; CREATE TABLE IF NOT EXISTS previews(id TEXT PRIMARY KEY, token TEXT NOT NULL, value TEXT NOT NULL, used INTEGER NOT NULL)')
      return operation(db)
    } catch (error) {
      if (/malformed|not a database/i.test(error.message)) {
        db?.close(); db = null
        await rm(this.path, { force: true })
        return undefined
      }
      throw error
    } finally { db?.close() }
  }
  get(id, token) { return this.use(db => { const row = db.prepare('SELECT value FROM previews WHERE id=? AND token=?').get(id, token); return row ? JSON.parse(row.value) : undefined }) }
  put(id, token, value) { return this.use(db => {
    db.prepare('INSERT OR REPLACE INTO previews VALUES(?,?,?,?)').run(id, token, JSON.stringify(value), Date.now())
    db.prepare('DELETE FROM previews WHERE id NOT IN (SELECT id FROM previews ORDER BY used DESC,id LIMIT ?)').run(this.maxEntries)
  }) }
}
