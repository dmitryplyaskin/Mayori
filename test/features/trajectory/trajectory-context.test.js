import assert from 'node:assert/strict'
import test from 'node:test'
import { Session } from '@deepseek-ai/dsh-session'
import { greetingSeed } from '../../../src/features/character-session/host/greeting.js'
import { reconstructTrajectoryContext, SessionTrajectoryContextProvider } from '../../../src/features/trajectory/host/context.js'
import { RemoteTrajectoryContextProvider, deduplicateViews } from '../../../src/features/trajectory/client/context.js'
import { contextTrajectorySnapshot } from '../../../src/features/trajectory/client/snapshot.js'

const text = (id, value, kind = 'user') => ({ id, role: 'user', source: { kind }, content: [{ type: 'text', text: value }] })

test('native view tabs remove shadowed registrations without changing the stock source', () => {
  const views = [{ id: 'chat' }, { id: 'trajectory' }, { id: 'trajectory' }, { id: 'other' }]
  const filtered = deduplicateViews(views)
  assert.deepEqual(filtered.map(view => view.id), ['chat', 'trajectory', 'other'])
  assert.equal(filtered, deduplicateViews(views), 'Stable selector snapshots avoid render loops')
  assert.equal(views.length, 4)
  assert.equal(deduplicateViews(filtered), filtered)
})

test('chat stays first when a higher-priority trajectory wrapper is registered first', () => {
  const views = [{ id: 'trajectory', label: 'wrapped' }, { id: 'other' }, { id: 'chat' }, { id: 'trajectory', label: 'stock' }]
  const filtered = deduplicateViews(views)
  assert.deepEqual(filtered.map(view => view.id), ['chat', 'trajectory', 'other'])
  assert.equal(filtered[1], views[0], 'The effective wrapper retains its metadata')
  assert.equal(filtered, deduplicateViews(views))
  assert.equal(deduplicateViews(filtered), filtered)
  assert.deepEqual(views.map(view => view.id), ['trajectory', 'other', 'chat', 'trajectory'])
})
function scenario() {
  const session = Session.create('test', greetingSeed({ messageId: 'greeting', text: 'Opening A' }))
  const old = session.append('user/message', text('swipe-b', 'Opening B', 'mayori-greeting'), {
    surfaceOp: { op: 'replace', startSeq: 3, endSeq: 3 }, sourceEventSeqs: [3],
  }).seq
  const selected = session.append('user/message', text('swipe-c', 'Opening C', 'mayori-greeting'), {
    surfaceOp: { op: 'replace', startSeq: old, endSeq: old }, sourceEventSeqs: [old],
  }).seq
  session.append('user/message', text('player', 'Hello'), { surfaceOp: 'append' })
  session.append('request/header', { header: { config: { provider: 'test', model: 'test' } }, reason: 'step', startsSeries: true })
  const first = session.append('assistant/message', { turn: 2, step: 1, stream: [], message: {
    id: 'reply', role: 'assistant', source: { kind: 'model', provider: 'test', model: 'test' }, content: [{ type: 'text', text: 'Reply' }],
  } }, { surfaceOp: 'append' }).seq
  return { session, selected, first }
}

test('request input excludes superseded openings and its response, while current context includes the response', () => {
  const { session, selected, first } = scenario()
  const input = reconstructTrajectoryContext(session.snapshotEvents())
  assert.equal(input.selectedSeq, first)
  assert.deepEqual(input.requests.map(request => request.seq), [first], 'authored greeting is not a model request')
  assert.deepEqual(input.messages.map(item => item.seq), [selected, selected + 1])
  assert.deepEqual(input.messages.map(item => item.message.content[0].text), ['Opening C', 'Hello'])
  assert.equal(input.header.config.model, 'test')
  assert.equal(reconstructTrajectoryContext(session.snapshotEvents(), 'current').messages.at(-1).message.content[0].text, 'Reply')
  assert.throws(() => reconstructTrajectoryContext(session.snapshotEvents(), 3), /не найден/)
})

test('earlier request input survives later replacement and failed retries remain selectable', () => {
  const { session, selected, first } = scenario()
  session.append('user/message', text('summary', 'Compacted'), {
    surfaceOp: { op: 'replace', startSeq: selected, endSeq: first }, sourceEventSeqs: [selected, selected + 1, first],
  })
  const failed = session.append('assistant/attempt', { turn: 3, step: 1, stream: [] }).seq
  const retry = session.append('assistant/attempt', { turn: 3, step: 1, stream: [] }).seq
  const before = reconstructTrajectoryContext(session.snapshotEvents(), first)
  assert.equal(before.messages[0].message.content[0].text, 'Opening C')
  session.append('request/header', { header: { config: { provider: 'test', model: 'later-model' } }, reason: 'step', startsSeries: true })
  assert.equal(reconstructTrajectoryContext(session.snapshotEvents(), first).header.config.model, 'test')
  assert.equal(reconstructTrajectoryContext(session.snapshotEvents(), 'current').header.config.model, 'later-model')
  const latest = reconstructTrajectoryContext(session.snapshotEvents())
  assert.equal(latest.selectedSeq, retry)
  assert.equal(latest.messages[0].message.content[0].text, 'Compacted')
  assert.deepEqual(latest.requests.slice(1).map(request => [request.seq, request.failed]), [[failed, true], [retry, true]])
  assert.deepEqual(latest.messages.map(item => item.message), session.deriveMessages())
})

