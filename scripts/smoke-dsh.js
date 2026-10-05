/** Keyless integration assertions against an isolated DSH with dsh-smoke-probe.js. */
import assert from 'node:assert/strict'

const origin = process.argv[2] ?? 'http://127.0.0.1:3090'
async function call(path, payload) {
  const response = await fetch(`${origin}${path}`, {
    method: 'POST', headers: { 'content-type': 'application/json', origin, 'sec-fetch-site': 'same-origin' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(30000),
  })
  const result = await response.json()
  assert.equal(response.ok && result.ok, true, JSON.stringify(result))
  return result.value
}

let sessionId = process.argv.slice(3).find(argument => !argument.startsWith('--'))
if (sessionId === undefined) {
  const imported = await call('/mayori/characters/import', { files: [{ name: 'aster.json', type: 'application/json',
    base64: Buffer.from(JSON.stringify({ spec: 'chara_card_v2', spec_version: '2.0', data: {
      name: 'Aster', description: '{{char}}: A patient archivist under the moon.', personality: '{{CHAR}} is patient.',
      scenario: '{{Char}} waits for {{user}}. {{unknown}} {{cwd}} {{model}} {{roll::1d20}} {{getvar::quest}} {{random::a::b}} {{}} {{bad name}} {{outer::{{nested}}}} {{unfinished',
      first_mes: '{{char}}: You came back, {{user}}.', mes_example: '{{user}}: Hello.\n{{char}}: Welcome.',
      creator_notes: '', system_prompt: 'Portray {{char}}.', post_history_instructions: 'Keep {{char}} consistent.',
      alternate_greetings: ['{{char}}: Another greeting.'],
      tags: ['smoke'], creator: 'Mayori smoke', character_version: '1', extensions: { hidden: 'smoke-private-extension' },
    } })).toString('base64') }] })
  assert.equal(imported.imported, 1)
  const { cards } = await call('/mayori/characters/list', {})
  const card = cards.find(item => item.name === 'Aster')
  const created = await call('/_mayori-smoke', { action: 'create' })
  assert.equal(created.agentPreset, 'mayori')
  sessionId = created.sessionId
  await call('/mayori/characters/play', { sessionId, characterId: card.id })
  if (!process.argv.includes('--keep-card')) await call('/mayori/characters/remove', { id: card.id })
}
const turn = await call('/_mayori-smoke', { action: 'turn', sessionId })
assert.equal(turn.header.agentPreset, 'mayori')
const modelInput = turn.requests.findLast(request => request.messages.some(message => message.source?.kind === 'user'))
assert.ok(modelInput.messages.some(message => JSON.stringify(message).includes('A patient archivist under the moon.')))
assert.ok(turn.messages.some(message => JSON.stringify(message).includes('A patient archivist under the moon.')))
const modelText = JSON.stringify(modelInput.messages)
const logText = JSON.stringify(turn.messages)
for (const marker of ['Aster: A patient archivist', 'Aster is patient.', 'Aster waits for {{user}}.',
  'Aster: You came back, {{user}}.', 'Portray Aster.', 'Keep Aster consistent.', 'Aster: Another greeting.',
  '{{unknown}}', '{{cwd}}', '{{model}}', '{{roll::1d20}}', '{{getvar::quest}}', '{{random::a::b}}', '{{}}', '{{bad name}}', '{{outer::{{nested}}}}', '{{unfinished']) {
  assert.ok(modelText.includes(marker), `Model context must contain literal/resolved marker: ${marker}`)
  assert.ok(logText.includes(marker), `Session log must preserve marker: ${marker}`)
}
assert.doesNotMatch(modelText, /mayori_active_character_text/)
assert.ok(turn.messages.some(message => message.role === 'assistant' && JSON.stringify(message).includes('Welcome to the archive.')))
assert.doesNotMatch(JSON.stringify(modelInput.messages), /smoke-private-extension/)
assert.equal(modelInput.tools?.length ?? 0, 0)
console.log(JSON.stringify({ ok: true, sessionId, loggedMessages: turn.messages.length, codingTools: 0 }))
