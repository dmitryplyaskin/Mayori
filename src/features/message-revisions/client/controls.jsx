import { tr, noticeText } from '../../localization/client/service.js'
import { useContext, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Select } from '../../../client/components/select.jsx'
import { branchRows } from '../domain/revisions.js'
import { IconButton } from '../../../client/components/icon-button.jsx'
import { assertSafeEdit, assertCurrentRegeneration } from './revisions.js'
import { MessageEditContext } from './editor-state.js'

function RevisionIcon({ repeat, remove }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {remove ? <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" /></>
      : repeat ? <><path d="M20 7v5h-5" /><path d="M20 12a8 8 0 1 0-2.3 5.7M20 12l-3-4" /></>
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

/** The author chooses where to save; editing never starts model work. */
export function MessageRevisionControls({ revisions, seq, canRepeat, useSession }) {
  const editing = useContext(MessageEditContext)
  const snapshot = useSyncExternalStore(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot)
  const activity = useSession(state => state.running || state.awaitingFirstTurn || state.pendingSubmissions.length > 0)
  const dialog = useRef(null)
  const trigger = useRef(null)
  const epoch = useRef(0)
  const pending = useRef(false)
  const titleId = useId()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  useEffect(() => () => { ++epoch.current }, [])
  useEffect(() => {
    if (confirming) dialog.current?.showModal()
    else trigger.current?.focus()
  }, [confirming])
  const busy = activity || snapshot.busy || loading || Boolean(editing?.draft)
  const open = async (mode, button) => {
    if (busy || pending.current) return
    pending.current = true
    const revision = ++epoch.current
    setError(''); setLoading(true)
    try {
      const value = await revisions.inspect(seq)
      if (revision !== epoch.current) return
      if (mode === 'edit') {
        assertSafeEdit(value)
        editing.setDraft(current => current ?? { seq, text: value.text, role: value.role, trigger: button })
      } else if (mode === 'regenerate') {
        assertCurrentRegeneration(value)
        if (!value.canRegenerate) throw new Error(value.regenerateError || tr("У этой реплики нет хода игрока для повторной генерации."))
        await revisions.regenerate(seq)
      } else {
        if (!value.canDelete) throw new Error(tr("Перезапустите Mayori и обновите страницу для удаления сообщений."))
        trigger.current = button
        setConfirming(true)
      }
    } catch (failure) { if (revision === epoch.current) setError(failure.message) }
    finally { pending.current = false; if (revision === epoch.current) setLoading(false) }
  }
  const close = () => { if (!snapshot.busy) dialog.current?.close() }
  const submit = async event => {
    event.preventDefault()
    event.stopPropagation()
    if (busy || pending.current) return
    pending.current = true; setError('')
    const revision = epoch.current
    try {
      await revisions.remove(seq)
      if (revision === epoch.current) dialog.current?.close()
    } catch (failure) { if (revision === epoch.current) setError(failure.message) }
    finally { pending.current = false }
  }
  return <>
    <span className="mayori-message-actions">
      {editing && <IconButton label={tr("Редактировать")} aria-expanded={editing.draft?.seq === seq}
        aria-disabled={busy || undefined} onClick={event => { void open('edit', event.currentTarget) }}><RevisionIcon /></IconButton>}
      {canRepeat && <IconButton label={tr("Повторить ответ")} aria-disabled={busy || undefined}
        onClick={event => { void open('regenerate', event.currentTarget) }}><RevisionIcon repeat /></IconButton>}
      <IconButton label={tr("Удалить сообщение")} aria-haspopup="dialog" aria-disabled={busy || undefined}
        onClick={event => { void open('delete', event.currentTarget) }}><RevisionIcon remove /></IconButton>
      <span className="mayori-revision-status" role="status">{loading ? tr("Загружаем реплику…") : snapshot.busy ? tr("Сохраняем…") : ''}</span>
    </span>
    {error && !confirming && <p role="alert" className="mayori-error">{noticeText(error)}</p>}
    {confirming && createPortal(<dialog ref={dialog} className="mayori-message-confirm" aria-labelledby={titleId}
      onCancel={event => { if (snapshot.busy) event.preventDefault() }}
      onKeyDown={event => { event.stopPropagation() }}
      onClose={() => { setConfirming(false); setError('') }}>
      <form onSubmit={submit}>
        <h2 id={titleId}>{tr("Удалить сообщение?")}</h2>
        {error && <p role="alert" className="mayori-error">{noticeText(error)}</p>}
        <div className="mayori-message-editor-actions">
          <button type="button" autoFocus disabled={snapshot.busy} onClick={close}>{tr("Отмена")}</button>
          <button type="submit" disabled={busy}>{snapshot.busy ? tr("Удаляем…") : tr("Удалить")}</button>
        </div>
      </form>
    </dialog>, document.body)}
  </>
}

/** The DSH catalog retains explicitly authored branches across reload and restart. */
export function RevisionBranchNavigation({ sessionId, sessions, open }) {
  const snapshot = useSyncExternalStore(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot)
  const rows = branchRows(snapshot, sessionId)
  if (rows.length < 2) return null
  return <div className="mayori-revision-branches">
    <span>{tr("Ветка чата")}</span><Select aria-label={tr("Ветка чата")} value={sessionId} onChange={open} options={rows.map(row => ({ value: row.id, label: noticeText(row.label) }))} />
  </div>
}
