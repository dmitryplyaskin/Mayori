import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { homedir, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import * as Storage from '../../../src/host/storage-plugin.js'
import { resolveStorageConfig } from '../../../src/features/storage/host/config.js'

test('storage defaults follow the current user home independently of coding DSH_HOME', () => {
  const storageModule = new URL('../../../src/features/storage/host/config.js', import.meta.url).href
  const hostModule = new URL('../../../src/host/config.js', import.meta.url).href
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    const { resolveStorageConfig } = await import(${JSON.stringify(storageModule)});
    const { resolveConfig } = await import(${JSON.stringify(hostModule)});
    console.log(JSON.stringify({ storage: resolveStorageConfig(), director: resolveConfig() }));
  `], { encoding: 'utf8', env: { ...process.env, DSH_HOME: join(tmpdir(), 'coding-history') } })
  assert.equal(result.status, 0, result.stderr)
  const value = JSON.parse(result.stdout)
  const root = join(homedir(), '.dsh-mayori')
  assert.equal(value.storage.root, root)
  for (const [field, leaf] of [['charactersPath', 'characters'], ['campaignsPath', 'campaigns'], ['personasPath', 'personas'], ['presetsPath', 'presets']]) {
    assert.equal(value.director[field], join(root, 'mayori', leaf))
  }
})

test('storage overrides are validated and tilde paths expand for the current user', () => {
  assert.equal(resolveStorageConfig({ root: '~/custom-mayori' }).root, join(homedir(), 'custom-mayori'))
  assert.equal(resolveStorageConfig({ root: join(tmpdir(), 'a', '..', 'mayori') }).root, resolve(tmpdir(), 'mayori'))
  for (const root of ['', ' ', './relative', 42, false]) {
    assert.throws(() => resolveStorageConfig({ root }), /storage root/)
  }
})

test('native persistence consumers obtain paths through a reversible Cordis service', async t => {
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  const root = join(tmpdir(), 'mayori-data with spaces')
  const fiber = ctx.plugin(Storage, { root })
  await fiber
  assert.equal(ctx.mayoriStorage.root, root)
  let consumed
  const consumer = ctx.inject(['mayoriStorage'], ctx => {
    consumed = {
      sessions: ctx.mayoriStorage.path('sessions'),
      registry: ctx.mayoriStorage.path('storages'),
      search: ctx.mayoriStorage.path('cache', 'session-search.sqlite'),
      attachments: ctx.mayoriStorage.root,
    }
  })
  await consumer
  assert.deepEqual(consumed, {
    sessions: join(root, 'sessions'), registry: join(root, 'storages'),
    search: join(root, 'cache', 'session-search.sqlite'), attachments: root,
  })
  await fiber.dispose()
  assert.equal(ctx.mayoriStorage, undefined)
})
