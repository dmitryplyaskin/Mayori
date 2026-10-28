import assert from 'node:assert/strict'
import test from 'node:test'
import { usePreparedSession } from '../../src/client/infrastructure/prepared-session.js'

test('a Host-created branch joins a fresh catalog request after a stale in-flight refresh', async () => {
  let refreshes = 0, snapshot = { byId: {} }
  const calls = []
  const sessions = {
    list: { getSnapshot: () => snapshot },
    async refresh() { if (++refreshes === 2) snapshot = { byId: { child: { id: 'child' } } } },
    async using(id, options, operation) {
      assert.ok(snapshot.byId[id], 'The native catalog must know the id before retention')
      calls.push(options.source)
      try { return await operation({ ready: Promise.resolve({ session: { id } }) }) }
      finally { calls.push('released') }
    },
  }
  const result = await usePreparedSession(sessions, 'child', 'mayoriRevisions', binding => {
    calls.push(binding.session.id)
    return 'opened'
  })
  assert.equal(result, 'opened')
  assert.equal(refreshes, 2)
  assert.deepEqual(calls, ['mayoriRevisions', 'child', 'released'])
})

test('a catalog refresh failure prevents acquiring or opening a different session', async () => {
  const error = new Error('Disconnected')
  const sessions = { refresh: async () => { throw error }, using() { assert.fail('Do not navigate after failed discovery') } }
  await assert.rejects(usePreparedSession(sessions, 'child', 'mayoriGallery', () => assert.fail('Do not open')), error)
})
