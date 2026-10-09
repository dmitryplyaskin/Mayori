import { registerStorageCapabilities } from './application.js'

export { Config } from '../features/storage/host/config.js'
export const name = 'mayori-storage'
export function apply(ctx, config = {}) { return registerStorageCapabilities(ctx, config) }
