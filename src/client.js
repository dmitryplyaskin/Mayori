/** Mayori browser plugin: branding plus the Character Library UI consumer. */

import { IndexedDbCharacterLibraryProvider } from './character-library.js'
import { CharacterGalleryAction } from './gallery.jsx'

export const inject = ['slots']

/** Plugin-owned style; removed with the client fiber. */
export const BRAND_STYLE = String.raw`
button:has(> svg[viewBox="0 0 182 24"][aria-hidden="true"]) > svg[viewBox="0 0 182 24"] { display: none; }
button:has(> svg[viewBox="0 0 182 24"][aria-hidden="true"])::before {
  content: "Mayori"; color: inherit; font: inherit; font-size: 24px; font-weight: 600;
  line-height: 1; letter-spacing: -0.04em; white-space: nowrap;
}
.mayori-gallery-trigger {
  display: inline-flex; align-items: center; justify-content: flex-start; gap: 10px;
  inline-size: 100%; min-block-size: 40px; padding: 8px 10px; border: 0; border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; cursor: pointer;
}
.mayori-gallery-trigger:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-gallery-trigger:active { transform: scale(0.96); }
.mayori-gallery-trigger:has(> svg:only-child) {
  justify-content: center; inline-size: 36px; min-block-size: 36px; padding: 0;
  color: var(--dsw-alias-label-primary);
}
.mayori-gallery-trigger:focus-visible,
.mayori-gallery-dialog button:focus-visible,
.mayori-gallery-dialog input:focus-visible,
.mayori-gallery-dialog summary:focus-visible,
.mayori-import-button:has(input:focus-visible) {
  outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px;
}
.mayori-gallery-dialog {
  inline-size: min(1120px, calc(100vw - 32px)); max-inline-size: none;
  block-size: min(780px, calc(100dvh - 32px)); max-block-size: none;
  margin: auto; padding: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 20px;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
  color: var(--dsw-alias-label-primary); overflow: hidden;
  box-shadow: 0 24px 64px oklch(0 0 0 / 0.24), 0 2px 8px oklch(0 0 0 / 0.12);
}
.mayori-gallery-dialog::backdrop { background: oklch(0 0 0 / 0.48); backdrop-filter: blur(2px); }
.mayori-gallery-shell { display: grid; grid-template-rows: auto auto auto minmax(0, 1fr); block-size: 100%; }
.mayori-gallery-header {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 24px;
  padding: 24px 24px 12px;
}
.mayori-gallery-header h2, .mayori-gallery-header p, .mayori-card h3, .mayori-card p,
.mayori-empty h3, .mayori-empty p { margin: 0; }
.mayori-gallery-header h2 { font-size: clamp(22px, 3vw, 30px); line-height: 1.2; }
.mayori-gallery-kicker {
  margin-block-end: 4px !important; color: var(--dsw-alias-label-secondary); font-size: 12px;
  font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
}
.mayori-icon-action {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  inline-size: 40px; block-size: 40px; padding: 0; border: 0; border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.mayori-icon-action:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-icon-action:active, .mayori-import-button:active { transform: scale(0.96); }
.mayori-gallery-toolbar { display: flex; align-items: end; gap: 16px; padding: 12px 24px; }
.mayori-import-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-block-size: 42px;
  padding: 9px 16px; border-radius: 12px; background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); font-size: 14px;
  font-weight: 600; cursor: pointer;
}
.mayori-import-button[aria-disabled="true"] { opacity: 0.58; cursor: progress; }
.mayori-import-button input {
  position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}
.mayori-search {
  display: grid; flex: 1; gap: 6px; max-inline-size: 420px;
  color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 500;
}
.mayori-search input {
  inline-size: 100%; min-block-size: 42px; box-sizing: border-box; padding: 9px 12px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: transparent;
  color: var(--dsw-alias-label-primary); font: inherit; font-size: 16px;
}
.mayori-gallery-status {
  min-block-size: 32px; padding: 0 24px 8px; color: var(--dsw-alias-label-secondary); font-size: 13px;
}
.mayori-gallery-status p { margin: 0; }
.mayori-error, .mayori-card-warning { color: var(--dsw-alias-label-error, #b42318); }
.mayori-success { color: var(--dsw-alias-label-success, #16794b); }
.mayori-gallery-content {
  min-block-size: 0; padding: 8px 24px 24px; overflow: auto; overscroll-behavior: contain;
}
.mayori-card-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr));
  gap: 20px; margin: 0; padding: 0; list-style: none;
}
.mayori-card article {
  block-size: 100%; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 16px; background: var(--dsw-alias-bg-l2, var(--dsw-specific-sidebar-fill));
}
.mayori-card-media {
  position: relative; display: grid; place-items: center; aspect-ratio: 4 / 3;
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
.mayori-card-version {
  position: absolute; inset-block-start: 10px; inset-inline-end: 10px; padding: 3px 7px;
  border-radius: 999px; background: oklch(0 0 0 / 0.64); color: white; font-size: 11px; font-weight: 600;
}
.mayori-card-body { padding: 16px; }
.mayori-card-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.mayori-card-heading > div { min-inline-size: 0; }
.mayori-card-heading h3 { overflow-wrap: anywhere; font-size: 17px; line-height: 1.3; }
.mayori-card-heading .mayori-icon-action { inline-size: 36px; block-size: 36px; }
.mayori-card-byline { margin-block-start: 3px !important; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-card-summary {
  display: -webkit-box; margin-block-start: 12px !important; overflow: hidden;
  color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.5;
  -webkit-box-orient: vertical; -webkit-line-clamp: 3;
}
.mayori-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0 0; padding: 0; list-style: none; }
.mayori-tags li {
  max-inline-size: 100%; overflow: hidden; padding: 4px 8px; border-radius: 999px;
  background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary);
  font-size: 11px; text-overflow: ellipsis; white-space: nowrap;
}
.mayori-card-warning { margin-block-start: 10px !important; font-size: 12px; line-height: 1.4; }
.mayori-card-details { margin-block-start: 14px; font-size: 13px; }
.mayori-card-details summary {
  inline-size: max-content; max-inline-size: 100%; cursor: pointer; color: var(--dsw-alias-label-secondary);
}
.mayori-card-details dl { display: grid; gap: 12px; margin: 14px 0 0; }
.mayori-card-details dl > div { display: grid; gap: 4px; }
.mayori-card-details dt {
  font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--dsw-alias-label-secondary);
}
.mayori-card-details dd { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; line-height: 1.5; }
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
@media (max-width: 560px) {
  .mayori-gallery-dialog { inline-size: calc(100vw - 16px); block-size: calc(100dvh - 16px); border-radius: 16px; }
  .mayori-gallery-header { padding: 18px 16px 8px; }
  .mayori-gallery-toolbar { align-items: stretch; flex-direction: column; padding: 8px 16px; }
  .mayori-search { max-inline-size: none; }
  .mayori-gallery-status { padding-inline: 16px; }
  .mayori-gallery-content { padding: 8px 16px 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .mayori-gallery-trigger:active, .mayori-icon-action:active, .mayori-import-button:active { transform: none; }
  .mayori-gallery-dialog::backdrop { backdrop-filter: none; }
}
`

/** Register reversible browser contributions through Cordis. */
export function apply(ctx) {
  const library = new IndexedDbCharacterLibraryProvider()
  ctx.provide('mayoriCharacters', library)

  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = 'dsh-mayori'
    style.dataset.mayori = 'client'
    style.textContent = BRAND_STYLE
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'mayori: client styles')

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action', id: 'mayori-character-gallery', order: 0,
    inject: () => ({ library }),
  }, CharacterGalleryAction))
}
