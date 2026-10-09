/** Keyless integration assertions against an isolated DSH with dsh-smoke-probe.js. */
import assert from 'node:assert/strict'
import { readDiceResult, compactDiceResult } from '../src/features/dice/shared/result.js'
import { readCheckResult } from '../src/features/rules/shared/result.js'

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
const resuming = sessionId !== undefined
const expectedPreset = process.env.MAYORI_SMOKE_PRESET ?? 'mayori'
const greetingIndex = process.argv.includes('--alternate') ? 1 : 0
const expectedGreeting = greetingIndex === 0 ? 'Aster: You came back, Alex.' : 'Aster: Another greeting.'
if (sessionId === undefined) {
  const persona = await call('/mayori/characters/persona-save', { name: 'Alex', description: '{{user}} is a traveller.', title: 'smoke-private-title' })
  await call('/mayori/characters/persona-default', { id: persona.id })
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
  const prepared = await call('/mayori/characters/start', { characterId: card.id, workspaceId: created.workspaceId, greetingIndex })
  sessionId = prepared.sessionId
  const adopted = await call('/_mayori-smoke', { action: 'adopt', sessionId, workspaceId: created.workspaceId })
  assert.equal(adopted.agentPreset, expectedPreset)
  const beforeTurn = await call('/_mayori-smoke', { action: 'inspect', sessionId })
  assert.equal(beforeTurn.requestCount, created.requestCount, 'Greeting must not call an LLM')
  assert.equal(beforeTurn.messages.length, 2)
  assert.equal(beforeTurn.messages[0].role, 'assistant')
  assert.equal(beforeTurn.messages[0].content[0].text, expectedGreeting)
  assert.equal(beforeTurn.messages[1].source.kind, 'mayori-preset')
  const other = await call('/mayori/characters/swipe', { sessionId, index: 1 - greetingIndex })
  assert.equal(other.greeting.index, 1 - greetingIndex)
  const restored = await call('/mayori/characters/swipe', { sessionId, index: greetingIndex })
  assert.equal(restored.greeting.text, expectedGreeting)
  const bound = await call('/mayori/characters/session-persona', { sessionId, personaId: persona.id })
  assert.equal(bound.persona.name, 'Alex')
  assert.equal(bound.greeting.text, expectedGreeting)
  const forked = await call('/_mayori-smoke', { action: 'fork', sessionId, atSeq: bound.greeting.eventSeq })
  const forkState = await call('/mayori/characters/session-state', { sessionId: forked.sessionId })
  assert.equal(forkState.greeting.index, greetingIndex)
  assert.equal(forkState.greeting.text, expectedGreeting)
  assert.equal(forkState.persona.name, 'Alex')
  await call('/mayori/characters/persona-save', { ...persona, name: 'Changed outside chat' })
  await call('/mayori/characters/persona-remove', { id: persona.id })
  assert.equal((await call('/mayori/characters/session-state', { sessionId })).persona.name, 'Alex')
  if (!process.argv.includes('--keep-card')) await call('/mayori/characters/remove', { id: card.id })
}
const turn = await call('/_mayori-smoke', { action: 'turn', sessionId })
assert.equal(turn.header.agentPreset, expectedPreset)
assert.equal(turn.hostHasDiceTool, false, 'The dice tool must remain in the Mayori preset scope')
const modelInput = turn.requests.findLast(request => request.messages.some(message => message.source?.kind === 'user'))
assert.equal(modelInput.messages[0].role, 'system')
const systemText = modelInput.messages[0].content.map(block => block.text ?? '').join('')
assert.match(systemText, /You are Mayori, an AI game master/)
assert.doesNotMatch(systemText, /DeepSeek Harness|coding assistant|implementation checkout|working directory|Web GUI|DSH_WEB_URL|dev:web|Vite|window\.__DSH_BOOT__|replacement server|campaign files|tools SDK|run_code|Do not call present|existing file|Office documents/)
const runtimeContexts = modelInput.messages.filter(message => message.source?.kind === 'runtime-context')
assert.equal(runtimeContexts.length, 1, 'DSH records its required working-directory snapshot')
assert.deepEqual(runtimeContexts[0].source.sections.map(section => section.name), ['working-directory:current'],
  'RPG requests must not include optional technical runtime contexts')
