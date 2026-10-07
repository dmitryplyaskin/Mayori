import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import { CryptoDiceProvider } from '../../../src/features/dice/host/provider.js'
import { NumericRulesProvider } from '../../../src/features/rules/host/provider.js'
import { resolveRulesConfig } from '../../../src/features/rules/domain/check.js'
import { compactCheckResult, readCheckResult } from '../../../src/features/rules/shared/result.js'

function harness(t, faces, config = {}, limits = {}) {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  const calls = []
  new CryptoDiceProvider(ctx, limits, sides => { calls.push(sides); assert.ok(faces.length, 'Unexpected draw'); return faces.shift() })
  new NumericRulesProvider(ctx, ctx.mayoriDice, config)
  return { rules: ctx.mayoriRules, calls }
}
const content = value => [{ type: 'text', text: JSON.stringify(value) }]

test('natural one remains a critical failure despite modifiers and never draws damage', t => {
  const { rules, calls } = harness(t, [1])
  const result = rules.resolve({ profile: 'd20-critical', modifier: 6, target: 5, damage: { normal: 'd6+3', critical: '2d6+3' } })
  assert.deepEqual(result.check, { natural: 1, modifier: 6, total: 7, target: 5, margin: 2, outcome: 'critical_failure', reason: 'natural-critical-failure' })
  assert.equal(result.damage, null); assert.equal(result.consequence, null)
  assert.deepEqual(calls, [20])
})

test('critical success overrides target, rolls declared extra damage dice, and retains the modifier once', t => {
  const { rules, calls } = harness(t, [20, 2, 4])
  const result = rules.resolve({ profile: 'd20-attack', modifier: 3, target: 40, damage: { normal: 'd6+3', critical: '2d6+3' } })
  assert.equal(result.check.outcome, 'critical_success'); assert.equal(result.check.total, 23)
  assert.deepEqual(result.damage, { value: 9, expression: '2d6+3' })
  assert.deepEqual(calls, [20, 6, 6])
})

test('advantage and disadvantage classify only the selected die, including equal faces', t => {
  for (const [mode, faces, expected, natural] of [
    ['advantage', [1, 17], 'success', 17], ['disadvantage', [20, 8], 'failure', 8],
    ['advantage', [20, 20], 'critical_success', 20], ['disadvantage', [1, 1], 'critical_failure', 1],
  ]) {
    const { rules, calls } = harness(t, faces)
    const result = rules.resolve({ profile: 'd20-critical', target: 12, mode })
    assert.equal(result.check.outcome, expected); assert.equal(result.check.natural, natural)
    assert.deepEqual(calls, [20, 20])
    assert.equal(readCheckResult(content(result))?.check.natural, natural)
  }
})

test('standard checks have no implicit criticals; d20 attacks have no extra natural-one penalty', t => {
  for (const [profile, natural, modifier, target, outcome, reason] of [
    ['standard', 1, 20, 12, 'success', 'target-met'], ['standard', 20, 0, 30, 'failure', 'target-missed'],
    ['d20-attack', 1, 20, 12, 'failure', 'natural-failure'],
  ]) {
    const { rules } = harness(t, [natural])
    const result = rules.resolve({ profile, modifier, target })
    assert.equal(result.check.outcome, outcome); assert.equal(result.check.reason, reason)
    assert.equal(result.consequence, null)
  }
})

test('configured failure effects and random tables are recorded before rolling and use real provider draws', t => {
  const config = { profiles: [{ id: 'table', version: 'house-2', sides: 20, criticalSuccessMin: 20, criticalFailureMax: 1,
    failureEffect: 'Потеря времени', criticalFailureEffects: ['Потеря равновесия', 'Шум привлекает внимание'] }] }
  const { rules, calls } = harness(t, [1, 2, 5], config)
  const critical = rules.resolve({ profile: 'table', modifier: 6, target: 12 })
  assert.deepEqual(critical.consequence, { text: 'Шум привлекает внимание', index: 2 })
  assert.equal(critical.rules.version, 'house-2')
  const failure = rules.resolve({ profile: 'table', target: 12 })
  assert.deepEqual(failure.consequence, { text: 'Потеря времени' })
  assert.deepEqual(calls, [20, 2, 20])
  config.profiles[0].criticalFailureEffects[1] = 'Изменено'
  assert.equal(readCheckResult(content(critical)).consequence.text, 'Шум привлекает внимание')
})