test('before the first request the saved context is shown and host reads are non-mutating', () => {
  const session = Session.create('test', greetingSeed({ messageId: 'opening', text: 'Authored opening' }))
  const ctx = { reflect: { provide() {} }, agents: { get: id => id === 'test' ? { session } : undefined }, sessions: { messageProjections: [] } }
  const provider = new SessionTrajectoryContextProvider(ctx)
  const before = session.seq
  assert.equal(provider.inspect('test').selectedSeq, 'current')
  assert.deepEqual(provider.inspect('test').requests, [])
  assert.equal(provider.inspect('test').messages[0].message.content[0].text, 'Authored opening')
  assert.equal(session.seq, before)
  assert.throws(() => provider.inspect('missing'), /закрыт/)
  assert.throws(() => provider.inspect('test', -1), /Некорректный/)
})

test('metadata-only settings snapshots remain in the log and are absent from request context', () => {
  const session = Session.create('metadata', greetingSeed({ messageId: 'opening', text: 'Opening' }))
  for (const kind of ['mayori-preset', 'mayori-compaction-settings']) session.append('user/message', {
    id: kind, role: 'user', source: { kind, sections: [{ name: kind, text: 'Saved configuration' }] }, content: [],
  }, { surfaceOp: 'append' })
  session.append('user/message', {
    id: 'directory', role: 'user', source: { kind: 'runtime-context', form: 'snapshot',
      sections: [{ name: 'working-directory:current', text: 'Current working directory: "C:\\campaign".' }] },
    content: [{ type: 'text', text: 'Current working directory: "C:\\campaign".' }],
  }, { surfaceOp: 'append' })
  session.append('user/message', text('player', 'Привет'), { surfaceOp: 'append' })
  const events = session.snapshotEvents()
  assert.deepEqual(reconstructTrajectoryContext(events, 'current').messages.map(item => item.message.content[0].text),
    ['Opening', 'Current working directory: "C:\\campaign".', 'Привет'])
  assert.equal(events.filter(event => event.type === 'user/message' && event.data.content.length === 0).length, 2)
})

test('an empty tool result remains in context to answer its caller', () => {
  const session = Session.create('empty-tool-result', greetingSeed({ messageId: 'opening', text: 'Opening' }))
  session.append('assistant/message', { turn: 2, step: 1, stream: [], message: {
    id: 'caller', role: 'assistant', source: { kind: 'model', provider: 'test', model: 'test' },
    content: [{ type: 'tool-call', id: 'empty-call', name: 'inspect', arguments: '{}' }],
  } }, { surfaceOp: 'append' })
  const result = session.append('tool/result', { turn: 2, step: 1, message: {
    id: 'empty-result', role: 'tool', toolCallId: 'empty-call', source: { kind: 'tool', callId: 'empty-call' }, content: [],
  } }, { surfaceOp: 'append' })
  const context = reconstructTrajectoryContext(session.snapshotEvents(), 'current')
  assert.equal(context.messages.at(-1).seq, result.seq)
  assert.equal(context.messages.at(-1).message.role, 'tool')
})

test('native trajectory snapshot contains only request input and uses the same row contracts as the journal', () => {
  const { session, first } = scenario()
  const reply = { kind: 'assistant', seq: first, turn: 2, step: 1, blocks: [{ kind: 'text', text: 'Reply' }] }
  const stock = { eventNodes: [reply], eventLocations: new Map(), requests: [{
    purpose: 'assistant', turn: 2, step: 1, startSeq: 8, resultSeq: first,
    startedAt: 20, completedAt: 30, status: 'complete', prompt: { system: 'Old prompt' },
    promptChange: { seq: 100, time: 20, kind: 'system' },
  }], systemPrompts: [{ seq: 100, text: 'Old prompt' }], callSchemas: new Map(), partial: null, runningCalls: [] }
  const value = reconstructTrajectoryContext(session.snapshotEvents())
  const filtered = contextTrajectorySnapshot(stock, value)
  assert.deepEqual(filtered.eventNodes.map(node => node.kind), ['context', 'user'])
  assert.equal(filtered.eventNodes[0].content[0].text, 'Opening C')
  assert.equal(filtered.eventNodes[0].producer.label, 'mayori-greeting')
  assert.deepEqual(filtered.partial.blocks, [], 'request location adds no assistant output')
  assert.equal(filtered.systemPrompts.length, 0, 'shadowed stock prompt is not injected')
  assert.equal(filtered.requests[0].promptChange, undefined)
  assert.equal(stock.eventNodes[0], reply)
  const current = contextTrajectorySnapshot(stock, reconstructTrajectoryContext(session.snapshotEvents(), 'current'))
  assert.equal(current.eventNodes.at(-1).blocks[0].text, 'Reply')
  assert.equal(current.partial, null)
})

