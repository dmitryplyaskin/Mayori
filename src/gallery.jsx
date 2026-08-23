/** Gallery Consumer for the browser-local Character Library Service. */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

const EMPTY_ARRAY = Object.freeze([])

function icon(name) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  if (name === 'gallery') return <svg {...common}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z"/><circle cx="9" cy="9" r="1.5"/><path d="m5 17 4.5-4.5 3 3 2-2L19 18"/></svg>
  if (name === 'upload') return <svg {...common}><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5"/><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg>
  if (name === 'close') return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>
  if (name === 'trash') return <svg {...common}><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5"/></svg>
  return null
}

function safeAssetUri(card) {
  const assets = Array.isArray(card.data.assets) ? card.data.assets : EMPTY_ARRAY
  const main = assets.find(asset => asset?.type === 'icon' && asset?.name === 'main')
    ?? assets.find(asset => asset?.type === 'icon')
  const uri = typeof main?.uri === 'string' ? main.uri : ''
  return /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(uri) ? uri : null
}

function useCardImage(card) {
  const [source, setSource] = useState(() => safeAssetUri(card))
  useEffect(() => {
    if (!(card.image instanceof Blob)) {
      setSource(safeAssetUri(card))
      return undefined
    }
    const url = URL.createObjectURL(card.image)
    setSource(url)
    return () => { URL.revokeObjectURL(url) }
  }, [card])
  return source
}

