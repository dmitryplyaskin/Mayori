import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import LlmRuntime, { LlmAdapter, createUserMessage, createAssistantMessage, createSystemMessage } from '@deepseek-ai/dsh-llm'
import SessionStore, { Session, SessionId } from '@deepseek-ai/dsh-session'
import SessionProjections from '@deepseek-ai/dsh-session-projection'
import TokenMeter from '@deepseek-ai/dsh-token-meter'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRuntime from '@deepseek-ai/dsh-tools'
import * as Compaction from '../../../src/host/compaction-plugin.js'
import { DEFAULT_COMPACTION, validateCompaction } from '../../../src/features/compaction/shared/settings.js'

const signal = new AbortController().signal
const instructions = 'Сохрани обещания и {{user}} буквально. Формат: сцена, отношения, открытые вопросы.'
async function runtime(t, options = {}) {
  const ctx = new Context(); t.after(() => ctx.fiber.dispose())
  await ctx.plugin(LlmRuntime); await ctx.plugin(SessionStore); await ctx.plugin(SessionProjections); await ctx.plugin(TokenMeter)
  await ctx.plugin(SystemPrompt); await ctx.plugin(ToolRuntime)
  const requests = []
  let output = [{ type: 'text', text: 'Герой у ворот. Марта обещала помочь. Проверка уже выполнена: успех.' }], finish = { kind: 'stop' }
  class Adapter extends LlmAdapter {
    async resolveModel(provider, id) { return { provider, id, name: id, context: { contextWindow: 12000 } } }
    async *stream(request) {
      requests.push(request)
      for (const [index, block] of output.entries()) {
        yield { type: 'block-start', index, blockType: block.type }
        yield { type: 'block-end', index, block }
      }
      yield { type: 'finish', reason: finish }
    }
  }
  ctx.llm.registerAdapter(['test'], new Adapter())
  const fiber = ctx.plugin(Compaction, { ...DEFAULT_COMPACTION, instructions, headroomTokens: 0, maxSummaryTokens: 256, ...options })
  await fiber
  return { ctx, requests, fiber, engine: ctx.compaction, fail: (blocks, reason) => { output = blocks; finish = reason } }
}

function conversation(id = 'campaign') {
  const session = Session.create(SessionId(id))
  for (let turn = 1; turn <= 5; turn++) {
    session.append('turn/start', { turn })
    if (turn === 1) session.append('system/message', { turn, step: 1, message: createSystemMessage('Веди ролевую игру. Не решай за игрока.') }, { surfaceOp: 'append' })
    session.append('user/message', createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: `Сцена ${turn}. ` + 'Установленные события и точные решения игрока. '.repeat(130) }] }), { surfaceOp: 'append' })
    session.append('step/start', { turn, step: 1 })
    if (turn === 1) session.append('request/header', { header: { config: { provider: 'test', model: 'story', maxTokens: 256 } }, reason: 'initial' })
    session.append('assistant/message', { turn, step: 1, stream: [], message: createAssistantMessage({ source: { provider: 'test', model: 'story' }, content: [{ type: 'text', text: `Ответ ${turn}. ` + 'Марта предлагает помощь, ожидая решения героя. '.repeat(130) }] }) }, { surfaceOp: 'append' })
    session.append('step/end', { turn, step: 1 }); session.append('turn/end', { turn, reason: { kind: 'completed' } })
  }
  session.append('turn/start', { turn: 6 })
  return session
}
const agentFor = session => ({ session, options: { provider: 'test', model: 'story' } })
const prepare = (ctx, session) => ctx.waterfall('agent/pre-step', { agent: agentFor(session), signal }, () => ({ kind: 'enter-step' }))

test('editable limits reject invalid settings before changing runtime or calling a model', () => {
  assert.deepEqual(validateCompaction({}), DEFAULT_COMPACTION)
  for (const options of [null, [], { unknown: 1 }, { thresholdPercent: 100 }, { thresholdPercent: 0 }, { thresholdPercent: 80.5 },
    { retainPercent: 80 }, { headroomTokens: -1 }, { maxSummaryTokens: 0 }, { instructions: '  ' }, { instructions: 'x'.repeat(32769) }]) {
    assert.throws(() => validateCompaction(options))
  }
})

