/** History capability backed by the durable DSH session catalog and archive. */
export class ChatHistoryService {
  getSnapshot() { throw new Error('ChatHistoryService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('ChatHistoryService.subscribe() is not implemented') }
  refresh() { throw new Error('ChatHistoryService.refresh() is not implemented') }
  open() { throw new Error('ChatHistoryService.open() is not implemented') }
  getArchiveSnapshot() { throw new Error('ChatHistoryService.getArchiveSnapshot() is not implemented') }
  subscribeArchive() { throw new Error('ChatHistoryService.subscribeArchive() is not implemented') }
  archive() { throw new Error('ChatHistoryService.archive() is not implemented') }
  restore() { throw new Error('ChatHistoryService.restore() is not implemented') }
}

/** No second persistence store: DSH owns catalog refresh and chat restoration. */
export class SessionChatHistoryProvider extends ChatHistoryService {
  constructor(sessions, uiWorkspace, workspaces) {
    super()
    this.sessions = sessions
    this.uiWorkspace = uiWorkspace
    this.workspaces = workspaces
  }

  getSnapshot = () => this.sessions.list.getSnapshot()
  subscribe = listener => this.sessions.list.subscribe(listener)
  refresh = () => this.sessions.refresh()
  open = id => this.uiWorkspace.openSession(id)
  getArchiveSnapshot = () => this.workspaces.list.getSnapshot()
  subscribeArchive = listener => this.workspaces.list.subscribe(listener)
  archive = id => this.uiWorkspace.archiveSession(id)
  restore = id => this.uiWorkspace.unarchiveSession(id)
}

/** Flatten all campaigns, retain ordinary forks, omit agent children and blanks. */
export function historyRows(snapshot, query = '', archivedSessionIds = [], archivedOnly = false) {
  const needle = query.trim().toLocaleLowerCase('ru')
  const archived = new Set(archivedSessionIds)
  return snapshot.ids.flatMap(id => {
    const row = snapshot.byId[id]
    if (!row || row.origin === 'subagent' || (row.blank && !row.title?.trim())) return []
    if (archived.has(id) !== archivedOnly) return []
    const title = row.title?.trim() || 'Чат без названия'
    if (needle && !`${title}\n${id}`.toLocaleLowerCase('ru').includes(needle)) return []
    return [{ id, title, updatedAt: row.updatedAt, current: row.retainedBy?.mainView > 0 }]
  }).sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id))
}
