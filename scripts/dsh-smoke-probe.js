/** Test-only probe: mount solely in an isolated DSH home, never in a player profile. */
import { randomUUID } from 'node:crypto'

export const inject = ['webServer', 'llm', 'tools', 'sessionController', 'agents', 'sessions', 'mayoriCharacters', 'mayoriCharacterSessions', 'workspaceRegistry']

export function apply(ctx) {
  const requests = []
  const adapter = {
    providerInfo: id => ({ id, name: 'Mayori smoke' }),
    providerRetryPolicy: () => undefined,
    imageRequestPricing: () => undefined,
    listModels: async provider => [{ provider, id: 'smoke', name: 'Smoke' }],
    resolveModel: async (provider, id) => ({ provider, id, name: id }),
    async prepareCall(provider, id) {
      return { model: await this.resolveModel(provider, id), systemPromptUpdate: 'in-history',
        stream: options => this.stream(options) }
    },
    async *stream(options) {
      requests.push({ messages: options.messages, tools: options.tools })
      const last = options.messages.findLast(message => message.role !== 'system' && message.role !== 'developer')
      if (last?.role !== 'tool') {
        const id = randomUUID()
        const args = JSON.stringify({ rolls: { attack: 'd20 + 4', damage: { weapon: '3d6 + 4' }, checks: ['d37', 'floor(2d8 / 2)'] } })
        yield { type: 'block-start', index: 0, blockType: 'tool-call' }
        yield { type: 'tool-call-delta', index: 0, id, name: 'rollDice', argumentsDelta: args }
        yield { type: 'block-end', index: 0, block: { type: 'tool-call', id, name: 'rollDice', arguments: args } }
        yield { type: 'finish', reason: { kind: 'tool-calls' } }
        return
      }
      yield { type: 'block-start', index: 0, blockType: 'text' }
      yield { type: 'text-delta', index: 0, text: 'Welcome to the archive.' }
      yield { type: 'block-end', index: 0, block: { type: 'text', text: 'Welcome to the archive.' } }
      yield { type: 'finish', reason: { kind: 'stop' } }
    },
  }
  ctx.llm.registerAdapter(['mayori-smoke'], adapter)
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: '/_mayori-smoke',
    handler: async (req, res) => {
      try {
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const input = JSON.parse(Buffer.concat(chunks).toString())
        let value
        if (input.action === 'create') {
          const campaign = await ctx.mayoriCharacterSessions.prepareCampaign()
          const workspace = await ctx.workspaceRegistry.create(campaign.path)
          value = { workspaceId: workspace.id, requestCount: requests.length }
        } else if (input.action === 'adopt') {
          value = await ctx.sessionController.create({ sessionId: input.sessionId, workspaceId: input.workspaceId })
        } else if (input.action === 'inspect') {
          const agent = ctx.agents.get(input.sessionId)
          if (!agent) throw new Error('Expected live session')
          value = { messages: agent.session.deriveMessages(), requestCount: requests.length }
        } else if (input.action === 'fork') {
          value = await ctx.sessionController.fork({ sessionId: input.sessionId, atSeq: input.atSeq })
        } else if (input.action === 'turn') {
          await ctx.sessionController.selectModel({ sessionId: input.sessionId, provider: 'mayori-smoke', model: 'smoke' })
          await ctx.sessionController.prompt({ sessionId: input.sessionId, requestId: randomUUID(), mode: 'queue',
            content: [{ type: 'text', text: 'Hello, Aster.' }] }, new AbortController().signal)
          const agent = ctx.agents.get(input.sessionId)
          await agent.whenIdle()
          await ctx.sessions.flush(agent.session)
          value = { messages: agent.session.deriveMessages(), requests, events: agent.session.snapshotEvents(),
            hostHasDiceTool: ctx.tools.get('rollDice') !== undefined,
            header: agent.session.header }
        } else throw new Error('Unknown smoke operation')
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: true, value }))
      } catch (error) {
        res.writeHead(500, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: error.stack ?? String(error) }))
      }
    },
  }), 'mayori: test probe route')
}
