import assert from 'node:assert/strict'
import test from 'node:test'
import { RemoteRoleplayPresetProvider } from '../../../src/features/presets/client/presets.js'
import { presetChanged } from '../../../src/features/presets/client/presentation.js'
import { presetNodeEntries } from '../../../src/features/presets/shared/tree.js'

const preset = { id: 'saved', name: 'Saved preset', instructions: 'Saved instructions.' }
const catalog = { status: 'ready', presets: [preset], defaultId: preset.id }

test('the provider retains an unsaved editor draft and its baseline across panel subscriptions', () => {
  const provider = new RemoteRoleplayPresetProvider()
  const editor = provider.editor
  let firstUpdates = 0
  const unmount = editor.subscribe(() => firstUpdates++)
  editor.initialize(catalog)
  editor.change('name', 'Draft name')
  editor.change('instructions', 'Unsaved instructions.')
  unmount()
  const before = firstUpdates
  editor.initialize({ ...catalog, presets: [{ ...preset, instructions: 'Changed catalog copy' }] })
  const remounted = provider.editor
  let updates = 0
  const unsubscribe = remounted.subscribe(() => updates++)
  assert.equal(remounted.getSnapshot().draft.name, 'Draft name')
  assert.equal(remounted.getSnapshot().draft.instructions, 'Unsaved instructions.')
  assert.deepEqual(remounted.getSnapshot().saved, preset)
  assert.equal(presetChanged(remounted.getSnapshot().draft, remounted.getSnapshot().saved), true)
  remounted.reset()
  assert.deepEqual(remounted.getSnapshot().draft, preset)
  assert.equal(firstUpdates, before)
  assert.equal(updates, 1)
  unsubscribe()
})

test('new drafts survive navigation and a save settling after unmount updates the current editor', () => {
  const provider = new RemoteRoleplayPresetProvider()
  const editor = provider.editor
  editor.initialize(catalog)
  editor.choose({ name: '', instructions: '' })
  editor.change('name', 'New preset')
  editor.change('instructions', 'New instructions.')
  editor.update({ busy: true })
  const remounted = provider.editor
  assert.equal(remounted.getSnapshot().busy, true)
  assert.equal(remounted.getSnapshot().draft.id, undefined)
  const saved = { ...remounted.getSnapshot().draft, id: 'new' }
  editor.accept(saved)
  editor.update({ busy: false, notice: 'Пресет сохранён.' })
  assert.deepEqual(remounted.getSnapshot().saved, saved)
  assert.equal(presetChanged(remounted.getSnapshot().draft, remounted.getSnapshot().saved), false)
  assert.equal(remounted.getSnapshot().busy, false)
  assert.equal(new RemoteRoleplayPresetProvider().editor.getSnapshot().initialized, false)
})

test('nested edits, subtree moves and undo survive navigation without mutating the saved baseline', () => {
  const editor = new RemoteRoleplayPresetProvider().editor
  const structured = { id: 'structured', name: 'Nested', instructions: 'First\n\nSecond', compilerVersion: 1, nodes: [
    { id: 'g', kind: 'group', title: 'Group', enabled: true, children: [{ id: 'a', kind: 'block', title: 'A', enabled: true, text: 'First' }] },
    { id: 'b', kind: 'block', title: 'B', enabled: true, text: 'Second' },
  ] }
  editor.choose(structured)
  editor.selectNode('g')
  editor.addNode('group')
  const nestedId = editor.getSnapshot().selectedNodeId
  editor.addNode('block')
  const blockId = editor.getSnapshot().selectedNodeId
  editor.changeNode(blockId, 'text', 'Nested text')
  editor.changeNode(nestedId, 'enabled', false)
  assert.equal(editor.getSnapshot().draft.instructions, structured.instructions)
  assert.equal(presetChanged(editor.getSnapshot().draft, editor.getSnapshot().saved), true)
  assert.deepEqual(editor.getSnapshot().saved, structured)
  editor.moveNode(nestedId, null, 'inside')
  assert.equal(editor.getSnapshot().draft.nodes.at(-1).id, nestedId)
  editor.undo()
  assert.equal(editor.getSnapshot().draft.nodes[0].children.at(-1).id, nestedId)
  editor.duplicateNode('g')
  const ids = presetNodeEntries(editor.getSnapshot().draft.nodes).map(entry => entry.node.id)
  assert.equal(ids.length, new Set(ids).size)
  editor.removeNode('g')
  editor.undo()
  assert.equal(editor.getSnapshot().draft.nodes[0].id, 'g')
  editor.reset()
  assert.deepEqual(editor.getSnapshot().draft, structured)
  assert.deepEqual(structured.nodes[0].children.map(node => node.id), ['a'])
})

test('legacy block edits preserve text, invalidate stale undo and busy editors reject structural changes', () => {
  const editor = new RemoteRoleplayPresetProvider().editor
  editor.choose(preset)
  editor.changeNode('main-instructions', 'text', '\nLiteral {{cwd}}  ')
  assert.equal(editor.getSnapshot().draft.instructions, '\nLiteral {{cwd}}  ')
  editor.addNode('group')
  editor.changeNode('main-instructions', 'text', 'More recent edit')
  assert.equal(editor.getSnapshot().undo, null)
  const before = structuredClone(editor.getSnapshot().draft)
  editor.update({ busy: true })
  editor.addNode('block')
  editor.removeNode('main-instructions')
  editor.moveNode('main-instructions', null, 'inside')
  editor.changeNode('main-instructions', 'text', 'Busy overwrite')
  assert.deepEqual(editor.getSnapshot().draft, before)
})
