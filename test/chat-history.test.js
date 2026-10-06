import assert from 'node:assert/strict'
import test from 'node:test'
import { historyRows, SessionChatHistoryProvider } from '../src/chat-history.js'

function catalog(...rows) {
  return { phase: 'ready', ids: rows.map(row => row.id), byId: Object.fromEntries(rows.map(row => [row.id, row])) }
}

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

test('provider observes DSH updates, refreshes persisted catalog and opens the same id', async () => {
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
  assert.equal(updates, 1)
  assert.equal(provider.getSnapshot(), snapshot)
  provider.open(historyRows(provider.getSnapshot())[0].id)
  assert.deepEqual(opened, ['persisted'])
  unsubscribe()
  assert.equal(listeners.size, 0)
})

test('provider propagates catalog failures for the retry UI', async () => {
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
