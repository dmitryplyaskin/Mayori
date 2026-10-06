import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const blank = () => ({ name: '', title: '', description: '', avatar: '' })

export function PersonaIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>
}

export function PersonaPanel({ personas, sessions, chatFor }) {
  const snapshot = useSyncExternalStore(personas.subscribe, personas.getSnapshot, personas.getSnapshot)
  const catalog = useSyncExternalStore(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot)
  const currentId = catalog.ids.find(id => catalog.byId[id]?.retainedBy?.mainView > 0)
  const [draft, setDraft] = useState(blank)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const nameRef = useRef(null)
  const pending = useRef(false)
  const [currentPersona, setCurrentPersona] = useState(null)
  useEffect(() => {
    let active = true
    setCurrentPersona(null)
    if (!currentId) return
    const chat = chatFor(currentId)
    const update = () => { if (active) setCurrentPersona(chat.getSnapshot().value?.persona ?? null) }
    const unsubscribe = chat.subscribe(update)
    void chat.refresh()
    update()
    return () => { active = false; unsubscribe() }
  }, [currentId, chatFor])
  const run = async (operation, success) => {
    if (pending.current) return
    pending.current = true
    setBusy(true); setError(''); setNotice('')
    try { await operation(); setNotice(success) }
    catch (failure) { setError(failure.message || 'Не удалось сохранить. Попробуйте ещё раз.') }
    finally { pending.current = false; setBusy(false) }
  }
  const choose = persona => { setDraft({ ...persona }); setError(''); setNotice(''); nameRef.current?.focus() }
  const field = (key, value) => { setDraft(previous => ({ ...previous, [key]: value })) }
  const image = async event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Выберите PNG, JPEG или WebP размером до 2 МБ.'); return
    }
    await run(async () => {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Не удалось прочитать изображение.'))
        reader.readAsDataURL(file)
      })
      field('avatar', data)
    }, 'Аватар добавлен. Сохраните персону.')
  }
  return <section className="mayori-personas-panel" aria-labelledby="mayori-personas-title">
    <header className="mayori-history-header"><div><h2 id="mayori-personas-title">Персоны</h2>
      <p>Создайте персонажа, за которого будете играть.</p></div>
      <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => choose(blank())}>Создать персону</button>
    </header>
    <p className="mayori-persona-hint">Персона по умолчанию используется в новых чатах. Для уже открытого чата выберите «Играть в этом чате».</p>
    <p role="status">{snapshot.status === 'loading' ? 'Загружаем персоны…' : notice}</p>
    {snapshot.error && <p role="alert" className="mayori-error">{snapshot.error} <button type="button" onClick={() => { void run(() => personas.refresh(), 'Список обновлён.') }}>Обновить список</button></p>}
    {error && <p role="alert" className="mayori-error">{error}</p>}
    {currentPersona && <p>В текущем чате: <strong>{currentPersona.name}</strong></p>}
    <div className="mayori-personas-layout">
      <div><ul className="mayori-persona-list">{snapshot.personas.map(persona => <li key={persona.id}>
        <button type="button" className="mayori-persona-row" aria-pressed={draft.id === persona.id} disabled={busy} onClick={() => choose(persona)}>
          {persona.avatar ? <img src={persona.avatar} alt="" /> : <span className="mayori-persona-avatar" aria-hidden="true">{persona.name.slice(0, 1)}</span>}
          <span><strong>{persona.name}</strong>{persona.title && <small>{persona.title}</small>}
            {snapshot.defaultId === persona.id && <small>По умолчанию</small>}</span>
        </button></li>)}</ul>
        {snapshot.status === 'ready' && snapshot.personas.length === 0 && <p>Персон пока нет. Укажите имя в форме и сохраните первую.</p>}
      </div>
      <form className="mayori-persona-form" onSubmit={event => {
        event.preventDefault()
        void run(async () => { setDraft(await personas.save(draft)) }, 'Персона сохранена.')
      }}>
        <h3>{draft.id ? 'Изменить персону' : 'Новая персона'}</h3>
        <label>Имя в чате<input ref={nameRef} name="personaName" autoComplete="off" required maxLength={120} value={draft.name} disabled={busy} onChange={event => field('name', event.target.value)} /></label>
        <label>Подпись<input name="personaTitle" maxLength={200} value={draft.title} disabled={busy} onChange={event => field('title', event.target.value)} /></label>
        <p className="mayori-persona-hint">Подпись помогает различать персоны и не передаётся модели.</p>
        <label>Описание<textarea name="personaDescription" rows={8} maxLength={32000} value={draft.description} disabled={busy} onChange={event => field('description', event.target.value)} /></label>
        <p className="mayori-persona-hint">Внешность, характер, биография. Имя подставляется вместо {'{{user}}'}, описание — вместо {'{{persona}}'}.</p>
        {draft.avatar && <img className="mayori-persona-image" src={draft.avatar} alt={`Аватар персоны ${draft.name || ''}`} />}
        <label>Аватар<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => { void image(event) }} /></label>
        {draft.avatar && <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => field('avatar', '')}>Убрать аватар</button>}
        <div className="mayori-persona-actions"><button className="mayori-card-play" type="submit" disabled={busy} aria-busy={busy}>Сохранить персону</button>
          {draft.id && <>
            <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => { void run(() => personas.setDefault(snapshot.defaultId === draft.id ? null : draft.id), 'Выбор для новых чатов сохранён.') }}>{snapshot.defaultId === draft.id ? 'Снять выбор по умолчанию' : 'Использовать по умолчанию'}</button>
            <button type="button" className="mayori-secondary-button" disabled={busy || !currentId} onClick={() => { void run(async () => {
              const saved = await personas.save(draft)
              setDraft(saved)
              await chatFor(currentId).setPersona(saved.id)
            }, 'Персона закреплена за текущим чатом.') }}>Играть в этом чате</button>
            <button type="button" className="mayori-danger-button" disabled={busy} onClick={() => {
              if (window.confirm(`Удалить персону «${draft.name}» из списка? В созданных чатах её копия сохранится.`)) {
                void run(async () => { await personas.remove(draft.id); setDraft(blank()) }, 'Персона удалена из списка.')
              }
            }}>Удалить персону</button>
          </>}
        </div>
      </form>
    </div>
  </section>
}
