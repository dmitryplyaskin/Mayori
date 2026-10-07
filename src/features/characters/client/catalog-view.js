import { PAGE_SIZE_OPTIONS } from '../../../client/components/pagination-model.js'

/** Browser presentation preferences; no campaign data is persisted here. */
export const COLUMN_OPTIONS = [3, 5, 7]
export const CATALOG_PREFERENCE_KEY = 'mayori.characters.view'

export function catalogPreferences(value) {
  return { columns: COLUMN_OPTIONS.includes(value?.columns) ? value.columns : 5,
    pageSize: PAGE_SIZE_OPTIONS.includes(value?.pageSize) ? value.pageSize : 20 }
}

export function readCatalogPreferences() {
  try { return catalogPreferences(JSON.parse(globalThis.localStorage.getItem(CATALOG_PREFERENCE_KEY))) }
  catch { return catalogPreferences(null) }
}

export function saveCatalogPreferences(value) {
  try { globalThis.localStorage.setItem(CATALOG_PREFERENCE_KEY, JSON.stringify(catalogPreferences(value))) }
  catch { /* Storage restrictions should not prevent browsing. */ }
}

export function recentCharacters(cards) {
  return [...cards].sort((a, b) => b.importedAt - a.importedAt || a.id.localeCompare(b.id)).slice(0, 5)
}
