/** Mayori-owned replacement for the stock workspace/coding sidebar region. */

import { useEffect, useRef } from 'react'

import { CharacterGalleryAction } from './gallery.jsx'

function MayoriMark({ className }) {
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

function PanelIcon({ className }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="4" width="17" height="16" rx="2" />
      <path d="M9 4v16" />
    </svg>
  )
}

/** Workspace-region occupant. Stock shell geometry and Settings remain mounted. */
export function MayoriSidebar({ wide, toggleSidebar, library }) {
  const shellRef = useRef(null)
  useEffect(() => {
    if (wide) return undefined
    const stockRoot = shellRef.current?.parentElement?.parentElement?.parentElement
    const settingsButton = stockRoot?.lastElementChild?.querySelector('button')
    if (settingsButton === undefined || settingsButton === null) return undefined
    if (settingsButton.hasAttribute('aria-label') || settingsButton.textContent.trim() !== '') return undefined
    settingsButton.dataset.mayoriAccessibleLabel = 'true'
    settingsButton.setAttribute('aria-label', 'Настройки')
    return () => {
      if (settingsButton.dataset.mayoriAccessibleLabel !== 'true') return
      settingsButton.removeAttribute('data-mayori-accessible-label')
      settingsButton.removeAttribute('aria-label')
    }
  }, [wide])

  return (
    <div ref={shellRef} className={`mayori-sidebar-shell${wide ? '' : ' mayori-sidebar-collapsed'}`}>
      <header className="mayori-sidebar-header">
        {wide && (
          <div className="mayori-brand">
            <span className="mayori-brand-mark"><MayoriMark /></span>
            <span className="mayori-brand-name">Mayori</span>
            <span className="mayori-brand-engine">Engine</span>
          </div>
        )}
        <button
          type="button"
          className="mayori-sidebar-toggle"
          aria-label={wide ? 'Свернуть боковую панель' : 'Развернуть боковую панель'}
          title={wide ? 'Свернуть боковую панель' : 'Развернуть боковую панель'}
          onClick={() => { toggleSidebar() }}
        >
          {!wide && <MayoriMark className="mayori-sidebar-rail-mark" />}
          <PanelIcon className="mayori-sidebar-panel-icon" />
        </button>
      </header>

      <nav className="mayori-sidebar-navigation" aria-label="Основная навигация">
        <CharacterGalleryAction wide={wide} library={library} />
      </nav>
    </div>
  )
}
