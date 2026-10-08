import test from 'node:test'
import assert from 'node:assert/strict'
import { filterPresets, presetChanged } from '../../../src/features/presets/client/presentation.js'

test('preset search finds Russian names and instruction content without changing library order', () => {
  const presets = [{ id: 'a', name: 'Фэнтези', instructions: 'Краткие ответы' }, { id: 'b', name: 'Хоррор', instructions: 'Фэнтези с расследованием' }]
  assert.deepEqual(filterPresets(presets, '  ФЭНТЕЗИ  '), presets)
  assert.deepEqual(filterPresets(presets, 'расследованием'), [presets[1]])
  assert.deepEqual(filterPresets(presets, 'ничего'), [])
  assert.equal(filterPresets(presets, '  '), presets)
})

test('chat update detection compares the saved instruction copy rather than preset id', () => {
  const copy = { id: 'a', name: 'Фэнтези', instructions: 'Краткие ответы' }
  assert.equal(presetChanged({ ...copy }, copy), false)
  assert.equal(presetChanged({ ...copy, instructions: 'Подробные ответы' }, copy), true)
  assert.equal(presetChanged({ ...copy, name: 'Новый голос' }, copy), true)
})
