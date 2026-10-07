import { registerOptionalPlugins } from './application.js'
import z from '@deepseek-ai/schemastery'
import { Config as DiceConfig } from './dice-plugin.js'
import { Config as RulesConfig } from './rules-plugin.js'

export const name = 'mayori-optional-plugins'
export const inject = ['tools', 'mayoriPluginSettings']
export const Config = z.object({ dice: DiceConfig.default({}), rules: RulesConfig.default({}) })
export async function apply(ctx, config = {}) { await registerOptionalPlugins(ctx, config) }
