import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogPreferences, readCatalogPreferences, saveCatalogPreferences, paginate, recentCharacters } from '../src/catalog-view.js'

test('view preferences survive reload, validate stored values and tolerate blocked storage', () => {
  const previous = globalThis.localStorage
  let stored = null
  try {
    globalThis.localStorage = { getItem: () => stored, setItem: (_key, value) => { stored = value } }
    assert.deepEqual(readCatalogPreferences(), { columns: 5, pageSize: 20 })
    saveCatalogPreferences({ columns: 7, pageSize: 60 })
    assert.deepEqual(readCatalogPreferences(), { columns: 7, pageSize: 60 })
    assert.deepEqual(catalogPreferences({ columns: '3', pageSize: 0 }), { columns: 5, pageSize: 20 })
    stored = 'corrupt'
    assert.deepEqual(readCatalogPreferences(), { columns: 5, pageSize: 20 })
    globalThis.localStorage = { getItem() { throw Error('blocked') }, setItem() { throw Error('blocked') } }
    assert.deepEqual(readCatalogPreferences(), { columns: 5, pageSize: 20 })
    assert.doesNotThrow(() => saveCatalogPreferences({ columns: 3, pageSize: 40 }))
  } finally { if (previous === undefined) delete globalThis.localStorage; else globalThis.localStorage = previous }
})

test('pagination limits rows and clamps the page after filtering, deletion or limit changes', () => {
  const rows = Array.from({ length: 45 }, (_, i) => i)
  const last = paginate(rows, 3, 20)
  assert.deepEqual(last, { page: 3, pages: 3, start: 40, end: 45, items: [40, 41, 42, 43, 44] })
  assert.equal(paginate(rows.slice(0, 20), 3, 20).page, 1)
  assert.equal(paginate(rows, 3, 60).page, 1)
  assert.equal(paginate(rows, -5, 20).page, 1)
  assert.deepEqual(paginate([], 9, 20), { page: 1, pages: 1, start: 0, end: 0, items: [] })
})

test('home uses five most recently imported characters without mutating the library', () => {
  const cards = Array.from({ length: 8 }, (_, i) => ({ id: String(i), importedAt: i }))
  assert.deepEqual(recentCharacters(cards).map(card => card.id), ['7', '6', '5', '4', '3'])
  assert.equal(cards[0].id, '0')
})
