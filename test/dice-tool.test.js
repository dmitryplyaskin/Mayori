import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { Session } from '@deepseek-ai/dsh-session'
import { CryptoDiceProvider } from '../src/dice.js'
import * as DicePlugin from '../src/dice-tool.js'

async function runtime(t) {
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(ToolRuntime)
  return ctx
}

test('registers the native tool and service through Cordis and removes both on unload', async t => {
  const ctx = await runtime(t)
  const fiber = ctx.plugin(DicePlugin)
  await fiber
  assert.equal(ctx.tools.schemas().find(tool => tool.name === 'rollDice').parameters.properties.rolls.oneOf.length, 2)
  const result = await ctx.tools.execute({ name: 'rollDice', callId: 'dice-1', arguments: { rolls: { one: 'd1', custom: 'd37' } }, signal: new AbortController().signal })
  assert.equal(result.isError, false)
  const rendered = JSON.parse(result.content[0].text)
  assert.deepEqual(rendered, result.value)
  assert.equal(rendered.values.one, 1)
  assert.ok(rendered.values.custom >= 1 && rendered.values.custom <= 37)
  await fiber.dispose()
  assert.equal(ctx.tools.get('rollDice'), undefined)
  assert.equal(ctx.mayoriDice, undefined)
})

test('consumer uses a replaceable provider; errors retain trace in model-visible result content', async t => {
  const ctx = await runtime(t)
  const faces = [2, 1]
  new CryptoDiceProvider(ctx, {}, () => faces.shift())
  DicePlugin.registerDiceTool(ctx)
  const result = await ctx.tools.execute({ name: 'rollDice', callId: 'dice-2', arguments: { rolls: ['d6 / (d6 - 1)'] }, signal: new AbortController().signal })
  const value = JSON.parse(result.content[0].text)
  assert.equal(value.values, null)
  assert.deepEqual(value.details[0].dice.map(item => item.results), [[2], [1]])
  assert.match(value.error.message, /Division by zero/)
  assert.equal(faces.length, 0)
})

test('schema and expression failures become normal DSH tool errors before drawing', async t => {
  const ctx = await runtime(t)
  let draws = 0
  new CryptoDiceProvider(ctx, {}, () => { draws++; return 1 })
  DicePlugin.registerDiceTool(ctx)
  for (const argumentsValue of [{}, { rolls: 6 }, { rolls: ['d6', 'd0'] }]) {
    const result = await ctx.tools.execute({ name: 'rollDice', callId: 'invalid', arguments: argumentsValue, signal: new AbortController().signal })
    assert.equal(result.isError, true)
    assert.match(result.content[0].text, /Error:/)
  }
  assert.equal(draws, 0)
})

test('logged rendered results reconstruct all values and faces without invoking the provider again', async t => {
  const ctx = await runtime(t)
  let draws = 0
  new CryptoDiceProvider(ctx, {}, () => { draws++; return 3 })
  DicePlugin.registerDiceTool(ctx)
  const args = { rolls: { action: ['2d6 + 4'] } }
  const result = await ctx.tools.execute({ name: 'rollDice', callId: 'recorded', arguments: args, signal: new AbortController().signal })
  const session = Session.create('dice-session')
  session.append('tool/result', { turn: 1, step: 1, message: {
    id: 'dice-result', role: 'tool', toolCallId: 'recorded', source: { kind: 'tool', callId: 'recorded' }, content: result.content,
  } }, { surfaceOp: 'append' })
  const events = JSON.parse(JSON.stringify(session.snapshotEvents()))
  const restored = Session.create('restored', events)
  const value = JSON.parse(restored.deriveMessages().at(-1).content[0].text)
  assert.deepEqual(value.values, { action: [10] })
  assert.deepEqual(value.details[0].dice, [{ sides: 6, results: [3, 3] }])
  assert.equal(draws, 2)
})
