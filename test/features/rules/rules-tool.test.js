import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { Session } from '@deepseek-ai/dsh-session'
import * as Mechanics from '../../../src/host/mechanics-plugin.js'
import { CryptoDiceProvider } from '../../../src/features/dice/host/provider.js'
import { NumericRulesProvider } from '../../../src/features/rules/host/provider.js'
import { registerRulesTool } from '../../../src/features/rules/host/tool.js'
import { readCheckResult } from '../../../src/features/rules/shared/result.js'

test('mechanics compose reversible Dice and Rules services and both native tools', async t => {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt); await ctx.plugin(ToolRuntime)
  const fiber = ctx.plugin(Mechanics); await fiber
  assert.deepEqual(ctx.tools.schemas().map(tool => tool.name), ['rollDice', 'resolveCheck'])
  assert.match(ctx.tools.get('resolveCheck').description, /d20-attack/)
  await fiber.dispose()
  for (const key of ['mayoriDice', 'mayoriRules']) assert.equal(ctx[key], undefined)
  for (const key of ['rollDice', 'resolveCheck']) assert.equal(ctx.tools.get(key), undefined)
})

test('tool compact/full output and session restoration preserve natural-one outcomes without new draws', async t => {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt); await ctx.plugin(ToolRuntime)
  let draws = 0
  new CryptoDiceProvider(ctx, {}, () => { draws++; return 1 })
  new NumericRulesProvider(ctx, ctx.mayoriDice)
  registerRulesTool(ctx)
  const session = Session.create('rules-session')
  for (const details of [false, true]) {
    const result = await ctx.tools.execute({ name: 'resolveCheck', callId: `check-${details}`,
      arguments: { profile: 'd20-critical', target: 5, modifier: 6, details }, signal: new AbortController().signal })
    assert.equal(result.isError, false)
    const value = JSON.parse(result.content[0].text)
    assert.equal(value.check.natural, 1); assert.equal(value.check.total, 7)
    assert.equal(value.check.outcome, 'critical_failure'); assert.equal(Object.hasOwn(value, 'dice'), details)
    session.append('tool/result', { turn: 1, step: 1, message: { id: `result-${details}`, role: 'tool', toolCallId: `check-${details}`,
      source: { kind: 'tool', callId: `check-${details}` }, content: result.content }, meta: result.meta }, { surfaceOp: 'append' })
  }
  const restored = Session.create('restored', JSON.parse(JSON.stringify(session.snapshotEvents())))
  for (const event of restored.snapshotEvents().filter(item => item.type === 'tool/result')) {
    assert.equal(readCheckResult(event.data.message.content, event.data.meta)?.check.outcome, 'critical_failure')
  }
  assert.equal(draws, 2)
  const invalid = await ctx.tools.execute({ name: 'resolveCheck', callId: 'bad', arguments: { profile: 'standard', target: '12' }, signal: new AbortController().signal })
  assert.equal(invalid.isError, true); assert.equal(draws, 2)
})
