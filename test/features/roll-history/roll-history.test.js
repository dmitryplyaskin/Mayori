import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import { Session, foldSurface } from '@deepseek-ai/dsh-session'
import { CryptoDiceProvider } from '../../../src/features/dice/host/provider.js'
import { NumericRulesProvider } from '../../../src/features/rules/host/provider.js'
import { registerDiceTool } from '../../../src/features/dice/host/plugin.js'
import { registerRulesTool } from '../../../src/features/rules/host/tool.js'
import { SessionRollHistoryProvider } from '../../../src/features/roll-history/host/provider.js'
import { registerRollHistoryTool } from '../../../src/features/roll-history/host/tool.js'
import { readDiceResult, compactDiceResult } from '../../../src/features/dice/shared/result.js'
import { readCheckResult, compactCheckResult } from '../../../src/features/rules/shared/result.js'

async function harness(t, faces = [], config = {}) {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SystemPrompt); await ctx.plugin(ToolRuntime)
  let draws = 0
  new CryptoDiceProvider(ctx, {}, sides => { draws++; return faces.length ? faces.shift() : Math.min(3, sides) })
  new NumericRulesProvider(ctx, ctx.mayoriDice, config)
  new SessionRollHistoryProvider(ctx)
  registerDiceTool(ctx); registerRulesTool(ctx); registerRollHistoryTool(ctx)
  const session = Session.create('current')
  const execute = (name, callId, args, active = session) => ctx.tools.execute({ name, callId,
    arguments: args, agent: active ? { session: active } : undefined, signal: new AbortController().signal })
  const log = (callId, result) => session.append('tool/result', { turn: 1, step: 1, message: {
    id: `result-${session.snapshotEvents().length}`, role: 'tool', toolCallId: callId,
    source: { kind: 'tool', callId }, content: result.content,
  }, meta: result.meta }, { surfaceOp: 'append' })
  return { ctx, session, execute, log, draws: () => draws }
}
const body = result => JSON.parse(result.content[0].text)

test('default Dice output stays small for a large pool; full trace and errors remain readable', async t => {
  const h = await harness(t)
  const rolled = await h.execute('rollDice', 'pool', { purpose: 'Большой пул', rolls: { pool: '900d6' } })
  assert.deepEqual(body(rolled), { rollId: 'pool', values: { pool: 2700 } })
  assert.ok(rolled.content[0].text.length < 100)
  assert.equal(rolled.meta.result.observations[0].groups[0].faces.length, 900)
  assert.deepEqual(readDiceResult(rolled.content, rolled.meta), rolled.value)
  h.log('pool', rolled)
  const before = h.session.snapshotEvents()
  const detail = await h.execute('getRollDetails', 'read', { rollIds: ['pool'] })
  assert.equal(body(detail).rolls[0].result.details[0].dice[0].results.length, 900)
  assert.equal(h.draws(), 900)
  assert.deepEqual(h.session.snapshotEvents(), before)
  const damaged = body(rolled); damaged.values.pool = 999
  assert.equal(readDiceResult([{ type: 'text', text: JSON.stringify(damaged) }], rolled.meta), null)
  const failed = await h.execute('rollDice', 'error', { rolls: { bad: 'd0', good: 'd1' } })
  assert.equal(body(failed).errors[0].code, 'invalid_expression')
  assert.equal(body(failed).values.bad, null)
})

test('compact criticals retain natural face, reason, damage and chosen effect without tables or duplicate observations', async t => {
  const effects = Array.from({ length: 50 }, (_, index) => `Configured effect ${index + 1}`)
  const h = await harness(t, [1, 2, 20, 4, 2], { profiles: [{ id: 'house', version: '2', sides: 20,
    criticalSuccessMin: 20, criticalFailureMax: 1, criticalFailureEffects: effects }] })
  assert.doesNotMatch(h.ctx.tools.get('resolveCheck').description, /Configured effect/)
  const failed = await h.execute('resolveCheck', 'fumble', { profile: 'house', target: 5, modifier: 6 })
  assert.deepEqual(body(failed), { rollId: 'fumble', check: { natural: 1, modifier: 6, total: 7, target: 5,
    outcome: 'critical_failure', reason: 'natural-critical-failure' }, consequence: effects[1] })
  assert.deepEqual(readCheckResult(failed.content, failed.meta), failed.value)
  h.log('fumble', failed)
  const hit = await h.execute('resolveCheck', 'critical', { profile: 'house', target: 40, modifier: 6,
    damage: { normal: 'd6+3', critical: '2d6+3' } })
  assert.equal(body(hit).damage, 9)
  assert.equal(body(hit).check.outcome, 'critical_success')
  assert.equal(body(hit).check.total, 26)
  assert.equal(Object.hasOwn(body(hit), 'consequence'), false)
  assert.deepEqual(readCheckResult(hit.content, hit.meta), hit.value)
  const changed = body(failed); changed.consequence = 'Invented'
  assert.equal(readCheckResult([{ type: 'text', text: JSON.stringify(changed) }], failed.meta), null)
  assert.ok(failed.content[0].text.length < JSON.stringify(failed.value).length / 5)
})

