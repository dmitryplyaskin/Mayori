import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { filterPresets, presetChanged } from './presentation.js'
import { Select } from '../../../client/components/select.jsx'
import { PresetStructureEditor } from './structure.jsx'
import { downloadPreset, readPresetFile } from './files.js'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'

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
  const editor = presets.editor
  const { draft, saved, busy, error, notice } = useSyncExternalStore(editor.subscribe, editor.getSnapshot, editor.getSnapshot)
  const [query, setQuery] = useState('')
  const [current, setCurrent] = useState(null)
  const nameRef = useRef(null)
  const formRef = useRef(null)
  const menuRef = useRef(null)
  const libraryRef = useRef(null)
  const importRef = useRef(null)
  const dirty = presetChanged(draft, saved)
  const disabled = busy || snapshot.status === 'loading'
  const currentReady = currentId && current?.status === 'ready'
  const currentLibrary = snapshot.presets.find(preset => preset.id === current?.preset?.id)
  const currentOutdated = currentLibrary && presetChanged(currentLibrary, current.preset)
  const matches = filterPresets(snapshot.presets, query)

  useEffect(() => {
    editor.initialize(snapshot)
  }, [editor, snapshot])
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
    if (editor.getSnapshot().busy) return
    editor.update({ busy: true, error: '', notice: '' })
    try { const result = await operation(); editor.update({ notice: result === false ? '' : typeof success === 'function' ? success(result) : success }) }
    catch (failure) { editor.update({ error: failure.message || 'Не удалось выполнить действие. Попробуйте ещё раз.' }) }
    finally { editor.update({ busy: false }) }
  }
  const choose = preset => {
    if (dirty && !window.confirm('Перейти к другому пресету? Несохранённые изменения будут потеряны.')) return false
    editor.choose(preset)
    if (menuRef.current) menuRef.current.open = false
    if (libraryRef.current) libraryRef.current.open = false
    nameRef.current?.focus()
    return true
  }
  const field = (key, value) => { editor.change(key, value) }
  const importFile = event => {
    const file = event.target.files[0]
    event.target.value = ''
    if (file) void run(async () => {
      const imported = await readPresetFile(file)
      return choose(imported.preset) ? imported : false
    }, imported => ['Пресет импортирован.', ...imported.warnings].join(' '))
  }
  const save = async () => {
    const value = await presets.save(draft)
    editor.accept(value)
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
      editor.choose(next)
    }, 'Пресет удалён из библиотеки.')
  }

  return <section className="mayori-presets-panel" aria-labelledby={`${id}-title`}>
    <div className="mayori-presets-content">
      <header className="mayori-presets-header">
        <h1 id={`${id}-title`}>Пресеты</h1>
        <div className="mayori-presets-header-actions">
          <input ref={importRef} type="file" hidden accept=".json,application/json" aria-label="Файл пресета" onChange={importFile} />
          <button type="button" className="mayori-preset-button" disabled={disabled} onClick={() => importRef.current.click()}>Импорт</button>
          <button type="button" className="mayori-preset-button" disabled={disabled} onClick={() => choose(blank())}><Glyph kind="plus" />Создать пресет</button>
        </div>
      </header>

      <div className="mayori-presets-usage" aria-label="Выбор пресетов для чатов">
        <div className="mayori-preset-usage">
          <label htmlFor={`${id}-default`}>Для новых чатов</label>
          <Select id={`${id}-default`} aria-label="Для новых чатов" value={snapshot.defaultId ?? ''} disabled={disabled} onChange={value => { void run(() => presets.setDefault(value || null), 'Выбор для новых чатов сохранён.') }}
            options={[{ value: '', label: 'Без пресета' }, ...snapshot.presets.map(preset => ({ value: preset.id, label: preset.name }))]} />
        </div>
        <div className="mayori-preset-usage">
          <label htmlFor={`${id}-current`}>Текущий чат</label>
          <div className="mayori-preset-current-control">
            <Select id={`${id}-current`} aria-label="Текущий чат" value={current?.preset?.id ?? ''} disabled={disabled || !currentReady} aria-describedby={currentId ? `${id}-current-help` : undefined} onChange={value => { void run(() => presetFor(currentId).select(value || null), 'Инструкции применены к текущему чату.') }}
              options={[{ value: '', label: !currentId ? 'Нет открытого чата' : !current || current.status === 'loading' ? 'Загружаем…' : 'Без пресета' },
                ...(current?.preset && !currentLibrary ? [{ value: current.preset.id, label: `${current.preset.name} · копия из чата` }] : []),
                ...snapshot.presets.map(preset => ({ value: preset.id, label: preset.name }))]} />
            {currentOutdated && <button type="button" className="mayori-preset-button" disabled={disabled || !currentReady} onClick={() => { void run(() => presetFor(currentId).select(currentLibrary.id), 'Инструкции в чате обновлены.') }}>Обновить инструкции</button>}
          </div>
          {currentId && <p id={`${id}-current-help`}>{currentOutdated ? 'В чате действует прежняя версия.' : 'Применяется со следующего хода.'}</p>}
          {current?.error && <p role="alert">{current.error} <button type="button" className="mayori-preset-text-button" onClick={() => { void presetFor(currentId).refresh() }}>Повторить загрузку</button></p>}
        </div>
      </div>

      {snapshot.error && <div role="alert" className="mayori-preset-error">{snapshot.error} <button type="button" className="mayori-preset-button" disabled={busy} onClick={() => { void run(() => presets.refresh(), 'Список обновлён.') }}>Обновить список</button></div>}
      <details ref={libraryRef} className="mayori-preset-library-disclosure">
        <summary>Библиотека пресетов · {snapshot.presets.length}{draft.id ? ` · ${saved.name}` : ' · Новый пресет'}</summary>
        <div className="mayori-preset-library" aria-label="Библиотека пресетов">
          <label className="mayori-preset-search"><span className="mayori-dice-sr">Поиск пресетов</span><Glyph kind="search" /><input type="search" placeholder="Найти пресет…" value={query} onChange={event => setQuery(event.target.value)} /></label>
          <ul className="mayori-preset-list">{matches.map(preset => <li key={preset.id}>
            <button type="button" className="mayori-preset-row" aria-pressed={draft.id === preset.id} disabled={busy} onClick={() => choose(preset)}>
              <span className="mayori-preset-row-title"><PresetIcon size={18} /><strong>{preset.name}</strong></span>
              <span className="mayori-preset-preview">{preset.instructions}</span>
              {(snapshot.defaultId === preset.id || current?.preset?.id === preset.id) && <span className="mayori-preset-tags">{snapshot.defaultId === preset.id && <span>Новые чаты</span>}{current?.preset?.id === preset.id && <span>Текущий чат</span>}</span>}
            </button></li>)}</ul>
          {snapshot.status === 'loading' && <p className="mayori-preset-empty">Загружаем пресеты…</p>}
          {snapshot.status === 'ready' && !snapshot.presets.length && <p className="mayori-preset-empty">Нет пресетов.</p>}
          {query && !matches.length && !!snapshot.presets.length && <div className="mayori-preset-empty"><p>По запросу «{query}» ничего не найдено.</p><button type="button" className="mayori-preset-text-button" onClick={() => setQuery('')}>Сбросить поиск</button></div>}
        </div>
      </details>
      <div className="mayori-presets-workspace">
        <form ref={formRef} className="mayori-preset-editor" onSubmit={event => { event.preventDefault(); void run(save, 'Пресет сохранён.') }} onKeyDown={event => {
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!disabled) formRef.current.requestSubmit() }
        }}>
          <div className="mayori-preset-editor-heading">
            <div><h2>{draft.id ? saved.name : 'Новый пресет'}</h2>{(dirty || draft.id) && <span className="mayori-preset-save-state">{dirty ? 'Есть несохранённые изменения' : 'Сохранён в библиотеке'}</span>}</div>
            <details ref={menuRef} className="mayori-preset-menu" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false }} onKeyDown={event => {
              if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus(); event.stopPropagation() }
            }}><Tooltip label="Действия с пресетом" side="top" portal><summary aria-label="Действия с пресетом"><Glyph kind="more" /></summary></Tooltip><div>
              {draft.id && <button type="button" disabled={busy} onClick={() => choose({ ...draft, id: undefined, name: `${draft.name} — копия`.slice(0, 120) })}>Дублировать пресет</button>}
              <button type="button" disabled={disabled} onClick={() => {
                menuRef.current.open = false
                menuRef.current.querySelector('summary').focus()
                void run(() => downloadPreset(draft), 'Пресет экспортирован.')
              }}>Экспорт</button>
              {draft.id && <button type="button" className="mayori-preset-delete" disabled={busy} onClick={remove}>Удалить пресет</button>}
            </div></details>
          </div>
          <div className="mayori-preset-name-field"><label htmlFor={`${id}-name`}>Название</label><input id={`${id}-name`} ref={nameRef} name="presetName" autoComplete="off" placeholder="Например, камерное фэнтези" required maxLength={120} value={draft.name} disabled={disabled} onChange={event => field('name', event.target.value)} /></div>
          <PresetStructureEditor editor={editor} disabled={disabled} />
          {error && <p role="alert" className="mayori-preset-error">{error}</p>}
          <footer className="mayori-preset-editor-footer">
            <div className="mayori-preset-feedback"><p role="status">{busy ? 'Подождите…' : notice}</p></div>
            <div className="mayori-preset-editor-actions">
              {dirty && draft.id && <button type="button" className="mayori-preset-text-button" disabled={disabled} onClick={() => { editor.reset() }}>Отменить изменения</button>}
              {currentId && <button type="button" className="mayori-preset-button" disabled={disabled || !currentReady} onClick={apply}>{dirty || !draft.id ? 'Сохранить и применить' : 'Применить к чату'}</button>}
              <button className="mayori-preset-button mayori-preset-primary" type="submit" disabled={disabled} aria-busy={busy}>Сохранить пресет</button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  </section>
}
