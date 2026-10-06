import test from 'node:test'
import assert from 'node:assert/strict'
import { renderTemplate } from '../src/templates.js'

const character = { name: 'Астра', data: { description: '{{char}} знает {{user}}.', personality: 'Спокойная',
  scenario: '{{description}} Здесь ждёт {{user}}.', mes_example: '<USER>: Привет.\n<BOT>: Здравствуй.',
  character_version: '2' } }
const persona = { name: 'Алекс', description: '{{user}} — путешественник.' }

test('basic ST identities, field aliases and legacy names expand in greetings and prompts', () => {
  assert.equal(renderTemplate('{{ CHAR }}: {{USER}}. {{persona}} {{charVersion}}', character, persona),
    'Астра: Алекс. Алекс — путешественник. 2')
  assert.equal(renderTemplate('{{scenario}}', character, persona), 'Астра знает Алекс. Здесь ждёт Алекс.')
  assert.equal(renderTemplate('{{mesExamples}}', character, persona), 'Алекс: Привет.\nАстра: Здравствуй.')
})

test('names are literal, field recursion is bounded, and script/dice expressions remain inert', () => {
  assert.equal(renderTemplate('{{char}}', { name: '$& {{user}}' }, persona), '$& {{user}}')
  assert.equal(renderTemplate('{{description}}', { ...character, data: { description: '{{scenario}}', scenario: '{{description}}' } }, persona), '')
  const inert = '{{roll::1d20}} {{random::a::b}} {{setvar::x::2}} {{unknown}} {{outer::{{nested}}}}'
  assert.equal(renderTemplate(inert, character, persona), inert)
})

test('comments, whitespace and date macros use a supplied reproducible timestamp', () => {
  assert.equal(renderTemplate('a{{newline}}{{space}}b{{noop}}{{// secret}}', character, persona), 'a\n b')
  const text = '{{isodate}} {{isotime}} {{weekday}}'
  assert.equal(renderTemplate(text, character, persona, Date.UTC(2026, 9, 6, 12, 30)), '2026-10-06 12:30:00 Tuesday')
})
