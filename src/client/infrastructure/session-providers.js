/** Keep subscribed providers stable while evicting inactive session state. */
export class SessionProviders {
  constructor(factory, limit = 16) { this.factory = factory; this.limit = limit; this.entries = new Map() }
  get(id) {
    let entry = this.entries.get(id)
    if (!entry) {
      const provider = this.factory(id)
      entry = { provider, users: 0 }
      const subscribe = provider.subscribe
      provider.subscribe = listener => {
        entry.users++
        const release = subscribe(listener)
        let live = true
        return () => { if (!live) return; live = false; release(); entry.users--; provider.release?.(); this.trim() }
      }
    }
    this.entries.delete(id); this.entries.set(id, entry); this.trim(id)
    return entry.provider
  }
  trim(protectedId) {
    for (const [id, entry] of this.entries) {
      if (this.entries.size <= this.limit) break
      if (entry.users || id === protectedId) continue
      entry.provider.dispose?.(); this.entries.delete(id)
    }
  }
  dispose() { for (const entry of this.entries.values()) entry.provider.dispose?.(); this.entries.clear() }
}
