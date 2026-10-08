import { Config } from '../features/compaction/host/config.js'
import { registerCompactionCapabilities } from './application.js'

export const name = 'mayori-compaction'
export const inject = ['llm', 'tokenMeter', 'sessions']
export { Config }
export function apply(ctx, config = {}) { return registerCompactionCapabilities(ctx, config) }