test('the first settings snapshot uses loop admission and never precedes the system head', async t => {
  const h = await runtime(t)
  const session = Session.create(SessionId('first-turn'))
  session.append('turn/start', { turn: 1 })
  const user = createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Начать игру.' }] })
  const decision = await h.ctx.waterfall('agent/pre-step', { agent: agentFor(session), signal }, () => ({ kind: 'enter', messages: [user] }))
  assert.equal(session.surface.nodes.length, 0)
  assert.equal(h.requests.length, 0)
  assert.equal(decision.messages[0], user)
  assert.equal(decision.messages[1].source.kind, 'mayori-compaction-settings')
  assert.deepEqual(decision.messages[1].content, [])
  assert.equal(JSON.parse(decision.messages[1].source.sections[0].text).instructions, instructions)
  const rejected = await h.ctx.waterfall('agent/pre-step', { agent: agentFor(session), signal }, () => ({ kind: 'reject' }))
  assert.equal(rejected.kind, 'reject')
  assert.equal(session.surface.nodes.length, 0)
  const empty = await h.ctx.waterfall('agent/pre-step', { agent: agentFor(session), signal }, () => ({ kind: 'enter', messages: [] }))
  assert.deepEqual(empty.messages, [], 'A service notice cannot start a response without admitted input')
})

test('native pressure compaction records the exact editable instruction, keeps originals and replays the replacement', async t => {
  const h = await runtime(t, { thresholdPercent: 60 })
  const session = conversation()
  const originals = session.snapshotEvents().filter(event => event.type === 'user/message')
  await prepare(h.ctx, session)
  assert.equal(h.requests.length, 1)
  assert.equal(h.requests[0].purpose, 'compaction')
  assert.equal(h.requests[0].messages.at(-1).content[0].text, instructions)
  const snapshot = session.snapshotEvents().find(event => event.type === 'user/message' && event.data.source.kind === 'mayori-compaction-settings')
  assert.equal(JSON.parse(snapshot.data.source.sections[0].text).instructions, instructions)
  assert.deepEqual(snapshot.data.content, [], 'Metadata does not send a configuration notice to the model')
  const event = session.snapshotEvents().find(event => event.type === 'compaction/summary')
  assert.ok(event)
  assert.equal(event.data.model, 'story')
  assert.ok(originals.every(original => session.snapshotEvents().some(item => item.seq === original.seq && item.data === original.data)))
  assert.ok(session.deriveMessages().some(message => message.content.some(block => block.text?.includes('<compacted-summary>'))))
  assert.ok(session.deriveMessages().some(message => message.content.some(block => block.text?.startsWith('Ответ 5.'))), 'Recent conversation stays verbatim')
  const replay = Session.create(SessionId('replay'), JSON.parse(JSON.stringify(session.snapshotEvents())))
  assert.deepEqual(replay.deriveMessages(), session.deriveMessages())
  await h.fiber.dispose()
  assert.equal(h.ctx.compaction, undefined)
  assert.ok(!h.ctx.tools.schemas().some(tool => tool.name === 'compactHistory'))
  const before = h.requests.length
  await prepare(h.ctx, conversation('unloaded'))
  assert.equal(h.requests.length, before, 'Unload removes automatic consumers')
})

test('the same history stays intact at a high threshold and compacts at a lower threshold', async t => {
  const high = await runtime(t, { thresholdPercent: 95 }), low = await runtime(t, { thresholdPercent: 30 })
  // This shorter prefix is below 95% and above 30% of the same model window.
  const session = conversation('threshold')
  const prefix = session.snapshotEvents().filter(event => event.seq < 17)
  const highSession = Session.create(SessionId('high'), prefix), lowSession = Session.create(SessionId('low'), prefix)
  await prepare(high.ctx, highSession)
  await prepare(low.ctx, lowSession)
  assert.equal(high.requests.length, 0)
  assert.equal(low.requests.length, 1)
})

