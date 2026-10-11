import assert from 'node:assert/strict'
import test from 'node:test'
import { historyRows, SessionChatHistoryProvider } from '../../../src/features/history/client/history.js'
import { branchRows } from '../../../src/features/message-revisions/domain/revisions.js'

function catalog(...rows) {
  return { phase: 'ready', ids: rows.map(row => row.id), byId: Object.fromEntries(rows.map(row => [row.id, row])) }
}

test('status, branch, selection, running and time filters combine before sorting and pagination', () => {
  const snapshot = catalog(
    { id: 'a', title: 'Астра', updatedAt: 10, running: true },
    { id: 'b', title: 'Бор', updatedAt: 20, parentId: 'a', retainedBy: { mainView: 1 } },
    { id: 'c', title: 'Яр', updatedAt: 30, parentId: 'a' },
    { id: 'd', title: 'Астра', updatedAt: 10 },
  )
  const rows = options => historyRows(snapshot, '', ['c'], false, Infinity, options).map(row => row.id)
  assert.deepEqual(rows({ status: 'all' }), ['c', 'b', 'a', 'd'])
  assert.deepEqual(rows({ kind: 'branches' }), ['b'])
  assert.deepEqual(rows({ status: 'all', kind: 'branches', since: 25 }), ['c'])
  assert.deepEqual(rows({ kind: 'originals' }), ['a', 'd'])
  assert.deepEqual(rows({ kind: 'current' }), ['b'])
  assert.deepEqual(rows({ kind: 'running' }), ['a'])
  assert.deepEqual(rows({ sort: 'oldest' }), ['a', 'd', 'b'])
  assert.deepEqual(rows({ status: 'all', sort: 'title-asc' }), ['a', 'd', 'b', 'c'])
  assert.deepEqual(rows({ status: 'all', sort: 'title-desc' }), ['c', 'b', 'a', 'd'])
  assert.equal(historyRows(snapshot, '', ['c'], false, Infinity, { status: 'all' })[0].archived, true)
})

test('deleted chats disappear from home and both history views after restart, and cannot reopen or restore', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  let ids = []
  globalThis.fetch = async (url, options) => ({ ok: true, json: async () => {
    if (url.endsWith('history-remove')) ids = [...ids, JSON.parse(options.body).id]
    return { ok: true, value: ids }
  } })
  const snapshot = catalog({ id: 'gone', title: 'Removed', updatedAt: 2 }, { id: 'keep', title: 'Kept', updatedAt: 1 })
  const sessions = { list: { getSnapshot: () => snapshot, subscribe: () => () => {} }, refresh: async () => {} }
  const archived = []
  const ui = { archiveSession: async (...args) => archived.push(args), openSession() { throw Error('must not open') }, unarchiveSession() { throw Error('must not restore') } }
  const provider = new SessionChatHistoryProvider(sessions, ui)
  assert.deepEqual(provider.getSnapshot().ids, [], 'wait for deletion membership before exposing any rows')
  await provider.ensureLoaded()
  await provider.remove('gone')
  assert.deepEqual(archived, [['gone']])
  assert.deepEqual(provider.getSnapshot().ids, ['keep'])
  assert.equal(provider.getSnapshot(), provider.getSnapshot(), 'observable snapshot is stable')
  await assert.rejects(provider.open('gone'), /удалён/)
  await assert.rejects(provider.restore('gone'), /удалён/)
  const reopened = new SessionChatHistoryProvider(sessions, ui)
  await reopened.ensureLoaded()
  assert.deepEqual(historyRows(reopened.getSnapshot(), '', ['gone'], true), [])
  assert.deepEqual(historyRows(reopened.getSnapshot(), '', ['gone'], false, 5).map(row => row.id), ['keep'])
  provider.publishDeleted([])
  assert.deepEqual(provider.getSnapshot().ids, ['keep'], 'late pre-deletion list cannot resurrect a chat')
})

test('branch navigation omits deleted roots and keeps sibling branches and their lineage', () => {
  const provider = new SessionChatHistoryProvider({ list: { getSnapshot: () => catalog(
    { id: 'root', title: 'Original', updatedAt: 1 },
    { id: 'b', title: 'First', parentId: 'root', updatedAt: 2 },
    { id: 'c', title: 'Second', parentId: 'root', updatedAt: 3 },
  ) } })
  provider.publishDeleted(['root'])
  assert.deepEqual(branchRows(provider.getSnapshot(), 'c'), [
    { id: 'b', label: 'Ветка 1 · First' }, { id: 'c', label: 'Ветка 2 · Second' },
  ])
})

