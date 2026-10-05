import assert from 'node:assert/strict'
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { renderContextSections } from '@deepseek-ai/dsh-system-prompt'
import {
  FileSystemCharacterSessionStore, PersistentCharacterSessionProvider,
  buildCharacterContext,
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
  const session = { header: {}, surface: { nodes: [] }, append() { assert.fail('No custom DSH events') } }
  const agent = { id: 'session-1', status: 'idle', session,
    runMaintenance: operation => operation(new AbortController().signal),
    ctx: { systemPrompt: { variable(name, provider) {
      assert.equal(variables.has(name), false, 'Duplicate scoped variable')
      variables.set(name, provider)
      return () => { variables.delete(name) }
    }, context(value) {
      contexts.push(value)
      return () => { contexts.push({ disposed: value.name }) }
    } } } }
  const agents = new Map([[agent.id, agent]])
  const library = { list: async () => [card] }
  const ctx = {
    reflect: { provide() {} }, agents: { get: id => agents.get(id), list: () => [...agents.values()] },
    on: (name, listener) => { listeners.set(name, listener) },
    effect: factory => factory(),
  }
  const provider = new PersistentCharacterSessionProvider(ctx, library, { campaignsRoot: root })
  const render = () => renderContextSections({ contexts: contexts.filter(value => value.text !== undefined).slice(-1),
    variables: { cwd: 'DSH-CWD', model: 'DSH-MODEL', ...Object.fromEntries([...variables].map(([name, provider]) => [name, provider({})])) },
  })[0]?.text
  return { root, agent, agents, contexts, variables, render, listeners, library, ctx, provider,
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
  assert.equal(visible.description, `Aster: ${macros}`)
  assert.equal(visible.personality, 'Aster is patient.')
  assert.equal(visible.scenario, 'Aster waits.')
  assert.equal(visible.opening_message, 'Aster: Hello, {{user}}.')
  assert.equal(visible.dialogue_examples, '{{user}}: Hello.\nAster: Welcome.')
  assert.equal(visible.character_system_prompt, 'Portray Aster.')
  assert.equal(visible.post_history_instructions, 'Keep Aster consistent.')
  assert.deepEqual(visible.alternate_greetings, ['Aster: Another greeting.'])
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
  h.agent.ctx.systemPrompt.context = () => { throw new Error('Registration failed') }
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

test('the provider works through a real Cordis traced service, not just a raw instance', async (t) => {
  const h = await harness(t)
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  ctx.provide('agents', h.ctx.agents)
  new PersistentCharacterSessionProvider(ctx, h.library, { campaignsRoot: h.root })
  const campaign = await ctx.mayoriCharacterSessions.prepareCampaign()
  assert.equal((await stat(campaign.path)).isDirectory(), true)
  const result = await ctx.mayoriCharacterSessions.select(h.agent.id, CARD_ID)
  assert.equal(result.character.name, 'Aster')
  await ctx.fiber.dispose()
  assert.equal(h.variables.size, 0, 'Plugin unload must remove agent-scoped variables')
  assert.ok(h.contexts.some(value => value.disposed === 'mayori:active-character'))
})
