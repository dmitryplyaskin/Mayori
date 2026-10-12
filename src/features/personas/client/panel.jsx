import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Select } from '../../../client/components/select.jsx'
import { PersonaBlocks, newPersonaGroup } from './blocks.jsx'
import { composePersona, filterPersonas, DEFAULT_PROMPT } from '../shared/persona.js'

const blank = () => ({ name: '', title: '', description: '', avatar: '', blocks: [], prompt: { ...DEFAULT_PROMPT }, characterIds: [], descriptionOverride: null })

export function PersonaIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>
}

export function PersonaPanel({ personas, sessions, chatFor }) {
  const snapshot = useSyncExternalStore(personas.subscribe, personas.getSnapshot, personas.getSnapshot)
  const catalog = useSyncExternalStore(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot)
  const currentId = catalog.ids.find(id => catalog.byId[id]?.retainedBy?.mainView > 0)
  const [draft, setDraft] = useState(() => personas.draft ?? blank())
  useEffect(() => { personas.draft = draft }, [draft, personas])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const nameRef = useRef(null)
  const pending = useRef(false)
  const [currentPersona, setCurrentPersona] = useState(null)
  const [context, setContext] = useState({})
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')
  useEffect(() => {
    let active = true
    setCurrentPersona(null)
    setContext({})
    if (!currentId) return
    const chat = chatFor(currentId)
    const update = () => { if (active) {
      const state = chat.getSnapshot().value
      setCurrentPersona(state?.persona ?? null)
      setContext(state?.personaContext ?? {})
    } }
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
  const choose = persona => { setDraft({ ...blank(), ...structuredClone(persona) }); setError(''); setNotice(''); nameRef.current?.focus() }
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
  const preview = composePersona(draft, context)
  const rows = filterPersonas(snapshot.personas, query, sort)
  const promptField = (key, value) => field('prompt', { ...draft.prompt, [key]: value })
  return <section className="mayori-personas-panel" aria-labelledby="mayori-personas-title">
    <header className="mayori-history-header"><div><h2 id="mayori-personas-title">Персоны</h2>
      <p>Создайте персонажа, за которого будете играть.</p></div>
      <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => choose(blank())}>Создать персону</button>
    </header>
    <p role="status">{snapshot.status === 'loading' ? 'Загружаем персоны…' : notice}</p>
    {snapshot.error && <p role="alert" className="mayori-error">{snapshot.error} <button type="button" onClick={() => { void run(() => personas.refresh(), 'Список обновлён.') }}>Обновить список</button></p>}
    {error && <p role="alert" className="mayori-error">{error}</p>}
    {currentPersona && <p>В текущем чате: <strong>{currentPersona.name}</strong></p>}
    <div className="mayori-personas-layout">
      <div className="mayori-persona-catalog">
        <label>Поиск персон<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
        <Select aria-label="Сортировка персон" value={sort} onChange={setSort} options={[
          { value: 'name', label: 'По имени' }, { value: 'description', label: 'По длине описания' }, { value: 'connections', label: 'По привязкам' },
        ]} />
        <ul className="mayori-persona-list">{rows.map(persona => <li key={persona.id}>
        <button type="button" className="mayori-persona-row" aria-pressed={draft.id === persona.id} disabled={busy} onClick={() => choose(persona)}>
          {persona.avatar ? <img src={persona.avatar} alt="" /> : <span className="mayori-persona-avatar" aria-hidden="true">{persona.name.slice(0, 1)}</span>}
          <span><strong>{persona.name}</strong>{persona.title && <small>{persona.title}</small>}
            {snapshot.defaultId === persona.id && <small>По умолчанию</small>}
            {persona.description && <small className="mayori-persona-excerpt">{persona.description.slice(0, 160)}</small>}
            {!!persona.characterIds?.length && <small>Привязок: {persona.characterIds.length}</small>}</span>
        </button></li>)}</ul>
        {snapshot.status === 'ready' && snapshot.personas.length === 0 && <p>Персон пока нет. Укажите имя в форме и сохраните первую.</p>}
        {snapshot.personas.length > 0 && rows.length === 0 && <p>Персоны не найдены.</p>}
      </div>
      <form className="mayori-persona-form" onSubmit={event => {
        event.preventDefault()
        void run(async () => { setDraft(await personas.save(draft)) }, 'Персона сохранена.')
      }}>
        <h3>{draft.id ? 'Изменить персону' : 'Новая персона'}</h3>
        <label>Имя в чате<input ref={nameRef} name="personaName" autoComplete="off" required maxLength={120} value={draft.name} disabled={busy} onChange={event => field('name', event.target.value)} /></label>
        <label>Подпись<input name="personaTitle" maxLength={200} value={draft.title} disabled={busy} onChange={event => field('title', event.target.value)} /></label>
        <label>Описание<textarea name="personaDescription" rows={8} maxLength={32000} value={draft.description} disabled={busy} onChange={event => field('description', event.target.value)} /></label>
        <label className="mayori-persona-check"><input type="checkbox" disabled={busy} checked={draft.descriptionOverride !== null} onChange={event => field('descriptionOverride', event.target.checked ? draft.description : null)} />Другой вариант описания</label>
        {draft.descriptionOverride !== null && <>
          <label>Вариант для модели<textarea rows={6} maxLength={32000} disabled={busy} value={draft.descriptionOverride} onChange={event => field('descriptionOverride', event.target.value)} /></label>
          <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => setDraft(previous => ({ ...previous, description: previous.descriptionOverride, descriptionOverride: null }))}>Сделать базовым описанием</button>
        </>}
        {draft.avatar && <img className="mayori-persona-image" src={draft.avatar} alt={`Аватар персоны ${draft.name || ''}`} />}
        <label>Аватар<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => { void image(event) }} /></label>
        {draft.avatar && <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => field('avatar', '')}>Убрать аватар</button>}
        <details className="mayori-persona-section" open><summary>Дополнительные описания</summary>
          <PersonaBlocks blocks={draft.blocks} onChange={value => field('blocks', value)} disabled={busy} context={context} />
          <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => field('blocks', [...draft.blocks, newPersonaGroup()])}>Добавить группу</button>
        </details>
        <details className="mayori-persona-section"><summary>Сборка описания</summary>
          <label>Разделитель блоков<input maxLength={200} value={draft.prompt.joiner} disabled={busy} onChange={event => promptField('joiner', event.target.value)} /></label>
          <label className="mayori-persona-check"><input type="checkbox" checked={draft.prompt.wrapperEnabled} disabled={busy} onChange={event => promptField('wrapperEnabled', event.target.checked)} />Использовать шаблон</label>
          {draft.prompt.wrapperEnabled && <label>Шаблон с {'{{PROMPT}}'}<textarea rows={4} maxLength={8000} value={draft.prompt.wrapperTemplate} disabled={busy} onChange={event => promptField('wrapperTemplate', event.target.value)} /></label>}
        </details>
        <details className="mayori-persona-section"><summary>Привязки к персонажам</summary>
          <button type="button" className="mayori-secondary-button" disabled={busy || !context.characterId} onClick={() => field('characterIds', [...new Set([...draft.characterIds, context.characterId])])}>Добавить текущего персонажа</button>
          {draft.characterIds.map(id => <div className="mayori-persona-binding" key={id}><span>{id === context.characterId ? 'Текущий персонаж' : id}</span><button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => field('characterIds', draft.characterIds.filter(value => value !== id))}>Убрать</button></div>)}
        </details>
        <details className="mayori-persona-section"><summary>Итоговое описание</summary>
          <p className="mayori-persona-hint">{currentId ? 'Условия текущего чата.' : 'Без условий чата.'} Подстановки раскрываются при выборе персоны.</p>
          <pre className="mayori-persona-preview">{preview.description || 'Описание пустое.'}</pre>
        </details>
        <div className="mayori-persona-actions"><button className="mayori-card-play" type="submit" disabled={busy} aria-busy={busy}>Сохранить персону</button>
          <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => choose(snapshot.personas.find(persona => persona.id === draft.id) ?? blank())}>Отменить изменения</button>
          {draft.id && <>
            <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => { void run(async () => {
              const { id: _id, characterIds: _connections, ...copy } = draft
              choose(await personas.save({ ...copy, name: `${draft.name.slice(0, 112)} (копия)`, characterIds: [] }))
            }, 'Копия создана.') }}>Создать копию</button>
            <button type="button" className="mayori-secondary-button" disabled={busy} onClick={() => { void run(() => personas.setDefault(snapshot.defaultId === draft.id ? null : draft.id), 'Выбор для новых чатов сохранён.') }}>{snapshot.defaultId === draft.id ? 'Снять выбор по умолчанию' : 'Использовать по умолчанию'}</button>
            <button type="button" className="mayori-secondary-button" disabled={busy || !currentId} onClick={() => { void run(async () => {
              const saved = await personas.save(draft)
              setDraft(saved)
              await chatFor(currentId).setPersona(saved.id)
            }, 'Персона закреплена за текущим чатом.') }}>Играть в этом чате</button>
            <button type="button" className="mayori-danger-button" disabled={busy} onClick={() => {
              if (window.confirm(`Удалить персону «${draft.name}»?`)) {
                void run(async () => { await personas.remove(draft.id); setDraft(blank()) }, 'Персона удалена из списка.')
              }
            }}>Удалить персону</button>
          </>}
        </div>
      </form>
    </div>
  </section>
}