test('invalid requests, damage expressions and budgets fail before any randomness', t => {
  const { rules, calls } = harness(t, [])
  for (const input of [
    { profile: 'missing', target: 12 }, { profile: 'standard', target: Infinity }, { profile: 'standard', target: 12, mode: 'other' },
    { profile: 'standard', target: 12, modifier: Number.MAX_SAFE_INTEGER },
    { profile: 'standard', target: 12, damage: { normal: 'd6/0' } },
    { profile: 'd20-critical', target: 12, damage: { normal: 'd6' } },
    { profile: 'd20-critical', target: 12, damage: { normal: 'd6', critical: 'd0' } },
    { profile: 'standard', target: 12, damage: { normal: 'true' } },
    { profile: 'standard', target: 12, damage: { normal: '1000d6' } },
    { profile: 'standard', target: 12, purpose: ' '.repeat(400) + 'a' },
  ]) assert.throws(() => rules.resolve(input), TypeError)
  assert.deepEqual(calls, [])
})

test('failure of the random provider propagates rather than fabricating a check or retrying', t => {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  let calls = 0
  new CryptoDiceProvider(ctx, {}, () => { calls++; throw new Error('Unavailable random source') })
  new NumericRulesProvider(ctx, ctx.mayoriDice)
  assert.throws(() => ctx.mayoriRules.resolve({ profile: 'standard', target: 12 }), /Unavailable random source/)
  assert.equal(calls, 1)
})

test('runtime damage errors preserve the resolved check and actual damage faces without retrying', t => {
  const { rules, calls } = harness(t, [15, 6, 6], {}, { maxDice: 3 })
  const result = rules.resolve({ profile: 'standard', target: 12, damage: { normal: 'd6!' } })
  assert.equal(result.check.outcome, 'success'); assert.equal(result.damage, null)
  assert.equal(result.errors[0].code, 'dice_limit')
  assert.deepEqual(result.dice.details.find(item => item.path[0] === 'damage').dice[0].results, [6, 6])
  assert.deepEqual(calls, [20, 6, 6])
  assert.deepEqual(readCheckResult(content(result)), result)
})

test('recorded compact and full results reject altered outcomes, rules, damage, tables or natural faces', t => {
  const { rules } = harness(t, [20, 4, 2])
  const result = rules.resolve({ profile: 'd20-critical', target: 12, purpose: 'Атака', damage: { normal: 'd6', critical: '2d6' } })
  assert.deepEqual(readCheckResult(content(result)), result)
  const compact = compactCheckResult(result), meta = { kind: 'mayori-check', result }
  assert.deepEqual(readCheckResult(content(compact), meta), result)
  assert.equal(readCheckResult(content(compact)), null)
  for (const mutate of [
    value => { value.schemaVersion = 2 }, value => { value.check.natural = 1 }, value => { value.check.outcome = 'failure' },
    value => { value.rules.criticalSuccessMin = 0 }, value => { value.damage.value = 30 },
    value => { value.request.damage.critical = '10d6' }, value => { value.consequence = { text: 'Invented' } },
    value => { value.dice.values.natural = 1 }, value => { value.errors = [{ message: 'Other' }] },
  ]) { const damaged = structuredClone(result); mutate(damaged); assert.equal(readCheckResult(content(damaged)), null) }
  assert.equal(readCheckResult(content({ ...compact, check: { ...compact.check, total: 999 } }), meta), null)
})

test('profile validation, cancellation and tiny decimal modifiers remain deterministic', t => {
  for (const config of [{ profiles: [] }, { profiles: [{ id: 'x', version: '1', sides: 20, criticalSuccessMin: 1, criticalFailureMax: 1 }] },
    { profiles: [{ id: 'x', version: '1', sides: 20, criticalFailureEffects: ['Oops'] }] }, { hidden: true }]) assert.throws(() => resolveRulesConfig(config), TypeError)
  const { rules, calls } = harness(t, [12])
  const controller = new AbortController(); controller.abort()
  assert.throws(() => rules.resolve({ profile: 'standard', target: 12 }, { signal: controller.signal }), { name: 'AbortError' })
  assert.deepEqual(calls, [])
  const result = rules.resolve({ profile: 'standard', target: 12, modifier: 1e-7 })
  assert.equal(result.check.total, 12.0000001)
  assert.equal(readCheckResult(content(result))?.check.total, 12.0000001)
})
