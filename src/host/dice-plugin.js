import z from '@deepseek-ai/schemastery'
import { DEFAULT_DICE_CONFIG } from '../features/dice/host/config.js'
import { registerDiceCapabilities } from './application.js'
export { DiceService } from '../features/dice/host/service.js'
export { CryptoDiceProvider } from '../features/dice/host/provider.js'
export { registerDiceTool } from '../features/dice/host/tool.js'

export const name = 'mayori-dice'
export const inject = ['tools']
export const Config = z.object({
  ...Object.fromEntries(Object.entries(DEFAULT_DICE_CONFIG).map(([key, value]) => [key, z.number().default(value)])),
  exposeTool: z.boolean().default(true),
})
export function apply(ctx, config = {}) { registerDiceCapabilities(ctx, config) }