test('native deletion admission refusal leaves the list untouched and skips deletion endpoint', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  globalThis.fetch = async () => { throw Error('must not call transport') }
  const snapshot = catalog({ id: 'busy', updatedAt: 1 })
  const failure = Object.assign(Error('active'), { rpcError: { code: 'workspace/session-active' } })
  const provider = new SessionChatHistoryProvider({ list: { getSnapshot: () => snapshot } }, { archiveSession: async () => { throw failure } })
  provider.publishDeleted([])
  await assert.rejects(provider.remove('busy'), error => error === failure)
  assert.deepEqual(provider.getSnapshot().ids, ['busy'])
})

test('preview browser cache shares requests and explicit refresh rejects old cache writes', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  let calls = 0, finishOld
  globalThis.fetch = async url => ({ ok: true, json: async () => {
    if (url.endsWith('history-deleted')) return { ok: true, value: [] }
    if (++calls === 1) return new Promise(resolve => { finishOld = resolve })
    return { ok: true, value: { chat: { preview: 'Fresh' } } }
  } })
  const provider = new SessionChatHistoryProvider({ list: { getSnapshot: () => catalog({ id: 'chat', updatedAt: 1 }) }, refresh: async () => {} })
  const old = provider.details(['chat']), duplicate = provider.details(['chat'])
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(calls, 1)
  await provider.refresh()
  assert.equal((await provider.details(['chat'])).chat.preview, 'Fresh')
  finishOld({ ok: true, value: { chat: { preview: 'Old' } } })
  await Promise.all([old, duplicate])
  assert.equal((await provider.details(['chat'])).chat.preview, 'Fresh')
  assert.equal(calls, 2)
  provider.dispose()
  assert.equal(provider.cache.bytes, 0)
})

test('history spans directories, preserves forks and excludes provisional blanks and agent children', () => {
  const snapshot = catalog(
    { id: 'old', title: 'Лес', updatedAt: 1, cwd: '/one' },
    { id: 'fork', parentId: 'old', title: 'Другая тропа', updatedAt: 5, cwd: '/two' },
    { id: 'agent', origin: 'subagent', updatedAt: 8 },
    { id: 'blank', blank: true, updatedAt: 9 },
    { id: 'selected', blank: true, title: 'Астра', updatedAt: 10, retainedBy: { mainView: 1 } },
  )
  snapshot.byId.retainedOnly = { id: 'retainedOnly', updatedAt: 99 }
  assert.deepEqual(historyRows(snapshot).map(row => row.id), ['selected', 'fork', 'old'])
  assert.equal(historyRows(snapshot)[0].current, true)
  assert.deepEqual(snapshot.ids, ['old', 'fork', 'agent', 'blank', 'selected'])
})

test('history searches titles and ids without exposing project path fallback', () => {
  const snapshot = catalog({ id: 'session-42', displayTitle: 'secret-project', updatedAt: 1 }, { id: 'a', title: 'АСТРА', updatedAt: 2 })
  assert.equal(historyRows(snapshot, ' астра ')[0].id, 'a')
  assert.equal(historyRows(snapshot, '42')[0].title, 'Чат без названия')
  assert.deepEqual(historyRows(snapshot, 'secret-project'), [])
  assert.deepEqual(historyRows(snapshot, 'missing'), [])
})

test('home top-five selection matches complete history ordering without retaining every row', () => {
  const snapshot = catalog(...Array.from({ length: 1000 }, (_, index) => ({ id: `row-${index}`, title: `Chat ${index}`, updatedAt: index % 37 })))
  assert.deepEqual(historyRows(snapshot, '', [], false, 5), historyRows(snapshot).slice(0, 5))
})

