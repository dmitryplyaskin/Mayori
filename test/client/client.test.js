import assert from 'node:assert/strict'
import test from 'node:test'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { Context } from '@deepseek-ai/cordis'
import { CryptoDiceProvider } from '../../src/features/dice/host/provider.js'

async function loadBuiltClient(runtime = {}) {
  let handoff
  const previousWindow = globalThis.window
  globalThis.window = {
    __ModuleLoader__: {
      load(value) { handoff = value },
    },
  }
  try {
    await import(`../../lib/client.js?test=${String(Date.now())}-${Math.random()}`)
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
      if (id === '@deepseek-ai/dsh-client-ui-primitives') return runtime.primitives ?? {
        Menu({ anchor }) { return anchor },
        IconChevronDownOutlineRegular() { return null },
      }
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
  const commands = []
  const commandDisposers = []
  const dismissed = []
  const unregistered = []
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
      commandUi: { register(command) { commands.push(command); return () => unregistered.push(command.name) }, dismiss(name) { dismissed.push(name) } },
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
        else if (label === 'mayori: chat command') commandDisposers.push(factory())
        else { assert.ok(['mayori: composer presentation', 'mayori: greeting renderer', 'mayori: trajectory context', 'mayori: trajectory header', 'mayori: home conversation', 'mayori: home navigation', 'mayori: catalog requests', 'mayori: session provider caches', 'mayori: history cache'].includes(label)); return factory() }
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
    assert.deepEqual(commands.map(command => [command.name, command.label(), command.ui.kind]), [
      ['preset', 'Сменить пресет', 'popupSelect'], ['persona', 'Сменить персону', 'popupSelect'],
      ['new', 'Новый чат', 'action'],
    ])
    for (const disposeCommand of commandDisposers) disposeCommand()
    assert.deepEqual(dismissed, ['preset', 'persona', 'new'])
    assert.deepEqual(unregistered, ['preset', 'persona', 'new'])
    assert.deepEqual(slotInjections.map(item => item.name), [
      'conversation.chat.assistant-actions', 'conversation.input.permission', 'conversation.composer.bar',
      'sidebar.footer.action',
      'tool.call.toolview', 'tool.call.toolview',
      'sidebar.brand.mark', 'sidebar.brand.name', 'conversation.hero.brand.mark', 'sidebar.workspaces', 'sidebar', 'shell.leading',
      'main', 'sidebar.panellist', 'main.conversation', 'main', 'main', 'main', 'main', 'sidebar.panellist', 'sidebar.panellist', 'sidebar.panellist', 'sidebar.panellist', 'conversation.chat.node', 'conversation.view', 'conversation.session.header',
    ])
    for (const slot of slotInjections) slot.callback()
    assert.equal(registrations.some(item => item.options.name === 'settings.section'), false)
    const settings = registrations.find(item => item.options.id === 'mayori-settings')
    assert.equal(settings.options.name, 'sidebar.footer.action')
    assert.equal(typeof settings.options.inject().preferences.update, 'function')
    assert.equal(registrations.find(item => item.options.name === 'tool.call.toolview').options.key, 'rollDice')
    assert.deepEqual(registrations.filter(item => item.options.name === 'tool.call.toolview').map(item => item.options.key), ['rollDice', 'resolveCheck'])
    const slotRegistration = registrations.find(item => item.options.name === 'sidebar.workspaces')
    assert.equal(slotRegistration.options.name, 'sidebar.workspaces')
    assert.equal(slotRegistration.options.priority, -100)
    assert.equal(typeof slotRegistration.component, 'function')
    const sidebar = registrations.find(item => item.options.key === 'mayori-characters').options.inject()
    assert.equal(registrations.find(item => item.options.key === 'mayori-history').options.inject().history, provided.mayoriHistory)
    assert.deepEqual(registrations.filter(item => item.options.name === 'sidebar.panellist').map(item => [item.options.id, item.options.label]), [['mayori-home', 'Главная'], ['mayori-characters', 'Персонажи'], ['mayori-history', 'История чатов'], ['mayori-personas', 'Персоны'], ['mayori-presets', 'Пресеты']])
    assert.equal(registrations.find(item => item.options.key === 'mayori-presets').options.inject().presets, provided.mayoriPresets)
    assert.equal(registrations.find(item => item.options.key === 'mayori-presets').options.inject().presetFor('session'), provided.mayoriSessionPresets.forSession('session'))
    assert.equal(registrations.find(item => item.options.key === 'mayori-home').options.inject().history, provided.mayoriHistory)
    assert.equal(registrations.find(item => item.options.name === 'main.conversation').options.priority, -100)
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
    assert.ok(appended.textContent.startsWith(client.BRAND_STYLE))
    assert.ok(appended.textContent.includes('.mayori-plugin-row'))
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
    client.apply({ commandUi: { register: () => () => {}, dismiss() {} }, sessions: {}, workspaces: {}, uiWorkspace: {}, provide() {}, effect: factory => factory(),
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
        node: { kind: key, data: { turn: 2, text: 'Native message and attachments', blocks: [{ kind: 'text', text: 'Native message and attachments' }] } },
        renderSlot: name => { called.push(name); return React.createElement('span', null, 'native images') },
      }))
      const image = key === 'assistant-step' ? value.character.image : value.persona.avatar
      assert.ok(html.includes(image))
      assert.match(html, /Native message and attachments/)
      assert.match(html, /native images/)
      assert.equal(called[0], `mayori.greeting.${key}.message.detail`)
      assert.match(html, /aria-haspopup="dialog"/)
      assert.equal((html.match(/class="mayori-message-avatar"/g) ?? []).length, 1)
      assert.doesNotMatch(html, /<dialog/, 'Closed avatars do not embed dialog images inside message rows')
      const avatarAt = html.indexOf('mayori-message-avatar')
      const messageAt = html.indexOf('mayori-message-content')
      assert.equal(avatarAt < messageAt, key === 'assistant-step')
    }
    const assistant = registrations.find(item => item.options.key === 'assistant-step')
    const renderAssistant = (blocks, groupPart, status = 'settled') => renderToStaticMarkup(React.createElement(assistant.component, {
      ...assistant.options.inject(), sessionId: 'session', chatFor: () => chat, groupPart,
      node: { kind: 'assistant-step', data: { turn: 2, step: 2, blocks, status, text: 'Native process or response' } },
      renderSlot: () => null,
    }))
    const mixed = [{ kind: 'reasoning', text: 'Think' }, { kind: 'text', text: 'Final reply' }]
    for (const status of ['running', 'settled', 'interrupted']) {
      const process = renderAssistant(mixed, 'reasoning', status)
      const response = renderAssistant(mixed, 'response', status)
      assert.match(process, /Native process or response/, 'Reasoning retains its stock renderer')
      assert.doesNotMatch(process, /mayori-message/, 'Split reasoning must not get a second portrait or gutter')
      assert.equal((response.match(/class="mayori-message-avatar"/g) ?? []).length, 1)
      assert.equal((renderAssistant(mixed, undefined, status).match(/class="mayori-message-avatar"/g) ?? []).length, 1)
    }
    for (const blocks of [[], [{ kind: 'text', text: '  ' }], [{ kind: 'reasoning', text: 'Think' }],
      [{ kind: 'tool-call' }], [{ kind: 'reasoning', text: 'Think' }, { kind: 'tool-call' }]]) {
      assert.doesNotMatch(renderAssistant(blocks, undefined), /mayori-message/)
      assert.doesNotMatch(renderAssistant(blocks, 'response'), /mayori-message/)
    }
    assert.match(renderAssistant([{ kind: 'image', attachment: 'image' }], 'response'), /mayori-message-avatar/)
    const renderGreeting = () => renderToStaticMarkup(React.createElement(assistant.component, {
      ...assistant.options.inject(), sessionId: 'session', chatFor: () => chat, groupPart: 'response',
      node: { kind: 'assistant-step', data: { turn: 1, step: 1, finalNode: { messageId: 'greeting' },
        blocks: [{ kind: 'text', text: 'Historical greeting' }] } },
      useSession: selector => selector({ pendingSubmissions: [] }),
      useChat: selector => selector({ timeline: { turnOrder: [1] } }), renderSlot: () => null,
    }))
    value.greeting = { messageId: 'greeting', text: '  ', count: 2, index: 1, canSwipe: true }
    assert.doesNotMatch(renderGreeting(), /mayori-message-avatar/, 'An empty selected opening must not retain the old portrait row')
    value.greeting.text = 'Selected greeting'
    assert.equal((renderGreeting().match(/class="mayori-message-avatar"/g) ?? []).length, 1)
    delete value.greeting
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
  assert.deepEqual(exports.inject, ['slots', 'sessions', 'workspaces', 'uiWorkspace', 'layout', 'commandUi'])
  assert.deepEqual(required.sort(), ['@deepseek-ai/dsh-client-ui-primitives', 'react', 'react-dom', 'react/jsx-runtime'])
})

