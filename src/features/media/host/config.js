import z from '@deepseek-ai/schemastery'

export const MEDIA_DEFAULTS = Object.freeze({ avatarSize: 96, gallerySize: 384, previewSize: 1024, quality: 80, maxPixels: 40000000, concurrency: 2, maxQueue: 128, thumbnailCacheBytes: 268435456, maxVariantFiles: 2048 })
export const MediaConfig = z.object(Object.fromEntries(Object.entries(MEDIA_DEFAULTS).map(([key, value]) => [key, z.number().default(value)])))
export function mediaConfig(input = {}) {
  const config = { ...MEDIA_DEFAULTS, ...input }
  for (const [key, value] of Object.entries(config)) {
    const limit = key === 'thumbnailCacheBytes' ? 1073741824 : key === 'maxVariantFiles' ? 100000 : key === 'maxPixels' ? 100000000 : key === 'maxQueue' ? 1024 : key === 'quality' ? 100 : key === 'concurrency' ? 8 : 4096
    if (!Object.hasOwn(MEDIA_DEFAULTS, key) || !Number.isSafeInteger(value) || value < 1 || value > limit) throw new TypeError(`Invalid media.${key}`)
  }
  return config
}
