import assert from 'node:assert/strict'
import test from 'node:test'
import { RemoteMessageRevisionProvider } from '../../../src/features/message-revisions/client/revisions.js'
import { editedNode } from '../../../src/features/message-revisions/client/message.js'

const editContract = { editModes: ['current', 'branch'], editRunsModel: false }

test('revision requests reject concurrent writes, navigate after success and always clear pending state', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  let release
  const requests = [], opened = [], statuses = []
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/message-inspect')) return { ok: true, json: async () => ({ ok: true, value: editContract }) }
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
