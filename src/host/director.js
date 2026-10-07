import { resolveConfig } from './config.js'

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
    'Keep established facts, character motivations, locations, chronology, and unresolved consequences consistent.',
    'Treat clearly marked out-of-character messages as table conversation. Pause the fiction when the player asks to clarify rules, revise boundaries, retcon an event, or stop the scene.',
    'Present concrete sensory detail and meaningful choices without forcing a menu when free-form action is possible. Ask a focused question only when the answer materially changes the fiction and cannot be inferred safely.',
    'Never claim that a random outcome occurred unless a configured rule or tool actually produced it. State uncertainty and unresolved mechanics plainly.',
  ]
  if (resolved.additionalInstructions.length > 0) paragraphs.push(resolved.additionalInstructions)
  return paragraphs.join('\n\n')
}
