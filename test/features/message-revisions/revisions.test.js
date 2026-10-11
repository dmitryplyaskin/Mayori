import assert from 'node:assert/strict'
import test from 'node:test'
import { Session } from '@deepseek-ai/dsh-session'
import { buildForkSeed } from '@deepseek-ai/dsh-session/fork'
import { greetingSeed } from '../../../src/features/character-session/host/greeting.js'
import { SessionMessageRevisionProvider } from '../../../src/features/message-revisions/host/provider.js'
import { editedContent, authoredReply, branchRows, MANUAL_PROVIDER } from '../../../src/features/message-revisions/domain/revisions.js'
import { reconstructTrajectoryContext } from '../../../src/features/trajectory/host/context.js'
import { presetSelectionMessage, readPresetSelection } from '../../../src/features/presets/shared/preset.js'
import { readMessageEdits, revisedMessage } from '../../../src/features/message-revisions/domain/edits.js'
import { messagePreview } from '../../../src/features/history/host/details.js'
import { removedNode } from '../../../src/features/message-revisions/client/message.js'

function harness({ process = false, attachment = false } = {}) {
  const source = Session.create('source', greetingSeed({ messageId: 'greeting', text: 'Original greeting' }))
  source.append('turn/start', { turn: 2 })
  source.append('step/start', { turn: 2, step: 1 })
  const input = source.append('user/message', { id: 'input', role: 'user', source: { kind: 'user' },
    content: [{ type: 'text', text: 'Open the door.' }] }, { surfaceOp: 'append' })
  const processEvents = []
  if (process) {
    processEvents.push(source.append('assistant/message', { turn: 2, step: 1, stream: [], message: {
      id: 'process', role: 'assistant', source: { kind: 'model', provider: 'actual', model: 'selected' },
      content: [{ type: 'reasoning', text: 'Earlier private thought.' },
        { type: 'tool-call', id: 'check-door', name: 'inspectDoor', arguments: '{}' }],
    } }, { surfaceOp: 'append' }))
    processEvents.push(source.append('tool/result', { turn: 2, step: 1, message: { id: 'checked-door', role: 'tool',
      toolCallId: 'check-door', source: { kind: 'tool', callId: 'check-door' },
      content: [{ type: 'text', text: 'Door is unlocked.' }] } }, { surfaceOp: 'append' }))
    source.append('step/end', { turn: 2, step: 1 })
    source.append('step/start', { turn: 2, step: 2 })
  }
  const reply = source.append('assistant/message', { turn: 2, step: process ? 2 : 1, stream: [], message: {
    id: 'reply', role: 'assistant', source: { kind: 'model', provider: 'actual', model: 'selected' },
    content: [{ type: 'reasoning', text: 'A private thought.' }, { type: 'text', text: 'The door opens.' },
      ...(attachment ? [{ type: 'image', attachment: { attachmentId: 'saved-portrait' } }] : [])],
  } }, { surfaceOp: 'append' })
  source.append('step/end', { turn: 2, step: process ? 2 : 1 })
  source.append('turn/end', { turn: 2, reason: { kind: 'completed' } })
  const agents = new Map(), forks = [], models = [], flushes = [], creations = [], disposed = [], attached = []
  const makeAgent = session => {
    let maintenance = false
    const agent = { id: session.id, session, status: 'idle', options: { provider: 'actual', model: 'selected' },
      inbox: { nextTurn: [], nextStep: [] }, followups: [],
      async runMaintenance(operation) {
        if (maintenance) throw new Error('maintenance is already active')
        maintenance = true
        try { return await operation(new AbortController().signal) } finally { maintenance = false }
      },
      followup(message) { this.followups.push(message) },
    }
    agents.set(agent.id, agent)
    return agent
  }
  const original = makeAgent(source)
  const characters = { state: async () => ({ character: { name: 'Aster' }, greeting: { messageId: 'greeting', text: 'Chosen opening' } }) }
  const ctx = { reflect: { provide() {} }, agents: { get: id => agents.get(id),
    async create(options) {
      creations.push(options)
      const { sessionId: id } = options
      const agent = makeAgent(Session.create(id, options.seed,
        { version: 4, id, createdAt: 1, delegationDepth: 0, ...options.meta }, options.inheritedEventCount))
      await options.setup({})
      return { agent, dispose: async () => { disposed.push(id) } }
    },
  },
    agentPresets: { resolve: async id => ({ id: id ?? 'mayori-test' }), mount: async () => {} },
    workspaceRegistry: { list: () => [{ sessionIds: ['source'], attachSession: async id => { attached.push(id) } }] },
    sessionQuery: { readSession: async id => ({ events: agents.get(id).session.snapshotEvents() }) },
    sessions: { flush: async session => { flushes.push(session.id) } },
    sessionController: {
      async fork({ sessionId, atSeq }) {
        forks.push({ sessionId, atSeq })
        const id = `child-${forks.length}`
        const seed = buildForkSeed(agents.get(sessionId).session.snapshotEvents(), atSeq)
        makeAgent(Session.create(id, seed, { version: 4, id, createdAt: 1, delegationDepth: 0, parentSession: sessionId, isSeeded: true }, atSeq + 1))
        return { sessionId: id }
      },
      async selectModel(value) { models.push(value) },
    },
  }
  const provider = new SessionMessageRevisionProvider(ctx, characters)
  return { source, original, input, reply, processEvents, agents, forks, models, flushes, creations, disposed, attached, ctx, characters, provider }
}

