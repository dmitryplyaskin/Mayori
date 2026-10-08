/** Full-screen Gallery Consumer for the Host-owned Character Library. */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { COLUMN_OPTIONS, readCatalogPreferences, saveCatalogPreferences } from './catalog-view.js'
import { paginate } from '../../../client/components/pagination-model.js'
import { Pagination } from '../../../client/components/pagination.jsx'
import { Select } from '../../../client/components/select.jsx'
import { DEFAULT_PERSONA, renderTemplate } from '../../../shared/templates.js'

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
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
  if (name === 'filter') return <svg {...common}><path d="M4 6h16M7 12h10M10 18h4"/></svg>
  if (name === 'play') return <svg {...common}><path d="m9 7 8 5-8 5z"/></svg>
  if (name === 'edit') return <svg {...common}><path d="m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2z"/><path d="m14.8 6.8 2.8 2.8"/></svg>
  return null
}

function text(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

function cardTags(card) {
  return Array.isArray(card.data.tags)
    ? card.data.tags.filter(value => typeof value === 'string' && value.trim() !== '').map(value => value.trim())
    : EMPTY_ARRAY
}

function safeAssetUri(card) {
  if (typeof card.image === 'string' && /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(card.image)) {
    return card.image
  }
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

function CardPortrait({ card, className = '' }) {
  const source = useCardImage(card)
  return source === null
    ? <span className={`mayori-card-fallback ${className}`} aria-hidden="true">{card.name.slice(0, 1).toUpperCase()}</span>
    : <img className={className} src={source} alt={`Портрет: ${card.name}`} />
}

function ImportControl({ busy, inputRef, onFiles, compact = false }) {
  return (
    <label className={`mayori-import-button${compact ? ' mayori-import-compact' : ''}`} aria-disabled={busy || undefined}>
      {icon('upload')}
      <span>{busy ? 'Импорт…' : 'Импортировать'}</span>
      <input
        ref={inputRef}
        type="file"
        accept=".png,.json,image/png,application/json"
        multiple
        disabled={busy}
        onChange={(event) => { void onFiles(event.currentTarget.files ?? []) }}
      />
    </label>
  )
}

export function CharacterCard({ card, onPlay, onEdit, playBusy, playDisabled }) {
  const tags = cardTags(card).slice(0, 3)
  return (
    <li className="mayori-card">
      <article>
        <div className="mayori-card-media"><CardPortrait card={card} /></div>
        <div className="mayori-card-body">
          <div className="mayori-card-heading">
            <h3>{card.name}</h3>
            <p>{text(card.data.creator) ?? 'Автор не указан'}</p>
          </div>
          {tags.length > 0 && (
            <ul className="mayori-tags" aria-label="Теги">
              {tags.map((tag, index) => <li key={`${tag}-${index}`}>{tag}</li>)}
            </ul>
          )}
          <div className="mayori-card-actions">
            <button type="button" className="mayori-card-play" disabled={playDisabled} aria-busy={playBusy || undefined} onClick={() => { void onPlay(card, 0) }}>
              {icon('play')}<span>{playBusy ? 'Открываем…' : 'Играть'}</span>
            </button>
            <button type="button" className="mayori-card-edit" onClick={(event) => { onEdit(card, event.currentTarget) }}>
              {icon('edit')}<span>Изменить</span>
            </button>
          </div>
        </div>
      </article>
    </li>
  )
}

export function CharacterInfoDialog({ card, onClose, onRemove, triggerRef, onPlay, playDisabled, persona = DEFAULT_PERSONA }) {
  const dialogRef = useRef(null)
  const [greetingIndex, setGreetingIndex] = useState(0)
  useEffect(() => { setGreetingIndex(0) }, [card?.id])
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return
    if (card !== null && !dialog.open) dialog.showModal()
    if (card === null && dialog.open) dialog.close()
  }, [card])

  const finishClose = () => {
    onClose()
    requestAnimationFrame(() => { triggerRef.current?.focus() })
  }
  if (card === null) return <dialog ref={dialogRef} className="mayori-character-dialog" onClose={finishClose} />

  const sections = [
    ['Описание', text(card.data.description)],
    ['Характер', text(card.data.personality)],
    ['Сценарий', text(card.data.scenario)],
    ['Первое сообщение', text(card.data.first_mes)],
    ['Пример диалога', text(card.data.mes_example)],
    ['Заметки автора', text(card.data.creator_notes)],
  ].filter(([, value]) => value !== null)
  const tags = cardTags(card)
  const greetings = [card.data.first_mes ?? '', ...(card.data.alternate_greetings ?? [])]
  return (
    <dialog
      ref={dialogRef}
      className="mayori-character-dialog"
      aria-labelledby="mayori-character-title"
      onClose={finishClose}
      onCancel={(event) => { event.preventDefault(); dialogRef.current?.close() }}
    >
      <div className="mayori-character-shell">
        <header className="mayori-character-header">
          <div>
            <h2 id="mayori-character-title">{card.name}</h2>
            <p>{text(card.data.creator) ?? 'Автор не указан'}</p>
          </div>
          <button type="button" className="mayori-icon-action" aria-label="Закрыть информацию" onClick={() => { dialogRef.current?.close() }}>
            {icon('close')}
          </button>
        </header>
        <div className="mayori-character-content">
          <div className="mayori-character-portrait"><CardPortrait card={card} /></div>
          <div className="mayori-character-details">
            {tags.length > 0 && <ul className="mayori-tags" aria-label="Теги">{tags.map((tag, index) => <li key={`${tag}-${index}`}>{tag}</li>)}</ul>}
            {card.warnings.length > 0 && <p className="mayori-card-warning">{card.warnings.join(' ')}</p>}
            {onPlay && greetings.length > 1 && <div className="mayori-character-opening">
              <div className="mayori-filter-control"><span>Начало истории</span><Select aria-label="Начало истории" value={greetingIndex} disabled={playDisabled} portal={false} onChange={value => setGreetingIndex(Number(value))}
                options={greetings.map((greeting, index) => ({ value: index, label: index === 0 ? (greeting.trim() ? 'Основное приветствие' : 'Без приветствия') : `Альтернатива ${index}` }))} /></div>
              <details className="mayori-greeting-preview"><summary>Приветствие</summary><p>{renderTemplate(greetings[greetingIndex] ?? '', card, persona, Date.now()) || 'История начнётся с вашего сообщения.'}</p></details>
            </div>}
            {sections.length > 0 ? (
              <dl>
                {sections.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            ) : <p className="mayori-character-empty">У этой карточки нет дополнительного описания.</p>}
            <dl className="mayori-character-meta">
              <div><dt>Файл</dt><dd>{card.sourceName}</dd></div>
              <div><dt>Добавлен</dt><dd>{new Intl.DateTimeFormat('ru', { dateStyle: 'medium', timeStyle: 'short' }).format(card.importedAt)}</dd></div>
            </dl>
          </div>
        </div>
        <footer className="mayori-character-footer">
          <button type="button" className="mayori-danger-button" onClick={() => { void onRemove(card, dialogRef.current) }}>
            {icon('trash')}<span>Удалить персонажа</span>
          </button>
          <div className="mayori-character-footer-actions">
            <button type="button" className="mayori-secondary-button" onClick={() => { dialogRef.current?.close() }}>Закрыть</button>
            {onPlay && <button type="button" className="mayori-secondary-button mayori-card-play" disabled={playDisabled} onClick={() => { dialogRef.current?.close(); void onPlay(card, greetingIndex) }}>Играть</button>}
          </div>
        </footer>
      </div>
    </dialog>
  )
}

function Filters({ cards, query, setQuery, sort, setSort, creator, setCreator, portrait, setPortrait, selectedTags, setSelectedTags, onReset }) {
  const creators = useMemo(() => [...new Set(cards.map(card => text(card.data.creator)).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, 'ru')), [cards])
  const tags = useMemo(() => {
    const counts = new Map()
    for (const card of cards) for (const tag of cardTags(card)) counts.set(tag, (counts.get(tag) ?? 0) + 1)
    return [...counts].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], 'ru'))
  }, [cards])
  const toggleTag = (tag) => {
    setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter(value => value !== tag) : [...selectedTags, tag])
  }
  return (
    <div className="mayori-filter-fields">
      <label className="mayori-search">
        <span>Поиск</span>
        <span className="mayori-search-control">{icon('search')}<input type="search" value={query} placeholder="Имя, автор, описание" onChange={event => { setQuery(event.currentTarget.value) }} /></span>
      </label>
      <div className="mayori-filter-control"><span>Сортировка</span><Select aria-label="Сортировка" value={sort} onChange={setSort} options={[{ value: 'newest', label: 'Сначала новые' }, { value: 'name', label: 'По имени' }, { value: 'creator', label: 'По автору' }]} /></div>
      <div className="mayori-filter-control"><span>Автор</span><Select aria-label="Автор" value={creator} onChange={setCreator} options={[{ value: 'all', label: 'Все авторы' }, ...creators.map(value => ({ value, label: value }))]} /></div>
      <fieldset className="mayori-filter-group">
        <legend>Портрет</legend>
        {[['all', 'Все'], ['with', 'С портретом'], ['without', 'Без портрета']].map(([value, label]) => <label key={value}><input type="radio" name="mayori-portrait" value={value} checked={portrait === value} onChange={() => { setPortrait(value) }} /><span>{label}</span></label>)}
      </fieldset>
      {tags.length > 0 && (
        <fieldset className="mayori-filter-group mayori-tag-filter">
          <legend>Теги</legend>
          <div>{tags.map(([tag, count]) => <label key={tag}><input type="checkbox" checked={selectedTags.includes(tag)} onChange={() => { toggleTag(tag) }} /><span>{tag}</span><small>{count}</small></label>)}</div>
        </fieldset>
      )}
      <button type="button" className="mayori-reset-button" onClick={onReset}>Сбросить фильтры</button>
    </div>
  )
}

