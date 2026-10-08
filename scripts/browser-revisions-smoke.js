/** Editing/regeneration against an isolated real DSH Host with the keyless probe. */
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
const rpc = async (endpoint, payload) => {
  const response = await fetch(url.origin + endpoint, { method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { 'content-type': 'application/json', origin: url.origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(payload) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}

let fixture
if (process.argv[4] === '--restore') fixture = JSON.parse(await readFile(join(output, 'fixture.json'), 'utf8'))
else {
  // Probe admission happens before any player-like data is created.
  const campaign = await rpc('/_mayori-smoke', { action: 'create' })
  const persona = await rpc('/mayori/characters/persona-save', { name: 'Revision Player', description: 'A careful traveller.' })
  await rpc('/mayori/characters/persona-default', { id: persona.id })
  const card = { spec: 'chara_card_v2', spec_version: '2.0', data: { name: 'Revision Character',
    description: '{{char}} guards the archive for {{user}}.', first_mes: 'The archive is open.', personality: '', scenario: '',
    mes_example: '', creator_notes: '', system_prompt: '', post_history_instructions: '', alternate_greetings: [], tags: [] } }
  await rpc('/mayori/characters/import', { files: [{ name: 'revision.json', type: 'application/json', base64: Buffer.from(JSON.stringify(card)).toString('base64') }] })
  const selected = (await rpc('/mayori/characters/list', {})).cards.find(card => card.name === 'Revision Character')
  const created = await rpc('/mayori/characters/start', { characterId: selected.id, workspaceId: campaign.workspaceId })
  await rpc('/_mayori-smoke', { action: 'adopt', ...created, workspaceId: campaign.workspaceId })
  await rpc('/_mayori-smoke', { action: 'turn', ...created })
  fixture = { source: created.sessionId }
}

const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
let page
try {
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(url.href)
  await page.getByRole('button', { name: 'История чатов', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 2000 }) } catch {}
  const openChat = async id => {
    await page.getByRole('button', { name: 'История чатов', exact: true }).click()
    await page.getByRole('searchbox', { name: 'Поиск по названию или ID чата' }).fill(id)
    await page.locator('.mayori-history-row').first().click()
    await page.locator('.mayori-message-actions').first().waitFor()
  }
  const branch = async from => {
    const picker = page.getByRole('combobox', { name: 'Ветка чата' })
    await picker.waitFor()
    await page.waitForFunction(from => document.querySelector('.mayori-revision-branches select')?.value !== from, from)
    return picker.inputValue()
  }
  const choose = async id => {
    await page.getByRole('combobox', { name: 'Ветка чата' }).selectOption(id)
    await page.waitForFunction(id => document.querySelector('.mayori-revision-branches select')?.value === id, id)
  }
  const settle = id => rpc('/_mayori-smoke', { action: 'settle', sessionId: id })
  const editor = page.getByRole('dialog', { name: 'Редактировать сообщение', exact: true })
  await openChat(fixture.source)
  if (process.argv[4] === '--restore') {
    await choose(fixture.manual)
    assert.ok((await settle(fixture.manual)).messages.some(message => message.content.some(block => block.text === 'The archive door remains shut.')))
    await choose(fixture.player)
    assert.ok((await settle(fixture.player)).messages.some(message => message.source?.kind === 'user' && message.content.some(block => block.text === 'I walk away from the archive.')))
    await choose(fixture.regenerated)
    assert.ok((await settle(fixture.regenerated)).events.some(event => event.type === 'tool/result'))
    await choose(fixture.greeting)
    assert.ok((await settle(fixture.greeting)).messages.some(message => message.content.some(block => block.text === 'My edited opening.')))
    assert.equal(await page.getByRole('button', { name: 'Повторить ответ', exact: true }).count(), 0)
    const openingTurn = await rpc('/_mayori-smoke', { action: 'turn', sessionId: fixture.greeting })
    assert.ok(openingTurn.requests.some(request => request.messages.some(message => message.role === 'assistant'
      && message.content.some(block => block.text === 'My edited opening.'))))
    const continuation = await rpc('/_mayori-smoke', { action: 'turn', sessionId: fixture.manual })
    assert.ok(continuation.requests.some(request => request.messages.some(message => message.content.some(block => block.text === 'The archive door remains shut.'))))
    const turns = continuation.events.filter(event => event.type === 'turn/start').map(event => event.data.turn)
    assert.equal(new Set(turns).size, turns.length, 'Resumed Agent must continue with a fresh turn number')
    await page.reload()
    await openChat(fixture.manual)
    await page.getByRole('combobox', { name: 'Ветка чата' }).waitFor()
    await page.screenshot({ path: join(output, 'restored.png') })
  } else {
    const original = await settle(fixture.source)
    const reply = page.locator('[data-turn-tail]').filter({ has: page.locator('.mayori-message-actions') }).last()
    const edit = reply.getByRole('button', { name: 'Редактировать', exact: true })
    assert.equal(await edit.evaluate(node => node.closest('[data-clock]')?.dataset.clock), 'end')
    assert.equal(await edit.textContent(), '')
    assert.equal(await edit.getAttribute('title'), 'Редактировать')
    assert.equal(await edit.locator('svg[aria-hidden=true]').count(), 1)
    await edit.click(); await editor.waitFor({ state: 'visible' })
    await editor.getByRole('textbox', { name: 'Реплика персонажа' }).fill(' ')
    await editor.getByRole('button', { name: 'Сохранить', exact: true }).click()
    await editor.getByRole('alert').getByText('Введите текст сообщения.').waitFor()
    await page.keyboard.press('Escape')
    await editor.waitFor({ state: 'detached' })
    await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Редактировать')
    assert.equal(await edit.evaluate(node => node === document.activeElement), true)
    assert.equal((await settle(fixture.source)).requestCount, original.requestCount)

    await edit.click(); await editor.waitFor({ state: 'visible' })
    await editor.getByRole('textbox', { name: 'Реплика персонажа' }).fill('The archive door remains shut.')
    await page.setViewportSize({ width: 390, height: 900 })
    assert.ok(await editor.evaluate(node => { const bounds = node.getBoundingClientRect(); return bounds.left >= 0 && bounds.right <= innerWidth && bounds.bottom <= innerHeight }))
    await page.screenshot({ path: join(output, 'editor-390.png') })
    await page.evaluate(() => { document.body.setAttribute('data-ds-dark-theme', '') })
    await page.setViewportSize({ width: 320, height: 900 })
    assert.ok(await editor.evaluate(node => { const bounds = node.getBoundingClientRect(); return bounds.left >= 0 && bounds.right <= innerWidth && bounds.bottom <= innerHeight }))
    await page.screenshot({ path: join(output, 'editor-dark-320.png') })
    await page.keyboard.press('Control+Enter')
    fixture.manual = await branch(fixture.source)
    const manual = await settle(fixture.manual)
    assert.equal(manual.requestCount, original.requestCount, 'Manual editing must not call the model')
    assert.equal(manual.messages.at(-1).source.provider, 'mayori-authored-message')
    assert.equal(manual.messages.at(-1).content.at(-1).text, 'The archive door remains shut.')
    assert.equal((await rpc('/mayori/characters/session-state', { sessionId: fixture.manual })).persona.name, 'Revision Player')
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.screenshot({ path: join(output, 'manual-1280.png') })
    for (const dark of [false, true]) {
      await page.evaluate(dark => { document.body.toggleAttribute('data-ds-dark-theme', dark) }, dark)
      for (const width of [1280, 390, 320]) {
        await page.setViewportSize({ width, height: 900 })
        const toolbar = page.locator('[data-turn-tail]').last().locator('[data-clock=end]')
        await toolbar.scrollIntoViewIfNeeded()
        await toolbar.hover()
        const buttons = toolbar.getByRole('button')
        const geometry = await buttons.evaluateAll(nodes => nodes.map(node => {
          const bounds = node.getBoundingClientRect()
          return { label: node.getAttribute('aria-label'), left: bounds.left, right: bounds.right,
            width: bounds.width, height: bounds.height, viewport: innerWidth }
        }))
        assert.ok(geometry.length >= 4, 'Copy, branch and revision icons share one native toolbar')
        for (const button of geometry) assert.ok(button.left >= 0 && button.right <= button.viewport
          && button.width >= 24 && button.height >= 24, JSON.stringify(button))
        await page.screenshot({ path: join(output, `toolbar-${dark ? 'dark' : 'light'}-${width}.png`) })
      }
    }
    await page.setViewportSize({ width: 1280, height: 900 })
    const next = await rpc('/_mayori-smoke', { action: 'turn', sessionId: fixture.manual })
    assert.ok(next.requests.some(request => request.messages.some(message => message.content.some(block => block.text === 'The archive door remains shut.'))),
      'The real next request must include the manually edited assistant reply')

    await choose(fixture.source)
    const playerEdit = page.locator('.mayori-message-user').first().getByRole('button', { name: 'Редактировать', exact: true })
    assert.equal(await playerEdit.evaluate(node => node.closest('[data-clock]')?.dataset.clock), 'start')
    await playerEdit.click()
    await editor.waitFor({ state: 'visible' })
    await editor.getByRole('textbox', { name: 'Реплика игрока' }).fill('I walk away from the archive.')
    await editor.getByRole('button', { name: 'Сохранить и отправить', exact: true }).click()
    fixture.player = await branch(fixture.source)
    const player = await settle(fixture.player)
    const humans = player.messages.filter(message => message.source?.kind === 'user')
    assert.equal(humans.length, 1)
    assert.equal(humans[0].content[0].text, 'I walk away from the archive.')
    assert.ok(player.requests.at(-1).messages.some(message => message.content.some(block => block.text === 'I walk away from the archive.')))

    await choose(fixture.source)
    await page.locator('[data-turn-tail]').last().getByRole('button', { name: 'Повторить ответ', exact: true }).click()
    const repeat = page.getByRole('dialog', { name: 'Повторить ответ', exact: true })
    await repeat.waitFor({ state: 'visible' })
    await repeat.getByText('Модель заново ответит на реплику игрока.', { exact: false }).waitFor()
    await repeat.getByRole('button', { name: 'Повторить ответ', exact: true }).click()
    fixture.regenerated = await branch(fixture.source)
    const regenerated = await settle(fixture.regenerated)
    assert.equal(regenerated.messages.filter(message => message.source?.kind === 'user').length, 1)
    const oldRolls = new Set(original.events.filter(event => event.type === 'tool/result').map(event => event.data.message.toolCallId))
    assert.ok(regenerated.events.filter(event => event.type === 'tool/result').some(event => !oldRolls.has(event.data.message.toolCallId)),
      'A regenerated turn must record actual fresh tool calls, not reuse fabricated results')
    const unchanged = await settle(fixture.source)
    assert.deepEqual(unchanged.events, original.events)
    await page.screenshot({ path: join(output, 'regenerated-1280.png') })
    await page.reload(); await openChat(fixture.manual)
    await page.getByRole('combobox', { name: 'Ветка чата' }).waitFor()
    assert.equal(await page.getByRole('combobox', { name: 'Ветка чата' }).locator('option').count(), 4)
    const opening = original.events.find(event => event.type === 'assistant/message')
    fixture.greeting = (await rpc('/mayori/characters/message-edit', { sessionId: fixture.source, seq: opening.seq, text: 'My edited opening.' })).sessionId
    const greeting = await settle(fixture.greeting)
    assert.equal(greeting.messages.at(-1).content[0].text, 'My edited opening.')
    assert.equal(greeting.requestCount, unchanged.requestCount)
    await choose(fixture.greeting)
    assert.equal(await page.getByRole('button', { name: 'Повторить ответ', exact: true }).count(), 0)
    await writeFile(join(output, 'fixture.json'), JSON.stringify(fixture, null, 2) + '\n')
  }
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ ok: true, fixture, output, restored: process.argv[4] === '--restore' }))
} catch (error) {
  await page?.screenshot({ path: join(output, 'failure.png') })
  console.error(JSON.stringify({ fixture, alerts: await page?.getByRole('alert').allTextContents(),
    pickers: await page?.locator('select').evaluateAll(nodes => nodes.map(node => ({ value: node.value, text: node.textContent }))) }))
  throw error
} finally { await browser.close() }