assert.match(runtimeContexts[0].source.sections[0].text, /^Current working directory: ".+"\.$/)
assert.ok(!(modelInput.tools ?? []).some(tool => tool.name === 'working_directory'),
  'RPG requests must not expose the coding working-directory tool')
assert.ok(systemText.indexOf('Protect player agency.') < systemText.indexOf('<mayori-character-card>'))
assert.ok(systemText.includes('A patient archivist under the moon.'))
assert.equal(modelInput.messages.filter(message => JSON.stringify(message).includes('<mayori-character-card>')).length, 1,
  'The character context must occur once in the instruction prefix, ahead of the conversation')
const trajectoryContext = await call('/mayori/characters/trajectory-context', { sessionId })
// The mock receives metadata-only messages that the DeepSeek serializer omits.
const visibleMessages = messages => messages.filter(message => message.role !== 'user' || message.content.length > 0)
assert.deepEqual(trajectoryContext.messages.map(item => item.message), visibleMessages(modelInput.messages),
  'Trajectory request input must match the DSH messages admitted by the DeepSeek serializer')
const savedContext = await call('/mayori/characters/trajectory-context', { sessionId, selection: 'current' })
assert.deepEqual(savedContext.messages.map(item => item.message), visibleMessages(turn.messages))
assert.ok(modelInput.messages.some(message => JSON.stringify(message).includes('A patient archivist under the moon.')))
assert.ok(turn.messages.some(message => JSON.stringify(message).includes('A patient archivist under the moon.')))
const modelText = JSON.stringify(modelInput.messages)
const logText = JSON.stringify(turn.messages)
for (const marker of ['Aster: A patient archivist', 'Aster is patient.', 'Aster waits for Alex.', 'Alex is a traveller.',
  expectedGreeting, 'Portray Aster.', 'Keep Aster consistent.',
  '{{unknown}}', '{{cwd}}', '{{model}}', '{{roll::1d20}}', '{{getvar::quest}}', '{{random::a::b}}', '{{}}', '{{bad name}}', '{{outer::{{nested}}}}', '{{unfinished']) {
  assert.ok(modelText.includes(marker), `Model context must contain literal/resolved marker: ${marker}`)
  assert.ok(logText.includes(marker), `Session log must preserve marker: ${marker}`)
}
assert.doesNotMatch(modelText, /mayori_active_character_text/)
assert.ok(!modelText.includes(greetingIndex === 0 ? 'Aster: Another greeting.' : 'Aster: You came back, Alex.'))
assert.doesNotMatch(modelText, /smoke-private-title|Changed outside chat|\{\{user\}\}/)
const rejectedSwipe = await fetch(`${origin}/mayori/characters/swipe`, { method: 'POST',
  headers: { 'content-type': 'application/json', origin, 'sec-fetch-site': 'same-origin' },
  body: JSON.stringify({ sessionId, index: 1 - greetingIndex }) })
