import test from 'node:test'
import assert from 'node:assert/strict'
import { exportPreset, importPreset, MAX_PRESET_FILE_BYTES } from '../../../src/features/presets/shared/transfer.js'
import { readPresetFile } from '../../../src/features/presets/client/files.js'

const nodes = () => [{ id: 'group', kind: 'group', title: 'Правила', enabled: false, children: [
  { id: 'literal', kind: 'block', title: 'Текст', enabled: true, text: '  {{unknown}}\n<script>literal</script>  ' },
  { id: 'off', kind: 'block', title: 'Отключён', enabled: false, text: 'SECRET_OFF' },
] }, { id: 'last', kind: 'block', title: 'Последний', enabled: true, text: '\nТочный текст\n' }]

test('portable export round-trips nested authoring data and omits catalog identity', () => {
  const preset = { id: 'mayori', name: 'История', nodes: nodes(), instructions: 'FORGED_COMPILATION' }
  const file = exportPreset(preset)
  const record = JSON.parse(file.text)
  assert.equal(record.preset.id, undefined)
  assert.equal(record.preset.instructions, undefined)
  const imported = importPreset(file.text)
  assert.deepEqual(imported.nodes, preset.nodes)
  assert.equal(imported.instructions, '\nТочный текст\n')
  assert.equal(imported.id, undefined)
  assert.deepEqual(preset.nodes, nodes())
})

test('legacy JSON and UTF-8 BOM import as one literal editable block', () => {
  const text = '\nOriginal {{unknown}}  '
  const imported = importPreset(`\uFEFF${JSON.stringify({ id: 'old-id', name: 'Old', instructions: text })}`)
  assert.equal(imported.nodes.length, 1)
  assert.equal(imported.nodes[0].text, text)
  assert.equal(imported.instructions, text)
  assert.equal(imported.id, undefined)
  assert.deepEqual(importPreset(exportPreset({ name: 'Old', instructions: text }).text), imported)
})

test('raw structured files recompile locally and empty presets round-trip', () => {
  const imported = importPreset(JSON.stringify({ id: 'existing-id', name: 'Structured', nodes: nodes(), instructions: 'CLIENT_OVERRIDE', compilerVersion: 999 }))
  assert.equal(imported.instructions, '\nТочный текст\n')
  assert.equal(imported.compilerVersion, 1)
  const empty = importPreset(exportPreset({ name: 'Empty', nodes: [] }).text)
  assert.deepEqual(empty.nodes, [])
  assert.equal(empty.instructions, '')
})

test('malformed, unrelated, future-version and invalid trees fail before replacing a draft', () => {
  for (const json of ['{', 'null', '[]', JSON.stringify({ name: 'Bad', nodes: [{ ...nodes()[1], enabled: 'yes' }] })]) {
    assert.throws(() => importPreset(json))
  }
  for (const record of [{ format: 'other', version: 1 }, { format: 'mayori-preset', version: 2 }]) {
    assert.throws(() => importPreset(JSON.stringify(record)), /не поддерживается/)
  }
  assert.throws(() => importPreset(JSON.stringify({ name: 'Too long', nodes: [{ ...nodes()[1], enabled: false, text: 'x'.repeat(64001) }] })), /64 000/)
})

test('file limits count UTF-8 bytes and reject oversized files before reading them', async () => {
  assert.throws(() => importPreset('я'.repeat(MAX_PRESET_FILE_BYTES / 2 + 1)), /1 МБ/)
  let read = false
  await assert.rejects(() => readPresetFile({ size: MAX_PRESET_FILE_BYTES + 1, text() { read = true } }), /1 МБ/)
  assert.equal(read, false)
  const result = await readPresetFile({ size: 60, text: async () => '{"name":"Preset","instructions":"literal"}' })
  assert.equal(result.preset.instructions, 'literal')
  assert.deepEqual(result.warnings, [])
})

test('download filenames preserve Unicode and cannot become paths or reserved Windows names', () => {
  const file = exportPreset({ name: 'CON/История: "ночь"?', nodes: [] })
  assert.ok(file.filename.startsWith('preset-CON-История-'))
  assert.ok(file.filename.endsWith('.mayori.json'))
  assert.doesNotMatch(file.filename, /[<>:"/\\|?*\u0000-\u001F]/)
})
