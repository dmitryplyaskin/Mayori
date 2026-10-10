/** Current-chat edits and native tooltips against an isolated keyless DSH profile. */
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
const rpc = async (path, payload) => {
  const response = await fetch(url.origin + path, { method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(payload) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}
const restore = process.argv.includes('--restore')
let fixture
if (restore) fixture = JSON.parse(await readFile(join(output, 'current-edits.json'), 'utf8'))
else {
  const campaign = await rpc('/_mayori-smoke', { action: 'create' })
  const data = { name: 'Current Edit Character', description: 'A patient archivist.', first_mes: 'Original editable opening.',
    personality: '', scenario: '', mes_example: '', creator_notes: '', system_prompt: '', post_history_instructions: '', alternate_greetings: [], tags: [] }
  await rpc('/mayori/characters/import', { files: [{ name: 'current-edit.json', type: 'application/json',
    base64: Buffer.from(JSON.stringify({ spec: 'chara_card_v2', spec_version: '2.0', data })).toString('base64') }] })
  const card = (await rpc('/mayori/characters/list', {})).cards.find(card => card.name === data.name)
  const chat = await rpc('/mayori/characters/start', { characterId: card.id, workspaceId: campaign.workspaceId })
  await rpc('/_mayori-smoke', { action: 'adopt', ...chat, workspaceId: campaign.workspaceId })
  const turn = await rpc('/_mayori-smoke', { action: 'turn', ...chat })
  fixture = { sessionId: chat.sessionId, workspaceId: campaign.workspaceId,
    replySeq: turn.events.findLast(event => event.type === 'assistant/message').seq,
    userSeq: turn.events.find(event => event.type === 'user/message' && event.data.source?.kind === 'user').seq,
    reply: 'CURRENT_EDIT_REPLY: The door remains shut.', user: 'CURRENT_EDIT_USER: I wait outside.',
    greeting: 'CURRENT_EDIT_OPENING: Welcome to the archive.' }
}

const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] })
const errors = []
page.on('pageerror', error => errors.push(error.message))
try {
  await page.goto(url.href)
  await page.getByRole('button', { name: 'История чатов', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 2000 }) } catch {}
  const open = async () => {
    await page.getByRole('button', { name: 'История чатов', exact: true }).click()
    await page.getByRole('searchbox', { name: 'Поиск по названию или ID чата' }).fill(fixture.sessionId)
    await page.locator('.mayori-history-row').first().click()
    await page.locator('.mayori-message-actions').first().waitFor()
  }
  await open()
  const checkCopy = async () => {
    for (const [row, text] of [[page.locator('[data-turn-tail]').last(), fixture.reply],
      [page.locator('.mayori-message-user').first(), fixture.user]]) {
      await row.getByRole('button', { name: /^(Copy|Копировать)$/ }).click()
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), text)
    }
  }
  const editor = page.getByRole('dialog', { name: 'Редактировать сообщение', exact: true })
  if (!restore) {
    const original = await rpc('/_mayori-smoke', { action: 'settle', sessionId: fixture.sessionId })
    const tail = page.locator('[data-turn-tail]').last()
    const tooltipStyle = async button => {
      await button.hover()
      const bubble = page.getByRole('tooltip')
      await bubble.waitFor()
      const style = await bubble.evaluate(node => {
        const style = getComputedStyle(node)
        return { side: node.dataset.side, portal: Boolean(node.dataset.portal), font: style.font,
          padding: style.padding, background: style.backgroundColor, radius: style.borderRadius, animation: style.animationDuration }
      })
      await page.mouse.move(0, 0)
      await bubble.waitFor({ state: 'detached' })
      return style
    }
    const stockStyle = await tooltipStyle(tail.getByRole('button', { name: /^(Copy|Копировать)$/ }))
    const edit = tail.getByRole('button', { name: 'Редактировать', exact: true })
    assert.deepEqual(await tooltipStyle(edit), stockStyle, 'Custom actions match the neighboring native tooltip')
    assert.equal(stockStyle.side, 'bottom')
    assert.equal(stockStyle.portal, false)
    await edit.hover()
    await page.getByRole('tooltip').filter({ hasText: 'Редактировать' }).waitFor()
    await page.mouse.move(0, 0)
    await page.keyboard.press('Tab')
    await edit.focus()
    await page.getByRole('tooltip').filter({ hasText: 'Редактировать' }).waitFor()
    await edit.click()
    await page.getByRole('tooltip').waitFor({ state: 'detached' })
    await editor.waitFor({ state: 'visible' })
    await editor.getByRole('button', { name: 'Сохранить в чате', exact: true }).waitFor()
    await editor.getByRole('button', { name: 'Создать ветку', exact: true }).waitFor()
    await editor.getByRole('textbox').fill(fixture.reply)
    await page.setViewportSize({ width: 320, height: 900 })
    assert.ok(await editor.evaluate(node => { const rect = node.getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth }))
    await page.screenshot({ path: join(output, 'current-editor-320.png') })
    await page.keyboard.press('Control+Enter')
    await editor.waitFor({ state: 'detached' })
    await page.locator('.mayori-message-character').getByText(fixture.reply, { exact: true }).waitFor()
    assert.equal(await page.locator('.mayori-revision-branches').count(), 0)
    const playerEdit = page.locator('.mayori-message-user').first().getByRole('button', { name: 'Редактировать', exact: true })
    await playerEdit.click()
    await editor.getByRole('textbox').fill(fixture.user)
    await editor.getByRole('button', { name: 'Сохранить в чате', exact: true }).click()
    await editor.waitFor({ state: 'detached' })
    await page.locator('.mayori-message-user').getByText(fixture.user, { exact: true }).waitFor()
    await checkCopy()
    const saved = await rpc('/_mayori-smoke', { action: 'settle', sessionId: fixture.sessionId })
    assert.equal(saved.requestCount, original.requestCount)
    assert.deepEqual(saved.events.slice(0, original.events.length), original.events)
    assert.equal(saved.events.filter(event => event.type === 'turn/start').length, original.events.filter(event => event.type === 'turn/start').length)
    assert.equal(saved.events.filter(event => event.type === 'user/message' && event.data.source?.kind === 'mayori-message-edit').length, 2)
    await page.reload()
    await open()
    await page.locator('.mayori-message-character').getByText(fixture.reply, { exact: true }).waitFor()
    await page.locator('.mayori-message-user').getByText(fixture.user, { exact: true }).waitFor()
    await rpc('/mayori/characters/message-edit', { sessionId: fixture.sessionId, seq: original.events.find(event => event.type === 'assistant/message').seq, text: fixture.greeting })
    await page.reload()
    await open()
    await page.locator('.mayori-message-character').getByText(fixture.greeting, { exact: true }).waitFor()
    await writeFile(join(output, 'current-edits.json'), JSON.stringify(fixture, null, 2) + '\n')
  } else {
    await page.locator('.mayori-message-character').getByText(fixture.reply, { exact: true }).waitFor()
    await page.locator('.mayori-message-user').getByText(fixture.user, { exact: true }).waitFor()
    await page.locator('.mayori-message-character').getByText(fixture.greeting, { exact: true }).waitFor()
    assert.equal((await rpc('/mayori/characters/message-inspect', { sessionId: fixture.sessionId, seq: fixture.replySeq })).text, fixture.reply)
    await checkCopy()
    const next = await rpc('/_mayori-smoke', { action: 'turn', sessionId: fixture.sessionId, text: 'Continue after the correction.' })
    const context = JSON.stringify(next.requests[0].messages)
    for (const text of [fixture.reply, fixture.user, fixture.greeting]) assert.ok(context.includes(text), text)
    assert.equal(new Set(next.events.filter(event => event.type === 'turn/start').map(event => event.data.turn)).size,
      next.events.filter(event => event.type === 'turn/start').length)
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.screenshot({ path: join(output, restore ? 'current-restored.png' : 'current-saved.png') })
  if (!restore) {
    const sidebar = page.locator('.mayori-navigation')
    if (await sidebar.getAttribute('data-collapsed') !== 'true') await sidebar.locator('.mayori-navigation-toggle').click()
    const home = sidebar.getByRole('button', { name: 'Главная', exact: true })
    const tip = page.getByRole('tooltip').filter({ hasText: 'Главная' })
    await home.hover()
    await page.waitForTimeout(100)
    assert.equal(await tip.count(), 0, 'Sidebar tooltips use the native hover delay')
    await tip.waitFor()
    assert.equal(await tip.getAttribute('data-side'), 'right')
    assert.equal(await tip.getAttribute('data-portal'), null)
    await page.mouse.move(0, 0)
    await tip.waitFor({ state: 'detached' })
    await page.keyboard.press('Tab')
    await home.focus()
    await tip.waitFor()
    await page.screenshot({ path: join(output, 'sidebar-tooltip.png') })
  }
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, restored: restore, fixture, output }))
} catch (error) {
  await page.screenshot({ path: join(output, 'current-failure.png') })
  console.error(JSON.stringify({ errors, alerts: await page.getByRole('alert').allTextContents() }))
  throw error
} finally { await browser.close() }
