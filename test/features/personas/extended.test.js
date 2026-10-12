import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePersonaExtensions, composePersona, snapshotPersona, filterPersonas } from '../../../src/features/personas/shared/persona.js'
import { renderTemplate } from '../../../src/shared/templates.js'
import { buildCharacterContext } from '../../../src/features/character-session/domain/character.js'

const characterId = 'a'.repeat(64)
const item = (id, text, patch = {}) => ({ id, type: 'item', title: `private-${id}`, text, enabled: true, ...patch })
const group = (id, items, patch = {}) => ({ id, type: 'group', title: `private-${id}`, enabled: true, items, ...patch })
const normalize = input => ({ name: 'Alex', description: 'Base {{user}}', ...input, ...validatePersonaExtensions(input) })

test('blocks preserve exact text and order; a disabled group gates every child; titles stay out of the prompt', () => {
  const persona = normalize({ description: 'Base', blocks: [item('one', '  first  '),
    group('group', [item('two', 'second'), item('off', 'disabled', { enabled: false })]),
    group('hidden', [item('three', 'hidden child')], { enabled: false }), item('last', '\tlast\n'), item('empty', '  ')] })
  assert.equal(composePersona(persona).description, 'Base\n\n  first  \n\nsecond\n\n\tlast\n')
  assert.doesNotMatch(composePersona(persona).description, /private|disabled|hidden/)
  assert.equal(composePersona({ ...persona, blocks: [...persona.blocks].reverse() }).description, 'Base\n\n\tlast\n\n\nsecond\n\n  first  ')
})

test('automatic activation uses any chat, character or description match and ignores the manual flag', () => {
  const persona = normalize({ description: '', blocks: [
    item('chat', 'chat', { enabled: false, activation: { auto: true, chatIds: ['session-x'] } }),
    item('character', 'character', { activation: { auto: true, characterIds: [characterId] } }),
    group('match', [item('child', 'child'), item('no', 'no', { activation: { auto: true, match: 'missing' } })],
      { activation: { auto: true, match: 'ARCHIVIST' } }),
  ] })
  assert.equal(composePersona(persona).description, '')
  const assembled = composePersona(persona, { sessionId: 'session-x', characterId, characterDescription: 'A patient archivist.' })
  assert.equal(assembled.description, 'chat\n\ncharacter\n\nchild')
  assert.deepEqual(assembled.activeIds, ['chat', 'character', 'match', 'child'])
})

test('description variants, escaped joiners and every wrapper placeholder compose without mutating the base', () => {
  const persona = normalize({ description: 'Original', descriptionOverride: 'Variant', blocks: [item('one', 'Addition')],
    prompt: { wrapperEnabled: true, wrapperTemplate: '[{{PROMPT}}] {{PROMPT}}', joiner: '\\n\\t' } })
  assert.equal(composePersona(persona).description, '[Variant\n\tAddition] Variant\n\tAddition')
  assert.equal(persona.description, 'Original')
  assert.equal(composePersona(normalize({ description: '', blocks: [], prompt: { wrapperEnabled: true, wrapperTemplate: '[{{PROMPT}}]' } })).description, '')
  assert.equal(composePersona(normalize({ description: '', descriptionOverride: '', blocks: [item('a', 'x'), item('b', 'y')], prompt: { joiner: '' } })).description, 'xy')
})

test('rejects malformed trees, duplicate IDs, unbounded prompts, bindings and invalid settings', () => {
  for (const input of [
    { blocks: null }, { blocks: [item('same', 'x'), group('group', [item('same', 'y')])] },
    { blocks: [group('a', [group('b', [])])] }, { blocks: [item('a', 'x', { enabled: 'yes' })] },
    { blocks: [item('a', 'x', { activation: { characterIds: ['wrong'] } })] },
    { characterIds: ['wrong'] }, { descriptionOverride: 3 }, { prompt: [] },
    { prompt: { wrapperEnabled: true, wrapperTemplate: 'no placeholder' } },
    { blocks: Array.from({ length: 257 }, (_, id) => item(`id-${id}`, 'x')) },
    { blocks: Array.from({ length: 5 }, (_, id) => item(`id-${id}`, 'x'.repeat(32000))) },
    { blocks: [item('a', 'x'.repeat(32000))], prompt: { wrapperEnabled: true, wrapperTemplate: '{{PROMPT}}'.repeat(20) } },
  ]) assert.throws(() => validatePersonaExtensions(input), TypeError)
  assert.deepEqual(validatePersonaExtensions({ name: 'Legacy' }), {})
})

test('a detached persona preserves activation, blocks and template macros across catalog changes and forks', () => {
  const persona = normalize({ blocks: [item('auto', 'For {{char}}.', { activation: { auto: true, chatIds: ['parent'] } })] })
  const snapshot = snapshotPersona(persona, { sessionId: 'parent', characterId })
  persona.blocks[0].text = 'Changed'
  persona.description = 'Changed'
  assert.equal(snapshot.blocks[0].text, 'For {{char}}.')
  const character = { id: characterId, name: 'Aster', data: { description: 'Description {{persona}}', scenario: '', personality: '', mes_example: '', system_prompt: '', post_history_instructions: '' }, persona: snapshot }
  assert.equal(renderTemplate('{{persona}}', character, snapshot), 'Base Alex\n\nFor Aster.')
  const projection = buildCharacterContext(character)
  assert.match(projection, /Base Alex\\n\\nFor Aster\./)
  assert.doesNotMatch(projection, /private-|activeIds|sessionId|Changed/)
  assert.equal(snapshot.promptSnapshot.sessionId, 'parent')
  assert.equal(buildCharacterContext({ ...character, persona: structuredClone(snapshot) }), projection)
})

test('persona library search and sort keep the persisted catalog order and search names, titles and descriptions', () => {
  const personas = [{ name: 'Z', title: 'Scout', description: 'long description', characterIds: [characterId] },
    { name: 'A', description: 'short' }]
  assert.deepEqual(filterPersonas(personas, ' scout ').map(p => p.name), ['Z'])
  assert.deepEqual(filterPersonas(personas, 'SHORT').map(p => p.name), ['A'])
  assert.deepEqual(filterPersonas(personas).map(p => p.name), ['A', 'Z'])
  assert.deepEqual(filterPersonas(personas, '', 'connections').map(p => p.name), ['Z', 'A'])
  assert.deepEqual(filterPersonas(personas, '', 'description').map(p => p.name), ['Z', 'A'])
  assert.deepEqual(personas.map(p => p.name), ['Z', 'A'])
})
