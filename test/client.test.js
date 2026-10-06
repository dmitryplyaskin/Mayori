import assert from 'node:assert/strict'
import test from 'node:test'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'

async function loadBuiltClient(runtime = {}) {
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
      if (id === 'react') return runtime.react ?? {
        useId() { return 'avatar-title' },
        useEffect() {}, useMemo(factory) { return factory() }, useRef(value) { return { current: value } },
        useState(value) { return [typeof value === 'function' ? value() : value, () => {}] },
        useSyncExternalStore(_subscribe, getSnapshot) { return getSnapshot() },
      }
      if (id === 'react/jsx-runtime') return runtime.jsx ?? { Fragment: Symbol('Fragment'), jsx() {}, jsxs() {} }
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
  const provided = {}
  const slotInjections = []
  const registrations = []
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
        provided[name] = service
      },
      effect(factory, label) {
        if (label === 'mayori: client styles') dispose = factory()
        else { assert.ok(['mayori: greeting renderer', 'mayori: trajectory context', 'mayori: trajectory header'].includes(label)); return factory() }
      },
      slots: {
        subscribe() { return () => {} },
        entries(name) { return (name === 'conversation.chat.node' ? ['assistant-step', 'user', 'steering', 'turn-tail'] : [null]).map(key => ({ options: name === 'conversation.view' ? { id: 'trajectory', label: 'Trajectory', order: 10 } : { key }, locale: 'chat', component() {}, inject: () => ({ hooks: { presentation: 'stock-presentation' } }) })) },
        inject(name, callback) {
          slotInjections.push({ name, callback })
        },
        register(options, component) {
          registrations.push({ options, component })
          return () => {}
        },
      },
    })

    assert.equal(typeof provided.mayoriCharacters.importFiles, 'function')
    assert.deepEqual(slotInjections.map(item => item.name), [
      'sidebar.brand.mark', 'sidebar.brand.name', 'conversation.hero.brand.mark', 'sidebar.workspaces',
      'main', 'main', 'main', 'sidebar.panellist', 'sidebar.panellist', 'sidebar.panellist', 'conversation.chat.node', 'conversation.view', 'conversation.session.header',
    ])
    for (const slot of slotInjections) slot.callback()
    const slotRegistration = registrations.find(item => item.options.name === 'sidebar.workspaces')
    assert.equal(slotRegistration.options.name, 'sidebar.workspaces')
    assert.equal(slotRegistration.options.priority, -100)
    assert.equal(typeof slotRegistration.component, 'function')
    const sidebar = registrations.find(item => item.options.key === 'mayori-characters').options.inject()
    assert.equal(registrations.find(item => item.options.key === 'mayori-history').options.inject().history, provided.mayoriHistory)
    assert.deepEqual(registrations.filter(item => item.options.name === 'sidebar.panellist').map(item => [item.options.id, item.options.label]), [['mayori-characters', 'Персонажи'], ['mayori-history', 'История чатов'], ['mayori-personas', 'Персоны']])
    assert.equal(registrations.find(item => item.options.key === 'mayori-personas').options.inject().personas, provided.mayoriPersonas)
    const greeting = registrations.find(item => item.options.name === 'conversation.chat.node')
    assert.equal(greeting.options.priority, -100)
    assert.equal(greeting.options.locale, 'chat')
    assert.equal(greeting.options.inject().hooks.presentation, 'stock-presentation')
    assert.deepEqual(registrations.filter(item => item.options.name === 'conversation.chat.node').map(item => item.options.key), ['assistant-step', 'user', 'steering', 'turn-tail'])
    const trajectory = registrations.find(item => item.options.id === 'trajectory')
    assert.equal(trajectory.options.priority, -100)
    assert.equal(trajectory.options.label, 'Trajectory')
    assert.equal(trajectory.options.inject().contextFor('test-session'), provided.mayoriTrajectoryContext.forSession('test-session'))
    assert.equal(sidebar.library, provided.mayoriCharacters)
    provided.mayoriCharacters.start = async (characterId, workspaceId) => { played.push([characterId, workspaceId]); return { sessionId: 'character-session' } }
    await sidebar.startCharacter({ id: 'a'.repeat(64), name: 'Aster' })
    assert.deepEqual(created, [{ workspaceId: 'campaign', sessionId: 'character-session' }])
    assert.deepEqual(played, [['a'.repeat(64), 'campaign']])
    assert.deepEqual(renamed, [['character-session', 'Aster']])
    assert.deepEqual(opened, ['character-session'])
    assert.equal(appended.dataset.plugin, 'dsh-mayori')
    assert.equal(appended.dataset.mayori, 'client')
    assert.equal(appended.textContent, client.BRAND_STYLE)
    assert.match(appended.textContent, /\.mayori-history-panel/)
    assert.doesNotMatch(appended.textContent, /\.mayori-brand-engine/)
    assert.match(appended.textContent, /block-size: 42px/)
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

