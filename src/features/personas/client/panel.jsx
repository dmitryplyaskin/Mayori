import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { Menu } from '@deepseek-ai/dsh-client-ui-primitives'
import { Select } from '../../../client/components/select.jsx'
import { PersonaBlocks } from './blocks.jsx'
import { PersonaDrafts, personaDraft, personaChanged } from './editing.js'
import { composePersona, filterPersonas } from '../shared/persona.js'

const tabs = [['description', 'Описание'], ['blocks', 'Блоки'], ['settings', 'Настройки'], ['preview', 'Предпросмотр']]

export function PersonaIcon({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>
}

export function PersonaPanel({ personas, sessions, chatFor }) {
  const snapshot = useSyncExternalStore(personas.subscribe, personas.getSnapshot, personas.getSnapshot)
  const catalog = useSyncExternalStore(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot)
  const currentId = catalog.ids.find(id => catalog.byId[id]?.retainedBy?.mainView > 0)
  const drafts = useRef(personas.drafts ??= new PersonaDrafts()).current
  const [draft, setDraft] = useState(() => personaDraft(personas.draft))
  useEffect(() => { personas.draft = draft; drafts.remember(draft) }, [draft, personas, drafts])
  const initialSelection = useRef(!!personas.draft)
  useEffect(() => {
    if (!initialSelection.current && snapshot.status === 'ready') {
      initialSelection.current = true
      setDraft(drafts.open(snapshot.personas.find(persona => persona.id === snapshot.defaultId) ?? snapshot.personas[0]))
    }
  }, [snapshot, drafts])
  const [tab, setTab] = useState('description')
  const [nodeId, setNodeId] = useState(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const nameRef = useRef(null)
  const imageRef = useRef(null)
  const formRef = useRef(null)
  const pending = useRef(false)
  const [currentPersona, setCurrentPersona] = useState(null)
  const [context, setContext] = useState({})
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')
  const uid = useId()
  const saved = snapshot.personas.find(persona => persona.id === draft.id)
  const dirty = personaChanged(draft, saved)
  useEffect(() => {
    let active = true
    setCurrentPersona(null); setContext({})
    if (!currentId) return
    const chat = chatFor(currentId)
    const update = () => { if (active) {
      const state = chat.getSnapshot().value
      setCurrentPersona(state?.persona ?? null); setContext({ ...state?.personaContext, characterName: state?.character?.name })
    } }
    const unsubscribe = chat.subscribe(update)
    void chat.refresh(); update()
    return () => { active = false; unsubscribe() }
  }, [currentId, chatFor])
  const run = async (operation, success) => {
    if (pending.current) return
    pending.current = true; setBusy(true); setError(''); setNotice('')
    try { await operation(); setNotice(success) }
    catch (failure) { setError(failure.message || 'Не удалось сохранить. Попробуйте ещё раз.') }
    finally { pending.current = false; setBusy(false) }
  }
  const choose = persona => {
    initialSelection.current = true
    drafts.remember(draft); setDraft(drafts.open(persona)); setError(''); setNotice(''); setLibraryOpen(false)
  }
  const create = () => { choose(undefined); setTab('description'); nameRef.current?.focus() }
  const field = (key, value) => { initialSelection.current = true; setDraft(previous => ({ ...previous, [key]: value })) }
  const save = async () => {
    const result = await personas.save(draft)
    drafts.forget(draft.id); drafts.remember(result); setDraft(personaDraft(result))
    return result
  }
  const image = async event => {
    const file = event.target.files?.[0]; event.target.value = ''
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Выберите PNG, JPEG или WebP.'); return
    }
    await run(async () => {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('Не удалось прочитать изображение.'))
        reader.readAsDataURL(file)
      })
      field('avatar', data)
    }, 'Аватар добавлен.')
  }
  const preview = composePersona(draft, context)
  const rows = filterPersonas(snapshot.personas, query, sort)
  const promptField = (key, value) => field('prompt', { ...draft.prompt, [key]: value })
  const action = id => {
    setMenuOpen(false)
    if (id === 'discard') {
      drafts.forget(draft.id); setDraft(personaDraft(saved)); setError(''); setNotice('Изменения отменены.')
    } else if (id === 'copy') {
      void run(async () => {
        const { id: _id, characterIds: _connections, ...copy } = draft
        const result = await personas.save({ ...copy, name: `${draft.name.slice(0, 112)} (копия)`, characterIds: [] })
        choose(result)
      }, 'Копия создана.')
    } else if (id === 'delete' && window.confirm(`Удалить персону «${draft.name}»?`)) {
      void run(async () => {
        await personas.remove(draft.id); drafts.forget(draft.id)
        setDraft(drafts.open(personas.getSnapshot().personas[0]))
      }, 'Персона удалена.')
    }
  }
  return <section className="mayori-personas-panel" aria-labelledby={`${uid}-title`}>
    <header className="mayori-personas-header"><div><h2 id={`${uid}-title`}>Персоны</h2><span className="mayori-persona-hint">{snapshot.personas.length} в библиотеке</span></div>
      <button type="button" disabled={busy} onClick={create}>+ Создать персону</button>
    </header>
    <div className="mayori-personas-workspace">
      <aside className="mayori-persona-catalog" data-open={libraryOpen} aria-label="Библиотека персон">
        <button type="button" className="mayori-persona-library-toggle" aria-expanded={libraryOpen} aria-controls={`${uid}-library`} onClick={() => setLibraryOpen(value => !value)}>Библиотека · {snapshot.personas.length} <span aria-hidden="true">{libraryOpen ? '−' : '+'}</span></button>
        <div className="mayori-persona-library-body" id={`${uid}-library`}>
          <div className="mayori-persona-library-tools"><label><span className="mayori-dice-sr">Поиск персон</span><input type="search" placeholder="Поиск персон" value={query} onChange={event => setQuery(event.target.value)} /></label>
            <Select aria-label="Сортировка персон" value={sort} onChange={setSort} options={[
              { value: 'name', label: 'По имени' }, { value: 'description', label: 'По длине описания' }, { value: 'connections', label: 'По привязкам' },
            ]} />
          </div>
          <ul className="mayori-persona-list">{rows.map(persona => <li key={persona.id}>
            <button type="button" className="mayori-persona-row" aria-pressed={draft.id === persona.id} disabled={busy} onClick={() => choose(persona)}>
              <span className="mayori-persona-avatar" aria-hidden="true">{persona.avatar ? <img src={persona.avatar} alt="" /> : persona.name.slice(0, 1)}</span>
              <span className="mayori-persona-row-text"><strong>{persona.name}</strong><small>{persona.title || persona.description.slice(0, 90) || 'Без описания'}</small>
                <span className="mayori-persona-badges">{snapshot.defaultId === persona.id && <em>По умолчанию</em>}{currentPersona?.id === persona.id && <em>В чате</em>}{(persona.id === draft.id ? dirty : drafts.changed(persona)) && <em>Черновик</em>}</span>
              </span>
            </button></li>)}</ul>
          {snapshot.status === 'loading' && <p className="mayori-persona-empty">Загружаем персоны…</p>}
          {snapshot.status === 'ready' && !snapshot.personas.length && <p className="mayori-persona-empty">Здесь будут ваши персоны. Создайте первую справа.</p>}
          {!!snapshot.personas.length && !rows.length && <div className="mayori-persona-empty"><p>Ничего не найдено</p><button type="button" onClick={() => setQuery('')}>Сбросить поиск</button></div>}
          {snapshot.error && <div role="alert" className="mayori-persona-empty">{snapshot.error}<button type="button" onClick={() => { void run(() => personas.refresh(), 'Список обновлён.') }}>Обновить список</button></div>}
        </div>
      </aside>
      <form ref={formRef} className="mayori-persona-form" onKeyDown={event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
          event.preventDefault(); if (!busy) formRef.current.requestSubmit()
        }
      }} onSubmit={event => {
        event.preventDefault(); void run(save, 'Персона сохранена.')
      }}>
        <div className="mayori-persona-edit-area">
        <header className="mayori-persona-editor-header"><h3>{draft.id ? 'Персона' : 'Новая персона'}</h3><span className="mayori-persona-hint">{dirty ? 'Не сохранено' : draft.id ? 'Сохранено' : ''}</span>
          <Menu open={menuOpen && !busy} portal autoFocus onClose={() => setMenuOpen(false)} onSelect={action}
            items={[{ id: 'discard', label: 'Отменить изменения', disabled: !dirty }, { id: 'copy', label: 'Создать копию', disabled: !draft.id }, { id: 'delete', label: 'Удалить персону', disabled: !draft.id }]}
            anchor={<button type="button" disabled={busy} aria-haspopup="menu" aria-expanded={menuOpen && !busy} onClick={() => setMenuOpen(value => !value)}>Действия <span aria-hidden="true">⌄</span></button>} />
        </header>
        <div className="mayori-persona-identity">
          <button type="button" className="mayori-persona-avatar-picker" disabled={busy} onClick={() => imageRef.current?.click()}>
            <span className="mayori-persona-avatar" aria-hidden="true">{draft.avatar ? <img src={draft.avatar} alt="" /> : <PersonaIcon size={28} />}</span><span>Аватар</span>
          </button>
          <input ref={imageRef} hidden type="file" aria-label="Аватар" accept="image/png,image/jpeg,image/webp" disabled={busy} onChange={event => { void image(event) }} />
          <label>Имя в чате<input ref={nameRef} name="personaName" placeholder="Имя персоны" autoComplete="off" required maxLength={120} value={draft.name} disabled={busy} onChange={event => field('name', event.target.value)} /></label>
          <label>Подпись<input name="personaTitle" placeholder="Например, маг из северных земель" maxLength={200} value={draft.title} disabled={busy} onChange={event => field('title', event.target.value)} /></label>
        </div>
        <div role="tablist" aria-label="Редактор персоны" className="mayori-persona-tabs">{tabs.map(([key, label], index) => <button type="button" role="tab" key={key} id={`${uid}-tab-${key}`} aria-controls={`${uid}-content-${key}`} aria-selected={tab === key} tabIndex={tab === key ? 0 : -1} onClick={() => setTab(key)} onKeyDown={event => {
          const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null
          if (next !== null) { event.preventDefault(); setTab(tabs[next][0]); document.getElementById(`${uid}-tab-${tabs[next][0]}`)?.focus() }
        }}>{label}{key === 'blocks' && draft.blocks.length > 0 && <span aria-hidden="true" className="mayori-persona-tab-count">{draft.blocks.reduce((count, node) => count + (node.type === 'group' ? node.items.length : 1), 0)}</span>}</button>)}</div>
        <div className="mayori-persona-editor-content" role="tabpanel" tabIndex={0} id={`${uid}-content-${tab}`} aria-labelledby={`${uid}-tab-${tab}`}>
          {tab === 'description' && <div className="mayori-persona-description">
            <label className="mayori-persona-long-text">Описание<textarea name="personaDescription" placeholder="Внешность, характер, биография — всё, что собеседник должен знать о вашей персоне." rows={12} maxLength={32000} value={draft.description} disabled={busy} onChange={event => field('description', event.target.value)} /></label>
            <details className="mayori-persona-variant" open={draft.descriptionOverride !== null}><summary>Отдельный вариант для модели</summary>
              <label className="mayori-persona-check"><input type="checkbox" disabled={busy} checked={draft.descriptionOverride !== null} onChange={event => field('descriptionOverride', event.target.checked ? draft.description : null)} />Другой вариант описания</label>
              {draft.descriptionOverride !== null && <><label>Вариант для модели<textarea rows={8} maxLength={32000} disabled={busy} value={draft.descriptionOverride} onChange={event => field('descriptionOverride', event.target.value)} /></label><button type="button" disabled={busy} onClick={() => setDraft(previous => ({ ...previous, description: previous.descriptionOverride, descriptionOverride: null }))}>Сделать базовым описанием</button></>}
            </details>
          </div>}
          {tab === 'blocks' && <PersonaBlocks blocks={draft.blocks} onChange={value => field('blocks', value)} selectedId={nodeId} onSelect={setNodeId} disabled={busy} context={context} />}
          {tab === 'settings' && <div className="mayori-persona-settings">
            <section><h4>Выбор персоны</h4><button type="button" disabled={busy || !draft.id} onClick={() => { void run(() => personas.setDefault(snapshot.defaultId === draft.id ? null : draft.id), 'Выбор для новых чатов сохранён.') }}>{snapshot.defaultId === draft.id ? 'Снять выбор по умолчанию' : 'Использовать по умолчанию'}</button>{!draft.id && <p className="mayori-persona-hint">Сначала сохраните персону.</p>}</section>
            <section><h4>Привязки к персонажам</h4><button type="button" disabled={busy || !context.characterId || draft.characterIds.includes(context.characterId)} onClick={() => field('characterIds', [...draft.characterIds, context.characterId])}>Добавить текущего персонажа</button>
              {!draft.characterIds.length && <p className="mayori-persona-hint">Привязок пока нет.</p>}{draft.characterIds.map(id => <div className="mayori-persona-binding" key={id}><span>{id === context.characterId ? context.characterName || 'Текущий персонаж' : id}</span><button type="button" disabled={busy} onClick={() => field('characterIds', draft.characterIds.filter(value => value !== id))}>Убрать</button></div>)}
            </section>
            <section><h4>Сборка описания</h4><label>Разделитель блоков<input maxLength={200} value={draft.prompt.joiner} disabled={busy} onChange={event => promptField('joiner', event.target.value)} /></label>
              <label className="mayori-persona-check"><input type="checkbox" checked={draft.prompt.wrapperEnabled} disabled={busy} onChange={event => promptField('wrapperEnabled', event.target.checked)} />Использовать шаблон</label>
              {draft.prompt.wrapperEnabled && <label>Шаблон с {'{{PROMPT}}'}<textarea rows={5} maxLength={8000} value={draft.prompt.wrapperTemplate} disabled={busy} onChange={event => promptField('wrapperTemplate', event.target.value)} /></label>}
            </section>
            {draft.avatar && <section><h4>Аватар</h4><button type="button" disabled={busy} onClick={() => field('avatar', '')}>Убрать аватар</button></section>}
          </div>}
          {tab === 'preview' && <div className="mayori-persona-preview-content"><div className="mayori-persona-preview-heading"><h4>Итоговое описание</h4><span className="mayori-persona-hint">{preview.description.length.toLocaleString('ru-RU')} символов</span></div><p className="mayori-persona-hint">{currentId ? 'Для текущего чата' : 'Без условий чата'} · блоков включено: {preview.activeIds.length}</p><pre className="mayori-persona-preview">{preview.description || 'Описание пока пустое.'}</pre></div>}
        </div>
        {tabs.filter(([key]) => key !== tab).map(([key]) => <div key={key} hidden role="tabpanel" id={`${uid}-content-${key}`} aria-labelledby={`${uid}-tab-${key}`} />)}
        </div>
        <footer className="mayori-persona-footer">
          <div className="mayori-persona-feedback"><p role="status">{busy ? 'Сохраняем…' : notice || (currentPersona ? `В текущем чате: ${currentPersona.name}` : '')}</p>{error && <p role="alert" className="mayori-error">{error}</p>}</div>
          <div className="mayori-persona-footer-actions"><button type="button" disabled={busy || !currentId || !context.characterId} onClick={() => {
            if (formRef.current.reportValidity()) void run(async () => { const result = await save(); await chatFor(currentId).setPersona(result.id) }, 'Персона закреплена за текущим чатом.')
          }}>Играть в этом чате</button><button className="mayori-persona-primary" type="submit" disabled={busy} aria-busy={busy}>Сохранить персону</button></div>
        </footer>
      </form>
    </div>
  </section>
}
