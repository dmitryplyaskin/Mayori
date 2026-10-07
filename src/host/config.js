import z from '@deepseek-ai/schemastery'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

const configuredDshHome = typeof process.env.DSH_HOME === 'string' && process.env.DSH_HOME.trim() !== ''
  ? process.env.DSH_HOME
  : join(homedir(), '.dsh')
const DEFAULT_CHARACTERS_PATH = join(resolve(configuredDshHome), 'mayori', 'characters')
const DEFAULT_CAMPAIGNS_PATH = join(resolve(configuredDshHome), 'mayori', 'campaigns')
const DEFAULT_PERSONAS_PATH = join(resolve(configuredDshHome), 'mayori', 'personas')

/** Configuration accepted by the Mayori director plugin. */
export const Config = z.object({
  narratorName: z.string().default('Mayori'),
  languagePolicy: z.string().default('Reply in the language used by the player unless they request another.'),
  campaignStyle: z.string().default('Collaborative, character-driven role-playing with consequential choices.'),
  additionalInstructions: z.string().default(''),
  charactersPath: z.string().default(DEFAULT_CHARACTERS_PATH),
  campaignsPath: z.string().default(DEFAULT_CAMPAIGNS_PATH),
  personasPath: z.string().default(DEFAULT_PERSONAS_PATH),
})

const DEFAULTS = Object.freeze({
  narratorName: 'Mayori',
  languagePolicy: 'Reply in the language used by the player unless they request another.',
  campaignStyle: 'Collaborative, character-driven role-playing with consequential choices.',
  additionalInstructions: '',
  charactersPath: DEFAULT_CHARACTERS_PATH,
  campaignsPath: DEFAULT_CAMPAIGNS_PATH,
  personasPath: DEFAULT_PERSONAS_PATH,
})

/** Resolve Loader-normalized config and fail loudly for direct invalid calls. */
export function resolveConfig(config = {}) {
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
  if (typeof resolved.charactersPath !== 'string' || resolved.charactersPath.trim().length === 0) {
    throw new TypeError('charactersPath must be a non-empty string')
  }
  resolved.charactersPath = resolve(resolved.charactersPath.trim())
  if (typeof resolved.campaignsPath !== 'string' || resolved.campaignsPath.trim().length === 0) {
    throw new TypeError('campaignsPath must be a non-empty string')
  }
  resolved.campaignsPath = resolve(resolved.campaignsPath.trim())
  if (typeof resolved.personasPath !== 'string' || !resolved.personasPath.trim()) throw new TypeError('personasPath must be a non-empty string')
  resolved.personasPath = resolve(resolved.personasPath.trim())
  return resolved
}
