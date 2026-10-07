import test from 'node:test'
import assert from 'node:assert/strict'
import { RemotePersonaProvider } from '../../../src/features/personas/client/personas.js'

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
