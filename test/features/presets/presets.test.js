import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { createScope, scopeOf } from '@deepseek-ai/dsh-scope'
import SystemPrompt, { renderContextSections, renderPrompt } from '@deepseek-ai/dsh-system-prompt'
import { createSystemMessage } from '@deepseek-ai/dsh-llm'
import { Session } from '@deepseek-ai/dsh-session'
import { FileSystemPresetStore } from '../../../src/features/presets/host/store.js'
import { FileSystemRoleplayPresetProvider } from '../../../src/features/presets/host/provider.js'
import { LoggedSessionPresetProvider } from '../../../src/features/presets/host/session.js'
import { presetContext, presetSelectionMessage, readPresetSelection } from '../../../src/features/presets/shared/preset.js'
import { greetingSeed } from '../../../src/features/character-session/host/greeting.js'

const initial = { name: 'Mayori', instructions: 'Protect player agency. Default instructions.' }
const structured = () => ({ name: 'Nested preset', nodes: [{ id: 'group', kind: 'group', title: 'Group title', enabled: true, children: [
  { id: 'active', kind: 'block', title: 'Active title', enabled: true, text: 'ACTIVE {{cwd}}' },
  { id: 'disabled', kind: 'block', title: 'Disabled title', enabled: false, text: 'SECRET_DISABLED' },
] }] })

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
    agent.inbox.splice = (target, start, removedCount, inserted) => {
      const messages = target === 'next-step' ? agent.inbox.nextStep : agent.inbox.nextTurn
      const event = agent.session.append('agent/inbox/spliced', { target, start, removedCount, inserted })
      messages.splice(start, removedCount, ...event.data.inserted)
    }
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
  assert.deepEqual(agent.session.deriveMessages()[1].content, [], 'Only snapshot metadata is recorded')
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
  assert.equal(agent.session.surface.nodes.length, 0, 'An unstarted chat leaves first system admission to DSH')
  await service.select('chat', custom.id)
  assert.equal(agent.inbox.nextStep.length, 1, 'Changing an unstarted selection replaces its pending notice')
  await service.restoreActiveAgents()
  assert.deepEqual((await service.state('chat')).preset, custom)
  await service.select('chat', null)
  assert.equal((await service.state('chat')).preset, null)
  assert.equal(readPresetSelection(agent.session.snapshotEvents()), null)
  const prompt = renderPrompt(await agent.ctx.systemPrompt.assemble({ scope: scopeOf(agent.ctx) }))
  assert.ok(!prompt.includes(custom.instructions))
})

test('legacy preset notices are retired before a new request without erasing the old snapshot', async t => {
  const h = await runtime(t)
  const preset = { id: 'mayori', ...initial }
  const seed = Session.create('legacy-seed', greetingSeed({ messageId: 'legacy-opening', text: 'Opening' }))
  const old = seed.append('user/message', { id: 'legacy-notice', role: 'user',
    source: { kind: 'mayori-preset', sections: [{ name: 'mayori:roleplay-preset', text: presetContext(preset) }] },
    content: [{ type: 'text', text: 'The selected role-playing preset is provided in the current system prompt.' }],
  }, { surfaceOp: 'append' })
  const agent = await h.create('legacy', seed.snapshotEvents())
  await agent.ctx.waterfall('agent/pre-step', { agent, signal: new AbortController().signal }, () => ({ kind: 'enter', messages: [] }))
  assert.equal(agent.session.snapshotEvents()[old.seq].data.content[0].text, old.data.content[0].text)
  assert.equal(agent.session.deriveMessages().some(message => message.content.some(block => block.text?.includes('selected role-playing'))), false)
  assert.deepEqual(readPresetSelection(agent.session.snapshotEvents()), preset)
  assert.deepEqual(agent.session.snapshotEvents().at(-1).sourceEventSeqs, [old.seq])
})

test('Mayori suppresses the required working-directory context at request admission', async t => {
  const h = await runtime(t)
  const directory = { name: 'working-directory:current', order: 0, text: 'Current working directory: "C:\\campaign".' }
  h.ctx.systemPrompt.context({ ...directory, required: true })
  const agent = await h.create('chat')
  const prompt = h.ctx.systemPrompt
  const context = { scope: scopeOf(agent.ctx) }
  assert.deepEqual(renderContextSections(prompt.refreshContext(await prompt.assemble(context), context)), [])
  assert.deepEqual(renderContextSections(prompt.refreshContext(await prompt.assemble())), [{ name: directory.name, text: directory.text }])
  await h.ctx.emit('agent/disposed', { agent })
  assert.deepEqual(renderContextSections(prompt.refreshContext(await prompt.assemble(context), context)), [{ name: directory.name, text: directory.text }])
})

