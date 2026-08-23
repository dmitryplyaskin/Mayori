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
  let provided
  let rpcRegistration
  const ctx = {
    systemPrompt: {
      section(section) {
        sections.push(section)
      },
    },
    reflect: {
      provide(name, service) { provided = { name, service } },
    },
    inject(services, callback) {
      assert.deepEqual(services, ['webServer'])
      callback({
        effect(factory, label) {
          assert.equal(label, 'mayori: character library route')
          factory()
        },
        webServer: {
          register(route) { rpcRegistration = route; return () => {} },
        },
      })
    },
  }

  apply(ctx, { campaignStyle: 'A compact one-shot.', charactersPath: './test-characters' })

  assert.equal(sections.length, 1)
  assert.equal(sections[0].name, 'mayori:director')
  assert.equal(sections[0].order, 10)
  assert.match(sections[0].text, /A compact one-shot\./)
  assert.equal(provided.name, 'mayoriCharacters')
  assert.equal(provided.service.constructor.name, 'FileSystemCharacterLibraryProvider')
  assert.match(provided.service.root, /test-characters$/)
  assert.equal(rpcRegistration.kind, 'prefix')
  assert.equal(rpcRegistration.path, '/mayori/characters')
})
