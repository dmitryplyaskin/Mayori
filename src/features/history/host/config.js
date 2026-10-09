import z from '@deepseek-ai/schemastery'
export const HISTORY_DEFAULTS = Object.freeze({ cacheEntries: 128, cacheBytes: 2097152, diskEntries: 512, concurrency: 4, maxPending: 128 })
export const HistoryConfig = z.object(Object.fromEntries(Object.entries(HISTORY_DEFAULTS).map(([key, value]) => [key, z.number().default(value)])))
export function historyConfig(input = {}) {
  const config = { ...HISTORY_DEFAULTS, ...input }
  for (const [key, value] of Object.entries(config)) {
    const max = key === 'cacheBytes' ? 64 * 1024 * 1024 : key === 'concurrency' ? 16 : 10000
    if (!Object.hasOwn(HISTORY_DEFAULTS, key) || !Number.isSafeInteger(value) || value < 1 || value > max) throw new TypeError(`Invalid history.${key}`)
  }
  return config
}
