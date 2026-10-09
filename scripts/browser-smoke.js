/** Browser regressions against an isolated Host with dsh-smoke-probe mounted. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { deflateSync } from 'node:zlib'
import { mkdir, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.MAYORI_PLAYWRIGHT_PATH ?? 'playwright')
const url = new URL(process.argv[2] ?? 'http://127.0.0.1:3092')
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(url.hostname), 'Use a local isolated smoke Host')
const origin = url.origin
const output = process.argv[3] ? resolve(process.argv[3]) : await mkdtemp(join(tmpdir(), 'mayori-browser-'))
await mkdir(output, { recursive: true })

async function rpc(path, payload) {
  const response = await fetch(origin + path, { method: 'POST', signal: AbortSignal.timeout(30000),
    headers: { 'content-type': 'application/json', origin, 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(payload) })
  const result = await response.json()
  assert.ok(response.ok && result.ok, JSON.stringify(result))
  return result.value
}

function chunk(type, content) {
  const body = Buffer.concat([Buffer.from(type), content])
  let crc = 0xffffffff
  for (const byte of body) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  const size = Buffer.alloc(4); size.writeUInt32BE(content.length)
  const checksum = Buffer.alloc(4); checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0)
  return Buffer.concat([size, body, checksum])
}

/** Real PNGs with tall/wide geometry; corner colors reveal accidental clipping. */
function png(width, height, color, card) {
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2
  const stride = width * 3 + 1
  const pixels = Buffer.alloc(height * stride)
  for (let row = 0; row < height; row++) {
    for (let column = 0; column < width; column++) {
      for (let rgb = 0; rgb < 3; rgb++) pixels[row * stride + column * 3 + 1 + rgb]
        = row < 12 || row >= height - 12 ? 220 : color[rgb]
    }
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header),
    chunk('IDAT', deflateSync(pixels)),
    ...(card ? [chunk('tEXt', Buffer.from('chara\0' + Buffer.from(JSON.stringify(card)).toString('base64')))] : []),
    chunk('IEND', Buffer.alloc(0))])
}

// Fail on a normal player Host before importing or changing its default persona.
const campaign = await rpc('/_mayori-smoke', { action: 'create' })
const persona = await rpc('/mayori/characters/persona-save', { name: 'Browser Player', description: '',
  avatar: 'data:image/png;base64,' + png(768, 256, [192, 119, 35]).toString('base64') })
await rpc('/mayori/characters/persona-default', { id: persona.id })
const card = { spec: 'chara_card_v2', spec_version: '2.0', data: { name: 'Browser Character',
  description: 'A browser test character.', first_mes: 'Hello from the portrait test.', personality: '', scenario: '',
  mes_example: '', creator_notes: '', system_prompt: '', post_history_instructions: '', alternate_greetings: [], tags: [] } }
await rpc('/mayori/characters/import', { files: [{ name: 'browser.png', type: 'image/png',
  base64: png(256, 1024, [34, 126, 154], card).toString('base64') }] })
const selected = (await rpc('/mayori/characters/list', {})).cards.find(card => card.name === 'Browser Character')
const session = await rpc('/mayori/characters/start', { characterId: selected.id, workspaceId: campaign.workspaceId })
await rpc('/_mayori-smoke', { action: 'adopt', ...session, workspaceId: campaign.workspaceId })
const turn = await rpc('/_mayori-smoke', { action: 'turn', ...session })
const request = turn.requests.findLast(request => request.messages.some(message => message.source?.kind === 'user'))
assert.equal(request.messages[0].role, 'system', 'The real input must start with system, including on in-history routes')
assert.ok(request.messages[0].content.some(block => block.text?.includes('<mayori-character-card>')))
assert.equal(request.messages.filter(message => message.content.some(block => block.text?.includes('<mayori-character-card>'))).length, 1)

