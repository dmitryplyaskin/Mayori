import test from 'node:test'
import assert from 'node:assert/strict'
import { exportPreset, importPreset, parsePresetFile } from '../../../src/features/presets/shared/transfer.js'
import { readPresetFile } from '../../../src/features/presets/client/files.js'

const prompt = (identifier, content = identifier, extra = {}) => ({ identifier, name: identifier, role: 'system', content, ...extra })
const ordered = (identifier, enabled = true) => ({ identifier, enabled })
const parse = (record, options) => parsePresetFile(JSON.stringify(record), options)

test('Matrix-like presets use global order 100001, preserve disabled blocks and ignore runtime markers', () => {
  const record = {
    temperature: 0.7, impersonation_prompt: 'DO_NOT_IMPORT',
    prompts: [prompt('main', '  Literal {{user}}\n', { name: 'Roleplay Matrix' }),
      prompt('nsfw', 'LITERARY_DISABLED', { name: 'Literary Matrix' }),
      prompt('chatHistory', 'DO_NOT_IMPORT_HISTORY', { marker: true }),
      prompt('jailbreak', 'PSYCHOLOGY_DISABLED', { name: 'Psychology Matrix' }),
      prompt('enhanceDefinitions', 'CHOICE_DISABLED', { name: 'Choice Matrix' })],
    prompt_order: [
      { character_id: 100000, order: ['main', 'nsfw', 'jailbreak', 'enhanceDefinitions'].map(id => ordered(id)) },
      { character_id: 100001, order: [ordered('main'), ordered('jailbreak', false), ordered('nsfw', false), ordered('enhanceDefinitions', false), ordered('chatHistory')] },
    ],
  }
  const baseline = structuredClone(record)
  const { preset, warnings } = parse(record, { filename: 'MatrixPreset v2 my 111.json' })
  assert.equal(preset.name, 'MatrixPreset v2 my 111')
  assert.deepEqual(preset.nodes.map(node => [node.title, node.enabled]), [['Roleplay Matrix', true], ['Psychology Matrix', false], ['Literary Matrix', false], ['Choice Matrix', false]])
  assert.equal(preset.instructions, '  Literal {{user}}\n')
  assert.ok(warnings.some(warning => warning.includes('Макросы')))
  assert.deepEqual(record, baseline)
  assert.deepEqual(importPreset(exportPreset(preset).text), preset)
})

test('Prompt Manager full/character exports retain flat order and keep detached prompts disabled', () => {
  const data = { prompts: [prompt('a'), prompt('b', '  Exact {{char}}  ', { system_prompt: false }), prompt('detached')],
    prompt_order: [ordered('main'), ordered('b'), ordered('a', false)] }
  for (const type of ['full', 'character']) {
    const { preset } = parse({ version: 1, type, data })
    assert.deepEqual(preset.nodes.map(node => [node.title, node.enabled]), [['b', true], ['a', false], ['detached', false]])
    assert.equal(preset.instructions, '  Exact {{char}}  ')
  }
  assert.throws(() => parse({ version: 2, type: 'full', data }), /Версия/)
})

test('fallback orders and presets without an order are deterministic; ambiguous character orders fail', () => {
  const base = { prompts: [prompt('a'), prompt('b', 'b', { enabled: false })] }
  assert.deepEqual(parse(base).preset.nodes.map(node => node.enabled), [true, false])
  assert.equal(parse({ ...base, prompt_order: [] }).preset.instructions, '')
  for (const character_id of [100000, '100001', 42]) {
    assert.equal(parse({ ...base, prompt_order: [{ character_id, order: [ordered('b')] }] }).preset.instructions, 'b')
  }
  assert.throws(() => parse({ ...base, prompt_order: [
    { character_id: 42, order: [ordered('a')] }, { character_id: 43, order: [ordered('b')] },
  ] }), /несколько порядков/)
})

test('incompatible roles, depth, post-history and conditional injections are preserved but disabled', () => {
  const data = { prompts: [prompt('main'), prompt('user', 'USER', { role: 'user' }),
    prompt('assistant', 'ASSISTANT', { role: 'assistant' }),
    prompt('depth', 'DEPTH', { injection_position: 1, injection_depth: 2 }),
    prompt('trigger', 'TRIGGER', { injection_trigger: ['continue'] }),
    prompt('chatHistory', '', { marker: true }), prompt('after', 'AFTER')],
  prompt_order: ['main', 'user', 'assistant', 'depth', 'trigger', 'chatHistory', 'after'].map(id => ordered(id)) }
  const { preset, warnings } = parse(data)
  assert.equal(preset.instructions, 'main')
  assert.deepEqual(preset.nodes.map(node => node.enabled), [true, false, false, false, false, false])
  assert.equal(preset.nodes[3].text, 'DEPTH')
  assert.match(preset.nodes[1].title, /роль user/)
  assert.match(preset.nodes.at(-1).title, /после истории/)
  assert.ok(warnings.some(warning => warning.endsWith('5.')))
})

test('missing external blocks are reported, known runtime slots are skipped and IDs become local', () => {
  const { preset, warnings } = parse({ name: 'Imported', prompts: [prompt('unsafe/id:<💥>', 'literal')],
    prompt_order: [ordered('charDescription'), ordered('missing-extension'), ordered('unsafe/id:<💥>')] })
  assert.equal(preset.nodes[0].id, 'st-0')
  assert.equal(preset.instructions, 'literal')
  assert.ok(warnings.some(warning => warning.includes('отсутствуют') && warning.endsWith('1.')))
})

test('malformed ST blocks and orders fail instead of silently changing enabled instructions', () => {
  for (const data of [
    { prompts: [prompt('a'), prompt('a')] },
    { prompts: [prompt('a', { not: 'text' })] },
    { prompts: [prompt('a', 'a', { enabled: 'false' })] },
    { prompts: [prompt('a')], prompt_order: [ordered('a'), ordered('a', false)] },
    { prompts: [prompt('a')], prompt_order: [{ identifier: 'a', enabled: 'false' }] },
    { prompts: [prompt('a')], prompt_order: 'not-an-order' },
    { prompts: [prompt('chatHistory', '', { marker: true })] },
    { prompts: [prompt('off', 'x'.repeat(64001))], prompt_order: [] },
  ]) assert.throws(() => parse(data))
})

test('browser file import derives ST preset name from the selected filename', async () => {
  const text = JSON.stringify({ prompts: [prompt('main', 'Exact text')] })
  const imported = await readPresetFile({ name: 'Imported ST.json', size: text.length, text: async () => text })
  assert.equal(imported.preset.name, 'Imported ST')
  assert.equal(imported.preset.instructions, 'Exact text')
  assert.ok(imported.warnings.length)
})
