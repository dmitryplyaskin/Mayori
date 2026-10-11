import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { PersistentChatDeletionProvider } from '../../../src/features/history/host/deletion.js'

async function fixture(t, overrides = {}) {
  const root = await mkdtemp(join(tmpdir(), 'mayori-chat-deletion-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const calls = []
  const ctx = { reflect: { provide() {} },
    workspaceRegistry: { async archiveSession(...args) { calls.push(args) } },
    async waterfall(_event, _payload, next) { return next() }, ...overrides }
  return { provider: new PersistentChatDeletionProvider(ctx, root), ctx, root, calls }
}

test('deletions survive provider restart, serialize concurrent writes and are idempotent', async t => {
  const { provider, ctx, root, calls } = await fixture(t)
  assert.deepEqual(await provider.list(), [])
  await Promise.all([provider.remove('first'), provider.remove('second'), provider.remove('first')])
  assert.deepEqual(await new PersistentChatDeletionProvider(ctx, root).list(), ['first', 'second'])
  assert.deepEqual(calls, [['first'], ['second']], 'archive admission receives no force-stop options')
})

test('running sessions and archive errors never commit deletion and allow retry', async t => {
  let running = true
  const { provider, ctx } = await fixture(t, { waterfall: async () => running ? ['turn'] : [] })
  await assert.rejects(provider.remove('busy'), /выполняет работу/)
  assert.deepEqual(await provider.list(), [])
  running = false
  await provider.remove('busy')
  ctx.workspaceRegistry.archiveSession = async () => { throw new Error('offline') }
  await assert.rejects(provider.remove('other'), /offline/)
  assert.deepEqual(await provider.list(), ['busy'])
  assert.throws(() => provider.remove(''), /идентификатор/)
})

test('corrupt deletion records fail closed and are never overwritten', async t => {
  const { provider, root, calls } = await fixture(t)
  await writeFile(join(root, 'deleted-chats.json'), '{"format":1,"ids":[null]}')
  await assert.rejects(provider.list(), /идентификатор/)
  await assert.rejects(provider.remove('other'), /идентификатор/)
  assert.deepEqual(calls, [])
})
