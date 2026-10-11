import assert from 'node:assert/strict'
import test from 'node:test'
import { RemoteMessageRevisionProvider } from '../../../src/features/message-revisions/client/revisions.js'
import { editedNode, removedNode, visibleRevisionEntries } from '../../../src/features/message-revisions/client/message.js'
import { readMessageEdits, removalMessage } from '../../../src/features/message-revisions/domain/edits.js'

const editContract = { editModes: ['current', 'branch'], editRunsModel: false, regenerateMode: 'current', regenerateKeepsVariants: true, canDelete: true }

test('replayed deletion hides preceding process nodes and empty headers, including earlier deletion records', () => {
  const answer = { seq: 9, type: 'assistant/message', data: { turn: 2, message: { id: 'answer', role: 'assistant' } } }
  const events = Array.from({ length: 10 }, (_, seq) => ({ seq, type: 'step/start', data: {} }))
  events[1] = { seq: 1, type: 'turn/start', data: { turn: 2 } }
  events[3] = { seq: 3, type: 'user/message', data: { role: 'user', source: { kind: 'user' } } }
  events[9] = answer
  events.push({ seq: 10, type: 'user/message', data: removalMessage({ event: answer,
    message: answer.data.message, role: 'assistant' }, 'legacy-delete', 'delete') })
  const edits = readMessageEdits(JSON.parse(JSON.stringify(events)))
  assert.deepEqual(edits[9].processRange, { startSeq: 4, endSeq: 9 })
  const nodes = new Map([
    ['user', { kind: 'user', data: { seq: 3 } }],
    ['context', { kind: 'context', data: { seq: 4 } }],
    ['prior', { kind: 'assistant-step', data: { turn: 1, finalNode: { seq: 0 } } }],
    ['thought', { kind: 'assistant-step', data: { turn: 2, finalNode: { seq: 5 } } }],
    ['tool', { kind: 'tool-call', anchorSeq: 5.1, location: { turn: { turn: 2 } }, data: {} }],
    ['retry', { kind: 'model-retry', anchorSeq: 6, data: { turn: 2 } }],
    ['process', { kind: 'turn-process', anchorSeq: 1, data: { turn: 2 } }],
    ['answer', { kind: 'turn-tail', data: { turn: 2, closing: { finalNode: { seq: 9 } } } }],
    ['later', { kind: 'assistant-step', data: { turn: 3, finalNode: { seq: 12 } } }],
  ])
  for (const key of ['thought', 'tool', 'retry', 'process', 'answer']) assert.equal(removedNode(nodes.get(key), edits), true, key)
  for (const key of ['user', 'context', 'prior', 'later']) assert.equal(removedNode(nodes.get(key), edits), false, key)
  const entries = [{ kind: 'node', key: 'user' }, { kind: 'group', key: 'old-process' },
    { kind: 'node', key: 'answer' }, { kind: 'node', key: 'later' }]
  const groups = { groupSource: () => ({ getSnapshot: () => ({ data: { turn: 2 },
    members: [{ key: 'thought' }, { key: 'tool' }, { key: 'retry' }, { key: 'context' }] }) }) }
  assert.deepEqual(visibleRevisionEntries(entries, nodes, groups, edits), [entries[0], entries[3]])
})

test('revision requests reject concurrent writes, navigate after success and always clear pending state', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  let release
  const requests = [], opened = [], statuses = []
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/message-inspect')) return { ok: true, json: async () => ({ ok: true, value: editContract }) }
    if (url.endsWith('/message-variants')) return { ok: true, json: async () => ({ ok: true, value: [] }) }
    requests.push([url.split('/').at(-1), JSON.parse(options.body)])
    return { ok: true, json: () => new Promise(resolve => { release = resolve }) }
  }
  const revisions = new RemoteMessageRevisionProvider('original', id => { opened.push(id) })
  await revisions.inspect(9)
  const dispose = revisions.subscribe(() => statuses.push(revisions.getSnapshot().busy))
  const first = revisions.edit(9, 'New text')
  await assert.rejects(revisions.regenerate(9), /Дождитесь/)
  release({ ok: true, value: { sessionId: 'new', changed: true } })
  await first
  assert.deepEqual(requests, [['message-edit', { sessionId: 'original', seq: 9, text: 'New text', mode: 'current' }]])
  assert.deepEqual(opened, ['new'])
  assert.deepEqual(statuses, [true, false])
  const failed = revisions.regenerate(9)
  await Promise.resolve()
  release({ ok: false, error: 'Дождитесь завершения ответа.' })
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  // A failed in-place mutation reloads durable state before releasing its busy flag.
  while (requests.at(-1)[0] !== 'message-revisions') await new Promise(resolve => setImmediate(resolve))
  release({ ok: true, value: {} })
  await assert.rejects(failed, /завершения/)
  assert.equal(revisions.getSnapshot().busy, false)
  assert.deepEqual(opened, ['new'])
  dispose()
})

