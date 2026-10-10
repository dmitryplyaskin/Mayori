/** Plugin-owned style; removed with the client fiber. */
export const BRAND_STYLE = String.raw`
.mayori-select { display: inline-flex; inline-size: 100%; min-inline-size: 0; vertical-align: middle; }
.mayori-select-trigger { display: inline-flex; align-items: center; justify-content: space-between; gap: 12px; box-sizing: border-box; inline-size: 100%; min-inline-size: 0; min-block-size: 40px; padding: 9px 12px; border: 0; border-radius: var(--dsw-radius-md, 8px); background: var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-2)); color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; font-weight: 400; line-height: 22px; text-align: start; cursor: pointer; }
.mayori-select-trigger > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mayori-select-trigger > svg { flex: none; inline-size: 16px; block-size: 16px; }
.mayori-select-trigger:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-select-trigger:focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 3px; }
.mayori-select-trigger:disabled { opacity: 0.5; cursor: default; }
.mayori-dice-card { min-inline-size: 0; margin-block: 8px; padding: 12px 16px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; }
.mayori-dice-header { display: flex; align-items: flex-start; gap: 8px; }
.mayori-dice-toggle { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 1; min-inline-size: 0; min-block-size: 36px; padding: 4px 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; }
button.mayori-dice-toggle { cursor: pointer; }
.mayori-dice-toggle > svg { flex: none; }
.mayori-dice-toggle > span:first-of-type { font-weight: 600; }
.mayori-dice-chevron { margin-inline-start: auto; }
.mayori-dice-status, .mayori-dice-path, .mayori-dice-hint, .mayori-dice-group-label { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-dice-status { margin-inline-start: auto; }
.mayori-dice-inspect { min-block-size: 36px; padding: 4px 8px; flex: none; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; font-size: 12px; cursor: pointer; }
.mayori-dice-inspect:hover, button.mayori-dice-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-dice-card :is(button, summary):focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 3px; }
.mayori-dice-purpose { margin: 4px 0 12px; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-dice-results { list-style: none; margin: 0; padding: 0; }
.mayori-dice-results > li { padding-block: 10px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-dice-result-row { display: flex; align-items: baseline; gap: 16px; }
.mayori-dice-formula { display: grid; flex: 1; min-inline-size: 0; gap: 3px; }
.mayori-dice-card code { color: inherit; font-size: 13px; white-space: pre-wrap; overflow-wrap: anywhere; }
.mayori-dice-path { overflow-wrap: anywhere; }
.mayori-dice-total { font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; }
.mayori-dice-result-error { font-weight: 600; }
.mayori-dice-breakdown { display: grid; gap: 8px; margin-block-start: 10px; }
.mayori-dice-group-label { display: flex; flex-wrap: wrap; gap: 8px; margin-block-end: 6px; }
.mayori-dice-faces { display: flex; flex-wrap: wrap; gap: 6px; }
.mayori-dice-face { display: inline-flex; align-items: center; justify-content: center; min-inline-size: 28px; min-block-size: 28px; padding-inline: 4px; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; font-variant-numeric: tabular-nums; }
.mayori-dice-dropped { color: var(--dsw-alias-label-secondary); text-decoration-thickness: 2px; }
.mayori-dice-error { margin-block: 8px; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-dice-card summary { min-block-size: 32px; padding-block: 4px; box-sizing: border-box; cursor: pointer; }
.mayori-dice-record pre, .mayori-dice-all-faces p { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12px; line-height: 1.5; }
.mayori-dice-hint { margin: 8px 0 0; line-height: 1.5; }
.mayori-dice-observation { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 6px 0 0; line-height: 1.5; }
.mayori-check-summary p { margin: 6px 0; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-check-outcome { font-size: 18px; }
.mayori-dice-sr { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.mayori-navigation { --dsh-sidebar-inline-padding: 12px; display: flex; flex-direction: column; box-sizing: border-box; block-size: 100%; min-block-size: 0; padding: 6px 12px; background: var(--dsw-specific-sidebar-fill); color: var(--dsw-alias-label-primary); font-size: 14px; }
.mayori-navigation-header { display: flex; align-items: center; gap: 8px; flex: none; block-size: 48px; padding-inline: 4px; }
:is(.mayori-navigation-brand, .mayori-navigation-toggle, .mayori-navigation-row) { display: flex; align-items: center; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; }
:is(.mayori-navigation-brand, .mayori-navigation-toggle, .mayori-navigation-row):focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, currentColor); outline-offset: -2px; }
.mayori-navigation-brand { flex: 1; min-inline-size: 0; gap: 8px; padding: 0; block-size: 36px; text-align: start; }
.mayori-navigation-brand > span:first-child { display: flex; flex: none; }
.mayori-navigation-name { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 18px; font-weight: 600; line-height: 24px; }
.mayori-navigation-toggle { position: relative; justify-content: center; flex: none; inline-size: 28px; block-size: 28px; padding: 0; border-radius: 8px; }
.mayori-navigation-toggle:hover, .mayori-navigation-row:hover, .mayori-navigation-row[aria-current=page] { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-navigation-panels { display: grid; gap: 4px; flex: none; }
.mayori-navigation-row { gap: 10px; min-inline-size: 0; inline-size: 100%; min-block-size: 36px; padding: 8px 12px; border-radius: 12px; text-align: start; }
.mayori-navigation-glyph { display: flex; align-items: center; justify-content: center; flex: none; inline-size: 18px; }
.mayori-navigation-label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.mayori-navigation-region { flex: 1; min-block-size: 0; overflow: auto; }
.mayori-navigation-footer { display: flex; flex-direction: column; flex: none; gap: 4px; }
.mayori-navigation[data-collapsed=true] { --dsh-sidebar-inline-padding: 10px; padding: 18px 10px 6px; }
.mayori-navigation[data-collapsed=true] .mayori-navigation-header { block-size: 36px; padding: 0; margin-block-end: 12px; }
.mayori-navigation[data-collapsed=true] .mayori-navigation-toggle { inline-size: 36px; block-size: 36px; border-radius: 12px; }
.mayori-navigation[data-collapsed=true] .mayori-navigation-row { justify-content: center; inline-size: 36px; padding: 8px; }
html[data-windows-titlebar] .mayori-navigation-toggle { position: fixed; inset-block-start: calc((var(--dsh-windows-titlebar-height) - 28px) / 2); inset-inline-start: 12px; z-index: 30; -webkit-app-region: no-drag; inline-size: 28px; block-size: 28px; }
html[data-windows-titlebar] .mayori-navigation-header { block-size: 40px; }
html[data-windows-titlebar] .mayori-navigation[data-collapsed=true] { padding: 0; }
html[data-windows-titlebar] .mayori-navigation[data-collapsed=true] :is(.mayori-navigation-panels, .mayori-navigation-region, .mayori-navigation-footer) { display: none; }
html[data-platform=darwin] .mayori-navigation { background: transparent; padding-block-start: 52px; }
.mayori-message { position: relative; display: grid; grid-template-areas: 'avatar' 'content'; gap: 8px; min-inline-size: 0; }
.mayori-message-content { grid-area: content; min-inline-size: 0; }
.mayori-message-actions { display: inline-flex; flex: none; align-items: center; gap: 8px; color: var(--dsw-alias-label-tertiary); }
[data-clock]:has(> .mayori-message-actions) { flex-wrap: wrap; height: auto; min-block-size: calc(28px + var(--dsh-content-font-delta, 0px)); }
.mayori-message-actions button { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; inline-size: calc(28px + var(--dsh-content-font-delta, 0px)); block-size: calc(28px + var(--dsh-content-font-delta, 0px)); padding: 6px; border: 0; border-radius: var(--dsw-radius-sm, 6px); background: transparent; color: inherit; cursor: pointer; }
.mayori-message-actions svg { inline-size: calc(15px + var(--dsh-content-font-delta, 0px)); block-size: calc(15px + var(--dsh-content-font-delta, 0px)); }
[data-clock=end] .mayori-message-actions svg { inline-size: calc(17px + var(--dsh-content-font-delta, 0px)); block-size: calc(17px + var(--dsh-content-font-delta, 0px)); }
.mayori-message-actions button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary); }
.mayori-revision-status { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.mayori-message-actions button:disabled { cursor: default; opacity: 0.5; }
.mayori-message-actions button:focus-visible, .mayori-message-editor :is(button, textarea):focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px; }
.mayori-message-editor { box-sizing: border-box; inline-size: min(720px, calc(100vw - 32px)); max-block-size: calc(100dvh - 32px); margin: auto; padding: 24px; overflow: auto; border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-message-editor::backdrop { background: oklch(0 0 0 / 0.56); }
.mayori-message-editor form { display: grid; gap: 12px; }
.mayori-message-editor h2, .mayori-message-editor p { margin: 0; }
.mayori-message-editor h2 { font-size: 20px; }
.mayori-message-editor p { line-height: 1.5; }
.mayori-message-editor textarea { box-sizing: border-box; inline-size: 100%; min-block-size: 180px; max-block-size: 45dvh; resize: vertical; padding: 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: inherit; font: inherit; font-size: 16px; line-height: 1.5; }
.mayori-message-editor-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; }
.mayori-message-editor-actions button { min-block-size: 44px; padding: 8px 16px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: inherit; font: inherit; cursor: pointer; }
.mayori-message-editor-actions button:disabled { cursor: default; opacity: 0.5; }
.mayori-revision-branches { grid-column: 1 / -1; min-inline-size: 0; padding-block: 8px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.mayori-revision-branches { display: flex; align-items: center; gap: 8px; }
.mayori-revision-branches > span:first-child { flex: none; }
.mayori-revision-branches .mayori-select { inline-size: auto; max-inline-size: min(480px, 70%); }
.mayori-message > .mayori-message-avatar { grid-area: avatar; justify-self: start; }
.mayori-message-user > .mayori-message-avatar { justify-self: end; }
.mayori-message[data-avatar-placement=side] { display: block; min-block-size: 44px; }
.mayori-message[data-avatar-placement=side] > .mayori-message-avatar { position: absolute; inset-block-start: 0; z-index: 1; }
.mayori-message-character[data-avatar-placement=side] > .mayori-message-avatar { inset-inline-end: calc(100% + 12px); }
.mayori-message-user[data-avatar-placement=side] > .mayori-message-avatar { inset-inline-start: calc(100% + 12px); }
.mayori-message .mayori-message-avatar { display: grid; place-items: center; flex: none; box-sizing: border-box; inline-size: 44px; block-size: 44px; padding: 0; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2); border-radius: 50%; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 20px; cursor: pointer; }
.mayori-message-avatar img { inline-size: 100%; block-size: 100%; object-fit: cover; }
.mayori-message-avatar:hover { border-color: var(--dsw-alias-label-secondary); }
.mayori-message-avatar:focus-visible, .mayori-avatar-dialog button:focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 3px; }
.mayori-avatar-dialog { box-sizing: border-box; inline-size: min(720px, calc(100vw - 32px)); block-size: min(900px, calc(100dvh - 32px)); max-inline-size: calc(100vw - 32px); max-block-size: calc(100dvh - 32px); margin: auto; padding: 0; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-avatar-dialog[open] { display: grid; grid-template-rows: auto minmax(0, 1fr); }
.mayori-avatar-dialog::backdrop { background: oklch(0 0 0 / 0.56); }
.mayori-avatar-dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-avatar-dialog h2 { margin: 0; min-inline-size: 0; overflow-wrap: anywhere; font-size: 20px; }
.mayori-avatar-dialog button { flex: none; inline-size: 44px; block-size: 44px; border: 0; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: inherit; font: inherit; font-size: 26px; cursor: pointer; }
.mayori-avatar-dialog button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-avatar-dialog-media { display: grid; place-items: center; min-inline-size: 0; min-block-size: 0; overflow: hidden; padding: 16px; }
.mayori-avatar-dialog-media img { display: block; inline-size: 100%; block-size: 100%; min-inline-size: 0; min-block-size: 0; object-fit: contain; }
.mayori-trajectory { display: flex; flex-direction: column; block-size: 100%; min-block-size: 0; color: var(--dsw-alias-label-primary); }
.mayori-trajectory-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 16px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-trajectory-field { display: flex; align-items: center; gap: 8px; min-inline-size: 0; max-inline-size: 100%; }
.mayori-trajectory-field > span:first-child { flex: none; }
.mayori-trajectory-controls > button { max-inline-size: 100%; min-block-size: 40px; padding: 6px 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; color: inherit; background: var(--dsw-alias-bg-l1); font: inherit; }
.mayori-trajectory-controls > button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.mayori-trajectory-context { display: flex; flex: 1; flex-direction: column; min-block-size: 0; }
.mayori-trajectory-context > p { padding-inline: 16px; }
.mayori-trajectory-table { flex: 1; min-block-size: 0; }
.mayori-trajectory-journal { flex: 1; min-block-size: 0; }
.mayori-personas-panel { box-sizing: border-box; block-size: 100%; overflow-y: auto; padding: 24px; color: var(--dsw-alias-label-primary); }
.mayori-personas-layout { display: grid; grid-template-columns: minmax(200px, 280px) minmax(0, 640px); gap: 32px; }
.mayori-presets-panel { block-size: 100%; overflow-y: auto; container-type: inline-size; color: var(--dsw-alias-label-primary, CanvasText); background: var(--dsw-alias-bg-l1, Canvas); font-size: 14px; }
.mayori-presets-content { box-sizing: border-box; display: flex; flex-direction: column; gap: 24px; min-block-size: 100%; max-inline-size: 1360px; margin-inline: auto; padding: 28px 32px; }
.mayori-presets-panel :is(h1, h2, p) { margin: 0; }
.mayori-presets-panel :is(button, input, textarea, summary):focus-visible { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: 3px; }
.mayori-presets-panel :is(input, textarea) { box-sizing: border-box; min-inline-size: 0; inline-size: 100%; min-block-size: 42px; border: 1px solid var(--dsw-alias-border-l2, GrayText); border-radius: 9px; padding: 10px 12px; color: inherit; background: var(--dsw-alias-bg-l1, Canvas); font: inherit; }
.mayori-presets-panel :is(input, textarea)::placeholder { color: var(--dsw-alias-label-secondary, GrayText); opacity: 1; }
.mayori-presets-panel :is(button, summary) { cursor: pointer; }
.mayori-presets-panel :disabled { opacity: 0.5; cursor: default; }
.mayori-presets-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.mayori-presets-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.mayori-presets-header h1 { font-size: 26px; line-height: 1.3; font-weight: 650; }
.mayori-preset-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-block-size: 42px; flex: none; padding: 10px 14px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: var(--dsw-alias-bg-l1, Canvas); color: inherit; font: inherit; font-weight: 500; }
.mayori-preset-button:hover, .mayori-preset-menu :is(summary, button):hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-preset-button.mayori-preset-primary { background: var(--dsw-alias-label-primary, CanvasText); border-color: var(--dsw-alias-label-primary, CanvasText); color: var(--dsw-alias-bg-l1, Canvas); }
.mayori-preset-primary:hover { opacity: 0.86; }
.mayori-presets-usage { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 18px 20px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-l2, var(--dsw-alias-bg-layer-2, Canvas)); }
.mayori-preset-usage { display: grid; align-content: start; gap: 8px; min-inline-size: 0; }
.mayori-presets-panel label { font-weight: 500; font-size: 13px; }
.mayori-preset-usage p { font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-current-control { display: flex; gap: 8px; min-inline-size: 0; }
.mayori-presets-workspace { min-inline-size: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 14px; }
.mayori-preset-library-disclosure { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; }
.mayori-preset-library-disclosure > summary { padding: 14px 18px; overflow-wrap: anywhere; }
.mayori-preset-library { display: flex; flex-direction: column; gap: 16px; padding: 16px; background: var(--dsw-alias-bg-l2, Canvas); border-end-start-radius: 10px; border-end-end-radius: 10px; }
.mayori-preset-search { position: relative; display: flex; align-items: center; }
.mayori-preset-search > svg { position: absolute; inset-inline-start: 12px; pointer-events: none; color: var(--dsw-alias-label-secondary); }
.mayori-preset-search input { padding-inline-start: 38px; font-weight: 400; }
.mayori-preset-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; max-block-size: 320px; overflow-y: auto; overscroll-behavior: contain; list-style: none; padding: 5px; margin: -5px; }
.mayori-preset-row { display: flex; flex-direction: column; align-items: stretch; gap: 10px; inline-size: 100%; padding: 14px 12px; border: 1px solid transparent; border-radius: 10px; color: inherit; background: transparent; font: inherit; text-align: start; }
.mayori-preset-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-preset-row[aria-pressed=true] { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-l1, Canvas); box-shadow: 0 2px 5px oklch(0 0 0 / 0.03); }
.mayori-preset-row-title { display: flex; gap: 8px; align-items: flex-start; min-inline-size: 0; }
.mayori-preset-row-title svg { flex: none; margin-block-start: 1px; color: var(--dsw-alias-label-secondary); }
.mayori-preset-row-title strong { font-size: 14px; font-weight: 600; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-preset-preview { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }
.mayori-preset-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.mayori-preset-tags > span { padding: 3px 6px; border-radius: 4px; background: var(--dsw-alias-interactive-bg-hover); font-size: 10px; line-height: 1.5; }
.mayori-preset-empty { padding: 8px 6px; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.mayori-preset-editor { min-inline-size: 0; display: flex; flex-direction: column; gap: 22px; padding: 24px; }
.mayori-preset-editor-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.mayori-preset-editor-heading > div { min-inline-size: 0; }
.mayori-preset-editor h2 { font-size: 19px; font-weight: 600; line-height: 1.4; overflow-wrap: anywhere; }
.mayori-preset-save-state { display: block; margin-block-start: 4px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }
.mayori-preset-name-field { display: grid; gap: 8px; }
.mayori-preset-editor-footer { display: grid; gap: 12px; padding-block-start: 16px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-preset-feedback { font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-feedback p:empty { display: block; block-size: 0; }
.mayori-preset-editor-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.mayori-preset-text-button { min-block-size: 40px; padding: 8px 4px; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
.mayori-preset-menu { position: relative; flex: none; }
.mayori-preset-menu summary { display: grid; place-items: center; inline-size: 40px; block-size: 40px; border-radius: 8px; list-style: none; }
.mayori-preset-menu summary::-webkit-details-marker { display: none; }
.mayori-preset-menu > div { position: absolute; z-index: 4; inset-inline-end: 0; inset-block-start: calc(100% + 6px); inline-size: 210px; padding: 6px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-l1, Canvas); box-shadow: 0 8px 24px oklch(0 0 0 / 0.12); }
.mayori-preset-menu button { display: block; inline-size: 100%; min-block-size: 40px; padding: 10px; border: 0; border-radius: 6px; background: transparent; color: inherit; text-align: start; font: inherit; }
.mayori-preset-menu .mayori-preset-delete { color: var(--dsw-alias-label-error, #b42318); }
.mayori-preset-error { font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; color: var(--dsw-alias-label-error); }
.mayori-preset-structure { position: relative; min-inline-size: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; }
.mayori-preset-structure [hidden] { display: none !important; }
.mayori-preset-structure h3 { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.5; }
.mayori-preset-structure-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 16px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-preset-structure-heading p, .mayori-preset-node-path, .mayori-preset-node-state { font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.mayori-preset-structure-heading p, .mayori-preset-structure-footer span { font-variant-numeric: tabular-nums; }
.mayori-preset-structure-layout { display: grid; grid-template-columns: max(210px, calc(100% * 0.9 / 2.3 - 50px)) minmax(0, 1fr); }
.mayori-preset-structure-tree { min-inline-size: 0; background: var(--dsw-alias-bg-l2, Canvas); border-inline-end: 1px solid var(--dsw-alias-border-l2); padding: 14px 8px; }
.mayori-preset-tree-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 0 8px 12px; }
.mayori-preset-tree-toolbar h3 { flex-basis: 100%; }
.mayori-preset-tree-scroll { max-block-size: 580px; overflow-y: auto; overscroll-behavior: contain; padding: 4px; }
.mayori-preset-tree-list { list-style: none; padding: 0; margin: 0; }
.mayori-preset-tree-children { margin-inline-start: 14px; padding-inline-start: 5px; border-inline-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-preset-tree-children[data-deep=true] { margin-inline-start: 0; padding-inline-start: 0; border-inline-start: 0; }
.mayori-preset-tree-row { position: relative; display: flex; align-items: center; gap: 2px; margin-block: 4px; border: 1px solid transparent; border-radius: 7px; }
.mayori-preset-tree-row.is-selected { background: var(--dsw-alias-interactive-bg-hover, Canvas); border-color: var(--dsw-alias-border-l2); }
.mayori-preset-tree-row.is-dragging { opacity: 0.5; }
.mayori-preset-tree-row.drop-before::before, .mayori-preset-tree-row.drop-after::after { content: ''; position: absolute; inset-inline: 0; block-size: 3px; background: var(--dsw-alias-label-primary, CanvasText); }
.mayori-preset-tree-row.drop-before::before { inset-block-start: -4px; }
.mayori-preset-tree-row.drop-after::after { inset-block-end: -4px; }
.mayori-preset-tree-row.drop-inside, .mayori-preset-root-drop.drop-inside { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: -2px; background: var(--dsw-alias-interactive-bg-hover, Canvas); }
.mayori-presets-panel .mayori-preset-drag-handle { display: grid; place-items: center; flex: none; inline-size: 28px; min-block-size: 38px; padding: 4px; border: 0; border-radius: 5px; color: var(--dsw-alias-label-secondary); background: transparent; cursor: grab; touch-action: none; }
.mayori-presets-panel .mayori-preset-drag-handle:active:not(:disabled) { cursor: grabbing; }
.mayori-preset-tree-fold { flex: none; inline-size: 22px; min-block-size: 38px; border: 0; border-radius: 5px; padding: 2px; font: inherit; background: transparent; color: inherit; }
.mayori-preset-tree-spacer { flex: none; inline-size: 22px; }
.mayori-presets-panel .mayori-preset-node-toggle { display: inline-flex; align-items: center; gap: 8px; min-block-size: 38px; }
.mayori-presets-panel .mayori-preset-node-toggle input { inline-size: 17px; min-block-size: 17px; block-size: 17px; margin: 0; padding: 0; flex: none; accent-color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-preset-tree-pick { flex: 1; min-inline-size: 0; min-block-size: 44px; padding: 8px 6px; border: 0; border-radius: 5px; text-align: start; font: inherit; color: inherit; background: transparent; overflow-wrap: anywhere; }
.mayori-preset-group-title { font-weight: 600; }
.mayori-preset-tree-pick small { display: block; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-tree-empty { padding: 10px 16px; font-size: 13px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.mayori-preset-root-drop { margin-block-start: 14px; padding: 10px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 6px; font-size: 12px; color: var(--dsw-alias-label-secondary); text-align: center; }
.mayori-preset-node-editor { display: flex; flex-direction: column; align-items: stretch; gap: 16px; min-inline-size: 0; padding: 22px; }
.mayori-preset-node-field { display: flex; flex-direction: column; gap: 8px; min-inline-size: 0; }
.mayori-presets-panel .mayori-preset-node-field textarea { min-block-size: 300px; max-inline-size: none; resize: vertical; font-size: 16px; line-height: 1.6; }
.mayori-preset-group-content { display: grid; gap: 8px; }
.mayori-preset-group-content ul { padding-inline-start: 20px; margin: 0; }
.mayori-preset-node-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mayori-preset-node-actions .mayori-preset-delete { color: var(--dsw-alias-label-error, #b42318); }
.mayori-preset-structure-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 12px 16px; border-block-start: 1px solid var(--dsw-alias-border-l2); font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-compiled { padding: 20px; }
.mayori-preset-compiled pre { margin: 14px 0; max-inline-size: 75ch; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-size: 16px; line-height: 1.6; }
.mayori-preset-compiled summary { min-block-size: 40px; padding-block: 8px; }
.mayori-preset-compiled ol { padding-inline-start: 24px; overflow-wrap: anywhere; }
.mayori-preset-drag-ghost { position: absolute; z-index: 5; inline-size: 180px; padding: 10px 12px; border: 1px solid var(--dsw-alias-label-primary, CanvasText); border-radius: 8px; pointer-events: none; color: var(--dsw-alias-label-primary, CanvasText); background: var(--dsw-alias-bg-l1, Canvas); box-shadow: 0 6px 18px oklch(0 0 0 / 0.2); overflow-wrap: anywhere; }
.mayori-preset-move-dialog { box-sizing: border-box; inline-size: min(460px, calc(100% - 32px)); max-block-size: calc(100dvh - 32px); padding: 24px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-l1, Canvas); color: var(--dsw-alias-label-primary, CanvasText); overflow-y: auto; overscroll-behavior: contain; }
.mayori-preset-move-dialog::backdrop { background: oklch(0 0 0 / 0.4); }
.mayori-preset-move-dialog > * + * { margin-block-start: 16px; }
@media (hover: hover) { .mayori-preset-tree-pick:hover, .mayori-preset-tree-fold:hover, .mayori-presets-panel .mayori-preset-drag-handle:hover { background: var(--dsw-alias-interactive-bg-hover); } }
@media (pointer: coarse) { .mayori-presets-panel :is(.mayori-preset-drag-handle, .mayori-preset-tree-fold) { min-block-size: 44px; } }
@container (max-width: 900px) {
  .mayori-presets-content { padding: 24px; }
  .mayori-preset-structure-layout { grid-template-columns: max(190px, calc(100% * 0.9 / 2.1 - 50px)) minmax(0, 1fr); }
  .mayori-preset-current-control { flex-wrap: wrap; }
}
@container (max-width: 680px) {
  .mayori-presets-content { block-size: auto; min-block-size: 100%; padding: 20px 16px; gap: 20px; }
  .mayori-presets-header { flex-wrap: wrap; gap: 12px; }
  .mayori-presets-header h1 { font-size: 24px; }
  .mayori-presets-usage { grid-template-columns: minmax(0, 1fr); gap: 18px; padding: 16px; }
  .mayori-preset-structure-layout { grid-template-columns: minmax(0, 1fr); }
  .mayori-preset-structure-tree { border-inline-end: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); }
  .mayori-preset-node-editor { padding: 16px 12px; }
  .mayori-preset-tree-scroll { max-block-size: 380px; }
  .mayori-preset-tree-children { margin-inline-start: 5px; padding-inline-start: 2px; }
  .mayori-preset-editor { padding: 20px 16px; gap: 20px; }
  .mayori-preset-editor-footer { position: sticky; inset-block-end: 0; z-index: 2; background: var(--dsw-alias-bg-l1, Canvas); padding-block-end: max(8px, env(safe-area-inset-bottom)); }
  .mayori-presets-panel :is(input, textarea) { font-size: 16px; }
  .mayori-presets-panel .mayori-select-trigger { min-block-size: 44px; }
  .mayori-preset-editor-actions > button { flex: 1 1 auto; min-block-size: 44px; }
}
.mayori-persona-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.mayori-persona-row { display: flex; align-items: center; gap: 12px; inline-size: 100%; padding: 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: transparent; color: inherit; text-align: start; font: inherit; cursor: pointer; }
.mayori-persona-row[aria-pressed=true] { border-color: currentColor; background: var(--dsw-alias-interactive-bg-hover); }
.mayori-persona-row img, .mayori-persona-avatar { inline-size: 48px; block-size: 48px; border-radius: 50%; object-fit: cover; flex: none; }
.mayori-persona-avatar { display: grid; place-items: center; background: var(--dsw-alias-bg-l2); }
.mayori-persona-row span { min-inline-size: 0; overflow-wrap: anywhere; }
.mayori-persona-row small { display: block; margin-block-start: 4px; }
.mayori-persona-form { display: grid; gap: 12px; align-content: start; }
.mayori-persona-form h3, .mayori-persona-form p { margin: 0; }
.mayori-persona-form label { display: grid; gap: 6px; }
.mayori-persona-form input, .mayori-persona-form textarea { box-sizing: border-box; inline-size: 100%; min-inline-size: 0; padding: 10px 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; font: inherit; font-size: 16px; background: var(--dsw-alias-bg-l1); color: inherit; }
.mayori-persona-form textarea { resize: vertical; }
.mayori-persona-hint, .mayori-persona-row small { color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.5; }
.mayori-persona-image { inline-size: 96px; block-size: 96px; object-fit: cover; border-radius: 16px; }
.mayori-persona-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 8px; }
.mayori-personas-panel button { min-block-size: 44px; }
.mayori-personas-panel :is(button, input, textarea):focus-visible, .mayori-greeting-swipes button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.mayori-greeting-swipes { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-block-start: 8px; font-variant-numeric: tabular-nums; }
.mayori-greeting-swipes button { inline-size: 44px; block-size: 44px; border: 0; border-radius: 8px; font-size: 24px; color: inherit; background: transparent; cursor: pointer; }
.mayori-greeting-swipes button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-greeting-swipes button:disabled { opacity: 0.5; cursor: wait; }
@media (max-width: 700px) { .mayori-personas-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; } .mayori-personas-panel { padding: 16px; } }
 .mayori-gallery-panel {
  block-size: 100%; min-block-size: 0; overflow: hidden;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
  color: var(--dsw-alias-label-primary);
}
.mayori-gallery-panel button:focus-visible, .mayori-history-panel button:focus-visible,
.mayori-gallery-panel input:focus-visible, .mayori-history-panel input:focus-visible,
.mayori-character-dialog button:focus-visible {
  outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px;
}
.mayori-history-panel { box-sizing: border-box; block-size: 100%; overflow-y: auto; padding: 24px; color: var(--dsw-alias-label-primary); }
.mayori-history-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
.mayori-history-panel .mayori-search input { padding-inline-start: 12px; }
.mayori-history-list { padding: 0; margin: 20px 0; list-style: none; }
.mayori-history-item { display: flex; align-items: center; gap: 8px; }
.mayori-history-item > .mayori-history-row { flex: 1; min-inline-size: 0; }
.mayori-history-item > .mayori-secondary-button { flex: none; }
.mayori-history-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.mayori-history-controls label { display: flex; align-items: center; gap: 8px; }
.mayori-history-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; inline-size: 100%; padding: 16px 12px; border: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.mayori-history-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-history-row > span { min-inline-size: 0; overflow-wrap: anywhere; }
.mayori-history-row small { display: block; margin-block-start: 4px; }
.mayori-history-row time, .mayori-history-row small { color: var(--dsw-alias-label-secondary); font-size: 12px; }
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
.mayori-gallery-workspace { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 260px; min-block-size: 0; }
.mayori-filter-panel {
  display: flex; min-block-size: 0; flex-direction: column; gap: 24px; padding: 24px 20px;
  grid-column: 2; grid-row: 1; border-inline-start: 1px solid var(--dsw-alias-border-l2); overflow-y: auto; overscroll-behavior: contain;
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
.mayori-search input {
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
.mayori-gallery-main { grid-column: 1; grid-row: 1; min-inline-size: 0; min-block-size: 0; padding: 20px 24px 32px; overflow-y: auto; overscroll-behavior: contain; container-type: inline-size; }
.mayori-gallery-results { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-block-size: 30px; }
.mayori-gallery-results p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-gallery-notice { min-block-size: 28px; padding-block: 2px 10px; font-size: 13px; }
.mayori-gallery-notice p { margin: 0; }
.mayori-error, .mayori-card-warning { color: var(--dsw-alias-label-error, #b42318); }
.mayori-success { color: var(--dsw-alias-label-success, #16794b); }
.mayori-card-grid {
  display: grid; grid-template-columns: repeat(var(--mayori-columns, 5), minmax(0, 1fr));
  align-items: stretch; gap: 18px; margin: 0; padding: 0; list-style: none;
}
.mayori-card article {
  display: grid; grid-template-rows: auto minmax(0, 1fr); block-size: 100%; overflow: hidden; container-type: inline-size;
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
.mayori-card-body { display: flex; flex-direction: column; gap: 12px; padding: 14px; }
.mayori-card-heading { min-inline-size: 0; }
.mayori-card-heading h3 { overflow-wrap: anywhere; font-size: 17px; line-height: 1.3; }
.mayori-card-heading p { margin-block-start: 4px; overflow: hidden; color: var(--dsw-alias-label-secondary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.mayori-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.mayori-tags li {
  max-inline-size: 100%; overflow: hidden; padding: 4px 8px; border-radius: 999px;
  background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary);
  font-size: 11px; text-overflow: ellipsis; white-space: nowrap;
}
.mayori-card-actions { display: grid; grid-template-columns: 1fr 1fr; margin-block-start: auto; gap: 8px; }
.mayori-greeting-preview { min-inline-size: 0; font-size: 13px; }
.mayori-greeting-preview summary { cursor: pointer; }
.mayori-greeting-preview p { max-block-size: 180px; overflow-y: auto; white-space: pre-wrap; overflow-wrap: anywhere; margin-block-start: 8px; }
.mayori-card-actions button, .mayori-persona-actions button, .mayori-secondary-button, .mayori-danger-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-block-size: 40px;
  padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
}
.mayori-card-actions button > svg, .mayori-danger-button > svg { inline-size: 17px; block-size: 17px; }
.mayori-card-play { background: var(--dsw-alias-label-primary) !important; color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)) !important; border-color: transparent !important; }
.mayori-card-play:disabled { opacity: 0.62; cursor: progress; }
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
    position: absolute; z-index: 6; inset-block: 0; inset-inline-end: 0; inline-size: min(320px, calc(100vw - 48px));
    box-sizing: border-box; border-inline-start: 1px solid var(--dsw-alias-border-l2);
    box-shadow: -16px 0 40px oklch(0 0 0 / 0.2); transform: translateX(105%); visibility: hidden;
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
  .mayori-card-grid { gap: 12px; }
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
.mayori-home-panel { box-sizing: border-box; block-size: 100%; min-block-size: 0; overflow-y: auto; padding: 40px 32px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1, Canvas); }
.mayori-home-content { max-inline-size: 1480px; margin-inline: auto; container-type: inline-size; }
.mayori-home-welcome { margin-block-end: 40px; }
.mayori-home-mark { display: grid; place-items: center; inline-size: 48px; block-size: 48px; margin-block-end: 16px; border-radius: 16px; background: var(--dsw-alias-interactive-bg-hover); }
.mayori-home-welcome h1 { margin: 0; font-size: clamp(26px, 3vw, 36px); line-height: 1.2; text-wrap: balance; }
.mayori-home-welcome p, .mayori-home-empty { color: var(--dsw-alias-label-secondary); line-height: 1.6; }
.mayori-home-section + .mayori-home-section { margin-block-start: 40px; }
.mayori-home-section h2 { margin: 0 0 16px; font-size: 20px; }
.mayori-home-section > .mayori-secondary-button { margin-block-start: 16px; }
.mayori-home-section .mayori-history-list { margin-block: 0; }
.mayori-home-panel :is(button, input):focus-visible, .mayori-history-panel input:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.mayori-history-row { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; }
.mayori-history-row .mayori-history-avatar { display: grid; place-items: center; inline-size: 52px; block-size: 52px; overflow: hidden; border-radius: 14px; background: var(--dsw-alias-interactive-bg-hover); font-size: 22px; }
.mayori-history-avatar img { inline-size: 100%; block-size: 100%; object-fit: cover; }
.mayori-history-text { display: grid; gap: 4px; }
.mayori-history-text strong { font-weight: 600; }
.mayori-history-preview { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-history-row time { white-space: nowrap; }
.mayori-history-row:disabled, .mayori-secondary-button:disabled { opacity: 0.55; cursor: default; }
.mayori-column-control { display: flex; align-items: center; gap: 8px; }
.mayori-column-control .mayori-select { inline-size: 68px; }
.mayori-pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-block-start: 24px; font-size: 13px; font-variant-numeric: tabular-nums; }
.mayori-pagination .mayori-filter-control { display: flex; align-items: center; gap: 8px; }
.mayori-pagination .mayori-select { inline-size: auto; min-inline-size: 68px; }
.mayori-page-actions { display: flex; align-items: center; gap: 8px; }
.mayori-page-actions input { box-sizing: border-box; inline-size: 64px; min-block-size: 42px; padding: 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; font: inherit; font-size: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); color: inherit; }
.mayori-page-actions button { min-inline-size: 40px; font-size: 20px; }
.mayori-character-opening { display: grid; gap: 12px; margin-block-end: 24px; }
.mayori-character-footer, .mayori-character-footer-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.mayori-character-footer-actions { margin-inline-start: auto; }
@container (max-width: 1000px) { .mayori-card-grid { grid-template-columns: repeat(min(var(--mayori-columns, 5), 5), minmax(0, 1fr)); } }
@container (max-width: 650px) { .mayori-card-grid { grid-template-columns: repeat(min(var(--mayori-columns, 5), 3), minmax(0, 1fr)); } }
@container (max-width: 540px) { .mayori-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .mayori-card-actions { grid-template-columns: 1fr; } }
@container (max-width: 340px) { .mayori-card-grid { grid-template-columns: minmax(0, 1fr); } }
@container (max-width: 240px) { .mayori-card-actions { grid-template-columns: 1fr; } }
@media (max-width: 700px) {
  .mayori-home-panel { padding: 24px 16px; }
  .mayori-history-panel { padding: 16px; }
  .mayori-history-item { flex-wrap: wrap; gap: 4px; margin-block-end: 12px; }
  .mayori-history-item > .mayori-history-row { flex-basis: 100%; }
  .mayori-history-item > .mayori-secondary-button { margin-inline-start: 64px; }
  .mayori-history-row { grid-template-columns: 44px minmax(0, 1fr); gap: 12px; padding-inline: 0; }
  .mayori-history-row .mayori-history-avatar { inline-size: 44px; block-size: 44px; }
  .mayori-history-row time { grid-column: 2; white-space: normal; }
  .mayori-column-control { flex-wrap: wrap; }
}
`
