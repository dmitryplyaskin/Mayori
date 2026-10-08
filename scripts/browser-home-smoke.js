/** Homepage/catalog regressions against an isolated Host with the smoke probe. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { chooseMenu } from './browser-select.js'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2])
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
const output = process.argv[3] ? resolve(process.argv[3]) : await mkdtemp(join(tmpdir(), 'mayori-home-browser-'))
await mkdir(output, { recursive: true })
const rpc = async (path, payload) => {
  const response = await fetch(url.origin + path, { method: 'POST',
    headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(payload) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}

// Confirm the isolated probe exists before creating fixtures.
const campaign = await rpc('/_mayori-smoke', { action: 'create' })
const files = Array.from({ length: 45 }, (_, index) => ({ name: `catalog-${index}.json`, type: 'application/json',
  base64: Buffer.from(JSON.stringify({ spec: 'chara_card_v2', spec_version: '2.0', data: {
    name: `Catalog ${String(index).padStart(2, '0')}`, description: 'Catalog regression',
    creator: index < 3 ? 'Small group' : 'Large group', tags: ['catalog'], first_mes: `Opening ${index}`,
    alternate_greetings: ['Alternative'], personality: '', scenario: '', mes_example: '', creator_notes: '',
    system_prompt: '', post_history_instructions: '',
  } })).toString('base64') }))
await rpc('/mayori/characters/import', { files })
const cards = (await rpc('/mayori/characters/list', {})).cards
const recent = [...cards].sort((a, b) => b.importedAt - a.importedAt || a.id.localeCompare(b.id)).slice(0, 5)
for (const card of cards.filter(card => card.name.startsWith('Catalog')).slice(0, 6)) {
  const session = await rpc('/mayori/characters/start', { characterId: card.id, workspaceId: campaign.workspaceId })
  await rpc('/_mayori-smoke', { action: 'adopt', ...session, workspaceId: campaign.workspaceId })
}

const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
try {
  const errors = []
  const retryPage = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  retryPage.on('pageerror', error => errors.push(error.message))
  let failCatalog = true
  await retryPage.route('**/mayori/characters/list', route => failCatalog
    ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Временный сбой загрузки галереи.' }) })
    : route.continue())
  await retryPage.goto(url.href)
  await retryPage.getByRole('button', { name: 'Персонажи', exact: true }).waitFor()
  try { await retryPage.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 2000 }) } catch {}
  await retryPage.getByRole('button', { name: 'Персонажи', exact: true }).click()
  const retry = retryPage.getByRole('button', { name: 'Повторить загрузку', exact: true })
  await retry.waitFor()
  failCatalog = false
  await retry.focus()
  await retryPage.keyboard.press('Enter')
  await retryPage.locator('.mayori-card').first().waitFor()
  assert.equal(await retryPage.getByRole('alert').filter({ hasText: 'Временный сбой загрузки галереи.' }).count(), 0)
  failCatalog = true
  await retryPage.reload()
  await retryPage.getByRole('button', { name: 'Персонажи', exact: true }).click()
  await retry.waitFor()
  await retryPage.getByRole('button', { name: 'Персоны', exact: true }).click()
  failCatalog = false
  await retryPage.getByRole('button', { name: 'Персонажи', exact: true }).click()
  await retryPage.locator('.mayori-card').first().waitFor()
  assert.equal(await retry.count(), 0, 'Remounting the gallery retries a failed initial load')
  await retryPage.close()
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(url.href)
  await page.getByRole('button', { name: 'Главная', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 2000 }) } catch {}
  await page.getByRole('button', { name: 'Главная', exact: true }).click()
  await page.getByRole('heading', { name: 'Добро пожаловать в Mayori' }).waitFor()
  await page.locator('.mayori-home-panel .mayori-history-row').nth(4).waitFor()
  assert.equal(await page.locator('.mayori-home-panel .mayori-history-row').count(), 5)
  assert.equal(await page.locator('.mayori-home-panel .mayori-card').count(), 5)
  assert.deepEqual(await page.locator('.mayori-home-panel .mayori-card h3').allTextContents(), recent.map(card => card.name))
  const brand = page.getByRole('button', { name: 'Mayori Engine', exact: true })
  assert.equal(await page.getByRole('button', { name: /new session/i }).count(), 0)
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('dialog').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  for (const section of ['Персонажи', 'История чатов', 'Персоны']) {
    await page.getByRole('button', { name: section, exact: true }).click()
    await brand.click()
    await page.getByRole('heading', { name: 'Добро пожаловать в Mayori' }).waitFor()
    assert.equal(await page.locator('[contenteditable="true"]').count(), 0)
  }
  await page.locator('.mayori-home-panel .mayori-history-row').first().click()
  await page.locator('.mayori-message-character').first().waitFor()
  await brand.focus()
  await page.keyboard.press('Enter')
  await page.getByRole('heading', { name: 'Добро пожаловать в Mayori' }).waitFor()
  assert.equal(await page.locator('[contenteditable="true"]').count(), 0)
  await page.getByRole('button', { name: 'Перейти в историю чатов' }).click()
  await page.locator('.mayori-history-preview').filter({ hasText: 'Opening' }).first().waitFor()
  assert.ok(await page.locator('.mayori-history-avatar').count() >= 6)
  await page.route('**/mayori/characters/history-details', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'offline' }) }))
  await page.getByRole('button', { name: 'Обновить', exact: true }).click()
  await page.locator('.mayori-history-preview').filter({ hasText: 'Не удалось загрузить данные чата.' }).first().waitFor()
  await page.unroute('**/mayori/characters/history-details')
  await page.getByRole('button', { name: 'Обновить', exact: true }).click()
  await page.locator('.mayori-history-preview').filter({ hasText: 'Opening' }).first().waitFor()
  const name = await page.locator('.mayori-history-text strong').first().textContent()
  assert.ok(name.startsWith('Catalog'))
  await page.getByRole('button', { name: 'Главная', exact: true }).click()
  await page.getByRole('button', { name: 'Перейти к персонажам' }).click()
  await page.getByLabel('Поиск', { exact: true }).fill('Catalog')
  await page.getByRole('status').filter({ hasText: 'Найдено 45' }).waitFor()
  assert.equal(await page.locator('.mayori-card').count(), 20)
  assert.equal(await page.getByText('Начало истории', { exact: true }).count(), 0)
  assert.equal(await page.getByText('Приветствие', { exact: true }).count(), 0)
  assert.equal(await page.getByRole('button', { name: 'Карточек в ряд', exact: true }).getAttribute('data-value'), '5')
  const geometry = await page.evaluate(() => {
    const grid = document.querySelector('.mayori-card-grid')
    return { columns: getComputedStyle(grid).gridTemplateColumns.split(' ').length,
      filterX: document.querySelector('.mayori-filter-panel').getBoundingClientRect().x,
      contentX: grid.getBoundingClientRect().x }
  })
  assert.equal(geometry.columns, 5)
  assert.ok(geometry.filterX > geometry.contentX)
  await page.getByRole('button', { name: 'Следующая страница' }).click()
  await page.getByRole('status').filter({ hasText: '21–40 из 45' }).waitFor()
  await page.getByRole('button', { name: 'Следующая страница' }).click()
  await page.getByRole('status').filter({ hasText: '41–45 из 45' }).waitFor()
  assert.equal(await page.locator('.mayori-card').count(), 5)
  await chooseMenu(page, 'Автор', 'Small group')
  await page.getByRole('status').filter({ hasText: '1–3 из 3' }).waitFor()
  assert.equal(await page.getByLabel('Страница', { exact: true }).inputValue(), '1')
  await page.getByRole('button', { name: 'Сбросить фильтры' }).click()
  await chooseMenu(page, 'Карточек в ряд', '7')
  await chooseMenu(page, 'На странице', '40')
  await page.getByRole('status').filter({ hasText: '1–40 из' }).waitFor()
  await page.reload()
  await page.getByRole('button', { name: 'Персонажи', exact: true }).click()
  assert.equal(await page.getByRole('button', { name: 'Карточек в ряд', exact: true }).getAttribute('data-value'), '7')
  assert.equal(await page.getByRole('button', { name: 'На странице', exact: true }).getAttribute('data-value'), '40')
  await chooseMenu(page, 'Карточек в ряд', '3')
  assert.equal(await page.locator('.mayori-card-grid').evaluate(grid => getComputedStyle(grid).gridTemplateColumns.split(' ').length), 3)
  await chooseMenu(page, 'Карточек в ряд', '5')
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => { if (theme === 'dark') document.body.setAttribute('data-ds-dark-theme', ''); else document.body.removeAttribute('data-ds-dark-theme') }, theme)
    for (const width of [1600, 1280, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.getByRole('button', { name: 'Главная', exact: true }).click()
      await page.getByText('Загружаем чаты…', { exact: true }).waitFor({ state: 'hidden' })
      await page.screenshot({ path: join(output, `home-${theme}-${width}.png`) })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      await page.getByRole('button', { name: 'Персонажи', exact: true }).click()
      await page.screenshot({ path: join(output, `catalog-${theme}-${width}.png`) })
      assert.equal(await page.locator('.mayori-gallery-main').evaluate(main => main.scrollWidth <= main.clientWidth + 1), true)
      assert.equal(await page.locator('.mayori-card-actions').evaluateAll(groups => groups.every(group => [...group.children].every(button => button.scrollWidth <= button.clientWidth + 1))), true, 'Card actions must not clip')
      if (width < 900) {
        await page.getByRole('button', { name: 'Фильтры', exact: true }).click()
        await page.getByLabel('Поиск', { exact: true }).fill('no matches')
        await page.getByRole('button', { name: 'Закрыть фильтры', exact: true }).last().click()
        await page.getByRole('heading', { name: 'Ничего не найдено' }).waitFor()
        await page.getByRole('button', { name: 'Фильтры', exact: true }).click()
        await page.getByRole('button', { name: 'Сбросить фильтры' }).click()
        await page.getByRole('button', { name: 'Закрыть фильтры', exact: true }).last().click()
      }
    }
  }
  await page.setViewportSize({ width: 1600, height: 1000 })
  await page.getByRole('button', { name: 'Главная', exact: true }).click()
  await page.locator('.mayori-home-panel .mayori-history-row').first().click()
  await page.locator('.mayori-message-character').first().waitFor()
  assert.equal(await page.locator('.mayori-home-panel').count(), 0)
  await page.getByRole('button', { name: 'Персонажи', exact: true }).click()
  await page.locator('.mayori-import-button input').first().setInputFiles({ name: 'empty-opening.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ spec: 'chara_card_v2', spec_version: '2.0', data: {
      name: 'Empty opening regression', first_mes: '', alternate_greetings: ['Alternative'], description: '',
      personality: '', scenario: '', mes_example: '', creator_notes: '', system_prompt: '', post_history_instructions: '', tags: [],
    } })) })
  await page.getByText('Импортировано: 1.', { exact: true }).waitFor()
  await page.getByLabel('Поиск', { exact: true }).fill('Empty opening regression')
  await page.locator('.mayori-card-edit').first().click()
  const info = page.getByRole('dialog')
  await chooseMenu(page, 'Начало истории', 'Альтернатива 1')
  await info.getByRole('button', { name: 'Играть', exact: true }).click()
  await page.locator('.mayori-message-character').filter({ hasText: 'Alternative' }).waitFor()
  assert.equal(await page.getByRole('button', { name: /new session/i }).count(), 0)
  await page.getByRole('button', { name: /collapse sidebar/i }).click()
  assert.equal(await page.getByRole('button', { name: /new session/i }).count(), 0)
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('dialog').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  await page.getByRole('button', { name: /open sidebar/i }).click()
  await brand.click()
  await page.getByRole('heading', { name: 'Добро пожаловать в Mayori' }).waitFor()
  assert.equal(await page.locator('[contenteditable="true"]').count(), 0, 'The empty Conversation shows the home, without a composer')
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, output, screenshots: 16 }))
} finally { await browser.close() }
