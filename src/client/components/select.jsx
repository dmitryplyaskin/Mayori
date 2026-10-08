import { useId, useState } from 'react'
import { IconChevronDownOutlineRegular, Menu } from '@deepseek-ai/dsh-client-ui-primitives'

/** DSH's shared menu owns placement, keyboard navigation, dismissal and focus return. */
export function Select({ value, options, onChange, disabled = false, portal = true, id, 'aria-label': label, 'aria-describedby': description }) {
  const [open, setOpen] = useState(false)
  const selectedLabelId = useId()
  const selectedId = String(value)
  const items = options.map(option => ({ id: String(option.value), label: <span data-mayori-option={String(option.value)}>{option.label}</span>, disabled: option.disabled }))
  const selected = items.find(option => option.id === selectedId)
  return <Menu className="mayori-select" open={open && !disabled} portal={portal} autoFocus items={items} selectedId={selectedId}
    onClose={() => setOpen(false)} onSelect={next => { setOpen(false); if (next !== selectedId) onChange(next) }}
    anchor={<button id={id} type="button" className="mayori-select-trigger" disabled={disabled} data-value={selectedId}
      aria-label={label} aria-describedby={`${selectedLabelId}${description ? ` ${description}` : ''}`} aria-haspopup="menu" aria-expanded={open && !disabled}
      onClick={() => setOpen(previous => !previous)} onKeyDown={event => {
        if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) { event.preventDefault(); setOpen(true) }
      }}><span id={selectedLabelId}>{selected?.label ?? ''}</span><IconChevronDownOutlineRegular /></button>} />
}
