import z from '@deepseek-ai/schemastery'
import { DEFAULT_DICE_CONFIG } from '../features/dice/host/config.js'
import { DEFAULT_RULES_PROFILES } from '../features/rules/domain/check.js'
import { registerMechanicsCapabilities } from './application.js'
export { RulesService } from '../features/rules/host/service.js'
export { NumericRulesProvider } from '../features/rules/host/provider.js'

export const name = 'mayori-mechanics'
export const inject = ['tools']
export const Config = z.object({
  ...Object.fromEntries(Object.entries(DEFAULT_DICE_CONFIG).map(([key, value]) => [key, z.number().default(value)])),
  profiles: z.array(z.object({
    id: z.string(), version: z.string(), sides: z.number(),
    criticalSuccessMin: z.number().default(0), criticalFailureMax: z.number().default(0), naturalFailureMax: z.number().default(0),
    failureEffect: z.string().default(''), criticalFailureEffects: z.array(z.string()).default([]),
  })).default(DEFAULT_RULES_PROFILES),
})
export function apply(ctx, config = {}) { registerMechanicsCapabilities(ctx, config) }