const browser = await chromium.launch({ headless: true,
  ...(process.env.MAYORI_CHROMIUM_PATH ? { executablePath: process.env.MAYORI_CHROMIUM_PATH } : {}) })
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  const errors = []
  const originalRequests = new Set()
  page.on('request', request => { if (/\/mayori\/characters\/(?:media|card-image)\/[a-f0-9]{64}\/original$/.test(request.url())) originalRequests.add(request.url()) })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(url.href)
  await page.getByRole('button', { name: 'История чатов', exact: true }).waitFor()
  try { await page.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 2000 }) } catch {}
  const openChat = async () => {
    await page.getByRole('button', { name: 'История чатов', exact: true }).click()
    await page.getByRole('searchbox', { name: 'Поиск по названию или ID чата' }).fill(session.sessionId)
    await page.locator('.mayori-history-row').first().click()
    await page.locator('.mayori-message-avatar img').first().waitFor()
  }
  await openChat()
  const sessionsBeforeAvatars = await rpc('/_mayori-smoke', { action: 'active-sessions' })
  const assertPortraits = async () => {
    assert.equal(await page.locator('.mayori-message-character > .mayori-message-avatar').count(), 2,
      'One portrait for the greeting and one for the response, including split reasoning/tool steps')
    assert.equal(await page.locator('.mayori-message-user > .mayori-message-avatar').count(), 1)
    assert.equal(await page.locator('[data-chat-group-part="reasoning"] .mayori-message-avatar').count(), 0)
    assert.equal(await page.locator('.mayori-message-content .mayori-message-avatar').count(), 0,
      'Portraits are siblings of message content, outside its box')
  }
  await assertPortraits()
  await page.waitForFunction(() => [...document.querySelectorAll('.mayori-message-avatar img')].every(image => image.complete && image.naturalWidth > 0))
  assert.equal(originalRequests.size, 0, 'Message rows must not download full-size originals')
  const thumbnails = await page.locator('.mayori-message-avatar img').evaluateAll(images => images.map(image => ({ src: image.getAttribute('src'), width: image.naturalWidth, height: image.naturalHeight })))
  assert.ok(thumbnails.every(image => /\/avatar$/.test(image.src) && Math.max(image.width, image.height) <= 96))
  await page.reload()
  await openChat()
  await assertPortraits()
  const chat = page.getByText('Chat', { exact: true })
  const trajectory = page.getByText('Trajectory', { exact: true })
  assert.ok((await chat.boundingBox()).x < (await trajectory.boundingBox()).x)
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => {
      if (theme === 'dark') document.body.setAttribute('data-ds-dark-theme', '')
      else document.body.removeAttribute('data-ds-dark-theme')
    }, theme)
    for (const width of [1280, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await assertPortraits()
      for (const role of ['character', 'user']) {
        const row = page.locator(`.mayori-message-${role}`).first()
        const bounds = await row.evaluate(row => {
          const avatar = row.querySelector('.mayori-message-avatar').getBoundingClientRect()
          const content = row.querySelector('.mayori-message-content').getBoundingClientRect()
          const bounds = row.getBoundingClientRect()
          return { placement: row.dataset.avatarPlacement, rowLeft: bounds.left, rowRight: bounds.right,
            avatarLeft: avatar.left, avatarRight: avatar.right, avatarBottom: avatar.bottom, avatarTop: avatar.top,
            contentLeft: content.left, contentRight: content.right, contentTop: content.top }
        })
        assert.ok(Math.abs(bounds.contentLeft - bounds.rowLeft) < 1 && Math.abs(bounds.contentRight - bounds.rowRight) < 1,
          'Portraits must not indent or narrow the native text column')
        assert.equal(bounds.placement, width === 1280 ? 'side' : 'above',
          'ResizeObserver must move portraits between the gutters and a separate row as the viewport changes')
        assert.ok(bounds.avatarLeft >= 0 && bounds.avatarRight <= width && bounds.avatarTop >= 0,
          'Portrait triggers must remain inside the viewport')
        if (bounds.placement === 'side') {
          assert.ok(role === 'character' ? bounds.avatarRight <= bounds.contentLeft - 12 : bounds.avatarLeft >= bounds.contentRight + 12)
        } else {
          assert.ok(bounds.avatarBottom <= bounds.contentTop - 8, 'Narrow layouts put the portrait above the full-width content')
        }
        const trigger = row.locator('.mayori-message-avatar')
        await trigger.click()
        assert.match(await page.locator('.mayori-avatar-dialog img').getAttribute('src'), /\/original$/)
        const dialog = page.getByRole('dialog', { name: role === 'character' ? 'Browser Character' : 'Browser Player', exact: true })
        await dialog.waitFor({ state: 'visible' })
        await dialog.locator('img').evaluate(image => image.decode())
        const geometry = await dialog.evaluate(dialog => {
          const rect = dialog.getBoundingClientRect()
          const header = dialog.querySelector('.mayori-avatar-dialog-header').getBoundingClientRect()
          const image = dialog.querySelector('img').getBoundingClientRect()
          const media = dialog.querySelector('.mayori-avatar-dialog-media')
          return { inBody: dialog.parentElement === document.body, background: getComputedStyle(dialog).backgroundColor,
            inViewport: rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight,
            imageFits: image.left >= rect.left && image.right <= rect.right && image.top >= header.bottom && image.bottom <= rect.bottom,
            objectFit: getComputedStyle(dialog.querySelector('img')).objectFit,
            overflow: media.scrollHeight > media.clientHeight + 1 || media.scrollWidth > media.clientWidth + 1 }
        })
        assert.equal(geometry.inBody, true, 'The dialog must be outside message layout and inherited row styles')
        assert.ok(geometry.background.startsWith('rgb('), 'The modal must have an opaque theme surface')
        assert.equal(geometry.inViewport, true)
        assert.equal(geometry.imageFits, true, 'Tall avatars must stay below the header and within the viewport')
        assert.equal(geometry.objectFit, 'contain')
        assert.equal(geometry.overflow, false)
        await page.screenshot({ path: join(output, `${theme}-${width}-${role}.png`) })
        await page.keyboard.press('Tab')
        assert.ok(await dialog.evaluate(node => document.activeElement === document.body || node.contains(document.activeElement)))
        await page.keyboard.press('Shift+Tab')
        assert.ok(await dialog.evaluate(node => node.contains(document.activeElement)))
        await page.keyboard.press('Escape')
        await dialog.waitFor({ state: 'detached' })
        assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
        await page.keyboard.press('Enter')
        await dialog.waitFor({ state: 'visible' })
        await dialog.getByRole('button', { name: 'Закрыть аватар' }).click()
        await dialog.waitFor({ state: 'detached' })
        assert.equal(await trigger.evaluate(node => node === document.activeElement), true)
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
      await page.screenshot({ path: join(output, `${theme}-${width}-chat.png`) })
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.locator('.mayori-message-avatar').first().click()
  await page.getByRole('dialog').waitFor({ state: 'visible' })
  await page.mouse.click(1, 1)
  await page.getByRole('dialog').waitFor({ state: 'detached' })
  assert.deepEqual(errors, [])
  assert.deepEqual(await rpc('/_mayori-smoke', { action: 'active-sessions' }), sessionsBeforeAvatars,
    'Avatar keyboard controls must not submit messages or create a new chat')
  assert.ok(originalRequests.size >= 2, 'Explicit portrait expansion requests the preserved character and persona originals')
  console.log(JSON.stringify({ ok: true, sessionId: session.sessionId, output, screenshots: 18, lazyOriginals: true, avatarMaxSize: 96 }))
} finally { await browser.close() }