test('empty, truncated and tool-call summaries never replace the existing conversation', async t => {
  for (const [blocks, finish] of [
    [[], { kind: 'stop' }],
    [[{ type: 'text', text: 'Незавершённый текст' }], { kind: 'max-tokens' }],
    [[{ type: 'tool-call', id: 'unexpected', name: 'rollDice', arguments: '{}' }], { kind: 'tool-calls' }],
    [[{ type: 'text', text: 'Слишком длинное изложение. '.repeat(5000) }], { kind: 'stop' }],
  ]) {
    const h = await runtime(t, { thresholdPercent: 60 })
    h.fail(blocks, finish)
    const session = conversation('invalid')
    await prepare(h.ctx, session)
    assert.equal(h.requests.length, 1, 'The rejected summary reached the test model')
    assert.equal(session.snapshotEvents().some(event => event.type === 'compaction/summary'), false)
    assert.ok(session.deriveMessages().some(message => message.content.some(block => block.text?.startsWith('Сцена 1.'))))
  }
})

test('updating the instruction replaces its logged snapshot and a fork retains both versions', async t => {
  const h = await runtime(t, { thresholdPercent: 95 })
  const session = Session.create(SessionId('settings'), conversation().snapshotEvents().filter(event => event.seq < 17))
  await prepare(h.ctx, session)
  const first = session.snapshotEvents().find(event => event.type === 'user/message' && event.data.source.kind === 'mayori-compaction-settings')
  await h.fiber.dispose()
  const fiber = h.ctx.plugin(Compaction, { ...DEFAULT_COMPACTION, thresholdPercent: 95, retainPercent: 5, headroomTokens: 0, maxSummaryTokens: 256, instructions: 'Новая инструкция.' })
  await fiber
  await prepare(h.ctx, session)
  const snapshots = session.snapshotEvents().filter(event => event.type === 'user/message' && event.data.source.kind === 'mayori-compaction-settings')
  assert.equal(snapshots.length, 2)
  assert.deepEqual(snapshots[1].sourceEventSeqs, [first.seq])
  assert.equal(session.surface.nodes.includes(first.seq), false)
  assert.equal(JSON.parse(snapshots[1].data.source.sections[0].text).instructions, 'Новая инструкция.')
  const fork = Session.create(SessionId('settings-fork'), JSON.parse(JSON.stringify(session.snapshotEvents())))
  assert.deepEqual(fork.deriveMessages(), session.deriveMessages())
})

test('a zero verbatim-tail budget uses the native absolute-zero retention policy', async t => {
  const h = await runtime(t, { retainPercent: 0 })
  assert.equal(h.engine.config.retainTokens, 0)
  await prepare(h.ctx, conversation('zero-tail'))
  assert.equal(h.requests.length, 1)
})

test('old compaction notice text is retired while its original request and settings remain replayable', async t => {
  const h = await runtime(t, { thresholdPercent: 95 })
  const session = Session.create(SessionId('legacy-notice'), conversation().snapshotEvents().filter(event => event.seq < 14))
  const old = session.append('user/message', createUserMessage({ content: [{ type: 'text', text: 'Настройки сжатия истории обновлены.' }],
    source: { kind: 'mayori-compaction-settings', form: 'snapshot', sections: [{ name: 'mayori-compaction-settings', text: JSON.stringify({ ...DEFAULT_COMPACTION, instructions, headroomTokens: 0, maxSummaryTokens: 256, thresholdPercent: 95 }) }] },
  }), { surfaceOp: 'append' })
  await prepare(h.ctx, session)
  const current = session.snapshotEvents().at(-1)
  assert.deepEqual(current.sourceEventSeqs, [old.seq])
  assert.deepEqual(current.data.content, [])
  assert.equal(session.snapshotEvents()[old.seq].data.content[0].text, 'Настройки сжатия истории обновлены.')
  assert.equal(session.deriveMessages().some(message => message.content.some(block => block.text?.includes('Настройки сжатия'))), false)
  assert.equal(h.requests.length, 0)
})

