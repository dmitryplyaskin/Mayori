/** Explicit, versioned numeric-check policies. No platform SDK or hidden campaign state. */
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const text = (value, limit) => typeof value === 'string' && value.length <= limit
const numeric = value => typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER
const fields = ['id', 'version', 'sides', 'criticalSuccessMin', 'criticalFailureMax', 'naturalFailureMax', 'failureEffect', 'criticalFailureEffects']
export const DEFAULT_RULES_PROFILES = [
  { id: 'standard', version: '1', sides: 20, criticalSuccessMin: 0, criticalFailureMax: 0, naturalFailureMax: 0, failureEffect: '', criticalFailureEffects: [] },
  { id: 'd20-critical', version: '1', sides: 20, criticalSuccessMin: 20, criticalFailureMax: 1, naturalFailureMax: 1, failureEffect: '', criticalFailureEffects: [] },
  { id: 'd20-attack', version: '1', sides: 20, criticalSuccessMin: 20, criticalFailureMax: 0, naturalFailureMax: 1, failureEffect: '', criticalFailureEffects: [] },
]

export function validateProfile(profile) {
  if (!record(profile) || Object.keys(profile).some(key => !fields.includes(key))) throw new TypeError('Invalid rules profile fields')
  const value = { criticalSuccessMin: 0, criticalFailureMax: 0, naturalFailureMax: 0, failureEffect: '', criticalFailureEffects: [], ...profile }
  if (!text(value.id, 64) || !/^[a-z][a-z0-9-]*$/.test(value.id) || !text(value.version, 64) || !value.version.trim()) throw new TypeError('Rules profiles need an id and a non-empty version')
  if (!Number.isSafeInteger(value.sides) || value.sides < 2 || value.sides > 1_000_000_000) throw new TypeError('Rules sides must be an integer from 2 to 1000000000')
  for (const key of ['criticalSuccessMin', 'criticalFailureMax', 'naturalFailureMax']) {
    if (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] > value.sides) throw new TypeError(`${key} must be 0 (disabled) or a face within the die`)
  }
  if (value.criticalSuccessMin && value.criticalSuccessMin <= Math.max(value.criticalFailureMax, value.naturalFailureMax)) throw new TypeError('Critical success and failure ranges must not overlap')
  if (!text(value.failureEffect, 1000) || !Array.isArray(value.criticalFailureEffects) || value.criticalFailureEffects.length > 100
    || !value.criticalFailureEffects.every(effect => text(effect, 1000) && effect.trim())) throw new TypeError('Effects must be bounded text; critical failure tables allow at most 100 entries')
  if (value.criticalFailureEffects.length && !value.criticalFailureMax) throw new TypeError('A critical failure table needs an enabled critical failure rule')
  return structuredClone(value)
}

export function resolveRulesConfig(config = {}) {
  if (!record(config) || Object.keys(config).some(key => key !== 'profiles')) throw new TypeError('Unknown Rules config field')
  const profiles = config.profiles ?? DEFAULT_RULES_PROFILES
  if (!Array.isArray(profiles) || !profiles.length || profiles.length > 32) throw new TypeError('Rules config needs 1 to 32 profiles')
  const validated = profiles.map(validateProfile)
  if (new Set(validated.map(profile => profile.id)).size !== validated.length) throw new TypeError('Rules profile ids must be unique')
  return { profiles: validated }
}

