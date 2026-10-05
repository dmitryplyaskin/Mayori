import assert from 'node:assert/strict'
import test from 'node:test'
import { startCharacterSession } from '../src/play-character.js'

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
      play: async (card, id) => { calls.push(['play', card, id]) },
    },
  }
  return { calls, services }
}

test('retains and awaits the new session, selects the NPC, names and opens it before releasing', async () => {
  const h = harness()
  assert.equal(await startCharacterSession(h.services, { id: 'aster', name: 'Aster' }), 'new')
  assert.deepEqual(h.calls, [
    ['create', { workspaceId: 'campaign' }], ['retain', 'new', { source: 'mayoriGallery' }],
    ['play', 'aster', 'new'], ['rename', 'Aster'], ['open', 'new'], ['release', 'new'],
  ])
})

test('prepares and registers a campaign automatically when there is no workspace', async () => {
  const h = harness(false)
  await startCharacterSession(h.services, { id: 'aster', name: 'Aster' })
  assert.deepEqual(h.calls.slice(0, 3), [
    ['prepare'], ['workspace', { path: '/campaigns/default' }], ['create', { workspaceId: 'default' }],
  ])
})

test('selection failure releases the temporary reference and does not navigate', async () => {
  const h = harness()
  h.services.library.play = async () => { throw new Error('storage unavailable') }
  await assert.rejects(startCharacterSession(h.services, { id: 'aster', name: 'Aster' }), /storage unavailable/)
  assert.deepEqual(h.calls.at(-1), ['release', 'new'])
  assert.equal(h.calls.some(([action]) => action === 'open'), false)
})

test('history opening is awaited before selection', async () => {
  const h = harness()
  h.services.sessions.using = async (_id, _options, callback) => callback({ ready: Promise.reject(new Error('history unavailable')) })
  await assert.rejects(startCharacterSession(h.services, { id: 'aster', name: 'Aster' }), /history unavailable/)
  assert.deepEqual(h.calls, [['create', { workspaceId: 'campaign' }]])
})

test('with no main-view reference, uses a registered workspace without the retired current or recent fields', async () => {
  const h = harness()
  h.services.sessions.list.getSnapshot = () => ({ ids: [], byId: {} })
  await startCharacterSession(h.services, { id: 'aster', name: 'Aster' })
  assert.deepEqual(h.calls[0], ['create', { workspaceId: 'campaign' }])
})
