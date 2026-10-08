import assert from 'node:assert/strict'
import test from 'node:test'
import { Session } from '@deepseek-ai/dsh-session'
import { buildForkSeed } from '@deepseek-ai/dsh-session/fork'
import { greetingSeed } from '../../../src/features/character-session/host/greeting.js'
import { SessionMessageRevisionProvider } from '../../../src/features/message-revisions/host/provider.js'
import { editedContent, authoredReply, branchRows, MANUAL_PROVIDER } from '../../../src/features/message-revisions/domain/revisions.js'
import { reconstructTrajectoryContext } from '../../../src/features/trajectory/host/context.js'

function harness() {
  const source = Session.create('source', greetingSeed({ messageId: 'greeting', text: 'Original greeting' }))
  source.append('turn/start', { turn: 2 })
  source.append('step/start', { turn: 2, step: 1 })
  const input = source.append('user/message', { id: 'input', role: 'user', source: { kind: 'user' },
    content: [{ type: 'text', text: 'Open the door.' }] }, { surfaceOp: 'append' })
  const reply = source.append('assistant/message', { turn: 2, step: 1, stream: [], message: {
    id: 'reply', role: 'assistant', source: { kind: 'model', provider: 'actual', model: 'selected' },
    content: [{ type: 'reasoning', text: 'A private thought.' }, { type: 'text', text: 'The door opens.' }],
  } }, { surfaceOp: 'append' })
  source.append('step/end', { turn: 2, step: 1 })
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
  return { source, original, input, reply, agents, forks, models, flushes, creations, disposed, attached, ctx, characters, provider }
}

test('manual assistant editing preserves the source and produces a replayable authored branch without a model call', async () => {
  const h = harness(), before = JSON.stringify(h.source.snapshotEvents())
  const result = await h.provider.edit('source', h.reply.seq, '  Дверь остаётся закрытой.\nЯ жду.  ')
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

test('editing a human reply forks before that input and sends the new literal text once', async () => {
  const h = harness(), before = h.source.snapshotEvents()
  const result = await h.provider.edit('source', h.input.seq, 'I leave the door alone.')
  const child = h.agents.get(result.sessionId)
  assert.deepEqual(h.source.snapshotEvents(), before)
  assert.equal(h.forks[0].atSeq, h.input.seq - 1)
  assert.equal(child.followups.length, 1)
  assert.deepEqual(child.followups[0].content, [{ type: 'text', text: 'I leave the door alone.' }])
  assert.notEqual(child.followups[0].id, h.input.data.id)
  assert.deepEqual(child.followups[0].source, { kind: 'user' })
  const history = JSON.stringify(child.session.deriveMessages())
  assert.ok(!history.includes('Open the door.') && !history.includes('The door opens.'))
})

test('regeneration repeats the original player input from its prefix, leaving the old answer untouched', async () => {
  const h = harness()
  const result = await h.provider.regenerate('source', h.reply.seq)
  const child = h.agents.get(result.sessionId)
  assert.equal(h.forks[0].atSeq, h.input.seq - 1)
  assert.deepEqual(child.followups[0].content, h.input.data.content)
  assert.equal(child.followups.length, 1)
  assert.ok(h.source.deriveMessages().some(message => message.id === 'reply'))
  assert.ok(!child.session.deriveMessages().some(message => message.id === 'reply' || message.id === 'input'))
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
  const result = await h.provider.edit('source', 3, 'My manually changed opening.')
  assert.deepEqual(h.agents.get(result.sessionId).session.deriveMessages().at(-1).content,
    [{ type: 'text', text: 'My manually changed opening.' }])
  const child = h.agents.get(result.sessionId)
  const opening = child.session.snapshotEvents().find(event => event.type === 'assistant/message')
  assert.equal(opening.data.turn, 1)
  assert.equal((await h.provider.inspect(child.id, opening.seq)).canRegenerate, false)
  const reedited = await h.provider.edit(child.id, opening.seq, 'My second opening.')
  assert.equal(h.agents.get(reedited.sessionId).session.snapshotEvents().find(event => event.type === 'assistant/message').data.turn, 1)
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
  await h.provider.edit('source', h.reply.seq, 'Changed.')
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

test('model selection failure reports the saved child for recovery and preserves the source', async () => {
  const h = harness(), before = h.source.snapshotEvents()
  h.ctx.sessionController.selectModel = async () => { throw new Error('provider unavailable') }
  await assert.rejects(h.provider.regenerate('source', h.reply.seq), /Ветка child-1 сохранена/)
  assert.deepEqual(h.source.snapshotEvents(), before)
  assert.equal(h.agents.get('child-1').followups.length, 0)
})

test('an authored branch releases its temporary owner even when persistence fails', async () => {
  const h = harness(), before = h.source.snapshotEvents()
  h.ctx.sessions.flush = async session => { if (session.id !== 'source') throw new Error('Disk unavailable') }
  await assert.rejects(h.provider.edit('source', h.reply.seq, 'Saved in the new branch.'), /Ветка session-.* создана/)
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
