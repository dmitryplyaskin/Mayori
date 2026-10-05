/** Mayori-owned replacement for the stock workspace/coding sidebar region. */

import { CharacterGalleryAction } from './gallery.jsx'

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

/** Workspace-region occupant. Stock shell geometry and Settings remain mounted. */
export function MayoriSidebar({ wide, library, startCharacter }) {
  return (
    <div className={`mayori-sidebar-shell${wide ? '' : ' mayori-sidebar-collapsed'}`}>
      <nav className="mayori-sidebar-navigation" aria-label="Основная навигация">
        <CharacterGalleryAction wide={wide} library={library} startCharacter={startCharacter} />
      </nav>
    </div>
  )
}
