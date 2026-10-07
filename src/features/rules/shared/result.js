import { validateDiceResult } from '../../dice/shared/result.js'
import { projectDiceGroup } from '../../dice/shared/pool.js'
import { normalizeCheck, validateProfile, checkRolls, checkMeaning } from '../domain/check.js'

export function buildCheckResult(request, rules, dice) {
  const check = checkMeaning(request, rules, dice.values)
  const damage = request.damage && check && ['success', 'critical_success'].includes(check.outcome) && typeof dice.values.damage === 'number'
    ? { value: dice.values.damage, expression: check.outcome === 'critical_success' ? request.damage.critical ?? request.damage.normal : request.damage.normal } : null
  let consequence = null
  if (check?.outcome === 'critical_failure' && rules.criticalFailureEffects.length) {
    const index = dice.values.effect
    if (Number.isSafeInteger(index) && index >= 1 && index <= rules.criticalFailureEffects.length) consequence = { text: rules.criticalFailureEffects[index - 1], index }
  } else if (check && ['failure', 'critical_failure'].includes(check.outcome) && rules.failureEffect) consequence = { text: rules.failureEffect }
  return { schemaVersion: 1, ...(request.purpose ? { purpose: request.purpose } : {}), request, rules, check, damage, consequence, errors: dice.errors, dice }
}

export function compactCheckResult(result) {
  if (result.rollId) {
    const { margin, ...check } = result.check ?? {}
    return { rollId: result.rollId, check: result.check ? check : null,
      ...(result.damage ? { damage: result.damage.value } : {}),
      ...(result.consequence ? { consequence: result.consequence.text } : {}),
      ...(result.errors.length ? { errors: result.errors } : {}) }
  }
  // Historical compact records included the request and complete rules snapshot.
  const { dice, ...summary } = result
  return { ...summary, observations: dice.observations }
}

export function readCheckResult(content, meta) {
  try {
    if (!Array.isArray(content) || content.length !== 1 || content[0]?.type !== 'text' || content[0].text.length > 8_000_000) return null
    const value = JSON.parse(content[0].text)
    const full = Object.hasOwn(value, 'dice') ? value : meta?.kind === 'mayori-check' ? meta.result : null
    if (!full || full.schemaVersion !== 1 || !validateDiceResult(full.dice) || full.dice.schemaVersion !== 3) return null
    if (Object.hasOwn(full, 'rollId') && (typeof full.rollId !== 'string' || !full.rollId.trim())) return null
    const request = normalizeCheck(full.request), rules = validateProfile(full.rules)
    if (request.profile !== rules.id || full.dice.purpose !== request.purpose) return null
    const expected = checkRolls(request, rules)
    if (Object.keys(expected).length !== full.dice.details.length || full.dice.details.some(detail => detail.path.length !== 1 || expected[detail.path[0]] !== detail.expression)) return null
    const group = full.dice.details.find(detail => detail.path[0] === 'pool')
    if (!group?.error) {
      if (group?.dice.length !== 1) return null
      const pool = projectDiceGroup(group.dice[0])
      if (pool.sides !== rules.sides || pool.faces.length !== 1 || pool.faces[0] !== full.dice.values.natural) return null
    }
    const rebuilt = buildCheckResult(request, rules, full.dice)
    const { rollId, ...payload } = full
    if (JSON.stringify(rebuilt) !== JSON.stringify(payload)) return null
    if (!Object.hasOwn(value, 'dice') && JSON.stringify(compactCheckResult(full)) !== JSON.stringify(value)) return null
    return full
  } catch { return null }
}
