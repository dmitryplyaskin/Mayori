import assert from 'node:assert/strict'
import test from 'node:test'
import { personaCommand } from '../../../src/features/personas/client/command.js'
import { RemotePersonaProvider } from '../../../src/features/personas/client/personas.js'
import { RemoteCharacterChatProvider } from '../../../src/features/character-session/client/chat.js'

test('persona command selects a saved persona or generic player for the invoking chat', async t => {
  const changes = []
  let persona = { id: 'alex', name: 'Алекс' }
  t.mock.method(globalThis, 'fetch', async (url, request) => {
    const payload = JSON.parse(request.body)
    let value
    if (url.endsWith('/persona-list')) value = { personas: [{ id: 'alex', name: 'Алекс', title: 'Путешественник' }, { id: 'sam', name: 'Сэм' }], defaultId: 'sam' }
    else {
      assert.equal(payload.sessionId, 'invoked')
      if (url.endsWith('/session-persona')) {
        changes.push(payload)
        persona = payload.personaId === null ? { name: 'Игрок', description: '' } : { id: payload.personaId }
      }
      value = { persona, character: { name: 'Aster' } }
    }
    return { ok: true, json: async () => ({ ok: true, value }) }
  })
  const chat = new RemoteCharacterChatProvider('invoked')
  t.after(() => chat.dispose())
  const command = personaCommand({ personas: new RemotePersonaProvider(), chatFor: id => {
    assert.equal(id, 'invoked'); return chat
  } })
  const session = { sessionId: 'invoked' }
  const options = await command.ui.options(session, new AbortController().signal)
  assert.deepEqual(options.map(row => [row.label, row.active]), [['Без персоны', false], ['Алекс', true], ['Сэм', false]])
  assert.equal(options[1].detail, 'Путешественник')
  await command.ui.onSelect(options[2], session)
  assert.equal(chat.getSnapshot().value.persona.id, 'sam')
  await command.ui.onSelect(options[0], session)
  assert.equal(chat.getSnapshot().value.persona.name, 'Игрок')
  assert.deepEqual(changes, [{ sessionId: 'invoked', personaId: 'sam' }, { sessionId: 'invoked', personaId: null }])
  assert.equal((await command.ui.options(session, new AbortController().signal))[0].active, true)
})

test('persona popup refuses unavailable chats, propagates write errors and respects cancellation', async () => {
  let state = { status: 'ready', value: null }
  const chat = { refresh: async () => {}, getSnapshot: () => state, setPersona: async () => { throw new Error('Дождитесь завершения ответа.') } }
  const personas = { refresh: async () => {}, getSnapshot: () => ({ status: 'ready', personas: [] }) }
  const command = personaCommand({ personas, chatFor: () => chat })
  const session = { sessionId: 'unavailable' }
  await assert.rejects(command.ui.options(session, new AbortController().signal), /Выберите чат персонажа/)
  state = { status: 'error', error: 'Не удалось прочитать чат.' }
  await assert.rejects(command.ui.options(session, new AbortController().signal), /Не удалось прочитать чат/)
  await assert.rejects(command.ui.onSelect({ id: 'alex' }, session), /Дождитесь завершения/)
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(command.ui.options(session, controller.signal), { name: 'AbortError' })
})
