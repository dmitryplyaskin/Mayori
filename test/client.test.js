import assert from 'node:assert/strict'
import test from 'node:test'

async function loadBuiltClient() {
  let handoff
  const previousWindow = globalThis.window
  globalThis.window = {
    __ModuleLoader__: {
      load(value) { handoff = value },
    },
  }
  try {
    await import(`../lib/client.js?test=${String(Date.now())}-${Math.random()}`)
    const required = []
    const exports = handoff.factory((id) => {
      required.push(id)
      if (id === 'react') return {
        useEffect() {}, useMemo(factory) { return factory() }, useRef(value) { return { current: value } },
        useState(value) { return [typeof value === 'function' ? value() : value, () => {}] },
        useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot() },
      }
      if (id === 'react/jsx-runtime') return { Fragment: Symbol('Fragment'), jsx() {}, jsxs() {} }
      throw new Error(`unexpected client runtime module: ${id}`)
    })
    return { handoff, exports, required }
  } finally {
    if (previousWindow === undefined) Reflect.deleteProperty(globalThis, 'window')
    else globalThis.window = previousWindow
  }
}

test('registers reversible Mayori client contributions', async () => {
  const { exports: client } = await loadBuiltClient()
  let appended
  let removed = false
  let dispose
  let provided
  let slotInjection
  const previousDocument = globalThis.document
  globalThis.document = {
    createElement(name) {
      assert.equal(name, 'style')
      return {
        dataset: {},
        textContent: '',
        remove() { removed = true },
      }
    },
    head: {
      appendChild(node) { appended = node },
    },
  }

  try {
    client.apply({
      provide(name, service) {
        provided = { name, service }
      },
      effect(factory, label) {
        assert.equal(label, 'mayori: client styles')
        dispose = factory()
      },
      slots: {
        inject(name, callback) {
          slotInjection = { name, callback }
        },
      },
    })

    assert.equal(provided.name, 'mayoriCharacters')
    assert.equal(typeof provided.service.importFiles, 'function')
    assert.equal(slotInjection.name, 'sidebar.footer.action')
    assert.equal(appended.dataset.plugin, 'dsh-mayori')
    assert.equal(appended.dataset.mayori, 'client')
    assert.equal(appended.textContent, client.BRAND_STYLE)
    assert.match(appended.textContent, /content: "Mayori"/)
    dispose()
    assert.equal(removed, true)
  } finally {
    if (previousDocument === undefined) Reflect.deleteProperty(globalThis, 'document')
    else globalThis.document = previousDocument
  }
})

test('built client artifact registers a lazy DSH module factory', async () => {
  const { handoff, exports, required } = await loadBuiltClient()
  assert.equal(handoff.id, 'dsh-mayori')
  assert.equal(typeof exports.apply, 'function')
  assert.deepEqual(exports.inject, ['slots'])
  assert.deepEqual(required.sort(), ['react', 'react/jsx-runtime'])
})
