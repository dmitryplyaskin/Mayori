/** Browser-safe durable dice-result contract. Legacy unversioned records remain readable. */
export const DICE_RESULT_VERSION = 1

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const numeric = value => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER
const pathValid = path => Array.isArray(path) && path.length <= 64
  && path.every(key => typeof key === 'string' || (Number.isSafeInteger(key) && key >= 0))

/** Decode recorded content conservatively; unsupported records use the raw UI fallback. */
export function readDiceResult(content, meta) {
  if (!Array.isArray(content) || content.length !== 1 || content[0]?.type !== 'text' || typeof content[0].text !== 'string'
    || content[0].text.length > 2_000_000) return null
  let value
  try { value = JSON.parse(content[0].text) } catch { return null }
  if (record(value) && !Object.hasOwn(value, 'details')) {
    // A compact model response and its durable UI trace must describe the same outcome.
    if (value.schemaVersion !== DICE_RESULT_VERSION || !record(meta) || meta.kind !== 'mayori-dice') return null
    const full = validateDiceResult(meta.result)
    if (!full || full.schemaVersion !== DICE_RESULT_VERSION
      || Object.keys(value).some(key => !['schemaVersion', 'purpose', 'values', 'error'].includes(key))
      || ['schemaVersion', 'purpose', 'values', 'error'].some(key => JSON.stringify(value[key]) !== JSON.stringify(full[key]))) return null
    return full
  }
  return validateDiceResult(value)
}

function validateDiceResult(value) {
  if (!record(value) || (Object.hasOwn(value, 'schemaVersion') && value.schemaVersion !== DICE_RESULT_VERSION)
    || (value.purpose !== undefined && (typeof value.purpose !== 'string' || !value.purpose.trim() || value.purpose.length > 2000))
    || !Array.isArray(value.details) || !value.details.length || value.details.length > 1000) return null
  const paths = new Set()
  let faces = 0
  for (const detail of value.details) {
    if (!record(detail) || !pathValid(detail.path) || typeof detail.expression !== 'string'
      || !detail.expression.trim() || detail.expression.length > 8192 || !Array.isArray(detail.dice)
      || (detail.error === undefined ? !numeric(detail.value) : typeof detail.error !== 'string' || !detail.error)) return null
    const key = JSON.stringify(detail.path)
    if (paths.has(key)) return null
    paths.add(key)
    for (const dice of detail.dice) {
      if (!record(dice) || !Number.isSafeInteger(dice.sides) || dice.sides < 1 || dice.sides > 1_000_000_000
        || !Array.isArray(dice.results) || !dice.results.length) return null
      faces += dice.results.length
      if (faces > 100_000 || !dice.results.every(face => Number.isSafeInteger(face) && face >= 1 && face <= dice.sides)) return null
      if (dice.keep !== undefined) {
        if (!record(dice.keep) || !['highest', 'lowest'].includes(dice.keep.mode)
          || !Number.isSafeInteger(dice.keep.count) || dice.keep.count < 1 || dice.keep.count > dice.results.length
          || !Array.isArray(dice.keptIndices) || dice.keptIndices.length !== dice.keep.count) return null
        let previous = -1
        for (const index of dice.keptIndices) {
          if (!Number.isSafeInteger(index) || index <= previous || index >= dice.results.length) return null
          previous = index
        }
      } else if (dice.keptIndices !== undefined) return null
    }
  }
  if (value.error !== undefined) {
    const last = value.details.at(-1)
    if (value.values !== null || !record(value.error) || !pathValid(value.error.path)
      || typeof value.error.message !== 'string' || !value.error.message
      || JSON.stringify(value.error.path) !== JSON.stringify(last.path) || value.error.message !== last.error
      || value.details.slice(0, -1).some(detail => detail.error !== undefined)) return null
  } else {
    if (value.values === null || typeof value.values !== 'object' || value.details.some(detail => detail.error !== undefined)) return null
    const pending = [[value.values, []]]
    let nodes = 0, leaves = 0
    while (pending.length) {
      const [node, path] = pending.pop()
      if (++nodes > 10_000 || path.length > 64) return null
      if (numeric(node)) {
        if (!paths.has(JSON.stringify(path))) return null
        leaves++
      } else if (Array.isArray(node)) node.forEach((child, index) => pending.push([child, [...path, index]]))
      else if (record(node)) Object.entries(node).forEach(([key, child]) => pending.push([child, [...path, key]]))
      else return null
    }
    if (leaves !== value.details.length) return null
    for (const detail of value.details) {
      let actual = value.values
      for (const key of detail.path) {
        if (actual === null || typeof actual !== 'object' || !Object.hasOwn(actual, key)
          || (Array.isArray(actual) ? typeof key !== 'number' : typeof key !== 'string')) return null
        actual = actual[key]
      }
      if (actual !== detail.value) return null
    }
  }
  return value
}

/** Observe preparing arguments in render so DSH publishes updates to the purpose. */
export function dicePurpose(block) {
  const observed = block?.args?.textPrefix?.('purpose', 2000) ?? block?.args?.text?.('purpose')
  if (typeof observed === 'string') return observed
  try {
    const args = JSON.parse(block?.call?.argsRaw ?? block?.argsRaw ?? '{}')
    return typeof args.purpose === 'string' ? args.purpose : ''
  } catch { return '' }
}
