import assert from 'node:assert/strict'
import test from 'node:test'
import { RemoteCharacterLibraryProvider } from '../../../src/features/characters/client/library.js'

const settle = () => new Promise(resolve => setImmediate(resolve))
function transport(t, handler) {
  const previous = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, json: async () => handler() })
  t.after(() => { globalThis.fetch = previous })
}

test('reopening the gallery retries a failed load and shares one request across subscribers', async t => {
  let calls = 0
  const cards = [{ id: 'saved', name: 'Saved character' }]
  transport(t, async () => {
    calls++
    return calls === 1 ? { ok: false, error: 'Temporary outage' } : { ok: true, value: { cards } }
  })
  const library = new RemoteCharacterLibraryProvider()
  const first = library.subscribe(() => {})
  await settle()
  assert.equal(library.getSnapshot().status, 'error')
  first()
  const second = library.subscribe(() => {})
  const third = library.subscribe(() => {})
  await settle()
  assert.equal(calls, 2)
  assert.deepEqual(library.getSnapshot().cards, cards)
  assert.equal(library.getSnapshot().error, null)
  second(); third()
})

test('explicit gallery retries expose errors and ignore stale responses', async t => {
  let finishOld
  let calls = 0
  transport(t, () => {
    calls++
    if (calls === 1) return new Promise(resolve => { finishOld = resolve })
    if (calls === 2) return { ok: false, error: 'Still offline' }
    return { ok: true, value: { cards: [{ id: 'new' }] } }
  })
  const library = new RemoteCharacterLibraryProvider()
  const old = library.refresh()
  await assert.rejects(library.refresh(), /Still offline/)
  await library.refresh()
  finishOld({ ok: true, value: { cards: [{ id: 'old' }] } })
  await old
  assert.equal(library.getSnapshot().status, 'ready')
  assert.deepEqual(library.getSnapshot().cards, [{ id: 'new' }])
})
