import assert from 'node:assert/strict'
import test from 'node:test'
import { startCharacterSession } from '../../../src/features/character-session/client/start.js'

function harness(workspace = true) {
  const calls = []
  const services = {
    sessions: {
      list: { getSnapshot: () => ({ ids: ['current'], byId: { current: { id: 'current', retainedBy: { mainView: 1 } } } }) },
      create: async input => { calls.push(['create', input]); return 'new' },
      async using(id, options, callback) {
        calls.push(['retain', id, options])
        try {
          return await callback({ ready: Promise.resolve({ session: {
            rename: async title => { calls.push(['rename', title]); return { ok: true } },
          } }) })
        } finally { calls.push(['release', id]) }
      },
    },
    workspaces: {
      list: { getSnapshot: () => ({ items: workspace ? [{ workspaceId: 'campaign', sessionIds: ['current'] }] : [] }) },
      create: async input => { calls.push(['workspace', input]); return { workspaceId: 'default' } },
    },
    uiWorkspace: { openSession: id => { calls.push(['open', id]) } },
    library: {
      prepareCampaign: async () => { calls.push(['prepare']); return { path: '/campaigns/default' } },
      start: async (card, workspaceId, index) => { calls.push(['start', card, workspaceId, index]); return { sessionId: 'new' } },
    },
  }
  return { calls, services }
}

test('retains and awaits the new session, selects the NPC, names and opens it before releasing', async () => {
  const h = harness()
  assert.equal(await startCharacterSession(h.services, { id: 'aster', name: 'Aster' }), 'new')
  assert.deepEqual(h.calls, [
    ['start', 'aster', 'campaign', 0], ['create', { workspaceId: 'campaign', sessionId: 'new' }], ['retain', 'new', { source: 'mayoriGallery' }],
    ['rename', 'Aster'], ['open', 'new'], ['release', 'new'],
  ])
})

test('prepares and registers a campaign automatically when there is no workspace', async () => {
  const h = harness(false)
  await startCharacterSession(h.services, { id: 'aster', name: 'Aster' })
  assert.deepEqual(h.calls.slice(0, 4), [
    ['prepare'], ['workspace', { path: '/campaigns/default' }], ['start', 'aster', 'default', 0], ['create', { workspaceId: 'default', sessionId: 'new' }],
  ])
})

test('selection failure releases the temporary reference and does not navigate', async () => {
  const h = harness()
  h.services.library.start = async () => { throw new Error('storage unavailable') }
  await assert.rejects(startCharacterSession(h.services, { id: 'aster', name: 'Aster' }), /storage unavailable/)
  assert.equal(h.calls.some(([action]) => action === 'create'), false)
  assert.equal(h.calls.some(([action]) => action === 'open'), false)
})

test('passes the chosen greeting to the Host before opening the conversation', async () => {
  const h = harness()
  h.services.library.start = async (...args) => { h.calls.push(['start', ...args]); return { sessionId: 'new' } }
  await startCharacterSession(h.services, { id: 'aster', name: 'Aster' }, 2)
  assert.deepEqual(h.calls.find(call => call[0] === 'start'), ['start', 'aster', 'campaign', 2])
  assert.ok(h.calls.findIndex(call => call[0] === 'start') < h.calls.findIndex(call => call[0] === 'open'))
})

test('history opening is awaited before selection', async () => {
  const h = harness()
  h.services.sessions.using = async (_id, _options, callback) => callback({ ready: Promise.reject(new Error('history unavailable')) })
  await assert.rejects(startCharacterSession(h.services, { id: 'aster', name: 'Aster' }), /history unavailable/)
  assert.deepEqual(h.calls, [['start', 'aster', 'campaign', 0], ['create', { workspaceId: 'campaign', sessionId: 'new' }]])
})

test('with no main-view reference, uses a registered workspace without the retired current or recent fields', async () => {
  const h = harness()
  h.services.sessions.list.getSnapshot = () => ({ ids: [], byId: {} })
  await startCharacterSession(h.services, { id: 'aster', name: 'Aster' })
  assert.deepEqual(h.calls[0], ['start', 'aster', 'campaign', 0])
})

test('a new-chat command keeps its source workspace even if navigation has changed', async () => {
  const h = harness()
  h.services.workspaces.list.getSnapshot = () => ({ items: [
    { workspaceId: 'campaign', sessionIds: ['current'] }, { workspaceId: 'source-campaign', sessionIds: ['source'] },
  ] })
  await startCharacterSession({ ...h.services, sourceSessionId: 'source' }, { id: 'aster', name: 'Aster' })
  assert.deepEqual(h.calls[0], ['start', 'aster', 'source-campaign', 0])
  assert.deepEqual(h.calls[1], ['create', { workspaceId: 'source-campaign', sessionId: 'new' }])
})