function text(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function CharacterCard({ card, onRemove }) {
  const source = useCardImage(card)
  const description = text(card.data.description) ?? text(card.data.personality)
  const tags = Array.isArray(card.data.tags)
    ? card.data.tags.filter(value => typeof value === 'string' && value.trim() !== '').slice(0, 5)
    : EMPTY_ARRAY
  const details = [
    ['Описание', text(card.data.description)],
    ['Характер', text(card.data.personality)],
    ['Сценарий', text(card.data.scenario)],
    ['Первое сообщение', text(card.data.first_mes)],
  ].filter(([, value]) => value !== null)
  return (
    <li className="mayori-card">
      <article>
        <div className="mayori-card-media">
          {source === null
            ? <span className="mayori-card-fallback" aria-hidden="true">{card.name.slice(0, 1).toUpperCase()}</span>
            : <img src={source} alt={`Портрет: ${card.name}`} />}
          <span className="mayori-card-version">v{card.specVersion}</span>
        </div>
        <div className="mayori-card-body">
          <div className="mayori-card-heading">
            <div>
              <h3>{card.name}</h3>
              <p className="mayori-card-byline">{text(card.data.creator) ?? 'Автор не указан'}</p>
            </div>
            <button
              type="button"
              className="mayori-icon-action"
              aria-label={`Удалить карточку ${card.name}`}
              onClick={() => { onRemove(card) }}
            >
              {icon('trash')}
            </button>
          </div>
          {description !== null && <p className="mayori-card-summary">{description}</p>}
          {tags.length > 0 && (
            <ul className="mayori-tags" aria-label="Теги">
              {tags.map((tag, index) => <li key={`${tag}-${index}`}>{tag}</li>)}
            </ul>
          )}
          {card.warnings.length > 0 && <p className="mayori-card-warning">{card.warnings.join(' ')}</p>}
          {details.length > 0 && (
            <details className="mayori-card-details">
              <summary>Подробнее</summary>
              <dl>
                {details.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </div>
      </article>
    </li>
  )
}

function CharacterGalleryDialog({ library, open, onClose, openerRef }) {
  const dialogRef = useRef(null)
  const inputRef = useRef(null)
  const snapshot = useSyncExternalStore(library.subscribe, library.getSnapshot, library.getSnapshot)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const normalizedQuery = query.trim().toLocaleLowerCase()
  const cards = useMemo(() => snapshot.cards.filter((card) => {
    if (normalizedQuery === '') return true
    const haystack = [card.name, card.data.creator, ...(Array.isArray(card.data.tags) ? card.data.tags : [])]
      .filter(value => typeof value === 'string')
      .join('\n')
      .toLocaleLowerCase()
    return haystack.includes(normalizedQuery)
  }), [normalizedQuery, snapshot.cards])

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const finishClose = () => {
    onClose()
    requestAnimationFrame(() => { openerRef.current?.focus() })
  }

  const importFiles = async (fileList) => {
    if (fileList.length === 0) return
    setBusy(true)
    setNotice(null)
    try {
      const result = await library.importFiles(fileList)
      const rejected = result.rejected.map(item => `${item.name}: ${item.error}`)
      setNotice({
        kind: rejected.length > 0 ? 'error' : 'success',
        text: [
          result.imported > 0 ? `Импортировано: ${result.imported}.` : '',
          ...rejected,
        ].filter(Boolean).join(' '),
      })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) })
    } finally {
      setBusy(false)
      if (inputRef.current !== null) inputRef.current.value = ''
    }
  }

  const remove = async (card) => {
    if (!window.confirm(`Удалить карточку «${card.name}» из галереи?`)) return
    try {
      await library.remove(card.id)
      setNotice({ kind: 'success', text: `Карточка «${card.name}» удалена.` })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) })
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="mayori-gallery-dialog"
      aria-labelledby="mayori-gallery-title"
      onClose={finishClose}
      onCancel={() => { onClose() }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        dialogRef.current?.close()
      }}
    >
      <div className="mayori-gallery-shell">
        <header className="mayori-gallery-header">
          <div>
            <p className="mayori-gallery-kicker">Character Card v2–v3</p>
            <h2 id="mayori-gallery-title">Галерея персонажей</h2>
          </div>
          <button type="button" className="mayori-icon-action mayori-close" aria-label="Закрыть галерею" onClick={() => { dialogRef.current?.close() }}>
            {icon('close')}
          </button>
        </header>

        <div className="mayori-gallery-toolbar">
          <label className="mayori-import-button" aria-disabled={busy || undefined}>
            {icon('upload')}
            <span>{busy ? 'Импорт…' : 'Импортировать'}</span>
            <input
              ref={inputRef}
              type="file"
              accept=".png,.json,image/png,application/json"
              multiple
              disabled={busy}
              onChange={(event) => { void importFiles(event.currentTarget.files ?? []) }}
            />
          </label>
          <label className="mayori-search">
            <span>Поиск</span>
            <input
              type="search"
              value={query}
              placeholder="Имя, автор или тег"
              onChange={event => { setQuery(event.currentTarget.value) }}
            />
          </label>
        </div>

        <div className="mayori-gallery-status" role="status" aria-live="polite">
          {notice !== null && <p className={notice.kind === 'error' ? 'mayori-error' : 'mayori-success'}>{notice.text}</p>}
          {snapshot.status === 'error' && <p className="mayori-error">{snapshot.error}</p>}
          {snapshot.status === 'ready' && snapshot.cards.length > 0 && (
            <p>{normalizedQuery === '' ? `Карточек: ${snapshot.cards.length}` : `Найдено: ${cards.length}`}</p>
          )}
        </div>

        <section className="mayori-gallery-content" aria-label="Импортированные персонажи">
          {snapshot.status === 'loading' && <p className="mayori-empty">Загружаем библиотеку…</p>}
          {snapshot.status === 'ready' && cards.length === 0 && (
            <div className="mayori-empty">
              <span className="mayori-empty-icon">{icon('gallery')}</span>
              <h3>{snapshot.cards.length === 0 ? 'Здесь пока пусто' : 'Ничего не найдено'}</h3>
              <p>{snapshot.cards.length === 0
                ? 'Импортируйте PNG или JSON с Character Card v2/v3.'
                : 'Попробуйте изменить поисковый запрос.'}</p>
            </div>
          )}
          {cards.length > 0 && (
            <ul className="mayori-card-grid">
              {cards.map(card => <CharacterCard key={card.id} card={card} onRemove={remove} />)}
            </ul>
          )}
        </section>
      </div>
    </dialog>
  )
}

/** Sidebar slot entry and modal gallery consumer. */
export function CharacterGalleryAction({ wide, library }) {
  const [open, setOpen] = useState(false)
  const openerRef = useRef(null)
  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="mayori-gallery-trigger"
        aria-label={wide ? undefined : 'Галерея персонажей'}
        onClick={() => { setOpen(true) }}
      >
        {icon('gallery')}
        {wide && <span>Персонажи</span>}
      </button>
      <CharacterGalleryDialog
        library={library}
        open={open}
        onClose={() => { setOpen(false) }}
        openerRef={openerRef}
      />
    </>
  )
}
