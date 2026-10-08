/** Real requests verify independent plugin preferences in one existing chat. */
import assert from 'node:assert/strict'

const origin = process.argv[2] ?? 'http://127.0.0.1:3138'
const headers = { 'content-type': 'application/json', origin, 'sec-fetch-site': 'same-origin' }
async function request(path, method, body) {
  const response = await fetch(origin + path, { method, headers, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}
const probe = body => request('/_mayori-smoke', 'POST', body)
const read = () => request('/mayori/plugins', 'POST', {})
const initial = await read()
const roster = await probe({ action: 'presets' })
assert.ok(roster.presets.some(item => item.id === 'mayori' && !item.broken))
assert.ok(!roster.presets.some(item => ['mayori-dice', 'mayori-rules'].includes(item.id)))
const { workspaceId } = await probe({ action: 'create' })
let sessionId, originalPrompt
const checked = []
try {
  for (let bits = 0; bits < 8; bits++) {
    const plugins = { dice: !!(bits & 1), rules: !!(bits & 2), rollHistory: !!(bits & 4), compaction: false }
    const state = await read()
    const saved = await request('/mayori/plugins', 'PUT', { plugins, revision: state.revision })
    assert.equal(saved.pending, false)
    assert.deepEqual(saved.active, plugins)
    const expected = [plugins.dice && 'rollDice', plugins.rules && 'resolveCheck', plugins.rollHistory && 'getRollDetails'].filter(Boolean).sort()
    const turn = await probe(sessionId ? { action: 'turn', sessionId } : { action: 'preset-turn', workspaceId, preset: 'mayori' })
    sessionId = turn.sessionId
    assert.equal(turn.header.agentPreset, 'mayori')
    const gameplay = turn.requests.filter(item => item.messages.some(message => message.source?.kind === 'user'))
    assert.ok(gameplay.length)
    for (const item of gameplay) {
      assert.deepEqual((item.tools ?? []).map(tool => tool.name).sort(), expected)
      const prompt = item.messages.filter(message => message.role === 'system').map(message => message.content)
      originalPrompt ??= prompt
      assert.deepEqual(prompt, originalPrompt, 'Plugin settings do not select different instructions')
    }
    for (const key of ['hostHasDiceTool', 'hostHasRulesTool', 'hostHasRollHistoryTool']) assert.equal(turn[key], false)
    checked.push({ plugins, tools: expected })
  }
  const snapshot = await probe({ action: 'inspect', sessionId })
  const roll = snapshot.events.find(item => item.type === 'tool/result' && ['mayori-dice', 'mayori-check'].includes(item.data.meta?.kind))
  assert.ok(roll)
  const details = await probe({ action: 'details', sessionId, rollIds: [roll.data.message.toolCallId] })
  assert.deepEqual(details.rolls[0].result, roll.data.meta.result)
  const invalid = await fetch(origin + '/mayori/plugins', { method: 'PUT', headers, body: JSON.stringify({ plugins: { ...initial.plugins, dice: 'false' } }) })
  assert.equal(invalid.status, 400)
} finally {
  const state = await read()
  await request('/mayori/plugins', 'PUT', { plugins: initial.plugins, revision: state.revision })
}
console.log(JSON.stringify({ ok: true, sessionId, checked }))
