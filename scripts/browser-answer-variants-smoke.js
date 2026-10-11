/** Saved answer cycling in an isolated keyless DSH profile, including cold replay. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const { chromium } = createRequire(import.meta.url)(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2])
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
const output = resolve(process.argv[3])
await mkdir(output, { recursive: true })
const restore = process.argv.includes('--restore')
const rpc = async (endpoint, body) => {
  const response = await fetch(url.origin + endpoint, { method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(body) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}
const change = (endpoint, body) => rpc(`/mayori/characters/${endpoint}`, body)
const settle = sessionId => rpc('/_mayori-smoke', { action: 'settle', sessionId })
const content = messages => JSON.stringify(messages.filter(message => message.content.length).map(message => message.content))
let fixture
if (restore) fixture = JSON.parse(await readFile(join(output, 'variants.json'), 'utf8'))
else {
  const campaign = await rpc('/_mayori-smoke', { action: 'create' })
  const data = { name: 'Variant Character', description: 'An archivist.', first_mes: 'VARIANT_OPENING', alternate_greetings: [],
    personality: '', scenario: '', mes_example: '', creator_notes: '', system_prompt: '', post_history_instructions: '', tags: [] }
  await change('import', { files: [{ name: 'variants.json', type: 'application/json',
    base64: Buffer.from(JSON.stringify({ spec: 'chara_card_v2', spec_version: '2.0', data })).toString('base64') }] })
  const character = (await change('list', {})).cards.find(card => card.name === data.name)
  const chat = await change('start', { characterId: character.id, workspaceId: campaign.workspaceId })
  await rpc('/_mayori-smoke', { action: 'adopt', ...chat, workspaceId: campaign.workspaceId })
  const turn = await rpc('/_mayori-smoke', { action: 'turn', ...chat, text: 'VARIANT_INPUT' })
  const replySeq = turn.events.findLast(event => event.type === 'assistant/message').seq
  fixture = { sessionId: chat.sessionId, replySeq,
    rolls: turn.events.filter(event => event.type === 'tool/result').map(event => event.data.message.toolCallId) }
  await change('message-edit', { sessionId: chat.sessionId, seq: replySeq, text: 'VARIANT_A' })
}

const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text().split('\n')[0]) })
const open = async () => {
  await page.getByRole('button', { name: 'История чатов', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Поиск по названию или ID чата' }).fill(fixture.sessionId)
  await page.locator('.mayori-history-row').first().click()
  await page.locator('.mayori-message-actions').first().waitFor()
}
const choice = page.locator(`[data-answer-variant-group="${fixture.replySeq}"]`)
const visibleText = text => page.locator('.mayori-message-character').getByText(text, { exact: true })
const choose = async (direction, text, index) => {
  const before = await settle(fixture.sessionId)
  const label = `${direction < 0 ? 'Предыдущий' : 'Следующий'} вариант ответа`
  const response = page.waitForResponse(response => response.url().endsWith('/message-variant'))
  await choice.getByRole('button', { name: label, exact: true }).click()
  assert.ok((await response).ok())
  await visibleText(text).waitFor()
  await choice.getByRole('status').getByText(`${index} / ${restore ? 3 : fixture.count}`, { exact: true }).waitFor()
  await page.waitForFunction(label => document.activeElement?.getAttribute('aria-label') === label, label)
  assert.equal((await settle(fixture.sessionId)).requestCount, before.requestCount)
  assert.equal(await page.getByRole('dialog').count(), 0)
}
const repeat = async text => {
  const response = page.waitForResponse(response => response.url().endsWith('/message-regenerate'))
  await page.locator('[data-turn-tail]').filter({ has: page.getByRole('button', { name: 'Повторить ответ', exact: true }) }).first()
    .getByRole('button', { name: 'Повторить ответ', exact: true }).click()
  assert.ok((await response).ok())
  assert.equal(await page.getByRole('dialog').count(), 0)
  const turn = await settle(fixture.sessionId)
  const seq = turn.events.findLast(event => event.type === 'assistant/message').seq
  await change('message-edit', { sessionId: fixture.sessionId, seq, text })
  await page.reload(); await open()
  await visibleText(text).waitFor()
  return turn
}
try {
  await page.goto(url.href)
  await page.getByRole('button', { name: 'История чатов', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 1500 }) } catch {}
  await open()
  const sessions = await rpc('/_mayori-smoke', { action: 'active-sessions' })
  if (!restore) {
    const original = await settle(fixture.sessionId)
    fixture.count = 2
    const repeated = await repeat('VARIANT_B')
    assert.ok(repeated.requestCount > original.requestCount)
    await choice.getByRole('status').getByText('2 / 2', { exact: true }).waitFor()
    const previous = choice.getByRole('button', { name: 'Предыдущий вариант ответа', exact: true })
    await previous.hover()
    const tooltip = page.getByRole('tooltip').filter({ hasText: 'Предыдущий вариант ответа' })
    await tooltip.waitFor()
    assert.equal(await tooltip.getAttribute('data-side'), 'bottom')
    assert.equal(await tooltip.getAttribute('data-portal'), null)
    await page.mouse.move(0, 0)
    await page.keyboard.press('Tab'); await previous.focus(); await tooltip.waitFor()
    await choose(-1, 'VARIANT_A', 1)
    const selected = await settle(fixture.sessionId)
    assert.match(content(selected.messages), /VARIANT_A/)
    assert.doesNotMatch(content(selected.messages), /VARIANT_B/)
    for (const id of fixture.rolls) assert.ok(content(selected.messages).includes(id))
    assert.ok(await page.locator('[data-chat-turn="2"][data-step-process]').count())
    assert.equal(await page.locator('[data-chat-turn="3"][data-step-process]').count(), 0)
    const continued = await rpc('/_mayori-smoke', { action: 'turn', sessionId: fixture.sessionId, text: 'A_CONTINUATION' })
    assert.match(content(continued.requests[0].messages), /VARIANT_A/)
    assert.doesNotMatch(content(continued.requests[0].messages), /VARIANT_B/)
    await change('message-edit', { sessionId: fixture.sessionId, seq: continued.events.findLast(event => event.type === 'assistant/message').seq, text: 'A_LATER' })
    await page.reload(); await open()
    await choose(1, 'VARIANT_B', 2)
    assert.equal(await page.locator('.mayori-message-user').getByText('A_CONTINUATION', { exact: true }).count(), 0)
    await choose(-1, 'VARIANT_A', 1)
    await visibleText('A_LATER').waitFor()
    await change('message-edit', { sessionId: fixture.sessionId, seq: fixture.replySeq, text: 'A_EDITED' })
    await page.reload(); await open()
    fixture.count = 3
    await repeat('VARIANT_C')
    await choice.getByRole('status').getByText('3 / 3', { exact: true }).waitFor()
    await choose(1, 'A_EDITED', 1)
    await visibleText('A_LATER').waitFor()
    await choose(1, 'VARIANT_B', 2)
    await choose(1, 'VARIANT_C', 3)
    for (const dark of [false, true]) {
      await page.evaluate(dark => document.body.toggleAttribute('data-ds-dark-theme', dark), dark)
      await page.setViewportSize({ width: 320, height: 900 })
      assert.ok(await choice.evaluate(node => node.scrollWidth <= node.clientWidth + 1))
      await page.screenshot({ path: join(output, `variants-${dark ? 'dark' : 'light'}-320.png`) })
    }
    await page.setViewportSize({ width: 1280, height: 900 })
    assert.deepEqual((await settle(fixture.sessionId)).events.slice(0, original.events.length), original.events)
    await writeFile(join(output, 'variants.json'), JSON.stringify(fixture, null, 2) + '\n')
  } else {
    await visibleText('VARIANT_C').waitFor()
    await choose(1, 'A_EDITED', 1)
    await visibleText('A_LATER').waitFor()
    await choose(1, 'VARIANT_B', 2)
    await choose(1, 'VARIANT_C', 3)
  }
  assert.deepEqual(await rpc('/_mayori-smoke', { action: 'active-sessions' }), sessions)
  await page.reload(); await open()
  await visibleText('VARIANT_C').waitFor()
  await choice.getByRole('status').getByText('3 / 3', { exact: true }).waitFor()
  await page.screenshot({ path: join(output, restore ? 'variants-restored.png' : 'variants-complete.png') })
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, restore, fixture, output }))
} catch (error) {
  await page.screenshot({ path: join(output, 'variants-failure.png') })
  console.error(JSON.stringify({ errors, alerts: await page.getByRole('alert').allTextContents() }))
  throw error
} finally { await browser.close() }