test('built message wrappers place portraits on each side and retain native content and image seats', async () => {
  const { exports: client } = await loadBuiltClient({ react: React, jsx: jsxRuntime })
  const registrations = []
  const previousDocument = globalThis.document
  globalThis.document = { createElement: () => ({ dataset: {}, remove() {} }), head: { appendChild() {} } }
  try {
    client.apply({ sessions: {}, workspaces: {}, uiWorkspace: {}, provide() {}, effect: factory => factory(),
      slots: { inject(name, factory) { if (name === 'conversation.chat.node') factory() }, subscribe: () => () => {},
        entries: name => name === 'conversation.chat.node' ? ['assistant-step', 'user', 'steering', 'turn-tail'].map(key => ({ options: { key },
          children: { 'message.detail': { kind: 'single', scope: 'session' } },
          component: props => React.createElement('p', null, props.node.data.text, props.renderSlot('message.detail')),
        })) : [], register(options, component) { registrations.push({ options, component }); return () => {} },
      },
    })
    const value = { character: { name: 'Aster', image: 'data:image/png;base64,Y2hhcg==' },
      persona: { name: 'Alex', avatar: 'data:image/png;base64,dXNlcg==' } }
    const chat = { getSnapshot: () => ({ value, status: 'ready' }), subscribe: () => () => {} }
    for (const key of ['assistant-step', 'user', 'steering']) {
      const renderer = registrations.find(item => item.options.key === key)
      const called = []
      const html = renderToStaticMarkup(React.createElement(renderer.component, {
        ...renderer.options.inject(), sessionId: 'session', chatFor: () => chat,
        node: { kind: key, data: { turn: 2, text: 'Native message and attachments' } },
        renderSlot: name => { called.push(name); return React.createElement('span', null, 'native images') },
      }))
      const image = key === 'assistant-step' ? value.character.image : value.persona.avatar
      assert.ok(html.includes(image))
      assert.match(html, /Native message and attachments/)
      assert.match(html, /native images/)
      assert.equal(called[0], `mayori.greeting.${key}.message.detail`)
      assert.match(html, /aria-haspopup="dialog"/)
      assert.doesNotMatch(html, /<dialog/, 'Closed avatars do not embed dialog images inside message rows')
      const avatarAt = html.indexOf('mayori-message-avatar')
      const messageAt = html.indexOf('mayori-message-content')
      assert.equal(avatarAt < messageAt, key === 'assistant-step')
    }
    value.persona.avatar = ''
    const renderer = registrations.find(item => item.options.key === 'user')
    const html = renderToStaticMarkup(React.createElement(renderer.component, {
      ...renderer.options.inject(), sessionId: 'session', chatFor: () => chat,
      node: { kind: 'user', data: { text: 'No portrait' } }, renderSlot: () => null,
    }))
    assert.match(html, /Открыть аватар: Alex/)
    assert.match(html, /aria-hidden="true">A<\/span>/)
    assert.doesNotMatch(html, /<img/)
    delete value.character
    const plain = renderToStaticMarkup(React.createElement(renderer.component, {
      ...renderer.options.inject(), sessionId: 'session', chatFor: () => chat,
      node: { kind: 'user', data: { text: 'Ordinary chat' } }, renderSlot: () => null,
    }))
    assert.match(plain, /Ordinary chat/)
    assert.doesNotMatch(plain, /mayori-message-avatar/)
  } finally { globalThis.document = previousDocument }
})

test('built client artifact registers a lazy DSH module factory', async () => {
  const { handoff, exports, required } = await loadBuiltClient()
  assert.equal(handoff.id, 'dsh-mayori')
  assert.equal(typeof exports.apply, 'function')
  assert.deepEqual(exports.inject, ['slots', 'sessions', 'workspaces', 'uiWorkspace'])
  assert.deepEqual(required.sort(), ['react', 'react-dom', 'react/jsx-runtime'])
})