test('provider observes DSH updates, refreshes persisted catalog and opens the same id', async t => {
  const previous = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ ok: true, value: [] }) })
  t.after(() => { globalThis.fetch = previous })
  let snapshot = catalog()
  const listeners = new Set()
  const opened = []
  const provider = new SessionChatHistoryProvider({
    list: { getSnapshot: () => snapshot, subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) } },
    async refresh() { snapshot = catalog({ id: 'persisted', title: 'Из прошлого запуска', updatedAt: 1 }); listeners.forEach(listener => listener()) },
  }, { openSession: id => opened.push(id) })
  let updates = 0
  const unsubscribe = provider.subscribe(() => updates++)
  await provider.refresh()
  assert.equal(updates, 2)
  assert.deepEqual(provider.getSnapshot().ids, snapshot.ids)
  await provider.open(historyRows(provider.getSnapshot())[0].id)
  assert.deepEqual(opened, ['persisted'])
  unsubscribe()
  assert.equal(listeners.size, 0)
})

test('provider propagates catalog failures for the retry UI', async t => {
  const previous = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ ok: true, value: [] }) })
  t.after(() => { globalThis.fetch = previous })
  const provider = new SessionChatHistoryProvider({ refresh: async () => { throw new Error('offline') } }, {})
  await assert.rejects(provider.refresh(), /offline/)
})

test('archive membership splits history and archive while preserving search and forks', () => {
  const snapshot = catalog(
    { id: 'active', title: 'Астра', updatedAt: 1 },
    { id: 'archived', title: 'Астра — лес', parentId: 'active', updatedAt: 2 },
  )
  assert.deepEqual(historyRows(snapshot, '', ['archived']).map(row => row.id), ['active'])
  assert.deepEqual(historyRows(snapshot, 'ЛЕС', ['archived'], true).map(row => row.id), ['archived'])
  assert.deepEqual(historyRows(snapshot, 'missing', ['archived'], true), [])
  assert.deepEqual(historyRows(snapshot, '', [], true), [])
})

test('archive and restoration use native navigation and observe Host archive updates', async () => {
  const snapshot = catalog({ id: 'chat', title: 'Чат', updatedAt: 1 })
  let archiveSnapshot = { phase: 'ready', archivedSessionIds: [] }
  const listeners = new Set()
  const commands = []
  const workspaces = { list: {
    getSnapshot: () => archiveSnapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
  } }
  const update = ids => {
    archiveSnapshot = { phase: 'ready', archivedSessionIds: ids }
    listeners.forEach(listener => listener())
  }
  const provider = new SessionChatHistoryProvider({ list: { getSnapshot: () => snapshot } }, {
    async archiveSession(...args) { commands.push(['archive', ...args]); update([args[0]]) },
    async unarchiveSession(...args) { commands.push(['restore', ...args]); update([]) },
  }, workspaces)
  let notifications = 0
  const unsubscribe = provider.subscribeArchive(() => notifications++)
  await provider.archive('chat')
  assert.deepEqual(historyRows(snapshot, '', provider.getArchiveSnapshot().archivedSessionIds), [])
  // A fresh consumer reads the Host-owned archive, not a browser-local hidden set.
  const reopened = new SessionChatHistoryProvider({}, {}, workspaces)
  assert.deepEqual(reopened.getArchiveSnapshot().archivedSessionIds, ['chat'])
  await provider.restore('chat')
  assert.equal(historyRows(snapshot, '', provider.getArchiveSnapshot().archivedSessionIds)[0].id, 'chat')
  assert.deepEqual(commands, [['archive', 'chat'], ['restore', 'chat']])
  assert.equal(notifications, 2)
  unsubscribe()
  assert.equal(listeners.size, 0)
})

test('archive refusal keeps membership and preserves the native active-work error', async () => {
  const failure = Object.assign(new Error('active'), { rpcError: { code: 'workspace/session-active' } })
  const state = { phase: 'ready', archivedSessionIds: [] }
  const provider = new SessionChatHistoryProvider({}, {
    async archiveSession(id, options) {
      assert.equal(id, 'running')
      assert.equal(options, undefined, 'never force-stop running work')
      throw failure
    },
    async unarchiveSession() { throw new Error('offline') },
  }, { list: { getSnapshot: () => state } })
  await assert.rejects(provider.archive('running'), error => error === failure)
  assert.deepEqual(provider.getArchiveSnapshot().archivedSessionIds, [])
  await assert.rejects(provider.restore('archived'), /offline/)
})