assert.equal(rejectedSwipe.status, 400, 'Played greeting is locked')
assert.equal(turn.messages.filter(message => message.source?.provider === 'mayori-character-card' || message.source?.kind === 'mayori-greeting').length, 1)
assert.ok(turn.messages.some(message => message.role === 'assistant' && JSON.stringify(message).includes('Welcome to the archive.')))
assert.doesNotMatch(JSON.stringify(modelInput.messages), /smoke-private-extension/)
const tools = (modelInput.tools ?? []).map(tool => tool.name)
assert.ok(tools.every(name => ['getRollDetails', 'resolveCheck', 'rollDice'].includes(name)), 'Only selected game tools reach the model')
const hasDice = tools.includes('rollDice'), hasRules = tools.includes('resolveCheck'), hasHistory = tools.includes('getRollDetails')
const startSeq = turn.events.findLast(event => event.type === 'turn/start').seq
const recent = turn.events.filter(event => event.seq >= startSeq)
const diceCalls = recent.filter(event => event.type === 'tool/call' && event.data.name === 'rollDice')
assert.equal(diceCalls.length, hasDice ? 2 : 0, 'Only an enabled Dice tool exercises compact and full responses')
for (const [index, diceCall] of diceCalls.entries()) {
  const diceEvent = turn.events.findLast(event => event.type === 'tool/result' && event.data.message.toolCallId === diceCall.data.callId)
  assert.ok(diceEvent, 'A real native dice invocation must be recorded by the loop')
  assert.ok(!diceEvent.data.message.isError, JSON.stringify(diceEvent))
  const body = JSON.parse(diceEvent.data.message.content[0].text)
  assert.equal(Object.hasOwn(body, 'details'), index === 1)
  assert.equal(diceEvent.data.meta.kind, 'mayori-dice')
  const rolled = diceEvent.data.meta.result
  assert.equal(body.rollId, diceCall.data.callId)
  assert.deepEqual(body, index === 1 ? rolled : compactDiceResult(rolled))
  assert.deepEqual(readDiceResult(diceEvent.data.message.content, diceEvent.data.meta), rolled)
  assert.deepEqual(rolled.errors.map(error => error.code), ['invalid_expression', 'dependency_failed'])
  assert.equal(rolled.schemaVersion, 3)
  assert.equal(rolled.purpose, 'Проверка механики бросков')
  assert.equal(rolled.details.length, 16)
  assert.ok(modelInput.messages.some(message => message.role === 'tool' && message.content[0]?.text === diceEvent.data.message.content[0].text),
    'The next model step receives exactly the chosen recorded response')
  for (const detail of rolled.details) {
    for (const dice of detail.dice) assert.ok(dice.results.every(face => Number.isInteger(face) && face >= 1 && face <= dice.sides))
  }
  assert.equal(rolled.values.attack, Math.max(...rolled.details[0].dice[0].results) + 4)
  const at = (...path) => rolled.details.find(detail => JSON.stringify(detail.path) === JSON.stringify(path))
  assert.equal(rolled.values.hit, rolled.values.attack >= 15)
  const damage = at('damage', 'weapon')
  assert.equal(damage.decisions[0].branch, rolled.values.hit ? 'then' : 'else')
  if (rolled.values.hit) assert.equal(rolled.values.damage.weapon, [...damage.dice[0].chains].sort((a, b) => b.value - a.value).slice(0, 3).reduce((sum, chain) => sum + chain.value, 0) + 4)
  else { assert.equal(rolled.values.damage.weapon, 0); assert.equal(damage.dice.length, 0) }
  assert.equal(rolled.values.checks[0], Math.min(...at('checks', 0).dice[0].results))
  assert.equal(rolled.values.checks[1], Math.floor(at('checks', 1).dice[0].results.reduce((sum, face) => sum + face, 0) / 2))
  assert.equal(rolled.values.checks[2], at('checks', 2).dice[0].results[0])
  assert.equal(rolled.values.successes, at('successes').dice[0].results.filter(face => face >= 8).length)
  assert.equal(rolled.values.halfDamage, rolled.values.save ? Math.floor(rolled.values.baseDamage / 2) : rolled.values.baseDamage)
  assert.equal(rolled.values.broken, null); assert.equal(rolled.values.dependent, null); assert.equal(rolled.values.isolated, 1)
  assert.equal(rolled.values.skipped, 0); assert.equal(at('skipped').dice.length, 0)
  assert.equal(rolled.values.explosion, at('explosion').dice[0].chains[0].value)
  assert.ok(rolled.values.reroll >= 3)
  for (const detail of [at('attack'), at('checks', 0)]) {
    const dice = detail.dice[0]
    assert.equal(dice.keptIndices.length, dice.keep.count)
    assert.equal(dice.results.length, 2)
  }
}
const completed = turn.events.findLast(event => event.type === 'assistant/message')
const checkCall = recent.findLast(event => event.type === 'tool/call' && event.data.name === 'resolveCheck')
const checkEvent = turn.events.findLast(event => event.type === 'tool/result' && event.data.message.toolCallId === checkCall?.data.callId)
assert.equal(!!checkCall, hasRules)
if (hasRules) {
  assert.ok(checkEvent && !checkEvent.data.message.isError, 'A native check is recorded')
  const checked = readCheckResult(checkEvent.data.message.content, checkEvent.data.meta)
  assert.ok(checked)
  assert.equal(checked.check.total, checked.check.natural + 6)
  assert.equal(checked.check.outcome, checked.check.natural === 20 ? 'critical_success' : checked.check.natural === 1 ? 'critical_failure' : checked.check.total >= 12 ? 'success' : 'failure')
  assert.equal(Object.hasOwn(JSON.parse(checkEvent.data.message.content[0].text), 'dice'), false)
  assert.ok(modelInput.messages.some(message => message.role === 'tool' && message.content[0]?.text === checkEvent.data.message.content[0].text))
}
assert.equal(turn.hostHasRulesTool, false, 'Rules remain isolated to the RPG preset')
assert.equal(turn.hostHasRollHistoryTool, false, 'Roll history remains isolated to the RPG preset')
if (resuming && hasHistory) {
  const previous = turn.events.find(event => event.type === 'tool/result' && ['mayori-dice', 'mayori-check'].includes(event.data.meta?.kind))
  if (previous) {
    const restoredDetails = await call('/_mayori-smoke', { action: 'details', sessionId, rollIds: [previous.data.message.toolCallId] })
    assert.deepEqual(restoredDetails.rolls[0].result, previous.data.meta.result, 'The original trace is readable after Host restart')
  }
}
let expanded
const detailCall = recent.findLast(event => event.type === 'tool/call' && event.data.name === 'getRollDetails')
const detailEvent = turn.events.findLast(event => event.type === 'tool/result' && event.data.message.toolCallId === detailCall?.data.callId)
if (hasHistory && (hasDice || hasRules)) {
  assert.ok(detailEvent && !detailEvent.data.message.isError, 'The model reads saved details in a separate native step')
  expanded = JSON.parse(detailEvent.data.message.content[0].text)
  assert.equal(expanded.rolls.length, diceCalls.length + Number(hasRules) + 1)
  assert.equal(expanded.rolls.at(-1).error.code, 'not_found')
  for (const record of expanded.rolls.slice(0, -1)) {
    const original = turn.events.find(event => event.type === 'tool/result' && event.data.message.toolCallId === record.rollId)
    assert.deepEqual(record.result, original.data.meta.result)
  }
  assert.ok(modelInput.messages.some(message => message.role === 'tool' && message.content[0]?.text === detailEvent.data.message.content[0].text))
} else assert.equal(detailCall, undefined)
const diceFork = await call('/_mayori-smoke', { action: 'fork', sessionId, atSeq: completed.seq })
const forkedDice = await call('/_mayori-smoke', { action: 'inspect', sessionId: diceFork.sessionId })
assert.deepEqual(forkedDice.messages.filter(message => message.role === 'tool'), turn.messages.filter(message => message.role === 'tool'),
  'A fork retains the original dice results without rerolling')
assert.deepEqual(forkedDice.events.filter(event => event.type === 'tool/result').map(event => event.data.meta),
  turn.events.filter(event => event.type === 'tool/result').map(event => event.data.meta), 'A fork retains complete dice presentation metadata')
if (expanded) {
  const saved = expanded.rolls.filter(record => !record.error)
  const forkDetails = await call('/_mayori-smoke', { action: 'details', sessionId: diceFork.sessionId, rollIds: saved.map(record => record.rollId) })
  assert.deepEqual(forkDetails.rolls.map(record => record.result), saved.map(record => record.result), 'Inherited ids retrieve the original traces')
}
console.log(JSON.stringify({ ok: true, sessionId, loggedMessages: turn.messages.length, codingTools: 0,
  tools, diceExpressions: hasDice ? 16 : 0, diceResponseModes: hasDice ? 2 : 0 }))
