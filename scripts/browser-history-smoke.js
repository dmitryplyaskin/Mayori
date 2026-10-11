/** Run against an isolated Mayori profile; creates and deletes only test chats. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2])
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
const output = process.argv[3]
if (output) await mkdir(output, { recursive: true })
async function rpc(endpoint, payload = {}) {
  const response = await fetch(new URL(`/mayori/characters/${endpoint}`, url), {
    method: 'POST', headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(payload),
  })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}
const prefix = `История ${Date.now()}`
const campaign = await rpc('prepare-campaign')
const probe = await fetch(new URL('/_storage-probe', url), { method: 'POST',
  headers: { 'content-type': 'application/json', origin: url.origin },
  body: JSON.stringify({ action: 'create', path: campaign.path, title: 'History smoke fixture' }),
}).then(response => response.json())
assert.ok(probe.created?.workspaceId, 'Run in a temporary profile with storage-isolation-probe')
const names = [`${prefix} Астра`, `${prefix} Яр`]
const ids = []
for (const name of names) {
  const imported = await rpc('import', { files: [{ name: 'history.json', type: 'application/json',
    base64: Buffer.from(JSON.stringify({ spec: 'chara_card_v2', spec_version: '2.0', data: {
      name, description: 'Test character.', first_mes: 'Привет.', alternate_greetings: [],
    } })).toString('base64') }] })
  const character = (await rpc('list', { search: name })).cards.find(card => card.name === name)
  assert.ok(character, JSON.stringify(imported))
  const { sessionId } = await rpc('start', { characterId: character.id, workspaceId: probe.created.workspaceId })
  const adopted = await fetch(new URL('/_storage-probe', url), { method: 'POST',
    headers: { 'content-type': 'application/json', origin: url.origin },
    body: JSON.stringify({ action: 'create', path: campaign.path, title: name, sessionId }),
  }).then(response => response.json())
  assert.equal(adopted.created?.sessionId, sessionId)
  ids.push(sessionId)
}
const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(url.href)
  await page.getByRole('button', { name: 'История чатов', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Configure later', exact: true }).click({ timeout: 10000 }) } catch {}
  await page.getByRole('button', { name: 'История чатов', exact: true }).click()
  const panel = page.locator('.mayori-history-panel')
  const rows = panel.locator('.mayori-history-item')
  await panel.getByRole('searchbox').fill(prefix)
  await rows.nth(1).waitFor()
  async function choose(label, value) {
    await page.getByRole('button', { name: label, exact: true }).click()
    await page.getByRole('menu').locator(`[data-mayori-option="${value}"]`).click()
  }
  await choose('Сортировка чатов', 'title-asc')
  assert.ok((await rows.first().innerText()).includes('Астра'))
  await choose('Сортировка чатов', 'title-desc')
  assert.ok((await rows.first().innerText()).includes('Яр'))
  await choose('Тип чатов', 'branches')
  await panel.getByText('Чаты не найдены. Измените фильтры или поиск.').waitFor()
  assert.equal(await rows.count(), 0)
  await choose('Тип чатов', 'all')
  await choose('Период активности', '7')
  await rows.nth(1).waitFor()
  const deleteButton = rows.filter({ hasText: 'Астра' }).getByRole('button', { name: /^Удалить чат/ })
  await deleteButton.click()
  const dialog = page.getByRole('dialog')
  await dialog.waitFor()
  assert.equal(await dialog.locator('button').count(), 2)
  assert.ok(await dialog.getByRole('button', { name: 'Отмена', exact: true }).evaluate(element => element === document.activeElement))
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  assert.equal(await rows.count(), 2)
  assert.ok(await deleteButton.evaluate(element => element === document.activeElement))
  await deleteButton.click()
  await dialog.getByRole('button', { name: 'Удалить', exact: true }).click()
  await dialog.waitFor({ state: 'hidden' })
  await panel.getByText('Чат удалён.', { exact: true }).waitFor()
  assert.equal(await rows.count(), 1)
  await choose('Статус чатов', 'all')
  assert.equal(await rows.count(), 1)
  await choose('Статус чатов', 'archived')
  await panel.getByText('Чаты не найдены. Измените фильтры или поиск.').waitFor()
  assert.equal(await rows.count(), 0)
  await choose('Статус чатов', 'all')
  await page.reload()
  await page.getByRole('button', { name: 'История чатов', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Configure later', exact: true }).click({ timeout: 10000 }) } catch {}
  await page.getByRole('button', { name: 'История чатов', exact: true }).click()
  await panel.getByRole('searchbox').fill(prefix)
  await rows.first().waitFor()
  assert.equal(await rows.count(), 1)
  assert.ok(!(await panel.innerText()).includes('Астра'))
  await panel.getByText('Загружаем сообщение…', { exact: true }).waitFor({ state: 'hidden' })
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    assert.ok(await panel.evaluate(element => element.scrollWidth <= element.clientWidth + 1), `history overflows at ${width}px`)
    if (output) await page.screenshot({ path: join(output, `history-${width}.png`), fullPage: true })
  }
  assert.deepEqual(errors, [])
  assert.ok((await rpc('history-deleted')).includes(ids[0]))
  console.log(JSON.stringify({ ok: true, filters: true, sorting: true, deletion: true, reload: true, focus: true, responsive: true, output }))
} finally { await browser.close() }