function completedTurn(h, input, text) {
  const turn = h.source.snapshotEvents().filter(event => event.type === 'turn/start').at(-1).data.turn + 1
  h.source.append('turn/start', { turn })
  h.source.append('step/start', { turn, step: 1 })
  const user = h.source.append('user/message', input, { surfaceOp: 'append' })
  const reply = h.source.append('assistant/message', { turn, step: 1, stream: [], message: { id: `reply-${turn}`,
    role: 'assistant', source: { kind: 'model', provider: 'actual', model: 'selected' },
    content: [{ type: 'reasoning', text: `Thought ${turn}` }, { type: 'text', text }] } }, { surfaceOp: 'append' })
  h.source.append('step/end', { turn, step: 1 })
  h.source.append('turn/end', { turn, reason: { kind: 'completed' } })
  return { input: user, reply, turn }
}

const currentContext = session => JSON.stringify(reconstructTrajectoryContext(session.snapshotEvents(), 'current').messages)

test('saved variants restore edited replies, attachments, thoughts and real tool results without another model call', async () => {
  const h = harness({ process: true, attachment: true })
  await h.provider.edit('source', h.reply.seq, 'FIRST_EDITED')
  await h.provider.edit('source', h.input.seq, 'EDITED_INPUT')
  const before = h.source.snapshotEvents()
  const historical = reconstructTrajectoryContext(before, h.reply.seq)
  await h.provider.regenerate('source', h.reply.seq)
  const next = completedTurn(h, h.original.followups.at(-1), 'SECOND_REPLY')
  assert.deepEqual(await h.provider.variants('source'), [{ groupId: h.reply.seq, replySeq: next.reply.seq, startSeq: next.input.seq, index: 1, count: 2 }])
  const restored = await h.provider.selectVariant('source', next.reply.seq, 0)
  assert.deepEqual(restored.variants, [{ groupId: h.reply.seq, replySeq: h.reply.seq, startSeq: h.input.seq, index: 0, count: 2 }])
  assert.equal(h.original.followups.length, 1)
  assert.deepEqual(h.forks, [])
  assert.deepEqual(h.creations, [])
  assert.deepEqual(h.source.snapshotEvents().slice(0, before.length), before)
  const context = currentContext(h.source)
  assert.match(context, /FIRST_EDITED|EDITED_INPUT/)
  assert.doesNotMatch(context, /SECOND_REPLY/)
  assert.match(context, /check-door/)
  assert.match(context, /Door is unlocked/)
  assert.match(context, /saved-portrait/)
  for (const event of [...h.processEvents, h.reply]) assert.equal(restored.edits[event.seq].restored, true)
  assert.equal(removedNode({ kind: 'assistant-step', data: { turn: 2, finalNode: { seq: h.reply.seq } } }, restored.edits), false)
  assert.equal(removedNode({ kind: 'assistant-step', data: { turn: next.turn, finalNode: { seq: next.reply.seq } } }, restored.edits), true)
  assert.equal(messagePreview(h.source.snapshotEvents()), 'FIRST_EDITED')
  const reopened = Session.create('source', JSON.parse(JSON.stringify(h.source.snapshotEvents())), h.source.header)
  assert.deepEqual(reopened.deriveMessages(), h.source.deriveMessages())
  assert.deepEqual(reconstructTrajectoryContext(h.source.snapshotEvents(), h.reply.seq).messages, historical.messages)
  h.original.session = reopened
  assert.deepEqual(await h.provider.variants('source'), restored.variants)
  await h.provider.selectVariant('source', h.reply.seq, 1)
  assert.match(currentContext(reopened), /SECOND_REPLY/)
  assert.doesNotMatch(currentContext(reopened), /FIRST_EDITED|check-door/)
})

test('variant cycling preserves later dialogue and edits within each continuation and adds further regenerations to the same group', async () => {
  const h = harness()
  const later = completedTurn(h, { id: 'later-input', role: 'user', source: { kind: 'user' },
    content: [{ type: 'text', text: 'FIRST_CONTINUATION' }] }, 'FIRST_LATER_REPLY')
  await h.provider.regenerate('source', h.reply.seq)
  const next = completedTurn(h, h.original.followups.at(-1), 'SECOND_REPLY')
  await h.provider.edit('source', next.reply.seq, 'SECOND_EDITED')
  await h.provider.selectVariant('source', next.reply.seq, 0)
  const context = currentContext(h.source)
  assert.match(context, /FIRST_CONTINUATION/)
  assert.match(context, /FIRST_LATER_REPLY/)
  assert.doesNotMatch(context, /SECOND_EDITED/)
  assert.equal((await h.provider.inspect('source', later.reply.seq)).text, 'FIRST_LATER_REPLY')
  await h.provider.selectVariant('source', h.reply.seq, 1)
  assert.match(currentContext(h.source), /SECOND_EDITED/)
  assert.doesNotMatch(currentContext(h.source), /FIRST_CONTINUATION|FIRST_LATER_REPLY/)
  await h.provider.regenerate('source', next.reply.seq)
  const third = completedTurn(h, h.original.followups.at(-1), 'THIRD_REPLY')
  assert.deepEqual(await h.provider.variants('source'), [{ groupId: h.reply.seq, replySeq: third.reply.seq, startSeq: third.input.seq, index: 2, count: 3 }])
  await h.provider.selectVariant('source', third.reply.seq, 0)
  await h.provider.regenerate('source', h.reply.seq)
  const fourth = completedTurn(h, h.original.followups.at(-1), 'FOURTH_REPLY')
  assert.deepEqual(await h.provider.variants('source'), [{ groupId: h.reply.seq, replySeq: fourth.reply.seq, startSeq: fourth.input.seq, index: 3, count: 4 }])
  assert.deepEqual(h.forks, [])
})

