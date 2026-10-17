/** Locale acceptance on an isolated local profile; never calls a model. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { chooseMenu } from './browser-select.js'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2])
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'Use an isolated local test profile')
const output = process.argv[3] ? resolve(process.argv[3]) : await mkdtemp(join(tmpdir(), 'mayori-locale-browser-'))
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
let page
try {
  page = await browser.newPage({ locale: 'en-US', viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addLocatorHandler(page.getByRole('button', { name: /^(Configure later|Настроить позже)$/ }), async button => { await button.click() })
  await page.goto(url.href)
  await page.getByRole('button', { name: 'Mayori settings', exact: true }).waitFor()
  try { await page.getByRole('button', { name: /^(?:Continue|Продолжить)$/ }).click({ timeout: 10000 }) } catch {}
  try { await page.getByRole('button', { name: 'Configure later', exact: true }).click({ timeout: 5000 }) } catch {}

  const switchLanguage = async (from, to) => {
    await page.getByRole('button', { name: from === 'en' ? 'Mayori settings' : 'Настройки Mayori', exact: true }).click()
    await chooseMenu(page, from === 'en' ? 'Language' : 'Язык', to === 'en' ? 'English' : 'Русский')
    await page.getByRole('button', { name: to === 'en' ? 'Close Mayori settings' : 'Закрыть настройки Mayori', exact: true }).click()
    assert.equal(await page.locator('html').getAttribute('lang'), to)
  }
  const screenshot = async name => {
    const modal = page.locator('.mayori-settings-modal')
    if (await modal.isVisible()) await modal.evaluate(element => Promise.all(element.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))))
    await page.screenshot({ path: join(output, name) })
  }
  await page.getByRole('heading', { name: 'Welcome to Mayori' }).waitFor()
  await switchLanguage('en', 'ru')
  await page.getByRole('heading', { name: 'Добро пожаловать в Mayori' }).waitFor()
  await page.reload()
  await page.getByRole('heading', { name: 'Добро пожаловать в Mayori' }).waitFor()

  for (const [language, panels] of [
    ['ru', ['Персонажи', 'История чатов', 'Персоны', 'Пресеты']],
    ['en', ['Characters', 'Chat history', 'Personas', 'Presets']],
  ]) {
    if (language === 'en') await switchLanguage('ru', 'en')
    for (const title of panels) {
      await page.getByRole('button', { name: title, exact: true }).click()
      await page.getByRole('heading', { name: title, exact: true }).waitFor()
    }
    await page.getByRole('button', { name: language === 'en' ? 'Mayori settings' : 'Настройки Mayori', exact: true }).click()
    await page.getByRole('tab', { name: language === 'en' ? 'Plugins' : 'Плагины', exact: true }).click()
    await page.getByText(language === 'en' ? 'Dice and checks' : 'Кости и проверки', { exact: true }).waitFor()
    await screenshot(`${language}-settings.png`)
    await page.getByRole('button', { name: language === 'en' ? 'Close Mayori settings' : 'Закрыть настройки Mayori', exact: true }).click()
  }

  // Server validation copy translates at presentation, leaving the recorded error intact.
  await page.route('**/mayori/characters/list', route => route.fulfill({ status: 503, contentType: 'application/json',
    body: JSON.stringify({ ok: false, error: 'Файл карточки содержит некорректные данные.' }) }))
  await page.reload()
  await page.getByRole('button', { name: 'Characters', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'The card file contains invalid data.' }).waitFor()
  await switchLanguage('en', 'ru')
  await page.getByRole('alert').filter({ hasText: 'Файл карточки содержит некорректные данные.' }).waitFor()
  await page.unroute('**/mayori/characters/list')

  await page.getByRole('button', { name: 'Повторить загрузку', exact: true }).click()
  await page.getByRole('button', { name: 'Mayori Engine', exact: true }).click()
  const rpc = async (endpoint, payload) => {
    const response = await page.request.post(new URL(`/mayori/characters/${endpoint}`, url).href, {
      headers: { origin: url.origin, 'sec-fetch-site': 'same-origin' }, data: payload,
    })
    const result = await response.json()
    assert.ok(response.ok() && result.ok, JSON.stringify(result))
    return result.value
  }
  const card = { spec: 'chara_card_v2', spec_version: '2.0', data: {
    name: 'Астер — Aster', description: 'История чатов — authored description', first_mes: 'Пресеты — authored greeting',
    personality: '', scenario: '', mes_example: '', creator_notes: '', system_prompt: '', post_history_instructions: '',
    alternate_greetings: ['Другой вариант'], tags: [],
  } }
  await rpc('import', { files: [{ name: 'locale.json', type: 'application/json', base64: Buffer.from(JSON.stringify(card)).toString('base64') }] })
  await page.reload()
  await page.getByRole('button', { name: 'Персонажи', exact: true }).click()
  await page.getByRole('button', { name: 'Играть', exact: true }).click()
  await page.getByText('Пресеты — authored greeting', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Редактировать', exact: true }).waitFor()
  await switchLanguage('ru', 'en')
  await page.getByRole('button', { name: 'Edit', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Send message', exact: true }).waitFor()
  await page.getByText('Пресеты — authored greeting', { exact: true }).waitFor()
  const composer = page.locator('[contenteditable="true"]').first()
  await composer.fill('/preset')
  await page.getByText('Change preset', { exact: true }).waitFor()
  await page.keyboard.press('Escape')
  await composer.fill('')
  await page.screenshot({ path: join(output, 'en-chat.png') })
  await page.getByRole('button', { name: 'Edit', exact: true }).click()
  await page.getByRole('heading', { name: 'Edit message', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await page.getByRole('button', { name: 'Delete message', exact: true }).click()
  await page.getByRole('heading', { name: 'Delete message?', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await switchLanguage('en', 'ru')
  await page.getByRole('button', { name: 'Отправить сообщение', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Выбрать модель', exact: true }).waitFor()
  await page.getByRole('tab', { name: 'Контекст', exact: true }).click()
  await page.getByRole('button', { name: 'Показывать', exact: true }).waitFor()
  await chooseMenu(page, 'Показывать', 'Полный журнал')
  await page.getByRole('searchbox', { name: 'Поиск в журнале', exact: true }).waitFor()
  await page.getByRole('tab', { name: 'Чат', exact: true }).click()
  await page.screenshot({ path: join(output, 'ru-chat.png') })

  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await page.getByRole('button', { name: 'Настройки Mayori', exact: true }).click()
    await page.getByRole('tab', { name: 'Основные', exact: true }).click()
    const overflow = await page.locator('.mayori-settings-modal').evaluate(element => element.scrollWidth > element.clientWidth + 1)
    assert.equal(overflow, false, `Settings overflow at ${width}px`)
    await screenshot(`ru-${width}.png`)
    await page.getByRole('button', { name: 'Закрыть настройки Mayori', exact: true }).click()
  }
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, languages: ['ru', 'en'], reload: true, panels: 4, chat: true, narrow: [390, 320], screenshots: output }))
} catch (error) {
  if (page) {
    await page.screenshot({ path: join(output, 'failure.png') }).catch(() => {})
    console.error('Visible dialogs:', await page.getByRole('dialog').allTextContents())
  }
  throw error
} finally { await browser.close() }
