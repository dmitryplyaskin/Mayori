import assert from 'node:assert/strict'
import test from 'node:test'
import { Session } from '@deepseek-ai/dsh-session'
import { messagePreview, SessionHistoryDetailsProvider } from '../../../src/features/history/host/details.js'
import { greetingSeed } from '../../../src/features/character-session/host/greeting.js'

const user = (id, text, kind = 'user') => ({ id, role: 'user', source: { kind }, content: [{ type: 'text', text }] })

test('preview selects visible dialogue, ignores context and reconstructs greeting replacements', () => {
  const session = Session.create('test', greetingSeed({ messageId: 'opening', text: 'Old opening' }))
  assert.equal(messagePreview(session.snapshotEvents()), 'Old opening')
  const selectedSeq = session.append('user/message', user('swipe', JSON.stringify({ mayori_authored_opening: 'Selected\nopening' }), 'mayori-greeting'), {
    surfaceOp: { op: 'replace', startSeq: 3, endSeq: 3 }, sourceEventSeqs: [3],
  }).seq
  assert.equal(messagePreview(session.snapshotEvents()), 'Selected opening')
  session.append('user/message', user('context', 'Hidden system data', 'runtime'), { surfaceOp: 'append' })
  assert.equal(messagePreview(session.snapshotEvents()), 'Selected opening')
  session.append('user/message', user('player', '🐉'.repeat(181)), { surfaceOp: 'append' })
  assert.equal(messagePreview(session.snapshotEvents()), '🐉'.repeat(180) + '…')
  const seq = session.seq
  assert.equal(messagePreview(session.snapshotEvents()), '🐉'.repeat(180) + '…')
  assert.equal(session.seq, seq)
  session.append('user/message', user('summary', 'Technical summary', 'runtime'), {
    surfaceOp: { op: 'replace', startSeq: selectedSeq, endSeq: session.seq - 1 }, sourceEventSeqs: [selectedSeq, selectedSeq + 1, selectedSeq + 2],
  })
  assert.equal(messagePreview(session.snapshotEvents()), '🐉'.repeat(180) + '…', 'Compaction does not replace the visible transcript preview')
})

test('an empty selected greeting does not reveal a superseded opening', () => {
  const session = Session.create('test', greetingSeed({ messageId: 'opening', text: 'Old opening' }))
  session.append('user/message', user('empty', JSON.stringify({ mayori_authored_opening: '' }), 'mayori-greeting'), {
    surfaceOp: { op: 'replace', startSeq: 3, endSeq: 3 }, sourceEventSeqs: [3],
  })
  assert.equal(messagePreview(session.snapshotEvents()), '')
})

test('cold details use saved character identity, isolate unreadable logs and never activate sessions', async () => {
  const session = Session.create('cold', greetingSeed({ messageId: 'opening', text: 'Persisted hello' }))
  const queried = []
  const provider = new SessionHistoryDetailsProvider({ reflect: { provide() {} }, sessions: { messageProjections: [] },
    sessionQuery: { async readSession(id) {
      queried.push(id)
      if (id === 'corrupt') throw Error('corrupt')
      return { session: { parentSession: id === 'fork' ? 'cold' : undefined }, events: session.snapshotEvents() }
    } },
  }, '.')
  provider.selections = { read: async id => id === 'cold' ? { name: 'Saved NPC', image: 'data:image/png;base64,YQ==' } : null }
  const result = await provider.read(['cold', 'fork', 'corrupt', 'cold'])
  assert.equal(result.cold.characterName, 'Saved NPC')
  assert.equal(result.cold.avatar, 'data:image/png;base64,YQ==')
  assert.equal(result.fork.characterName, 'Saved NPC')
  assert.equal(result.fork.preview, 'Persisted hello')
  assert.ok(result.corrupt.error)
  assert.deepEqual(queried.sort(), ['cold', 'corrupt', 'fork'])
  await assert.rejects(provider.read(Array(61).fill('cold')), /не более 60/)
  await assert.rejects(provider.read(['']), /Некорректный/)
})
