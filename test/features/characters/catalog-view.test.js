import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogPreferences, readCatalogPreferences, saveCatalogPreferences, recentCharacters } from '../../../src/features/characters/client/catalog-view.js'

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

test('home uses five most recently imported characters without mutating the library', () => {
  const cards = Array.from({ length: 8 }, (_, i) => ({ id: String(i), importedAt: i }))
  assert.deepEqual(recentCharacters(cards).map(card => card.id), ['7', '6', '5', '4', '3'])
  assert.equal(cards[0].id, '0')
})
