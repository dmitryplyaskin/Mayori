/** Browser presentation preferences; no campaign data is persisted here. */
export const COLUMN_OPTIONS = [3, 5, 7]
export const PAGE_SIZE_OPTIONS = [20, 40, 60]
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

export function paginate(items, requestedPage, pageSize) {
  const size = PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : 20
  const pages = Math.max(1, Math.ceil(items.length / size))
  const page = Math.max(1, Math.min(pages, Number.isSafeInteger(requestedPage) ? requestedPage : 1))
  const start = (page - 1) * size
  return { page, pages, start, end: Math.min(start + size, items.length), items: items.slice(start, start + size) }
}

export function recentCharacters(cards) {
  return [...cards].sort((a, b) => b.importedAt - a.importedAt || a.id.localeCompare(b.id)).slice(0, 5)
}
