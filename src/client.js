/** Mayori browser plugin: custom RPG sidebar plus the Character Library UI. */

import { RemoteCharacterLibraryProvider } from './character-library.js'
import { MayoriSidebar } from './sidebar.jsx'

export const inject = ['slots', 'layout']

/** Plugin-owned style; removed with the client fiber. */
export const BRAND_STYLE = String.raw`
.mayori-sidebar-shell {
  display: flex; flex: 1; min-block-size: 0; flex-direction: column;
  color: var(--dsw-alias-label-primary); font-size: 14px; overflow: hidden;
}
/* ui-sidebar has no brand/new-action seats. Once the public workspace region
   is occupied by Mayori, remove those two stock chrome rows and let this
   region supply the brand and toggle. Settings remains in its native seat. */
div:has(> div > div > .mayori-sidebar-shell) > :nth-child(1),
div:has(> div > div > .mayori-sidebar-shell) > :nth-child(2) { display: none; }
div:has(> div > .mayori-sidebar-shell),
div:has(> .mayori-sidebar-shell) {
  margin-inline: 0; padding-inline: 0; overflow: visible;
}
.mayori-sidebar-header {
  display: flex; flex: none; align-items: center; justify-content: flex-end; gap: 8px;
  block-size: 60px; box-sizing: border-box; margin-block-end: 16px; padding: 8px 0 8px 4px;
  overflow: hidden;
}
.mayori-sidebar-collapsed .mayori-sidebar-header {
  justify-content: flex-start; block-size: 36px; margin-block-end: 20px; padding: 0;
}
.mayori-brand { display: flex; flex: 1; align-items: center; min-inline-size: 0; overflow: hidden; }
.mayori-brand-mark {
  display: inline-grid; place-items: center; flex: none; inline-size: 32px; block-size: 32px;
  margin-inline-end: 10px; border-radius: 10px; background: var(--dsw-alias-label-primary);
  color: var(--dsw-specific-sidebar-fill);
}
.mayori-brand-name {
  overflow: hidden; font-size: 20px; font-weight: 650; line-height: 1;
  letter-spacing: -0.035em; text-overflow: ellipsis; white-space: nowrap;
}
.mayori-brand-engine {
  flex: none; align-self: flex-end; margin-block-end: 5px; margin-inline-start: 6px;
  color: var(--dsw-alias-label-secondary); font-size: 10px; font-weight: 600;
  line-height: 1; letter-spacing: 0.08em; text-transform: uppercase;
}
.mayori-sidebar-toggle {
  position: relative; display: inline-flex; align-items: center; justify-content: center; flex: none;
  inline-size: 36px; block-size: 36px; padding: 0; border: 0; border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.mayori-sidebar-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-sidebar-collapsed .mayori-sidebar-toggle { color: var(--dsw-alias-label-primary); }
.mayori-sidebar-collapsed .mayori-sidebar-panel-icon { display: none; }
.mayori-sidebar-collapsed .mayori-sidebar-toggle:hover .mayori-sidebar-panel-icon { display: block; }
.mayori-sidebar-collapsed .mayori-sidebar-toggle:hover .mayori-sidebar-rail-mark { display: none; }
.mayori-sidebar-navigation {
  display: flex; flex: 1; min-block-size: 0; flex-direction: column; gap: 8px;
  margin-inline: -2px; overflow-x: hidden; overflow-y: auto;
}
.mayori-sidebar-collapsed .mayori-sidebar-navigation {
  align-items: center; inline-size: auto; margin-inline: 0;
}
.mayori-sidebar-shell button:focus-visible,
.mayori-gallery-dialog button:focus-visible,
.mayori-gallery-dialog input:focus-visible,
.mayori-gallery-dialog select:focus-visible,
.mayori-character-dialog button:focus-visible,
.mayori-import-button:has(input:focus-visible) {
  outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px;
}
.mayori-gallery-trigger {
  display: flex; align-items: center; justify-content: flex-start; gap: 8px;
  inline-size: 100%; block-size: 42px; box-sizing: border-box;
  margin: 4px 0; padding: 0 10px 0 8px; border: 0; border-radius: 12px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit;
  font-size: 14px; line-height: 22px; cursor: pointer; overflow: hidden;
}
.mayori-gallery-trigger:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-gallery-trigger > svg { flex: none; inline-size: 16px; block-size: 16px; }
.mayori-gallery-trigger:has(> svg:only-child) {
  justify-content: center; inline-size: 36px; block-size: 36px; margin: 8px 0 10px;
  padding: 0; border-radius: 50%; color: var(--dsw-alias-label-primary);
}
.mayori-gallery-trigger:has(> svg:only-child) > svg { inline-size: 18px; block-size: 18px; }
.mayori-gallery-dialog {
  inset: 0; inline-size: 100vw; max-inline-size: none; block-size: 100dvh; max-block-size: none;
  margin: 0; padding: 0; border: 0; border-radius: 0;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
  color: var(--dsw-alias-label-primary); overflow: hidden;
}
.mayori-gallery-dialog::backdrop { background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); }
.mayori-gallery-shell { display: grid; grid-template-rows: 72px minmax(0, 1fr); block-size: 100%; }
.mayori-gallery-header {
  position: relative; z-index: 4; display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 12px 20px 12px 24px; border-block-end: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
}
.mayori-gallery-header h2, .mayori-gallery-header p, .mayori-card h3, .mayori-card p,
.mayori-empty h3, .mayori-empty p, .mayori-character-header h2, .mayori-character-header p { margin: 0; }
.mayori-gallery-title { min-inline-size: 0; }
.mayori-gallery-title h2 { font-size: 24px; line-height: 1.15; letter-spacing: -0.02em; }
.mayori-gallery-title p { margin-block-start: 3px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-gallery-header-actions { display: flex; align-items: center; gap: 8px; }
.mayori-icon-action {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  inline-size: 40px; block-size: 40px; padding: 0; border: 0; border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.mayori-icon-action:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-filter-toggle {
  display: none; align-items: center; justify-content: center; gap: 8px; min-block-size: 40px;
  padding: 0 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit; cursor: pointer;
}
.mayori-gallery-workspace { position: relative; display: grid; grid-template-columns: 280px minmax(0, 1fr); min-block-size: 0; }
.mayori-filter-panel {
  display: flex; min-block-size: 0; flex-direction: column; gap: 24px; padding: 24px 20px;
  border-inline-end: 1px solid var(--dsw-alias-border-l2); overflow-y: auto; overscroll-behavior: contain;
  background: var(--dsw-alias-bg-l2, var(--dsw-specific-sidebar-fill));
}
.mayori-filter-panel-header { display: none; align-items: center; justify-content: space-between; gap: 16px; }
.mayori-filter-panel-header h3 { margin: 0; font-size: 18px; }
.mayori-import-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-block-size: 42px;
  padding: 9px 16px; border-radius: 12px; background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); font-size: 14px;
  font-weight: 600; cursor: pointer;
}
.mayori-import-button[aria-disabled="true"] { opacity: 0.58; cursor: progress; }
.mayori-import-compact { display: none; min-block-size: 40px; padding: 8px 12px; border-radius: 10px; }
.mayori-import-button input {
  position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}
.mayori-filter-fields { display: grid; gap: 24px; }
.mayori-search, .mayori-filter-control { display: grid; gap: 7px; color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; }
.mayori-search-control { position: relative; display: flex; align-items: center; }
.mayori-search-control > svg { position: absolute; inset-inline-start: 12px; inline-size: 18px; block-size: 18px; pointer-events: none; }
.mayori-search input, .mayori-filter-control select {
  inline-size: 100%; min-block-size: 42px; box-sizing: border-box; padding: 9px 12px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 16px;
}
.mayori-search input { padding-inline-start: 38px; }
.mayori-filter-group { display: grid; gap: 10px; margin: 0; padding: 0; border: 0; }
.mayori-filter-group legend { margin-block-end: 8px; color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; }
.mayori-filter-group label {
  display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; align-items: center; gap: 8px;
  min-block-size: 32px; color: var(--dsw-alias-label-primary); cursor: pointer;
}
.mayori-filter-group input { inline-size: 16px; block-size: 16px; margin: 0; accent-color: currentColor; }
.mayori-tag-filter > div { display: grid; max-block-size: 220px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-tag-filter small { color: var(--dsw-alias-label-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }
.mayori-reset-button {
  min-block-size: 40px; padding: 8px 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; cursor: pointer;
}
.mayori-reset-button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-gallery-main { min-inline-size: 0; min-block-size: 0; padding: 20px 24px 32px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-gallery-results { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-block-size: 30px; }
.mayori-gallery-results p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-gallery-notice { min-block-size: 28px; padding-block: 2px 10px; font-size: 13px; }
.mayori-gallery-notice p { margin: 0; }
.mayori-error, .mayori-card-warning { color: var(--dsw-alias-label-error, #b42318); }
.mayori-success { color: var(--dsw-alias-label-success, #16794b); }
.mayori-card-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  align-items: stretch; gap: 18px; margin: 0; padding: 0; list-style: none;
}
.mayori-card article {
  display: grid; grid-template-rows: auto minmax(0, 1fr); block-size: 100%; overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px;
  background: var(--dsw-alias-bg-l2, var(--dsw-specific-sidebar-fill));
}
.mayori-card-media {
  position: relative; display: grid; place-items: center; aspect-ratio: 4 / 5;
  overflow: hidden; background: var(--dsw-alias-interactive-bg-hover);
}
.mayori-card-media img {
  inline-size: 100%; block-size: 100%; object-fit: cover;
  outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px;
}
body[data-ds-dark-theme] .mayori-card-media img { outline-color: oklch(1 0 0 / 0.1); }
.mayori-card-fallback {
  display: grid; place-items: center; inline-size: 72px; block-size: 72px; border-radius: 50%;
  background: var(--dsw-alias-button-elevated-fill); font-size: 32px; font-weight: 600;
}
.mayori-card-body { display: grid; grid-template-rows: auto auto 1fr; gap: 12px; padding: 14px; }
.mayori-card-heading { min-inline-size: 0; }
.mayori-card-heading h3 { overflow-wrap: anywhere; font-size: 17px; line-height: 1.3; }
.mayori-card-heading p { margin-block-start: 4px; overflow: hidden; color: var(--dsw-alias-label-secondary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.mayori-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.mayori-tags li {
  max-inline-size: 100%; overflow: hidden; padding: 4px 8px; border-radius: 999px;
  background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary);
  font-size: 11px; text-overflow: ellipsis; white-space: nowrap;
}
.mayori-card-actions { display: grid; grid-template-columns: 1fr 1fr; align-self: end; gap: 8px; }
.mayori-card-actions button, .mayori-secondary-button, .mayori-danger-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-block-size: 40px;
  padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
}
.mayori-card-actions button > svg, .mayori-danger-button > svg { inline-size: 17px; block-size: 17px; }
.mayori-card-play { background: var(--dsw-alias-label-primary) !important; color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)) !important; border-color: transparent !important; }
.mayori-card-edit:hover, .mayori-secondary-button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-empty {
  display: grid; place-items: center; align-content: center; min-block-size: 280px;
  padding: 32px; text-align: center; color: var(--dsw-alias-label-secondary);
}
.mayori-empty h3 { margin-block-start: 14px; color: var(--dsw-alias-label-primary); }
.mayori-empty p { margin-block-start: 6px; max-inline-size: 40ch; line-height: 1.5; }
.mayori-empty-icon {
  display: grid; place-items: center; inline-size: 52px; block-size: 52px;
  border-radius: 16px; background: var(--dsw-alias-interactive-bg-hover);
}
.mayori-character-dialog {
  inline-size: min(920px, calc(100vw - 32px)); max-inline-size: none;
  block-size: min(760px, calc(100dvh - 32px)); max-block-size: none;
  margin: auto; padding: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 18px;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); color: var(--dsw-alias-label-primary);
  overflow: hidden; box-shadow: 0 24px 64px oklch(0 0 0 / 0.28), 0 2px 8px oklch(0 0 0 / 0.14);
}
.mayori-character-dialog::backdrop { background: oklch(0 0 0 / 0.56); }
.mayori-character-shell { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; block-size: 100%; }
.mayori-character-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px 20px 16px 24px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-character-header h2 { overflow-wrap: anywhere; font-size: 24px; line-height: 1.2; }
.mayori-character-header p { margin-block-start: 5px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-character-content { display: grid; grid-template-columns: minmax(220px, 34%) minmax(0, 1fr); min-block-size: 0; overflow: hidden; }
.mayori-character-portrait { display: grid; place-items: center; min-block-size: 0; overflow: hidden; background: var(--dsw-alias-interactive-bg-hover); }
.mayori-character-portrait img { inline-size: 100%; block-size: 100%; object-fit: cover; outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px; }
body[data-ds-dark-theme] .mayori-character-portrait img { outline-color: oklch(1 0 0 / 0.1); }
.mayori-character-details { min-inline-size: 0; padding: 24px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-character-details > .mayori-tags { margin-block-end: 24px; }
.mayori-card-warning { margin: 0 0 20px; font-size: 12px; line-height: 1.5; }
.mayori-character-details dl { display: grid; gap: 24px; margin: 0; }
.mayori-character-details dl > div { display: grid; gap: 7px; }
.mayori-character-details dt { color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; }
.mayori-character-details dd { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; line-height: 1.55; }
.mayori-character-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-block-start: 32px !important; padding-block-start: 20px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-character-meta dd { color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-character-empty { color: var(--dsw-alias-label-secondary); }
.mayori-character-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px 14px 24px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-danger-button { border-color: color-mix(in oklch, currentColor 28%, transparent); color: var(--dsw-alias-label-error, #b42318); }
.mayori-danger-button:hover { background: color-mix(in oklch, currentColor 10%, transparent); }
.mayori-filter-scrim { display: none; }
@media (max-width: 900px) {
  .mayori-gallery-workspace { grid-template-columns: minmax(0, 1fr); }
  .mayori-filter-toggle { display: inline-flex; }
  .mayori-import-compact { display: inline-flex; }
  .mayori-filter-panel {
    position: absolute; z-index: 6; inset-block: 0; inset-inline-start: 0; inline-size: min(320px, calc(100vw - 48px));
    box-sizing: border-box; border-inline-end: 1px solid var(--dsw-alias-border-l2);
    box-shadow: 16px 0 40px oklch(0 0 0 / 0.2); transform: translateX(-105%); visibility: hidden;
  }
  .mayori-filter-panel.is-open { transform: translateX(0); visibility: visible; }
  .mayori-filter-panel-header { display: flex; }
  .mayori-filter-scrim { position: absolute; z-index: 5; inset: 0; display: block; border: 0; background: oklch(0 0 0 / 0.42); }
  .mayori-character-content { grid-template-columns: minmax(180px, 32%) minmax(0, 1fr); }
}
@media (max-width: 620px) {
  .mayori-gallery-shell { grid-template-rows: 64px minmax(0, 1fr); }
  .mayori-gallery-header { padding-inline: 16px 12px; }
  .mayori-gallery-title h2 { font-size: 20px; }
  .mayori-gallery-title p { display: none; }
  .mayori-filter-toggle span, .mayori-import-compact span { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
  .mayori-filter-toggle, .mayori-import-compact { inline-size: 40px; padding: 0; }
  .mayori-gallery-main { padding: 16px 16px 28px; }
  .mayori-card-grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr)); gap: 12px; }
  .mayori-character-dialog { inset: 0; inline-size: 100vw; block-size: 100dvh; margin: 0; border: 0; border-radius: 0; }
  .mayori-character-content { display: block; overflow-y: auto; }
  .mayori-character-portrait { aspect-ratio: 16 / 10; }
  .mayori-character-details { overflow: visible; }
  .mayori-character-meta { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: no-preference) {
  .mayori-icon-action:active, .mayori-import-button:active, .mayori-card-actions button:active,
  .mayori-secondary-button:active, .mayori-danger-button:active { transform: scale(0.96); }
  .mayori-filter-panel { transition-property: transform, visibility; transition-duration: 160ms; transition-timing-function: ease-out; }
}
`

/** Register reversible browser contributions through Cordis. */
export function apply(ctx) {
  const library = new RemoteCharacterLibraryProvider()
  ctx.provide('mayoriCharacters', library)

  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = 'dsh-mayori'
    style.dataset.mayori = 'client'
    style.textContent = BRAND_STYLE
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'mayori: client styles')

  // Shadow only the public workspace/session region. The stock shell keeps
  // its fold-state machine and Settings seat; unload reveals WorkspaceBrowser.
  ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({
    name: 'sidebar.workspaces',
    priority: -100,
    inject: () => ({
      library,
      toggleSidebar: () => { ctx.layout.toggleSidebar() },
    }),
  }, MayoriSidebar))
}
