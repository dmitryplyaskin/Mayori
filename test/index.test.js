import assert from 'node:assert/strict'
import test from 'node:test'

import { apply, buildDirectorPrompt } from '../index.js'

test('builds the default director prompt around player agency and durable canon', () => {
  const prompt = buildDirectorPrompt()

  assert.match(prompt, /^Mayori facilitates/)
  assert.match(prompt, /Protect player agency/)
  assert.match(prompt, /campaign files exist in the workspace, treat them as canonical/)
  assert.match(prompt, /Never claim that a random outcome occurred/)
})

test('applies deployment configuration and appends additional instructions', () => {
  const prompt = buildDirectorPrompt({
    narratorName: 'The Keeper',
    languagePolicy: 'Use English.',
    campaignStyle: 'Investigative cosmic horror.',
    additionalInstructions: 'Keep scene openings concise.',
  })

  assert.match(prompt, /^The Keeper facilitates Investigative cosmic horror\./)
  assert.match(prompt, /Use English\./)
  assert.match(prompt, /Keep scene openings concise\.$/)
})

test('rejects blank required configuration', () => {
  assert.throws(
    () => buildDirectorPrompt({ narratorName: '   ' }),
    /narratorName must be a non-empty string/,
  )
})

test('registers one ordered system-prompt section', () => {
  const sections = []
  const ctx = {
    systemPrompt: {
      section(section) {
        sections.push(section)
      },
    },
  }

  apply(ctx, { campaignStyle: 'A compact one-shot.' })

  assert.equal(sections.length, 1)
  assert.equal(sections[0].name, 'mayori:director')
  assert.equal(sections[0].order, 10)
  assert.match(sections[0].text, /A compact one-shot\./)
})
