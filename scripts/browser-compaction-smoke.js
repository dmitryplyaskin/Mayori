/** Read-only browser verification against the isolated keyless smoke Host. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { chooseMenu } from './browser-select.js'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2]), sessionId = process.argv[3], output = resolve(process.argv[4])
assert.ok(['localhost', '127.0.0.1'].includes(url.hostname))
const response = await fetch(url.origin + '/_mayori-smoke', { method: 'POST',
  headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' },
  body: JSON.stringify({ action: 'inspect', sessionId }), signal: AbortSignal.timeout(10000) })
const snapshot = await response.json()
assert.ok(response.ok && snapshot.ok, 'An isolated smoke probe is required')
assert.ok(snapshot.value.events.some(event => event.type === 'compaction/summary'))
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
let page
try {
  page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(url.href)
  await page.getByRole('button', { name: 'История чатов', exact: true }).waitFor()
  const preview = page.getByRole('button', { name: 'Continue', exact: true })
  if (await preview.isVisible()) await preview.click()
  await page.getByRole('button', { name: 'История чатов', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Поиск по названию или ID чата' }).fill(sessionId)
  await page.locator('.mayori-history-row').first().click()
  await page.getByText('Trajectory', { exact: true }).click()
  await page.getByRole('button', { name: 'Показывать', exact: true }).waitFor()
  await chooseMenu(page, 'Показывать', 'Контекст запроса')
  await chooseMenu(page, 'Запрос', 'Последний запрос')
  await page.getByText('Initial System Prompt', { exact: true }).first().click()
  await page.getByRole('tab', { name: 'Tools', exact: true }).click()
  for (const name of ['compactHistory', 'getRollDetails', 'resolveCheck', 'rollDice']) await page.getByText(name, { exact: true }).last().waitFor()
  assert.equal(await page.getByText('Настройки сжатия истории обновлены.', { exact: false }).count(), 0)
  assert.equal(await page.getByText('This configuration notice is not a player action.', { exact: false }).count(), 0)
  await page.screenshot({ path: resolve(output, 'context-tools.png') })
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, sessionId, output }))
} catch (error) {
  await page?.screenshot({ path: resolve(output, 'failure.png') }).catch(() => {})
  throw error
} finally { await browser.close() }
