import { tr, noticeText, formatLocale, currentLanguage } from '../../localization/client/service.js'
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Select } from '../../../client/components/select.jsx'
import { historyRows } from './history.js'
import { paginate } from '../../../client/components/pagination-model.js'
import { Pagination } from '../../../client/components/pagination.jsx'
import { imageSource } from '../../media/shared/image.js'

export function ChatHistoryIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11a9 9 0 1 1 2.6 7M3 4v7h7M12 7v5l3 2"/></svg>
}

/** Load only the rows being displayed; late results never overwrite a new list. */
export function useHistoryDetails(history, rows, refreshKey = 0) {
  const [result, setResult] = useState({ key: '', value: {}, loading: false })
  const key = JSON.stringify(rows.map(row => [row.id, row.updatedAt]))
  const requestKey = `${refreshKey}:${key}`
  useEffect(() => {
    let active = true
    const ids = JSON.parse(key).map(row => row[0])
    setResult({ key: requestKey, value: {}, loading: ids.length > 0 })
    if (ids.length) Promise.resolve().then(() => history.details(ids)).then(value => {
      if (active) setResult({ key: requestKey, value, loading: false })
    }).catch(() => {
      if (active) setResult({ key: requestKey, loading: false, value: Object.fromEntries(ids.map(id => [id, { error: tr("Не удалось загрузить данные чата.") }])) })
    })
    return () => { active = false }
  }, [history, key, requestKey])
  return result.key === requestKey ? result : { value: {}, loading: rows.length > 0 }
}

export function HistoryRow({ row, detail, loading, disabled, onOpen }) {
  const avatar = imageSource(detail?.avatar)
  const [failedImage, setFailedImage] = useState(null)
  const name = detail?.characterName || row.title
  return <button type="button" className="mayori-history-row" disabled={disabled} onClick={() => { void onOpen(row.id) }}>
    <span className="mayori-history-avatar" aria-hidden="true">{avatar && failedImage !== avatar
      ? <img src={avatar} alt="" loading="lazy" onError={() => { setFailedImage(avatar) }} /> : Array.from(name)[0]?.toUpperCase()}</span>
    <span className="mayori-history-text"><strong>{name}</strong>
      {detail?.characterName && row.title !== name && row.title !== tr("Чат без названия") && <small>{row.title}</small>}
      <span className="mayori-history-preview">{loading ? tr("Загружаем сообщение…") : noticeText(detail?.error) || detail?.preview || tr("Сообщений пока нет")}</span>
      {row.current && <small>{tr("Открыт сейчас")}</small>}
    </span>
    <time dateTime={new Date(row.updatedAt).toISOString()}>{new Date(row.updatedAt).toLocaleString(formatLocale(), { dateStyle: 'medium', timeStyle: 'short' })}</time>
  </button>
}

