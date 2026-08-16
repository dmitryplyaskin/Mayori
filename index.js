/**
 * Mayori's first model-experience plugin for DeepSeek Harness.
 *
 * The bundle owns the deployment persona while this module contributes the
 * configurable operating rules that follow it in the assembled system prompt.
 *
 * @module dsh-mayori
 */

import z from '@deepseek-ai/schemastery'

export const name = 'mayori-director'
export const inject = ['systemPrompt']

/** Configuration accepted by the Mayori director plugin. */
export const Config = z.object({
  narratorName: z.string().default('Mayori'),
  languagePolicy: z.string().default('Reply in the language used by the player unless they request another.'),
  campaignStyle: z.string().default('Collaborative, character-driven role-playing with consequential choices.'),
  additionalInstructions: z.string().default(''),
})

const DEFAULTS = Object.freeze({
  narratorName: 'Mayori',
  languagePolicy: 'Reply in the language used by the player unless they request another.',
  campaignStyle: 'Collaborative, character-driven role-playing with consequential choices.',
  additionalInstructions: '',
})

/** Resolve Loader-normalized config and fail loudly for direct invalid calls. */
function resolveConfig(config = {}) {
  const resolved = { ...DEFAULTS, ...config }
  for (const field of ['narratorName', 'languagePolicy', 'campaignStyle']) {
    const value = resolved[field]
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new TypeError(`${field} must be a non-empty string`)
    }
    resolved[field] = value.trim()
  }
  if (typeof resolved.additionalInstructions !== 'string') {
    throw new TypeError('additionalInstructions must be a string')
  }
  resolved.additionalInstructions = resolved.additionalInstructions.trim()
  return resolved
}

/**
 * Render Mayori's stable game-master rules from deployment configuration.
 *
 * @param {object} [config] - Loader-normalized plugin configuration.
 * @returns {string} The model-facing prompt section.
 */
export function buildDirectorPrompt(config = {}) {
  const resolved = resolveConfig(config)
  const paragraphs = [
    `${resolved.narratorName} facilitates ${resolved.campaignStyle}`,
    resolved.languagePolicy,
    'Protect player agency. Describe the world, portray non-player characters, and resolve consequences, but never choose the player character\'s thoughts, words, or voluntary actions.',
    'Keep established facts, character motivations, locations, chronology, and unresolved consequences consistent. If campaign files exist in the workspace, treat them as canonical; update them only after events become established in play.',
    'Treat clearly marked out-of-character messages as table conversation. Pause the fiction when the player asks to clarify rules, revise boundaries, retcon an event, or stop the scene.',
    'Present concrete sensory detail and meaningful choices without forcing a menu when free-form action is possible. Ask a focused question only when the answer materially changes the fiction and cannot be inferred safely.',
    'Never claim that a random outcome occurred unless a configured rule or tool actually produced it. State uncertainty and unresolved mechanics plainly.',
  ]
  if (resolved.additionalInstructions.length > 0) paragraphs.push(resolved.additionalInstructions)
  return paragraphs.join('\n\n')
}

/**
 * Register Mayori's ordered game-master guidance.
 *
 * @param {object} ctx - Cordis context carrying the system-prompt service.
 * @param {object} [config] - Mayori director configuration.
 * @returns {void}
 */
export function apply(ctx, config = {}) {
  ctx.systemPrompt.section({
    name: 'mayori:director',
    order: 10,
    text: buildDirectorPrompt(config),
  })
}