test('dice card renders recorded totals, purpose, selection and discarded faces with native controls', async () => {
  const { exports: client } = await loadBuiltClient({ react: React, jsx: jsxRuntime })
  const value = { schemaVersion: 1, purpose: 'Проверка скрытности', values: { stealth: 21 }, details: [{
    path: ['stealth'], expression: '2d20kh1 + 4', value: 21,
    dice: [{ sides: 20, results: [8, 17], keep: { mode: 'highest', count: 1 }, keptIndices: [1] }],
  }] }
  const block = { kind: 'tool-result', call: { argsRaw: '{}' }, content: [{ type: 'text', text: JSON.stringify(value) }], isError: false }
  const props = { phase: 'result', block, useDisclosure: () => ({ expanded: true, toggle() {} }), inspect() {} }
  const html = renderToStaticMarkup(React.createElement(client.DiceToolCard, props))
  assert.match(html, /data-state="ok"/)
  assert.match(html, /Проверка скрытности/)
  assert.match(html, /2d20kh1 \+ 4/)
  assert.match(html, /Итог: <\/span>21/)
  assert.match(html, /<s class="mayori-dice-face mayori-dice-dropped">.*Отброшен:.*8<\/s>/)
  assert.match(html, /Учтён: <\/span>17/)
  assert.match(html, /<button[^>]+type="button"[^>]+aria-expanded="true"[^>]+aria-controls=/)
  assert.match(html, /В журнал/)
  assert.match(html, /<summary>Показать исходный результат<\/summary>/)
  const compact = renderToStaticMarkup(React.createElement(client.DiceToolCard, { ...props, useDisclosure: () => ({ expanded: false, toggle() {} }) }))
  assert.match(compact, /Итог: <\/span>21/)
  assert.doesNotMatch(compact, /mayori-dice-face /)
  assert.match(compact, /На d20: <bdi>17<\/bdi>/)
  const { details, ...summary } = value
  const compactResult = { ...block, content: [{ type: 'text', text: JSON.stringify(summary) }], meta: { kind: 'mayori-dice', result: value } }
  const fromMetadata = renderToStaticMarkup(React.createElement(client.DiceToolCard, { ...props, block: compactResult }))
  assert.match(fromMetadata, /data-state="ok"/)
  assert.match(fromMetadata, /Итог: <\/span>21/)
  assert.match(fromMetadata, /Отброшен:.*8<\/s>/)
  const missingMetadata = renderToStaticMarkup(React.createElement(client.DiceToolCard, { ...props, block: { ...compactResult, meta: undefined } }))
  assert.match(missingMetadata, /Исходный результат/)
  assert.doesNotMatch(missingMetadata, /mayori-dice-total/)
})

