import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { historyRows } from './chat-history.js'
import { recentCharacters } from './catalog-view.js'
import { HistoryRow, useHistoryDetails } from './history.jsx'
import { CharacterCard, CharacterInfoDialog } from './gallery.jsx'
import { MayoriMark } from './sidebar.jsx'
import { DEFAULT_PERSONA } from './templates.js'

export function HomeIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></svg>
}

/** Also occupies the empty Conversation through its public session-maybe seat. */
export function HomeConversation(props) {
  const { sessionId, useSessions, stock: Stock, stockChildren, childPrefix, renderSlot, selectPanel } = props
  const blank = useSessions(snapshot => {
    const row = sessionId === undefined ? undefined : snapshot.byId[sessionId]
    return sessionId === undefined || (row?.blank === true && !row.title?.trim())
  })
  useEffect(() => { if (blank) selectPanel('mayori-home') }, [blank, selectPanel])
  if (blank) return <HomePanel {...props} />
  const delegate = (name, ...args) => renderSlot(Object.hasOwn(stockChildren ?? {}, name) ? `${childPrefix}.${name}` : name, ...args)
  return <Stock {...props} renderSlot={delegate} />
}

export function HomePanel({ history, library, personas, startCharacter, selectPanel }) {
  const personaSnapshot = useSyncExternalStore(personas.subscribe, personas.getSnapshot, personas.getSnapshot)
  const persona = personaSnapshot.personas.find(item => item.id === personaSnapshot.defaultId) ?? DEFAULT_PERSONA
  const snapshot = useSyncExternalStore(history.subscribe, history.getSnapshot, history.getSnapshot)
  const archive = useSyncExternalStore(history.subscribeArchive, history.getArchiveSnapshot, history.getArchiveSnapshot)
  const catalog = useSyncExternalStore(library.subscribe, library.getSnapshot, library.getSnapshot)
  const rows = archive.phase === 'ready' && archive.state !== 'error' ? historyRows(snapshot, '', archive.archivedSessionIds).slice(0, 5) : []
  const cards = recentCharacters(catalog.cards)
  const details = useHistoryDetails(history, rows)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [playingId, setPlayingId] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const triggerRef = useRef(null)
  const playingRef = useRef(false)
  useEffect(() => {
    let active = true
    setRefreshing(true)
    Promise.resolve().then(() => history.refresh()).catch(() => {
      if (active) setError('Не удалось загрузить последние чаты. Попробуйте открыть историю и обновить список.')
    }).finally(() => { if (active) setRefreshing(false) })
    return () => { active = false }
  }, [history])
  const open = async id => {
    setError('')
    try { await history.open(id) } catch { setError('Не удалось открыть чат. Попробуйте ещё раз.') }
  }
  const play = async (card, greetingIndex) => {
    if (playingRef.current) return
    playingRef.current = true
    setPlayingId(card.id); setError('')
    try { await startCharacter(card, greetingIndex) }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)) }
    finally { playingRef.current = false; setPlayingId(null) }
  }
  const remove = async (card, dialog) => {
    if (!window.confirm(`Удалить персонажа «${card.name}» из галереи?`)) return
    try { await library.remove(card.id); dialog?.close() }
    catch (failure) { setError(failure instanceof Error ? failure.message : String(failure)) }
  }
  return <section className="mayori-home-panel" aria-labelledby="mayori-home-title">
    <div className="mayori-home-content">
      <header className="mayori-home-welcome"><span className="mayori-home-mark"><MayoriMark /></span>
        <h1 id="mayori-home-title">Добро пожаловать в Mayori</h1>
        <p>Продолжите свою историю или выберите персонажа для нового приключения.</p>
      </header>
      {error && <p role="alert" className="mayori-error">{error}</p>}
      <section className="mayori-home-section" aria-labelledby="mayori-home-chats">
        <h2 id="mayori-home-chats">Последние чаты</h2>
        {(refreshing || snapshot.phase === 'pending' || archive.phase === 'pending') && <p role="status">Загружаем чаты…</p>}
        {archive.state === 'error' && <p role="alert" className="mayori-error">Не удалось загрузить состояние архива.</p>}
        {!refreshing && snapshot.phase === 'ready' && archive.phase === 'ready' && archive.state !== 'error' && rows.length === 0 && <p className="mayori-home-empty">Чатов пока нет. Выберите персонажа ниже, чтобы начать историю.</p>}
        <ul className="mayori-history-list">{rows.map(row => <li key={row.id}><HistoryRow row={row} detail={details.value[row.id]} loading={details.loading} onOpen={open} /></li>)}</ul>
        <button type="button" className="mayori-secondary-button" onClick={() => { selectPanel('mayori-history') }}>Перейти в историю чатов <span aria-hidden="true">→</span></button>
      </section>
      <section className="mayori-home-section" aria-labelledby="mayori-home-characters">
        <h2 id="mayori-home-characters">Недавно загруженные персонажи</h2>
        {catalog.status === 'loading' && <p role="status">Загружаем персонажей…</p>}
        {catalog.status === 'error' && <p role="alert" className="mayori-error">{catalog.error}</p>}
        {catalog.status === 'ready' && cards.length === 0 && <p className="mayori-home-empty">В галерее пока нет персонажей. Перейдите в персонажи и импортируйте карточку PNG или JSON.</p>}
        <ul className="mayori-card-grid">{cards.map(card => <CharacterCard key={card.id} card={card} onPlay={play} playBusy={playingId === card.id} playDisabled={playingId !== null} onEdit={(item, trigger) => { triggerRef.current = trigger; setSelectedCard(item) }} />)}</ul>
        <button type="button" className="mayori-secondary-button" onClick={() => { selectPanel('mayori-characters') }}>Перейти к персонажам <span aria-hidden="true">→</span></button>
      </section>
    </div>
    <CharacterInfoDialog card={selectedCard} onClose={() => { setSelectedCard(null) }} onRemove={remove} triggerRef={triggerRef} persona={persona} onPlay={play} playDisabled={playingId !== null} />
  </section>
}
