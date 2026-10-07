import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { historyRows } from './chat-history.js'
import { paginate } from './catalog-view.js'
import { Pagination } from './pagination.jsx'

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
      if (active) setResult({ key: requestKey, loading: false, value: Object.fromEntries(ids.map(id => [id, { error: 'Не удалось загрузить данные чата.' }])) })
    })
    return () => { active = false }
  }, [history, key, requestKey])
  return result.key === requestKey ? result : { value: {}, loading: rows.length > 0 }
}

export function HistoryRow({ row, detail, loading, disabled, onOpen }) {
  const avatar = typeof detail?.avatar === 'string' && /^data:image\/png;base64,/i.test(detail.avatar) ? detail.avatar : null
  const [failedImage, setFailedImage] = useState(null)
  const name = detail?.characterName || row.title
  return <button type="button" className="mayori-history-row" disabled={disabled} onClick={() => { void onOpen(row.id) }}>
    <span className="mayori-history-avatar" aria-hidden="true">{avatar && failedImage !== avatar
      ? <img src={avatar} alt="" loading="lazy" onError={() => { setFailedImage(avatar) }} /> : Array.from(name)[0]?.toUpperCase()}</span>
    <span className="mayori-history-text"><strong>{name}</strong>
      {detail?.characterName && row.title !== name && row.title !== 'Чат без названия' && <small>{row.title}</small>}
      <span className="mayori-history-preview">{loading ? 'Загружаем сообщение…' : detail?.error || detail?.preview || 'Сообщений пока нет'}</span>
      {row.current && <small>Открыт сейчас</small>}
    </span>
    <time dateTime={new Date(row.updatedAt).toISOString()}>{new Date(row.updatedAt).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}</time>
  </button>
}

/** A flat catalog consumer; opening a row restores the existing conversation. */
export function ChatHistoryPanel({ history }) {
  const snapshot = useSyncExternalStore(history.subscribe, history.getSnapshot, history.getSnapshot)
  const archiveSnapshot = useSyncExternalStore(history.subscribeArchive, history.getArchiveSnapshot, history.getArchiveSnapshot)
  const [archivedOnly, setArchivedOnly] = useState(false)
  const [changingId, setChangingId] = useState(null)
  const changingRef = useRef(false)
  const archiveToggleRef = useRef(null)
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  useEffect(() => { setPage(1) }, [query, archivedOnly, pageSize])
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [detailsRevision, setDetailsRevision] = useState(0)
  useEffect(() => {
    if (notice && changingId === null) archiveToggleRef.current?.focus()
  }, [notice, changingId])
  useEffect(() => {
    let active = true
    setRefreshing(true)
    Promise.resolve().then(() => history.refresh()).catch(() => {
      if (active) setError('Не удалось загрузить историю. Попробуйте обновить список.')
    }).finally(() => { if (active) setRefreshing(false) })
    return () => { active = false }
  }, [history])
  const refresh = async () => {
    setError(null)
    setRefreshing(true)
    try { await history.refresh() }
    catch { setError('Не удалось загрузить историю. Попробуйте обновить список.') }
    finally { setRefreshing(false); setDetailsRevision(value => value + 1) }
  }
  const open = async id => {
    setError(null)
    try { await history.open(id) }
    catch { setError('Не удалось открыть чат. Обновите список и попробуйте снова.') }
  }
  const changeArchive = async row => {
    if (changingRef.current) return
    if (!archivedOnly && !window.confirm(`Убрать чат «${row.title}» в архив? Переписка сохранится, и чат можно будет восстановить.`)) return
    changingRef.current = true
    setChangingId(row.id)
    setError(null)
    setNotice('')
    try {
      if (archivedOnly) await history.restore(row.id)
      else await history.archive(row.id)
      setNotice(archivedOnly ? `Чат «${row.title}» восстановлен.` : `Чат «${row.title}» перемещён в архив.`)
    } catch (failure) {
      setError(failure?.rpcError?.code === 'workspace/session-active'
        ? 'Чат ещё выполняет работу. Дождитесь завершения или остановите её в чате, затем повторите.'
        : archivedOnly ? 'Не удалось восстановить чат. Попробуйте ещё раз.' : 'Не удалось переместить чат в архив. Попробуйте ещё раз.')
    } finally {
      changingRef.current = false
      setChangingId(null)
    }
  }
  const loading = refreshing || snapshot.phase === 'pending' || archiveSnapshot.phase === 'pending'
  const rows = archiveSnapshot.phase === 'ready'
    ? historyRows(snapshot, query, archiveSnapshot.archivedSessionIds, archivedOnly) : []
  const pagination = paginate(rows, page, pageSize)
  const details = useHistoryDetails(history, pagination.items, detailsRevision)
  return <section className="mayori-history-panel" aria-labelledby="mayori-history-title">
    <header className="mayori-history-header">
      <h2 id="mayori-history-title">История чатов</h2>
      <div className="mayori-history-controls">
        <label><input ref={archiveToggleRef} type="checkbox" checked={archivedOnly} disabled={changingId !== null} onChange={event => { setArchivedOnly(event.target.checked); setError(null); setNotice('') }} />Архив</label>
        <button type="button" className="mayori-secondary-button" disabled={refreshing} onClick={() => { void refresh() }}>Обновить</button>
      </div>
    </header>
    <label className="mayori-search">Поиск по названию или ID чата
      <input type="search" value={query} onChange={event => { setQuery(event.target.value) }} placeholder="Например, имя персонажа" />
    </label>
    <p role="status">{loading ? 'Загружаем историю…' : notice || `Найдено чатов: ${rows.length}`}</p>
    {archiveSnapshot.state === 'error' && <p role="alert" className="mayori-error">Не удалось загрузить состояние архива. Проверьте соединение и перезагрузите страницу.</p>}
    {error && <p role="alert" className="mayori-error">{error}</p>}
    {!loading && !error && archiveSnapshot.state !== 'error' && rows.length === 0 && <p>{query.trim() ? 'Ничего не найдено. Измените запрос или очистите поиск.' : archivedOnly ? 'В архиве пока нет чатов.' : 'Чатов пока нет. Выберите персонажа и нажмите «Играть» или восстановите чат из архива.'}</p>}
    <ul className="mayori-history-list">{pagination.items.map(row => <li key={row.id} className="mayori-history-item">
      <HistoryRow row={row} detail={details.value[row.id]} loading={details.loading} disabled={changingId === row.id} onOpen={open} />
      <button type="button" className="mayori-secondary-button" disabled={changingId !== null || archiveSnapshot.state === 'error'} aria-label={`${archivedOnly ? 'Восстановить чат' : 'В архив — чат'} «${row.title}»`} onClick={() => { void changeArchive(row) }}>
        {changingId === row.id ? 'Сохраняем…' : archivedOnly ? 'Восстановить' : 'В архив'}
      </button>
    </li>)}</ul>
    {rows.length > 0 && <Pagination pagination={pagination} total={rows.length} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize} />}
  </section>
}
