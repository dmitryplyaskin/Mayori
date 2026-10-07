import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { remapChildProps } from '../../../client/infrastructure/slot-mirror.js'
import { GreetingMessage } from './greeting.jsx'

function Avatar({ name, image }) {
  const dialog = useRef(null)
  const trigger = useRef(null)
  const titleId = useId()
  const [failed, setFailed] = useState(false)
  const [opened, setOpened] = useState(false)
  useEffect(() => { setFailed(false) }, [image])
  useEffect(() => { if (opened) dialog.current?.showModal() }, [opened])
  const portrait = image && !failed
  const close = () => { dialog.current?.close() }
  return <>
    <button ref={trigger} type="button" className="mayori-message-avatar" aria-label={`Открыть аватар: ${name}`}
      aria-haspopup="dialog" onClick={() => { setOpened(true) }}>
      {portrait ? <img src={image} alt="" onError={() => { setFailed(true) }} />
        : <span aria-hidden="true">{Array.from(name.trim())[0]?.toLocaleUpperCase() || '?'}</span>}
    </button>
    {opened && createPortal(<dialog ref={dialog} className="mayori-avatar-dialog" aria-labelledby={titleId}
      onClose={() => { setOpened(false); trigger.current?.focus() }} onClick={event => {
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

/** Session snapshots own portraits; the stock renderer still owns message content. */
export function CharacterMessage({ stock, stockChildren, childPrefix, chatFor, ...props }) {
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
  return <div className={`mayori-message mayori-message-${assistant ? 'character' : 'user'}`}>
    {assistant && <Avatar name={name} image={person?.image} />}
    <div className="mayori-message-content">{content}</div>
    {!assistant && <Avatar name={name} image={person?.avatar} />}
  </div>
}
