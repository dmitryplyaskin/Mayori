import assert from 'node:assert/strict'
import { readPresetSelection } from '../src/features/presets/shared/preset.js'

const origin = process.argv[2] ?? 'http://127.0.0.1:3094'
async function call(path, payload) {
  const response = await fetch(`${origin}${path}`, { method: 'POST',
    headers: { 'content-type': 'application/json', origin, 'sec-fetch-site': 'same-origin' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(30000) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}
const rpc = (endpoint, payload = {}) => call(`/mayori/characters/${endpoint}`, payload)
const campaign = await call('/_mayori-smoke', { action: 'create' })
const initial = await rpc('preset-list')
const preset = await rpc('preset-save', { name: 'Preset smoke', instructions: 'PRESET_ORIGINAL: Portray a patient narrator. {{unknown}} {{cwd}}' })
await rpc('preset-default', { id: preset.id })
const imported = await rpc('import', { files: [{ name: 'preset-smoke.json', type: 'application/json',
  base64: Buffer.from(JSON.stringify({ spec: 'chara_card_v2', spec_version: '2.0', data: {
    name: 'Preset smoke character', description: 'A patient archivist.', first_mes: 'An authored opening.',
    personality: '', scenario: '', mes_example: '', creator_notes: '', system_prompt: '', post_history_instructions: '',
    alternate_greetings: [], tags: [], creator: '', character_version: '', extensions: {},
  } })).toString('base64') }] })
assert.equal(imported.imported, 1)
const character = (await rpc('list')).cards.find(card => card.name === 'Preset smoke character')
const { sessionId } = await rpc('start', { characterId: character.id, workspaceId: campaign.workspaceId })
await call('/_mayori-smoke', { action: 'adopt', sessionId, workspaceId: campaign.workspaceId })
assert.deepEqual((await rpc('session-preset-state', { sessionId })).preset, preset)
const before = await call('/_mayori-smoke', { action: 'inspect', sessionId })
assert.deepEqual(readPresetSelection(before.events), preset)
assert.equal(before.messages[0].role, 'assistant')
assert.equal(before.messages[0].content[0].text, 'An authored opening.')
assert.equal(before.requestCount, campaign.requestCount, 'Preset application must not call the model')
const turn = await call('/_mayori-smoke', { action: 'turn', sessionId })
assert.ok(turn.requests.length > 0)
const request = turn.requests[0]
const system = request.messages[0].content.map(block => block.text ?? '').join('')
assert.ok(system.includes('PRESET_ORIGINAL'))
assert.ok(system.includes('{{unknown}} {{cwd}}'))
assert.ok(!system.includes('Mayori facilitates'))
const updated = await rpc('preset-save', { ...preset, instructions: 'PRESET_UPDATED: Use concise responses.' })
assert.deepEqual((await rpc('session-preset-state', { sessionId })).preset, preset)
await rpc('session-preset', { sessionId, presetId: preset.id })
assert.deepEqual((await rpc('session-preset-state', { sessionId })).preset, updated)
const updatedTurn = await call('/_mayori-smoke', { action: 'turn', sessionId })
const updatedSystem = updatedTurn.requests[0].messages.filter(message => message.role === 'system').map(message => JSON.stringify(message.content)).join('')
assert.ok(updatedSystem.includes('PRESET_UPDATED'))
assert.ok(!updatedSystem.includes('PRESET_ORIGINAL'))
const originalSnapshot = before.events.findLast(event => event.type === 'user/message').seq
const fork = await call('/_mayori-smoke', { action: 'fork', sessionId, atSeq: originalSnapshot })
assert.deepEqual((await rpc('session-preset-state', { sessionId: fork.sessionId })).preset, preset)
await rpc('preset-remove', { id: preset.id })
assert.deepEqual((await rpc('session-preset-state', { sessionId })).preset, updated)
assert.equal((await rpc('preset-list')).defaultId, null)
await rpc('preset-default', { id: initial.defaultId })
const sourceBeforeEdit = await call('/_mayori-smoke', { action: 'inspect', sessionId })
const openingSeq = before.events.find(event => event.type === 'assistant/message').seq
const authored = await rpc('message-edit', { sessionId, seq: openingSeq, text: 'A manually edited opening.', mode: 'branch' })
await call('/_mayori-smoke', { action: 'adopt', sessionId: authored.sessionId, workspaceId: campaign.workspaceId })
assert.deepEqual((await rpc('session-preset-state', { sessionId: authored.sessionId })).preset, updated,
  'Editing an opening retains a deleted preset instead of substituting the catalog default')
const authoredLog = await call('/_mayori-smoke', { action: 'inspect', sessionId: authored.sessionId })
assert.deepEqual(readPresetSelection(authoredLog.events), updated)
assert.deepEqual((await call('/_mayori-smoke', { action: 'inspect', sessionId })).events, sourceBeforeEdit.events)
const revised = await rpc('message-edit', { sessionId: authored.sessionId,
  seq: authoredLog.events.find(event => event.type === 'assistant/message').seq, text: 'A second authored opening.', mode: 'branch' })
await call('/_mayori-smoke', { action: 'adopt', sessionId: revised.sessionId, workspaceId: campaign.workspaceId })
assert.deepEqual((await rpc('session-preset-state', { sessionId: revised.sessionId })).preset, updated)
await rpc('session-preset', { sessionId, presetId: null })
assert.equal((await rpc('session-preset-state', { sessionId })).preset, null)
const disabledTurn = await call('/_mayori-smoke', { action: 'turn', sessionId })
const disabledSystem = disabledTurn.requests[0].messages.filter(message => message.role === 'system').map(message => JSON.stringify(message.content)).join('')
assert.ok(!disabledSystem.includes('PRESET_UPDATED'))
assert.ok(!disabledSystem.includes('PRESET_ORIGINAL'))
const withoutPreset = await rpc('message-edit', { sessionId, seq: openingSeq, text: 'An opening without a preset.', mode: 'branch' })
await call('/_mayori-smoke', { action: 'adopt', sessionId: withoutPreset.sessionId, workspaceId: campaign.workspaceId })
assert.equal((await rpc('session-preset-state', { sessionId: withoutPreset.sessionId })).preset, null,
  'An explicit no-preset selection must survive opening edits despite a non-null default')
await rpc('preset-default', { id: initial.defaultId })
const nested = await rpc('preset-save', { name: 'Nested preset smoke', instructions: 'UNTRUSTED_BROWSER_COMPILATION', nodes: [
  { id: 'rules', kind: 'group', title: 'Mechanics', enabled: true, children: [
    { id: 'checks', kind: 'group', title: 'Checks', enabled: true, children: [
      { id: 'active', kind: 'block', title: 'Active', enabled: true, text: 'NESTED_ACTIVE: {{unknown}}' },
      { id: 'disabled', kind: 'block', title: 'Disabled', enabled: false, text: 'NESTED_DISABLED_SECRET' },
    ] },
    { id: 'off', kind: 'group', title: 'Off group', enabled: false, children: [
      { id: 'hidden', kind: 'block', title: 'Hidden', enabled: true, text: 'NESTED_PARENT_SECRET' },
    ] },
  ] },
] })
try {
  assert.equal(nested.instructions, 'NESTED_ACTIVE: {{unknown}}')
  await rpc('session-preset', { sessionId, presetId: nested.id })
  const nestedTurn = await call('/_mayori-smoke', { action: 'turn', sessionId })
  const content = nestedTurn.requests[0].messages.map(message => JSON.stringify(message.content)).join('\n')
  assert.ok(content.includes('NESTED_ACTIVE'))
  for (const secret of ['NESTED_DISABLED_SECRET', 'NESTED_PARENT_SECRET', 'UNTRUSTED_BROWSER_COMPILATION']) assert.ok(!content.includes(secret))
  const nestedLog = await call('/_mayori-smoke', { action: 'inspect', sessionId })
  assert.deepEqual(readPresetSelection(nestedLog.events), nested)
  await rpc('preset-save', { ...nested, nodes: [] })
  assert.deepEqual((await rpc('session-preset-state', { sessionId })).preset, nested)
  await rpc('preset-remove', { id: nested.id })
  const nestedFork = await call('/_mayori-smoke', { action: 'fork', sessionId, atSeq: nestedLog.events.at(-1).seq })
  assert.deepEqual((await rpc('session-preset-state', { sessionId: nestedFork.sessionId })).preset, nested)
  await rpc('session-preset', { sessionId, presetId: null })
} finally {
  if ((await rpc('preset-list')).presets.some(p => p.id === nested.id)) await rpc('preset-remove', { id: nested.id })
}
console.log(JSON.stringify({ ok: true, sessionId, forkId: fork.sessionId }))