test('batch reads survive serialization, fork and surface compaction without randomness; errors stay per id', async t => {
  const h = await harness(t, [6, 2, 1, 4, 1])
  const dice = await h.execute('rollDice', 'dice', { rolls: { explosion: 'd6!', reroll: 'd6ro<3' } })
  const check = await h.execute('resolveCheck', 'check', { profile: 'd20-critical', target: 5, modifier: 6 })
  const original = h.log('dice', dice)
  h.log('check', check)
  h.session.append('tool/result', { ...original.data, message: { ...original.data.message,
    content: [{ type: 'text', text: 'Model content was shortened.' }] } },
    { surfaceOp: { op: 'replace', startSeq: original.seq, endSeq: original.seq }, sourceEventSeqs: [original.seq] })
  const fork = Session.create('fork', JSON.parse(JSON.stringify(h.session.snapshotEvents())))
  const inherited = fork.snapshotEvents()
  const nodes = foldSurface(inherited).nodes
  // Compaction can replace the model surface; historical tool/result events remain authoritative.
  fork.append('user/message', { id: 'compacted', role: 'user', source: { kind: 'test' }, content: [{ type: 'text', text: 'Summary' }] },
    { surfaceOp: { op: 'replace', startSeq: nodes[0], endSeq: nodes.at(-1) }, sourceEventSeqs: nodes })
  const loaded = await h.execute('getRollDetails', 'read', { rollIds: ['check', 'missing', 'dice'] }, fork)
  assert.equal(loaded.isError, false)
  assert.deepEqual(body(loaded).rolls[0].result, check.value)
  assert.equal(body(loaded).rolls[1].error.code, 'not_found')
  assert.deepEqual(body(loaded).rolls[2].result, dice.value)
  assert.deepEqual(dice.value.details[0].dice[0].results, [6, 2])
  assert.deepEqual(dice.value.details[1].dice[0].results, [1, 4])
  assert.equal(h.draws(), 5)
  const unrelated = Session.create('unrelated')
  assert.equal(body(await h.execute('getRollDetails', 'outside', { rollIds: ['dice'] }, unrelated)).rolls[0].error.code, 'not_found')
})

test('legacy ids, invalid metadata, ambiguous ids and invalid requests never cause replacement rolls', async t => {
  const h = await harness(t)
  const full = h.ctx.mayoriDice.roll({ old: 'd6' })
  h.session.append('tool/call', { turn: 1, step: 1, callId: 'old-full', name: 'rollDice', arguments: '{}' })
  h.session.append('tool/result', { turn: 1, step: 1, message: { id: 'old-full-result', role: 'tool',
    toolCallId: 'old-full', source: { kind: 'tool', callId: 'old-full' }, content: [{ type: 'text', text: JSON.stringify(full) }] } },
    { surfaceOp: 'append' })
  assert.deepEqual(body(await h.execute('getRollDetails', 'old-full-read', { rollIds: ['old-full'] })).rolls[0].result, full)
  const { details, ...oldCompact } = full
  h.log('old-call', { content: [{ type: 'text', text: JSON.stringify(oldCompact) }], meta: { kind: 'mayori-dice', result: full } })
  assert.deepEqual(body(await h.execute('getRollDetails', 'legacy', { rollIds: ['old-call'] })).rolls[0].result, full)
  const rolled = await h.execute('rollDice', 'corrupt', { rolls: ['d6'] })
  const damaged = structuredClone(rolled); damaged.meta.result.values[0] = 999
  h.log('corrupt', damaged)
  assert.equal(body(await h.execute('getRollDetails', 'bad', { rollIds: ['corrupt'] })).rolls[0].error.code, 'invalid_record')
  h.log('old-call', { content: [{ type: 'text', text: JSON.stringify(oldCompact) }], meta: { kind: 'mayori-dice', result: full } })
  assert.equal(body(await h.execute('getRollDetails', 'duplicate', { rollIds: ['old-call'] })).rolls[0].error.code, 'ambiguous_id')
  for (const rollIds of [[], ['x', 'x'], [''], Array.from({ length: 21 }, (_, index) => String(index)), [3]]) {
    assert.equal((await h.execute('getRollDetails', 'invalid', { rollIds })).isError, true)
  }
  assert.equal((await h.execute('getRollDetails', 'no-session', { rollIds: ['old-call'] }, null)).isError, true)
  assert.equal(h.draws(), 2)
  assert.deepEqual(compactDiceResult(rolled.value), body(rolled))
  const oldCheck = h.ctx.mayoriRules.resolve({ profile: 'standard', target: 1 })
  h.log('old-check', { content: [{ type: 'text', text: JSON.stringify(compactCheckResult(oldCheck)) }], meta: { kind: 'mayori-check', result: oldCheck } })
  assert.deepEqual(body(await h.execute('getRollDetails', 'old-rules', { rollIds: ['old-check'] })).rolls[0].result, oldCheck)
})

test('a new compact Dice envelope cannot reinterpret an older schema without its errors contract', () => {
  const full = { schemaVersion: 1, rollId: 'legacy', values: [3], details: [
    { path: [0], expression: 'd6', value: 3, dice: [{ sides: 6, results: [3] }] },
  ] }
  assert.equal(readDiceResult([{ type: 'text', text: JSON.stringify({ rollId: 'legacy', values: [3] }) }],
    { kind: 'mayori-dice', result: full }), null)
})