export function CharacterGalleryPanel({ library, personas, startCharacter }) {
  const personaSnapshot = useSyncExternalStore(personas.subscribe, personas.getSnapshot, personas.getSnapshot)
  const persona = personaSnapshot.personas.find(item => item.id === personaSnapshot.defaultId) ?? DEFAULT_PERSONA
  const inputRef = useRef(null)
  const detailTriggerRef = useRef(null)
  const snapshot = useSyncExternalStore(library.subscribe, library.getSnapshot, library.getSnapshot)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [creator, setCreator] = useState('all')
  const [portrait, setPortrait] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [busy, setBusy] = useState(false)
  const [playingId, setPlayingId] = useState(null)
  const [notice, setNotice] = useState(null)
  const [preferences, setPreferences] = useState(readCatalogPreferences)
  const [page, setPage] = useState(1)
  const mainRef = useRef(null)
  useEffect(() => { saveCatalogPreferences(preferences) }, [preferences])
  useEffect(() => { setPage(1) }, [query, sort, creator, portrait, selectedTags, preferences.pageSize])

  const normalizedQuery = query.trim().toLocaleLowerCase('ru')
  const cards = useMemo(() => {
    const filtered = snapshot.cards.filter((card) => {
      if (creator !== 'all' && text(card.data.creator) !== creator) return false
      const source = safeAssetUri(card)
      if (portrait === 'with' && source === null) return false
      if (portrait === 'without' && source !== null) return false
      const tags = cardTags(card)
      if (!selectedTags.every(tag => tags.includes(tag))) return false
      if (normalizedQuery === '') return true
      const haystack = [card.name, card.data.creator, card.data.description, card.data.personality, ...tags]
        .filter(value => typeof value === 'string').join('\n').toLocaleLowerCase('ru')
      return haystack.includes(normalizedQuery)
    })
    return [...filtered].sort((left, right) => {
      if (sort === 'name') return left.name.localeCompare(right.name, 'ru')
      if (sort === 'creator') return (text(left.data.creator) ?? '').localeCompare(text(right.data.creator) ?? '', 'ru') || left.name.localeCompare(right.name, 'ru')
      return right.importedAt - left.importedAt || left.name.localeCompare(right.name, 'ru')
    })
  }, [creator, normalizedQuery, portrait, selectedTags, snapshot.cards, sort])
  const pagination = paginate(cards, page, preferences.pageSize)
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }) }, [pagination.page])

  const importFiles = async (fileList) => {
    if (fileList.length === 0) return
    setBusy(true)
    setNotice(null)
    try {
      const result = await library.importFiles(fileList)
      const rejected = result.rejected.map(item => `${item.name}: ${item.error}`)
      setNotice({ kind: rejected.length > 0 ? 'error' : 'success', text: [result.imported > 0 ? `Импортировано: ${result.imported}.` : '', ...rejected].filter(Boolean).join(' ') })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) })
    } finally {
      setBusy(false)
      if (inputRef.current !== null) inputRef.current.value = ''
    }
  }
  const remove = async (card, infoDialog) => {
    if (!window.confirm(`Удалить персонажа «${card.name}» из галереи?`)) return
    try {
      await library.remove(card.id)
      infoDialog?.close()
      setNotice({ kind: 'success', text: `Персонаж «${card.name}» удалён.` })
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) })
    }
  }
  const play = async (card, greetingIndex) => {
    setPlayingId(card.id)
    setNotice(null)
    try {
      await startCharacter(card, greetingIndex)
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) })
    } finally {
      setPlayingId(null)
    }
  }
  const resetFilters = () => {
    setQuery(''); setSort('newest'); setCreator('all'); setPortrait('all'); setSelectedTags([])
  }
  return (
    <>
      <section
        className="mayori-gallery-panel"
        aria-labelledby="mayori-gallery-title"
      >
        <div className="mayori-gallery-shell">
          <header className="mayori-gallery-header">
            <div className="mayori-gallery-title">
              <h2 id="mayori-gallery-title">Персонажи</h2>
              <p>{snapshot.status === 'ready' ? `${snapshot.cards.length} в галерее` : 'Загрузка…'}</p>
            </div>
            <div className="mayori-gallery-header-actions">
              <button type="button" className="mayori-filter-toggle" aria-controls="mayori-filter-panel" aria-expanded={filtersOpen} onClick={() => { setFiltersOpen(value => !value) }}>{icon('filter')}<span>Фильтры</span></button>
              <ImportControl busy={busy} inputRef={inputRef} onFiles={importFiles} compact />
            </div>
          </header>
          <div className="mayori-gallery-workspace">
            {filtersOpen && <button type="button" className="mayori-filter-scrim" aria-label="Закрыть фильтры" onClick={() => { setFiltersOpen(false) }} />}
            <aside id="mayori-filter-panel" className={`mayori-filter-panel${filtersOpen ? ' is-open' : ''}`} aria-label="Фильтры персонажей">
              <div className="mayori-filter-panel-header"><h3>Фильтры</h3><button type="button" className="mayori-icon-action" aria-label="Закрыть фильтры" onClick={() => { setFiltersOpen(false) }}>{icon('close')}</button></div>
              <ImportControl busy={busy} inputRef={inputRef} onFiles={importFiles} />
              <Filters cards={snapshot.cards} query={query} setQuery={setQuery} sort={sort} setSort={setSort} creator={creator} setCreator={setCreator} portrait={portrait} setPortrait={setPortrait} selectedTags={selectedTags} setSelectedTags={setSelectedTags} onReset={resetFilters} />
            </aside>
            <main ref={mainRef} className="mayori-gallery-main" id="mayori-gallery-content">
              <div className="mayori-gallery-results">
                <p role="status" aria-live="polite">{snapshot.status === 'ready' ? `Найдено ${cards.length} из ${snapshot.cards.length}` : ''}</p>
                <div className="mayori-column-control mayori-filter-control"><span>Карточек в ряд</span><Select aria-label="Карточек в ряд" value={preferences.columns} onChange={columns => setPreferences(previous => ({ ...previous, columns: Number(columns) }))} options={COLUMN_OPTIONS.map(columns => ({ value: columns, label: columns }))} /></div>
              </div>
              <div className="mayori-gallery-notice" role="status" aria-live="polite">
                {notice !== null && <p className={notice.kind === 'error' ? 'mayori-error' : 'mayori-success'}>{notice.text}</p>}
                {snapshot.status === 'error' && <p className="mayori-error">{snapshot.error}</p>}
              </div>
              {snapshot.status === 'loading' && <p className="mayori-empty">Загружаем галерею…</p>}
              {snapshot.status === 'ready' && cards.length === 0 && (
                <div className="mayori-empty">
                  <span className="mayori-empty-icon">{icon('gallery')}</span>
                  <h3>{snapshot.cards.length === 0 ? 'Персонажей пока нет' : 'Ничего не найдено'}</h3>
                  <p>{snapshot.cards.length === 0 ? 'Импортируйте PNG или JSON, чтобы добавить первого персонажа.' : 'Измените запрос или сбросьте фильтры.'}</p>
                </div>
              )}
              {cards.length > 0 && <>
                <ul className="mayori-card-grid" style={{ '--mayori-columns': preferences.columns }}>{pagination.items.map(card => <CharacterCard key={card.id} card={card} onPlay={play} playBusy={playingId === card.id} playDisabled={playingId !== null} onEdit={(item, trigger) => { detailTriggerRef.current = trigger; setSelectedCard(item) }} />)}</ul>
                <Pagination pagination={pagination} total={cards.length} pageSize={preferences.pageSize} onPage={setPage} onPageSize={pageSize => { setPreferences(value => ({ ...value, pageSize })) }} />
              </>}
            </main>
          </div>
        </div>
      </section>
      <CharacterInfoDialog card={selectedCard} onClose={() => { setSelectedCard(null) }} onRemove={remove} triggerRef={detailTriggerRef} persona={persona} onPlay={play} playDisabled={playingId !== null} />
    </>
  )
}

/** The sidebar shell owns the actual button, label, tooltip and selected state. */
export function CharacterGalleryIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m5 17 4.5-4.5 3 3 2-2L19 18"/></svg>
}
