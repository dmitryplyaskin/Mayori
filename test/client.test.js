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
  const slotInjections = []
  let slotRegistration
  const opened = []
  const created = []
  const renamed = []
  const played = []
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
      sessions: {
        list: { getSnapshot: () => ({ ids: ['old-session'], byId: { 'old-session': { id: 'old-session', retainedBy: { mainView: 1 } } } }) },
        async create(input) { created.push(input); return 'character-session' },
        async using(id, _options, operation) {
          return operation({ ready: Promise.resolve({ session: {
            rename: async title => { renamed.push([id, title]); return { ok: true } },
          } }) })
        },
      },
      uiWorkspace: { openSession(id) { opened.push(id) } },
      workspaces: {
        list: { getSnapshot: () => ({ recentWorkspaceId: 'recent', items: [{ workspaceId: 'campaign', sessionIds: ['old-session'] }] }) },
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
          slotInjections.push({ name, callback })
        },
        register(options, component) {
          slotRegistration = { options, component }
          return () => {}
        },
      },
    })

    assert.equal(provided.name, 'mayoriCharacters')
    assert.equal(typeof provided.service.importFiles, 'function')
    assert.deepEqual(slotInjections.map(item => item.name), [
      'sidebar.brand.mark', 'sidebar.brand.name', 'conversation.hero.brand.mark', 'sidebar.workspaces',
    ])
    for (const slot of slotInjections) slot.callback()
    assert.equal(slotRegistration.options.name, 'sidebar.workspaces')
    assert.equal(slotRegistration.options.priority, -100)
    assert.equal(typeof slotRegistration.component, 'function')
    const sidebar = slotRegistration.options.inject()
    assert.equal(sidebar.library, provided.service)
    provided.service.play = async (characterId, sessionId) => { played.push([characterId, sessionId]) }
    await sidebar.startCharacter({ id: 'a'.repeat(64), name: 'Aster' })
    assert.deepEqual(created, [{ workspaceId: 'campaign' }])
    assert.deepEqual(played, [['a'.repeat(64), 'character-session']])
    assert.deepEqual(renamed, [['character-session', 'Aster']])
    assert.deepEqual(opened, ['character-session'])
    assert.equal(appended.dataset.plugin, 'dsh-mayori')
    assert.equal(appended.dataset.mayori, 'client')
    assert.equal(appended.textContent, client.BRAND_STYLE)
    assert.match(appended.textContent, /\.mayori-sidebar/)
    assert.doesNotMatch(appended.textContent, /\.mayori-brand-engine/)
    assert.match(appended.textContent, /block-size: 42px/)
    assert.match(appended.textContent, /inline-size: 16px; block-size: 16px/)
    assert.match(appended.textContent, /inline-size: 18px; block-size: 18px/)
    assert.match(appended.textContent, /margin-inline: -2px; overflow-x: hidden; overflow-y: auto/)
    assert.doesNotMatch(appended.textContent, /mayori-gallery-trigger:active/)
    assert.doesNotMatch(appended.textContent, /viewBox="0 0 182 24"/)
    assert.doesNotMatch(appended.textContent, /nth-child/)
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
  assert.deepEqual(exports.inject, ['slots', 'sessions', 'workspaces', 'uiWorkspace'])
  assert.deepEqual(required.sort(), ['react', 'react-dom', 'react/jsx-runtime'])
})
