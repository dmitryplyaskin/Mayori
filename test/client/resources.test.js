import assert from 'node:assert/strict'
import test from 'node:test'
import { ByteCache, WorkQueue } from '../../src/shared/resources.js'
import { SessionProviders } from '../../src/client/infrastructure/session-providers.js'

test('derived caches evict by both bytes and recency and refuse oversized entries', () => {
  const cache = new ByteCache(2, 12)
  cache.set('a', 1, 4); cache.set('b', 2, 4); cache.get('a'); cache.set('c', 3, 4)
  assert.equal(cache.get('b'), undefined)
  assert.equal(cache.get('a'), 1)
  cache.set('too big', {}, 13)
  assert.equal(cache.get('too big'), undefined)
  cache.set('d', 4, 10)
  assert.equal(cache.entries.size, 1)
  assert.equal(cache.bytes, 10)
  cache.clear(); assert.equal(cache.bytes, 0)
})

test('reader queue bounds concurrency across callers and releases failures and unload', async () => {
  const queue = new WorkQueue(1, 1)
  let finish
  const first = queue.run(() => new Promise(resolve => { finish = resolve }))
  await Promise.resolve()
  const second = queue.run(() => { throw new Error('expected failure') })
  await assert.rejects(queue.run(() => {}), /занят/)
  finish('done'); assert.equal(await first, 'done')
  await assert.rejects(second, /expected failure/)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(await queue.run(() => 'recovered'), 'recovered')
  queue.close(); await assert.rejects(queue.run(() => {}), /занят/)
})

test('session cache preserves subscribed providers while evicting inactive ones', () => {
  const disposed = []
  const pool = new SessionProviders(id => ({ subscribe: () => () => {}, dispose: () => disposed.push(id) }), 2)
  const active = pool.get('active'), release = active.subscribe(() => {})
  for (let index = 0; index < 20; index++) pool.get(String(index))
  assert.equal(pool.get('active'), active)
  assert.equal(pool.entries.size, 2)
  release(); pool.dispose()
  assert.ok(disposed.includes('active'))
  assert.equal(pool.entries.size, 0)
})
