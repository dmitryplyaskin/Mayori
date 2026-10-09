import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { FileSystemCharacterLibraryStore } from '../../../src/features/characters/host/store.js'

const payload = (name, creator, tags, description = 'Hidden description') => ({ files: [{ name: `${name}.json`, type: 'application/json',
  base64: Buffer.from(JSON.stringify({ spec: 'chara_card_v3', spec_version: '3.0', data: { name, creator, tags, description,
    extensions: { preserved: 'Original card data' } } })).toString('base64') }] })
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'mayori-catalog-tests-'))
  const store = new FileSystemCharacterLibraryStore(root)
  t.after(async () => { await store.close(); await rm(root, { recursive: true, force: true }) })
  return { root, store }
}

test('catalog pages and facets omit full card content; direct lookup preserves it', async t => {
  const { store } = await fixture(t)
  for (let index = 0; index < 25; index++) await store.import(payload(`Character ${String(index).padStart(2, '0')}`, index < 3 ? 'Small' : 'Large', ['common', index < 3 ? 'small' : 'large']))
  const first = await store.query({ pageSize: 20, sort: 'name' })
  assert.equal(first.cards.length, 20)
  assert.equal(first.total, 25)
  assert.equal(first.cards[0].data.description, undefined)
  assert.equal(first.cards[0].card, undefined)
  assert.equal((await store.get(first.cards[0].id)).data.extensions.preserved, 'Original card data')
  const last = await store.query({ page: 2, pageSize: 20, sort: 'name' })
  assert.equal(last.cards.length, 5)
  assert.equal(last.cards[0].name, 'Character 20')
  const search = await store.query({ query: 'hidden DESCRIPTION', creator: 'Small', tags: ['common', 'small'] })
  assert.equal(search.filteredTotal, 3)
  assert.deepEqual(search.facets.creators, ['Large', 'Small'])
  assert.deepEqual(search.facets.tags.find(([tag]) => tag === 'common'), ['common', 25])
  assert.equal((await store.query({ page: 200, query: 'Character 24' })).page, 1)
  await assert.rejects(store.query({ pageSize: 100000 }), /фильтры/)
})

test('corrupt neighbor cannot block lookup, rebuilding, or healthy catalog entries', async t => {
  const { root, store } = await fixture(t)
  await store.import(payload('Healthy', 'Creator', []))
  const { cards } = await store.query()
  await writeFile(join(root, `${'f'.repeat(64)}.json`), '{bad json')
  const reopened = new FileSystemCharacterLibraryStore(root)
  t.after(() => reopened.close())
  const result = await reopened.query()
  assert.equal(result.cards.length, 1)
  assert.equal(result.unavailable, 1)
  assert.equal((await reopened.get(cards[0].id)).name, 'Healthy')
  await assert.rejects(reopened.get('../escape'), /идентификатор/)
})

test('warm catalog reads metadata index even when the original card disappears mid-run', async t => {
  const { root, store } = await fixture(t)
  await store.import(payload('Indexed', 'Creator', ['indexed']))
  const id = (await store.query()).cards[0].id
  const path = join(root, `${id}.json`)
  const source = await readFile(path)
  await rm(path)
  assert.equal((await store.query()).cards[0].name, 'Indexed', 'Warm query does not reopen JSON payloads')
  await assert.rejects(store.get(id), { code: 'ENOENT' })
  await writeFile(path, source)
  await store.remove(id)
  assert.equal((await store.query()).total, 0)
})

test('a corrupt derived SQLite catalog is rebuilt without changing the source card', async t => {
  const { root, store } = await fixture(t)
  await store.import(payload('Preserved', 'Creator', ['source']))
  const id = (await store.query()).cards[0].id
  const source = await readFile(join(root, `${id}.json`))
  await store.close()
  await writeFile(join(root, 'cache', 'catalog-v1.sqlite'), 'broken derived data')
  const reopened = new FileSystemCharacterLibraryStore(root)
  assert.equal((await reopened.query()).cards[0].name, 'Preserved')
  assert.deepEqual(await readFile(join(root, `${id}.json`)), source)
  await reopened.close()
})

test('legacy catalog indexing returns its first batch while the remaining records build in background', async t => {
  const { root, store } = await fixture(t)
  for (let index = 0; index < 125; index++) {
    const id = index.toString(16).padStart(64, '0')
    await writeFile(join(root, `${id}.json`), JSON.stringify({ format: 1, id, name: `Legacy ${index}`, importedAt: index,
      hasImage: true, card: { data: { name: `Legacy ${index}`, description: 'legacy' } } }))
  }
  const first = await store.query({ pageSize: 5 })
  assert.equal(first.cards.length, 5)
  assert.equal(first.indexing, true)
  assert.ok(first.total >= 60 && first.total < 125)
  let result = first
  while (result.indexing) { await new Promise(resolve => setTimeout(resolve, 10)); result = await store.query({ pageSize: 5 }) }
  assert.equal(result.total, 125)
  assert.equal(result.cards[0].name, 'Legacy 124')
  assert.equal((await readdir(root)).filter(name => name.endsWith('.png')).length, 0, 'Index never attempts to load PNG originals')
})