test('a regeneration without a completed answer still lets the author recover the saved variant', async () => {
  const h = harness({ process: true })
  await h.provider.regenerate('source', h.reply.seq)
  assert.deepEqual(await h.provider.variants('source'), [{ groupId: h.reply.seq, replySeq: null, startSeq: h.reply.seq, index: -1, count: 1 }])
  await h.provider.selectVariant('source', h.reply.seq, 0)
  assert.match(JSON.stringify(h.source.deriveMessages()), /The door opens/)
  assert.match(JSON.stringify(h.source.deriveMessages()), /Door is unlocked/)
  assert.equal(h.original.followups.length, 1)
})

test('variant selection validates indices, refuses busy or compacted continuations and deletion retires the chooser', async () => {
  const h = harness()
  await h.provider.regenerate('source', h.reply.seq)
  const next = completedTurn(h, h.original.followups.at(-1), 'SECOND_REPLY')
  const before = h.source.snapshotEvents()
  for (const index of [-1, 2, 0.5, null, '0']) await assert.rejects(h.provider.selectVariant('source', next.reply.seq, index), /не найден/)
  await assert.rejects(h.provider.selectVariant('source', 999, 0), /не найден/)
  assert.deepEqual(h.source.snapshotEvents(), before)
  assert.deepEqual(await h.provider.selectVariant('source', next.reply.seq, 1), { sessionId: 'source', changed: false })
  h.original.status = 'running'
  await assert.rejects(h.provider.selectVariant('source', next.reply.seq, 0), /завершения/)
  h.original.status = 'idle'
  await h.provider.remove('source', next.reply.seq)
  assert.deepEqual(await h.provider.variants('source'), [])
  await assert.rejects(h.provider.selectVariant('source', next.reply.seq, 0), /не найден/)
  assert.equal(h.original.followups.length, 1)
})

test('a compacted active continuation blocks variant switching before changing the log', async () => {
  const h = harness()
  await h.provider.regenerate('source', h.reply.seq)
  const next = completedTurn(h, h.original.followups.at(-1), 'SECOND_REPLY')
  h.source.append('user/message', { id: 'summary', role: 'user', source: { kind: 'compact-checkpoint' },
    content: [{ type: 'text', text: 'Selected continuation summary.' }] },
  { surfaceOp: { op: 'replace', startSeq: next.input.seq, endSeq: next.reply.seq }, sourceEventSeqs: [next.input.seq, next.reply.seq] })
  const before = h.source.snapshotEvents()
  await assert.rejects(h.provider.selectVariant('source', next.reply.seq, 0), /сжато/)
  assert.deepEqual(h.source.snapshotEvents(), before)
  assert.equal(h.original.followups.length, 1)
})

test('nested answer variants follow the saved continuation when an earlier answer is selected', async () => {
  const h = harness()
  const later = completedTurn(h, { id: 'later-input', role: 'user', source: { kind: 'user' },
    content: [{ type: 'text', text: 'LATER_INPUT' }] }, 'LATER_FIRST')
  await h.provider.regenerate('source', later.reply.seq)
  const laterSecond = completedTurn(h, h.original.followups.at(-1), 'LATER_SECOND')
  await h.provider.regenerate('source', h.reply.seq)
  const rootSecond = completedTurn(h, h.original.followups.at(-1), 'ROOT_SECOND')
  assert.deepEqual(await h.provider.variants('source'), [{ groupId: h.reply.seq, replySeq: rootSecond.reply.seq, startSeq: rootSecond.input.seq, index: 1, count: 2 }])
  await h.provider.selectVariant('source', rootSecond.reply.seq, 0)
  assert.equal((await h.provider.variants('source')).find(group => group.groupId === later.reply.seq).replySeq, laterSecond.reply.seq)
  await h.provider.selectVariant('source', laterSecond.reply.seq, 0)
  assert.match(currentContext(h.source), /LATER_FIRST/)
  assert.doesNotMatch(currentContext(h.source), /LATER_SECOND|ROOT_SECOND/)
  await h.provider.selectVariant('source', h.reply.seq, 1)
  await h.provider.selectVariant('source', rootSecond.reply.seq, 0)
  assert.match(currentContext(h.source), /LATER_FIRST/)
  assert.doesNotMatch(currentContext(h.source), /LATER_SECOND|ROOT_SECOND/)
  assert.equal((await h.provider.variants('source')).find(group => group.groupId === later.reply.seq).replySeq, later.reply.seq)
})

