import assert from 'node:assert/strict'
import test from 'node:test'

import { apply, buildDirectorPrompt } from '../../index.js'

test('builds the default director prompt around player agency and established fiction', () => {
  const prompt = buildDirectorPrompt()

  assert.match(prompt, /^Mayori facilitates/)
  assert.match(prompt, /Protect player agency/)
  assert.match(prompt, /Keep established facts, character motivations, locations, chronology, and unresolved consequences consistent\./)
  assert.doesNotMatch(prompt, /workspace|campaign files|update them/)
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

test('registers one ordered system-prompt section', async () => {
  const sections = []
  const provided = []
  let rpcRegistration
  let registrationReady
  const ctx = {
    systemPrompt: {
      section(section) {
        sections.push(section)
      },
    },
    reflect: {
      provide(name, service) { provided.push({ name, service }) },
    },
    inject(services, callback) {
      assert.deepEqual(services, ['webServer', 'agents', 'sessions', 'workspaceRegistry', 'agentPresets', 'sessionQuery'])
      registrationReady = callback({
        reflect: {
          provide(name, service) { provided.push({ name, service }) },
        },
        agents: { get() { return undefined }, list() { return [] } },
        on(event, listener) {
          assert.ok(event === 'agent/created' || event === 'agent/disposed')
          assert.equal(typeof listener, 'function')
        },
        effect(factory, label) {
          if (label === 'mayori: character library route') factory()
          else if (label.startsWith('mayori: active character context')) return factory()
          else assert.fail(`unexpected effect: ${label}`)
        },
        webServer: {
          register(route) { rpcRegistration = route; return () => {} },
        },
      })
    },
  }

  apply(ctx, {
    campaignStyle: 'A compact one-shot.',
    charactersPath: './test-characters',
    campaignsPath: './test-campaigns',
  })
  await registrationReady

  assert.equal(sections.length, 1)
  assert.equal(sections[0].name, 'mayori:director')
  assert.equal(sections[0].order, 10)
  assert.match(sections[0].text, /A compact one-shot\./)
  assert.equal(provided[0].name, 'mayoriCharacters')
  assert.equal(provided[0].service.constructor.name, 'FileSystemCharacterLibraryProvider')
  assert.match(provided[0].service.root, /test-characters$/)
  assert.equal(provided[1].name, 'mayoriPersonas')
  assert.equal(provided[1].service.constructor.name, 'FileSystemPersonaProvider')
  assert.equal(provided[2].name, 'mayoriCharacterSessions')
  assert.equal(provided[2].service.constructor.name, 'PersistentCharacterSessionProvider')
  assert.match(provided[2].service.defaultCampaignPath, /test-campaigns[\\/]default$/)
  assert.equal(provided[3].name, 'mayoriTrajectoryContext')
  assert.equal(provided[3].service.constructor.name, 'SessionTrajectoryContextProvider')
  assert.equal(provided[4].name, 'mayoriHistoryDetails')
  assert.equal(rpcRegistration.kind, 'prefix')
  assert.equal(rpcRegistration.path, '/mayori/characters')
})
