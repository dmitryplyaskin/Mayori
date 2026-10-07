import { resolveConfig } from './config.js'
import { buildDirectorPrompt } from './director.js'
import { registerHostCapabilities } from './application.js'

export { Config } from './config.js'
export { buildDirectorPrompt } from './director.js'
export const name = 'mayori-director'
export const inject = ['systemPrompt']

/**
 * Register Mayori's ordered game-master guidance.
 *
 * @param {object} ctx - Cordis context carrying the system-prompt service.
 * @param {object} [config] - Mayori director configuration.
 * @returns {void}
 */
export function apply(ctx, config = {}) {
  const resolved = resolveConfig(config)
  ctx.systemPrompt.section({
    name: 'mayori:director',
    order: 10,
    interpolate: false,
    text: buildDirectorPrompt(resolved),
  })
  registerHostCapabilities(ctx, resolved)
}
