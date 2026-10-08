/** Native settings page QA against an isolated DSH profile. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2]), output = resolve(process.argv[3])
assert.ok(['localhost', '127.0.0.1'].includes(url.hostname))
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
const errors = []
let page
try {
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  page.setDefaultTimeout(15000)
  page.on('pageerror', error => errors.push(error.message))
  const openSettings = async () => {
    const previewNotice = page.getByRole('button', { name: 'Continue', exact: true })
    if (await previewNotice.isVisible()) await previewNotice.click()
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.getByRole('button', { name: /^(Settings|设置|Настройки)(\s|$)/ }).click()
      try { await page.getByRole('dialog').waitFor({ timeout: 2000 }); break } catch {}
    }
    await page.getByRole('dialog').getByRole('button', { name: 'Mayori', exact: true }).click()
  }
  await page.goto(url.href)
  await page.getByRole('button', { name: 'Главная', exact: true }).waitFor()
  // Wait for the stock shell's initial Remote/store hydration.
  await page.waitForTimeout(2000)
  await openSettings()
  const panel = page.locator('.mayori-settings')
  const dice = panel.getByRole('switch', { name: 'Кости', exact: true })
  await dice.waitFor()
  const initial = await dice.isChecked()
  await dice.focus(); await page.keyboard.press('Space')
  await page.waitForFunction(expected => document.querySelector('.mayori-plugin-row input').checked === expected
    && !document.querySelector('.mayori-plugin-row input').disabled, !initial)
  assert.equal(await dice.isChecked(), !initial)
  await page.reload()
  await page.waitForTimeout(2000)
  await openSettings()
  await dice.waitFor()
  assert.equal(await dice.isChecked(), !initial)
  await dice.click()
  await page.waitForFunction(expected => document.querySelector('.mayori-plugin-row input').checked === expected
    && !document.querySelector('.mayori-plugin-row input').disabled, initial)
  await page.route('**/mayori/plugins', async route => {
    if (route.request().method() === 'PUT') await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Не удалось сохранить настройки.' }) })
    else await route.continue()
  })
  await dice.click()
  await panel.getByRole('alert').waitFor()
  assert.equal(await dice.isChecked(), initial, 'Failed save retains the confirmed value')
  await page.unroute('**/mayori/plugins')
  await panel.getByRole('button', { name: 'Обновить настройки' }).click()
  await panel.getByRole('alert').waitFor({ state: 'hidden' })
  const threshold = panel.getByLabel('Порог заполнения контекста, %', { exact: true })
  const retain = panel.getByLabel('Оставлять последние сообщения, %', { exact: true })
  const instructions = panel.getByLabel('Инструкция сжатия', { exact: true })
  const originalThreshold = await threshold.inputValue(), originalInstruction = await instructions.inputValue()
  const originalRetain = await retain.inputValue()
  const custom = 'BROWSER_COMPACTION_CUSTOM: сохрани решения игрока и {{user}} буквально.'
  await threshold.fill('65'); await retain.fill('65')
  await panel.getByRole('button', { name: 'Сохранить настройки сжатия', exact: true }).click()
  await panel.getByRole('alert').filter({ hasText: 'Доля последних сообщений' }).waitFor()
  assert.equal(await retain.getAttribute('aria-invalid'), 'true')
  assert.equal(await retain.evaluate(node => node === document.activeElement), true)
  await retain.fill('10'); await instructions.fill(custom)
  await dice.click()
  await page.waitForFunction(() => !document.querySelector('.mayori-plugin-row input').disabled)
  assert.equal(await instructions.inputValue(), custom, 'Switch changes preserve the unsaved instruction')
  await dice.click()
  await page.waitForFunction(() => !document.querySelector('.mayori-plugin-row input').disabled)
  await page.route('**/mayori/plugins', async route => {
    if (route.request().method() === 'PUT') await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Не удалось сохранить настройки сжатия.' }) })
    else await route.continue()
  })
  await panel.getByRole('button', { name: 'Сохранить настройки сжатия', exact: true }).click()
  await panel.getByRole('alert').filter({ hasText: 'Не удалось сохранить настройки сжатия' }).waitFor()
  assert.equal(await instructions.inputValue(), custom)
  await page.unroute('**/mayori/plugins')
  await panel.getByRole('button', { name: 'Сохранить настройки сжатия', exact: true }).click()
  await page.waitForFunction(() => !document.querySelector('.mayori-plugin-row input').disabled)
  await page.reload(); await page.waitForTimeout(1000); await openSettings()
  await threshold.waitFor()
  assert.equal(await threshold.inputValue(), '65')
  assert.equal(await retain.inputValue(), '10')
  assert.equal(await instructions.inputValue(), custom)
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => { if (theme === 'dark') document.body.setAttribute('data-ds-dark-theme', '')
      else document.body.removeAttribute('data-ds-dark-theme') }, theme)
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await panel.scrollIntoViewIfNeeded()
      assert.ok(await panel.evaluate(node => node.scrollWidth <= node.clientWidth + 1), `Settings fit ${width}`)
      assert.equal(await panel.getByRole('switch').count(), 4)
      await page.screenshot({ path: resolve(output, `settings-${theme}-${width}.png`) })
      await instructions.scrollIntoViewIfNeeded()
      await page.screenshot({ path: resolve(output, `compaction-${theme}-${width}.png`) })
    }
  }
  await threshold.fill(originalThreshold); await retain.fill(originalRetain); await instructions.fill(originalInstruction)
  await panel.getByRole('button', { name: 'Сохранить настройки сжатия', exact: true }).click()
  await page.waitForFunction(() => !document.querySelector('.mayori-plugin-row input').disabled)
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, output }))
} catch (error) {
  if (page) await page.screenshot({ path: resolve(output, 'failure.png') })
  throw error
} finally { await browser.close() }
