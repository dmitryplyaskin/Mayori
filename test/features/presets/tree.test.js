import test from 'node:test'
import assert from 'node:assert/strict'
import { activePresetBlocks, canMovePresetNode, compilePresetNodes, MAX_PRESET_DEPTH, MAX_PRESET_NODES, movePresetNode, presetNodeEntries, presetNodes, validatePresetNodes } from '../../../src/features/presets/shared/tree.js'
import { validatePreset } from '../../../src/features/presets/shared/preset.js'
import { presetDropPosition } from '../../../src/features/presets/client/drag.js'

const block = (id, text = id, enabled = true) => ({ id, kind: 'block', title: id, text, enabled })
const group = (id, children, enabled = true) => ({ id, kind: 'group', title: id, children, enabled })
const tree = () => [group('rules', [block('before', '  Literal {{unknown}}\n'), group('checks', [block('success'), block('off', 'SECRET_OFF', false)]), group('disabled', [block('hidden', 'SECRET_PARENT')], false)]), block('last')]

test('compilation follows nested order, preserves literal text and excludes disabled ancestors', () => {
  const nodes = tree()
  assert.equal(compilePresetNodes(nodes), '  Literal {{unknown}}\n\n\nsuccess\n\nlast')
  assert.deepEqual(activePresetBlocks(nodes).map(entry => entry.node.id), ['before', 'success', 'last'])
  assert.deepEqual(activePresetBlocks(nodes)[1].ancestors.map(node => node.id), ['rules', 'checks'])
  assert.equal(compilePresetNodes([group('off', [block('a')], false), block('empty', '  ')]), '')
})

test('legacy migration is one literal block and Host ignores client-supplied compiled instructions', () => {
  const instructions = '\nOriginal text\n\n{{cwd}}  '
  assert.equal(compilePresetNodes(presetNodes({ instructions })), instructions)
  const saved = validatePreset({ name: 'Preset', nodes: tree(), instructions: 'CLIENT_FORGERY' })
  assert.equal(saved.instructions, compilePresetNodes(tree()))
  assert.equal(saved.compilerVersion, 1)
  assert.equal(validatePreset({ name: 'Empty preset', nodes: [] }).instructions, '')
})

test('validation rejects duplicate IDs, cycles, excessive depth/count and disabled-text budget bypasses', () => {
  assert.throws(() => validatePresetNodes([block('a'), group('g', [block('a')])]), /уникальный/)
  const cycle = group('cycle', [])
  cycle.children.push(cycle)
  assert.throws(() => validatePresetNodes([cycle]), /уникальный/)
  assert.throws(() => validatePresetNodes([block('a', 'x'.repeat(64001), false)]), /64 000/)
  assert.throws(() => validatePresetNodes(Array.from({ length: MAX_PRESET_NODES + 1 }, (_, i) => block(`b${i}`))), /256/)
  let deep = block('leaf')
  for (let i = 0; i < MAX_PRESET_DEPTH; i++) deep = group(`g${i}`, [deep])
  assert.throws(() => validatePresetNodes([deep]), /уровней/)
  for (const bad of [{ ...block('a'), enabled: 1 }, { ...group('g', []), children: 'text' }, { ...block('a'), title: ' ' }, { ...block('a'), text: null }]) {
    assert.throws(() => validatePresetNodes([bad]))
  }
  assert.throws(() => validatePreset({ name: 'Preset', nodes: [block('a', 'a'.repeat(32000)), block('b', 'b'.repeat(32000))] }), /итоговые/)
})

test('subtree moves support siblings, reparenting and root without mutating the saved tree', () => {
  const nodes = tree(), original = structuredClone(nodes)
  const moved = movePresetNode(nodes, 'checks', 'last', 'after')
  assert.deepEqual(moved.map(node => node.id), ['rules', 'last', 'checks'])
  assert.deepEqual(moved[2].children.map(node => node.id), ['success', 'off'])
  assert.deepEqual(nodes, original)
  const nested = movePresetNode(moved, 'last', 'checks', 'inside')
  assert.equal(nested.at(-1).children.at(-1).id, 'last')
  const root = movePresetNode(nested, 'last', null, 'inside')
  assert.equal(root.at(-1).id, 'last')
  assert.deepEqual(movePresetNode([block('a'), block('b'), block('c')], 'a', 'b', 'after').map(node => node.id), ['b', 'a', 'c'])
  assert.deepEqual(movePresetNode([block('a'), block('b'), block('c')], 'c', 'b', 'before').map(node => node.id), ['a', 'c', 'b'])
})

test('drag cannot nest a group in itself or descendants, insert into a block or exceed depth', () => {
  const nodes = tree()
  for (const [source, target, position] of [['rules', 'checks', 'inside'], ['rules', 'success', 'before'], ['rules', 'rules', 'after'], ['last', 'success', 'inside'], ['missing', null, 'inside']]) {
    assert.equal(canMovePresetNode(nodes, source, target, position), false)
    assert.throws(() => movePresetNode(nodes, source, target, position))
  }
  let deep = group('deepest', [])
  for (let i = 1; i < MAX_PRESET_DEPTH; i++) deep = group(`deep${i}`, [deep])
  const depthLimited = [deep, block('b')]
  validatePresetNodes(depthLimited)
  assert.throws(() => movePresetNode(depthLimited, 'b', 'deepest', 'inside'), /уровней/)
  assert.equal(presetNodeEntries(depthLimited).at(-1).node.id, 'b')
})

test('drop markers distinguish group nesting from before/after sibling placement', () => {
  const bounds = { top: 100, height: 40 }
  assert.equal(presetDropPosition('group', 104, bounds), 'before')
  assert.equal(presetDropPosition('group', 120, bounds), 'inside')
  assert.equal(presetDropPosition('group', 136, bounds), 'after')
  assert.equal(presetDropPosition('block', 116, bounds), 'before')
  assert.equal(presetDropPosition('block', 124, bounds), 'after')
})
