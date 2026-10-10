import { useEffect, useId, useRef, useState } from 'react'
import { IconButton } from '../../../client/components/icon-button.jsx'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'
import { IconCloseOutlineRegular, IconPersonalizationOutlineMedium, IconSettingsOutlineMedium, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { MayoriSettings } from '../../plugins/client/panel.jsx'

const tabs = [['general', 'Основные', IconSettingsOutlineMedium], ['plugins', 'Плагины', IconPersonalizationOutlineMedium]]

/** Independent settings entry; the native DSH settings consumer keeps its own state. */
export function MayoriSettingsLauncher({ wide, preferences }) {
  const [open, setOpen] = useState(false)
  return <>
    <Tooltip label="Настройки Mayori" side="right" disabled={wide} portal><button type="button" className="mayori-navigation-row mayori-settings-trigger" aria-label="Настройки Mayori"
      aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <span className="mayori-navigation-glyph" aria-hidden="true"><IconPersonalizationOutlineMedium size={wide ? 16 : 18} /></span>
      {wide && <span className="mayori-navigation-label">Настройки Mayori</span>}
    </button></Tooltip>
    {open && <MayoriSettingsModal preferences={preferences} onClose={() => setOpen(false)} />}
  </>
}

function MayoriSettingsModal({ preferences, onClose }) {
  const [active, setActive] = useState('general')
  const [horizontal, setHorizontal] = useState(false)
  const tablist = useRef(null)
  const id = useId()
  useEffect(() => {
    const query = window.matchMedia('(max-width: 600px)')
    const update = () => setHorizontal(query.matches)
    update(); query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const navigate = event => {
    const previous = horizontal ? 'ArrowLeft' : 'ArrowUp'
    const next = horizontal ? 'ArrowRight' : 'ArrowDown'
    if (![previous, next, 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const index = tabs.findIndex(([key]) => key === active)
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
      : (index + (event.key === next ? 1 : -1) + tabs.length) % tabs.length
    setActive(tabs[target][0]); tablist.current?.querySelectorAll('[role="tab"]')[target]?.focus()
  }
  return <Modal open headless title="Настройки Mayori" onClose={onClose} className="mayori-settings-modal">
    <div className="mayori-settings-nav">
      <h1>Настройки Mayori</h1>
      <div ref={tablist} className="mayori-settings-tabs" role="tablist" aria-label="Разделы настроек Mayori"
        aria-orientation={horizontal ? 'horizontal' : 'vertical'} onKeyDown={navigate}>
        {tabs.map(([key, label, Icon]) => <button key={key} type="button" role="tab" id={`${id}-${key}-tab`}
          aria-selected={active === key} aria-controls={`${id}-${key}-panel`} tabIndex={active === key ? 0 : -1}
          data-modal-autofocus={active === key ? '' : undefined} onClick={() => setActive(key)}>
          <Icon size={16} /><span>{label}</span>
        </button>)}
      </div>
    </div>
    <div className="mayori-settings-content">
      <div className="mayori-settings-header">
        <IconButton label="Закрыть настройки Mayori" onClick={onClose}><IconCloseOutlineRegular size={14} /></IconButton>
      </div>
      <div className="mayori-settings-options">
        <div role="tabpanel" id={`${id}-general-panel`} aria-labelledby={`${id}-general-tab`} hidden={active !== 'general'} tabIndex={0} />
        <div role="tabpanel" id={`${id}-plugins-panel`} aria-labelledby={`${id}-plugins-tab`} hidden={active !== 'plugins'} tabIndex={0}>
          <MayoriSettings preferences={preferences} />
        </div>
      </div>
    </div>
  </Modal>
}

export const SETTINGS_MODAL_STYLE = `
.mayori-settings-modal { inline-size: min(1200px, 100%); block-size: 800px; max-block-size: 100%; flex-direction: row; gap: 0; padding: 0; color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-settings-nav { flex: 0 0 188px; padding: 22px 12px 0; box-sizing: border-box; }
.mayori-settings-nav h1 { margin: 0 0 18px; padding-inline: 12px; font-size: 16px; line-height: 24px; font-weight: 500; }
.mayori-settings-tabs { display: flex; flex-direction: column; gap: 4px; }
.mayori-settings-tabs button { display: flex; align-items: center; gap: 8px; min-block-size: 40px; padding: 9px 12px; border: 0; border-radius: var(--dsw-radius-md, 12px); background: transparent; color: inherit; font: inherit; font-size: 14px; text-align: start; cursor: pointer; }
.mayori-settings-tabs button:hover { background: var(--dsw-specific-sidebar-nav-item-hover, color-mix(in srgb, currentColor 6%, transparent)); }
.mayori-settings-tabs button[aria-selected="true"] { background: var(--dsw-specific-sidebar-nav-item-active, color-mix(in srgb, currentColor 10%, transparent)); }
.mayori-settings-tabs svg { flex: none; }
.mayori-settings-content { flex: 1; min-inline-size: 0; min-block-size: 0; display: flex; flex-direction: column; }
.mayori-settings-header { flex: none; display: flex; justify-content: flex-end; padding: 16px 14px 8px; }
.mayori-settings-header button { display: inline-flex; align-items: center; justify-content: center; inline-size: 32px; block-size: 32px; padding: 0; border: 0; border-radius: var(--dsw-radius-sm, 8px); background: transparent; color: inherit; cursor: pointer; }
.mayori-settings-header button:hover { background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 6%, transparent)); }
.mayori-settings-options { flex: 1; min-block-size: 0; padding: 0 24px 24px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-settings-modal :is(button, input, summary, [role="tabpanel"]):focus-visible { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: 3px; }
.mayori-settings-trigger { inline-size: 100%; }
@media (max-width: 600px) {
  .mayori-settings-modal { flex-direction: column; }
  .mayori-settings-nav { flex: none; padding: 16px 12px 0; }
  .mayori-settings-nav h1 { padding-inline-end: 36px; margin-block-end: 12px; }
  .mayori-settings-tabs { flex-direction: row; }
  .mayori-settings-tabs button { flex: 1; }
  .mayori-settings-header { padding-block-start: 4px; }
  .mayori-settings-options { padding-inline: 16px; }
}
`
