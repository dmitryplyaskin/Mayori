import assert from 'node:assert/strict'
import test from 'node:test'
import { startCharacterSession } from '../../../src/features/character-session/client/start.js'

function harness() {
  const calls = []
  const services = {
    sessions: {
      list: { getSnapshot: () => ({ byId: { new: { id: 'new' } } }) },
      create: async () => { assert.fail('DSH create would replace the seeded chat with a blank session') },
      refresh: async () => { calls.push(['refresh']) },
      async using(id, options, callback) {
        calls.push(['retain', id, options])
        try {
          return await callback({ ready: Promise.resolve({ session: {
            rename: async title => { calls.push(['rename', title]); return { ok: true } },
          } }) })
        } finally { calls.push(['release', id]) }
      },
    },
    uiWorkspace: { openSession: id => { calls.push(['open', id]) } },
    library: {
      start: async (...args) => { calls.push(['start', ...args]); return { sessionId: 'new' } },
    },
  }
  return { calls, services }
}

test('opens the exact seeded session through retention without creating a replacement blank', async () => {
  const h = harness()
  assert.equal(await startCharacterSession(h.services, { id: 'aster', name: 'Aster' }), 'new')
  assert.deepEqual(h.calls, [
    ['start', 'aster', 0], ['refresh'], ['retain', 'new', { source: 'mayoriGallery' }],
    ['rename', 'Aster'], ['open', 'new'], ['release', 'new'],
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
  assert.deepEqual(h.calls.find(call => call[0] === 'start'), ['start', 'aster', 2])
  assert.ok(h.calls.findIndex(call => call[0] === 'start') < h.calls.findIndex(call => call[0] === 'open'))
})

test('history opening is awaited before selection', async () => {
  const h = harness()
  h.services.sessions.using = async (_id, _options, callback) => callback({ ready: Promise.reject(new Error('history unavailable')) })
  await assert.rejects(startCharacterSession(h.services, { id: 'aster', name: 'Aster' }), /history unavailable/)
  assert.deepEqual(h.calls, [['start', 'aster', 0], ['refresh']])
})

test('a catalog refresh failure leaves navigation unchanged and does not retain an unknown session', async () => {
  const h = harness()
  h.services.sessions.refresh = async () => { throw new Error('catalog unavailable') }
  await assert.rejects(startCharacterSession(h.services, { id: 'aster', name: 'Aster' }), /catalog unavailable/)
  assert.deepEqual(h.calls, [['start', 'aster', 0]])
})
