import { useEffect, useRef, useState } from 'react'
import { CompactionSettings } from '../../compaction/client/panel.jsx'

const entries = [
  ['dice', 'Кости', 'Броски по формулам: обычные кости, пулы, перебросы и взрывающиеся кости.'],
  ['rules', 'Проверки', 'Проверки сложности, преимущество, криты, урон и последствия по выбранным правилам.'],
  ['rollHistory', 'Подробности бросков', 'Модель может отдельно запросить полную развёртку сохранённого броска.'],
  ['compaction', 'Сжатие истории', 'Автоматически сокращает старую переписку и добавляет инструмент compactHistory. Последние сообщения остаются дословно, исходная история сохраняется в журнале.'],
]

export function MayoriSettings({ preferences }) {
  const [value, setValue] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const mounted = useRef(false)
  const saving = useRef(false)
  const read = async () => {
    try { const next = await preferences.read(); if (mounted.current && !saving.current) { setValue(next); setError(next.error ?? '') } }
    catch (failure) { if (mounted.current) setError(failure.message) }
  }
  useEffect(() => { mounted.current = true; void read(); return () => { mounted.current = false } }, [preferences])
  useEffect(() => {
    if (!value?.pending) return
    const timer = setInterval(() => { void read() }, 1000)
    return () => clearInterval(timer)
  }, [value?.pending, preferences])
  const save = async (plugins, compaction = value?.compaction) => {
    if (saving.current || !value) return
    saving.current = true; setBusy(true); setError(''); setNotice('')
    try {
      const next = await preferences.update(plugins, value.revision, compaction)
      if (mounted.current) { setValue(next); setNotice('Настройки сохранены.') }
    } catch (failure) {
      if (mounted.current) setError(failure.message || 'Не удалось сохранить настройки. Попробуйте ещё раз.')
    } finally { saving.current = false; if (mounted.current) setBusy(false) }
  }
  return <section className="mayori-settings" aria-labelledby="mayori-settings-title">
    <h2 id="mayori-settings-title">Плагины</h2>
    <p>Включайте возможности для своих игр. Настройки действуют во всех чатах Mayori.</p>
    {!value && !error && <p role="status">Загрузка настроек…</p>}
    {error && <div role="alert"><p>{error}</p><button type="button" disabled={busy} onClick={() => { setError(''); void read() }}>Обновить настройки</button></div>}
    {value && <div className="mayori-plugin-list" aria-busy={busy}>
      {entries.map(([key, title, description]) => <label className="mayori-plugin-row" key={key}>
        <span><span className="mayori-plugin-title">{title}</span><span className="mayori-plugin-description" id={`mayori-plugin-${key}-help`}>{description}</span></span>
        <input type="checkbox" role="switch" aria-label={title} aria-describedby={`mayori-plugin-${key}-help`} checked={value.plugins[key]} disabled={busy} onChange={event => { void save({ ...value.plugins, [key]: event.target.checked }) }} />
      </label>)}
    </div>}
    <p className="mayori-plugin-note">Проверки используют кости автоматически. Переключатель «Кости» включает отдельные броски по формулам.</p>
    <p className="mayori-plugin-note">Сохранённые результаты и карточки бросков остаются в истории при выключении плагинов.</p>
    {value?.compaction && <CompactionSettings settings={value.compaction} busy={busy} onSave={options => save(value.plugins, options)} />}
    <p role="status" aria-live="polite">{value?.pending ? 'Настройки сохранены. Они применятся после завершения текущего ответа.' : notice}</p>
  </section>
}

export const PLUGIN_SETTINGS_STYLE = `
.mayori-settings { max-width: 42rem; color: inherit; }
.mayori-settings h2 { margin: 0 0 12px; font-size: 1.25rem; }
.mayori-settings p { line-height: 1.5; overflow-wrap: anywhere; }
.mayori-plugin-list { margin: 24px 0; }
.mayori-plugin-row { display: flex; align-items: center; gap: 20px; padding: 18px 0; border-bottom: 1px solid color-mix(in srgb, currentColor 15%, transparent); cursor: pointer; }
.mayori-plugin-row > span { flex: 1; min-width: 0; }
.mayori-plugin-title { display: block; font-weight: 600; margin-bottom: 5px; }
.mayori-plugin-description, .mayori-plugin-note { display: block; opacity: .75; line-height: 1.5; font-size: .9rem; }
.mayori-plugin-row input { appearance: none; color: inherit; width: 44px; height: 26px; flex: 0 0 44px; border: 1px solid color-mix(in srgb, currentColor 45%, transparent); border-radius: 999px; background: color-mix(in srgb, currentColor 12%, transparent); position: relative; cursor: pointer; margin: 0; }
.mayori-plugin-row input::before { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; top: 3px; left: 3px; background: currentColor; }
.mayori-plugin-row input:checked { background: var(--mayori-accent, #497568); border-color: var(--mayori-accent, #497568); color: white; }
.mayori-plugin-row input:checked::before { left: 21px; }
.mayori-plugin-row input:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
.mayori-plugin-row input:disabled { opacity: .5; cursor: wait; }
.mayori-compaction-form { margin-block: 24px; }
.mayori-compaction-form fieldset { margin: 0; padding: 0; border: 0; min-inline-size: 0; }
.mayori-compaction-form legend { font-weight: 600; font-size: 1.05rem; }
.mayori-compaction-numbers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.mayori-compaction-field { margin-block: 16px; min-inline-size: 0; }
.mayori-compaction-field label { display: block; margin-block-end: 8px; font-weight: 600; }
.mayori-compaction-field p { font-size: .9rem; color: var(--dsw-alias-label-secondary, GrayText); margin-block: 8px; }
.mayori-compaction-field :is(input, textarea) { box-sizing: border-box; inline-size: 100%; min-inline-size: 0; min-block-size: 42px; padding: 10px 12px; font: inherit; font-size: 16px; line-height: 1.5; color: inherit; background: var(--dsw-alias-bg-layer-1, Canvas); border: 1px solid var(--dsw-alias-border-l2, GrayText); border-radius: 8px; }
.mayori-compaction-field textarea { resize: vertical; }
.mayori-compaction-form :is(input, textarea, button, summary):focus-visible { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: 3px; }
.mayori-compaction-form button { padding: 10px 14px; min-block-size: 42px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2, GrayText); background: var(--dsw-alias-bg-layer-2, Canvas); color: inherit; font: inherit; cursor: pointer; }
.mayori-compaction-form button:disabled { opacity: .5; cursor: default; }
.mayori-compaction-form summary { cursor: pointer; padding-block: 12px; }
.mayori-compaction-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-block-start: 20px; }
.mayori-compaction-actions span { font-size: .9rem; }
@media (forced-colors: active) { .mayori-plugin-row input { appearance: auto; } }
/* Adapt the native settings shell only while this page occupies its section. */
@media (max-width: 600px) {
  .mayori-compaction-numbers { grid-template-columns: minmax(0, 1fr); gap: 0; }
  [data-shortcut-modal="settings"]:has(.mayori-settings) { flex-direction: column; }
  [data-shortcut-modal="settings"]:has(.mayori-settings) > nav { width: 100%; padding: 16px 12px 0; gap: 12px; }
  [data-shortcut-modal="settings"]:has(.mayori-settings) > nav > div:last-child { flex-direction: row; overflow-x: auto; flex-shrink: 0; }
  [data-shortcut-modal="settings"]:has(.mayori-settings) > nav button { flex: 0 0 auto; }
  [data-shortcut-modal="settings"]:has(.mayori-settings) > div:last-child { min-height: 0; }
}
`
