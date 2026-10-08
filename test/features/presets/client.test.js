import test from 'node:test'
import assert from 'node:assert/strict'
import { RemoteRoleplayPresetProvider, RemoteSessionPresetProvider } from '../../../src/features/presets/client/presets.js'

function transport(t, handler) {
  const previous = globalThis.fetch
  globalThis.fetch = async (url, options) => ({ ok: true, json: async () => handler(url.split('/').at(-1), JSON.parse(options.body)) })
  t.after(() => { globalThis.fetch = previous })
}

test('browser catalog consumes Host persistence and releases subscriptions', async t => {
  let value = { presets: [], defaultId: null }
  transport(t, (endpoint, payload) => {
    if (endpoint === 'preset-save') { value.presets = [{ ...payload, id: 'custom' }]; return { ok: true, value: value.presets[0] } }
    if (endpoint === 'preset-default') value.defaultId = payload.id
    if (endpoint === 'preset-remove') value = { presets: [], defaultId: null }
    return { ok: true, value }
  })
  const provider = new RemoteRoleplayPresetProvider()
  let notices = 0
  const unsubscribe = provider.subscribe(() => notices++)
  await provider.refresh()
  await provider.save({ name: 'Custom', instructions: 'Instructions' })
  await provider.setDefault('custom')
  assert.equal(provider.getSnapshot().defaultId, 'custom')
  unsubscribe()
  const before = notices
  await provider.remove('custom')
  assert.equal(provider.getSnapshot().presets.length, 0)
  assert.equal(notices, before)
})

test('a stale read cannot replace the chosen preset and failed selection restores Host state', async t => {
  let finishRead
  let reading = true
  let failing = false
  const selected = { id: 'custom', name: 'Custom', instructions: 'Instructions' }
  transport(t, async (endpoint, payload) => {
    assert.equal(payload.sessionId, 'chat')
    if (endpoint === 'session-preset-state' && reading) {
      reading = false
      return new Promise(resolve => { finishRead = () => resolve({ ok: true, value: { preset: null } }) })
    }
    if (endpoint === 'session-preset' && failing) return { ok: false, error: 'Дождитесь завершения ответа.' }
    return { ok: true, value: { preset: selected } }
  })
  const provider = new RemoteSessionPresetProvider('chat')
  const read = provider.refresh()
  await provider.select('custom')
  finishRead(); await read
  assert.deepEqual(provider.getSnapshot().preset, selected)
  failing = true
  await assert.rejects(provider.select(null), /Дождитесь/)
  assert.deepEqual(provider.getSnapshot().preset, selected)
  assert.equal(provider.getSnapshot().status, 'ready')
  assert.ok(provider.getSnapshot().error)
})