test('dice version 2 card shows valid totals beside errors, boolean outcomes, references and reroll causes', async t => {
  const { exports: client } = await loadBuiltClient({ react: React, jsx: jsxRuntime })
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  const faces = [17, 1, 6, 2, 2]
  new CryptoDiceProvider(ctx, {}, () => faces.shift())
  const value = ctx.mayoriDice.roll({ attack: 'd20', hit: '$attack >= 15', damage: 'if($hit,d6ro<3!,0)', missed: 'false', bad: 'd6!!' })
  const { details, ...compact } = value
  const html = renderToStaticMarkup(React.createElement(client.DiceToolCard, {
    phase: 'result', block: { content: [{ type: 'text', text: JSON.stringify(compact) }], meta: { kind: 'mayori-dice', result: value } },
    useDisclosure: () => ({ expanded: true, toggle() {} }),
  }))
  assert.match(html, /Есть ошибки/)
  assert.match(html, /Итог: <\/span>17/)
  assert.match(html, /Итог: <\/span>Да/)
  assert.match(html, /Итог: <\/span>Нет/)
  assert.match(html, /Итог: <\/span>8/)
  assert.match(html, /title="Переброс"/)
  assert.match(html, /title="Взрыв"/)
  assert.match(html, /Использовано:/)
  assert.match(html, /Выполнена ветка «тогда»/)
  assert.match(html, /Остальные результаты сохранены/)
  assert.equal(faces.length, 0)
})

