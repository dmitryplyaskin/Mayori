/** Mayori-owned replacement for the stock workspace/coding sidebar region. */
import { remapChildProps } from '../infrastructure/slot-mirror.js'
import { IconButton } from '../components/icon-button.jsx'
import { Tooltip } from '@deepseek-ai/dsh-client-ui-primitives'

export function MayoriMark({ className }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M17.75 4.9a7.85 7.85 0 1 0 1.35 12.55A8.8 8.8 0 0 1 9.4 5.7a7.8 7.8 0 0 1 8.35-.8Z"
        fill="currentColor"
      />
      <path
        d="m16.5 7.25.55 1.55 1.55.55-1.55.55-.55 1.55-.55-1.55-1.55-.55 1.55-.55.55-1.55Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function MayoriBrandName() {
  return <span>Mayori Engine</span>
}

/** Workspace-region occupant. Settings retains its own public slot. */
export function MayoriSidebar() {
  return null
}

/** The fully hidden desktop sidebar only needs its expand control. */
export function MayoriLeadingControls({ toggleSidebar, useShortcuts, t }) {
  const shortcut = useShortcuts(rows => rows.find(row => row.id === 'sidebar.left.toggle'))
  const label = t('toggle.open')
  return <IconButton className="mayori-navigation-toggle" label={label} side="right" delayMs={500} shortcutKeys={shortcut?.keys}
    aria-keyshortcuts={shortcut?.aria} onClick={() => toggleSidebar()}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" />
    </svg>
  </IconButton>
}

/** Each panel subscribes to selection through the sidebar's public runtime. */
function NavigationRow({ id, label, wide, usePanelInfo, selectPanel, renderSlot }) {
  const active = usePanelInfo(info => info.activePanelId === id)
  return (
    <Tooltip label={label} side="right" delayMs={500} disabled={wide}><button type="button" className="mayori-navigation-row" aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={() => selectPanel(id)}>
      <span className="mayori-navigation-glyph" aria-hidden="true">
        {renderSlot('sidebar.panellist', { size: wide ? 16 : 18, active }, { only: id })}
      </span>
      {wide && <span className="mayori-navigation-label">{label}</span>}
    </button></Tooltip>
  )
}

/** Public sidebar consumer: home navigation without a generic New Session action. */
export function MayoriNavigationSidebar(props) {
  const { stockChildren, childPrefix } = props
  const { collapsed, width, openHome, toggleSidebar, selectPanel,
    usePanels, usePanelInfo, useShortcuts, t, renderSlot } = remapChildProps(props, stockChildren, childPrefix)
  const panels = usePanels(snapshot => snapshot)
  const shortcut = useShortcuts(rows => rows.find(row => row.id === 'sidebar.left.toggle'))
  const wide = !collapsed
  const toggleLabel = t(collapsed ? 'toggle.open' : 'toggle.collapse')
  const toggleSide = globalThis.document?.documentElement?.hasAttribute('data-windows-titlebar') ? 'bottom' : 'right'
  return (
    <div className="mayori-navigation" data-collapsed={collapsed} style={wide ? { width } : undefined}>
      <div className="mayori-navigation-header" data-window-drag>
        {wide && <button type="button" className="mayori-navigation-brand" onClick={openHome}>
          <span aria-hidden="true">{renderSlot('sidebar.brand.mark', { size: 24 })}</span>
          <span className="mayori-navigation-name">{renderSlot('sidebar.brand.name', {})}</span>
        </button>}
        <IconButton className="mayori-navigation-toggle" label={toggleLabel} side={toggleSide} delayMs={500} shortcutKeys={shortcut?.keys}
          aria-keyshortcuts={shortcut?.aria} onClick={() => toggleSidebar()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" />
          </svg>
          {!wide && renderSlot('sidebar.toggle.badge', {})}
        </IconButton>
      </div>
      {panels.length > 0 && <nav className="mayori-navigation-panels" aria-label={t('panels.label')}>
        {panels.map(({ id, label }) => <NavigationRow key={id} id={id} label={label} wide={wide}
          usePanelInfo={usePanelInfo} selectPanel={selectPanel} renderSlot={renderSlot} />)}
      </nav>}
      <div className="mayori-navigation-region">
        {renderSlot('sidebar.workspaces', { wide, expandSidebar: () => { if (collapsed) toggleSidebar() } })}
      </div>
      <div className="mayori-navigation-footer">
        {renderSlot('sidebar.footer.action', { wide })}
        {renderSlot('sidebar.settings', { wide })}
      </div>
    </div>
  )
}
