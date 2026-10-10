import assert from 'node:assert/strict'
import test from 'node:test'
import { presetCommand } from '../../../src/features/presets/client/command.js'
import { RemoteRoleplayPresetProvider, RemoteSessionPresetProvider } from '../../../src/features/presets/client/presets.js'

test('preset command loads current Host choices and applies only to the invoking session', async t => {
  const calls = []
  let current = { id: 'custom', name: 'Сохранённая копия' }
  t.mock.method(globalThis, 'fetch', async (url, request) => {
    const payload = JSON.parse(request.body)
    calls.push([url.split('/').at(-1), payload])
    let value
    if (url.endsWith('/preset-list')) value = { presets: [{ id: 'mayori', name: 'Mayori' }, { id: 'custom', name: 'Новый текст' }], defaultId: 'mayori' }
    else {
      assert.equal(payload.sessionId, 'invoked')
      if (url.endsWith('/session-preset')) current = payload.presetId === null ? null : { id: payload.presetId }
      value = { preset: current }
    }
    return { ok: true, json: async () => ({ ok: true, value }) }
  })
  const selection = new RemoteSessionPresetProvider('invoked')
  const command = presetCommand({ presets: new RemoteRoleplayPresetProvider(), presetFor: id => {
    assert.equal(id, 'invoked'); return selection
  } })
  const session = { sessionId: 'invoked' }
  assert.equal(command.available(session), true)
  assert.equal(command.available({}), false)
  const options = await command.ui.options(session, new AbortController().signal)
  assert.deepEqual(options.map(row => [row.label, row.active]), [['Без пресета', false], ['Mayori', false], ['Новый текст', true]])
  await command.ui.onSelect(options[1], session)
  assert.equal(selection.getSnapshot().preset.id, 'mayori')
  await command.ui.onSelect(options[0], session)
  assert.equal(selection.getSnapshot().preset, null)
  assert.deepEqual(calls.filter(([endpoint]) => endpoint === 'session-preset').map(([, payload]) => payload), [
    { sessionId: 'invoked', presetId: 'mayori' }, { sessionId: 'invoked', presetId: null },
  ])
  assert.equal((await command.ui.options(session, new AbortController().signal))[0].active, true)
})

test('preset popup reports state read failures and aborts cancelled loads', async () => {
  const selection = { refresh: async () => {}, getSnapshot: () => ({ status: 'error', error: 'Чат закрыт.' }) }
  const presets = { refresh: async () => {}, getSnapshot: () => ({ status: 'ready', presets: [] }) }
  const command = presetCommand({ presets, presetFor: () => selection })
  await assert.rejects(command.ui.options({ sessionId: 'closed' }, new AbortController().signal), /Чат закрыт/)
  const controller = new AbortController()
  presets.refresh = async () => { controller.abort() }
  await assert.rejects(command.ui.options({ sessionId: 'closed' }, controller.signal), { name: 'AbortError' })
})
