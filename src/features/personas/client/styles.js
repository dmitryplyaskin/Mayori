/** Theme-native workbench; the containing panel owns the responsive breakpoints. */
export const PERSONA_STYLE = String.raw`
.mayori-personas-panel { box-sizing: border-box; display: flex; flex-direction: column; block-size: 100%; min-block-size: 0; overflow: hidden; container-type: inline-size; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1); font-size: 14px; line-height: 1.5; }
.mayori-personas-panel :is(h2,h3,h4,p) { margin: 0; }
.mayori-personas-panel h2 { font-size: 24px; line-height: 1.25; font-weight: 650; }
.mayori-personas-panel h3 { font-size: 16px; font-weight: 600; }
.mayori-personas-panel h4 { font-size: 15px; font-weight: 600; }
.mayori-personas-panel button { box-sizing: border-box; min-block-size: 40px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 8px 12px; font: inherit; font-weight: 500; line-height: 1.4; color: inherit; background: var(--dsw-alias-bg-layer-1); cursor: pointer; }
@media (hover: hover) { .mayori-personas-panel button:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); } }
.mayori-personas-panel :disabled { opacity: 0.5; cursor: default; }
.mayori-personas-panel :is(button,input,textarea,summary,[tabindex]):focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px; }
.mayori-personas-panel :is(input:not([type=checkbox]),textarea) { box-sizing: border-box; inline-size: 100%; min-inline-size: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 10px 12px; color: inherit; background: var(--dsw-alias-bg-layer-1); font: inherit; font-size: 16px; line-height: 1.5; }
.mayori-personas-panel input::placeholder,.mayori-personas-panel textarea::placeholder { color: var(--dsw-alias-label-secondary); opacity: 1; }
.mayori-personas-panel label { display: grid; gap: 6px; min-inline-size: 0; font-weight: 500; }
.mayori-personas-panel textarea { resize: vertical; font-weight: 400; }
.mayori-persona-hint,.mayori-persona-empty,.mayori-persona-row small,.mayori-persona-block-list small { font-size: 13px; font-weight: 400; color: var(--dsw-alias-label-secondary); }
.mayori-personas-header { display: flex; flex: none; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-personas-header > div { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.mayori-personas-workspace { display: grid; flex: 1; min-block-size: 0; grid-template-columns: 264px minmax(0,1fr); }
.mayori-persona-catalog { min-inline-size: 0; min-block-size: 0; border-inline-end: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
.mayori-persona-library-body { display: flex; flex-direction: column; block-size: 100%; min-block-size: 0; }
.mayori-persona-library-tools { display: grid; flex: none; gap: 8px; padding: 16px; }
.mayori-persona-library-tools .mayori-select-trigger { min-block-size: 40px; background: transparent; }
.mayori-persona-list { list-style: none; margin: 0; padding: 0 12px 16px; min-block-size: 0; overflow: auto; overscroll-behavior: contain; display: flex; flex-direction: column; gap: 4px; }
.mayori-personas-panel .mayori-persona-row { display: flex; align-items: center; inline-size: 100%; min-inline-size: 0; gap: 12px; padding: 12px; text-align: start; border-color: transparent; background: transparent; font-weight: 400; }
.mayori-personas-panel .mayori-persona-row[aria-pressed=true] { background: var(--dsw-alias-bg-layer-1); border-color: var(--dsw-alias-border-l2); box-shadow: inset 3px 0 var(--dsw-alias-label-primary); }
.mayori-persona-avatar { display: grid; place-items: center; inline-size: 44px; block-size: 44px; border-radius: 12px; flex: none; overflow: hidden; background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-primary); font-size: 20px; font-weight: 600; }
.mayori-persona-avatar img { inline-size: 100%; block-size: 100%; object-fit: cover; }
.mayori-persona-row-text { min-inline-size: 0; flex: 1; }
.mayori-persona-row-text strong { display: block; overflow-wrap: anywhere; font-weight: 600; }
.mayori-persona-row-text > small { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; margin-block-start: 2px; }
.mayori-persona-badges { display: flex; gap: 4px 8px; flex-wrap: wrap; }
.mayori-persona-badges em { font-style: normal; font-size: 11px; margin-block-start: 6px; border: 1px solid var(--dsw-alias-border-l2); padding: 0 5px; border-radius: 4px; }
.mayori-persona-empty { padding: 12px 20px; }
.mayori-persona-form { display: flex; flex-direction: column; min-inline-size: 0; min-block-size: 0; }
.mayori-persona-edit-area { display: flex; flex-direction: column; flex: 1; min-block-size: 0; overflow: hidden; }
.mayori-persona-editor-header { display: flex; flex: none; align-items: center; gap: 12px; padding: 16px 24px 0; }
.mayori-persona-editor-header > .mayori-persona-hint { margin-inline-end: auto; }
.mayori-persona-editor-header > :last-child { margin-inline-start: auto; }
.mayori-persona-identity { display: grid; flex: none; grid-template-columns: 68px minmax(0,1fr) minmax(0,1fr); gap: 16px; align-items: center; padding: 16px 24px 20px; }
.mayori-personas-panel .mayori-persona-avatar-picker { display: grid; justify-items: center; gap: 4px; padding: 0; border: 0; background: transparent; font-size: 12px; font-weight: 400; }
.mayori-persona-avatar-picker .mayori-persona-avatar { inline-size: 64px; block-size: 64px; border-radius: 16px; }
.mayori-persona-tabs { display: flex; flex: none; padding-inline: 24px; border-block-end: 1px solid var(--dsw-alias-border-l2); gap: 24px; }
.mayori-personas-panel .mayori-persona-tabs button { position: relative; padding: 12px 0; border: 0; border-radius: 0; background: transparent; color: var(--dsw-alias-label-secondary); font-weight: 500; }
.mayori-personas-panel .mayori-persona-tabs button[aria-selected=true] { color: var(--dsw-alias-label-primary); }
.mayori-persona-tabs button[aria-selected=true]::after { content: ''; position: absolute; inset-inline: 0; inset-block-end: -1px; block-size: 2px; background: currentColor; }
.mayori-persona-tab-count { margin-inline-start: 6px; font-size: 11px; font-variant-numeric: tabular-nums; }
.mayori-persona-editor-content { flex: 1; min-block-size: 0; overflow: auto; overscroll-behavior: contain; padding: 24px; scroll-padding-block: 16px; }
.mayori-persona-description { display: flex; flex-direction: column; gap: 20px; min-block-size: 100%; }
.mayori-persona-long-text { display: flex !important; flex-direction: column; flex: 1; }
.mayori-persona-long-text textarea { flex: 1; min-block-size: 220px; }
.mayori-persona-variant { flex: none; border-block-start: 1px solid var(--dsw-alias-border-l2); padding-block-start: 12px; }
.mayori-personas-panel summary { cursor: pointer; min-block-size: 36px; padding-block: 4px; box-sizing: border-box; }
.mayori-persona-variant[open],.mayori-persona-activation[open] { display: grid; gap: 12px; }
.mayori-persona-variant > button { justify-self: start; }
.mayori-personas-panel .mayori-persona-check { display: flex; align-items: center; gap: 8px; min-block-size: 32px; font-weight: 400; }
.mayori-persona-check input { margin: 0; inline-size: 18px; block-size: 18px; flex: none; accent-color: var(--dsw-alias-label-primary); }
.mayori-persona-settings { display: grid; gap: 28px; max-inline-size: 800px; }
.mayori-persona-settings section { display: grid; gap: 12px; align-content: start; }
.mayori-persona-settings section + section { border-block-start: 1px solid var(--dsw-alias-border-l2); padding-block-start: 24px; }
.mayori-persona-settings section > button { justify-self: start; }
.mayori-persona-settings input:not([type=checkbox]) { max-inline-size: 360px; }
.mayori-persona-binding { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
.mayori-persona-binding span { flex: 1; min-inline-size: 0; overflow-wrap: anywhere; }
.mayori-persona-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.mayori-persona-preview-heading { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-block-end: 4px; }
.mayori-persona-preview { white-space: pre-wrap; overflow-wrap: anywhere; margin: 20px 0 0; padding: 20px; min-block-size: 240px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); font: inherit; font-size: 16px; line-height: 1.7; }
.mayori-persona-footer { flex: none; display: flex; align-items: center; gap: 16px; justify-content: space-between; padding: 16px 24px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-persona-feedback { min-inline-size: 0; font-size: 12px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.mayori-persona-feedback [role=alert] { color: var(--dsw-alias-label-primary); font-weight: 600; }
.mayori-persona-footer-actions { display: flex; flex: none; gap: 8px; }
.mayori-personas-panel .mayori-persona-primary { border-color: var(--dsw-alias-label-primary); background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-layer-1); }
@media (hover: hover) { .mayori-personas-panel .mayori-persona-primary:hover:not(:disabled) { background: var(--dsw-alias-label-primary); opacity: 0.86; } }
.mayori-personas-panel .mayori-persona-library-toggle { display: none; }
.mayori-persona-block-workspace { display: grid; grid-template-columns: 220px minmax(0,1fr); gap: 24px; min-block-size: 100%; }
.mayori-persona-block-outline { min-inline-size: 0; border-inline-end: 1px solid var(--dsw-alias-border-l2); padding-inline-end: 20px; }
.mayori-persona-block-add { display: grid; gap: 8px; margin-block-end: 12px; }
.mayori-persona-block-select { display: none; }
.mayori-persona-block-list { display: grid; list-style: none; gap: 4px; padding: 0; margin: 0; }
.mayori-persona-block-list li[data-nested=true] { margin-inline-start: 16px; border-inline-start: 1px solid var(--dsw-alias-border-l2); padding-inline-start: 8px; }
.mayori-persona-block-list button { display: flex; align-items: center; gap: 8px; inline-size: 100%; padding: 10px 8px; text-align: start; border-color: transparent; background: transparent; }
.mayori-persona-block-list button[aria-pressed=true] { background: var(--dsw-alias-bg-module-platform); border-color: var(--dsw-alias-border-l2); }
.mayori-persona-block-list button > span:last-child { min-inline-size: 0; overflow-wrap: anywhere; }
.mayori-persona-block-list strong { display: block; font-weight: 500; }
.mayori-persona-block-list small { display: block; margin-block-start: 2px; font-size: 12px; }
.mayori-persona-node-kind { flex: none; font-size: 22px; }
.mayori-persona-block-inspector { min-inline-size: 0; display: flex; flex-direction: column; gap: 16px; }
.mayori-persona-block-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.mayori-persona-block-toolbar label { margin-inline-end: auto; }
.mayori-persona-block-toolbar > button { min-inline-size: 40px; }
.mayori-persona-activation { border-block-start: 1px solid var(--dsw-alias-border-l2); padding-block-start: 12px; }
.mayori-persona-group-content { display: grid; gap: 12px; padding: 20px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 8px; }
.mayori-persona-group-content button { justify-self: start; }
.mayori-persona-block-placeholder { display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; padding: 24px; text-align: center; }
.mayori-persona-block-placeholder > span { font-size: 40px; color: var(--dsw-alias-label-secondary); }
.mayori-persona-block-placeholder p { color: var(--dsw-alias-label-secondary); max-inline-size: 32ch; }
@container (max-width: 1100px) { .mayori-personas-workspace { grid-template-columns: 228px minmax(0,1fr); } .mayori-persona-block-workspace { grid-template-columns: 180px minmax(0,1fr); gap: 16px; } .mayori-persona-block-outline { padding-inline-end: 12px; } .mayori-persona-footer { flex-wrap: wrap; gap: 8px; } .mayori-persona-footer-actions { margin-inline-start: auto; } }
@container (max-width: 820px) { .mayori-persona-block-workspace { grid-template-columns: minmax(0,1fr); align-content: start; } .mayori-persona-block-outline { border-inline-end: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); padding: 0 0 16px; } .mayori-persona-block-add { grid-template-columns: 1fr 1fr; } .mayori-persona-block-list { display: none; } .mayori-persona-block-select { display: block; } }
@container (max-width: 680px) {
  .mayori-personas-header { padding: 12px 16px; gap: 8px; } .mayori-personas-header h2 { font-size: 20px; } .mayori-personas-header > div { gap: 0; flex-direction: column; } .mayori-personas-header > button { max-inline-size: 50%; }
  .mayori-personas-workspace { display: flex; flex-direction: column; }
  .mayori-persona-catalog { flex: none; border-inline-end: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); }
  .mayori-personas-panel .mayori-persona-library-toggle { display: flex; justify-content: space-between; inline-size: 100%; border: 0; border-radius: 0; background: transparent; padding: 10px 16px; }
  .mayori-persona-library-body { display: none; max-block-size: 260px; }
  .mayori-persona-catalog[data-open=true] .mayori-persona-library-body { display: flex; }
  .mayori-persona-library-tools { padding: 8px 16px; grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
  .mayori-persona-form { flex: 1; }
  .mayori-persona-editor-header { padding: 12px 16px 0; flex-wrap: wrap; gap: 4px 8px; } .mayori-persona-editor-header h3 { font-size: 14px; } .mayori-persona-editor-header > .mayori-persona-hint { font-size: 11px; }
  .mayori-persona-identity { grid-template-columns: 48px minmax(0,1fr); gap: 8px 12px; padding: 12px 16px; } .mayori-persona-identity > label:last-child { grid-column: 2; } .mayori-persona-avatar-picker { grid-row: 1 / 3; } .mayori-persona-avatar-picker .mayori-persona-avatar { inline-size: 48px; block-size: 48px; border-radius: 12px; }
  .mayori-persona-identity label { gap: 2px; font-size: 12px; } .mayori-persona-identity input { padding: 6px 10px; }
  .mayori-persona-tabs { padding-inline: 12px; gap: 0; justify-content: space-between; } .mayori-personas-panel .mayori-persona-tabs button { font-size: 12px; padding: 12px 3px; } .mayori-persona-tab-count { display: none; }
  .mayori-persona-editor-content { padding: 16px; }
  .mayori-persona-footer { padding: 12px 16px max(12px,env(safe-area-inset-bottom)); gap: 8px; }
  .mayori-persona-footer-actions { flex: 1; flex-wrap: wrap; margin: 0; } .mayori-persona-footer-actions > button { flex: 1 1 140px; min-block-size: 44px; font-size: 13px; padding: 8px; }
  .mayori-persona-feedback { flex-basis: 100%; }
  .mayori-persona-preview { padding: 12px; }
}
@media (forced-colors: active) { .mayori-persona-tabs button[aria-selected=true],.mayori-persona-row[aria-pressed=true],.mayori-persona-block-list button[aria-pressed=true] { outline: 2px solid Highlight; outline-offset: -2px; } }
@container (max-width: 360px) { .mayori-persona-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; } .mayori-personas-panel .mayori-persona-tabs button { text-align: start; font-size: 13px; } .mayori-persona-editor-header > .mayori-persona-hint { flex: 1; } }
@media (max-height: 700px) { .mayori-persona-edit-area { overflow: auto; overscroll-behavior: contain; scroll-padding-block: 16px; } .mayori-persona-editor-content { flex: none; overflow: visible; } .mayori-persona-description { min-block-size: 300px; } }
`
