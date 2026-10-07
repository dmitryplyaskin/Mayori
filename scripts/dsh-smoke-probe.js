/** Test-only probe: mount solely in an isolated DSH home, never in a player profile. */
import { randomUUID } from 'node:crypto'

export const inject = ['webServer', 'llm', 'tools', 'settings', 'agentPresets', 'sessionController', 'agents', 'sessions', 'mayoriCharacters', 'mayoriCharacterSessions', 'workspaceRegistry']

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
      const thought = last?.role === 'tool' ? 'Present the recorded dice results.' : 'Use the real dice provider.'
      yield { type: 'block-start', index: 0, blockType: 'reasoning' }
      yield { type: 'reasoning-delta', index: 0, text: thought }
      yield { type: 'block-end', index: 0, block: { type: 'reasoning', text: thought } }
      const names = (options.tools ?? []).map(tool => tool.name)
      const hasDice = names.includes('rollDice'), hasRules = names.includes('resolveCheck')
      if (last?.role !== 'tool' && (hasDice || hasRules)) {
        if (hasDice) for (const [index, details] of [undefined, true].entries()) {
          const id = randomUUID()
          const args = JSON.stringify({ ...(details === undefined ? {} : { details }), purpose: 'Проверка механики бросков', rolls: {
            attack: '2d20kh1 + 4', hit: '$attack >= 15', damage: { weapon: 'if($hit, 4d6!ro<3kh3 + 4, 0)' },
            checks: ['2d20kl1', 'floor(2d8 / 2)', 'd37'], successes: 'count(5d10, >=8)',
            save: 'd20 + 3 >= 14', baseDamage: '3d6', halfDamage: 'if($save, floor($baseDamage / 2), $baseDamage)',
            broken: 'd6!!', dependent: '$broken + 1', isolated: 'd1', skipped: 'if(false,d6!,0)', explosion: 'd6!', reroll: 'd6r<3',
          } })
          yield { type: 'block-start', index: index + 1, blockType: 'tool-call' }
          yield { type: 'tool-call-delta', index: index + 1, id, name: 'rollDice', argumentsDelta: args }
          yield { type: 'block-end', index: index + 1, block: { type: 'tool-call', id, name: 'rollDice', arguments: args } }
        }
        if (hasRules) {
          const checkId = randomUUID(), index = hasDice ? 3 : 1
          const checkArgs = JSON.stringify({ profile: 'd20-critical', purpose: 'Проверка критов', modifier: 6, target: 12,
            damage: { normal: 'd6 + 3', critical: '2d6 + 3' } })
          yield { type: 'block-start', index, blockType: 'tool-call' }
          yield { type: 'tool-call-delta', index, id: checkId, name: 'resolveCheck', argumentsDelta: checkArgs }
          yield { type: 'block-end', index, block: { type: 'tool-call', id: checkId, name: 'resolveCheck', arguments: checkArgs } }
        }
        yield { type: 'finish', reason: { kind: 'tool-calls' } }
        return
      }
      const saved = last?.role === 'tool' ? JSON.parse(last.content[0].text) : null
      if (saved?.rollId && names.includes('getRollDetails')) {
        const promptAt = options.messages.findLastIndex(message => message.source?.kind === 'user')
        const rollIds = options.messages.slice(promptAt + 1).filter(message => message.role === 'tool').flatMap(message => {
          try { const value = JSON.parse(message.content[0].text); return value.rollId ? [value.rollId] : [] } catch { return [] }
        }).slice(-3)
        const id = randomUUID(), args = JSON.stringify({ rollIds: [...rollIds, 'smoke-missing-roll'] })
        yield { type: 'block-start', index: 1, blockType: 'tool-call' }
        yield { type: 'tool-call-delta', index: 1, id, name: 'getRollDetails', argumentsDelta: args }
        yield { type: 'block-end', index: 1, block: { type: 'tool-call', id, name: 'getRollDetails', arguments: args } }
        yield { type: 'finish', reason: { kind: 'tool-calls' } }
        return
      }
      yield { type: 'block-start', index: 1, blockType: 'text' }
      yield { type: 'text-delta', index: 1, text: 'Welcome to the archive.' }
      yield { type: 'block-end', index: 1, block: { type: 'text', text: 'Welcome to the archive.' } }
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
          value = { messages: agent.session.deriveMessages(), events: agent.session.snapshotEvents(), requestCount: requests.length }
        } else if (input.action === 'details') {
          const agent = ctx.agents.get(input.sessionId)
          if (!agent) throw new Error('Expected live session')
          const result = await agent.ctx.tools.execute({ name: 'getRollDetails', callId: randomUUID(),
            arguments: { rollIds: input.rollIds }, agent, signal: new AbortController().signal })
          if (result.isError) throw new Error(result.content[0].text)
          value = JSON.parse(result.content[0].text)
        } else if (input.action === 'fork') {
          value = await ctx.sessionController.fork({ sessionId: input.sessionId, atSeq: input.atSeq })
        } else if (input.action === 'presets') {
          value = { defaultId: ctx.agentPresets.defaultId, presets: await ctx.agentPresets.list(), inventory: await ctx.agentPresets.compositionInventory() }
        } else if (input.action === 'default-preset') {
          const preset = await ctx.agentPresets.resolve(input.preset)
          if (preset.broken) throw new Error(preset.broken)
          await ctx.settings.update('agent-preset-registry', { selectedDefault: preset.id })
          value = { defaultId: ctx.agentPresets.defaultId }
        } else if (input.action === 'turn' || input.action === 'preset-turn') {
          const startRequest = requests.length
          if (input.action === 'preset-turn') {
            const created = await ctx.sessionController.create({ workspaceId: input.workspaceId,
              ...(input.preset ? { agentPreset: input.preset } : {}) })
            input.sessionId = created.sessionId
          }
          await ctx.sessionController.selectModel({ sessionId: input.sessionId, provider: 'mayori-smoke', model: 'smoke' })
          await ctx.sessionController.prompt({ sessionId: input.sessionId, requestId: randomUUID(), mode: 'queue',
            content: [{ type: 'text', text: 'Hello, Aster.' }] }, new AbortController().signal)
          const agent = ctx.agents.get(input.sessionId)
          await agent.whenIdle()
          await ctx.sessions.flush(agent.session)
          value = { sessionId: input.sessionId, messages: agent.session.deriveMessages(),
            requests: requests.slice(startRequest), events: agent.session.snapshotEvents(),
            hostHasDiceTool: ctx.tools.get('rollDice') !== undefined,
            hostHasRulesTool: ctx.tools.get('resolveCheck') !== undefined,
            hostHasRollHistoryTool: ctx.tools.get('getRollDetails') !== undefined,
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
