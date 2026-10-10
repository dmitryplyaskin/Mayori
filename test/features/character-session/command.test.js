import assert from 'node:assert/strict'
import test from 'node:test'
import { newChatCommand } from '../../../src/features/character-session/client/command.js'

test('new command loads the invoking character and starts a fresh chat only once', async () => {
  let finishRead
  const read = new Promise(resolve => { finishRead = resolve })
  const created = []
  const character = { id: 'aster', name: 'Aster' }
  const command = newChatCommand({
    chatFor: id => {
      assert.equal(id, 'source')
      return { refresh: () => read, getSnapshot: () => ({ status: 'ready', value: { character } }) }
    },
    startCharacter: async (...args) => { created.push(args) },
    notify() { assert.fail('No error expected') },
  })
  const session = { sessionId: 'source' }
  assert.equal(command.available(session), true)
  assert.equal(command.available({}), false)
  const operation = command.ui.run(session)
  assert.equal(command.available(session), false)
  await command.ui.run(session)
  finishRead()
  await operation
  assert.deepEqual(created, [[character, 'source']])
  assert.equal(command.available(session), true)
})

test('new command reports read and creation failures to its source chat and permits retry', async () => {
  let snapshot = { status: 'error', error: 'Чат закрыт.' }
  const notices = []
  let starts = 0
  const command = newChatCommand({
    chatFor: () => ({ refresh: async () => {}, getSnapshot: () => snapshot }),
    startCharacter: async () => { starts++; throw new Error('Персонаж больше не найден в галерее.') },
    notify: (...args) => notices.push(args),
  })
  const session = { sessionId: 'source' }
  await command.ui.run(session)
  snapshot = { status: 'ready', value: null }
  await command.ui.run(session)
  assert.equal(starts, 0)
  snapshot = { status: 'ready', value: { character: { id: 'aster', name: 'Aster' } } }
  await command.ui.run(session)
  assert.deepEqual(notices, [
    ['source', 'Чат закрыт.'], ['source', 'Откройте чат персонажа из галереи.'], ['source', 'Персонаж больше не найден в галерее.'],
  ])
  assert.equal(command.available(session), true)
})