test('explicit authored branches inherit the chosen context without an unfinished variant replacing their authored reply', async () => {
  const h = harness({ process: true })
  await h.provider.regenerate('source', h.reply.seq)
  const next = completedTurn(h, h.original.followups.at(-1), 'SECOND_REPLY')
  const authored = await h.provider.edit('source', next.reply.seq, 'AUTHORED_REPLY', 'branch')
  const child = h.agents.get(authored.sessionId)
  assert.deepEqual(await h.provider.variants(child.id), [])
  assert.match(currentContext(child.session), /AUTHORED_REPLY/)
  assert.doesNotMatch(currentContext(child.session), /SECOND_REPLY|The door opens/)
  await h.provider.selectVariant('source', next.reply.seq, 0)
  const restored = await h.provider.edit('source', h.reply.seq, 'RESTORED_AUTHORED_REPLY', 'branch')
  const selectedChild = h.agents.get(restored.sessionId)
  const context = currentContext(selectedChild.session)
  assert.match(context, /RESTORED_AUTHORED_REPLY/)
  assert.match(context, /check-door/)
  assert.match(context, /Door is unlocked/)
  assert.doesNotMatch(context, /SECOND_REPLY/)
  const replayed = Session.create(selectedChild.id, JSON.parse(JSON.stringify(selectedChild.session.snapshotEvents())),
    selectedChild.session.header, selectedChild.session.inheritedEventCount)
  assert.deepEqual(replayed.deriveMessages(), selectedChild.session.deriveMessages())
})

test('saving in the current chat retains later dialogue, original events and historical request input without generation', async () => {
  const h = harness()
  const before = h.source.snapshotEvents()
  const historical = reconstructTrajectoryContext(before, h.reply.seq)
  for (const [seq, text] of [[h.input.seq, 'I wait by the door.'], [h.reply.seq, 'The door stays shut.']]) {
    const result = await h.provider.edit('source', seq, text)
    assert.equal(result.sessionId, 'source')
    assert.equal(result.changed, true)
    assert.equal((await h.provider.inspect('source', seq)).text, text)
  }
  assert.deepEqual(h.source.snapshotEvents().slice(0, before.length), before)
  assert.deepEqual(h.forks, [])
  assert.deepEqual(h.creations, [])
  assert.deepEqual(h.original.followups, [])
  assert.deepEqual(reconstructTrajectoryContext(h.source.snapshotEvents(), h.reply.seq), historical)
  assert.equal(h.source.snapshotEvents().filter(event => event.type === 'turn/start').length, 2)
  assert.equal(messagePreview(h.source.snapshotEvents()), 'The door stays shut.')
  const reopened = Session.create('source', JSON.parse(JSON.stringify(h.source.snapshotEvents())), h.source.header)
  assert.deepEqual(readMessageEdits(reopened.snapshotEvents()), await h.provider.list('source'))
  assert.deepEqual(reopened.deriveMessages(), h.source.deriveMessages())
  assert.equal(revisedMessage(h.reply, readMessageEdits(reopened.snapshotEvents())).content[0].text, 'The door stays shut.')
})

test('repeated current edits replace their latest active correction and a later branch inherits prior edits', async () => {
  const h = harness()
  await h.provider.edit('source', h.input.seq, 'Corrected player input.')
  await h.provider.edit('source', h.input.seq, 'Final player input.')
  const edits = await h.provider.list('source')
  assert.equal(h.source.surface.nodes.filter(seq => h.source.snapshotEvents()[seq].data.source?.kind === 'mayori-message-edit').length, 1)
  assert.equal(edits[h.input.seq].text, 'Final player input.')
  const result = await h.provider.edit('source', h.reply.seq, 'A new branch reply.', 'branch')
  const child = h.agents.get(result.sessionId)
  assert.equal(readMessageEdits(child.session.snapshotEvents())[h.input.seq].text, 'Final player input.')
  assert.match(JSON.stringify(child.session.deriveMessages()), /Final player input/)
  assert.doesNotMatch(JSON.stringify(child.session.deriveMessages()), /Open the door/)
  assert.equal(child.followups.length, 0)
})

test('editing compacted dialogue appends a replayable correction without altering the summary or invoking a model', async () => {
  const h = harness()
  h.source.append('user/message', { id: 'summary', role: 'user', source: { kind: 'compact-checkpoint' },
    content: [{ type: 'text', text: 'Earlier dialogue was summarized.' }] },
  { surfaceOp: { op: 'replace', startSeq: h.input.seq, endSeq: h.reply.seq }, sourceEventSeqs: [h.input.seq, h.reply.seq] })
  await h.provider.edit('source', h.reply.seq, 'Corrected compacted reply.')
  const correction = h.source.snapshotEvents().at(-1)
  assert.equal(correction.surfaceOp, 'append')
  assert.match(JSON.stringify(h.source.deriveMessages()), /Earlier dialogue was summarized/)
  assert.match(JSON.stringify(h.source.deriveMessages()), /Corrected compacted reply/)
  assert.equal((await h.provider.inspect('source', h.reply.seq)).text, 'Corrected compacted reply.')
  assert.equal(h.original.followups.length, 0)
})

