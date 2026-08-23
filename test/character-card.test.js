import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CharacterCardImportError, importCharacterCardFile, parseCharacterCardBytes,
} from '../src/character-card.js'

const encoder = new TextEncoder()

function card(spec, version, name) {
  return {
    spec,
    spec_version: version,
    data: {
      name,
      description: `${name} description`,
      personality: '',
      scenario: '',
      first_mes: 'Hello',
      mes_example: '',
      creator_notes: '',
      system_prompt: '',
      post_history_instructions: '',
      alternate_greetings: [],
      tags: ['test'],
      creator: 'Mayori tests',
      character_version: '1',
      extensions: {},
      ...(spec === 'chara_card_v3' ? { group_only_greetings: [] } : {}),
    },
  }
}

function pngChunk(type, data) {
  const result = new Uint8Array(12 + data.length)
  const view = new DataView(result.buffer)
  view.setUint32(0, data.length)
  result.set(encoder.encode(type), 4)
  result.set(data, 8)
  return result
}

function textChunk(keyword, value) {
  const keywordBytes = encoder.encode(keyword)
  const valueBytes = encoder.encode(value)
  const data = new Uint8Array(keywordBytes.length + valueBytes.length + 1)
  data.set(keywordBytes)
  data.set(valueBytes, keywordBytes.length + 1)
  return pngChunk('tEXt', data)
}

function base64(value) {
  const bytes = encoder.encode(JSON.stringify(value))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function png(...chunks) {
  const signature = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])
  const size = signature.length + chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const result = new Uint8Array(size)
  result.set(signature)
  let offset = signature.length
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

test('parses a Character Card v2 JSON document', () => {
  const parsed = parseCharacterCardBytes(
    encoder.encode(JSON.stringify(card('chara_card_v2', '2.0', 'Aster'))),
    'application/json',
    'aster.json',
  )

  assert.equal(parsed.major, 2)
  assert.equal(parsed.card.data.name, 'Aster')
  assert.equal(parsed.imageBytes, null)
})

test('prefers ccv3 over a compatibility chara chunk in PNG', () => {
  const v2 = card('chara_card_v2', '2.0', 'Compatibility copy')
  const v3 = card('chara_card_v3', '3.0', 'Canonical v3')
  const bytes = png(textChunk('chara', base64(v2)), textChunk('ccv3', base64(v3)))

  const parsed = parseCharacterCardBytes(bytes, 'image/png', 'canonical.png')

  assert.equal(parsed.major, 3)
  assert.equal(parsed.card.data.name, 'Canonical v3')
  assert.deepEqual(parsed.imageBytes, bytes)
})

test('rejects unsupported specs and PNG files without card metadata', () => {
  assert.throws(
    () => parseCharacterCardBytes(encoder.encode('{"spec":"chara_card_v1"}'), 'application/json'),
    error => error instanceof CharacterCardImportError && error.code === 'UNSUPPORTED_SPEC',
  )
  assert.throws(
    () => parseCharacterCardBytes(png(pngChunk('IEND', new Uint8Array())), 'image/png'),
    error => error instanceof CharacterCardImportError && error.code === 'MISSING_METADATA',
  )
})

test('builds a durable record and preserves unknown fields', async () => {
  const source = card('chara_card_v3', '3.1', 'Nova')
  source.data.extensions.mayori_test = { kept: true }
  const bytes = encoder.encode(JSON.stringify(source))
  const record = await importCharacterCardFile({
    name: 'nova.json',
    type: 'application/json',
    arrayBuffer: async () => bytes.buffer,
  }, 123)

  assert.equal(record.name, 'Nova')
  assert.equal(record.importedAt, 123)
  assert.equal(record.image, null)
  assert.equal(record.id.length, 64)
  assert.deepEqual(record.card.data.extensions.mayori_test, { kept: true })
  assert.equal(record.warnings.length, 1)
})
