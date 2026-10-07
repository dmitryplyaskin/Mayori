import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { CryptoDiceProvider, DEFAULT_DICE_CONFIG, resolveDiceConfig } from '../src/dice.js'
import { readDiceResult } from '../src/dice-result.js'
function harness(t, config = {}, faces = []) {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  const calls = []
  new CryptoDiceProvider(ctx, config, sides => { calls.push(sides); assert.ok(faces.length, 'Unexpected draw'); return faces.shift() })
  return { service: ctx.mayoriDice, calls }
}
const replay = value => readDiceResult([{ type: 'text', text: JSON.stringify(value) }])

test('preserves nested shapes, paths, independent faces and immutable input', t => {
  const { service, calls } = harness(t, {}, [4, 8, 2, 3, 6, 5, 6])
  const input = { action1: 'd8', action2: { 'action2.1': 'd12' }, action3: ['3d6 + 4', '2d8 / 2'] }, copy = structuredClone(input)
  const result = service.roll(input)
  assert.deepEqual(result.values, { action1: 4, action2: { 'action2.1': 8 }, action3: [15, 5.5] })
  assert.deepEqual(result.details.map(item => item.path), [['action1'], ['action2', 'action2.1'], ['action3', 0], ['action3', 1]])
  assert.deepEqual(result.details[2].dice[0].results, [2, 3, 6]); assert.deepEqual(calls, [8, 12, 6, 6, 6, 8, 8]); assert.deepEqual(input, copy)
  assert.deepEqual(replay(result), result)
})
test('arithmetic keeps precedence, associativity, signs, decimals and explicit rounding', t => {
  const { service } = harness(t)
  assert.deepEqual(service.roll(['2 + 3 * 4', '(2 + 3) * 4', '8 / 2 / 2', '8 - 2 - 1', '-(2 + 3)', '--2',
    'floor(11 / 2)', 'ceil(11 / 2)', 'round(11 / 2)', 'floor(-1.5)', 'ceil(-1.5)', 'round(-1.5)', '.5 + 1.25', '-0']).values,
  [14, 20, 2, 5, -5, 2, 5, 6, 6, -2, -1, -1, 1.75, 0])
})
test('identical leaves and occurrences draw independently; arbitrary dN needs no catalog', t => {
  const { service, calls } = harness(t, {}, [1, 2, 3, 4, 37])
  assert.deepEqual(service.roll(['d6 + d6', 'd6', 'd6', 'D37']).values, [3, 3, 4, 37]); assert.deepEqual(calls, [6, 6, 6, 6, 37])
})
test('invalid expressions are isolated and consume no draws while valid neighbors resolve', t => {
  for (const expression of ['', 'd0', 'd-1', 'd1.5', '0d6', '1.5d6', 'd1000001', '1001d6', 'd6 +', 'd6 / 0', 'd6 / (3 - 3)',
    'd6; process.exit()', 'roll(8)', 'Math.random()', '2(3)', '2 ** 3', '2e3', '2d6kh0', '2d6kh3', '2d6kl1.5', '2d6kh', '2d6kh1kl1', 'floor(1, 2)',
    '9007199254740992', '9007199254740991 * 2', 'd1!', 'd6r>=1', 'd6r!=0', 'd6!!', 'd6ror<3', 'd6kh1!', 'if(true,d6)', 'count(d6 + 1, >=3)',
    'ref([])', 'ref(["missing"])', '$missing']) {
    const { service, calls } = harness(t, {}, [3])
    const result = service.roll({ good: 'd6', nested: { bad: expression } })
    assert.deepEqual(result.values, { good: 3, nested: { bad: null } }, expression)
    assert.deepEqual(result.errors[0].path, ['nested', 'bad']); assert.equal(result.errors.length, 1)
    assert.deepEqual(calls, [6], expression)
    assert.deepEqual(replay(result), result, expression)
  }
})
test('invalid batch shape and global initial dice, node, expression and tree depth limits reject before drawing', t => {
  for (const invalid of [null, true, 3, 'd6', {}, [], { a: null }, { a: 1 }, { a: new Date() }, [,'d6']]) assert.throws(() => harness(t).service.roll(invalid), TypeError)
  for (const [config, input] of [[{ maxDice: 3 }, ['2d6', '2d6']], [{ maxExpressions: 1 }, ['d6', 'd6']],
    [{ maxNodes: 2 }, ['d6', 'd6']], [{ maxDepth: 1 }, { a: ['d6'] }], [{ maxDice: 1 }, ['if(true,d6,d6)']]]) {
    const { service, calls } = harness(t, config); assert.throws(() => service.roll(input), TypeError); assert.equal(calls.length, 0)
  }
  const cyclic = {}; cyclic.self = cyclic; assert.throws(() => harness(t).service.roll(cyclic), /Cyclic/)
})
test('expression length and nesting limits isolate the affected expression', t => {
  for (const [config, expression] of [[{ maxExpressionLength: 3 }, 'd6+1'], [{ maxExpressionDepth: 2 }, '(((d6)))'],
    [{ maxExpressionDepth: 2 }, '---d6'], [{ maxExpressionDepth: 2 }, 'floor(ceil(round(d6)))'], [{ maxExpressionDepth: 2 }, 'd6 + 1 + 1']]) {
    const { service, calls } = harness(t, config)
    const result = service.roll([expression]); assert.deepEqual(result.values, [null]); assert.equal(result.errors.length, 1); assert.equal(calls.length, 0)
  }
})
test('runtime division and overflow retain faces and allow following fields to resolve', t => {
  const { service, calls } = harness(t, {}, [4, 2, 1, 12, 2])
  const result = service.roll({ first: 'd8', broken: 'd6 / (d6 - 1)', later: 'd20', overflow: 'd6 * 9007199254740991' })
  assert.deepEqual(result.values, { first: 4, broken: null, later: 12, overflow: null })
  assert.deepEqual(result.errors.map(error => error.code), ['division_by_zero', 'numeric_range'])
  assert.deepEqual(result.details[1].dice.map(group => group.results), [[2], [1]])
  assert.deepEqual(calls, [8, 6, 6, 20, 6]); assert.deepEqual(replay(result), result)
})
test('special object keys and exact typed paths remain safe', t => {
  const { service } = harness(t, {}, [1, 2, 3])
  const input = JSON.parse('{"__proto__":"d6","constructor":"d6","a.b":"d6"}')
  input.copy = 'ref(["__proto__"]) + ref(["a.b"])'
  const result = service.roll(input)
  assert.equal(Object.getPrototypeOf(result.values), Object.prototype); assert.equal(Object.hasOwn(result.values, '__proto__'), true)
  assert.equal(result.values.copy, 4); assert.deepEqual(replay(result), result)
  const wrong = service.roll({ array: ['2'], copy: 'ref(["array","0"])' }); assert.equal(wrong.errors[0].code, 'invalid_reference')
})
test('validates deployment config, honors boundary limits and pre-aborted requests draw nothing', t => {
  assert.deepEqual(resolveDiceConfig(), DEFAULT_DICE_CONFIG)
  for (const value of [0, -1, 1.5, NaN, Infinity, '4', null, 1_000_000_001]) assert.throws(() => resolveDiceConfig({ maxSides: value }), /maxSides/)
  assert.throws(() => resolveDiceConfig({ arbitrary: 1 }), /Unknown/)
  for (const key of ['maxExtraRollsPerDie', 'maxDependencyDepth']) assert.throws(() => resolveDiceConfig({ [key]: 0 }), new RegExp(key))
  const { service, calls } = harness(t, { maxSides: 37, maxDice: 1, maxExpressions: 1, maxNodes: 2, maxDepth: 1 }, [37])
  assert.throws(() => service.roll(['d37'], { signal: AbortSignal.abort() }), { name: 'AbortError' }); assert.equal(calls.length, 0)
  assert.deepEqual(service.roll(['d37']).values, [37]); assert.throws(() => harness(t, {}, [0]).service.roll(['d6']), /invalid face/)
})
test('production provider returns real faces within arbitrary dice bounds', t => {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose()); new CryptoDiceProvider(ctx)
  const result = ctx.mayoriDice.roll(['d1', '100d37']), faces = result.details[1].dice[0].results
  assert.equal(result.values[0], 1); assert.equal(faces.length, 100); assert.ok(faces.every(value => Number.isInteger(value) && value >= 1 && value <= 37))
  assert.equal(result.values[1], faces.reduce((sum, value) => sum + value, 0)); assert.deepEqual(replay(result), result)
})
test('keep-highest/lowest retain faces, resolve ties by original order and support case/whitespace', t => {
  const { service } = harness(t, {}, [8, 17, 8, 17, 1, 5, 3, 6, 6, 6, 1, 6])
  const result = service.roll(['2d20kh1 + 4', '2d20kl1', '4d6kh3', '4D6 KH 2'])
  assert.deepEqual(result.values, [21, 8, 14, 12]); assert.deepEqual(result.details.map(detail => detail.dice[0].keptIndices), [[1], [0], [1, 2, 3], [0, 1]])
  assert.deepEqual(replay(result), result)
})
test('comparisons return strict booleans; count tests individual kept chains rather than sums', t => {
  const { service } = harness(t, {}, [3, 8, 10, 7, 9, 1, 2, 3, 4, 5, 1, 2, 6])
  const result = service.roll(['count(5d10, >=8)', '5d10 >= 8', 'count(3d6kh2, !=2)',
    '2 > 1', '2 >= 2', '2 < 1', '2 <= 2', 'true == false', 'true != false', 'not false and true or false', 'min(3,2,1)', 'max(3,2,1)', 'true + 1', 'if(1,d6,0)', 'true == 1'])
  assert.deepEqual(result.values, [3, true, 1, true, true, false, true, false, true, true, 1, 3, null, null, null])
  assert.equal(result.errors.length, 3); assert.deepEqual(replay(result), result)
})
test('explosions recur, retain complete chains, and keep/count operate on chain totals', t => {
  const { service, calls } = harness(t, {}, [6, 6, 3, 6, 2, 5, 6, 1, 6, 4, 2])
  const result = service.roll(['d6!', '2d6!kh1', 'count(3d6!, >=7)'])
  assert.deepEqual(result.values, [15, 8, 2]); assert.equal(calls.length, 11)
  assert.deepEqual(result.details[0].dice[0].chains, [{ indices: [0, 1, 2], value: 15 }])
  assert.deepEqual(result.details[1].dice[0].keptIndices, [0, 1]); assert.deepEqual(replay(result), result)
})
test('once and repeated rerolls replace faces and retain their original history', t => {
  const { service } = harness(t, {}, [1, 2, 1, 2, 4, 1, 6, 1, 3])
  const result = service.roll(['d6ro<3', 'd6r<3', 'd6ro<3!'])
  assert.deepEqual(result.values, [2, 4, 9])
  assert.deepEqual(result.details[0].dice[0].keptIndices, [1])
  assert.deepEqual(result.details[1].dice[0].draws.map(draw => draw.reason), ['initial', 'reroll', 'reroll'])
  assert.deepEqual(result.details[2].dice[0].draws.map(draw => draw.reason), ['initial', 'reroll', 'explode', 'reroll'])
  assert.deepEqual(replay(result), result)
})
test('draw and per-die extra limits error without truncated totals and preserve independent following fields', t => {
  const { service, calls } = harness(t, { maxExtraRollsPerDie: 2 }, [6, 6, 6, 3])
  const result = service.roll({ explosion: 'd6!', later: 'd6' })
  assert.deepEqual(result.values, { explosion: null, later: 3 }); assert.equal(result.errors[0].code, 'extra_roll_limit'); assert.equal(calls.length, 4)
  assert.deepEqual(result.details[0].dice[0].results, [6, 6, 6]); assert.deepEqual(replay(result), result)
  const limited = harness(t, { maxDice: 2 }, [6, 6]).service.roll(['d6!', 'd6'])
  assert.deepEqual(limited.values, [null, null]); assert.deepEqual(limited.errors.map(error => error.code), ['dice_limit', 'dice_limit']); assert.deepEqual(replay(limited), limited)
  const reroll = harness(t, { maxExtraRollsPerDie: 1 }, [1, 2]).service.roll(['d6r<3'])
  assert.equal(reroll.errors[0].code, 'extra_roll_limit'); assert.deepEqual(replay(reroll), reroll)
})
test('forward/nested references reuse results and false values, with durable global draw ordering', t => {
  const { service, calls } = harness(t, {}, [2, 3, 4, 5])
  const result = service.roll({ calculated: 'd6 + $source + d6', source: '2d6', repeated: '$source + $source', checks: ['false'], flag: 'not ref(["checks",0])' })
  assert.deepEqual(result.values, { calculated: 14, source: 7, repeated: 14, checks: [false], flag: true }); assert.equal(calls.length, 4)
  assert.deepEqual(result.details[0].dice.map(group => group.draws[0].drawIndex), [0, 3]); assert.deepEqual(replay(result), result)
})
test('lazy conditions and logical operations do not draw in unselected branches or demand failed dependencies there', t => {
  const { service, calls } = harness(t, {}, [2, 8])
  const result = service.roll({ damage: 'if($hit, 2d6!, 0)', attack: 'd20', hit: '$attack >= 15', unused: '1 / 0',
    safe: 'if(false,$unused,d8)', left: 'false and (d6 > 0)', right: 'true or (d6 > 0)', skippedMath: 'if(true,5,1 / 0)' })
  assert.deepEqual(result.values, { damage: 0, attack: 2, hit: false, unused: null, safe: 8, left: false, right: true, skippedMath: 5 })
  assert.deepEqual(calls, [20, 8]); assert.equal(result.errors.length, 1); assert.equal(result.details[0].decisions[0].branch, 'else'); assert.deepEqual(replay(result), result)
})
test('hit and half-damage examples execute only selected dice and use the same base damage', t => {
  const first = harness(t, {}, [17, 6, 2]).service.roll({ attack: 'd20 + 5', hit: '$attack >= 15', damage: 'if($hit,d6!,0)' })
  assert.deepEqual(first.values, { attack: 22, hit: true, damage: 8 }); assert.deepEqual(replay(first), first)
  const second = harness(t, {}, [15, 3, 4, 6]).service.roll({ save: 'd20 + 3 >= 14', baseDamage: '3d6', damage: 'if($save,floor($baseDamage / 2),$baseDamage)' })
  assert.deepEqual(second.values, { save: true, baseDamage: 13, damage: 6 }); assert.deepEqual(replay(second), second)
})
test('cycles, missing references and failed dependencies are isolated before random use', t => {
  const { service, calls } = harness(t, {}, [4])
  const result = service.roll({ a: '$b', b: '$a', c: '$a + d6', missing: '$nope', valid: 'd6', self: 'if(false,$self,0)' })
  assert.deepEqual(result.values, { a: null, b: null, c: null, missing: null, valid: 4, self: null })
  assert.deepEqual(result.errors.map(error => error.code), ['reference_cycle', 'reference_cycle', 'dependency_failed', 'invalid_reference', 'reference_cycle'])
  assert.deepEqual(calls, [6]); assert.deepEqual(replay(result), result)
})
test('dependency limits and purpose validation are bounded and versioned', t => {
  const { service, calls } = harness(t, { maxPurposeLength: 12, maxDependencyDepth: 2 }, [4, 5])
  for (const purpose of ['', ' ', 5, null, 'x'.repeat(13)]) assert.throws(() => service.roll(['d6'], { purpose }), /purpose/)
  assert.equal(calls.length, 0)
  const result = service.roll({ a: '$b', b: '$c', c: 'd6', independent: 'd6' }, { purpose: ' Скрытность ' })
  assert.equal(result.schemaVersion, 2); assert.equal(result.purpose, 'Скрытность'); assert.deepEqual(result.values, { a: null, b: 4, c: 4, independent: 5 })
  assert.equal(result.errors[0].code, 'dependency_depth'); assert.deepEqual(replay(result), result)
  const reordered = harness(t, { maxDependencyDepth: 2 }, [4, 5]).service.roll({ c: 'd6', b: '$c', a: '$b', independent: 'd6' })
  assert.deepEqual(reordered.errors, result.errors)
})

test('maximum expression and dependency depths cannot multiply into a native stack overflow', t => {
  const { service, calls } = harness(t, { maxDependencyDepth: 128, maxExpressions: 128, maxExpressionDepth: 128 })
  const rolls = Object.fromEntries(Array.from({ length: 128 }, (_, index) => ['v' + index,
    index === 127 ? '1' : '-'.repeat(127) + '$v' + (index + 1)]))
  const result = service.roll(rolls)
  assert.deepEqual(result.errors, [])
  assert.equal(result.values.v0, -1)
  assert.equal(result.values.v127, 1)
  assert.equal(calls.length, 0)
  assert.deepEqual(replay(result), result)
})
