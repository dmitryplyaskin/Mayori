import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PersonaDrafts, personaDraft, personaChanged, updatePersonaNode, removePersonaNode, movePersonaNode } from '../../../src/features/personas/client/editing.js'

test('persona drafts preserve independent edits across library switches and reset only the chosen persona', () => {
  const drafts = new PersonaDrafts()
  const a = personaDraft({ id: 'a', name: 'A', description: 'saved' })
  const b = personaDraft({ id: 'b', name: 'B' })
  drafts.remember({ ...a, description: 'unsaved A' })
  drafts.remember({ ...b, title: 'unsaved B' })
  drafts.remember(personaDraft({ name: 'New unsaved' }))
  assert.equal(drafts.open(a).description, 'unsaved A')
  assert.ok(drafts.changed(a))
  drafts.open(a).description = 'mutated outside'
  assert.equal(drafts.open(a).description, 'unsaved A')
  drafts.forget('a')
  assert.equal(drafts.open(a).description, 'saved')
  assert.equal(drafts.open(b).title, 'unsaved B')
  assert.equal(drafts.open().name, 'New unsaved')
  assert.equal(personaChanged(a, a), false)
  assert.ok(personaChanged({ ...a, title: 'Edited' }, a))
})

test('selected persona block edits and reorder preserve neighbors, group gates and source data', () => {
  const blocks = [{ id: 'a', type: 'item', text: 'A' }, { id: 'g', type: 'group', enabled: false,
    items: [{ id: 'b', type: 'item', text: 'B' }, { id: 'c', type: 'item', text: 'C' }] }]
  const edited = updatePersonaNode(blocks, 'c', { text: 'Edited' })
  const moved = movePersonaNode(edited, 'c', -1)
  assert.deepEqual(moved[1].items.map(node => node.id), ['c', 'b'])
  assert.equal(moved[1].enabled, false)
  assert.equal(moved[1].items[0].text, 'Edited')
  assert.deepEqual(movePersonaNode(moved, 'c', -1), moved)
  assert.deepEqual(movePersonaNode(moved, 'a', -1), moved)
  assert.deepEqual(removePersonaNode(moved, 'c')[1].items.map(node => node.id), ['b'])
  assert.deepEqual(removePersonaNode(moved, 'g').map(node => node.id), ['a'])
  assert.equal(blocks[1].items[1].text, 'C')
  assert.deepEqual(movePersonaNode(blocks, 'g', -1).map(node => node.id), ['g', 'a'])
})
