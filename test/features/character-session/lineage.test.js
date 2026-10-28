import assert from 'node:assert/strict'
import test from 'node:test'
import { Context } from '@deepseek-ai/cordis'
import SessionProjections from '@deepseek-ai/dsh-session-projection'
import { Session } from '@deepseek-ai/dsh-session'
import { characterSnapshot } from '../../../src/features/character-session/domain/character.js'
import { characterSelectionMessage } from '../../../src/features/character-session/domain/snapshot.js'
import { registerCharacterLineage } from '../../../src/features/character-session/host/lineage.js'

test('the awaited native projection carries fork lineage in list summaries and unloads cleanly', async t => {
  const ctx = new Context()
  t.after(() => ctx.fiber.dispose())
  await ctx.plugin(SessionProjections)
  const fiber = ctx.plugin({ name: 'mayori-lineage-test', inject: ['sessionProjections'], apply: registerCharacterLineage })
  await fiber
  const character = characterSnapshot({ id: 'a'.repeat(64), name: 'Aster', data: { description: 'Original card' } })
  const session = Session.create('independent-fork')
  session.append('system/message', { turn: 1, step: 1, message: {
    id: 'head', role: 'system', content: [], source: { kind: 'system-prompt' },
  } }, { surfaceOp: 'append' })
  session.append('user/message', characterSelectionMessage(character, 'selection', 'original'), { surfaceOp: 'append' })
  assert.equal(session.header.parentSession, undefined)
  assert.deepEqual(ctx.sessionProjections.snapshot(session).values.mayoriCharacterLineage, { originSessionId: 'original' })
  await fiber.dispose()
  assert.equal(ctx.sessionProjections.snapshot(session).values.mayoriCharacterLineage, undefined)
})
