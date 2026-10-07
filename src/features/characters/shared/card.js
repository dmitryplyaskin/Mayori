/** Character Card v2/v3 decoding shared by the Host provider and tests. */

const PNG_SIGNATURE = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])
const UTF8 = new TextDecoder('utf-8', { fatal: true })
const MAX_CARD_BYTES = 16 * 1024 * 1024

export class CharacterCardImportError extends Error {
  constructor(message, code = 'INVALID_CARD') {
    super(message)
    this.name = 'CharacterCardImportError'
    this.code = code
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function readAscii(bytes, start, end) {
  let value = ''
  for (let index = start; index < end; index += 1) value += String.fromCharCode(bytes[index])
  return value
}

function decodeBase64(value) {
  const compact = value.replace(/\s/g, '')
  if (compact.length === 0 || compact.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(compact)) {
    throw new CharacterCardImportError('Метаданные карточки содержат некорректный Base64.', 'INVALID_BASE64')
  }
  try {
    const binary = atob(compact)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
    return UTF8.decode(bytes)
  } catch (error) {
    if (error instanceof CharacterCardImportError) throw error
    throw new CharacterCardImportError('Не удалось декодировать метаданные карточки.', 'INVALID_BASE64')
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    throw new CharacterCardImportError('Файл содержит некорректный JSON.', 'INVALID_JSON')
  }
}

/** Validate the envelope while preserving every source field for lossless storage. */
export function validateCharacterCard(value) {
  if (!isObject(value)) {
    throw new CharacterCardImportError('Карточка должна быть JSON-объектом.')
  }
  const supported = value.spec === 'chara_card_v2' || value.spec === 'chara_card_v3'
  if (!supported) {
    throw new CharacterCardImportError(
      'Поддерживаются только Character Card v2 и v3.',
      'UNSUPPORTED_SPEC',
    )
  }
  if (!isObject(value.data) || typeof value.data.name !== 'string' || value.data.name.trim() === '') {
    throw new CharacterCardImportError('В карточке отсутствует непустое поле data.name.')
  }
  if (typeof value.spec_version !== 'string') {
    throw new CharacterCardImportError('В карточке отсутствует строковое поле spec_version.')
  }

  const major = value.spec === 'chara_card_v3' ? 3 : 2
  const parsedVersion = Number.parseFloat(value.spec_version)
  const warnings = []
  if (Number.isFinite(parsedVersion) && parsedVersion > major) {
    warnings.push(`Карточка создана для более новой версии ${value.spec_version}; неизвестные поля сохранены.`)
  }
  return { card: value, major, warnings }
}

function pngTextChunks(bytes) {
  if (bytes.length < PNG_SIGNATURE.length
    || PNG_SIGNATURE.some((value, index) => bytes[index] !== value)) {
    throw new CharacterCardImportError('PNG-файл имеет некорректную сигнатуру.', 'INVALID_PNG')
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const chunks = new Map()
  let offset = 8
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset)
    const dataStart = offset + 8
    const dataEnd = dataStart + length
    const next = dataEnd + 4
    if (next > bytes.length) {
      throw new CharacterCardImportError('PNG-файл обрывается внутри блока метаданных.', 'INVALID_PNG')
    }
    const type = readAscii(bytes, offset + 4, offset + 8)
    if (type === 'tEXt') {
      let separator = dataStart
      while (separator < dataEnd && bytes[separator] !== 0) separator += 1
      if (separator < dataEnd) {
        const keyword = readAscii(bytes, dataStart, separator)
        if (keyword === 'ccv3' || keyword === 'chara') {
          chunks.set(keyword, readAscii(bytes, separator + 1, dataEnd))
        }
      }
    }
    offset = next
    if (type === 'IEND') break
  }
  return chunks
}

/** Decode a JSON card or the standard `chara` / `ccv3` PNG tEXt payload. */
export function parseCharacterCardBytes(input, mediaType = '', fileName = '') {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input)
  if (bytes.byteLength > MAX_CARD_BYTES) {
    throw new CharacterCardImportError('Файл карточки превышает лимит 16 МБ.', 'FILE_TOO_LARGE')
  }
  const isPng = mediaType === 'image/png'
    || fileName.toLowerCase().endsWith('.png')
    || PNG_SIGNATURE.every((value, index) => bytes[index] === value)

  if (!isPng) return { ...validateCharacterCard(parseJson(UTF8.decode(bytes))), imageBytes: null }

  const chunks = pngTextChunks(bytes)
  const keyword = chunks.has('ccv3') ? 'ccv3' : chunks.has('chara') ? 'chara' : null
  if (keyword === null) {
    throw new CharacterCardImportError(
      'В PNG не найдены метаданные Character Card (`chara` или `ccv3`).',
      'MISSING_METADATA',
    )
  }
  const parsed = validateCharacterCard(parseJson(decodeBase64(chunks.get(keyword))))
  if (keyword === 'ccv3' && parsed.major !== 3) {
    throw new CharacterCardImportError('Блок `ccv3` не содержит Character Card v3.')
  }
  if (keyword === 'chara' && parsed.major !== 2) {
    throw new CharacterCardImportError('Блок `chara` не содержит Character Card v2.')
  }
  return { ...parsed, imageBytes: bytes.slice() }
}

function hex(bytes) {
  return [...bytes].map(value => value.toString(16).padStart(2, '0')).join('')
}

/** Create a content identity from the preserved card JSON, independent of its container. */
export async function characterCardId(card) {
  const bytes = new TextEncoder().encode(JSON.stringify(card))
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return hex(new Uint8Array(digest))
}

/** Convert source bytes into a durable library record. */
export async function importCharacterCardBytes(bytes, options = {}) {
  const { mediaType = '', fileName = 'character-card', now = Date.now() } = options
  const parsed = parseCharacterCardBytes(bytes, mediaType, fileName)
  return {
    id: await characterCardId(parsed.card),
    spec: parsed.card.spec,
    specVersion: parsed.card.spec_version,
    name: parsed.card.data.name.trim(),
    data: parsed.card.data,
    card: parsed.card,
    warnings: parsed.warnings,
    importedAt: now,
    sourceName: fileName || 'character-card',
    imageBytes: parsed.imageBytes,
  }
}

/** Convert a File-like object into the durable library record. */
export async function importCharacterCardFile(file, now = Date.now()) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const record = await importCharacterCardBytes(bytes, {
    mediaType: file.type ?? '',
    fileName: file.name ?? '',
    now,
  })
  return {
    ...record,
    image: record.imageBytes === null ? null : new Blob([record.imageBytes], { type: 'image/png' }),
  }
}
