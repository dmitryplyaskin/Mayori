import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { PersistentPluginSettingsProvider } from '../../../src/features/plugins/host/provider.js'
import { DEFAULT_PLUGINS, validatePlugins } from '../../../src/features/plugins/shared/settings.js'
import * as OptionalPlugins from '../../../src/host/optional-plugins.js'

async function runtime(t) {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt); await ctx.plugin(ToolRuntime)
  let values = { ...DEFAULT_PLUGINS }, revision = 0, busy = false
  const config = Object.fromEntries(Object.keys(values).map(key => [key, { get: () => values[key] }]))
  ctx.provide('settings', { describe: () => [{ ns: 'mayori-plugin-settings', revision }],
    async update(_ns, next, expected) { assert.equal(expected, revision); values = next; revision++; ctx.emit('app-boot/config-reload') } })
  ctx.provide('agents', { list: () => [{ status: busy ? 'running' : 'idle', ctx }] })
  ctx.provide('agentPresets', { composedPreset: () => 'mayori' })
  const provider = new PersistentPluginSettingsProvider(ctx, config)
  // Cordis announces a newly provided service at the next lifecycle boundary.
  await new Promise(resolve => setImmediate(resolve))
  const mount = await ctx.plugin(OptionalPlugins)
  return { ctx, provider, mount, setBusy: value => { busy = value } }
}
const names = ctx => ctx.tools.schemas().map(tool => tool.name).sort()

test('saved preferences independently add/remove tools in the same Mayori scope', async t => {
  const { ctx, provider, mount } = await runtime(t)
  assert.deepEqual(names(ctx), ['getRollDetails', 'resolveCheck', 'rollDice'])
  await provider.update({ dice: false, rules: true, rollHistory: true }, 0)
  assert.deepEqual(names(ctx), ['getRollDetails', 'resolveCheck'])
  assert.ok(ctx.mayoriDice, 'Rules keeps its real random provider')
  await provider.update({ dice: false, rules: false, rollHistory: true }, 1)
  assert.deepEqual(names(ctx), ['getRollDetails'])
  assert.equal(ctx.mayoriDice, undefined)
  await provider.update({ dice: true, rules: false, rollHistory: false }, 2)
  assert.deepEqual(names(ctx), ['rollDice'])
  const result = await ctx.tools.execute({ name: 'rollDice', callId: 'still-same-scope', arguments: { rolls: ['d1'] }, signal: new AbortController().signal })
  assert.deepEqual(JSON.parse(result.content[0].text), { rollId: 'still-same-scope', values: [1] })
  await provider.update({ dice: false, rules: false, rollHistory: false }, 3)
  assert.deepEqual(names(ctx), [])
  await provider.update({ dice: true, rules: true, rollHistory: true }, 4)
  assert.deepEqual(names(ctx), ['getRollDetails', 'resolveCheck', 'rollDice'])
  await mount.dispose()
  assert.deepEqual(names(ctx), [])
  await provider.update({ dice: false, rules: false, rollHistory: false }, 5)
  assert.deepEqual(names(ctx), [])
})

test('a running reply retains its tools; saved changes settle when the reply ends', async t => {
  const { ctx, provider, setBusy } = await runtime(t)
  setBusy(true)
  const saved = await provider.update({ dice: false, rules: false, rollHistory: false }, 0)
  assert.equal(saved.pending, true)
  assert.deepEqual(names(ctx), ['getRollDetails', 'resolveCheck', 'rollDice'])
  setBusy(false); ctx.emit('agent/status', { status: 'idle' }); await provider.refresh()
  assert.equal(provider.read().pending, false)
  assert.deepEqual(names(ctx), [])
})

test('invalid preferences and failed writes keep the existing runtime', async t => {
  const { ctx, provider } = await runtime(t)
  for (const input of [null, [], {}, { ...DEFAULT_PLUGINS, dice: 'false' }, { ...DEFAULT_PLUGINS, unknown: true }]) assert.throws(() => validatePlugins(input))
  await assert.rejects(provider.update({ ...DEFAULT_PLUGINS, dice: false }, -1))
  assert.deepEqual(names(ctx), ['getRollDetails', 'resolveCheck', 'rollDice'])
  assert.deepEqual(provider.read().plugins, DEFAULT_PLUGINS)
})