test('edit modes are validated and explicit regeneration uses the corrected player input', async () => {
  const h = harness()
  await assert.rejects(h.provider.edit('source', h.reply.seq, 'Changed', 'unexpected'), /сохранение/)
  await h.provider.edit('source', h.input.seq, 'Corrected input for regeneration.')
  const result = await h.provider.regenerate('source', h.reply.seq)
  assert.equal(h.agents.get(result.sessionId).followups[0].content[0].text, 'Corrected input for regeneration.')
})

test('manual assistant editing preserves the source and produces a replayable authored branch without a model call', async () => {
  const h = harness(), before = JSON.stringify(h.source.snapshotEvents())
  const result = await h.provider.edit('source', h.reply.seq, '  Дверь остаётся закрытой.\nЯ жду.  ', 'branch')
  const child = h.agents.get(result.sessionId)
  assert.equal(JSON.stringify(h.source.snapshotEvents()), before)
  assert.deepEqual(h.forks, [])
  assert.equal(h.creations[0].inheritedEventCount, h.reply.seq)
  assert.deepEqual(h.creations[0].agentOptions, { provider: 'actual', model: 'selected' })
  assert.deepEqual(h.disposed, [child.id])
  assert.deepEqual(h.attached, [child.id])
  assert.equal(h.creations[0].seed.findLast(event => event.type === 'turn/start').data.turn, 3,
    'The loop receives the complete authored turn at Agent construction')
  const authored = child.session.snapshotEvents().findLast(event => event.type === 'assistant/message')
  assert.equal(authored.data.message.source.provider, MANUAL_PROVIDER)
  assert.deepEqual(authored.data.stream, [])
  assert.equal(authored.data.usage, undefined)
  assert.deepEqual(authored.data.message.content, [{ type: 'text', text: '  Дверь остаётся закрытой.\nЯ жду.  ' }])
  assert.equal(child.followups.length, 0)
  const reopened = Session.create(child.id, child.session.snapshotEvents(), child.session.header, child.session.inheritedEventCount)
  assert.deepEqual(reopened.deriveMessages(), child.session.deriveMessages())
  assert.equal(reconstructTrajectoryContext(reopened.snapshotEvents(), 'current').requests.length, 0,
    'Manual authoring must not be presented as a model request')
  assert.equal(child.session.header.parentSession, 'source')
  assert.equal(h.flushes.at(-1), child.id)
})

test('editing a human reply into a branch saves the new literal text without model work', async () => {
  const h = harness(), before = h.source.snapshotEvents()
  const result = await h.provider.edit('source', h.input.seq, 'I leave the door alone.', 'branch')
  const child = h.agents.get(result.sessionId)
  assert.deepEqual(h.source.snapshotEvents(), before)
  assert.equal(h.creations[0].inheritedEventCount, h.input.seq)
  assert.equal(child.followups.length, 0)
  const input = child.session.snapshotEvents().findLast(event => event.type === 'user/message')
  assert.deepEqual(input.data.content, [{ type: 'text', text: 'I leave the door alone.' }])
  assert.notEqual(input.data.id, h.input.data.id)
  assert.deepEqual(input.data.source, { kind: 'user' })
  assert.equal(child.session.snapshotEvents().at(-2).type, 'turn/end')
  const history = JSON.stringify(child.session.deriveMessages())
  assert.ok(!history.includes('Open the door.') && !history.includes('The door opens.'))
})

test('regeneration retires the previous turn and repeats its input in the same chat without a fork', async () => {
  const h = harness(), before = h.source.snapshotEvents()
  const result = await h.provider.regenerate('source', h.reply.seq)
  assert.equal(result.sessionId, 'source')
  assert.deepEqual(h.forks, [])
  assert.deepEqual(h.creations, [])
  assert.deepEqual(h.original.followups[0].content, h.input.data.content)
  assert.equal(h.original.followups.length, 1)
  assert.notEqual(h.original.followups[0].id, h.input.data.id)
  assert.ok(!h.source.deriveMessages().some(message => message.id === 'reply' || message.id === 'input'))
  assert.deepEqual(h.source.snapshotEvents().slice(0, before.length), before)
  assert.equal(result.edits[h.reply.seq].deleted, true)
  assert.equal(h.flushes.at(-1), 'source')
})

test('deletion removes only the selected current revision, survives replay and cannot be edited or repeated', async () => {
  const h = harness()
  await h.provider.edit('source', h.reply.seq, 'Corrected answer to remove.')
  const before = h.source.snapshotEvents()
  const historical = reconstructTrajectoryContext(before, h.reply.seq)
  const result = await h.provider.remove('source', h.reply.seq)
  assert.equal(result.sessionId, 'source')
  assert.equal(result.edits[h.reply.seq].deleted, true)
  assert.deepEqual(h.source.snapshotEvents().slice(0, before.length), before)
  const context = JSON.stringify(reconstructTrajectoryContext(h.source.snapshotEvents(), 'current').messages)
  assert.doesNotMatch(context, /The door opens|Corrected answer to remove/)
  assert.match(context, /Open the door/)
  assert.deepEqual(reconstructTrajectoryContext(h.source.snapshotEvents(), h.reply.seq), historical)
  assert.equal(messagePreview(h.source.snapshotEvents()), 'Open the door.')
  const reopened = Session.create('source', JSON.parse(JSON.stringify(h.source.snapshotEvents())), h.source.header)
  assert.deepEqual(readMessageEdits(reopened.snapshotEvents()), result.edits)
  assert.deepEqual(reopened.deriveMessages(), h.source.deriveMessages())
  for (const action of [() => h.provider.remove('source', h.reply.seq), () => h.provider.edit('source', h.reply.seq, 'Revived'),
    () => h.provider.regenerate('source', h.reply.seq)]) await assert.rejects(action(), /удалена/)
  assert.equal(h.original.followups.length, 0)
  assert.deepEqual(h.forks, [])
})

