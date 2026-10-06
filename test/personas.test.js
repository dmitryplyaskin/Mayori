import test from 'node:test'
import assert from 'node:assert/strict'
import { RemotePersonaProvider, RemoteCharacterChatProvider } from '../src/personas.js'

function transport(t, handler) {
  const previous = globalThis.fetch
  globalThis.fetch = async (url, options) => ({ ok: true, json: async () => handler(url.split('/').at(-1), JSON.parse(options.body)) })
  t.after(() => { globalThis.fetch = previous })
}

test('persona browser provider observes Host snapshots and releases subscriptions', async t => {
  let catalog = { personas: [], defaultId: null }
  transport(t, (endpoint, payload) => {
    if (endpoint === 'persona-save') { catalog = { ...catalog, personas: [{ ...payload, id: 'alex' }] }; return { ok: true, value: catalog.personas[0] } }
    if (endpoint === 'persona-default') catalog = { ...catalog, defaultId: payload.id }
    if (endpoint === 'persona-remove') catalog = { personas: [], defaultId: null }
    return { ok: true, value: catalog }
  })
  const provider = new RemotePersonaProvider()
  let notices = 0
  const unsubscribe = provider.subscribe(() => notices++)
  await provider.refresh()
  await provider.save({ name: 'Alex' })
  await provider.setDefault('alex')
  assert.equal(provider.getSnapshot().defaultId, 'alex')
  assert.equal(provider.getSnapshot().personas[0].name, 'Alex')
  unsubscribe()
  const before = notices
  await provider.remove('alex')
  assert.equal(provider.getSnapshot().personas.length, 0)
  assert.equal(notices, before)
})

test('stale chat reads cannot overwrite a committed swipe, and double submissions are rejected', async t => {
  let releaseRead, releaseSwipe
  const oldRead = new Promise(resolve => { releaseRead = resolve })
  const swipe = new Promise(resolve => { releaseSwipe = resolve })
  const seen = []
  transport(t, async (endpoint, payload) => {
    seen.push([endpoint, payload])
    return { ok: true, value: await (endpoint === 'session-state' ? oldRead : swipe) }
  })
  const provider = new RemoteCharacterChatProvider('session-1')
  const pendingRead = provider.refresh()
  const pendingSwipe = provider.swipe(1)
  await assert.rejects(provider.swipe(2), /Дождитесь/)
  await provider.refresh()
  releaseSwipe({ greeting: { index: 1, text: 'New opening' } })
  await pendingSwipe
  releaseRead({ greeting: { index: 0, text: 'Old opening' } })
  await pendingRead
  assert.equal(provider.getSnapshot().value.greeting.index, 1)
  assert.deepEqual(seen.map(value => value[0]), ['session-state', 'swipe'])
  assert.equal(seen[1][1].sessionId, 'session-1')
})

test('failed changes reconcile Host state and retain an actionable error', async t => {
  transport(t, endpoint => endpoint === 'swipe'
    ? { ok: false, error: 'Приветствие можно менять только до первого хода игрока.' }
    : { ok: true, value: { greeting: { index: 0, canSwipe: false } } })
  const provider = new RemoteCharacterChatProvider('session-1')
  await assert.rejects(provider.swipe(1), /первого хода/)
  assert.equal(provider.getSnapshot().value.greeting.canSwipe, false)
  assert.match(provider.getSnapshot().error, /первого хода/)
})
