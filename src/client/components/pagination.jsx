import { PAGE_SIZE_OPTIONS } from './pagination-model.js'
import { Select } from './select.jsx'

export function Pagination({ pagination, total, pageSize, onPage, onPageSize }) {
  return <nav className="mayori-pagination" aria-label="Страницы списка">
    <div className="mayori-filter-control"><span>На странице</span><Select aria-label="На странице" value={pageSize} onChange={value => onPageSize(Number(value))} options={PAGE_SIZE_OPTIONS.map(size => ({ value: size, label: size }))} /></div>
    <span role="status">{total === 0 ? '0' : `${pagination.start + 1}–${pagination.end}`} из {total}</span>
    <div className="mayori-page-actions">
      <button type="button" className="mayori-secondary-button" disabled={pagination.page <= 1} onClick={() => { onPage(pagination.page - 1) }} aria-label="Предыдущая страница">‹</button>
      <label className="mayori-filter-control"><span>Страница</span><input type="number" min="1" max={pagination.pages} value={pagination.page} onChange={event => { const value = Number(event.target.value); if (Number.isSafeInteger(value) && value >= 1 && value <= pagination.pages) onPage(value) }} /></label>
      <span>из {pagination.pages}</span>
      <button type="button" className="mayori-secondary-button" disabled={pagination.page >= pagination.pages} onClick={() => { onPage(pagination.page + 1) }} aria-label="Следующая страница">›</button>
    </div>
  </nav>
}
