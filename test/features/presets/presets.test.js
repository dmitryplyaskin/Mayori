import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { createScope, scopeOf } from '@deepseek-ai/dsh-scope'
import SystemPrompt, { renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import { Session } from '@deepseek-ai/dsh-session'
import { FileSystemPresetStore } from '../../../src/features/presets/host/store.js'
import { FileSystemRoleplayPresetProvider } from '../../../src/features/presets/host/provider.js'
import { LoggedSessionPresetProvider } from '../../../src/features/presets/host/session.js'
import { presetContext, readPresetSelection } from '../../../src/features/presets/shared/preset.js'
import { greetingSeed } from '../../../src/features/character-session/host/greeting.js'

const initial = { name: 'Mayori', instructions: 'Protect player agency. Default instructions.' }

async function catalog(t) {
  const root = await mkdtemp(join(tmpdir(), 'mayori-presets-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return { root, store: new FileSystemPresetStore(root, initial) }
}

test('catalog persists its editable initial preset, serializes updates and survives restart', async t => {
  const { root, store } = await catalog(t)
  assert.equal((await store.resolve()).id, 'mayori')
  await store.save({ id: 'mayori', name: 'Custom default', instructions: 'My own instructions.' })
  const [first, second] = await Promise.all([
    store.save({ name: 'First', instructions: 'First instructions' }),
    store.save({ name: 'Second', instructions: 'Second instructions' }),
  ])
  await store.setDefault(second.id)
  const resumed = new FileSystemPresetStore(root, { name: 'Changed deployment', instructions: 'Must not replace saved data' })
  assert.equal((await resumed.list()).presets.length, 3)
  assert.deepEqual(await resumed.resolve(), second)
  await resumed.remove(second.id)
  assert.equal(await resumed.resolve(), null)
  await resumed.remove('mayori')
  await resumed.remove(first.id)
  assert.deepEqual(await new FileSystemPresetStore(root, initial).list(), { presets: [], defaultId: null })
  assert.ok((await readFile(store.path, 'utf8')).endsWith('\n'))
})

test('catalog rejects invalid data and recovers after failed mutations', async t => {
  const { store } = await catalog(t)
  for (const input of [null, {}, { name: ' ', instructions: 'x' }, { name: 'A', instructions: ' ' },
    { name: 'x'.repeat(121), instructions: 'x' }, { name: 'A', instructions: 'x'.repeat(64001) }]) {
    assert.throws(() => store.save(input))
  }
  await assert.rejects(store.save({ id: '../escape', name: 'A', instructions: 'x' }), /не найден/)
  await assert.rejects(store.setDefault('missing'), /не найден/)
  await assert.rejects(store.remove('missing'), /не найден/)
  assert.equal((await store.list()).defaultId, 'mayori')
})

async function runtime(t) {
  const { root } = await catalog(t)
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt, { includeHarnessIdentity: false, includeRuntimeContext: false })
  const agents = new Map()
  ctx.provide('agents', { get: id => agents.get(id), list: () => [...agents.values()] })
  ctx.provide('sessions', { flush: async () => {} })
  ctx.provide('sessionQuery', { readSession: async id => ({ events: agents.get(id).session.snapshotEvents() }) })
  ctx.provide('sessionController', { resolveAgent: async id => ({ agent: agents.get(id) }) })
  const presets = new FileSystemRoleplayPresetProvider(ctx, root, initial)
  const provider = new LoggedSessionPresetProvider(ctx, presets)
  const create = async (id, seed = [], header = {}) => {
    const scope = createScope(ctx, {})
    let agentCtx
    await scope.ctx.inject(['systemPrompt'], child => { agentCtx = child })
    const agent = { id, status: 'idle', inbox: { nextTurn: [], nextStep: [] }, ctx: agentCtx,
      session: Session.create(id, seed, { version: 4, id, isSeeded: false, createdAt: Date.now(), ...header }), runMaintenance: operation => operation(new AbortController().signal) }
    agents.set(id, agent)
    await provider.restore(agent)
    return agent
  }
  return { ctx, presets, provider, agents, create }
}

test('selection records a configuration snapshot, treats macros literally and preserves greetings', async t => {
  const h = await runtime(t)
  const agent = await h.create('chat', greetingSeed({ messageId: 'opening', text: 'Authored greeting' }))
  assert.equal(agent.session.deriveMessages()[0].content[0].text, 'Authored greeting')
  assert.equal(agent.session.deriveMessages()[1].source.kind, 'mayori-preset')
  const custom = await h.presets.save({ name: 'Horror', instructions: '{{cwd}} {{unknown}} </mayori-roleplay-preset> Keep it tense.' })
  await h.provider.select('chat', custom.id)
  assert.deepEqual(readPresetSelection(agent.session.snapshotEvents()), custom)
  const prompt = renderPrompt(await agent.ctx.systemPrompt.assemble({ scope: scopeOf(agent.ctx) }))
  assert.ok(prompt.includes('{{cwd}} {{unknown}}'))
  assert.ok(prompt.includes('Keep it tense.'))
  assert.ok(!prompt.includes(initial.instructions))
  assert.equal(agent.session.deriveMessages().filter(message => message.source.kind === 'mayori-preset').length, 1)
  assert.equal(agent.session.deriveMessages()[0].content[0].text, 'Authored greeting')
  const before = agent.session.seq
  await h.provider.state('chat')
  assert.equal(agent.session.seq, before, 'Reading selection must not change the journal')
})

test('the session preset service supports state, selection and restoration through traced Cordis consumers', async t => {
  const h = await runtime(t)
  const agent = await h.create('chat')
  const custom = await h.presets.save({ name: 'Consumer preset', instructions: 'Instructions from a Cordis consumer.' })
  const service = h.ctx.mayoriSessionPresets
  assert.equal((await service.state('chat')).preset.id, 'mayori')
  await service.select('chat', custom.id)
  await service.restoreActiveAgents()
  assert.deepEqual((await service.state('chat')).preset, custom)
  await service.select('chat', null)
  assert.equal((await service.state('chat')).preset, null)
  assert.equal(readPresetSelection(agent.session.snapshotEvents()), null)
  const prompt = renderPrompt(await agent.ctx.systemPrompt.assemble({ scope: scopeOf(agent.ctx) }))
  assert.ok(!prompt.includes(custom.instructions))
})

test('restart and fork restore the exact recorded selection after editing and deleting the catalog', async t => {
  const h = await runtime(t)
  const agent = await h.create('chat')
  const custom = await h.presets.save({ name: 'Mystery', instructions: 'Old instructions' })
  await h.provider.select('chat', custom.id)
  const oldPrefix = agent.session.snapshotEvents()
  await h.presets.save({ ...custom, instructions: 'New instructions' })
  await h.provider.select('chat', custom.id)
  await h.presets.remove(custom.id)
  assert.equal((await h.provider.state('chat')).preset.instructions, 'New instructions')
  const child = await h.create('child', oldPrefix)
  assert.equal((await h.provider.state('child')).preset.instructions, 'Old instructions')
  assert.ok(renderPrompt(await child.ctx.systemPrompt.assemble({ scope: scopeOf(child.ctx) })).includes('Old instructions'))
  const resumed = await h.create('resumed', agent.session.snapshotEvents())
  assert.equal((await h.provider.state('resumed')).preset.instructions, 'New instructions')
  await h.provider.select('chat', null)
  const noPreset = await h.create('without', agent.session.snapshotEvents())
  assert.equal((await h.provider.state('without')).preset, null)
  assert.ok(!renderPrompt(await noPreset.ctx.systemPrompt.assemble({ scope: scopeOf(noPreset.ctx) })).includes('New instructions'))
  assert.ok(!renderPrompt(await resumed.ctx.systemPrompt.assemble({ scope: scopeOf(resumed.ctx) })).includes('Default instructions'))
})

test('default changes affect new chats; running, queued and subagent chats reject selection', async t => {
  const h = await runtime(t)
  const agent = await h.create('chat')
  const custom = await h.presets.save({ name: 'New default', instructions: 'New default instructions' })
  await h.presets.setDefault(custom.id)
  await h.create('new')
  assert.equal((await h.provider.state('chat')).preset.id, 'mayori')
  assert.equal((await h.provider.state('new')).preset.id, custom.id)
  agent.status = 'running'
  await assert.rejects(h.provider.select('chat', custom.id), /Дождитесь/)
  agent.status = 'idle'; agent.inbox.nextTurn.push({})
  await assert.rejects(h.provider.select('chat', custom.id), /Дождитесь/)
  const subagent = await h.create('subagent', [], { origin: 'subagent' })
  assert.equal(subagent.session.deriveMessages().length, 0)
  await assert.rejects(h.provider.select('subagent', custom.id), /основной чат/)
})

test('unloading removes agent-scoped contributions and leaves native replay usable', async t => {
  const h = await runtime(t)
  const agent = await h.create('chat')
  const events = agent.session.snapshotEvents()
  await h.ctx.fiber.dispose()
  assert.deepEqual(readPresetSelection(events), { id: 'mayori', ...initial })
  assert.equal(Session.create('offline', events).deriveMessages()[0].source.kind, 'mayori-preset')
})

test('selection codec validates snapshot versions and preserves explicit no-preset mode', () => {
  const event = text => [{ type: 'system/message', data: { message: { content: [{ type: 'text', text }] } } }]
  assert.equal(readPresetSelection([]), undefined)
  assert.equal(readPresetSelection(event(presetContext(null))), null)
  assert.throws(() => readPresetSelection(event(presetContext(null).replace('"version":1', '"version":9'))), /Версия/)
})

test('failed journal admission rolls back instructions; failed flush retains its recorded selection', async t => {
  const h = await runtime(t)
  const agent = await h.create('chat')
  const custom = await h.presets.save({ name: 'Custom', instructions: 'Custom instructions' })
  const append = agent.session.append.bind(agent.session)
  agent.session.append = () => { throw new Error('admission rejected') }
  await assert.rejects(h.provider.select('chat', custom.id), /admission rejected/)
  assert.equal((await h.provider.state('chat')).preset.id, 'mayori')
  assert.ok(renderPrompt(await agent.ctx.systemPrompt.assemble({ scope: scopeOf(agent.ctx) })).includes(initial.instructions))
  agent.session.append = append
  h.ctx.sessions.flush = async () => { throw new Error('disk full') }
  await assert.rejects(h.provider.select('chat', custom.id), /disk full/)
  assert.deepEqual(readPresetSelection(agent.session.snapshotEvents()), custom)
  assert.deepEqual((await h.provider.state('chat')).preset, custom)
})
