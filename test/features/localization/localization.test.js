import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile, readdir } from 'node:fs/promises'
import { en } from '../../../src/features/localization/shared/en.js'
import { ru, formatMessage, translateNotice } from '../../../src/features/localization/shared/messages.js'
import { registerLocalization } from '../../../src/features/localization/client/provider.js'
import { formatLocale, noticeText, tr } from '../../../src/features/localization/client/service.js'
import { createLocale } from './fixture.js'

test('every Mayori copy key has an English translation with matching placeholders', async () => {
  const placeholders = text => [...text.matchAll(/\{p\d+\}/g)].map(match => match[0]).sort()
  for (const [key, translation] of Object.entries(en)) {
    assert.ok(translation.trim(), key)
    assert.equal(/[А-Яа-яЁё]/.test(translation), false, key)
    assert.deepEqual(placeholders(key), placeholders(translation), key)
    assert.equal(ru[key], key)
  }
  const scan = async url => {
    for (const entry of await readdir(url, { withFileTypes: true })) {
      const child = new URL(entry.name + (entry.isDirectory() ? '/' : ''), url)
      if (entry.isDirectory()) await scan(child)
      else if (/\.jsx?$/.test(entry.name) && child.pathname.includes('/client/')) {
        const source = await readFile(child, 'utf8')
        for (const match of source.matchAll(/\btr\(\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g)) {
          const key = match[1].startsWith('"') ? JSON.parse(match[1]) : match[1].slice(1, -1)
          assert.ok(Object.hasOwn(en, key), `${child.pathname}: ${key}`)
        }
      }
    }
  }
  await scan(new URL('../../../src/', import.meta.url))
})

test('interpolation preserves authored macros and handles reordered and repeated values', () => {
  assert.equal(formatMessage('{p2} / {p1} / {p2}', { p1: 'Астер', p2: 3 }), '3 / Астер / 3')
  assert.equal(formatMessage('{{PROMPT}} {{user}} {p1}', { p1: '<script>' }), '{{PROMPT}} {{user}} <script>')
  assert.equal(formatMessage('{p1}'), '{p1}')
})

test('product errors and import notices change language while unknown text and values stay intact', () => {
  const english = (key, params) => formatMessage(en[key] ?? key, params)
  const russian = (key, params) => formatMessage(key, params)
  assert.equal(translateNotice('Укажите имя персоны длиной до 120 символов.', english), 'Enter a persona name of up to 120 characters.')
  assert.equal(translateNotice('Персонаж «Астер» удалён.', english), 'Character “Астер” deleted.')
  assert.equal(translateNotice('Character “Астер” deleted.', russian), 'Персонаж «Астер» удалён.')
  assert.equal(translateNotice('Пресет импортирован. Макросы ST сохранены как текст.', english), 'Preset imported. ST macros were preserved as text.')
  assert.equal(translateNotice('Unknown remote error: <script>', english), 'Unknown remote error: <script>')
  assert.equal(translateNotice('Порог заполнения контекста: укажите целое число от 10 до 95.', english), 'Context usage threshold: enter an integer from 10 to 95.')
})

test('DSH owns language selection, dictionary updates and reversible lifecycle', async () => {
  const locale = createLocale('en'), disposers = [], provided = {}
  const ctx = { locale, provide: (name, service) => { provided[name] = service }, effect: callback => { disposers.push(callback()) } }
  const service = registerLocalization(ctx)
  try {
    assert.equal(provided.mayoriLocale, service)
    assert.equal(tr('Главная'), 'Home')
    let changes = 0
    const stop = service.subscribe(() => { changes++ })
    await service.setLanguage('ru')
    assert.equal(tr('Главная'), 'Главная')
    assert.equal(formatLocale(), 'ru-RU')
    assert.equal(locale.bind('conversation')('input.send'), 'Отправить сообщение')
    await service.setLanguage('en')
    assert.equal(formatLocale(), 'en-US')
    assert.equal(noticeText('Настройки сохранены.'), 'Settings saved.')
    assert.equal(changes, 2)
    assert.throws(() => service.setLanguage('xx'), /Unsupported/)
    stop(); assert.equal(locale.listenerCount(), 0)
  } finally { disposers.reverse().forEach(dispose => dispose()) }
  assert.equal(locale.dictionaries.size, 0)
  assert.equal(locale.getSnapshot().locales.some(language => language.id === 'ru'), false)
  assert.equal(tr('Главная'), 'Главная')
})

test('an existing Russian language definition is reused', () => {
  const locale = createLocale(), release = locale.addLanguage({ id: 'ru', label: 'Русский', fallback: 'en' })
  const disposers = []
  registerLocalization({ locale, provide() {}, effect: callback => { disposers.push(callback()) } })
  disposers.reverse().forEach(dispose => dispose())
  assert.equal(locale.getSnapshot().locales.filter(language => language.id === 'ru').length, 1)
  release()
})
