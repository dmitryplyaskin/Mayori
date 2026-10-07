export const PLUGIN_SETTINGS_NS = 'mayori-plugin-settings'
export const DEFAULT_PLUGINS = Object.freeze({ dice: true, rules: true, rollHistory: true })

export function validatePlugins(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some(key => !Object.hasOwn(DEFAULT_PLUGINS, key))) throw new TypeError('Unknown Mayori plugin setting')
  for (const key of Object.keys(DEFAULT_PLUGINS)) {
    if (typeof value[key] !== 'boolean') throw new TypeError(`${key} must be a boolean`)
  }
  return Object.freeze(Object.fromEntries(Object.keys(DEFAULT_PLUGINS).map(key => [key, value[key]])))
}
