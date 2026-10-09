import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { remapChildProps } from '../../../client/infrastructure/slot-mirror.js'
import { GreetingMessage } from './greeting.jsx'
import { MessageRevisionControls, UserRevisionToolbar } from '../../message-revisions/client/controls.jsx'

function Avatar({ name, image }) {
  const dialog = useRef(null)
  const trigger = useRef(null)
  const titleId = useId()
  const [failed, setFailed] = useState(false)
  const [opened, setOpened] = useState(false)
  useEffect(() => { setFailed(false) }, [image])
  useEffect(() => { if (opened) dialog.current?.showModal() }, [opened])
  const portrait = image && !failed
  const close = () => { dialog.current?.close(); setOpened(false); trigger.current?.focus() }
  return <>
    <button ref={trigger} type="button" className="mayori-message-avatar" aria-label={`Открыть аватар: ${name}`}
      aria-haspopup="dialog" onClick={() => { setOpened(true) }} onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') event.stopPropagation()
      }}>
      {portrait ? <img src={image} alt="" onError={() => { setFailed(true) }} />
        : <span aria-hidden="true">{Array.from(name.trim())[0]?.toLocaleUpperCase() || '?'}</span>}
    </button>
    {opened && createPortal(<dialog ref={dialog} className="mayori-avatar-dialog" aria-labelledby={titleId}
      onClose={() => { setOpened(false); trigger.current?.focus() }}
      onCancel={event => { event.preventDefault(); close() }} onKeyDown={event => { event.stopPropagation() }} onClick={event => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close()
      }}>
      <div className="mayori-avatar-dialog-header">
        <h2 id={titleId}>{name}</h2>
        <button type="button" autoFocus onClick={close} aria-label="Закрыть аватар">×</button>
      </div>
      <div className="mayori-avatar-dialog-media">
        {portrait ? <img src={image} alt={`Аватар: ${name}`} onError={() => { setFailed(true) }} />
          : <p>Аватар пока не добавлен.</p>}
      </div>
    </dialog>, document.body)}
  </>
}

/** Keep the stock text column intact; use a separate row when its gutters cannot fit a portrait. */
function MessageWithAvatar({ assistant, name, image, children, actions }) {
  const row = useRef(null)
  const [placement, setPlacement] = useState('above')
  useEffect(() => {
    const element = row.current
    const viewport = element.ownerDocument.documentElement
    const view = element.ownerDocument.defaultView
    const clips = []
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const style = view.getComputedStyle(parent)
      if ([style.overflowX, style.overflowY].some(value => value !== 'visible')) clips.push(parent)
    }
    const measure = () => {
      let left = 0
      let right = viewport.clientWidth
      for (const clip of clips) {
        const bounds = clip.getBoundingClientRect()
        left = Math.max(left, bounds.left + clip.clientLeft)
        right = Math.min(right, bounds.left + clip.clientLeft + clip.clientWidth)
      }
      const bounds = element.getBoundingClientRect()
      // 44px portrait + 12px gap + room for the keyboard focus outline.
      setPlacement(bounds.left - left >= 60 && right - bounds.right >= 60 ? 'side' : 'above')
    }
    const observer = new view.ResizeObserver(measure)
    for (const target of [element, viewport, ...clips]) observer.observe(target)
    measure()
    return () => { observer.disconnect() }
  }, [])
  return <div ref={row} className={`mayori-message mayori-message-${assistant ? 'character' : 'user'}`}
    data-avatar-placement={placement}>
    {assistant && <Avatar name={name} image={image} />}
    <div className="mayori-message-content">{children}</div>
    {actions && <UserRevisionToolbar container={row}>{actions}</UserRevisionToolbar>}
    {!assistant && <Avatar name={name} image={image} />}
  </div>
}

/** Session snapshots own portraits; the stock renderer still owns message content. */
export function CharacterMessage({ stock, stockChildren, childPrefix, chatFor, revisionFor, ...props }) {
  const chat = chatFor(props.sessionId)
  const snapshot = useSyncExternalStore(chat.subscribe, chat.getSnapshot, chat.getSnapshot)
  const mapped = remapChildProps(props, stockChildren, childPrefix)
  const assistant = props.node.kind === 'assistant-step'
  const Stock = stock
  const content = assistant ? <GreetingMessage stock={Stock} chatFor={chatFor} {...mapped} /> : <Stock {...mapped} />
  if (!snapshot.value?.character) return content
  // DSH can render the same step twice: once in the process group and once
  // as its response. Only the response owns the portrait, never Think/tool rows.
  if (assistant) {
    if (props.groupPart === 'reasoning') return content
    const greeting = props.node.data.turn === 1 && props.node.data.step === 1
      && snapshot.value.greeting?.messageId === props.node.data.finalNode?.messageId
      ? snapshot.value.greeting : null
    const blocks = greeting ? [{ kind: 'text', text: greeting.text }] : props.node.data.blocks
    if (!blocks?.some(block => block.kind !== 'reasoning' && block.kind !== 'tool-call'
      && (block.kind !== 'text' || block.text.trim()))) return content
  }
  const person = assistant ? snapshot.value.character : snapshot.value.persona
  const name = person?.name || (assistant ? 'Персонаж' : 'Игрок')
  const seq = assistant ? props.node.data.finalNode?.seq : props.node.data.seq
  const editable = !assistant && revisionFor && props.useSession && Number.isSafeInteger(seq) && seq > 0
    && props.node.data.content?.some(block => block.type === 'text' && block.text.trim())
  return <MessageWithAvatar assistant={assistant} name={name} image={assistant ? person?.image : person?.avatar}
    actions={editable && <MessageRevisionControls revisions={revisionFor(props.sessionId)} seq={seq}
      useSession={props.useSession} canRepeat={false} />}>
    {content}
  </MessageWithAvatar>
}
