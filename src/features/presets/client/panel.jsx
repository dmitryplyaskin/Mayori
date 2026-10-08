import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { filterPresets, presetChanged } from './presentation.js'
import { Select } from '../../../client/components/select.jsx'

const blank = () => ({ name: '', instructions: '' })

export function PresetIcon({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M8 7h8M8 12h8M8 17h5" /></svg>
}

function Glyph({ kind }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'plus' ? <path d="M12 5v14M5 12h14" /> : kind === 'search' ? <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></> : <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>}
  </svg>
}

export function PresetPanel({ presets, sessions, presetFor }) {
  const id = useId()
  const snapshot = useSyncExternalStore(presets.subscribe, presets.getSnapshot, presets.getSnapshot)
  const catalog = useSyncExternalStore(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot)
  const currentId = catalog.ids.find(id => catalog.byId[id]?.retainedBy?.mainView > 0)
  const [draft, setDraft] = useState(blank)
  const [saved, setSaved] = useState(blank)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [current, setCurrent] = useState(null)
  const initialized = useRef(false)
  const nameRef = useRef(null)
  const formRef = useRef(null)
  const menuRef = useRef(null)
  const pending = useRef(false)
  const dirty = presetChanged(draft, saved)
  const disabled = busy || snapshot.status === 'loading'
  const currentReady = currentId && current?.status === 'ready'
  const currentLibrary = snapshot.presets.find(preset => preset.id === current?.preset?.id)
  const currentOutdated = currentLibrary && presetChanged(currentLibrary, current.preset)
  const matches = filterPresets(snapshot.presets, query)

  useEffect(() => {
    if (initialized.current || snapshot.status !== 'ready') return
    initialized.current = true
    const first = snapshot.presets.find(preset => preset.id === snapshot.defaultId) ?? snapshot.presets[0] ?? blank()
    setDraft({ ...first }); setSaved({ ...first })
  }, [snapshot])
  useEffect(() => {
    let active = true
    setCurrent(null)
    if (!currentId) return
    const provider = presetFor(currentId)
    const update = () => { if (active) setCurrent(provider.getSnapshot()) }
    const unsubscribe = provider.subscribe(update)
    void provider.refresh()
    update()
    return () => { active = false; unsubscribe() }
  }, [currentId, presetFor])
  useEffect(() => {
    if (!dirty) return
    const warn = event => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => { window.removeEventListener('beforeunload', warn) }
  }, [dirty])
  useEffect(() => {
    const close = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) menuRef.current.open = false
    }
    window.addEventListener('pointerdown', close)
    return () => { window.removeEventListener('pointerdown', close) }
  }, [])

  const run = async (operation, success) => {
    if (pending.current) return
    pending.current = true
    setBusy(true); setError(''); setNotice('')
    try { await operation(); setNotice(success) }
    catch (failure) { setError(failure.message || 'Не удалось выполнить действие. Попробуйте ещё раз.') }
    finally { pending.current = false; setBusy(false) }
  }
  const choose = preset => {
    if (dirty && !window.confirm('Перейти к другому пресету? Несохранённые изменения будут потеряны.')) return
    initialized.current = true
    setDraft({ ...preset }); setSaved(preset.id ? { ...preset } : blank()); setError(''); setNotice('')
    if (menuRef.current) menuRef.current.open = false
    nameRef.current?.focus()
  }
  const field = (key, value) => { setDraft(previous => ({ ...previous, [key]: value })); setNotice('') }
  const save = async () => {
    const value = await presets.save(draft)
    setDraft(value); setSaved(value)
    return value
  }
  const apply = () => {
    if (!formRef.current.reportValidity()) return
    void run(async () => {
      const value = dirty || !draft.id ? await save() : draft
      await presetFor(currentId).select(value.id)
    }, 'Инструкции применены к текущему чату.')
  }
  const remove = () => {
    menuRef.current.open = false
    if (!window.confirm(`Удалить пресет «${saved.name}»? В созданных чатах его инструкции сохранятся.`)) return
    void run(async () => {
      await presets.remove(draft.id)
      const next = presets.getSnapshot().presets[0] ?? blank()
      setDraft({ ...next }); setSaved({ ...next })
    }, 'Пресет удалён из библиотеки.')
  }

  return <section className="mayori-presets-panel" aria-labelledby={`${id}-title`}>
    <div className="mayori-presets-content">
      <header className="mayori-presets-header">
        <div><h1 id={`${id}-title`}>Пресеты</h1><p>Задайте голос ведущего и правила вашей игры.</p></div>
        <button type="button" className="mayori-preset-button" disabled={disabled} onClick={() => choose(blank())}><Glyph kind="plus" />Создать пресет</button>
      </header>

      <div className="mayori-presets-usage" aria-label="Выбор пресетов для чатов">
        <div className="mayori-preset-usage">
          <label htmlFor={`${id}-default`}>Для новых чатов</label>
          <Select id={`${id}-default`} aria-label="Для новых чатов" value={snapshot.defaultId ?? ''} disabled={disabled} aria-describedby={`${id}-default-help`} onChange={value => { void run(() => presets.setDefault(value || null), 'Выбор для новых чатов сохранён.') }}
            options={[{ value: '', label: 'Без пресета' }, ...snapshot.presets.map(preset => ({ value: preset.id, label: preset.name }))]} />
          <p id={`${id}-default-help`}>Будет выбран при начале новой игры.</p>
        </div>
        <div className="mayori-preset-usage">
          <label htmlFor={`${id}-current`}>Текущий чат</label>
          <div className="mayori-preset-current-control">
            <Select id={`${id}-current`} aria-label="Текущий чат" value={current?.preset?.id ?? ''} disabled={disabled || !currentReady} aria-describedby={`${id}-current-help`} onChange={value => { void run(() => presetFor(currentId).select(value || null), 'Инструкции применены к текущему чату.') }}
              options={[{ value: '', label: !currentId ? 'Нет открытого чата' : !current || current.status === 'loading' ? 'Загружаем…' : 'Без пресета' },
                ...(current?.preset && !currentLibrary ? [{ value: current.preset.id, label: `${current.preset.name} · копия из чата` }] : []),
                ...snapshot.presets.map(preset => ({ value: preset.id, label: preset.name }))]} />
            {currentOutdated && <button type="button" className="mayori-preset-button" disabled={disabled || !currentReady} onClick={() => { void run(() => presetFor(currentId).select(currentLibrary.id), 'Инструкции в чате обновлены.') }}>Обновить инструкции</button>}
          </div>
          <p id={`${id}-current-help`}>{!currentId ? 'Откройте чат, чтобы выбрать для него инструкции.' : currentOutdated ? 'В библиотеке есть изменения. В чате действует прежняя копия.' : 'Выбор меняет инструкции со следующего хода.'}</p>
          {current?.error && <p role="alert">{current.error} <button type="button" className="mayori-preset-text-button" onClick={() => { void presetFor(currentId).refresh() }}>Повторить загрузку</button></p>}
        </div>
      </div>

      {snapshot.error && <div role="alert" className="mayori-preset-error">{snapshot.error} <button type="button" className="mayori-preset-button" disabled={busy} onClick={() => { void run(() => presets.refresh(), 'Список обновлён.') }}>Обновить список</button></div>}
      <div className="mayori-presets-workspace">
        <aside className="mayori-preset-library" aria-labelledby={`${id}-library`}>
          <div className="mayori-preset-library-heading"><h2 id={`${id}-library`}>Библиотека</h2><span>{snapshot.presets.length}</span></div>
          <label className="mayori-preset-search"><span className="mayori-dice-sr">Поиск пресетов</span><Glyph kind="search" /><input type="search" placeholder="Найти пресет…" value={query} onChange={event => setQuery(event.target.value)} /></label>
          <div className="mayori-preset-mobile-picker"><label htmlFor={`${id}-editing`}>Редактируемый пресет</label><Select id={`${id}-editing`} aria-label="Редактируемый пресет" value={draft.id ?? ''} disabled={disabled} onChange={value => choose(snapshot.presets.find(preset => preset.id === value) ?? blank())} options={[{ value: '', label: 'Новый пресет' }, ...snapshot.presets.map(preset => ({ value: preset.id, label: preset.name }))]} /></div>
          <ul className="mayori-preset-list">{matches.map(preset => <li key={preset.id}>
            <button type="button" className="mayori-preset-row" aria-pressed={draft.id === preset.id} disabled={busy} onClick={() => choose(preset)}>
              <span className="mayori-preset-row-title"><PresetIcon size={18} /><strong>{preset.name}</strong></span>
              <span className="mayori-preset-preview">{preset.instructions}</span>
              {(snapshot.defaultId === preset.id || current?.preset?.id === preset.id) && <span className="mayori-preset-tags">{snapshot.defaultId === preset.id && <span>Новые чаты</span>}{current?.preset?.id === preset.id && <span>Текущий чат</span>}</span>}
            </button></li>)}</ul>
          {snapshot.status === 'loading' && <p className="mayori-preset-empty">Загружаем пресеты…</p>}
          {snapshot.status === 'ready' && !snapshot.presets.length && <p className="mayori-preset-empty">Сохраните первый пресет — он появится здесь.</p>}
          {query && !matches.length && !!snapshot.presets.length && <div className="mayori-preset-empty"><p>По запросу «{query}» ничего не найдено.</p><button type="button" className="mayori-preset-text-button" onClick={() => setQuery('')}>Сбросить поиск</button></div>}
          <p className="mayori-preset-library-note">Пресеты задают инструкции. Персонажи и персоны выбираются отдельно.</p>
        </aside>

        <form ref={formRef} className="mayori-preset-editor" onSubmit={event => { event.preventDefault(); void run(save, 'Пресет сохранён.') }} onKeyDown={event => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!disabled) formRef.current.requestSubmit() }
        }}>
          <div className="mayori-preset-editor-heading">
            <div><h2>{draft.id ? saved.name : 'Новый пресет'}</h2><span className="mayori-preset-save-state">{dirty ? 'Есть несохранённые изменения' : draft.id ? 'Сохранён в библиотеке' : 'Опишите, как вести вашу игру'}</span></div>
            {draft.id && <details ref={menuRef} className="mayori-preset-menu" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false }} onKeyDown={event => {
              if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus(); event.stopPropagation() }
            }}><summary aria-label="Действия с пресетом" title="Действия с пресетом"><Glyph kind="more" /></summary><div>
              <button type="button" disabled={busy} onClick={() => choose({ name: `${draft.name} — копия`.slice(0, 120), instructions: draft.instructions })}>Дублировать пресет</button>
              <button type="button" className="mayori-preset-delete" disabled={busy} onClick={remove}>Удалить пресет</button>
            </div></details>}
          </div>
          <div className="mayori-preset-name-field"><label htmlFor={`${id}-name`}>Название</label><input id={`${id}-name`} ref={nameRef} name="presetName" autoComplete="off" placeholder="Например, камерное фэнтези" required maxLength={120} value={draft.name} disabled={disabled} onChange={event => field('name', event.target.value)} /></div>
          <div className="mayori-preset-instructions-field">
            <div className="mayori-preset-field-heading"><label htmlFor={`${id}-instructions`}>Инструкции для игры</label><span>{draft.instructions.length.toLocaleString('ru-RU')} / 64 000</span></div>
            <textarea id={`${id}-instructions`} name="presetInstructions" aria-describedby={`${id}-help`} placeholder={'Ты — ведущий фэнтезийной истории. Пиши по-русски, короткими сценами.\n\nОписывай мир и последствия поступков, оставляя решения за игроком.\n\nДобавьте желаемый тон, стиль ответов и правила игры…'} required maxLength={64000} value={draft.instructions} disabled={disabled} onChange={event => field('instructions', event.target.value)} />
            <p id={`${id}-help`}>Роль ведущего, тон, язык и правила. Эти инструкции модель получит целиком.</p>
          </div>
          {error && <p role="alert" className="mayori-preset-error">{error}</p>}
          <footer className="mayori-preset-editor-footer">
            <div className="mayori-preset-feedback"><p role="status">{busy ? 'Подождите…' : notice}</p>{!notice && !busy && <p>Сохранение не меняет инструкции в открытых чатах.</p>}</div>
            <div className="mayori-preset-editor-actions">
              {dirty && draft.id && <button type="button" className="mayori-preset-text-button" disabled={disabled} onClick={() => { setDraft({ ...saved }); setError(''); setNotice('') }}>Отменить изменения</button>}
              {currentId && <button type="button" className="mayori-preset-button" disabled={disabled || !currentReady} onClick={apply}>{dirty || !draft.id ? 'Сохранить и применить' : 'Применить к чату'}</button>}
              <button className="mayori-preset-button mayori-preset-primary" type="submit" disabled={disabled} aria-busy={busy}>Сохранить пресет</button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  </section>
}
