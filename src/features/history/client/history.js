/** History capability backed by the durable DSH session catalog and archive. */
import { call } from '../../../client/infrastructure/rpc.js'
import { ByteCache } from '../../../shared/resources.js'
export class ChatHistoryService {
  getSnapshot() { throw new Error('ChatHistoryService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('ChatHistoryService.subscribe() is not implemented') }
  refresh() { throw new Error('ChatHistoryService.refresh() is not implemented') }
  ensureLoaded() { throw new Error('ChatHistoryService.ensureLoaded() is not implemented') }
  open() { throw new Error('ChatHistoryService.open() is not implemented') }
  getArchiveSnapshot() { throw new Error('ChatHistoryService.getArchiveSnapshot() is not implemented') }
  subscribeArchive() { throw new Error('ChatHistoryService.subscribeArchive() is not implemented') }
  archive() { throw new Error('ChatHistoryService.archive() is not implemented') }
  restore() { throw new Error('ChatHistoryService.restore() is not implemented') }
  details() { throw new Error('ChatHistoryService.details() is not implemented') }
}

/** No second persistence store: DSH owns catalog refresh and chat restoration. */
export class SessionChatHistoryProvider extends ChatHistoryService {
  constructor(sessions, uiWorkspace, workspaces) {
    super()
    this.sessions = sessions
    this.uiWorkspace = uiWorkspace
    this.workspaces = workspaces
    this.cache = new ByteCache()
    this.pending = new Map()
    this.revision = 0
  }

  getSnapshot = () => this.sessions.list.getSnapshot()
  subscribe = listener => this.sessions.list.subscribe(listener)
  refresh = () => { this.revision++; this.cache.clear(); return this.sessions.refresh() }
  ensureLoaded = () => this.getSnapshot().phase === 'ready' && this.getSnapshot().state !== 'error' ? Promise.resolve() : this.sessions.refresh()
  open = id => this.uiWorkspace.openSession(id)
  getArchiveSnapshot = () => this.workspaces.list.getSnapshot()
  subscribeArchive = listener => this.workspaces.list.subscribe(listener)
  archive = id => this.uiWorkspace.archiveSession(id)
  restore = id => this.uiWorkspace.unarchiveSession(id)
  details = async (ids, options = {}) => {
    const snapshot = this.getSnapshot()
    const revision = this.revision
    const result = {}, missing = []
    for (const id of ids) {
      const key = `${revision}:${id}:${snapshot.byId[id]?.updatedAt}`
      const cached = options.force ? undefined : this.cache.get(key)
      if (cached) result[id] = cached
      else missing.push([id, key])
    }
    if (!missing.length) return result
    const requestKey = JSON.stringify(missing)
    if (!this.pending.has(requestKey)) {
      const request = call('history-details', { ids: missing.map(row => row[0]) }).then(values => {
        if (revision === this.revision) for (const [id, key] of missing) if (values[id] && !values[id].error) this.cache.set(key, values[id])
        return values
      }).finally(() => this.pending.delete(requestKey))
      this.pending.set(requestKey, request)
    }
    return { ...result, ...await this.pending.get(requestKey) }
  }
  dispose() { this.revision++; this.cache.clear() }
}

/** Flatten all campaigns, retain ordinary forks, omit agent children and blanks. */
export function historyRows(snapshot, query = '', archivedSessionIds = [], archivedOnly = false, limit = Infinity) {
  const needle = query.trim().toLocaleLowerCase('ru')
  const archived = new Set(archivedSessionIds)
  const rows = []
  const order = (a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id)
  for (const id of snapshot.ids) {
    const row = snapshot.byId[id]
    if (!row || row.origin === 'subagent' || (row.blank && !row.title?.trim())) continue
    if (archived.has(id) !== archivedOnly) continue
    const title = row.title?.trim() || 'Чат без названия'
    if (needle && !`${title}\n${id}`.toLocaleLowerCase('ru').includes(needle)) continue
    rows.push({ id, title, updatedAt: row.updatedAt, current: row.retainedBy?.mainView > 0 })
    if (Number.isFinite(limit)) { rows.sort(order); if (rows.length > limit) rows.pop() }
  }
  return Number.isFinite(limit) ? rows : rows.sort(order)
}
