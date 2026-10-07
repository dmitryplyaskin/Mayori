export const DEFAULT_DICE_CONFIG = Object.freeze({
  maxSides: 1_000_000, maxDice: 1000, maxExpressions: 100, maxDepth: 16,
  maxNodes: 1000, maxExpressionLength: 1024, maxExpressionDepth: 64, maxPurposeLength: 300,
  maxExtraRollsPerDie: 100, maxDependencyDepth: 64,
})
const CONFIG_CEILINGS = Object.freeze({
  maxSides: 1_000_000_000, maxDice: 100_000, maxExpressions: 1000, maxDepth: 64,
  maxNodes: 10_000, maxExpressionLength: 8192, maxExpressionDepth: 128, maxPurposeLength: 2000,
  maxExtraRollsPerDie: 10_000, maxDependencyDepth: 128,
})
export function resolveDiceConfig(config = {}) {
  const resolved = { ...DEFAULT_DICE_CONFIG, ...config }
  for (const key of Object.keys(resolved)) {
    if (!Object.hasOwn(CONFIG_CEILINGS, key)) throw new TypeError(`Unknown dice config field: ${key}`)
    if (!Number.isSafeInteger(resolved[key]) || resolved[key] < 1 || resolved[key] > CONFIG_CEILINGS[key]) throw new TypeError(`${key} must be an integer from 1 to ${CONFIG_CEILINGS[key]}`)
  }
  return Object.freeze(resolved)
}