test('deleting an answer removes earlier reasoning and tool pairs but retains the input and later conversation after replay', async () => {
  const h = harness({ process: true })
  h.source.append('turn/start', { turn: 3 })
  h.source.append('step/start', { turn: 3, step: 1 })
  h.source.append('user/message', { id: 'later', role: 'user', source: { kind: 'user' },
    content: [{ type: 'text', text: 'LATER_INPUT' }] }, { surfaceOp: 'append' })
  h.source.append('assistant/message', { turn: 3, step: 1, stream: [], message: { id: 'later-reply', role: 'assistant',
    source: { kind: 'model', provider: 'actual', model: 'selected' },
    content: [{ type: 'reasoning', text: 'LATER_THOUGHT' }, { type: 'text', text: 'LATER_REPLY' }] } }, { surfaceOp: 'append' })
  h.source.append('step/end', { turn: 3, step: 1 })
  h.source.append('turn/end', { turn: 3, reason: { kind: 'completed' } })
  const before = h.source.snapshotEvents()
  const historical = reconstructTrajectoryContext(before, h.reply.seq)
  const result = await h.provider.remove('source', h.reply.seq)
  for (const event of [...h.processEvents, h.reply]) assert.equal(result.edits[event.seq].deleted, true)
  assert.deepEqual(result.edits[h.reply.seq].processRange, { startSeq: h.input.seq + 1, endSeq: h.reply.seq })
  const reopened = Session.create('source', JSON.parse(JSON.stringify(h.source.snapshotEvents())), h.source.header)
  const context = JSON.stringify(reopened.deriveMessages())
  assert.doesNotMatch(context, /Earlier private thought|A private thought|check-door|Door is unlocked|The door opens/)
  for (const text of ['Original greeting', 'Open the door.', 'LATER_INPUT', 'LATER_THOUGHT', 'LATER_REPLY']) assert.ok(context.includes(text))
  assert.deepEqual(reopened.deriveMessages(), h.source.deriveMessages())
  assert.deepEqual(readMessageEdits(reopened.snapshotEvents()), result.edits)
  assert.deepEqual(h.source.snapshotEvents().slice(0, before.length), before)
  assert.deepEqual(reconstructTrajectoryContext(h.source.snapshotEvents(), h.reply.seq), historical)
  assert.equal(h.original.followups.length, 0)
})

test('deleted inputs and selected greetings stay removed, including in an explicitly authored branch', async () => {
  const h = harness()
  await h.provider.remove('source', 3)
  await h.provider.remove('source', h.input.seq)
  assert.equal((await h.provider.inspect('source', h.reply.seq)).canRegenerate, false)
  await assert.rejects(h.provider.regenerate('source', h.reply.seq), /игрока.*удалена/)
  const branch = await h.provider.edit('source', h.reply.seq, 'Authored branch.', 'branch')
  const events = h.agents.get(branch.sessionId).session.snapshotEvents()
  assert.equal(readMessageEdits(events)[h.input.seq].deleted, true)
  assert.equal(readMessageEdits(events)[3].deleted, true)
  assert.doesNotMatch(JSON.stringify(reconstructTrajectoryContext(events, 'current').messages), /Open the door|Original greeting/)
})

test('regeneration removes subsequent turns and old tool pairs while retaining current instructions and route', async () => {
  const h = harness()
  h.source.append('turn/start', { turn: 3 })
  h.source.append('step/start', { turn: 3, step: 1 })
  const later = h.source.append('user/message', { id: 'later-input', role: 'user', source: { kind: 'user' },
    content: [{ type: 'text', text: 'LATER_INPUT' }] }, { surfaceOp: 'append' })
  const call = h.source.append('assistant/message', { turn: 3, step: 1, stream: [], message: {
    id: 'tool-step', role: 'assistant', source: { kind: 'model', provider: 'actual', model: 'selected' },
    content: [{ type: 'tool-call', id: 'old-roll', name: 'rollDice', arguments: '{}' }],
  } }, { surfaceOp: 'append' })
  const tool = h.source.append('tool/result', { turn: 3, step: 1, message: { id: 'roll-result', role: 'tool', toolCallId: 'old-roll',
    content: [{ type: 'text', text: 'OLD_ROLL_RESULT' }] } }, { surfaceOp: 'append' })
  h.source.append('step/end', { turn: 3, step: 1 })
  h.source.append('turn/end', { turn: 3, reason: { kind: 'completed' } })
  h.source.append('user/message', presetSelectionMessage({ id: 'current', name: 'Current', instructions: 'CURRENT_INSTRUCTIONS' }, 'preset'), { surfaceOp: 'append' })
  h.source.append('model/selection', { provider: 'new-route', model: 'new-model', reasoningEffort: 'high' })
  const before = h.source.snapshotEvents()
  const result = await h.provider.regenerate('source', h.reply.seq)
  for (const event of [h.input, h.reply, later, call, tool]) assert.equal(result.edits[event.seq].deleted, true)
  const context = JSON.stringify(reconstructTrajectoryContext(h.source.snapshotEvents(), 'current').messages)
  assert.doesNotMatch(context, /LATER_INPUT|old-roll|OLD_ROLL_RESULT|The door opens|Open the door/)
  assert.equal(readPresetSelection(h.source.snapshotEvents()).instructions, 'CURRENT_INSTRUCTIONS')
  assert.equal(h.source.snapshotEvents().findLast(event => event.type === 'model/selection').data.model, 'new-model')
  assert.deepEqual(h.source.snapshotEvents().slice(0, before.length), before)
  assert.deepEqual(h.models, [])
})