function toolConversation(withPair = false) {
  const session = Session.create(SessionId('tool-history'), conversation().snapshotEvents().filter(event => event.seq < 14))
  let turn = 3, pair = []
  if (withPair) {
    session.append('turn/start', { turn }); session.append('step/start', { turn, step: 1 })
    pair.push(session.append('assistant/message', { turn, step: 1, stream: [], message: createAssistantMessage({ source: { provider: 'test', model: 'story' },
      content: [{ type: 'tool-call', id: 'previous-roll', name: 'rollDice', arguments: '{}' }],
    }) }, { surfaceOp: 'append' }).seq)
    pair.push(session.append('tool/result', { turn, step: 1, message: { id: 'previous-roll-result', role: 'tool', toolCallId: 'previous-roll',
      source: { kind: 'tool', callId: 'previous-roll' }, content: [{ type: 'text', text: 'Recorded details of a completed roll. '.repeat(250) }],
    } }, { surfaceOp: 'append' }).seq)
    session.append('step/end', { turn, step: 1 }); session.append('turn/end', { turn, reason: { kind: 'completed' } }); turn++
  }
  session.append('turn/start', { turn }); session.append('step/start', { turn, step: 1 })
  session.append('user/message', createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: 'Сожми прошлую историю. CURRENT_PLAYER_CHOICE' }] }), { surfaceOp: 'append' })
  const call = session.append('assistant/message', { turn, step: 1, stream: [], message: createAssistantMessage({ source: { provider: 'test', model: 'story' },
    content: [{ type: 'tool-call', id: 'compact-call', name: 'compactHistory', arguments: '{}' }],
  }) }, { surfaceOp: 'append' })
  return { session, call, pair }
}

test('compactHistory is a real scoped tool that condenses below the pressure threshold and preserves the current turn', async t => {
  const h = await runtime(t, { thresholdPercent: 95, retainPercent: 10 })
  assert.ok(h.ctx.tools.schemas().some(tool => tool.name === 'compactHistory'))
  const { session, call } = toolConversation()
  await prepare(h.ctx, session)
  assert.equal(h.requests.length, 0, 'Automatic threshold has not been reached')
  const current = session.snapshotEvents().filter(event => event.seq >= call.seq - 3)
  const result = await h.ctx.tools.execute({ name: 'compactHistory', callId: 'compact-call', arguments: {}, agent: agentFor(session), signal })
  assert.equal(result.isError, false)
  assert.equal(JSON.parse(result.content[0].text).status, 'compacted')
  assert.equal(h.requests.length, 1)
  assert.equal(h.requests[0].messages.at(-1).content[0].text, instructions)
  assert.ok(session.surface.nodes.includes(call.seq), 'The caller tool message remains on the surface')
  assert.ok(session.deriveMessages().some(message => message.content.some(block => block.text?.includes('CURRENT_PLAYER_CHOICE'))))
  const compacted = session.snapshotEvents().find(event => event.type === 'compaction/summary')
  assert.ok(current.every(event => !compacted.data.shadowedSeqs.includes(event.seq)))
  assert.equal(session.snapshotEvents().find(event => event.type === 'system/message').seq, session.surface.nodes[0])
})

test('compactHistory makes no summary call when the retained budget covers all completed history', async t => {
  const h = await runtime(t, { thresholdPercent: 95, retainPercent: 90 })
  const { session } = toolConversation()
  await prepare(h.ctx, session)
  const result = await h.ctx.tools.execute({ name: 'compactHistory', callId: 'compact-call', arguments: {}, agent: agentFor(session), signal })
  assert.equal(JSON.parse(result.content[0].text).status, 'unchanged')
  assert.equal(h.requests.length, 0)
  assert.ok(!session.snapshotEvents().some(event => event.type === 'compaction/start'))
})

test('the tool retention boundary never separates a previous dice call from its result', async t => {
  const h = await runtime(t, { thresholdPercent: 95, retainPercent: 10 })
  const { session, pair } = toolConversation(true)
  await prepare(h.ctx, session)
  assert.equal(h.requests.length, 0)
  const result = await h.ctx.tools.execute({ name: 'compactHistory', callId: 'compact-call', arguments: {}, agent: agentFor(session), signal })
  assert.equal(result.isError, false)
  assert.equal(JSON.parse(result.content[0].text).status, 'compacted')
  assert.ok(pair.every(seq => session.surface.nodes.includes(seq)), 'The oversized retained result keeps the entire tool pair')
})