test('current saves publish corrected content without navigation and ignore a stale read', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  const pending = []
  globalThis.fetch = async (url, options) => ({ ok: true,
    json: () => url.endsWith('/message-inspect') ? Promise.resolve({ ok: true, value: editContract })
      : url.endsWith('/message-variants') ? Promise.resolve({ ok: true, value: [] })
      : new Promise(resolve => pending.push({ endpoint: url.split('/').at(-1), body: JSON.parse(options.body), resolve })) })
  const opened = []
  const provider = new RemoteMessageRevisionProvider('original', id => opened.push(id))
  await provider.inspect(9)
  const old = provider.refresh()
  await Promise.resolve()
  const saving = provider.edit(9, 'Corrected')
  await Promise.resolve()
  const edits = { 9: { text: 'Corrected', content: [{ type: 'text', text: 'Corrected' }] } }
  pending.find(request => request.endpoint === 'message-edit').resolve({ ok: true, value: { sessionId: 'original', changed: true, edits } })
  await saving
  pending.find(request => request.endpoint === 'message-revisions').resolve({ ok: true, value: {} })
  await old
  assert.deepEqual(provider.getSnapshot().edits, edits)
  assert.deepEqual(opened, [])
  assert.equal(provider.getSnapshot().busy, false)
  const branch = provider.edit(9, 'Branched', 'branch')
  await Promise.resolve()
  const request = pending.at(-1)
  assert.equal(request.body.mode, 'branch')
  request.resolve({ ok: true, value: { sessionId: 'child', changed: true } })
  await branch
  assert.deepEqual(opened, ['child'])
})

test('a refreshed browser refuses both saves against the old generating Host API', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  const endpoints = [], opened = []
  globalThis.fetch = async url => {
    endpoints.push(url.split('/').at(-1))
    return { ok: true, json: async () => ({ ok: true, value: { seq: 9, text: 'Old reply', role: 'assistant', canRegenerate: true } }) }
  }
  const provider = new RemoteMessageRevisionProvider('original', id => opened.push(id))
  for (const mode of ['current', 'branch']) await assert.rejects(provider.edit(9, 'Corrected', mode), /Перезапустите Mayori/)
  assert.deepEqual(endpoints, ['message-inspect', 'message-inspect'])
  assert.deepEqual(opened, [])
  assert.equal(provider.getSnapshot().busy, false)
})

test('native text and copy rows share the latest correction while attachments stay intact', () => {
  const image = { kind: 'image', attachment: { attachmentId: 'image' } }
  const edit = { text: 'Corrected', content: [{ type: 'text', text: 'Corrected' }] }
  const blocks = [{ kind: 'text', text: 'Old' }, { kind: 'reasoning', text: 'Think' }, image]
  const assistant = { kind: 'assistant-step', data: { finalNode: { seq: 9 }, blocks } }
  const tail = { kind: 'turn-tail', data: { closing: { finalNode: { seq: 9, blocks }, blocks } } }
  const corrected = [{ kind: 'text', text: 'Corrected' }, { kind: 'reasoning', text: 'Think' }, image]
  assert.deepEqual(editedNode(assistant, { 9: edit }).data.blocks, corrected)
  assert.deepEqual(editedNode(tail, { 9: edit }).data.closing.blocks, corrected)
  assert.deepEqual(editedNode({ kind: 'user', data: { seq: 9 } }, { 9: edit }).data.content, edit.content)
  assert.equal(editedNode(assistant, {}), assistant)
  assert.equal(assistant.data.blocks, blocks)
})

test('current regeneration refuses an older Host that would fork the chat', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  const endpoints = []
  globalThis.fetch = async url => {
    endpoints.push(url.split('/').at(-1))
    return { ok: true, json: async () => ({ ok: true, value: { ...editContract, regenerateMode: undefined } }) }
  }
  const provider = new RemoteMessageRevisionProvider('source', () => assert.fail('Unexpected navigation'))
  await assert.rejects(provider.regenerate(9), /старый повтор/)
  assert.deepEqual(endpoints, ['message-inspect'])
  assert.equal(provider.getSnapshot().busy, false)
})

