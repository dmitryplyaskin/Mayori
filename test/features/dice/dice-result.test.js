import assert from 'node:assert/strict'
import test from 'node:test'
import { readDiceResult, dicePurpose } from '../../../src/features/dice/shared/result.js'
import { Context } from '@deepseek-ai/cordis'
import { CryptoDiceProvider } from '../../../src/features/dice/host/provider.js'

const content = value => [{ type: 'text', text: JSON.stringify(value) }]
const fixture = () => ({ schemaVersion: 1, purpose: 'Скрытность', values: { attack: 21 }, details: [{
  path: ['attack'], expression: '2d20kh1 + 4', dice: [{ sides: 20, results: [8, 17], keep: { mode: 'highest', count: 1 }, keptIndices: [1] }], value: 21,
}] })

test('version 3 replays mixed errors, booleans, references and modified chains in both response modes', t => {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  const faces = [6, 2, 1, 4, 17, 1]
  new CryptoDiceProvider(ctx, {}, () => faces.shift())
  const full = ctx.mayoriDice.roll({ explosion: 'd6!', reroll: 'd6ro<3', attack: 'd20', hit: '$attack >= 15', damage: 'if($hit,d1,0)', bad: 'd6!!', dependent: '$bad' })
  const { details, ...compact } = full
  const meta = { kind: 'mayori-dice', result: full }
  assert.deepEqual(readDiceResult(content(full)), full)
  assert.deepEqual(readDiceResult(content(compact), meta), full)
  assert.equal(readDiceResult(content(compact)), null)
  for (const mutate of [
    value => { value.schemaVersion = 4 },
    value => { value.errors = [] },
    value => { value.errors[0].code = 'wrong' },
    value => { value.values.hit = null },
    value => { value.details[0].dice[0].draws[1].drawIndex = 0 },
    value => { value.details[0].dice[0].draws[0].reason = 'invented' },
    value => { value.details[0].dice[0].chains[0].indices = [99] },
    value => { value.details[0].dice[0].chains[0].value = 9 },
    value => { value.details[1].dice[0].draws[1].replaces = 99 },
    value => { value.details[1].dice[0].keptIndices = [0, 1] },
    value => { value.details[3].references[0].value = 20 },
    value => { value.details[4].decisions[0].branch = 'else' },
    value => { value.observations[0].groups[0].faces[0] = 1 },
    value => { delete value.observations },
  ]) {
    const damaged = structuredClone(full); mutate(damaged)
    assert.equal(readDiceResult(content(damaged)), null)
  }
  assert.equal(readDiceResult(content({ ...compact, errors: [] }), meta), null)
  assert.equal(faces.length, 0)
})

test('historical version 2 results retain their compact/full contract without observations', t => {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  new CryptoDiceProvider(ctx, {}, () => 3)
  const { observations, ...full } = ctx.mayoriDice.roll({ attack: 'd20+6' })
  full.schemaVersion = 2
  const { details, ...compact } = full
  assert.deepEqual(readDiceResult(content(full)), full)
  assert.deepEqual(readDiceResult(content(compact), { kind: 'mayori-dice', result: full }), full)
})

test('decodes current and unversioned historical results without recomputing any rolls', () => {
  const current = fixture()
  assert.deepEqual(readDiceResult(content(current)), current)
  const legacy = { values: [4], details: [{ path: [0], expression: 'd6', dice: [{ sides: 6, results: [4] }], value: 4 }] }
  assert.deepEqual(readDiceResult(content(legacy)), legacy)
})

test('compact results read a matching durable trace and reject missing, mismatched or damaged metadata', () => {
  const full = fixture()
  const { details, ...compact } = full
  const meta = { kind: 'mayori-dice', result: full }
  assert.deepEqual(readDiceResult(content(compact), meta), full)
  assert.equal(readDiceResult(content(compact)), null)
  assert.equal(readDiceResult(content(compact), { ...meta, kind: 'other' }), null)
  assert.equal(readDiceResult(content({ ...compact, values: { attack: 99 } }), meta), null)
  assert.equal(readDiceResult(content({ ...compact, purpose: 'Другая проверка' }), meta), null)
  assert.equal(readDiceResult(content({ ...compact, schemaVersion: 2 }), meta), null)
  assert.equal(readDiceResult(content({ ...compact, hidden: true }), meta), null)
  assert.equal(readDiceResult(content(compact), { ...meta, result: { ...full, details: [] } }), null)
  assert.equal(readDiceResult(content({ ...full, details: [] }), meta), null)
  const failed = { schemaVersion: 1, values: null, error: { path: [0], message: 'Division by zero' },
    details: [{ path: [0], expression: '1 / (d6 - 1)', dice: [{ sides: 6, results: [1] }], error: 'Division by zero' }] }
  const { details: trace, ...failure } = failed
  assert.deepEqual(readDiceResult(content(failure), { kind: 'mayori-dice', result: failed }), failed)
  assert.equal(readDiceResult(content({ ...failure, error: { path: [0], message: 'Other error' } }), { kind: 'mayori-dice', result: failed }), null)
})

test('future versions, inconsistent totals, malformed paths and invalid keep indices use raw fallback', () => {
  for (const mutate of [
    value => { value.schemaVersion = 4 },
    value => { value.values.attack = 20 },
    value => { value.details[0].path = ['missing'] },
    value => { value.details[0].dice[0].results[0] = 21 },
    value => { value.details[0].dice[0].keptIndices = [2] },
    value => { value.details[0].dice[0].keptIndices = [1, 1] },
    value => { value.details[0].dice[0].keep.count = 0 },
    value => { value.details[0].dice[0].keep.mode = 'random' },
    value => { value.details[0].error = 'bad' },
    value => { value.details.push(value.details[0]) },
    value => { value.purpose = 5 },
    value => { value.values = null },
  ]) {
    const value = fixture(); mutate(value)
    assert.equal(readDiceResult(content(value)), null)
  }
  for (const invalid of [[], [{ type: 'text', text: '{' }], [{ type: 'image' }], content(null), content({})]) {
    assert.equal(readDiceResult(invalid), null)
  }
})

test('dynamic failure records decode with their trace, while inconsistent error envelopes fall back', () => {
  const failed = { schemaVersion: 1, purpose: 'Проверка', values: null, error: { path: [0], message: 'Division by zero' },
    details: [{ path: [0], expression: '1 / (d6 - 1)', dice: [{ sides: 6, results: [1] }], error: 'Division by zero' }] }
  assert.deepEqual(readDiceResult(content(failed)), failed)
  failed.error.path = [1]
  assert.equal(readDiceResult(content(failed)), null)
})

test('preparation reads the live lazy purpose and settled calls support recorded raw arguments', () => {
  let current = 'Проверка'
  const block = { args: { textPrefix(key, length) { assert.equal(key, 'purpose'); assert.equal(length, 2000); return current } } }
  assert.equal(dicePurpose(block), 'Проверка')
  current = 'Проверка скрытности'
  assert.equal(dicePurpose(block), current)
  assert.equal(dicePurpose({ call: { argsRaw: '{"purpose":"Атака"}' } }), 'Атака')
  assert.equal(dicePurpose({ argsRaw: '{' }), '')
})
