import { defineTool } from '@deepseek-ai/dsh-tools'
import { toolPairingBalancedBefore } from '@deepseek-ai/dsh-compaction'
import { readCompactionSettings } from '../shared/settings.js'

/** Select only completed history; the current turn and paired tools stay verbatim. */
function historyRange(session, measurement, retainTokens) {
  const events = session.snapshotEvents(), nodes = session.surface.nodes
  if (measurement.nodes.length !== nodes.length || measurement.nodes.some((node, index) => node.seq !== nodes[index])) {
    throw new Error('Оценка контекста не соответствует текущему журналу.')
  }
  const turn = events.findLast(event => event.type === 'turn/start')
  if (!turn || events.some(event => event.type === 'turn/end' && event.seq > turn.seq)) throw new Error('Инструмент сжатия доступен только во время текущего хода.')
  if (events[nodes[0]]?.type !== 'system/message') throw new Error('В журнале отсутствует защищённый системный префикс.')
  const current = nodes.findIndex((seq, index) => index > 0 && seq > turn.seq && !(events[seq].type === 'user/message' && events[seq].data.content.length === 0))
  if (current < 0) return null
  let keepFrom = nodes.length, retained = 0
  while (keepFrom > 1 && retained < retainTokens) retained += measurement.nodes[--keepFrom].tokens
  keepFrom = Math.min(keepFrom, current)
  while (keepFrom > 1 && !toolPairingBalancedBefore(session, nodes[keepFrom])) keepFrom--
  return keepFrom > 1 ? { start: nodes[1], end: nodes[keepFrom - 1] } : null
}

/** Consumer of the native CompactionEngine; mutation and locking belong to DSH. */
export function registerCompactionTool(ctx) {
  ctx.tools.register(defineTool({
    name: 'compactHistory',
    description: 'Condense older completed turns in this chat using the saved summarization instructions. '
      + 'Use on a player request or at a scene break when older history needs condensation; automatic context-pressure compaction is already enabled. '
      + 'Preserves the current turn and the configured recent-history budget. Returns unchanged when no safe older span is available. '
      + 'Original messages and dice results stay in the log. Never invent events or reroll dice.',
    parameters: {},
    output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    isConcurrencySafe: () => false,
    execute: async (_args, exec) => {
      const agent = exec.agent
      if (!agent?.session) throw new Error('Для сжатия нужен текущий чат.')
      exec.signal.throwIfAborted()
      const settings = readCompactionSettings(agent.session.snapshotEvents())
      const target = agent.session.requestHeader()?.config ?? agent.options
      const info = await ctx.llm.resolveModelInfo(target.provider, target.model, exec.signal)
      const window = info.context?.contextWindow
      const reserved = target.maxTokens ?? info.defaultMaxTokens ?? 0
      if (!Number.isSafeInteger(window) || window <= reserved) throw new Error('Для сжатия нужно доступное окно контекста выбранной модели.')
      const measurement = ctx.tokenMeter.measure(agent.session)
      const range = historyRange(agent.session, measurement, Math.floor((window - reserved) * settings.retainPercent / 100))
      if (!range) return { status: 'unchanged', reason: 'No older completed history outside the retained budget.' }
      const result = await ctx.compaction.compactRegion(range.start, range.end, agent, exec.signal)
      return { status: 'compacted', messages: result.shadowedSeqs.length,
        estimatedTokensFreed: Math.max(0, measurement.totalTokens - ctx.tokenMeter.measure(agent.session).totalTokens) }
    },
  }))
}