test('the next turn retires saved directory reminders and preserves other context and historical requests', async t => {
  const h = await runtime(t)
  const seed = Session.create('directory-seed', greetingSeed({ messageId: 'opening', text: 'Opening' }))
  const directory = { name: 'working-directory:current', text: 'Current working directory: "C:\\campaign".' }
  const rules = { name: 'campaign:rules', text: 'Use the campaign rules.' }
  for (const sections of [[directory], [directory, rules]]) {
    seed.append('user/message', { id: `reminder-${sections.length}`, role: 'user',
      source: { kind: 'runtime-context', form: 'snapshot', sections },
      content: [{ type: 'text', text: `<system-reminder>\n${sections.map(section => section.text).join('\n\n')}\n</system-reminder>` }],
    }, { surfaceOp: 'append' })
  }
  const historicalEvents = seed.snapshotEvents()
  const agent = await h.create('chat', historicalEvents)
  const prepare = () => agent.ctx.waterfall('agent/pre-step', { agent, signal: new AbortController().signal }, () => ({ kind: 'enter', messages: [] }))
  await prepare()
  const reminders = agent.session.deriveMessages().filter(message => message.source.kind === 'runtime-context')
  assert.deepEqual(reminders.map(message => message.source.sections), [[], [rules]])
  assert.deepEqual(reminders[0].content, [])
  assert.match(reminders[1].content[0].text, /Use the campaign rules/)
  assert.doesNotMatch(reminders[1].content[0].text, /Current working directory/)
  assert.deepEqual(agent.session.snapshotEvents().slice(0, historicalEvents.length), historicalEvents)
  const seq = agent.session.seq
  await prepare()
  assert.equal(agent.session.seq, seq)
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
  assert.deepEqual(Session.create('offline', events).deriveMessages(), [])
  assert.equal(events.find(event => event.type === 'agent/inbox/spliced').data.inserted[0].source.kind, 'mayori-preset')
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

test('format 1 catalogs remain literal and structured saves upgrade the catalog without losing legacy entries', async t => {
  const { root, store } = await catalog(t)
  await writeFile(store.path, JSON.stringify({ format: 1, defaultId: 'mayori', presets: [{ id: 'mayori', ...initial }] }))
  assert.deepEqual(await store.resolve(), { id: 'mayori', ...initial })
  const saved = await store.save({ ...structured(), instructions: 'CLIENT_TEXT_MUST_NOT_WIN' })
  assert.equal(saved.instructions, 'ACTIVE {{cwd}}')
  assert.equal(JSON.parse(await readFile(store.path, 'utf8')).format, 2)
  assert.deepEqual(await new FileSystemPresetStore(root, initial).resolve(saved.id), saved)
  assert.deepEqual(await store.resolve('mayori'), { id: 'mayori', ...initial })
})

test('structured selection logs the full tree but model projection includes only frozen active instructions', async t => {
  const h = await runtime(t)
  const agent = await h.create('nested')
  const preset = await h.presets.save(structured())
  await h.provider.select('nested', preset.id)
  const original = agent.session.snapshotEvents()
  const prompt = renderPrompt(await agent.ctx.systemPrompt.assemble({ scope: scopeOf(agent.ctx) }))
  assert.ok(prompt.includes('ACTIVE {{cwd}}'))
  for (const hidden of ['SECRET_DISABLED', 'Disabled title', 'Group title', 'children']) assert.ok(!prompt.includes(hidden))
  assert.deepEqual(readPresetSelection(original), preset)
  agent.session.append('system/message', { message: createSystemMessage(presetContext(preset)) }, { surfaceOp: 'append' })
  agent.session.append('user/message', { id: 'projected', role: 'user', content: [], source: { kind: 'runtime-context', sections: [{ name: 'mayori:roleplay-preset', text: presetContext(preset) }] } }, { surfaceOp: 'append' })
  assert.deepEqual(readPresetSelection(agent.session.snapshotEvents()), preset, 'A newer projection cannot erase authoring metadata')
  await h.presets.save({ ...preset, nodes: [] })
  await h.presets.remove(preset.id)
  const restored = await h.create('restored-nested', agent.session.snapshotEvents())
  assert.deepEqual((await h.provider.state('restored-nested')).preset, preset)
  assert.ok(renderPrompt(await restored.ctx.systemPrompt.assemble({ scope: scopeOf(restored.ctx) })).includes('ACTIVE {{cwd}}'))
  const fork = await h.create('fork-nested', original)
  assert.deepEqual((await h.provider.state('fork-nested')).preset, preset)
})

test('structured replay preserves the recorded compiled text and supports an all-disabled preset', () => {
  const preset = { id: 'recorded', ...structured(), compilerVersion: 1, instructions: 'FROZEN HISTORICAL TEXT' }
  const event = { type: 'user/message', data: presetSelectionMessage(preset) }
  assert.deepEqual(readPresetSelection([event]), preset)
  assert.ok(presetContext(readPresetSelection([event])).includes('FROZEN HISTORICAL TEXT'))
  const empty = { id: 'empty', name: 'Empty', nodes: [], compilerVersion: 1, instructions: '' }
  assert.deepEqual(readPresetSelection([{ type: 'user/message', data: presetSelectionMessage(empty) }]), empty)
})