test('dice card supports pending, failed, interrupted, historical and future-format results without invented totals', async () => {
  const { exports: client } = await loadBuiltClient({ react: React, jsx: jsxRuntime })
  const render = (phase, block) => renderToStaticMarkup(React.createElement(client.DiceToolCard, {
    phase, block, useDisclosure: () => ({ expanded: true, toggle() {} }),
  }))
  const preparing = render('preparing', { args: { textPrefix: () => 'Подкрасться' } })
  assert.match(preparing, /Готовится бросок/)
  assert.match(preparing, /Подкрасться/)
  assert.doesNotMatch(preparing, /mayori-dice-total/)
  assert.match(render('start', { argsRaw: '{}' }), /Бросаем кубики/)
  const failed = render('result', { isError: true, content: [{ type: 'text', text: 'Error: invalid expression' }] })
  assert.match(failed, /Не удалось вычислить/)
  assert.match(failed, /Error: invalid expression/)
  assert.doesNotMatch(failed, /mayori-dice-total/)
  assert.match(render('result', { isError: true, error: { code: 'ABORTED' }, content: [] }), /Бросок прерван/)
  const legacy = { values: [4], details: [{ path: [0], expression: 'd6', dice: [{ sides: 6, results: [4] }], value: 4 }] }
  assert.match(render('result', { content: [{ type: 'text', text: JSON.stringify(legacy) }] }), /Итог: <\/span>4/)
  legacy.schemaVersion = 3
  const future = render('result', { content: [{ type: 'text', text: JSON.stringify(legacy) }] })
  assert.match(future, /Исходный результат/)
  assert.doesNotMatch(future, /mayori-dice-total/)
})

test('dice card preserves error traces, escapes authored text and folds long dice groups', async () => {
  const { exports: client } = await loadBuiltClient({ react: React, jsx: jsxRuntime })
  const failed = { schemaVersion: 1, purpose: '<script>bad</script>', values: null,
    error: { path: ['damage'], message: 'Division by zero' }, details: [{ path: ['damage'],
      expression: '30d6 / (d6 - 1)', dice: [{ sides: 6, results: Array(30).fill(3) }, { sides: 6, results: [1] }], error: 'Division by zero' }] }
  const html = renderToStaticMarkup(React.createElement(client.DiceToolCard, { phase: 'result',
    block: { content: [{ type: 'text', text: JSON.stringify(failed) }] }, useDisclosure: () => ({ expanded: true, toggle() {} }),
  }))
  assert.match(html, /data-state="error"/)
  assert.match(html, /Деление на ноль\. Проверьте знаменатель\./)
  assert.match(html, /Вычисление остановлено/)
  assert.match(html, /Показать все грани \(30\)/)
  assert.equal((html.match(/class="mayori-dice-face"/g) ?? []).length, 25)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;/)
})

