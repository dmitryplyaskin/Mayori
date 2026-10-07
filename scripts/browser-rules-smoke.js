/** Inspect recorded checks in an isolated smoke Host; never generate new rolls. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { readCheckResult } from '../src/features/rules/shared/result.js'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2]), sessionId = process.argv[3], output = resolve(process.argv[4])
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
const response = await fetch(url.origin + '/_mayori-smoke', { method: 'POST',
  headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' },
  body: JSON.stringify({ action: 'inspect', sessionId }), signal: AbortSignal.timeout(10000) })
const snapshot = await response.json()
assert.ok(response.ok && snapshot.ok, 'An isolated smoke probe is required')
const checkEvent = snapshot.value.events.findLast(event => event.type === 'tool/result' && event.data.meta?.kind === 'mayori-check')
const recorded = readCheckResult(checkEvent.data.message.content, checkEvent.data.meta)
assert.ok(recorded)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, timeout: 15000, ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
let activePage
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  activePage = page
  page.setDefaultTimeout(15000)
  page.setDefaultNavigationTimeout(15000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(url.href)
  await page.getByRole('button', { name: 'История чатов', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 2000 }) } catch {}
  await page.getByRole('button', { name: 'История чатов', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Поиск по названию или ID чата' }).fill(sessionId)
  await page.locator('.mayori-history-row').first().click()
  const card = page.getByRole('region', { name: 'Игровая проверка', exact: true }).last()
  if (!await card.isVisible()) await page.locator('[data-turn-process-tool-calls]:not([data-turn-process-tool-calls="0"])').last().click()
  const toolsGroup = page.locator('[data-process-activity="tools"][aria-expanded="false"]')
  if (!await card.isVisible() && await toolsGroup.count()) await toolsGroup.last().click()
  await card.locator('.mayori-check-outcome').waitFor()
  const summary = card.locator('.mayori-check-summary')
  assert.equal(await summary.getAttribute('data-outcome'), recorded.check.outcome)
  assert.ok((await summary.innerText()).includes(`На d20: ${recorded.check.natural}`))
  assert.ok((await summary.innerText()).includes(`итог: ${recorded.check.total}`))
  const toggle = card.getByRole('button', { name: /Игровая проверка/ })
  const initial = await toggle.getAttribute('aria-expanded')
  await toggle.focus(); await page.keyboard.press('Enter')
  assert.notEqual(await toggle.getAttribute('aria-expanded'), initial)
  await page.keyboard.press('Space')
  assert.equal(await toggle.getAttribute('aria-expanded'), initial)
  if (initial === 'true') await toggle.click()
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => {
      if (theme === 'dark') document.body.setAttribute('data-ds-dark-theme', '')
      else document.body.removeAttribute('data-ds-dark-theme')
    }, theme)
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await card.scrollIntoViewIfNeeded()
      assert.ok(await card.evaluate(node => node.scrollWidth <= node.clientWidth + 1), `Check must fit at ${width}px`)
      assert.equal(await summary.isVisible(), true)
      await card.screenshot({ path: resolve(output, `check-${theme}-${width}.png`) })
    }
  }
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, sessionId, screenshots: 6, output }))
} catch (error) {
  console.error(error.message)
  if (activePage) await writeFile(resolve(output, 'failure-controls.html'), await activePage.getByText(/Completed in/).last().evaluate(node => node.parentElement.parentElement.outerHTML).catch(() => 'No completed step'))
  await activePage?.screenshot({ path: resolve(output, 'failure.png'), timeout: 5000 }).catch(() => {})
  throw error
} finally { await browser.close() }
