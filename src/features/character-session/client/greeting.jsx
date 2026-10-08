import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { remapChildProps } from '../../../client/infrastructure/slot-mirror.js'
import { AssistantRevisionActions } from '../../message-revisions/client/controls.jsx'

/** Keep the shipped Markdown renderer; only authored greetings use the Host view. */
export function GreetingMessage({ stock: Stock, chatFor, ...props }) {
  const possibleGreeting = props.node.data.turn === 1 && props.node.data.step === 1 && props.node.data.finalNode
  return possibleGreeting ? <AuthoredGreeting stock={Stock} chatFor={chatFor} {...props} /> : <Stock {...props} />
}

function AuthoredGreeting({ stock: Stock, chatFor, ...props }) {
  const chat = chatFor(props.sessionId)
  const snapshot = useSyncExternalStore(chat.subscribe, chat.getSnapshot, chat.getSnapshot)
  const activity = props.useSession(state => state.running || state.pendingSubmissions.length > 0 || state.awaitingFirstTurn)
  const attempted = props.useSession(state => state.promptAttempted)
  const started = props.useChat(state => state.timeline.turnOrder.some(turn => turn > 1))
  const pending = useRef(false)
  const [error, setError] = useState('')
  useEffect(() => { void chat.refresh() }, [chat, activity, attempted, started])
  const candidate = snapshot.value?.greeting
  const greeting = candidate?.messageId === props.node.data.finalNode?.messageId ? candidate : null
  const node = greeting ? { ...props.node, data: { ...props.node.data,
    blocks: greeting.text.trim() ? [{ kind: 'text', text: greeting.text }] : [] } } : props.node
  const swipe = async direction => {
    if (pending.current || activity || !greeting) return
    pending.current = true; setError('')
    try { await chat.swipe((greeting.index + direction + greeting.count) % greeting.count) }
    catch (failure) { setError(failure.message) }
    finally { pending.current = false }
  }
  return <div className="mayori-greeting-message">
    <Stock {...props} node={node} />
    {greeting?.canSwipe && greeting.count > 1 && !activity && !started && <div className="mayori-greeting-swipes" aria-label="Варианты приветствия">
      <button type="button" aria-label="Предыдущее приветствие" disabled={snapshot.status === 'saving'} onClick={() => { void swipe(-1) }}>‹</button>
      <span role="status" aria-live="polite">{greeting.index + 1} / {greeting.count}</span>
      <button type="button" aria-label="Следующее приветствие" disabled={snapshot.status === 'saving'} onClick={() => { void swipe(1) }}>›</button>
    </div>}
    {(error || snapshot.error) && <p role="alert" className="mayori-error">{error || snapshot.error}</p>}
  </div>
}

/** Copy and fork actions refer to the selected greeting, including logged swipes. */
export function GreetingTurnTail({ stock: Stock, stockChildren, childPrefix, chatFor, revisionFor, ...props }) {
  const mapped = remapChildProps(props, stockChildren, childPrefix)
  const render = mapped.renderSlot
  mapped.renderSlot = (name, owner, options) => name === 'conversation.chat.assistant-actions'
    ? <>{render(name, owner, options)}<AssistantRevisionActions chatFor={chatFor} revisionFor={revisionFor}
      sessionId={props.sessionId} closing={props.node.data.closing} useSession={props.useSession} turn={props.node.data.turn} /></>
    : render(name, owner, options)
  return props.node.data.turn === 1 && props.node.data.closing
    ? <AuthoredGreetingTail stock={Stock} chatFor={chatFor} {...mapped} /> : <Stock {...mapped} />
}

function AuthoredGreetingTail({ stock: Stock, chatFor, ...props }) {
  const chat = chatFor(props.sessionId)
  const snapshot = useSyncExternalStore(chat.subscribe, chat.getSnapshot, chat.getSnapshot)
  const greeting = snapshot.value?.greeting
  if (greeting?.messageId !== props.node.data.closing.finalNode.messageId) return <Stock {...props} />
  const blocks = greeting.text.trim() ? [{ kind: 'text', text: greeting.text }] : []
  const node = { ...props.node, data: { ...props.node.data,
    seq: Math.max(props.node.data.seq, greeting.eventSeq ?? 0),
    closing: { ...props.node.data.closing, blocks,
      finalNode: { ...props.node.data.closing.finalNode, blocks } } } }
  return <Stock {...props} node={node} />
}
