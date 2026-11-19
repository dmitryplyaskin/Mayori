import { useContext, useId, useRef, useState, useSyncExternalStore } from 'react'
import { tr, noticeText } from '../../localization/client/service.js'
import { MessageEditContext } from './editor-state.js'

export function InlineMessageEditor({ draft, revisions, useSession }) {
  const { setDraft } = useContext(MessageEditContext)
  const { busy: saving } = useSyncExternalStore(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot)
  const activity = useSession(state => state.running || state.awaitingFirstTurn || state.pendingSubmissions.length > 0)
  const form = useRef(null)
  const field = useRef(null)
  const save = useRef(null)
  const pending = useRef(false)
  const errorId = useId()
  const [text, setText] = useState(draft.text)
  const [error, setError] = useState('')

  const close = () => {
    const document = form.current?.ownerDocument
    if (document && (form.current.contains(document.activeElement) || document.activeElement === document.body)) {
      draft.trigger.focus({ preventScroll: true })
    }
    setDraft(current => current === draft ? null : current)
  }
  const cancel = () => { if (!saving && !pending.current) close() }
  const submit = async event => {
    event.preventDefault()
    event.stopPropagation()
    if (activity || saving || pending.current) return
    if (!text.trim()) { setError(tr("Введите текст сообщения.")); field.current?.focus(); return }
    pending.current = true
    setError('')
    try {
      await revisions.edit(draft.seq, text, event.nativeEvent.submitter?.value === 'branch' ? 'branch' : 'current')
      close()
    } catch (failure) { setError(failure.message) }
    finally { pending.current = false }
  }
  return <form ref={form} className="mayori-message-editor" aria-label={tr("Редактировать сообщение")} onSubmit={submit}
    onKeyDown={event => {
      event.stopPropagation()
      if (event.nativeEvent.isComposing) return
      if (event.key === 'Escape') {
        event.preventDefault()
        cancel()
      } else if (event.target === field.current && (event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        event.currentTarget.requestSubmit(save.current)
      }
    }}>
    <textarea ref={field} autoFocus rows={3} value={text} readOnly={saving}
      aria-label={draft.role === 'user' ? tr("Реплика игрока") : tr("Реплика персонажа")}
      aria-invalid={error && !text.trim() ? true : undefined} aria-describedby={error ? errorId : undefined}
      onChange={event => { setText(event.target.value); setError('') }} />
    {error && <p id={errorId} role="alert" className="mayori-error">{noticeText(error)}</p>}
    <div className="mayori-message-editor-actions">
      <button type="button" disabled={saving} onClick={cancel}>{tr("Отмена")}</button>
      <button type="submit" value="branch" disabled={activity || saving}>{tr("Создать ветку")}</button>
      <button ref={save} type="submit" value="current" disabled={activity || saving}>{tr("Сохранить в чате")}</button>
    </div>
  </form>
}
