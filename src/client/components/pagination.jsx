import { tr } from '../../features/localization/client/service.js'
import { PAGE_SIZE_OPTIONS } from './pagination-model.js'
import { Select } from './select.jsx'
import { IconButton } from './icon-button.jsx'

export function Pagination({ pagination, total, pageSize, onPage, onPageSize }) {
  return <nav className="mayori-pagination" aria-label={tr("Страницы списка")}>
    <div className="mayori-filter-control"><span>{tr("На странице")}</span><Select aria-label={tr("На странице")} value={pageSize} onChange={value => onPageSize(Number(value))} options={PAGE_SIZE_OPTIONS.map(size => ({ value: size, label: size }))} /></div>
    <span role="status">{tr("{p1} из {p2}", { p1: total === 0 ? '0' : `${pagination.start + 1}–${pagination.end}`, p2: total })}</span>
    <div className="mayori-page-actions">
      <IconButton portal className="mayori-secondary-button" disabled={pagination.page <= 1} onClick={() => { onPage(pagination.page - 1) }} label={tr("Предыдущая страница")}>‹</IconButton>
      <label className="mayori-filter-control"><span>{tr("Страница")}</span><input type="number" min="1" max={pagination.pages} value={pagination.page} onChange={event => { const value = Number(event.target.value); if (Number.isSafeInteger(value) && value >= 1 && value <= pagination.pages) onPage(value) }} /></label>
      <span>{tr("из {p1}", { p1: pagination.pages })}</span>
      <IconButton portal className="mayori-secondary-button" disabled={pagination.page >= pagination.pages} onClick={() => { onPage(pagination.page + 1) }} label={tr("Следующая страница")}>›</IconButton>
    </div>
  </nav>
}