test('deletion and regeneration publish removals in the same chat and retire native process and tool rows', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  const edits = { 9: { deleted: true, turn: 2, reason: 'delete' } }
  const endpoints = []
  globalThis.fetch = async (url, options) => {
    endpoints.push([url.split('/').at(-1), JSON.parse(options.body)])
    return { ok: true, json: async () => ({ ok: true, value: url.endsWith('/message-inspect') ? editContract
      : { sessionId: 'source', changed: true, edits } }) }
  }
  const provider = new RemoteMessageRevisionProvider('source', () => assert.fail('Unexpected navigation'))
  await provider.remove(9)
  assert.deepEqual(provider.getSnapshot().edits, edits)
  assert.equal(removedNode({ kind: 'assistant-step', data: { turn: 2, finalNode: { seq: 9 } } }, edits), true)
  assert.equal(removedNode({ kind: 'user', data: { seq: 8 } }, edits), false)
  assert.equal(removedNode({ kind: 'turn-process', data: { turn: 2 } }, edits), false)
  edits[9].reason = 'regenerate'
  await provider.regenerate(9)
  for (const kind of ['tool-call', 'turn-process', 'model-retry', 'turn-tail']) {
    assert.equal(removedNode({ kind, location: { kind: 'step', turn: { turn: 2 } }, data: {} }, edits), true)
    assert.equal(removedNode({ kind, location: { kind: 'step', turn: { turn: 3 } }, data: {} }, edits), false)
  }
  assert.deepEqual(endpoints.map(([endpoint]) => endpoint), ['message-remove', 'message-inspect', 'message-regenerate'])
  assert.equal(provider.getSnapshot().busy, false)
})

test('native flow omits retired process groups and individual rows while retaining later turns', () => {
  const entries = [{ kind: 'group', key: 'old-process' }, { kind: 'node', key: 'old-reply' },
    { kind: 'group', key: 'current-process' }, { kind: 'node', key: 'current-reply' }]
  const nodes = new Map([
    ['old-tool', { kind: 'tool-call', location: { turn: { turn: 2 } }, data: {} }],
    ['old-reply', { kind: 'assistant-step', data: { turn: 2, finalNode: { seq: 9 } } }],
    ['current-reply', { kind: 'assistant-step', data: { turn: 3, finalNode: { seq: 19 } } }],
  ])
  const groups = { groupSource: key => ({ getSnapshot: () => ({ data: { turn: key === 'old-process' ? 2 : 3 },
    members: [{ key: key === 'old-process' ? 'old-tool' : 'current-reply' }, { key: 'extra-metadata' }] }) }) }
  assert.deepEqual(visibleRevisionEntries(entries, nodes, groups, { 9: { deleted: true, reason: 'regenerate', turn: 2 } }), entries.slice(2))
  assert.deepEqual(visibleRevisionEntries(entries, nodes, groups, {}), entries)
})

test('variant selection publishes the restored rows and chooser together and rejects concurrent requests', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  const requests = []
  let release
  globalThis.fetch = async (url, options) => {
    requests.push([url.split('/').at(-1), JSON.parse(options.body)])
    return { ok: true, json: () => new Promise(resolve => { release = resolve }) }
  }
  const loaded = []
  let show
  const provider = new RemoteMessageRevisionProvider('chat', () => { throw new Error('Variant selection cannot open a different chat') }, seq => {
    loaded.push(seq)
    return new Promise(resolve => { show = resolve })
  })
  const pending = provider.selectVariant(9, 0)
  await assert.rejects(provider.selectVariant(9, 1), /Дождитесь/)
  await assert.rejects(provider.regenerate(9), /Дождитесь/)
  const edits = { 9: { restored: true, text: 'Previous answer', content: [{ type: 'text', text: 'Previous answer' }] } }
  const variants = [{ groupId: 9, replySeq: 9, startSeq: 3, index: 0, count: 2 }]
  release({ ok: true, value: { sessionId: 'chat', changed: true, edits, variants } })
  while (!show) await new Promise(resolve => setImmediate(resolve))
  assert.equal(provider.getSnapshot().busy, true)
  assert.deepEqual(loaded, [3], 'The original input and process must be resident before the chooser becomes available')
  show()
  await pending
  assert.deepEqual(requests, [['message-variant', { sessionId: 'chat', seq: 9, index: 0 }]])
  assert.deepEqual(provider.getSnapshot(), { busy: false, edits, variants, error: null })
})

test('the updated client refuses regeneration through a Host that does not preserve variants', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  const endpoints = []
  globalThis.fetch = async url => {
    endpoints.push(url.split('/').at(-1))
    return { ok: true, json: async () => ({ ok: true, value: { ...editContract, regenerateKeepsVariants: undefined } }) }
  }
  await assert.rejects(new RemoteMessageRevisionProvider('chat', () => {}).regenerate(9), /перезапустите/)
  assert.deepEqual(endpoints, ['message-inspect'])
})
