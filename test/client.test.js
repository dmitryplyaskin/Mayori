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
      if (id === 'react-dom') return { createPortal(value) { return value } }
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
  let slotRegistration
  let toggles = 0
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
      layout: {
        toggleSidebar() { toggles += 1 },
      },
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
        register(options, component) {
          slotRegistration = { options, component }
          return () => {}
        },
      },
    })

    assert.equal(provided.name, 'mayoriCharacters')
    assert.equal(typeof provided.service.importFiles, 'function')
    assert.equal(slotInjection.name, 'sidebar.workspaces')
    slotInjection.callback()
    assert.equal(slotRegistration.options.name, 'sidebar.workspaces')
    assert.equal(slotRegistration.options.priority, -100)
    assert.equal(typeof slotRegistration.component, 'function')
    const sidebar = slotRegistration.options.inject()
    assert.equal(sidebar.library, provided.service)
    sidebar.toggleSidebar()
    assert.equal(toggles, 1)
    assert.equal(appended.dataset.plugin, 'dsh-mayori')
    assert.equal(appended.dataset.mayori, 'client')
    assert.equal(appended.textContent, client.BRAND_STYLE)
    assert.match(appended.textContent, /\.mayori-sidebar/)
    assert.match(appended.textContent, /\.mayori-brand-engine/)
    assert.match(appended.textContent, /block-size: 42px/)
    assert.match(appended.textContent, /inline-size: 16px; block-size: 16px/)
    assert.match(appended.textContent, /inline-size: 18px; block-size: 18px/)
    assert.match(appended.textContent, /margin-inline: -2px; overflow-x: hidden; overflow-y: auto/)
    assert.doesNotMatch(appended.textContent, /mayori-gallery-trigger:active/)
    assert.doesNotMatch(appended.textContent, /viewBox="0 0 182 24"/)
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
  assert.deepEqual(exports.inject, ['slots', 'layout'])
  assert.deepEqual(required.sort(), ['react', 'react-dom', 'react/jsx-runtime'])
})
