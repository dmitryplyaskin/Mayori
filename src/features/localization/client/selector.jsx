import { useId, useState, useSyncExternalStore } from 'react'
import { Select } from '../../../client/components/select.jsx'
import { noticeText, tr } from './service.js'

/** Shares selection and persistence with the native DSH Language row. */
export function LanguageSelector({ localization }) {
  const id = useId()
  const snapshot = useSyncExternalStore(localization.subscribe, localization.getSnapshot, localization.getSnapshot)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const select = async value => {
    setError(''); setBusy(true)
    try { await localization.setLanguage(value) }
    catch { setError('Не удалось сохранить язык. Попробуйте ещё раз.') }
    finally { setBusy(false) }
  }
  return <div className="mayori-language-setting">
    <label htmlFor={id}>{tr('Язык')}</label>
    <Select id={id} aria-label={tr('Язык')} value={snapshot.active} disabled={busy} portal={false}
      options={snapshot.locales.filter(language => ['ru', 'en', snapshot.active].includes(language.id))
        .map(language => ({ value: language.id, label: language.label }))} onChange={value => { void select(value) }} />
    {error && <p role="alert">{noticeText(error)}</p>}
  </div>
}
