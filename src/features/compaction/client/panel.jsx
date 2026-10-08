import { useEffect, useRef, useState } from 'react'
import { DEFAULT_COMPACTION_INSTRUCTIONS, validateCompaction } from '../shared/settings.js'

export function CompactionSettings({ settings, busy, onSave }) {
  const [draft, setDraft] = useState(settings)
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState('')
  const form = useRef(null)
  const confirmed = useRef(JSON.stringify(settings))
  useEffect(() => {
    const next = JSON.stringify(settings)
    if (next !== confirmed.current) { confirmed.current = next; setDraft(settings); setError(''); setInvalid('') }
  }, [settings])
  const change = (key, value) => { setDraft(current => ({ ...current, [key]: value })); setError(''); setInvalid('') }
  const submit = event => {
    event.preventDefault()
    try {
      const options = validateCompaction(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, key === 'instructions' ? value : Number(value)])))
      void onSave(options)
    } catch (failure) {
      const field = failure.field ?? 'instructions'
      setError(failure.message); setInvalid(field)
      form.current?.querySelector(`#mayori-compaction-${field}`)?.focus()
    }
  }
  const normalized = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, key === 'instructions' ? value : Number(value)]))
  const dirty = JSON.stringify(normalized) !== JSON.stringify(settings)
  const number = (key, label, min, max, help) => <div className="mayori-compaction-field">
    <label htmlFor={`mayori-compaction-${key}`}>{label}</label>
    <input id={`mayori-compaction-${key}`} type="number" min={min} max={max} step="1" required value={draft[key]}
      aria-invalid={invalid === key || undefined} aria-describedby={`mayori-compaction-${key}-help${invalid === key ? ' mayori-compaction-error' : ''}`} onChange={event => change(key, event.target.value)} />
    <p id={`mayori-compaction-${key}-help`}>{help}</p>
  </div>
  return <form ref={form} className="mayori-compaction-form" onSubmit={submit} aria-labelledby="mayori-compaction-title">
    <fieldset disabled={busy}>
      <legend id="mayori-compaction-title">Настройки сжатия</legend>
      <p>Настройте сжатие перед включением или измените его для следующих ходов. Все поля обязательны.</p>
      <div className="mayori-compaction-numbers">
        {number('thresholdPercent', 'Порог заполнения контекста, %', 1, 99, 'Сжатие начинается у этого порога или раньше, если нужен запас для ответа.')}
        {number('retainPercent', 'Оставлять последние сообщения, %', 0, 98, 'Доля доступного контекста, которую сохраняем дословно. Должна быть меньше порога сжатия.')}
      </div>
      <div className="mayori-compaction-field">
        <label htmlFor="mayori-compaction-instructions">Инструкция сжатия</label>
        <p id="mayori-compaction-instructions-help">Опишите, какие сведения сохранить, язык и структуру изложения. Эта инструкция используется только при сжатии.</p>
        <textarea id="mayori-compaction-instructions" rows="12" maxLength={32768} required value={draft.instructions}
          aria-invalid={invalid === 'instructions' || undefined} aria-describedby={`mayori-compaction-instructions-help${invalid === 'instructions' ? ' mayori-compaction-error' : ''}`} onChange={event => change('instructions', event.target.value)} />
        <button type="button" onClick={() => change('instructions', DEFAULT_COMPACTION_INSTRUCTIONS)}>Вернуть игровую инструкцию</button>
      </div>
      <details>
        <summary>Лимиты в токенах</summary>
        <div className="mayori-compaction-numbers">
          {number('maxSummaryTokens', 'Лимит ответа для изложения', 1, 65536, 'Включает размышления, если модель учитывает их в лимите ответа. Незавершённое изложение не заменяет историю.')}
          {number('headroomTokens', 'Дополнительный запас контекста', 0, 65536, 'Резерв сверх места для обычного ответа. Для моделей с небольшим окном уменьшите это значение.')}
        </div>
      </details>
      {error && <p id="mayori-compaction-error" role="alert">{error}</p>}
      <div className="mayori-compaction-actions">
        <button type="submit" disabled={!dirty}>Сохранить настройки сжатия</button>
        {dirty && <span>Есть несохранённые изменения.</span>}
      </div>
    </fieldset>
  </form>
}
