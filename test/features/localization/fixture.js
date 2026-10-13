import { formatMessage } from '../../../src/features/localization/shared/messages.js'

/** Small public LocaleFace fixture, including owned registration and revisions. */
export function createLocale(active = 'ru') {
  const listeners = new Set(), dictionaries = new Map()
  let snapshot = { active, locales: [{ id: 'en', label: 'English' }, { id: 'zh', label: '中文', fallback: 'en' }], revision: 0 }
  const publish = value => { snapshot = { ...snapshot, ...value, revision: snapshot.revision + 1 }; listeners.forEach(listener => listener()) }
  return {
    getSnapshot: () => snapshot,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    addLanguage: language => {
      publish({ locales: [...snapshot.locales, language] })
      return () => publish({ locales: snapshot.locales.filter(item => item.id !== language.id), active: snapshot.active === language.id ? 'en' : snapshot.active })
    },
    register: (namespace, id, dictionary) => {
      const key = `${namespace}:${id}`, previous = dictionaries.get(key)
      dictionaries.set(key, dictionary); publish({})
      return () => { if (previous) dictionaries.set(key, previous); else dictionaries.delete(key); publish({}) }
    },
    bind: namespace => (key, params) => {
      const value = dictionaries.get(`${namespace}:${snapshot.active}`)?.[key]
        ?? dictionaries.get(`${namespace}:en`)?.[key] ?? key
      return formatMessage(value, params)
    },
    setLocale: async id => { publish({ active: id }) },
    dictionaries,
    listenerCount: () => listeners.size,
  }
}
