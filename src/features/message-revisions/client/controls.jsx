import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Select } from '../../../client/components/select.jsx'
import { branchRows } from '../domain/revisions.js'

function RevisionIcon({ repeat }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {repeat ? <><path d="M20 7v5h-5" /><path d="M20 12a8 8 0 1 0-2.3 5.7M20 12l-3-4" /></>
      : <><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z" /></>}
  </svg>
}

/** Use the stock user message's existing clock/copy row inside our owned wrapper. */
export function UserRevisionToolbar({ container, children }) {
  const [toolbar, setToolbar] = useState(null)
  useEffect(() => {
    const root = container.current
    const sync = () => { setToolbar(root.querySelector('[data-clock="start"]')) }
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { childList: true, subtree: true })
    return () => { observer.disconnect() }
  }, [container])
  return toolbar ? createPortal(children, toolbar) : null
}

/** Character state gates actions contributed to the native assistant-actions slot. */
export function AssistantRevisionActions({ chatFor, revisionFor, sessionId, closing, useSession, turn }) {
  const chat = chatFor(sessionId)
  const snapshot = useSyncExternalStore(chat.subscribe, chat.getSnapshot, chat.getSnapshot)
  const seq = closing?.finalNode?.seq
  const greeting = snapshot.value?.greeting
  const blocks = greeting && greeting.messageId === closing?.finalNode?.messageId
    ? [{ kind: 'text', text: greeting.text }] : closing?.blocks ?? []
  if (!snapshot.value?.character || !revisionFor || !useSession || !Number.isSafeInteger(seq) || seq < 1
    || blocks.some(block => block.kind === 'tool-call')
    || !blocks.some(block => block.kind === 'text' && block.text.trim())) return null
  return <MessageRevisionControls revisions={revisionFor(sessionId)} seq={seq} useSession={useSession}
    canRepeat={turn > 1} />
}

/** Native dialog keeps an unsaved draft local until the Host creates its durable branch. */
export function MessageRevisionControls({ revisions, seq, canRepeat, useSession }) {
  const snapshot = useSyncExternalStore(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot)
  const activity = useSession(state => state.running || state.awaitingFirstTurn || state.pendingSubmissions.length > 0)
  const dialog = useRef(null)
  const trigger = useRef(null)
  const field = useRef(null)
  const epoch = useRef(0)
  const pending = useRef(false)
  const titleId = useId()
  const textId = useId()
  const errorId = useId()
  const [editor, setEditor] = useState(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => () => { ++epoch.current }, [])
  useEffect(() => {
    if (editor) dialog.current?.showModal()
    else trigger.current?.focus()
  }, [editor])
  const busy = activity || snapshot.busy || loading
  const open = async (mode, button) => {
    if (busy || pending.current) return
    pending.current = true
    const revision = ++epoch.current
    trigger.current = button; setError(''); setLoading(true)
    try {
      const value = await revisions.inspect(seq)
      if (revision !== epoch.current) return
      if (mode === 'regenerate' && !value.canRegenerate) throw new Error('У этой реплики нет хода игрока для повторной генерации.')
      setText(value.text); setEditor({ mode, ...value })
    } catch (failure) { if (revision === epoch.current) setError(failure.message) }
    finally { pending.current = false; if (revision === epoch.current) setLoading(false) }
  }
  const close = () => { if (!snapshot.busy) dialog.current?.close() }
  const submit = async event => {
    event.preventDefault()
    if (busy || pending.current) return
    if (editor.mode === 'edit' && !text.trim()) { setError('Введите текст сообщения.'); field.current?.focus(); return }
    pending.current = true; setError('')
    const revision = epoch.current
    try {
      if (editor.mode === 'edit') await revisions.edit(seq, text)
      else await revisions.regenerate(seq)
      if (revision === epoch.current) dialog.current?.close()
    } catch (failure) { if (revision === epoch.current) setError(failure.message) }
    finally { pending.current = false }
  }
  return <>
    <span className="mayori-message-actions">
      <button type="button" aria-label="Редактировать" title="Редактировать" aria-haspopup="dialog" disabled={busy}
        onClick={event => { void open('edit', event.currentTarget) }}><RevisionIcon /></button>
      {canRepeat && <button type="button" aria-label="Повторить ответ" title="Повторить ответ" aria-haspopup="dialog" disabled={busy}
        onClick={event => { void open('regenerate', event.currentTarget) }}><RevisionIcon repeat /></button>}
      <span className="mayori-revision-status" role="status">{loading ? 'Загружаем реплику…' : snapshot.busy ? 'Создаём ветку…' : ''}</span>
    </span>
    {error && !editor && <p role="alert" className="mayori-error">{error}</p>}
    {editor && createPortal(<dialog ref={dialog} className="mayori-message-editor" aria-labelledby={titleId}
      onCancel={event => { if (snapshot.busy) event.preventDefault() }}
      onClose={() => { setEditor(null); setError('') }}>
      <form onSubmit={submit}>
        <h2 id={titleId}>{editor.mode === 'edit' ? 'Редактировать сообщение' : 'Повторить ответ'}</h2>
        <p>Продолжение откроется в новой ветке от этой реплики. Исходный чат сохранится.</p>
        {editor.mode === 'edit' ? <>
          <label htmlFor={textId}>{editor.role === 'user' ? 'Реплика игрока' : 'Реплика персонажа'}</label>
          <textarea ref={field} id={textId} autoFocus value={text} disabled={snapshot.busy}
            aria-invalid={error && !text.trim() ? true : undefined} aria-describedby={error ? errorId : undefined}
            onChange={event => { setText(event.target.value); setError('') }}
            onKeyDown={event => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); event.currentTarget.form.requestSubmit() } }} />
        </> : <p>Модель заново ответит на реплику игрока. Инструменты выполнятся снова, и результаты игровых бросков могут измениться.</p>}
        {error && <p id={errorId} role="alert" className="mayori-error">{error}</p>}
        <p role="status">{snapshot.busy ? 'Сохраняем ветку…' : ''}</p>
        <div className="mayori-message-editor-actions">
          <button type="button" disabled={snapshot.busy} onClick={close}>Отмена</button>
          <button type="submit" autoFocus={editor.mode === 'regenerate'} disabled={busy}>
            {editor.mode === 'regenerate' ? 'Повторить ответ' : editor.role === 'user' ? 'Сохранить и отправить' : 'Сохранить'}
          </button>
        </div>
      </form>
    </dialog>, document.body)}
  </>
}

/** The DSH catalog retains original and regenerated branches across reload and restart. */
export function RevisionBranchNavigation({ sessionId, sessions, open }) {
  const snapshot = useSyncExternalStore(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot)
  const rows = branchRows(snapshot, sessionId)
  if (rows.length < 2) return null
  return <div className="mayori-revision-branches">
    <span>Ветка чата</span><Select aria-label="Ветка чата" value={sessionId} onChange={open} options={rows.map(row => ({ value: row.id, label: row.label }))} />
  </div>
}
