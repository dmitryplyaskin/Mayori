/** Bounded caches contain derived data only; active callers own their results. */
export class ByteCache {
  constructor(maxEntries = 128, maxBytes = 2 * 1024 * 1024) { this.maxEntries = maxEntries; this.maxBytes = maxBytes; this.bytes = 0; this.entries = new Map() }
  get(key) { const entry = this.entries.get(key); if (!entry) return undefined; this.entries.delete(key); this.entries.set(key, entry); return entry.value }
  set(key, value, bytes = JSON.stringify(value).length * 2) {
    this.delete(key)
    if (bytes > this.maxBytes) return
    this.entries.set(key, { value, bytes }); this.bytes += bytes
    while (this.entries.size > this.maxEntries || this.bytes > this.maxBytes) this.delete(this.entries.keys().next().value)
  }
  delete(key) { const entry = this.entries.get(key); if (entry) this.bytes -= entry.bytes; this.entries.delete(key) }
  clear() { this.entries.clear(); this.bytes = 0 }
}

/** A single queue per provider bounds work across concurrent RPC requests. */
export class WorkQueue {
  constructor(concurrency = 4, maxPending = 128) { this.concurrency = concurrency; this.maxPending = maxPending; this.active = 0; this.pending = []; this.closed = false }
  run(operation) {
    if (this.closed || this.pending.length >= this.maxPending) return Promise.reject(new Error('Сервис занят. Повторите запрос.'))
    return new Promise((resolve, reject) => { this.pending.push({ operation, resolve, reject }); this._drain() })
  }
  _drain() {
    while (!this.closed && this.active < this.concurrency && this.pending.length) {
      const job = this.pending.shift(); this.active++
      Promise.resolve().then(job.operation).then(job.resolve, job.reject).finally(() => { this.active--; this._drain() })
    }
  }
  close() { this.closed = true; for (const job of this.pending.splice(0)) job.reject(new Error('Сервис закрыт.')) }
}