test('sidebar omits New Session while preserving home, panels, toggle, settings and teardown', async () => {
  const { exports: client } = await loadBuiltClient({ react: React, jsx: jsxRuntime })
  const selected = []
  let created = 0
  let available = false
  let renderer
  const disposeNavigation = []
  let leading
  let disposals = 0
  const listeners = new Map()
  const startSession = () => { created++ }
  let toggled = 0
  const toggleSidebar = () => { toggled++ }
  const stock = { options: {}, locale: 'sidebar', store: { sidebar: true },
    children: Object.fromEntries(['sidebar.brand.name', 'sidebar.brand.mark', 'sidebar.toggle.badge',
      'sidebar.panellist', 'sidebar.workspaces', 'sidebar.settings', 'sidebar.footer.action'].map(name => [name, { kind: 'single', scope: 'root' }])),
    component() {}, inject: () => ({ startSession, toggleSidebar, selectPanel: id => selected.push(id), hooks: { panels: 'stock panels' } }) }
  const previousDocument = globalThis.document
  globalThis.document = { createElement: () => ({ dataset: {}, remove() {} }), head: { appendChild() {} } }
  try {
    client.apply({ commandUi: { register: () => () => {}, dismiss() {} }, sessions: {}, workspaces: {}, uiWorkspace: {}, layout: { selectPanel: id => selected.push(id) }, provide() {},
      effect(factory, label) { const dispose = factory(); if (label === 'mayori: home navigation') disposeNavigation.push(dispose) },
      slots: {
        inject(name, factory) { if (['sidebar', 'shell.leading'].includes(name)) factory() },
        entries: name => available ? name === 'sidebar' ? [stock] : name === 'shell.leading' ? [{ ...stock, children: {} }] : [] : [],
        subscribe(name, listener) { listeners.set(name, listener); return () => { listeners.delete(name) } },
        register(options, component) { if (options.name === 'sidebar') renderer = { options, component }; if (options.name === 'shell.leading') leading = { options, component }; return () => { disposals++ } },
      },
    })
    assert.equal(renderer, undefined, 'Wait for the native shell rather than installing an incomplete replacement')
    available = true
    listeners.get('sidebar')()
    listeners.get('shell.leading')()
    assert.equal(renderer.options.store, stock.store)
    assert.equal(renderer.options.locale, stock.locale)
    assert.ok(renderer.options.children['mayori.navigation.sidebar.sidebar.brand.name'])
    const props = renderer.options.inject()
    const rendered = []
    const componentProps = { ...props, collapsed: false, width: 280,
      usePanels: selector => selector([{ id: 'mayori-home', label: 'Главная' }]),
      usePanelInfo: selector => selector({ activePanelId: 'mayori-home' }),
      useShortcuts: selector => selector([{ id: 'sidebar.left.toggle', aria: 'Control+b' }]),
      t: key => key,
      renderSlot: (name, owner, options) => { rendered.push({ name, owner, options }); return React.createElement('span', null, name) },
    }
    const element = renderer.component(componentProps)
    assert.equal(element.props.style.width, 280)
    assert.equal(props.hooks.panels, 'stock panels')
    const headerButtons = element.props.children[0].props.children
    headerButtons[0].props.onClick()
    assert.deepEqual(selected, ['mayori-home'])
    assert.equal(created, 0, 'Brand/Home navigation must not create or reuse a Session')
    headerButtons[1].props.onClick()
    assert.equal(toggled, 1)
    assert.equal(headerButtons[1].props['aria-keyshortcuts'], 'Control+b')
    const panel = element.props.children[1].props.children[0]
    panel.type(panel.props).props.onClick()
    assert.deepEqual(selected, ['mayori-home', 'mayori-home'])
    assert.ok(rendered.some(row => row.name === 'mayori.navigation.sidebar.sidebar.brand.name'))
    assert.ok(rendered.some(row => row.name === 'mayori.navigation.sidebar.sidebar.settings' && row.owner.wide))
    assert.ok(rendered.some(row => row.name === 'mayori.navigation.sidebar.sidebar.panellist' && row.options.only === 'mayori-home'))
    for (const collapsed of [false, true]) {
      const html = renderToStaticMarkup(React.createElement(renderer.component, { ...componentProps, collapsed }))
      assert.doesNotMatch(html, /New Session|session\.new|newSession/)
      assert.match(html, /aria-current="page"/)
      assert.match(html, /mayori\.navigation\.sidebar\.sidebar\.settings/)
      assert.match(html, /mayori\.navigation\.sidebar\.sidebar\.footer\.action/)
    }
    const leadingElement = leading.component({ ...componentProps, ...leading.options.inject() })
    assert.doesNotMatch(renderToStaticMarkup(leadingElement), /New Session|session\.new/)
    assert.equal(leadingElement.props['aria-label'], 'toggle.open')
    leadingElement.props.onClick()
    assert.equal(toggled, 2)
    assert.equal(stock.inject().startSession, startSession, 'Original injections remain untouched')
    for (const dispose of disposeNavigation) dispose()
    assert.equal(listeners.size, 0)
    assert.equal(disposals, 2)
  } finally { globalThis.document = previousDocument }
})

