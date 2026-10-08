/** Run only against a temporary profile with dsh-smoke-probe; no real LLM calls. */
import assert from 'node:assert/strict'
const origin = process.argv[2] ?? 'http://127.0.0.1:3146'
const headers = { 'content-type': 'application/json', origin, 'sec-fetch-site': 'same-origin' }
async function request(path, method, body) {
  const response = await fetch(origin + path, { method, headers, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) })
  const result = await response.json(); assert.ok(response.ok && result.ok, JSON.stringify(result)); return result.value
}
const probe = body => request('/_mayori-smoke', 'POST', body)
const read = () => request('/mayori/plugins', 'POST', {})
const initial = await read()
async function save(plugins, compaction) {
  const current = await read()
  return request('/mayori/plugins', 'PUT', { plugins, compaction, revision: current.revision })
}
const summaries = value => value.events.filter(event => event.type === 'compaction/summary')
const count = value => value.requests.filter(item => item.purpose === 'compaction').length
const instructions = 'COMPACTION_CUSTOM_V1: сохрани обещания. Формат: ## Сцена\n## Отношения. {{user}} буквально.'
const plugins = { dice: false, rules: false, rollHistory: false, compaction: true }
let sessionId
try {
  if (process.argv[3]) {
    sessionId = process.argv[3]
    const replay = await probe({ action: 'inspect', sessionId })
    assert.ok(summaries(replay).length)
    assert.ok(replay.messages.some(message => message.content.some(block => block.text?.includes('<compacted-summary>'))))
    assert.ok(replay.events.some(event => event.type === 'user/message' && event.data.content.some(block => block.text?.startsWith('CAMPAIGN_LONG_HISTORY'))))
    console.log(JSON.stringify({ ok: true, replay: sessionId, summaries: summaries(replay).length }))
  } else {
    const options = { ...initial.compaction, instructions, thresholdPercent: 95, retainPercent: 0, headroomTokens: 0, maxSummaryTokens: 256 }
    await save(plugins, options)
    const { workspaceId } = await probe({ action: 'create' })
    let turn = await probe({ action: 'preset-turn', workspaceId, preset: 'mayori', text: 'CAMPAIGN_LONG_HISTORY: ' + 'Марта обещала помочь у ворот. '.repeat(700) })
    sessionId = turn.sessionId
    assert.equal(count(turn), 0)
    assert.ok(turn.requests[0].tools.some(tool => tool.name === 'compactHistory'))
    for (const call of turn.requests) assert.ok(!call.messages.some(message => message.content.some(block => block.text?.includes('configuration notice') || block.text?.includes('Настройки сжатия истории обновлены'))))
    const systemHead = turn.events.find(event => event.surfaceOp)
    assert.equal(systemHead.type, 'system/message', 'Native admission reserves the first surface node')
    assert.equal(turn.hostHasCompaction, false)
    assert.ok(turn.events.some(event => event.type === 'user/message' && event.data.source.kind === 'mayori-compaction-settings'))
    const original = turn.events.find(event => event.type === 'user/message' && event.data.source.kind === 'user')
    await save(plugins, { ...options, thresholdPercent: 15 })
    turn = await probe({ action: 'turn', sessionId })
    assert.equal(count(turn), 1)
    assert.equal(turn.requests.find(item => item.purpose === 'compaction').messages.at(-1).content[0].text, instructions)
    assert.ok(turn.events.some(event => event.seq === original.seq && event.data.id === original.data.id))
    assert.ok(turn.messages.some(message => message.content.some(block => block.text?.includes('<compacted-summary>'))))
    const first = summaries(turn)[0]
    assert.ok(!first.data.shadowedSeqs.includes(systemHead.seq), 'Compaction preserves the protected system head')
    assert.ok(first.data.shadowedSeqs.includes(original.seq))
    const changed = { ...options, thresholdPercent: 15, instructions: 'COMPACTION_CUSTOM_V2: только установленные факты.' }
    await save(plugins, changed)
    await probe({ action: 'turn', sessionId, text: 'NEW_LONG_HISTORY: ' + 'Установленные решения игрока сохраняются. '.repeat(700) })
    turn = await probe({ action: 'turn', sessionId })
    assert.equal(count(turn), 1)
    assert.equal(turn.requests.find(item => item.purpose === 'compaction').messages.at(-1).content[0].text, changed.instructions)
    assert.deepEqual(summaries(turn)[0], first, 'New settings do not rewrite prior summaries')
    const fork = await probe({ action: 'fork', sessionId })
    const inherited = await probe({ action: 'inspect', sessionId: fork.sessionId })
    assert.deepEqual(summaries(inherited), summaries(turn))
    const before = summaries(turn).length
    await save({ ...plugins, compaction: false }, changed)
    turn = await probe({ action: 'turn', sessionId, text: 'Сохрани историю без сжатия. '.repeat(700) })
    assert.equal(count(turn), 0)
    assert.equal(summaries(turn).length, before)
    assert.ok(turn.requests.every(call => !call.tools?.some(tool => tool.name === 'compactHistory')), 'Disabling removes the model tool')
    await save(plugins, options)
    let manual = await probe({ action: 'preset-turn', workspaceId, preset: 'mayori', text: 'MANUAL_HISTORY: ' + 'У ворот герой договорился с Мартой о помощи. '.repeat(700) })
    const manualId = manual.sessionId
    assert.equal(count(manual), 0, 'Manual scenario is below automatic pressure')
    await save({ dice: true, rules: true, rollHistory: true, compaction: true }, options)
    manual = await probe({ action: 'turn', sessionId: manualId, text: 'REQUEST_COMPACTION_TOOL: сохрани текущее решение игрока.' })
    assert.equal(count(manual), 1)
    const toolResult = manual.events.find(event => event.type === 'tool/result' && event.data.message.content.some(block => block.text?.includes('"status":"compacted"')))
    assert.ok(toolResult, 'Native tool execution committed the summary and returned success')
    assert.deepEqual(manual.requests.find(call => call.purpose !== 'compaction').tools.map(tool => tool.name).sort(), ['compactHistory', 'getRollDetails', 'resolveCheck', 'rollDice'])
    const contextResponse = await request('/mayori/characters/trajectory-context', 'POST', { sessionId: manualId, selection: 'current' })
    assert.ok(!contextResponse.messages.some(item => ['mayori-preset', 'mayori-compaction-settings'].includes(item.message.source?.kind)), 'Request context omits empty metadata snapshots')
    console.log(JSON.stringify({ ok: true, sessionId, forkId: fork.sessionId, manualId, summaries: before }))
  }
} finally { await save(initial.plugins, initial.compaction) }
