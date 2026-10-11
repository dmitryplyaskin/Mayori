import { createElement, useRef, useState, useSyncExternalStore } from 'react'

/** Saved answers use the same compact, cyclic navigation as authored greetings. */
export function AnswerVariantNavigation({ revisions, group, useSession, IconButton }) {
  const snapshot = useSyncExternalStore(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot)
  const activity = useSession(state => state.running || state.awaitingFirstTurn || state.pendingSubmissions.length > 0)
  const pending = useRef(false)
  const [error, setError] = useState('')
  const swipe = async direction => {
    if (pending.current || snapshot.busy || activity || !group.count) return
    pending.current = true; setError('')
    const index = group.index < 0 ? (direction < 0 ? group.count - 1 : 0)
      : (group.index + direction + group.count) % group.count
    try { await revisions.selectVariant(group.replySeq ?? group.groupId, index) }
    catch (failure) { setError(failure.message) }
    finally {
      pending.current = false
      requestAnimationFrame(() => {
        if (document.activeElement !== document.body) return
        const controls = [...document.querySelectorAll(`[data-answer-variant-group="${group.groupId}"]`)]
          .find(node => node.dataset.answerVariantChat === revisions.sessionId)
        controls?.querySelector(`button[aria-label="${direction < 0 ? 'Предыдущий' : 'Следующий'} вариант ответа"]`)?.focus()
      })
    }
  }
  if (group.count < 2 && group.index >= 0) return null
  const busy = snapshot.busy || activity
  return createElement('div', { className: 'mayori-answer-variants', 'data-answer-variant-group': group.groupId,
    'data-answer-variant-chat': revisions.sessionId },
    createElement('div', { className: 'mayori-greeting-swipes', 'aria-label': 'Варианты ответа' },
      createElement(IconButton, { label: 'Предыдущий вариант ответа', disabled: busy, onClick: () => { void swipe(-1) } }, '‹'),
      createElement('span', { role: 'status', 'aria-live': 'polite' }, `${group.index < 0 ? '—' : group.index + 1} / ${group.count}`),
      createElement(IconButton, { label: 'Следующий вариант ответа', disabled: busy, onClick: () => { void swipe(1) } }, '›')),
    error ? createElement('p', { role: 'alert', className: 'mayori-error' }, error) : null)
}

export function AnswerVariants({ revisions, seq, useSession, IconButton }) {
  const snapshot = useSyncExternalStore(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot)
  const group = snapshot.variants.find(group => group.replySeq === seq)
  return group ? createElement(AnswerVariantNavigation, { revisions, group, useSession, IconButton }) : null
}
