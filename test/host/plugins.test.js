import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import * as Dice from '../../src/host/dice-plugin.js'
import * as Rules from '../../src/host/rules-plugin.js'
import * as RollHistory from '../../src/host/roll-history-plugin.js'

async function runtime(t) {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt); await ctx.plugin(ToolRuntime)
  return ctx
}
const tools = ctx => ctx.tools.schemas().map(tool => tool.name).sort()

test('Dice and history are independent plugins; disabling history leaves rolls and logged traces intact', async t => {
  const ctx = await runtime(t)
  const dice = ctx.plugin(Dice); await dice
  assert.deepEqual(tools(ctx), ['rollDice'])
  assert.equal(ctx.mayoriRollHistory, undefined)
  const history = ctx.plugin(RollHistory); await history
  assert.deepEqual(tools(ctx), ['getRollDetails', 'rollDice'])
  await history.dispose()
  assert.deepEqual(tools(ctx), ['rollDice'])
  const rolled = await ctx.tools.execute({ name: 'rollDice', callId: 'only-dice', arguments: { rolls: ['d1'] }, signal: new AbortController().signal })
  assert.equal(rolled.isError, false)
  assert.deepEqual(JSON.parse(rolled.content[0].text), { rollId: 'only-dice', values: [1] })
  assert.deepEqual(rolled.meta.result.details[0].dice[0].results, [1])
  await dice.dispose()
  assert.deepEqual(tools(ctx), [])
})

test('Rules consumes the Dice service without adding rollDice, and unloading dependencies removes its consumer', async t => {
  const ctx = await runtime(t)
  const rules = ctx.plugin(Rules, { profiles: [{ id: 'test', version: '1', sides: 2 }] })
  assert.equal(ctx.tools.get('resolveCheck'), undefined)
  const dice = ctx.plugin(Dice, { exposeTool: false }); await dice; await rules
  assert.ok(ctx.mayoriDice)
  assert.deepEqual(tools(ctx), ['resolveCheck'])
  const checked = await ctx.tools.execute({ name: 'resolveCheck', callId: 'only-check',
    arguments: { profile: 'test', target: 1 }, signal: new AbortController().signal })
  assert.equal(checked.isError, false)
  assert.equal(JSON.parse(checked.content[0].text).check.outcome, 'success')
  const history = ctx.plugin(RollHistory); await history
  assert.deepEqual(tools(ctx), ['getRollDetails', 'resolveCheck'])
  await dice.dispose()
  assert.deepEqual(tools(ctx), ['getRollDetails'])
  assert.equal(ctx.mayoriRules, undefined)
  await history.dispose()
  assert.deepEqual(tools(ctx), [])
})

test('Dice tool exposure and Rules configuration are validated before capability registration', async t => {
  const ctx = await runtime(t)
  assert.throws(() => Dice.apply(ctx, { exposeTool: 'false' }), /exposeTool must be a boolean/)
  assert.equal(ctx.mayoriDice, undefined)
  assert.throws(() => Rules.apply(ctx, { profiles: [] }), /1 to 32 profiles/)
  assert.throws(() => Rules.apply(ctx), /requires the mayoriDice service/)
  Dice.apply(ctx, { exposeTool: false, maxSides: 10 })
  assert.throws(() => Rules.apply(ctx), /Dice provider limits/)
  assert.equal(ctx.mayoriRules, undefined)
  assert.deepEqual(tools(ctx), [])
})
