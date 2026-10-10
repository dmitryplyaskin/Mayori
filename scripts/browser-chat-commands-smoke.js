/** Run only against an isolated DSH profile with dsh-smoke-probe. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2])
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
async function call(path, payload = {}) {
  const response = await fetch(url.origin + path, { method: 'POST',
    headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(payload) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}
const rpc = (endpoint, payload) => call(`/mayori/characters/${endpoint}`, payload)
const campaign = await call('/_mayori-smoke', { action: 'create' })
const name = `Chat commands ${Date.now()}`
const preset = await rpc('preset-save', { name: `${name} preset`, instructions: 'Write concisely.' })
const persona = await rpc('persona-save', { name: `${name} persona`, description: 'A traveller.' })
await rpc('import', { files: [{ name: 'chat-commands.json', type: 'application/json',
  base64: Buffer.from(JSON.stringify({ spec: 'chara_card_v2', spec_version: '2.0', data: {
    name, description: 'An archivist.', first_mes: 'Welcome, {{user}}.', alternate_greetings: [],
  } })).toString('base64') }] })
const character = (await rpc('list')).cards.find(card => card.name === name)
const { sessionId } = await rpc('start', { characterId: character.id, workspaceId: campaign.workspaceId })
await call('/_mayori-smoke', { action: 'adopt', sessionId, workspaceId: campaign.workspaceId })
const before = await call('/_mayori-smoke', { action: 'inspect', sessionId })
const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(url.href)
  await page.getByRole('button', { name: 'Главная', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 2000 }) } catch {}
  await page.getByRole('button', { name: 'Главная', exact: true }).click()
  await page.locator('.mayori-history-row').filter({ hasText: name }).first().click()
  const composer = page.locator('[contenteditable="true"]').first()
  await composer.waitFor()
  async function typeCommand(command) {
    await composer.focus()
    await composer.press('Control+A')
    await composer.press('Backspace')
    await composer.pressSequentially(`/${command}`, { delay: 20 })
  }
  async function open(command, placeholder) {
    await typeCommand(command)
    await composer.press('Enter')
    const search = page.getByPlaceholder(placeholder, { exact: true })
    try { await search.waitFor() } catch (error) {
      console.error(JSON.stringify({ command, viewport: page.viewportSize(), errors, body: await page.locator('body').innerText() }))
      throw error
    }
    await page.getByRole('option').first().waitFor()
    return search
  }
  let search = await open('preset', 'Поиск пресета…')
  await search.fill(preset.name)
  await search.press('Enter')
  await search.waitFor({ state: 'hidden' })
  assert.equal((await rpc('session-preset-state', { sessionId })).preset.id, preset.id)
  search = await open('preset', 'Поиск пресета…')
  assert.equal(await page.getByRole('option', { selected: true }).textContent(), preset.name)
  await search.press('Escape')
  await search.waitFor({ state: 'hidden' })
  assert.equal(await composer.evaluate(element => element === document.activeElement), true)
  search = await open('persona', 'Поиск персоны…')
  await search.fill(persona.name)
  await search.press('Tab')
  await search.waitFor({ state: 'hidden' })
  assert.equal((await rpc('session-state', { sessionId })).persona.id, persona.id)
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 })
    search = await open('persona', 'Поиск персоны…')
    assert.equal(await page.getByRole('option', { selected: true }).textContent(), persona.name)
    await search.fill('no such persona')
    await page.getByText('Персоны не найдены.', { exact: true }).waitFor()
    await search.press('Escape')
    await search.waitFor({ state: 'hidden' })
  }
  await open('persona', 'Поиск персоны…')
  await page.getByRole('option', { name: /Без персоны/ }).click()
  await page.getByPlaceholder('Поиск персоны…').waitFor({ state: 'hidden' })
  assert.equal((await rpc('session-state', { sessionId })).persona.name, 'Игрок')
  await open('preset', 'Поиск пресета…')
  await page.getByRole('option', { name: 'Без пресета', exact: true }).click()
  await page.getByPlaceholder('Поиск пресета…').waitFor({ state: 'hidden' })
  assert.equal((await rpc('session-preset-state', { sessionId })).preset, null)
  const after = await call('/_mayori-smoke', { action: 'inspect', sessionId })
  assert.equal(after.requestCount, before.requestCount, 'Commands must not start a model request')
  const defaults = await rpc('preset-list')
  const started = page.waitForResponse(response => new URL(response.url()).pathname === '/mayori/characters/start')
  await typeCommand('new')
  await composer.press('Enter')
  const newSessionId = (await (await started).json()).value.sessionId
  assert.notEqual(newSessionId, sessionId)
  await page.waitForResponse(response => new URL(response.url()).pathname === '/mayori/characters/session-state'
    && response.request().postDataJSON().sessionId === newSessionId)
  const newState = await rpc('session-state', { sessionId: newSessionId })
  assert.equal(newState.character.id, character.id)
  assert.equal(newState.greeting.index, 0)
  assert.equal((await rpc('session-preset-state', { sessionId: newSessionId })).preset?.id ?? null, defaults.defaultId)
  const newLog = await call('/_mayori-smoke', { action: 'inspect', sessionId: newSessionId })
  assert.equal(newLog.requestCount, before.requestCount)
  assert.deepEqual((await call('/_mayori-smoke', { action: 'inspect', sessionId })).events, after.events,
    'Creating a chat must preserve the source journal')
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, sessionId, newSessionId }))
} finally {
  await browser.close()
  await rpc('preset-remove', { id: preset.id })
  await rpc('persona-remove', { id: persona.id })
}