test('empty conversation shows home while named empty chats and existing sessions retain native content', async () => {
  const { exports: client } = await loadBuiltClient({ react: React, jsx: jsxRuntime })
  let renderer
  const previousDocument = globalThis.document
  globalThis.document = { createElement: () => ({ dataset: {}, remove() {} }), head: { appendChild() {} } }
  try {
    client.apply({ commandUi: { register: () => () => {}, dismiss() {} }, sessions: {}, workspaces: {}, uiWorkspace: {}, provide() {}, effect: factory => factory(),
      slots: { inject(name, factory) { if (name === 'main.conversation') factory() }, subscribe: () => () => {},
        entries: name => name === 'main.conversation' ? [{ options: {}, children: { 'conversation.header': { kind: 'single', scope: 'session-maybe' } },
          component: props => React.createElement('div', null, 'Native conversation', props.renderSlot('conversation.header'), React.createElement('textarea')) }] : [],
        register(options, component) { if (options.name === 'main.conversation') renderer = { options, component }; return () => {} },
      },
    })
    const props = { ...renderer.options.inject(),
      history: { getSnapshot: () => ({ phase: 'ready', ids: [], byId: {} }), subscribe: () => () => {},
        getArchiveSnapshot: () => ({ phase: 'ready', archivedSessionIds: [] }), subscribeArchive: () => () => {} },
      library: { getSnapshot: () => ({ status: 'ready', cards: [] }), subscribe: () => () => {} },
      personas: { getSnapshot: () => ({ personas: [] }), subscribe: () => () => {} },
      useSessions: selector => selector({ byId: { blank: { blank: true }, named: { blank: true, title: 'NPC without greeting' }, played: { blank: false } } }),
      renderSlot: name => React.createElement('span', null, name),
    }
    for (const sessionId of [undefined, 'blank']) {
      const html = renderToStaticMarkup(React.createElement(renderer.component, { ...props, sessionId }))
      assert.match(html, /Добро пожаловать в Mayori/)
      assert.match(html, /Перейти в историю чатов/)
      assert.doesNotMatch(html, /textarea|Native conversation/)
    }
    for (const sessionId of ['named', 'played']) {
      const html = renderToStaticMarkup(React.createElement(renderer.component, { ...props, sessionId }))
      assert.match(html, /Native conversation/)
      assert.match(html, /textarea/)
      assert.match(html, /mayori.home.conversation.conversation.header/)
      assert.doesNotMatch(html, /Добро пожаловать/)
    }
  } finally { globalThis.document = previousDocument }
})
