import { formatMessage, translateNotice } from '../shared/messages.js'

/** Browser presentation seam; the DSH locale service owns durable preference. */
export class LocalizationService {
  translate() { throw new Error('LocalizationService.translate() is not implemented') }
  getSnapshot() { throw new Error('LocalizationService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('LocalizationService.subscribe() is not implemented') }
  setLanguage() { throw new Error('LocalizationService.setLanguage() is not implemented') }
}

// Pure helpers and callbacks share the same presentation provider as slot consumers.
// Binding is owned by a Cordis effect and restored on unload.
let active
export function bindLocalization(provider) {
  const previous = active
  active = provider
  return () => { if (active === provider) active = previous }
}

export const tr = (key, params) => active ? active.translate(key, params) : formatMessage(key, params)
export const noticeText = text => translateNotice(text, tr)
export const currentLanguage = () => active?.getSnapshot().active ?? 'ru'
export const formatLocale = () => currentLanguage().toLowerCase().startsWith('ru') ? 'ru-RU' : 'en-US'