export function normalizeCheck(input) {
  if (!record(input) || Object.keys(input).some(key => !['profile', 'modifier', 'target', 'mode', 'damage', 'purpose', 'details'].includes(key))) throw new TypeError('Invalid check fields')
  if (!text(input.profile, 64) || !input.profile) throw new TypeError('Select a configured rules profile')
  if (!numeric(input.modifier ?? 0) || !numeric(input.target)) throw new TypeError('modifier and target must be finite safe-range numbers')
  const mode = input.mode ?? 'normal'
  if (!['normal', 'advantage', 'disadvantage'].includes(mode)) throw new TypeError('Invalid check mode')
  if (input.details !== undefined && typeof input.details !== 'boolean') throw new TypeError('details must be boolean')
  if (input.purpose !== undefined && (!text(input.purpose, 2000) || !input.purpose.trim())) throw new TypeError('purpose must be non-empty text')
  if (input.damage !== undefined && (!record(input.damage) || Object.keys(input.damage).some(key => !['normal', 'critical'].includes(key))
    || !text(input.damage.normal, 8192) || !input.damage.normal.trim()
    || (input.damage.critical !== undefined && (!text(input.damage.critical, 8192) || !input.damage.critical.trim())))) throw new TypeError('damage needs normal and optional critical expressions')
  return { profile: input.profile, modifier: input.modifier ?? 0, target: input.target, mode,
    ...(input.damage ? { damage: structuredClone(input.damage) } : {}), ...(input.purpose === undefined ? {} : { purpose: input.purpose.trim() }) }
}

export function checkRolls(request, rules) {
  const pool = request.mode === 'normal' ? `d${rules.sides}` : `2d${rules.sides}${request.mode === 'advantage' ? 'kh' : 'kl'}1`
  const critical = rules.criticalSuccessMin ? `$natural >= ${rules.criticalSuccessMin}` : 'false'
  const fumble = rules.criticalFailureMax ? `$natural <= ${rules.criticalFailureMax}` : 'false'
  const miss = rules.naturalFailureMax ? `$natural <= ${rules.naturalFailureMax}` : 'false'
  const rolls = { pool, natural: 'face($pool)', total: `$pool + (${numberLiteral(request.modifier)})`,
    critical, fumble, naturalFailure: miss, hit: `if($critical, true, if($fumble or $naturalFailure, false, $total >= (${numberLiteral(request.target)})))` }
  if (request.damage) rolls.damage = `if($hit, if($critical, (${request.damage.critical ?? request.damage.normal}) + 0, (${request.damage.normal}) + 0), 0)`
  if (rules.criticalFailureEffects.length) rolls.effect = `if($fumble, d${rules.criticalFailureEffects.length}, 0)`
  return rolls
}

function numberLiteral(value) {
  const source = String(value)
  if (!source.includes('e')) return source
  const [mantissa, power] = source.split('e'), negative = mantissa.startsWith('-')
  const [integer, fraction = ''] = mantissa.replace('-', '').split('.')
  const digits = integer + fraction, point = integer.length + Number(power)
  const expanded = point <= 0 ? `0.${'0'.repeat(-point)}${digits}`
    : point >= digits.length ? digits + '0'.repeat(point - digits.length) : `${digits.slice(0, point)}.${digits.slice(point)}`
  return negative ? '-' + expanded : expanded
}

/** Derive meaning from recorded numbers and the recorded policy, never from current Config. */
export function checkMeaning(request, rules, values) {
  if (!numeric(values.natural) || !numeric(values.total) || typeof values.hit !== 'boolean') return null
  const critical = !!rules.criticalSuccessMin && values.natural >= rules.criticalSuccessMin
  const fumble = !!rules.criticalFailureMax && values.natural <= rules.criticalFailureMax
  const naturalFailure = !!rules.naturalFailureMax && values.natural <= rules.naturalFailureMax
  const hit = critical || (!fumble && !naturalFailure && values.total >= request.target)
  const margin = values.total - request.target
  if (!numeric(margin) || values.total !== values.natural + request.modifier || values.critical !== critical
    || values.fumble !== fumble || values.naturalFailure !== naturalFailure || values.hit !== hit) throw new TypeError('Inconsistent recorded check')
  return { natural: values.natural, modifier: request.modifier, total: values.total, target: request.target, margin,
    outcome: critical ? 'critical_success' : fumble ? 'critical_failure' : hit ? 'success' : 'failure',
    reason: critical ? 'natural-critical-success' : fumble ? 'natural-critical-failure' : naturalFailure ? 'natural-failure' : hit ? 'target-met' : 'target-missed' }
}