test('compacted dialogue can be deleted with a logged correction but cannot be regenerated from an invented prefix', async () => {
  const h = harness()
  h.source.append('user/message', { id: 'summary', role: 'user', source: { kind: 'compact-checkpoint' },
    content: [{ type: 'text', text: 'A summary of earlier dialogue.' }] },
  { surfaceOp: { op: 'replace', startSeq: h.input.seq, endSeq: h.reply.seq }, sourceEventSeqs: [h.input.seq, h.reply.seq] })
  const before = h.source.snapshotEvents()
  await assert.rejects(h.provider.regenerate('source', h.reply.seq), /сжато/)
  assert.deepEqual(h.source.snapshotEvents(), before)
  await h.provider.remove('source', h.reply.seq)
  assert.equal(h.source.snapshotEvents().at(-1).surfaceOp, 'append')
  assert.match(JSON.stringify(h.source.deriveMessages()), /author deleted/)
  assert.equal(h.original.followups.length, 0)
})

test('invalid, blank, unsupported, unchanged, running and queued edits never create a branch', async () => {
  const h = harness()
  for (const seq of [-1, 0, 1.5, NaN, 999, 4]) await assert.rejects(h.provider.edit('source', seq, 'Change'))
  for (const text of ['', ' \n ', null, 123]) await assert.rejects(h.provider.edit('source', h.reply.seq, text))
  assert.deepEqual(await h.provider.edit('source', h.reply.seq, 'The door opens.'), { sessionId: 'source', changed: false })
  h.original.status = 'running'
  await assert.rejects(h.provider.regenerate('source', h.reply.seq), /завершения/)
  h.original.status = 'idle'; h.original.inbox.nextTurn.push({ id: 'pending' })
  await assert.rejects(h.provider.edit('source', h.reply.seq, 'Change'), /очереди/)
  assert.equal(h.forks.length, 0)
})

test('author greetings use the selected text; regeneration requires an actual player reply', async () => {
  const h = harness()
  assert.equal((await h.provider.inspect('source', 3)).text, 'Chosen opening')
  assert.equal((await h.provider.inspect('source', 3)).canRegenerate, false)
  await assert.rejects(h.provider.regenerate('source', 3), /приветствие/)
  const result = await h.provider.edit('source', 3, 'My manually changed opening.', 'branch')
  assert.deepEqual(h.agents.get(result.sessionId).session.deriveMessages().at(-1).content,
    [{ type: 'text', text: 'My manually changed opening.' }])
  const child = h.agents.get(result.sessionId)
  const opening = child.session.snapshotEvents().find(event => event.type === 'assistant/message')
  assert.equal(opening.data.turn, 1)
  assert.equal((await h.provider.inspect(child.id, opening.seq)).canRegenerate, false)
  const reedited = await h.provider.edit(child.id, opening.seq, 'My second opening.', 'branch')
  assert.equal(h.agents.get(reedited.sessionId).session.snapshotEvents().find(event => event.type === 'assistant/message').data.turn, 1)
})

test('editing and re-editing an opening preserve its logged preset, including explicit no-preset mode', async () => {
  for (const preset of [{ id: 'deleted-preset', name: 'Deleted preset', instructions: 'Retain these exact instructions.' }, null]) {
    const h = harness()
    h.source.append('user/message', presetSelectionMessage(preset, 'preset-selection'), { surfaceOp: 'append' })
    const before = h.source.snapshotEvents()
    const result = await h.provider.edit('source', 3, 'My revised opening.', 'branch')
    const child = h.agents.get(result.sessionId)
    assert.deepEqual(readPresetSelection(child.session.snapshotEvents()), preset)
    assert.deepEqual(h.source.snapshotEvents(), before)
    const reopened = Session.create(child.id, child.session.snapshotEvents(), child.session.header, child.session.inheritedEventCount)
    assert.deepEqual(readPresetSelection(reopened.snapshotEvents()), preset)
    const opening = child.session.snapshotEvents().find(event => event.type === 'assistant/message')
    const second = await h.provider.edit(child.id, opening.seq, 'My second revision.', 'branch')
    assert.deepEqual(readPresetSelection(h.agents.get(second.sessionId).session.snapshotEvents()), preset)
    assert.equal(child.session.snapshotEvents().find(event => event.type === 'turn/start').data.turn, 1)
  }
})

