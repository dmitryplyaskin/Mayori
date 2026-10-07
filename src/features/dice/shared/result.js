/** Browser-safe durable dice result contract; versions 1 and unversioned logs remain readable. */
import { diceObservations } from './pool.js'
export const DICE_RESULT_VERSION = 3
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const numeric = value => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER
const scalar = value => numeric(value) || typeof value === 'boolean'
const pathValid = path => Array.isArray(path) && path.length <= 64 && path.every(key => typeof key === 'string' || (Number.isSafeInteger(key) && key >= 0))
const indices = (list, maximum) => Array.isArray(list) && list.every((index, at) => Number.isSafeInteger(index) && index >= 0 && index < maximum && (at === 0 || index > list[at - 1]))
const comparators = ['>', '>=', '<', '<=', '==', '!=']

/** Model projection: the complete trace stays in the recorded metadata. */
export function compactDiceResult(result) {
  return { rollId: result.rollId, values: result.values, ...(result.errors.length ? { errors: result.errors } : {}) }
}

export function readDiceResult(content, meta) {
  if (!Array.isArray(content) || content.length !== 1 || content[0]?.type !== 'text' || typeof content[0].text !== 'string' || content[0].text.length > 8_000_000) return null
  let value
  try { value = JSON.parse(content[0].text) } catch { return null }
  if (record(value) && !Object.hasOwn(value, 'details')) {
    if (Object.hasOwn(value, 'rollId')) {
      const full = meta?.kind === 'mayori-dice' ? validateDiceResult(meta.result) : null
      return full?.schemaVersion === 3 && full.rollId === value.rollId && JSON.stringify(compactDiceResult(full)) === JSON.stringify(value) ? full : null
    }
    if (![1, 2, 3].includes(value.schemaVersion) || !record(meta) || meta.kind !== 'mayori-dice') return null
    const full = validateDiceResult(meta.result)
    const fields = value.schemaVersion >= 2 ? ['schemaVersion', 'purpose', 'values', 'errors', ...(value.schemaVersion === 3 ? ['observations'] : [])] : ['schemaVersion', 'purpose', 'values', 'error']
    if (!full || full.schemaVersion !== value.schemaVersion || Object.keys(value).some(key => !fields.includes(key))
      || fields.some(key => JSON.stringify(value[key]) !== JSON.stringify(full[key]))) return null
    return full
  }
  return validateDiceResult(value)
}
export function validateDiceResult(value) {
  if (!record(value) || (Object.hasOwn(value, 'schemaVersion') && ![1, 2, 3].includes(value.schemaVersion))
    || (Object.hasOwn(value, 'rollId') && (typeof value.rollId !== 'string' || !value.rollId.trim()))
    || (value.purpose !== undefined && (typeof value.purpose !== 'string' || !value.purpose.trim() || value.purpose.length > 2000))
    || !Array.isArray(value.details) || !value.details.length || value.details.length > 1000) return null
  const v2 = value.schemaVersion >= 2, paths = new Map(), drawIndices = new Set()
  let faces = 0
  for (const detail of value.details) {
    if (!record(detail) || !pathValid(detail.path) || typeof detail.expression !== 'string' || detail.expression.length > 100_000
      || (!detail.expression.trim() && !(v2 && detail.error)) || !Array.isArray(detail.dice)
      || (detail.error === undefined ? !(v2 ? scalar : numeric)(detail.value) : typeof detail.error !== 'string' || !detail.error)
      || (v2 && detail.error !== undefined && (detail.value !== null || typeof detail.code !== 'string' || !detail.code))) return null
    const key = JSON.stringify(detail.path)
    if (paths.has(key)) return null
    paths.set(key, detail)
    if (v2 && (!Array.isArray(detail.references) || detail.references.length > 8192 || !detail.references.every(ref => record(ref) && pathValid(ref.path) && scalar(ref.value))
      || !Array.isArray(detail.decisions) || detail.decisions.length > 8192 || !detail.decisions.every(decision => record(decision) && typeof decision.condition === 'boolean'
        && (decision.operator === 'if' ? decision.branch === (decision.condition ? 'then' : 'else')
          : ['and', 'or'].includes(decision.operator) && decision.branch === ((decision.operator === 'and' ? !decision.condition : decision.condition) ? 'short-circuit' : 'right'))))) return null
    for (const dice of detail.dice) {
      if (!record(dice) || !Number.isSafeInteger(dice.sides) || dice.sides < 1 || dice.sides > 1_000_000_000 || !Array.isArray(dice.results)
        || (!dice.results.length && !(v2 && detail.error))) return null
      faces += dice.results.length
      if (faces > 100_000 || !dice.results.every(face => Number.isSafeInteger(face) && face >= 1 && face <= dice.sides)) return null
      if (dice.keep !== undefined && (!record(dice.keep) || !['highest', 'lowest'].includes(dice.keep.mode)
        || !Number.isSafeInteger(dice.keep.count) || dice.keep.count < 1 || dice.keep.count > (v2 ? dice.count : dice.results.length))) return null
      if (dice.keptIndices !== undefined && !indices(dice.keptIndices, dice.results.length)) return null
      if (!v2) {
        if (dice.keep ? dice.keptIndices?.length !== dice.keep.count : dice.keptIndices !== undefined) return null
        continue
      }
      if (!Number.isSafeInteger(dice.count) || dice.count < 1 || dice.count > 100_000 || !Array.isArray(dice.draws) || dice.draws.length !== dice.results.length) return null
      for (const [index, draw] of dice.draws.entries()) {
        if (!record(draw) || !Number.isSafeInteger(draw.drawIndex) || draw.drawIndex < 0 || draw.drawIndex >= 100_000 || drawIndices.has(draw.drawIndex)
          || (index > 0 && draw.drawIndex <= dice.draws[index - 1].drawIndex) || !Number.isSafeInteger(draw.die) || draw.die < 0 || draw.die >= dice.count
          || !['initial', 'explode', 'reroll'].includes(draw.reason)
          || (draw.reason === 'reroll' ? !Number.isSafeInteger(draw.replaces) || draw.replaces < 0 || draw.replaces >= index || dice.draws[draw.replaces].die !== draw.die : draw.replaces !== undefined)) return null
        drawIndices.add(draw.drawIndex)
      }
      if (dice.explode !== undefined && dice.explode !== true) return null
      if (dice.reroll !== undefined && (!record(dice.reroll) || typeof dice.reroll.once !== 'boolean' || !comparators.includes(dice.reroll.operator) || !numeric(dice.reroll.threshold))) return null
      if (dice.explode || dice.reroll) {
        if (!Array.isArray(dice.chains) || dice.chains.length > dice.count || (!detail.error && dice.chains.length !== dice.count)) return null
        for (const [die, chain] of dice.chains.entries()) {
          if (!record(chain) || !indices(chain.indices, dice.results.length) || !chain.indices.every(index => dice.draws[index].die === die)
            || (chain.value === undefined ? !detail.error : !numeric(chain.value) || chain.value !== chain.indices.reduce((sum, index) => sum + dice.results[index], 0))) return null
        }
        if (!detail.error && dice.keptIndices === undefined) return null
        if (dice.keptIndices !== undefined) {
          const kept = new Set(dice.keptIndices)
          const selected = dice.chains.filter(chain => chain.indices.some(index => kept.has(index)))
          if (selected.some(chain => !chain.indices.every(index => kept.has(index)))
            || selected.flatMap(chain => chain.indices).length !== kept.size || selected.length !== (dice.keep?.count ?? dice.count)) return null
        }
      } else if (dice.chains !== undefined || (!detail.error && dice.results.length !== dice.count)
        || (dice.keep ? !detail.error && dice.keptIndices?.length !== dice.keep.count : dice.keptIndices !== undefined)) return null
    }
  }
  if (v2) {
    if (value.error !== undefined || !Array.isArray(value.errors) || value.errors.length > 1000) return null
    const errors = new Map()
    for (const error of value.errors) {
      if (!record(error) || !pathValid(error.path) || typeof error.code !== 'string' || typeof error.message !== 'string') return null
      const key = JSON.stringify(error.path), detail = paths.get(key)
      if (errors.has(key) || !detail?.error || detail.error !== error.message || detail.code !== error.code) return null
      errors.set(key, error)
    }
    if (value.details.filter(detail => detail.error).length !== errors.size || !validTree(value.values, paths, true)) return null
    for (const index of drawIndices) if (index >= drawIndices.size) return null
    for (const detail of value.details) for (const ref of detail.references) if (paths.get(JSON.stringify(ref.path))?.value !== ref.value) return null
  } else if (value.error !== undefined) {
    const last = value.details.at(-1)
    if (value.values !== null || !record(value.error) || !pathValid(value.error.path) || typeof value.error.message !== 'string' || !value.error.message
      || JSON.stringify(value.error.path) !== JSON.stringify(last.path) || value.error.message !== last.error || value.details.slice(0, -1).some(detail => detail.error !== undefined)) return null
  } else if (value.details.some(detail => detail.error !== undefined) || !validTree(value.values, paths, false)) return null
  if (value.schemaVersion === 3 && JSON.stringify(value.observations) !== JSON.stringify(diceObservations(value.details))) return null
  return value
}
function validTree(values, paths, v2) {
  if (values === null || typeof values !== 'object') return false
  const pending = [[values, []]]
  let nodes = 0, leaves = 0
  while (pending.length) {
    const [node, path] = pending.pop()
    if (++nodes > 10_000 || path.length > 64) return false
    if (numeric(node) || (v2 && (typeof node === 'boolean' || node === null))) {
      const detail = paths.get(JSON.stringify(path))
      if (!detail || detail.value !== node || (node === null && !detail.error)) return false
      leaves++
    } else if (Array.isArray(node)) node.forEach((child, index) => pending.push([child, [...path, index]]))
    else if (record(node)) Object.entries(node).forEach(([key, child]) => pending.push([child, [...path, key]]))
    else return false
  }
  return leaves === paths.size
}
export function dicePurpose(block) {
  const observed = block?.args?.textPrefix?.('purpose', 2000) ?? block?.args?.text?.('purpose')
  if (typeof observed === 'string') return observed
  try { const args = JSON.parse(block?.call?.argsRaw ?? block?.argsRaw ?? '{}'); return typeof args.purpose === 'string' ? args.purpose : '' } catch { return '' }
}
