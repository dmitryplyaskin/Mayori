import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { CryptoDiceProvider, DEFAULT_DICE_CONFIG, resolveDiceConfig } from '../src/dice.js'

function harness(t, config = {}, faces = []) {
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  const calls = []
  new CryptoDiceProvider(ctx, config, sides => {
    calls.push(sides)
    assert.ok(faces.length, 'Unexpected draw')
    return faces.shift()
  })
  return { service: ctx.mayoriDice, calls }
}

test('preserves nested shapes and exact paths, sums independent dice, and records every face', t => {
  const { service, calls } = harness(t, {}, [4, 8, 2, 3, 6, 5, 6])
  const input = { action1: 'd8', action2: { 'action2.1': 'd12' }, action3: ['3d6 + 4', '2d8 / 2'] }
  const copy = structuredClone(input)
  const result = service.roll(input)
  assert.deepEqual(result.values, { action1: 4, action2: { 'action2.1': 8 }, action3: [15, 5.5] })
  assert.deepEqual(result.details.map(item => item.path), [['action1'], ['action2', 'action2.1'], ['action3', 0], ['action3', 1]])
  assert.deepEqual(result.details[2].dice, [{ sides: 6, results: [2, 3, 6] }])
  assert.deepEqual(calls, [8, 12, 6, 6, 6, 8, 8])
  assert.deepEqual(input, copy)
})

test('uses arithmetic precedence, left associativity, signs, decimals and explicit rounding', t => {
  const { service } = harness(t)
  const expressions = ['2 + 3 * 4', '(2 + 3) * 4', '8 / 2 / 2', '8 - 2 - 1',
    '-(2 + 3)', '--2', 'floor(11 / 2)', 'ceil(11 / 2)', 'round(11 / 2)',
    'floor(-1.5)', 'ceil(-1.5)', 'round(-1.5)', '.5 + 1.25', '-0']
  assert.deepEqual(service.roll(expressions).values, [14, 20, 2, 5, -5, 2, 5, 6, 6, -2, -1, -1, 1.75, 0])
})

test('repeated occurrences and identical leaves draw independently; arbitrary dN needs no catalog', t => {
  const { service, calls } = harness(t, {}, [1, 2, 3, 4, 37])
  const result = service.roll(['d6 + d6', 'd6', 'd6', 'D37'])
  assert.deepEqual(result.values, [3, 3, 4, 37])
  assert.deepEqual(calls, [6, 6, 6, 6, 37])
  assert.equal(result.details[0].dice.length, 2)
})

test('validates the complete request before any draw and reports the failing path', t => {
  const { service, calls } = harness(t)
  for (const expression of ['', 'd0', 'd-1', 'd1.5', '0d6', '1.5d6', 'd1000001',
    '1001d6', 'd6 +', 'd6 / 0', 'd6 / (3 - 3)', 'd6; process.exit()',
    'roll(8)', 'Math.random()', '2(3)', '2 ** 3', '2e3', '2d6kh1', 'floor(1, 2)',
    '9007199254740992', '9007199254740991 * 2']) {
    assert.throws(() => service.roll({ good: 'd6', nested: { bad: expression } }),
      error => error instanceof TypeError && error.message.includes('["nested","bad"]'), expression)
  }
  for (const invalid of [null, true, 3, 'd6', {}, [], { a: null }, { a: 1 }, { a: new Date() }, [,'d6']]) {
    assert.throws(() => service.roll(invalid), TypeError)
  }
  assert.deepEqual(calls, [])
})

