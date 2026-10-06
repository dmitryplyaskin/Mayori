import assert from 'node:assert/strict'
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt, { renderPrompt, joinContextSections } from '@deepseek-ai/dsh-system-prompt'
import { Session } from '@deepseek-ai/dsh-session'
import {
  FileSystemCharacterSessionStore, PersistentCharacterSessionProvider,
  buildCharacterContext,
  greetingSeed,
} from '../src/character-play-host.js'

const CARD_ID = 'a'.repeat(64)
const card = {
  id: CARD_ID, spec: 'chara_card_v3', specVersion: '3.0', name: 'Aster',
  data: { name: 'Aster', description: 'A patient archivist.', first_mes: 'You came back.',
    extensions: { hidden: 'must not enter model context' } },
}

async function harness(t) {
  const root = await mkdtemp(join(tmpdir(), 'mayori-campaigns-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const contexts = []
  const variables = new Map()
  const listeners = new Map()
  const agentListeners = new Map()
  const events = []
  const session = { header: {}, surface: { nodes: [] },
    snapshotEvents: () => events,
    deriveMessages: () => events.flatMap(event => event.data.message?.content.length ? [event.data.message] : []),
    append(type, data, options) {
      assert.ok(['system/message', 'assistant/message', 'user/message'].includes(type), 'Only standard DSH events')
      const seq = events.length
      events.push({ type, data, seq, ...options })
      if (options.surfaceOp === 'append') this.surface.nodes.push(seq)
      else {
        assert.equal(options.surfaceOp.startSeq, options.surfaceOp.endSeq)
        this.surface.nodes[this.surface.nodes.indexOf(options.surfaceOp.startSeq)] = seq
      }
    },
  }
  const agent = { id: 'session-1', status: 'idle', session,
    runMaintenance: operation => operation(new AbortController().signal),
    ctx: { on(name, listener) {
      agentListeners.set(name, listener)
      return () => { if (agentListeners.get(name) === listener) agentListeners.delete(name) }
    }, systemPrompt: { variable(name, provider) {
      assert.equal(variables.has(name), false, 'Duplicate scoped variable')
      variables.set(name, provider)
      return () => { variables.delete(name) }
    }, section(value) {
      contexts.push(value)
      return () => { contexts.push({ disposed: value.name }) }
    } } } }
  const agents = new Map([[agent.id, agent]])
  const library = { list: async () => [card] }
  const ctx = {
    sessions: { flush: async () => {} }, reflect: { provide() {} }, agents: { get: id => agents.get(id), list: () => [...agents.values()] },
    on: (name, listener) => { listeners.set(name, listener) },
    effect: factory => factory(),
  }
  const provider = new PersistentCharacterSessionProvider(ctx, library, { campaignsRoot: root })
  const render = () => renderPrompt({ sections: contexts.filter(value => value.text !== undefined).slice(-1),
    variables: { cwd: 'DSH-CWD', model: 'DSH-MODEL', ...Object.fromEntries([...variables].map(([name, provider]) => [name, provider({})])) },
  })
  return { events, root, agent, agents, contexts, variables, render, listeners, agentListeners, library, ctx, provider,
    store: new FileSystemCharacterSessionStore(root) }
}

test('creates the campaign directory without a folder picker', async (t) => {
  const h = await harness(t)
  const first = await h.provider.prepareCampaign()
  assert.deepEqual(await h.provider.prepareCampaign(), first)
  assert.equal((await stat(first.path)).isDirectory(), true)
})

test('persists an immutable standardized snapshot without custom session events', async (t) => {
  const h = await harness(t)
  assert.deepEqual(await h.provider.select(h.agent.id, CARD_ID), {
    sessionId: h.agent.id, character: { id: CARD_ID, name: 'Aster' },
  })
  const saved = await h.store.read(h.agent.id)
  assert.equal(saved.data.description, card.data.description)
  assert.equal(saved.data.extensions, undefined)
  assert.equal(h.contexts[0].name, 'mayori:active-character')
  assert.equal(h.render(), buildCharacterContext(saved))
  assert.doesNotMatch(h.render(), /must not enter model context/)
})

test('awaited agent/created restores the selection after the source card is deleted', async (t) => {
  const h = await harness(t)
  await h.provider.select(h.agent.id, CARD_ID)
  h.listeners.get('agent/disposed')({ agent: h.agent })
  h.contexts.length = 0
  h.library.list = () => { assert.fail('Resume must not need the gallery') }
  const resumed = new PersistentCharacterSessionProvider(h.ctx, h.library, { campaignsRoot: h.root })
  await h.listeners.get('agent/created')({ agent: h.agent, source: 'resume' })
  assert.match(h.render(), /A patient archivist/)
  await resumed.restoreActiveAgents()
})

test('real DSH renderer accepts ST macros without treating them as DSH variables', async (t) => {
  const h = await harness(t)
  const macros = '{{user}} {{USER}} {{unknown}} {{cwd}} {{model}} {{roll::1d20}} {{getvar::quest}} {{random::a::b}} {{}} {{bad name}} {{outer::{{nested}}}} {{unfinished'
  h.library.list = async () => [{ ...card, data: { ...card.data,
    description: `{{char}}: ${macros}`, personality: '{{CHAR}} is patient.',
    scenario: '{{Char}} waits.', first_mes: '{{char}}: Hello, {{user}}.',
    mes_example: '{{user}}: Hello.\n{{char}}: Welcome.',
    system_prompt: 'Portray {{char}}.', post_history_instructions: 'Keep {{char}} consistent.',
    alternate_greetings: ['{{char}}: Another greeting.'],
  } }]
  await h.provider.select(h.agent.id, CARD_ID)
  const saved = await h.store.read(h.agent.id)
  assert.equal(saved.data.description, `{{char}}: ${macros}`, 'Durable source must remain unchanged')
  const rendered = h.render()
  const visible = JSON.parse(rendered.split('<mayori-character-card>\n')[1].split('\n</mayori-character-card>')[0])
  assert.equal(visible.description, `Aster: ${macros.replace(/\{\{user\}\}/gi, 'Игрок')}`)
  assert.equal(visible.personality, 'Aster is patient.')
  assert.equal(visible.scenario, 'Aster waits.')
  assert.equal(visible.opening_message, undefined)
  assert.equal(visible.dialogue_examples, 'Игрок: Hello.\nAster: Welcome.')
  assert.equal(visible.character_system_prompt, 'Portray Aster.')
  assert.equal(visible.post_history_instructions, 'Keep Aster consistent.')
  assert.equal(visible.alternate_greetings, undefined)
  assert.doesNotMatch(rendered, /DSH-CWD|DSH-MODEL|mayori_active_character_text/)
  assert.deepEqual([...h.variables.keys()], ['mayori_active_character_text'])
  h.listeners.get('agent/disposed')({ agent: h.agent })
  assert.equal(h.variables.size, 0)
  await h.listeners.get('agent/created')({ agent: h.agent, source: 'resume' })
  assert.equal(h.render(), rendered, 'Resume must restore the same rendered context')
})

test('character-name replacements are literal and not recursively expanded', async (t) => {
  const h = await harness(t)
  const name = '$& {{cwd}} {{char}}'
  h.library.list = async () => [{ ...card, name, data: { ...card.data, name, description: '{{char}}' } }]
  await h.provider.select(h.agent.id, CARD_ID)
  const rendered = h.render()
  assert.ok(rendered.includes(`"description": "${name}"`))
  assert.doesNotMatch(rendered, /DSH-CWD/)
})

test('failed context registration removes its scoped literal variable', async (t) => {
  const h = await harness(t)
  h.agent.ctx.systemPrompt.section = () => { throw new Error('Registration failed') }
  await assert.rejects(h.provider.select(h.agent.id, CARD_ID), /Registration failed/)
  assert.equal(h.variables.size, 0)
})

test('fork inherits and independently persists its parent selection', async (t) => {
  const h = await harness(t)
  await h.provider.select(h.agent.id, CARD_ID)
  h.agent.session.header.parentSession = h.agent.id
  h.agent.id = 'child'
  h.agents.set('child', h.agent)
  await h.listeners.get('agent/created')({ agent: h.agent, source: 'create' })
  assert.equal((await h.store.read('child')).id, CARD_ID)
})

test('same-card retries are serialized and work without the source card', async (t) => {
  const h = await harness(t)
  const results = await Promise.all([h.provider.select(h.agent.id, CARD_ID), h.provider.select(h.agent.id, CARD_ID)])
  assert.deepEqual(results[0], results[1])
  h.library.list = () => { assert.fail('Idempotent retry must use the stored snapshot') }
  h.agent.session.surface.nodes.push(0)
  assert.deepEqual(await h.provider.select(h.agent.id, CARD_ID), results[0])
  await assert.rejects(h.provider.select(h.agent.id, 'b'.repeat(64)), /новый чат/)
})

test('refuses history, running agents and a changed live agent before committing', async (t) => {
  const h = await harness(t)
  h.agent.session.surface.nodes.push(0)
  await assert.rejects(h.provider.select(h.agent.id, CARD_ID), /новый чат/)
  h.agent.session.surface.nodes.length = 0
  h.agent.status = 'running'
  await assert.rejects(h.provider.select(h.agent.id, CARD_ID), /окончания ответа/)
  h.agent.status = 'idle'
  h.library.list = async () => { h.agents.clear(); return [card] }
  await assert.rejects(h.provider.select(h.agent.id, CARD_ID), /Чат закрыт/)
  assert.equal(await h.store.read(h.agent.id), null)
})

test('corrupt bindings fail restoration rather than silently changing the NPC', async (t) => {
  const h = await harness(t)
  await h.provider.select(h.agent.id, CARD_ID)
  await writeFile(h.store.path(h.agent.id), '{"format":2}')
  await assert.rejects(h.listeners.get('agent/created')({ agent: h.agent }), /повреждён/)
})

test('session identifiers cannot escape the selection directory', async (t) => {
  const h = await harness(t)
  assert.equal(h.store.path('../../elsewhere'), join(h.store.root, h.store.path('../../elsewhere').split(/[\\/]/).at(-1)))
})

async function creationHarness(t) {
  const h = await harness(t)
  const created = []
  const calls = []
  h.ctx.workspaceRegistry = { get: id => id === 'campaign' ? {
    path: '/campaigns/default', attachSession: async id => calls.push(['attach', id]),
  } : undefined }
  h.ctx.agentPresets = { resolve: async () => ({ id: 'mayori' }), mount: async () => { calls.push(['mount']); return () => {} } }
  h.ctx.agents.create = async options => {
    created.push(options)
    const agent = { ...h.agent, id: options.sessionId, session: { header: options.meta, seed: options.seed,
      snapshotEvents: () => options.seed, surface: { nodes: options.seed.filter(event => event.surfaceOp).map(event => event.seq) } } }
    h.agents.set(agent.id, agent)
    assert.equal(await options.setup(agent.ctx), undefined, 'Preset disposer is not an AgentSetupCommit')
    await h.listeners.get('agent/created')({ agent })
    return { agent, dispose: async () => {
      calls.push(['dispose', agent.id])
      h.listeners.get('agent/disposed')({ agent })
      h.agents.delete(agent.id)
    } }
  }
  h.ctx.sessions.flush = async session => { calls.push(['flush', session]) }
  return { ...h, created, calls }
}

test('creates a durable closed greeting seed before releasing the temporary agent', async t => {
  const h = await creationHarness(t)
  const result = await h.provider.create(CARD_ID, 'campaign')
  const options = h.created[0]
  const seed = options.seed
  assert.deepEqual(seed.map(event => event.type), ['turn/start', 'step/start', 'system/message', 'assistant/message', 'step/end', 'turn/end'])
  assert.deepEqual(seed.map(event => event.seq), [0, 1, 2, 3, 4, 5])
  assert.equal(seed[3].data.message.content[0].text, 'You came back.')
  assert.equal(seed[3].data.message.role, 'assistant')
  assert.equal((await h.store.read(result.sessionId)).greeting.messageId, seed[3].data.message.id)
  assert.equal(options.meta.agentPreset, 'mayori')
  assert.deepEqual(h.calls.map(call => call[0]), ['mount', 'attach', 'flush', 'dispose'])
  assert.equal(h.agents.has(result.sessionId), false)
  const resumed = { ...h.agent, id: result.sessionId }
  h.agents.set(resumed.id, resumed)
  await h.listeners.get('agent/created')({ agent: resumed })
  assert.equal(h.events.length, 0, 'Resume binds context without appending any greeting')
})

test('alternate seed expands player identity and contains only the selected opening', async t => {
  const h = await creationHarness(t)
  h.library.list = async () => [{ ...card, data: { ...card.data, alternate_greetings: ['{{char}}: Alternative, {{user}}.'] } }]
  const result = await h.provider.create(CARD_ID, 'campaign', 1)
  assert.equal(h.created[0].seed[3].data.message.content[0].text, 'Aster: Alternative, Игрок.')
  assert.equal((await h.store.read(result.sessionId)).greeting.index, 1)
  assert.doesNotMatch(buildCharacterContext(await h.store.read(result.sessionId)), /You came back|Alternative|opening_message|alternate_greetings/)
})

test('invalid selections fail before any Agent creation', async t => {
  const h = await creationHarness(t)
  for (const index of [-1, 0.5, '1', null, 2]) await assert.rejects(h.provider.create(CARD_ID, 'campaign', index))
  await assert.rejects(h.provider.create(CARD_ID, 'missing'), /не найдена/)
  assert.equal(h.created.length, 0)
})

test('empty greeting seeds no fabricated message', async t => {
  const h = await creationHarness(t)
  h.library.list = async () => [{ ...card, data: { ...card.data, first_mes: '  ' } }]
  await h.provider.create(CARD_ID, 'campaign')
  assert.deepEqual(h.created[0].seed, [])
})

test('flush failure releases the temporary agent and does not report success', async t => {
  const h = await creationHarness(t)
  h.ctx.sessions.flush = async () => { throw new Error('disk full') }
  await assert.rejects(h.provider.create(CARD_ID, 'campaign'), /disk full/)
  assert.equal(h.calls.at(-1)[0], 'dispose')
})

test('legacy selections are restored without adding a new opening', async t => {
  const h = await harness(t)
  await h.provider.select(h.agent.id, CARD_ID)
  await h.listeners.get('agent/created')({ agent: h.agent })
  assert.equal(h.events.length, 0)
})

test('the provider works through a real Cordis traced service, not just a raw instance', async (t) => {
  const h = await harness(t)
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  ctx.provide('agents', h.ctx.agents)
  ctx.provide('sessions', h.ctx.sessions)
  new PersistentCharacterSessionProvider(ctx, h.library, { campaignsRoot: h.root })
  const campaign = await ctx.mayoriCharacterSessions.prepareCampaign()
  assert.equal((await stat(campaign.path)).isDirectory(), true)
  const result = await ctx.mayoriCharacterSessions.select(h.agent.id, CARD_ID)
  assert.equal(result.character.name, 'Aster')
  await ctx.fiber.dispose()
  assert.equal(h.variables.size, 0, 'Plugin unload must remove agent-scoped variables')
  assert.ok(h.contexts.some(value => value.disposed === 'mayori:active-character'))
})

async function openingHarness(t) {
  const h = await harness(t)
  h.library.list = async () => [{ ...card, data: { ...card.data, first_mes: '{{char}}: Hello, {{user}}.',
    alternate_greetings: ['{{user}} visits {{char}}.', ''] } }]
  await h.provider.select(h.agent.id, CARD_ID)
  const selected = await h.store.read(h.agent.id)
  selected.greeting = { index: 0, messageId: 'opening', text: 'Aster: Hello, Игрок.' }
  await h.store.update(h.agent.id, selected, () => {})
  h.events.push(...greetingSeed(selected.greeting))
  h.agent.session.surface.nodes.push(2, 3)
  return h
}

test('swiping replaces the current model surface and is reconstructed from the log after reopening', async t => {
  const h = await openingHarness(t)
  const swiped = await h.provider.swipe(h.agent.id, 1)
  assert.equal(swiped.greeting.text, 'Игрок visits Aster.')
  assert.equal(swiped.greeting.index, 1)
  assert.deepEqual(h.agent.session.surface.nodes, [2, 6])
  assert.deepEqual(h.events[6].surfaceOp, { op: 'replace', startSeq: 3, endSeq: 3 })
  assert.deepEqual(h.events[6].sourceEventSeqs, [3])
  h.listeners.get('agent/disposed')({ agent: h.agent })
  await h.listeners.get('agent/created')({ agent: h.agent })
  assert.equal((await h.provider.state(h.agent.id)).greeting.index, 1)
  assert.equal((await h.store.read(h.agent.id)).greeting.index, 0, 'The log owns swipe selection')
  const empty = await h.provider.swipe(h.agent.id, 2)
  assert.equal(empty.greeting.text, '')
  assert.equal(empty.greeting.canSwipe, true)
  assert.equal((await h.provider.swipe(h.agent.id, 0)).greeting.text, 'Aster: Hello, Игрок.')
})

test('swipes reject started chats, queued input, invalid indices and closed agents', async t => {
  const h = await openingHarness(t)
  for (const index of [-1, 3, '1', null]) await assert.rejects(h.provider.swipe(h.agent.id, index), /вариант/)
  h.agent.inbox = { nextTurn: [{}], nextStep: [] }
  await assert.rejects(h.provider.swipe(h.agent.id, 1), /первого хода/)
  h.agent.inbox.nextTurn = []
  h.events.push({ type: 'turn/start', data: { turn: 2 } })
  await assert.rejects(h.provider.swipe(h.agent.id, 1), /первого хода/)
  h.agents.clear()
  await assert.rejects(h.provider.swipe(h.agent.id, 1), /закрыт/)
})

test('the transcript retains its selected greeting after compaction shadows the model surface', async t => {
  const h = await openingHarness(t)
  await h.provider.swipe(h.agent.id, 1)
  h.agent.session.surface.nodes = [2]
  const state = await h.provider.state(h.agent.id)
  assert.equal(state.greeting.text, 'Игрок visits Aster.')
  assert.equal(state.greeting.index, 1)
  assert.equal(state.greeting.canSwipe, false)
})

test('persona binding updates a pristine greeting and model context, then preserves played history', async t => {
  const h = await openingHarness(t)
  h.provider._personas = { resolve: async () => ({ id: 'alex', name: 'Алекс', description: '{{user}} — путешественник.' }) }
  const result = await h.provider.setPersona(h.agent.id, 'alex')
  assert.equal(result.greeting.text, 'Aster: Hello, Алекс.')
  assert.match(h.render(), /Алекс — путешественник/)
  assert.equal((await h.store.read(h.agent.id)).persona.name, 'Алекс')
  h.events.push({ type: 'turn/start', data: { turn: 2 } })
  h.provider._personas.resolve = async () => ({ name: 'Новая', description: '' })
  const played = await h.provider.setPersona(h.agent.id, 'new')
  assert.equal(played.greeting.text, 'Aster: Hello, Алекс.')
  assert.equal(played.persona.name, 'Новая')
  assert.match(h.render(), /Новая/)
})

test('new chats snapshot the default persona and render it without avatar or title in model context', async t => {
  const h = await creationHarness(t)
  const persona = { id: 'alex', name: 'Алекс', description: '{{user}} — путешественник.', title: 'private-label', avatar: 'private-image' }
  h.provider._personas = { resolve: async () => ({ ...persona }) }
  h.library.list = async () => [{ ...card, data: { ...card.data, first_mes: '{{char}}: {{user}}. {{persona}}' } }]
  const { sessionId } = await h.provider.create(CARD_ID, 'campaign')
  assert.equal(h.created[0].seed[3].data.message.content[0].text, 'Aster: Алекс. Алекс — путешественник.')
  const saved = await h.store.read(sessionId)
  persona.name = 'Changed'
  assert.equal(saved.persona.name, 'Алекс')
  assert.doesNotMatch(buildCharacterContext(saved), /private-label|private-image|Changed/)
})

test('character context follows all instructions in the actual assembled system prompt', async t => {
  const h = await harness(t)
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt, {})
  ctx.systemPrompt.section({ name: 'director', order: 10, text: 'Keep the player in control.' })
  ctx.systemPrompt.section({ name: 'environment', order: 10200, text: 'Environment instructions.' })
  h.agent.ctx.systemPrompt = ctx.systemPrompt
  await h.provider.select(h.agent.id, CARD_ID)
  const assembly = await ctx.systemPrompt.assemble()
  assert.equal(assembly.sections.at(-1).name, 'mayori:active-character')
  assert.equal(assembly.contexts.length, 0, 'The card must not be appended after player input as runtime context')
  const prompt = renderPrompt(assembly)
  assert.ok(prompt.indexOf('Environment instructions.') < prompt.indexOf('<mayori-character-card>'))
  h.listeners.get('agent/disposed')({ agent: h.agent })
  assert.doesNotMatch(renderPrompt(await ctx.systemPrompt.assemble()), /mayori-character-card/)
})

test('character chats ask capable adapters to keep the system prompt at the history prefix', async t => {
  const h = await harness(t)
  await h.provider.select(h.agent.id, CARD_ID)
  const hook = h.agentListeners.get('agent/pre-step')
  const messages = [{ id: 'player-message' }]
  const decision = { kind: 'enter', messages, extra: 'preserve downstream contributions' }
  const result = await hook({}, async () => decision)
  assert.deepEqual(result, { ...decision, startsRequestSeries: true })
  assert.equal(result.messages, messages)
  assert.equal(decision.startsRequestSeries, undefined)
  const reject = { kind: 'reject', reason: 'blocked by another plugin' }
  assert.equal(await hook({}, async () => reject), reject)
  await assert.rejects(hook({}, async () => { throw new Error('cancelled') }), /cancelled/)
  h.listeners.get('agent/disposed')({ agent: h.agent })
  assert.equal(h.agentListeners.has('agent/pre-step'), false, 'Agent disposal releases the prefix policy')
})

test('moving a legacy card context preserves other sections and historical request inputs', async t => {
  const h = await harness(t)
  await h.provider.select(h.agent.id, CARD_ID)
  const session = Session.create(h.agent.id, greetingSeed({ messageId: 'opening', text: 'Opening' }))
  const sections = [{ name: 'sandbox:policy', text: 'Keep sandbox policy.' },
    { name: 'mayori:active-character', text: h.render() }]
  const legacy = session.append('user/message', { id: 'legacy-context', role: 'user',
    source: { kind: 'runtime-context', form: 'snapshot', sections },
    content: [{ type: 'text', text: joinContextSections(sections) }],
  }, { surfaceOp: 'append' })
  const original = session.snapshotEvents().slice()
  h.agent.session = session
  await h.listeners.get('agent/created')({ agent: h.agent })
  assert.deepEqual(session.snapshotEvents().slice(0, original.length), original)
  const runtime = session.deriveMessages().find(message => message.source.kind === 'runtime-context')
  assert.match(runtime.content[0].text, /Keep sandbox policy/)
  assert.doesNotMatch(runtime.content[0].text, /mayori-character-card/)
  assert.deepEqual(runtime.source.sections, [sections[0]])
  assert.deepEqual(session.snapshotEvents().at(-1).sourceEventSeqs, [legacy.seq])
  const size = session.snapshotEvents().length
  await h.listeners.get('agent/created')({ agent: h.agent })
  assert.equal(session.snapshotEvents().length, size, 'Migration is idempotent')
})

test('character portrait is durable, inherited and never enters model context', async t => {
  const h = await harness(t)
  const image = 'data:image/png;base64,aGVsbG8='
  h.library.list = async () => [{ ...card, image }]
  await h.provider.select(h.agent.id, CARD_ID)
  assert.equal((await h.provider.state(h.agent.id)).character.image, image)
  assert.doesNotMatch(h.render(), /data:image|aGVsbG8/)
  h.library.list = () => { assert.fail('A saved portrait must survive deleted cards') }
  await h.listeners.get('agent/created')({ agent: h.agent })
  assert.equal((await h.store.read(h.agent.id)).image, image)
  h.agent.session.header.parentSession = h.agent.id
  h.agent.id = 'portrait-fork'
  h.agents.set(h.agent.id, h.agent)
  await h.listeners.get('agent/created')({ agent: h.agent })
  assert.equal((await h.provider.state(h.agent.id)).character.image, image)
})

test('old chat snapshots acquire an available portrait once and retain it independently', async t => {
  const h = await harness(t)
  await h.provider.select(h.agent.id, CARD_ID)
  const old = await h.store.read(h.agent.id)
  delete old.image
  await h.store.update(h.agent.id, old, () => {})
  const image = 'data:image/png;base64,aGVsbG8='
  h.library.list = async () => [{ ...card, image }]
  await h.listeners.get('agent/created')({ agent: h.agent })
  assert.equal((await h.store.read(h.agent.id)).image, image)
  h.library.list = () => { assert.fail('Migration must not repeat') }
  await h.listeners.get('agent/created')({ agent: h.agent })
})
