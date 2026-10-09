import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Session } from '@deepseek-ai/dsh-session'
import { greetingSeed } from '../../../src/features/character-session/host/greeting.js'
import { SessionHistoryDetailsProvider } from '../../../src/features/history/host/details.js'
import { characterSnapshot } from '../../../src/features/character-session/domain/character.js'

test('preview cache reuses unchanged logs and invalidates revisions, live appends and selection changes', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mayori-preview-tests-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const session = Session.create('chat', greetingSeed({ messageId: 'opening', text: 'Saved opening' }))
  let revision = 'r1', reads = 0
  const disposers = []
  const ctx = { reflect: { provide() {} }, effect: factory => { disposers.push(factory()) },
    sessions: { messageProjections: [] }, agents: { get: () => ({ session }) },
    sessionPersistence: { identity: Symbol(), stat: async () => ({ revision, header: { id: 'chat' } }) },
    sessionQuery: { readSession: async () => { reads++; return { session: session.header, events: session.snapshotEvents() } } } }
  const provider = new SessionHistoryDetailsProvider(ctx, root)
  assert.equal((await provider.read(['chat'])).chat.preview, 'Saved opening')
  await provider.read(['chat']); assert.equal(reads, 1)
  provider.cache.clear()
  await provider.read(['chat']); assert.equal(reads, 1, 'Bounded disk cache survives memory eviction within this boot')
  revision = 'r2'
  await Promise.all([provider.read(['chat']), provider.read(['chat'])]); assert.equal(reads, 2, 'Concurrent requests share a replay')
  session.append('user/message', { id: 'user', role: 'user', source: { kind: 'user' }, content: [{ type: 'text', text: 'Fresh message' }] }, { surfaceOp: 'append' })
  assert.equal((await provider.read(['chat'])).chat.preview, 'Fresh message')
  assert.equal(reads, 3, 'An unflushed live append invalidates persisted previews')
  await provider.selections.save('chat', { ...characterSnapshot({ id: 'a'.repeat(64), name: 'NPC', data: { name: 'NPC', description: '' } }), image: null }, () => {})
  assert.equal((await provider.read(['chat'])).chat.characterName, 'NPC')
  assert.equal(reads, 4)
  const reopened = new SessionHistoryDetailsProvider(ctx, root)
  await reopened.read(['chat']); assert.equal(reads, 5, 'A new provider verifies opaque persistence revisions again')
  ctx.sessionPersistence.identity = Symbol()
  await provider.read(['chat']); assert.equal(reads, 6, 'Replacing the native service invalidates prior tokens')
  for (const dispose of disposers) dispose()
})

test('simultaneous history requests share one bounded reader queue and cache failures do not hide valid logs', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mayori-preview-queue-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const session = Session.create('chat', greetingSeed({ messageId: 'opening', text: 'Readable' }))
  let active = 0, maximum = 0
  const ctx = { reflect: { provide() {} }, sessions: { messageProjections: [] },
    sessionPersistence: { identity: Symbol(), stat: async id => ({ revision: id, header: { id } }) },
    sessionQuery: { readSession: async () => {
      maximum = Math.max(maximum, ++active)
      await new Promise(resolve => setTimeout(resolve, 5)); active--
      return { session: session.header, events: session.snapshotEvents() }
    } } }
  const provider = new SessionHistoryDetailsProvider(ctx, root, undefined, { concurrency: 2, cacheEntries: 3, diskEntries: 3 })
  provider.disk.get = async () => { throw new Error('Cache unavailable') }
  provider.disk.put = async () => { throw new Error('Cache unavailable') }
  const results = await Promise.all([provider.read(['a', 'b', 'c', 'd']), provider.read(['e', 'f', 'g', 'h'])])
  assert.equal(maximum, 2)
  assert.equal(results[0].a.preview, 'Readable')
  assert.ok(provider.cache.entries.size <= 3)
  provider.work.close()
})