test('enforces request-wide dice, expression, node, length and depth budgets before drawing', t => {
  const cases = [
    [{ maxDice: 3 }, ['2d6', '2d6']],
    [{ maxExpressions: 1 }, ['d6', 'd6']],
    [{ maxNodes: 2 }, ['d6', 'd6']],
    [{ maxDepth: 1 }, { a: ['d6'] }],
    [{ maxExpressionLength: 3 }, ['d6+1']],
    [{ maxExpressionDepth: 2 }, ['(((d6)))']],
    [{ maxExpressionDepth: 2 }, ['---d6']],
    [{ maxExpressionDepth: 2 }, ['floor(ceil(round(d6)))']],
    [{ maxExpressionDepth: 2 }, ['d6 + 1 + 1']],
  ]
  for (const [config, input] of cases) {
    const { service, calls } = harness(t, config)
    assert.throws(() => service.roll(input), TypeError)
    assert.equal(calls.length, 0)
  }
  const cyclic = {}; cyclic.self = cyclic
  assert.throws(() => harness(t).service.roll(cyclic), /Cyclic/)
})

test('runtime division by zero retains consumed draws and stops without returning partial values', t => {
  const { service, calls } = harness(t, {}, [4, 2, 1])
  const result = service.roll({ first: 'd8', broken: 'd6 / (d6 - 1)', later: 'd20' })
  assert.equal(result.values, null)
  assert.deepEqual(result.error, { path: ['broken'], message: 'Division by zero' })
  assert.deepEqual(result.details, [
    { path: ['first'], expression: 'd8', dice: [{ sides: 8, results: [4] }], value: 4 },
    { path: ['broken'], expression: 'd6 / (d6 - 1)', dice: [{ sides: 6, results: [2] }, { sides: 6, results: [1] }], error: 'Division by zero' },
  ])
  assert.deepEqual(calls, [8, 6, 6])
})

test('runtime numeric overflow is recorded with the actual face', t => {
  const { service } = harness(t, {}, [2])
  const result = service.roll(['d6 * 9007199254740991'])
  assert.equal(result.values, null)
  assert.match(result.error.message, /safe numeric range/)
  assert.deepEqual(result.details[0].dice[0].results, [2])
})

test('preserves special JSON keys without changing object prototypes', t => {
  const { service } = harness(t, {}, [1, 2, 3])
  const result = service.roll(JSON.parse('{"__proto__":"d6","constructor":"d6","a.b":"d6"}'))
  assert.equal(Object.getPrototypeOf(result.values), Object.prototype)
  assert.equal(Object.hasOwn(result.values, '__proto__'), true)
  assert.equal(result.values.__proto__, 1)
  assert.deepEqual(result.details.map(item => item.path), [['__proto__'], ['constructor'], ['a.b']])
})

test('rejects invalid configuration and honors boundary limits', t => {
  assert.deepEqual(resolveDiceConfig(), DEFAULT_DICE_CONFIG)
  for (const value of [0, -1, 1.5, NaN, Infinity, '4', null, 1_000_000_001]) {
    assert.throws(() => resolveDiceConfig({ maxSides: value }), /maxSides/)
  }
  assert.throws(() => resolveDiceConfig({ arbitrary: 1 }), /Unknown/)
  const { service } = harness(t, { maxSides: 37, maxDice: 1, maxExpressions: 1, maxNodes: 2, maxDepth: 1 }, [37])
  assert.deepEqual(service.roll(['d37']).values, [37])
})

test('pre-aborted requests consume no randomness and invalid provider faces are rejected', t => {
  const { service, calls } = harness(t)
  assert.throws(() => service.roll(['d6'], { signal: AbortSignal.abort() }), { name: 'AbortError' })
  assert.equal(calls.length, 0)
  assert.throws(() => harness(t, {}, [0]).service.roll(['d6']), /invalid face/)
})

test('production provider returns genuine faces within arbitrary numeric dice bounds', t => {
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  new CryptoDiceProvider(ctx)
  const result = ctx.mayoriDice.roll(['d1', '100d37'])
  assert.equal(result.values[0], 1)
  const faces = result.details[1].dice[0].results
  assert.equal(faces.length, 100)
  assert.ok(faces.every(value => Number.isInteger(value) && value >= 1 && value <= 37))
  assert.equal(result.values[1], faces.reduce((sum, value) => sum + value, 0))
})
