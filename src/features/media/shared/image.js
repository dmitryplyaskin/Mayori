const HASH = '[a-f0-9]{64}'
const REFERENCE = new RegExp(`^mayori-media:(${HASH})$`)
const URL = new RegExp(`^/mayori/characters/(?:media/${HASH}/(?:avatar|gallery|preview|original)|card-image/${HASH}/(?:avatar|gallery|preview|original))$`)

export function mediaId(value) { return typeof value === 'string' ? REFERENCE.exec(value)?.[1] ?? null : null }
export function imageSource(value, variant = 'avatar') {
  const id = mediaId(value)
  if (id) return `/mayori/characters/media/${id}/${variant}`
  return typeof value === 'string' && (URL.test(value) || /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) ? value : null
}
export function originalImage(value) {
  return imageSource(value, 'original')?.replace(/\/(avatar|gallery|preview)$/, '/original') ?? null
}
