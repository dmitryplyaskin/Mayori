/** In-place removal and regeneration against an isolated keyless DSH profile. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2])
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
const output = resolve(process.argv[3])
await mkdir(output, { recursive: true })
const rpc = async (endpoint, body) => {
  const response = await fetch(url.origin + endpoint, { method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(body) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}
const change = (endpoint, body) => rpc(`/mayori/characters/${endpoint}`, body)
const settle = sessionId => rpc('/_mayori-smoke', { action: 'settle', sessionId })
// The provider omits empty metadata messages; saved archives are not model input.
const content = messages => JSON.stringify(messages.filter(message => message.content.length).map(message => message.content))
const restore = process.argv.includes('--restore')
let fixture
if (restore) fixture = JSON.parse(await readFile(join(output, 'removals.json'), 'utf8'))
else {
  const campaign = await rpc('/_mayori-smoke', { action: 'create' })
  const data = { name: 'Removal Character', description: 'An archivist.', first_mes: 'REMOVAL_OPENING', alternate_greetings: [],
    personality: '', scenario: '', mes_example: '', creator_notes: '', system_prompt: '', post_history_instructions: '', tags: [] }
  await change('import', { files: [{ name: 'removal.json', type: 'application/json',
    base64: Buffer.from(JSON.stringify({ spec: 'chara_card_v2', spec_version: '2.0', data })).toString('base64') }] })
  const character = (await change('list', {})).cards.find(card => card.name === data.name)
  const chat = await change('start', { characterId: character.id, workspaceId: campaign.workspaceId })
  await rpc('/_mayori-smoke', { action: 'adopt', ...chat, workspaceId: campaign.workspaceId })
  const turn = await rpc('/_mayori-smoke', { action: 'turn', ...chat, text: 'REMOVAL_INPUT' })
  fixture = { sessionId: chat.sessionId, userSeq: turn.events.find(event => event.type === 'user/message' && event.data.source?.kind === 'user').seq,
    replySeq: turn.events.findLast(event => event.type === 'assistant/message').seq }
  await change('message-edit', { sessionId: fixture.sessionId, seq: fixture.replySeq, text: 'REMOVAL_REPLY' })
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
try {
  await page.goto(url.href)
  await page.getByRole('button', { name: 'История чатов', exact: true }).waitFor()
  try { await page.getByRole('button', { name: /^(?:Continue|Продолжить)$/ }).click({ timeout: 10000 }) } catch {}
  await open()
  if (!restore) {
    const before = await settle(fixture.sessionId)
    const row = page.locator('[data-turn-tail]').last()
    const remove = row.getByRole('button', { name: 'Удалить сообщение', exact: true })
    await remove.hover()
    const tooltip = page.getByRole('tooltip').filter({ hasText: 'Удалить сообщение' })
    await tooltip.waitFor()
    assert.equal(await tooltip.getAttribute('data-side'), 'bottom')
    assert.equal(await tooltip.getAttribute('data-portal'), null)
    await page.mouse.move(0, 0)
    await tooltip.waitFor({ state: 'detached' })
    await page.keyboard.press('Tab')
    await remove.focus()
    await tooltip.waitFor()
    await remove.click()
    const dialog = page.getByRole('dialog', { name: 'Удалить сообщение?', exact: true })
    await dialog.waitFor({ state: 'visible' })
    assert.deepEqual(await dialog.getByRole('button').allTextContents(), ['Отмена', 'Удалить'])
    assert.equal(await dialog.locator('p, blockquote, textarea').count(), 0)
    assert.equal(await dialog.getByRole('button', { name: 'Отмена', exact: true }).evaluate(node => node === document.activeElement), true)
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'hidden' })
    assert.equal(await remove.evaluate(node => node === document.activeElement), true)
    assert.deepEqual((await settle(fixture.sessionId)).events, before.events)
    for (const dark of [false, true]) {
      await page.evaluate(dark => document.body.toggleAttribute('data-ds-dark-theme', dark), dark)
      await page.setViewportSize({ width: 320, height: 900 })
      await remove.click()
      await dialog.waitFor({ state: 'visible' })
      assert.equal(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth + 1), true)
      await page.screenshot({ path: join(output, `delete-${dark ? 'dark' : 'light'}-320.png`) })
      await dialog.getByRole('button', { name: 'Отмена', exact: true }).click()
    }
    await page.setViewportSize({ width: 1280, height: 900 })
    await remove.click()
    await dialog.getByRole('button', { name: 'Удалить', exact: true }).click()
    await page.locator('.mayori-message-character').getByText('REMOVAL_REPLY', { exact: true }).waitFor({ state: 'hidden' })
    const removed = await settle(fixture.sessionId)
    assert.equal(removed.requestCount, before.requestCount)
    assert.deepEqual(removed.events.slice(0, before.events.length), before.events)
    assert.ok(!content(removed.messages).includes('REMOVAL_REPLY'))
    const process = page.locator('[data-chat-turn="2"][data-step-process], [data-chat-turn="2"][data-chat-flow-kind="assistant-step"], [data-chat-turn="2"][data-chat-flow-kind="tool-call"], [data-chat-turn="2"][data-chat-flow-kind="turn-process"]')
    await process.first().waitFor({ state: 'detached' })
    assert.equal(await process.count(), 0)
    assert.equal(await page.getByText('Think', { exact: true }).count(), 0)
    assert.ok(!content(removed.messages).includes('Use the real dice provider.'))
    assert.ok(!removed.messages.some(message => message.role === 'tool'))
    await page.locator('.mayori-message-user').getByText('REMOVAL_INPUT', { exact: true }).waitFor()
    await page.locator('.mayori-message-user').first().getByRole('button', { name: 'Удалить сообщение', exact: true }).click()
    await dialog.getByRole('button', { name: 'Удалить', exact: true }).click()
    await page.locator('.mayori-message-user').getByText('REMOVAL_INPUT', { exact: true }).waitFor({ state: 'hidden' })

    const next = await rpc('/_mayori-smoke', { action: 'turn', sessionId: fixture.sessionId, text: 'REPEAT_INPUT' })
    assert.ok(!content(next.requests[0].messages).includes('REMOVAL_REPLY'))
    assert.ok(!content(next.requests[0].messages).includes('REMOVAL_INPUT'))
    const reply = next.events.findLast(event => event.type === 'assistant/message')
    await change('message-edit', { sessionId: fixture.sessionId, seq: reply.seq, text: 'PREVIOUS_REPLY' })
    await page.reload(); await open()
    const active = await rpc('/_mayori-smoke', { action: 'active-sessions' })
    const beforeRepeat = await settle(fixture.sessionId)
    const repeat = page.locator('[data-turn-tail]').last().getByRole('button', { name: 'Повторить ответ', exact: true })
    assert.equal(await repeat.getAttribute('aria-haspopup'), null)
    const regeneration = page.waitForResponse(response => response.url().endsWith('/message-regenerate'))
    await repeat.click()
    assert.ok((await regeneration).ok())
    assert.equal(await page.getByRole('dialog').count(), 0)
    const repeated = await settle(fixture.sessionId)
    assert.deepEqual(await rpc('/_mayori-smoke', { action: 'active-sessions' }), active)
    assert.ok(repeated.requestCount > beforeRepeat.requestCount)
    assert.ok(!content(repeated.requests[beforeRepeat.requestCount].messages).includes('PREVIOUS_REPLY'))
    assert.equal(repeated.messages.filter(message => message.source?.kind === 'user').length, 1)
    assert.deepEqual(repeated.events.slice(0, beforeRepeat.events.length), beforeRepeat.events)
    await page.locator('.mayori-message-character').getByText('PREVIOUS_REPLY', { exact: true }).waitFor({ state: 'hidden' })
    const turns = repeated.events.filter(event => event.type === 'turn/start').map(event => event.data.turn)
    assert.equal(new Set(turns).size, turns.length)
    await writeFile(join(output, 'removals.json'), JSON.stringify(fixture, null, 2) + '\n')
  }
  await page.reload(); await open()
  for (const text of ['REMOVAL_INPUT', 'REMOVAL_REPLY', 'PREVIOUS_REPLY']) {
    assert.equal(await page.locator('.mayori-message').getByText(text, { exact: true }).count(), 0)
  }
  for (const turn of [2, 3]) {
    assert.equal(await page.locator(`[data-chat-turn="${turn}"][data-step-process], [data-chat-turn="${turn}"][data-chat-flow-kind="assistant-step"], [data-chat-turn="${turn}"][data-chat-flow-kind="tool-call"], [data-chat-turn="${turn}"][data-chat-flow-kind="turn-process"]`).count(), 0)
  }
  await page.locator('.mayori-message-user').getByText('REPEAT_INPUT', { exact: true }).waitFor()
  if (restore) {
    const next = await rpc('/_mayori-smoke', { action: 'turn', sessionId: fixture.sessionId, text: 'CONTINUE_RESTORED' })
    for (const text of ['REMOVAL_INPUT', 'REMOVAL_REPLY', 'PREVIOUS_REPLY']) assert.ok(!content(next.requests[0].messages).includes(text))
  }
  await page.screenshot({ path: join(output, restore ? 'removal-restored.png' : 'removal-complete.png') })
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, restore, fixture, output }))
} catch (error) {
  await page.screenshot({ path: join(output, 'removal-failure.png') })
  console.error(JSON.stringify({ errors, alerts: await page.getByRole('alert').allTextContents() }))
  throw error
} finally { await browser.close() }
