import test from 'node:test'
import assert from 'node:assert/strict'
import { RemoteCharacterChatProvider } from '../../../src/features/character-session/client/chat.js'

function transport(t, handler) {
  const previous = globalThis.fetch
  globalThis.fetch = async (url, options) => ({ ok: true, json: async () => handler(url.split('/').at(-1), JSON.parse(options.body)) })
  t.after(() => { globalThis.fetch = previous })
}

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
