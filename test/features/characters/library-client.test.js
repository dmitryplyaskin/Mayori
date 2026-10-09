import assert from 'node:assert/strict'
import test from 'node:test'
import { RemoteCharacterLibraryProvider } from '../../../src/features/characters/client/library.js'

const settle = () => new Promise(resolve => setImmediate(resolve))
function transport(t, handler) {
  const previous = globalThis.fetch
  globalThis.fetch = async () => ({ ok: true, json: async () => handler() })
  t.after(() => { globalThis.fetch = previous })
}

test('index polling resumes after leaving and reopening a partially indexed catalog', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  let calls = 0
  transport(t, () => ({ ok: true, value: { cards: [], indexing: ++calls === 1 } }))
  const library = new RemoteCharacterLibraryProvider()
  const first = library.subscribe(() => {})
  await settle()
  assert.equal(library.getSnapshot().indexing, true)
  first()
  t.mock.timers.tick(1000)
  await settle()
  assert.equal(calls, 1)
  const second = library.subscribe(() => {})
  t.mock.timers.tick(400)
  await settle()
  assert.equal(calls, 2)
  assert.equal(library.getSnapshot().indexing, false)
  second(); library.dispose()
})

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

test('imports read only the current small batch before uploading it', async t => {
  const events = [], previous = globalThis.fetch
  globalThis.fetch = async (_url, request) => {
    const endpoint = _url.split('/').at(-1)
    events.push(endpoint)
    return { ok: true, json: async () => ({ ok: true, value: endpoint === 'import' ? { imported: JSON.parse(request.body).files.length, rejected: [] } : { cards: [] } }) }
  }
  t.after(() => { globalThis.fetch = previous })
  const files = Array.from({ length: 5 }, (_, index) => ({ name: `${index}.json`, type: 'application/json', size: 2,
    arrayBuffer: async () => { events.push(`read${index}`); return new Uint8Array([123, 125]).buffer } }))
  const provider = new RemoteCharacterLibraryProvider()
  assert.equal((await provider.importFiles(files)).imported, 5)
  assert.deepEqual(events.slice(0, 10), ['list', 'read0', 'read1', 'import', 'read2', 'read3', 'import', 'read4', 'import', 'list'])
  provider.dispose()
})
