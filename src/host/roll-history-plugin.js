import { registerRollHistoryCapabilities } from './application.js'
export { RollHistoryService } from '../features/roll-history/host/service.js'
export { SessionRollHistoryProvider } from '../features/roll-history/host/provider.js'

export const name = 'mayori-roll-history'
export const inject = ['tools']
export function apply(ctx) { registerRollHistoryCapabilities(ctx) }