test('native rows use projected content, preserved images and active system/tool definitions', () => {
  const image = { id: 'image', path: 'image.png' }
  const original = { kind: 'assistant', seq: 3, turn: 1, step: 1, time: 10,
    blocks: [{ kind: 'text', text: 'Original content' }], usage: { outputTokens: 2 } }
  const stock = { eventNodes: [original], eventLocations: new Map(), requests: [], callSchemas: new Map(), partial: null, runningCalls: [] }
  const tool = { name: 'inspect', description: 'Inspect', parameters: {} }
  const messages = [
    { seq: 2, time: 5, turn: 1, step: 1, message: { role: 'system', content: [{ type: 'text', text: 'Effective prompt' }] } },
    { seq: 3, time: 10, turn: 1, step: 1, message: { id: 'assistant', role: 'assistant', source: { provider: 'test', model: 'test' }, content: [
      { type: 'text', text: 'Projected content' }, { type: 'image', attachment: image },
      { type: 'tool-call', id: 'call', name: 'inspect', arguments: '{}' },
    ] } },
  ]
  const value = { messages, selectedSeq: 8, requests: [{ seq: 8, time: 20, turn: 2, step: 1, startSeq: 6, startedAt: 15 }],
    header: { config: { provider: 'test', model: 'test' }, tools: [tool] } }
  const filtered = contextTrajectorySnapshot(stock, value)
  const assistant = filtered.eventNodes[0]
  assert.equal(assistant.blocks[0].text, 'Projected content')
  assert.equal(assistant.blocks[1].attachment, image)
  assert.equal(assistant.blocks[2].callId, 'call')
  assert.equal(assistant.usage, original.usage)
  assert.equal(original.blocks[0].text, 'Original content')
  assert.equal(filtered.requests[0].prompt.system, 'Effective prompt')
  assert.equal(filtered.requests[0].prompt.tools[0], tool)
  assert.equal(filtered.callSchemas.get('inspect'), tool)
  assert.equal(filtered.systemPrompts.length, 0, 'native SYSTEM details present the prompt once')
})

test('tool rows retain native call details but display only the reconstructed result', () => {
  const call = { name: 'inspect', argsRaw: '{}' }
  const result = { kind: 'tool-result', seq: 4, time: 10, callId: 'call', call, callTime: 8,
    name: 'inspect', args: {}, content: [{ type: 'text', text: 'Old result' }], subCalls: [] }
  const stock = { eventNodes: [result], eventLocations: new Map(), requests: [], callSchemas: new Map(), partial: null, runningCalls: [] }
  const value = { selectedSeq: 'current', requests: [], header: null, messages: [{ seq: 4, time: 10, message: {
    role: 'tool', source: { kind: 'tool', callId: 'call' }, content: [{ type: 'text', text: 'Effective result' }], isError: true,
  } }] }
  const filtered = contextTrajectorySnapshot(stock, value)
  assert.equal(filtered.eventNodes[0].call, call)
  assert.equal(filtered.eventNodes[0].content[0].text, 'Effective result')
  assert.equal(filtered.eventNodes[0].isError, true)
  assert.equal(result.content[0].text, 'Old result')
})

test('browser ignores stale request selection results and hides failed input', async () => {
  const saved = globalThis.fetch
  const calls = []
  globalThis.fetch = async (_url, options) => new Promise(resolve => { calls.push({ input: JSON.parse(options.body), resolve }) })
  try {
    const provider = new RemoteTrajectoryContextProvider('test')
    let notifications = 0
    const off = provider.subscribe(() => { notifications++ })
    const old = provider.refresh(1)
    const fresh = provider.refresh(2)
    calls[1].resolve({ ok: true, json: async () => ({ ok: true, value: { selectedSeq: 2 } }) })
    await fresh
    calls[0].resolve({ ok: true, json: async () => ({ ok: true, value: { selectedSeq: 1 } }) })
    await old
    assert.equal(provider.getSnapshot().value.selectedSeq, 2)
    const failure = provider.refresh(3)
    calls[2].resolve({ ok: false, json: async () => ({ ok: false, error: 'Missing request' }) })
    await failure
    assert.equal(provider.getSnapshot().value, null)
    assert.equal(provider.getSnapshot().error, 'Missing request')
    off()
    assert.equal(notifications, 5)
  } finally { globalThis.fetch = saved }
})