test('a lost source, missing character and concurrent maintenance refuse mutations', async () => {
  const h = harness()
  await assert.rejects(h.provider.edit('missing', h.reply.seq, 'Change'), /закрыт/)
  h.characters.state = async () => null
  await assert.rejects(h.provider.edit('source', h.reply.seq, 'Change'), /персонажа/)
  let release
  h.characters.state = () => new Promise(resolve => { release = () => resolve({ character: {} }) })
  const first = h.provider.edit('source', h.reply.seq, 'First edit')
  await assert.rejects(h.provider.edit('source', h.reply.seq, 'Second edit'), /сохранения/)
  release(); await first
})

test('a cold chat is resumed through the native Controller before reading or editing', async () => {
  const h = harness()
  h.agents.delete('source')
  let resumed = 0
  h.ctx.sessionController.resolveAgent = async id => {
    assert.equal(id, 'source'); resumed++; h.agents.set(id, h.original)
    return { agent: h.original }
  }
  assert.equal((await h.provider.inspect('source', h.reply.seq)).text, 'The door opens.')
  assert.equal(resumed, 1)
  await h.provider.edit('source', h.reply.seq, 'Edited after reopening.')
  assert.equal(resumed, 1)
})

test('the logged pending model selection overrides old runtime options and retains reasoning effort', async () => {
  const h = harness()
  h.source.append('model/selection', { provider: 'new-route', model: 'new-model', reasoningEffort: 'high' })
  await h.provider.edit('source', h.reply.seq, 'Changed.', 'branch')
  assert.deepEqual(h.creations[0].agentOptions, { provider: 'new-route', model: 'new-model', reasoningEffort: 'high' })
  assert.deepEqual(h.creations[0].seed.at(-1).data, h.creations[0].agentOptions)
})

test('tool-call settlements and subagent sessions are not editable human dialogue', async () => {
  const h = harness()
  h.source.append('turn/start', { turn: 3 })
  h.source.append('step/start', { turn: 3, step: 1 })
  const tool = h.source.append('assistant/message', { turn: 3, step: 1, stream: [], message: {
    id: 'tool-step', role: 'assistant', source: { kind: 'model', provider: 'actual', model: 'selected' },
    content: [{ type: 'text', text: 'I roll.' }, { type: 'tool-call', id: 'call', name: 'rollDice', arguments: '{}' }],
  } }, { surfaceOp: 'append' })
  await assert.rejects(h.provider.edit('source', tool.seq, 'Fake result'), /инструментов/)
  assert.equal(h.forks.length, 0)
  h.original.session = Session.create('source', undefined, { version: 4, id: 'source', createdAt: 1, delegationDepth: 1, isSeeded: false, origin: 'subagent' })
  await assert.rejects(h.provider.edit('source', h.reply.seq, 'Fake result'), /персонажа/)
})

test('failed regeneration persistence never queues a model call and releases maintenance for recovery', async () => {
  const h = harness(), before = h.source.snapshotEvents()
  h.ctx.sessions.flush = async () => { throw new Error('Disk unavailable') }
  await assert.rejects(h.provider.regenerate('source', h.reply.seq), /Disk unavailable/)
  assert.deepEqual(h.source.snapshotEvents().slice(0, before.length), before)
  assert.equal(h.original.followups.length, 0)
  assert.equal(h.provider.changing.size, 0)
  assert.deepEqual(h.forks, [])
})

test('an authored branch releases its temporary owner even when persistence fails', async () => {
  const h = harness(), before = h.source.snapshotEvents()
  h.ctx.sessions.flush = async session => { if (session.id !== 'source') throw new Error('Disk unavailable') }
  await assert.rejects(h.provider.edit('source', h.reply.seq, 'Saved in the new branch.', 'branch'), /Ветка session-.* создана/)
  assert.deepEqual(h.disposed, [h.creations[0].sessionId])
  assert.deepEqual(h.source.snapshotEvents(), before)
  assert.equal(h.provider.changing.size, 0)
})

test('content edits preserve image/file references and never turn tools or reasoning into authored output', () => {
  const image = { type: 'image', attachment: { attachmentId: 'portrait' } }
  const file = { type: 'file', attachment: { attachmentId: 'map' } }
  const content = [image, { type: 'text', text: 'Old' }, file, { type: 'reasoning', text: 'Thought' }, { type: 'tool-call' }]
  assert.deepEqual(editedContent(content, 'New'), [{ type: 'text', text: 'New' }, image, file])
  assert.equal(authoredReply([], 'manual', [{ type: 'text', text: 'New' }], 1).length, 5)
})

test('branch navigation follows native durable lineage and excludes unrelated chats and subagents', () => {
  const snapshot = { ids: ['c', 'unrelated', 'agent', 'a', 'b'], byId: {
    a: { title: 'Original', updatedAt: 1 }, b: { parentId: 'a', title: 'Edited', updatedAt: 2 },
    c: { parentId: 'b', title: 'Regenerated', updatedAt: 3 }, unrelated: {},
    agent: { parentId: 'a', origin: 'subagent' },
  } }
  assert.deepEqual(branchRows(snapshot, 'c').map(row => row.id), ['a', 'b', 'c'])
})
