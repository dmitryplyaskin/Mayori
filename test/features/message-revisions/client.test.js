import assert from 'node:assert/strict'
import test from 'node:test'
import { RemoteMessageRevisionProvider } from '../../../src/features/message-revisions/client/revisions.js'

test('revision requests reject concurrent writes, navigate after success and always clear pending state', async t => {
  const previous = globalThis.fetch
  t.after(() => { globalThis.fetch = previous })
  let release
  const requests = [], opened = [], statuses = []
  globalThis.fetch = async (url, options) => {
    requests.push([url.split('/').at(-1), JSON.parse(options.body)])
    return { ok: true, json: () => new Promise(resolve => { release = resolve }) }
  }
  const revisions = new RemoteMessageRevisionProvider('original', id => { opened.push(id) })
  const dispose = revisions.subscribe(() => statuses.push(revisions.getSnapshot().busy))
  const first = revisions.edit(9, 'New text')
  await assert.rejects(revisions.regenerate(9), /Дождитесь/)
  release({ ok: true, value: { sessionId: 'new', changed: true } })
  await first
  assert.deepEqual(requests, [['message-edit', { sessionId: 'original', seq: 9, text: 'New text' }]])
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
