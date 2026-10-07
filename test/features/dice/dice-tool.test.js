import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { Session } from '@deepseek-ai/dsh-session'
import { CryptoDiceProvider } from '../../../src/features/dice/host/provider.js'
import * as DicePlugin from '../../../src/host/dice-plugin.js'
import { readDiceResult } from '../../../src/features/dice/shared/result.js'

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
  assert.equal(ctx.tools.schemas().find(tool => tool.name === 'rollDice').parameters.properties.details.type, 'boolean')
  const result = await ctx.tools.execute({ name: 'rollDice', callId: 'dice-1', arguments: { details: true, rolls: { one: 'd1', custom: 'd37' } }, signal: new AbortController().signal })
  assert.equal(result.isError, false)
  const rendered = JSON.parse(result.content[0].text)
  assert.deepEqual(rendered, result.value)
  assert.equal(rendered.values.one, 1)
  assert.ok(rendered.values.custom >= 1 && rendered.values.custom <= 37)
  await fiber.dispose()
  assert.equal(ctx.tools.get('rollDice'), undefined)
  assert.equal(ctx.tools.get('getRollDetails'), undefined)
  assert.equal(ctx.mayoriDice, undefined)
  assert.equal(ctx.mayoriRollHistory, undefined)
})

test('consumer uses a replaceable provider; both response modes retain error traces in the log', async t => {
  const ctx = await runtime(t)
  const faces = [2, 1, 2, 1]
  new CryptoDiceProvider(ctx, {}, () => faces.shift())
  DicePlugin.registerDiceTool(ctx)
  for (const details of [false, true]) {
    const result = await ctx.tools.execute({ name: 'rollDice', callId: `dice-error-${details}`,
      arguments: { details, rolls: ['d6 / (d6 - 1)'] }, signal: new AbortController().signal })
    const value = JSON.parse(result.content[0].text)
    assert.deepEqual(value.values, [null])
    assert.equal(Object.hasOwn(value, 'details'), details)
    assert.deepEqual(result.meta.result.details[0].dice.map(item => item.results), [[2], [1]])
    assert.deepEqual(readDiceResult(result.content, result.meta), result.value)
    assert.match(value.errors[0].message, /Division by zero/)
    assert.equal(value.errors[0].code, 'division_by_zero')
  }
  assert.equal(faces.length, 0)
})

test('schema failures become DSH tool errors before drawing; expression failures stay in their fields', async t => {
  const ctx = await runtime(t)
  let draws = 0
  new CryptoDiceProvider(ctx, {}, () => { draws++; return 1 })
  DicePlugin.registerDiceTool(ctx)
  for (const argumentsValue of [{}, { rolls: 6 },
    ...['true', 1, null, {}].map(details => ({ details, rolls: ['d6'] }))]) {
    const result = await ctx.tools.execute({ name: 'rollDice', callId: 'invalid', arguments: argumentsValue, signal: new AbortController().signal })
    assert.equal(result.isError, true)
    assert.match(result.content[0].text, /Error:/)
  }
  assert.equal(draws, 0)
  const result = await ctx.tools.execute({ name: 'rollDice', callId: 'partial', arguments: { rolls: ['d6', 'd0'] }, signal: new AbortController().signal })
  assert.equal(result.isError, false)
  assert.deepEqual(JSON.parse(result.content[0].text).values, [1, null])
  assert.equal(draws, 1)
})

test('compact logged content and metadata reconstruct all values and faces without invoking the provider again', async t => {
  const ctx = await runtime(t)
  let draws = 0
  new CryptoDiceProvider(ctx, {}, () => { draws++; return 3 })
  DicePlugin.registerDiceTool(ctx)
  const args = { purpose: 'Проверка навыка', rolls: { action: ['2d6kh1 + 4'] } }
  const result = await ctx.tools.execute({ name: 'rollDice', callId: 'recorded', arguments: args, signal: new AbortController().signal })
  const session = Session.create('dice-session')
  session.append('tool/result', { turn: 1, step: 1, message: {
    id: 'dice-result', role: 'tool', toolCallId: 'recorded', source: { kind: 'tool', callId: 'recorded' }, content: result.content,
  }, meta: result.meta }, { surfaceOp: 'append' })
  const events = JSON.parse(JSON.stringify(session.snapshotEvents()))
  const restored = Session.create('restored', events)
  const recorded = restored.snapshotEvents().findLast(event => event.type === 'tool/result').data
  assert.equal(Object.hasOwn(JSON.parse(recorded.message.content[0].text), 'details'), false)
  const value = readDiceResult(recorded.message.content, recorded.meta)
  assert.deepEqual(value.values, { action: [7] })
  assert.equal(value.schemaVersion, 3)
  assert.equal(value.purpose, 'Проверка навыка')
  assert.deepEqual(value.details[0].dice[0].results, [3, 3])
  assert.deepEqual(value.details[0].dice[0].keptIndices, [0])
  assert.deepEqual(value.errors, [])
  assert.equal(draws, 2)
})

test('details is opt-in and affects only model content, with the same complete canonical result and metadata', async t => {
  const ctx = await runtime(t)
  let draws = 0
  new CryptoDiceProvider(ctx, {}, () => { draws++; return 3 })
  DicePlugin.registerDiceTool(ctx)
  for (const options of [{}, { details: false }, { details: true }]) {
    const result = await ctx.tools.execute({ name: 'rollDice', callId: 'projection',
      arguments: { ...options, purpose: 'Атака', rolls: { hit: '2d6kh1 + 4' } }, signal: new AbortController().signal })
    assert.equal(result.isError, false)
    const body = JSON.parse(result.content[0].text)
    assert.deepEqual(body.values, { hit: 7 })
    assert.equal(body.rollId, 'projection')
    if (options.details === true) {
      assert.equal(body.purpose, 'Атака')
      assert.equal(body.schemaVersion, 3)
    } else assert.deepEqual(body, { rollId: 'projection', values: { hit: 7 } })
    assert.equal(Object.hasOwn(body, 'details'), options.details === true)
    assert.deepEqual(result.meta, { kind: 'mayori-dice', result: result.value })
    assert.deepEqual(readDiceResult(result.content, result.meta), result.value)
  }
  assert.equal(draws, 6)
})
