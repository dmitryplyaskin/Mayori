import { tr, formatLocale } from '../../localization/client/service.js'
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
  remove() { throw new Error('ChatHistoryService.remove() is not implemented') }
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
    this.deletedIds = []
    this.deletionPhase = 'pending'
    this.listeners = new Set()
  }

  getSnapshot = () => {
    const source = this.sessions.list.getSnapshot()
    if (this.source !== source || this.filteredIds !== this.deletedIds || this.phase !== this.deletionPhase) {
      const deleted = new Set(this.deletedIds)
      this.source = source; this.filteredIds = this.deletedIds; this.phase = this.deletionPhase
      this.snapshot = { ...source, phase: this.deletionPhase === 'pending' ? 'pending' : source.phase,
        state: this.deletionPhase === 'error' ? 'error' : source.state,
        ids: this.deletionPhase === 'ready' ? source.ids.filter(id => !deleted.has(id)) : [] }
    }
    return this.snapshot
  }
  subscribe = listener => {
    this.listeners.add(listener)
    const unsubscribe = this.sessions.list.subscribe(listener)
    return () => { this.listeners.delete(listener); unsubscribe() }
  }
  publishDeleted = ids => {
    if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string')) throw new Error(tr("Некорректный список удалённых чатов."))
    this.deletedIds = [...new Set([...this.deletedIds, ...ids])]
    this.deletionPhase = 'ready'; this.listeners.forEach(listener => listener())
  }
  refresh = async () => {
    this.revision++; this.cache.clear()
    try {
      const [ids] = await Promise.all([call('history-deleted', {}), this.sessions.refresh()])
      this.publishDeleted(ids)
    } catch (error) {
      if (this.deletionPhase !== 'ready') { this.deletionPhase = 'error'; this.listeners.forEach(listener => listener()) }
      throw error
    }
  }
  ensureLoaded = () => this.getSnapshot().phase === 'ready' && this.getSnapshot().state !== 'error' ? Promise.resolve() : this.refresh()
  assertAvailable = id => { if (this.deletedIds.includes(id)) throw new Error(tr("Чат удалён.")) }
  open = async id => { this.assertAvailable(id); return this.uiWorkspace.openSession(id) }
  getArchiveSnapshot = () => this.workspaces.list.getSnapshot()
  subscribeArchive = listener => this.workspaces.list.subscribe(listener)
  archive = id => this.uiWorkspace.archiveSession(id)
  restore = async id => { this.assertAvailable(id); return this.uiWorkspace.unarchiveSession(id) }
  remove = async id => {
    await this.uiWorkspace.archiveSession(id)
    const ids = await call('history-remove', { id })
    this.revision++; this.cache.clear(); this.publishDeleted(ids)
  }
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
  dispose() { this.revision++; this.cache.clear(); this.listeners.clear() }
}

/** Flatten all campaigns, retain ordinary forks, omit agent children and blanks. */
export function historyRows(snapshot, query = '', archivedSessionIds = [], archivedOnly = false, limit = Infinity, options = {}) {
  const needle = query.trim().toLocaleLowerCase(formatLocale())
  const archived = new Set(archivedSessionIds)
  const rows = []
  const order = (a, b) => (options.sort === 'oldest' ? a.updatedAt - b.updatedAt
    : options.sort === 'title-asc' ? a.title.localeCompare(b.title, formatLocale())
    : options.sort === 'title-desc' ? b.title.localeCompare(a.title, 'ru')
    : b.updatedAt - a.updatedAt) || a.id.localeCompare(b.id)
  for (const id of snapshot.ids) {
    const row = snapshot.byId[id]
    if (!row || row.origin === 'subagent' || (row.blank && !row.title?.trim())) continue
    if (options.status !== 'all' && archived.has(id) !== archivedOnly) continue
    const current = row.retainedBy?.mainView > 0
    if (options.kind === 'current' && !current || options.kind === 'branches' && !row.parentId
      || options.kind === 'originals' && row.parentId || options.kind === 'running' && !row.running) continue
    if (options.since !== undefined && row.updatedAt < options.since) continue
    const title = row.title?.trim() || tr("Чат без названия")
    if (needle && !`${title}\n${id}`.toLocaleLowerCase(formatLocale()).includes(needle)) continue
    rows.push({ id, title, updatedAt: row.updatedAt, current, archived: archived.has(id) })
    if (Number.isFinite(limit)) { rows.sort(order); if (rows.length > limit) rows.pop() }
  }
  return Number.isFinite(limit) ? rows : rows.sort(order)
}
