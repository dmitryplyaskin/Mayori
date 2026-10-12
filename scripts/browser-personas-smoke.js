/** Persona acceptance against a temporary DSH profile with dsh-smoke-probe. */
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
const output = process.argv[3] ? resolve(process.argv[3]) : await mkdtemp(join(tmpdir(), 'mayori-personas-browser-'))
await mkdir(output, { recursive: true })
async function call(path, payload = {}) {
  const response = await fetch(url.origin + path, { method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(payload) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}
const rpc = (endpoint, payload) => call(`/mayori/characters/${endpoint}`, payload)
const campaign = await call('/_mayori-smoke', { action: 'create' })
for (const persona of (await rpc('persona-list')).personas.filter(persona => persona.name.startsWith('Persona Smoke Alex'))) {
  await rpc('persona-remove', { id: persona.id })
}
await rpc('import', { files: [{ name: 'persona-smoke.json', type: 'application/json', base64: Buffer.from(JSON.stringify({
  spec: 'chara_card_v2', spec_version: '2.0', data: { name: 'Persona Test Archivist', description: 'A patient archivist.',
    first_mes: '{{char}} welcomes {{user}}. {{persona}}', alternate_greetings: [], tags: ['persona-smoke'] },
})).toString('base64') }] })
const card = (await rpc('list')).cards.find(card => card.name === 'Persona Test Archivist')
const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
let page
try {
  page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('dialog', dialog => dialog.dismiss())
  await page.goto(url.href)
  await page.getByRole('button', { name: 'Персоны', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 1500 }) } catch {}
  const openPersonas = () => page.getByRole('button', { name: 'Персоны', exact: true }).click()
  const status = text => page.getByRole('status').filter({ hasText: text }).waitFor()
  await openPersonas()
  await page.getByRole('button', { name: 'Создать персону', exact: true }).click()
  await page.getByLabel('Имя в чате', { exact: true }).fill('Persona Smoke Alex')
  await page.getByRole('textbox', { name: 'Описание', exact: true }).fill('Base {{user}}.')
  await page.getByRole('button', { name: 'Добавить блок', exact: true }).click()
  await page.getByLabel('Название блока', { exact: true }).fill('Outfit')
  await page.getByRole('textbox', { name: 'Текст блока', exact: true }).fill('Wears a cloak.')
  await page.getByRole('button', { name: 'Добавить группу', exact: true }).click()
  await page.getByLabel('Название группы', { exact: true }).fill('Scene')
  const group = page.locator('.mayori-persona-block').filter({ has: page.getByLabel('Название группы', { exact: true }) })
  await group.getByRole('button', { name: 'Добавить блок', exact: true }).click()
  await group.getByLabel('Название блока', { exact: true }).fill('Archive')
  await group.getByRole('textbox', { name: 'Текст блока', exact: true }).fill('Knows {{char}}.')
  await group.getByLabel('Включён', { exact: true }).first().uncheck()
  const above = group.getByRole('button', { name: 'Переместить выше', exact: true }).first()
  await above.hover()
  await page.getByRole('tooltip').filter({ hasText: 'Переместить выше' }).waitFor()
  await page.keyboard.press('Tab')
  await above.focus()
  await page.getByRole('tooltip').filter({ hasText: 'Переместить выше' }).waitFor()
  await above.click()
  await page.getByLabel('Другой вариант описания', { exact: true }).check()
  await page.getByRole('textbox', { name: 'Вариант для модели', exact: true }).fill('Variant {{user}}.')
  await page.getByText('Сборка описания', { exact: true }).click()
  await page.getByLabel('Использовать шаблон', { exact: true }).check()
  await page.getByRole('textbox', { name: 'Шаблон с {{PROMPT}}', exact: true }).fill('<player>{{PROMPT}}</player>')
  await page.getByRole('button', { name: 'Сохранить персону', exact: true }).click()
  await status('Персона сохранена.')
  const persona = (await rpc('persona-list')).personas.find(p => p.name === 'Persona Smoke Alex')
  assert.ok(persona)
  assert.equal(persona.blocks[0].type, 'group')
  assert.equal(persona.blocks[0].enabled, false)
  assert.equal(persona.description, 'Base {{user}}.')
  await page.getByRole('button', { name: 'Использовать по умолчанию', exact: true }).click()
  await status('Выбор для новых чатов сохранён.')
  assert.equal((await rpc('persona-list')).defaultId, persona.id)
  await page.getByLabel('Поиск персон', { exact: true }).fill('missing-no-match')
  assert.equal(await page.locator('.mayori-persona-row').count(), 0)
  await page.getByLabel('Поиск персон', { exact: true }).fill('alex')
  assert.equal(await page.locator('.mayori-persona-row').count(), 1)
  await chooseMenu(page, 'Сортировка персон', 'По длине описания')
  assert.equal(await page.locator('.mayori-personas-panel select').count(), 0)
  await page.getByRole('textbox', { name: 'Описание', exact: true }).fill('Unsaved draft')
  await page.getByRole('button', { name: 'Главная', exact: true }).click()
  await openPersonas()
  assert.equal(await page.getByRole('textbox', { name: 'Описание', exact: true }).inputValue(), 'Unsaved draft')
  await page.getByRole('button', { name: 'Отменить изменения', exact: true }).click()
  assert.equal(await page.getByRole('textbox', { name: 'Описание', exact: true }).inputValue(), 'Base {{user}}.')
  await page.getByRole('button', { name: 'Создать копию', exact: true }).click()
  await status('Копия создана.')
  assert.equal(await page.getByLabel('Имя в чате', { exact: true }).inputValue(), 'Persona Smoke Alex (копия)')
  assert.deepEqual((await rpc('persona-list')).personas.find(p => p.name.endsWith('(копия)')).blocks, persona.blocks)
  await page.locator('.mayori-persona-row').filter({ has: page.getByText('Persona Smoke Alex', { exact: true }) }).click()
  await page.getByText('Итоговое описание', { exact: true }).click()
  assert.equal(await page.locator('.mayori-persona-preview').textContent(), '<player>Variant {{user}}.\n\nWears a cloak.</player>')
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 })
    const bounds = await page.locator('.mayori-personas-panel').evaluate(element => ({ scroll: element.scrollWidth, width: element.clientWidth }))
    assert.ok(bounds.scroll <= bounds.width + 1, `Persona editor reflows at ${width}px`)
    await page.screenshot({ path: join(output, `personas-${width}.png`), fullPage: true })
  }
  await page.setViewportSize({ width: 1280, height: 1000 })
  const session = await rpc('start', { characterId: card.id, workspaceId: campaign.workspaceId })
  await call('/_mayori-smoke', { action: 'adopt', sessionId: session.sessionId, workspaceId: campaign.workspaceId })
  await page.getByRole('button', { name: 'История чатов', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Поиск по названию или ID чата' }).fill(session.sessionId)
  await page.locator('.mayori-history-row').first().click()
  await openPersonas()
  await page.getByText('В текущем чате:', { exact: false }).waitFor()
  await page.locator('.mayori-persona-row').filter({ has: page.getByText('Persona Smoke Alex', { exact: true }) }).click()
  const scene = page.locator('.mayori-persona-block').filter({ has: page.getByLabel('Название группы', { exact: true }) })
  await scene.getByLabel('Включён', { exact: true }).first().check()
  await scene.locator('.mayori-persona-activation').first().locator('summary').click()
  await scene.getByLabel('Включать по условиям', { exact: true }).first().check()
  await scene.getByRole('button', { name: 'Добавить текущий чат', exact: true }).first().click()
  await page.getByText('Привязки к персонажам', { exact: true }).click()
  await page.locator('.mayori-persona-section').filter({ has: page.getByText('Привязки к персонажам', { exact: true }) })
    .getByRole('button', { name: 'Добавить текущего персонажа', exact: true }).click()
  await page.getByRole('button', { name: 'Играть в этом чате', exact: true }).click()
  await status('Персона закреплена за текущим чатом.')
  const state = await rpc('session-state', { sessionId: session.sessionId })
  assert.equal(state.persona.promptSnapshot.description, '<player>Variant {{user}}.\n\nKnows {{char}}.\n\nWears a cloak.</player>')
  assert.match(state.greeting.text, /Knows Persona Test Archivist/)
  const turn = await call('/_mayori-smoke', { action: 'turn', sessionId: session.sessionId, text: 'Hello.' })
  const modelText = JSON.stringify(turn.requests[0].messages)
  const logText = JSON.stringify(turn.messages)
  for (const text of ['Variant Persona Smoke Alex.', 'Knows Persona Test Archivist.', 'Wears a cloak.']) {
    assert.ok(modelText.includes(text), `Model receives ${text}`)
    assert.ok(logText.includes(text), `Session log reconstructs ${text}`)
  }
  assert.ok(!modelText.includes('Base Persona Smoke Alex.'))
  const fork = await call('/_mayori-smoke', { action: 'fork', sessionId: session.sessionId })
  const forked = await rpc('session-state', { sessionId: fork.sessionId })
  assert.deepEqual(forked.persona.promptSnapshot, state.persona.promptSnapshot)
  await rpc('persona-save', { ...persona, description: 'Changed outside chat', blocks: [] })
  assert.deepEqual((await rpc('session-state', { sessionId: session.sessionId })).persona.promptSnapshot, state.persona.promptSnapshot)
  await page.reload()
  await openPersonas()
  assert.ok((await rpc('persona-list')).personas.some(p => p.id === persona.id))
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, output, sessionId: session.sessionId, forkId: fork.sessionId, modelLog: true }))
} catch (error) {
  if (page) await page.screenshot({ path: join(output, 'personas-failure.png'), fullPage: true }).catch(() => {})
  throw error
} finally { await browser.close() }
