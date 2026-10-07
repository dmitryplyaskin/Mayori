export const PAGE_SIZE_OPTIONS = [20, 40, 60]

export function paginate(items, requestedPage, pageSize) {
  const size = PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : 20
  const pages = Math.max(1, Math.ceil(items.length / size))
  const page = Math.max(1, Math.min(pages, Number.isSafeInteger(requestedPage) ? requestedPage : 1))
  const start = (page - 1) * size
  return { page, pages, start, end: Math.min(start + size, items.length), items: items.slice(start, start + size) }
}
