import { useEffect, useRef, useState } from 'react'

const entries = [
  ['dice', 'Кости', 'Броски по формулам: обычные кости, пулы, перебросы и взрывающиеся кости.'],
  ['rules', 'Проверки', 'Проверки сложности, преимущество, криты, урон и последствия по выбранным правилам.'],
  ['rollHistory', 'Подробности бросков', 'Модель может отдельно запросить полную развёртку сохранённого броска.'],
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
  const toggle = async (key, enabled) => {
    if (saving.current || !value) return
    saving.current = true; setBusy(true); setError(''); setNotice('')
    try {
      const next = await preferences.update({ ...value.plugins, [key]: enabled }, value.revision)
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
        <input type="checkbox" role="switch" aria-label={title} aria-describedby={`mayori-plugin-${key}-help`} checked={value.plugins[key]} disabled={busy} onChange={event => { void toggle(key, event.target.checked) }} />
      </label>)}
    </div>}
    <p className="mayori-plugin-note">Проверки используют кости автоматически. Переключатель «Кости» включает отдельные броски по формулам.</p>
    <p className="mayori-plugin-note">Сохранённые результаты и карточки бросков остаются в истории при выключении плагинов.</p>
    <p role="status" aria-live="polite">{value?.pending ? 'Настройки сохранены. Плагины переключатся после завершения текущего ответа.' : notice}</p>
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
@media (forced-colors: active) { .mayori-plugin-row input { appearance: auto; } }
/* Adapt the native settings shell only while this page occupies its section. */
@media (max-width: 600px) {
  [data-shortcut-modal="settings"]:has(.mayori-settings) { flex-direction: column; }
  [data-shortcut-modal="settings"]:has(.mayori-settings) > nav { width: 100%; padding: 16px 12px 0; gap: 12px; }
  [data-shortcut-modal="settings"]:has(.mayori-settings) > nav > div:last-child { flex-direction: row; overflow-x: auto; flex-shrink: 0; }
  [data-shortcut-modal="settings"]:has(.mayori-settings) > nav button { flex: 0 0 auto; }
  [data-shortcut-modal="settings"]:has(.mayori-settings) > div:last-child { min-height: 0; }
}
`
