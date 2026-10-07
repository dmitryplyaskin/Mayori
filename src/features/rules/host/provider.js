import { RulesService } from './service.js'
import { resolveRulesConfig, normalizeCheck, checkRolls } from '../domain/check.js'
import { buildCheckResult } from '../shared/result.js'

export class NumericRulesProvider extends RulesService {
  constructor(ctx, dice, config = {}) {
    super(ctx)
    this.dice = dice
    this.config = resolveRulesConfig(config)
  }
  profiles() { return structuredClone(this.config.profiles) }
  resolve(input, { signal } = {}) {
    signal?.throwIfAborted()
    const request = normalizeCheck(input)
    const rules = this.profiles().find(profile => profile.id === request.profile)
    if (!rules) throw new TypeError(`Unknown rules profile: ${request.profile}`)
    if (request.damage && rules.criticalSuccessMin && !request.damage.critical) throw new TypeError('Declare the critical damage formula before rolling for this profile')
    if (Math.abs(request.modifier) + rules.sides > Number.MAX_SAFE_INTEGER || Math.abs(request.modifier) + rules.sides + Math.abs(request.target) > Number.MAX_SAFE_INTEGER) throw new TypeError('Check totals and margin must fit the safe numeric range')
    if (request.damage) {
      for (const formula of Object.values(request.damage)) {
        const preview = this.dice.validate({ damage: `(${formula}) + 0` })
        if (preview.errors.length) throw new TypeError(`Invalid damage expression: ${preview.errors[0].message}`)
      }
    }
    const rolls = checkRolls(request, rules)
    const preview = this.dice.validate(rolls, { purpose: input.purpose })
    if (preview.errors.length) throw new TypeError(`Invalid check: ${preview.errors[0].message}`)
    const dice = this.dice.roll(rolls, { signal, purpose: request.purpose })
    return buildCheckResult(request, rules, dice)
  }
}
