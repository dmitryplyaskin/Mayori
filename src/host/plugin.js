import { resolveConfig } from './config.js'
import { registerHostCapabilities } from './application.js'

export { Config } from './config.js'
export { buildDirectorPrompt } from './director.js'
export const name = 'mayori-director'
export const inject = ['systemPrompt']

/**
 * Register Mayori's capabilities and user-owned role-playing presets.
 *
 * @param {object} ctx - Cordis context carrying the system-prompt service.
 * @param {object} [config] - Mayori director configuration.
 * @returns {void}
 */
export function apply(ctx, config = {}) {
  const resolved = resolveConfig(config)
  registerHostCapabilities(ctx, resolved)
}