/** A flat catalog consumer; opening a row restores the existing conversation. */
export function ChatHistoryPanel({ history }) {
  const snapshot = useSyncExternalStore(history.subscribe, history.getSnapshot, history.getSnapshot)
  const archiveSnapshot = useSyncExternalStore(history.subscribeArchive, history.getArchiveSnapshot, history.getArchiveSnapshot)
  const [status, setStatus] = useState('active')
  const [kind, setKind] = useState('all')
  const [period, setPeriod] = useState('all')
  const [sort, setSort] = useState('recent')
  const archivedOnly = status === 'archived'
  const [changingId, setChangingId] = useState(null)
  const changingRef = useRef(false)
  const controlsRef = useRef(null)
  const [removing, setRemoving] = useState(null)
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)
  const dialogTitle = useId()
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  useEffect(() => { setPage(1) }, [query, status, kind, period, sort, pageSize])
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [detailsRevision, setDetailsRevision] = useState(0)
  useEffect(() => {
    if (notice && changingId === null) controlsRef.current?.focus()
  }, [notice, changingId])
  useEffect(() => {
    if (removing) dialogRef.current?.showModal()
  }, [removing])
  const closeRemoval = () => {
    if (changingRef.current) return
    dialogRef.current?.close()
    setRemoving(null)
    if (triggerRef.current?.isConnected) triggerRef.current.focus()
    else controlsRef.current?.focus()
  }
  useEffect(() => {
    let active = true
    setRefreshing(true)
    Promise.resolve().then(() => history.ensureLoaded()).catch(() => {
      if (active) setError(tr("Не удалось загрузить историю. Попробуйте обновить список."))
    }).finally(() => { if (active) setRefreshing(false) })
    return () => { active = false }
  }, [history])
  const refresh = async () => {
    setError(null)
    setRefreshing(true)
    try { await history.refresh() }
    catch { setError(tr("Не удалось загрузить историю. Попробуйте обновить список.")) }
    finally { setRefreshing(false); setDetailsRevision(value => value + 1) }
  }
  const open = async id => {
    setError(null)
    try { await history.open(id) }
    catch { setError(tr("Не удалось открыть чат. Обновите список и попробуйте снова.")) }
  }
  const changeArchive = async row => {
    if (changingRef.current) return
    if (!row.archived && !window.confirm(tr("Убрать чат «{p1}» в архив?", { p1: row.title }))) return
    changingRef.current = true
    setChangingId(row.id)
    setError(null)
    setNotice('')
    try {
      if (row.archived) await history.restore(row.id)
      else await history.archive(row.id)
      setNotice(row.archived ? tr("Чат восстановлен.") : tr("Чат перемещён в архив."))
    } catch (failure) {
      setError(failure?.rpcError?.code === 'workspace/session-active'
        ? tr("Чат ещё выполняет работу. Дождитесь завершения или остановите её в чате, затем повторите.")
        : row.archived ? tr("Не удалось восстановить чат.") : tr("Не удалось переместить чат в архив."))
    } finally {
      changingRef.current = false
      setChangingId(null)
    }
  }
  const remove = async event => {
    event.preventDefault()
    if (changingRef.current || !removing) return
    changingRef.current = true
    setChangingId(removing.id); setError(null); setNotice('')
    try {
      await history.remove(removing.id)
      setRemoving(null); setNotice(tr("Чат удалён."))
    } catch (failure) {
      setError(failure?.rpcError?.code === 'workspace/session-active'
        ? tr("Чат ещё выполняет работу. Дождитесь завершения.") : failure.message || tr("Не удалось удалить чат."))
    } finally { changingRef.current = false; setChangingId(null) }
  }
  const loading = refreshing || snapshot.phase === 'pending' || archiveSnapshot.phase === 'pending'
  const language = currentLanguage()
  const rows = useMemo(() => archiveSnapshot.phase === 'ready'
    && archiveSnapshot.state !== 'error'
    ? historyRows(snapshot, query, archiveSnapshot.archivedSessionIds, archivedOnly, Infinity, {
      status, kind, sort, since: period === 'all' ? undefined : Date.now() - Number(period) * 86400000,
    }) : [], [snapshot, query, archiveSnapshot, archivedOnly, status, kind, sort, period, language])
  const pagination = paginate(rows, page, pageSize)
  const details = useHistoryDetails(history, pagination.items, detailsRevision)
  return <section className="mayori-history-panel" aria-labelledby="mayori-history-title">
    <header className="mayori-history-header">
      <h2 id="mayori-history-title">{tr("История чатов")}</h2>
      <div className="mayori-history-controls">
        <button ref={controlsRef} type="button" className="mayori-secondary-button" disabled={refreshing || changingId !== null} onClick={() => { void refresh() }}>{tr("Обновить")}</button>
      </div>
    </header>
    <label className="mayori-search">{tr("Поиск по названию или ID чата ")}<input type="search" value={query} onChange={event => { setQuery(event.target.value) }} placeholder={tr("Например, имя персонажа")} />
    </label>
    <div className="mayori-history-filters">
      <label>{tr("Статус")}<Select aria-label={tr("Статус чатов")} value={status} disabled={changingId !== null} onChange={setStatus} options={[
        { value: 'active', label: tr("Без архива") }, { value: 'archived', label: tr("Архив") }, { value: 'all', label: tr("Все чаты") },
      ]} /></label>
      <label>{tr("Чаты")}<Select aria-label={tr("Тип чатов")} value={kind} onChange={setKind} options={[
        { value: 'all', label: tr("Все") }, { value: 'current', label: tr("Открытые") }, { value: 'running', label: tr("В работе") },
        { value: 'branches', label: tr("Ветки") }, { value: 'originals', label: tr("Без веток") },
      ]} /></label>
      <label>{tr("Активность")}<Select aria-label={tr("Период активности")} value={period} onChange={setPeriod} options={[
        { value: 'all', label: tr("За всё время") }, { value: '1', label: tr("За 24 часа") }, { value: '7', label: tr("За 7 дней") }, { value: '30', label: tr("За 30 дней") },
      ]} /></label>
      <label>{tr("Сортировка")}<Select aria-label={tr("Сортировка чатов")} value={sort} onChange={setSort} options={[
        { value: 'recent', label: tr("Сначала недавние") }, { value: 'oldest', label: tr("Сначала давние") },
        { value: 'title-asc', label: tr("Название: А–Я") }, { value: 'title-desc', label: tr("Название: Я–А") },
      ]} /></label>
    </div>
    <p role="status">{loading ? tr("Загружаем историю…") : notice || tr("Найдено чатов: {p1}", { p1: rows.length })}</p>
    {archiveSnapshot.state === 'error' && <p role="alert" className="mayori-error">{tr("Не удалось загрузить состояние архива. Проверьте соединение и перезагрузите страницу.")}</p>}
    {error && !removing && <p role="alert" className="mayori-error">{noticeText(error)}</p>}
    {!loading && !error && archiveSnapshot.state !== 'error' && rows.length === 0 && <p>{query.trim() || kind !== 'all' || period !== 'all' ? tr("Чаты не найдены. Измените фильтры или поиск.") : archivedOnly ? tr("В архиве пока нет чатов.") : tr("Чатов пока нет.")}</p>}
    <ul className="mayori-history-list">{pagination.items.map(row => <li key={row.id} className="mayori-history-item">
      <HistoryRow row={row} detail={details.value[row.id]} loading={details.loading} disabled={changingId === row.id} onOpen={open} />
      <div className="mayori-history-actions">
        <button type="button" className="mayori-secondary-button" disabled={changingId !== null || archiveSnapshot.state === 'error'} aria-label={`${row.archived ? tr("Восстановить чат") : tr("В архив — чат")} «${row.title}»`} onClick={() => { void changeArchive(row) }}>
          {changingId === row.id ? tr("Сохраняем…") : row.archived ? tr("Восстановить") : tr("В архив")}
        </button>
        <button type="button" className="mayori-secondary-button" disabled={changingId !== null || archiveSnapshot.state === 'error'} aria-haspopup="dialog" aria-label={tr("Удалить чат «{p1}»", { p1: row.title })}
          onClick={event => { triggerRef.current = event.currentTarget; setError(null); setRemoving(row) }}>{tr("Удалить")}</button>
      </div>
    </li>)}</ul>
    {rows.length > 0 && <Pagination pagination={pagination} total={rows.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />}
    {removing && createPortal(<dialog ref={dialogRef} className="mayori-message-editor mayori-message-confirm" aria-labelledby={dialogTitle}
      onCancel={event => { event.preventDefault(); closeRemoval() }} onKeyDown={event => event.stopPropagation()}>
      <form onSubmit={remove}>
        <h2 id={dialogTitle}>{tr("Удалить чат «{p1}»?", { p1: removing.title })}</h2>
        {error && <p role="alert" className="mayori-error">{noticeText(error)}</p>}
        <div className="mayori-message-editor-actions">
          <button type="button" autoFocus disabled={changingId !== null} onClick={closeRemoval}>{tr("Отмена")}</button>
          <button type="submit" disabled={changingId !== null}>{changingId !== null ? tr("Удаляем…") : tr("Удалить")}</button>
        </div>
      </form>
    </dialog>, document.body)}
  </section>
}
