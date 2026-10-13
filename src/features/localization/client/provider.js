import { en } from '../shared/en.js'
import { ru } from '../shared/messages.js'
import { nativeRu } from '../shared/native-ru.js'
import { bindLocalization, LocalizationService } from './service.js'

export class DshLocalizationProvider extends LocalizationService {
  constructor(locale) {
    super()
    this.locale = locale
    this.translate = locale.bind('mayori')
  }
  getSnapshot = () => this.locale.getSnapshot()
  subscribe = listener => this.locale.subscribe(listener)
  setLanguage = id => {
    if (!['ru', 'en'].includes(id)) throw new TypeError('Unsupported Mayori language')
    return this.locale.setLocale(id)
  }
}

/** Language definitions, dictionaries and the helper binding all unload with ctx. */
export function registerLocalization(ctx) {
  if (!ctx.locale.getSnapshot().locales.some(language => language.id.toLowerCase() === 'ru')) {
    ctx.effect(() => ctx.locale.addLanguage({ id: 'ru', label: 'Русский', fallback: 'en' }), 'mayori: Russian language')
  }
  ctx.effect(() => ctx.locale.register('mayori', 'en', en), 'mayori: English copy')
  ctx.effect(() => ctx.locale.register('mayori', 'ru', ru), 'mayori: Russian copy')
  for (const [namespace, dictionary] of Object.entries(nativeRu)) {
    ctx.effect(() => ctx.locale.register(namespace, 'ru', dictionary), `mayori: Russian ${namespace}`)
  }
  const provider = new DshLocalizationProvider(ctx.locale)
  ctx.provide('mayoriLocale', provider)
  ctx.effect(() => bindLocalization(provider), 'mayori: locale binding')
  return provider
}
