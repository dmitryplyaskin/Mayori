import assert from 'node:assert/strict'
import test from 'node:test'
import { RemoteRoleplayPresetProvider } from '../../../src/features/presets/client/presets.js'
import { presetChanged } from '../../../src/features/presets/client/presentation.js'

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
