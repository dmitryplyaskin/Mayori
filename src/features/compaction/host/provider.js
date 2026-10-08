import BasicCompactionEngine from '@deepseek-ai/dsh-compaction-basic'
import { BlockAssembler, LlmError, contentHasImage, createUserMessage } from '@deepseek-ai/dsh-llm'
import { COMPACTION_SOURCE, readCompactionSettings, validateCompaction } from '../shared/settings.js'

/** Native CompactionEngine provider; DSH owns retention, locking, replacement and replay. */
export class RoleplayCompactionProvider extends BasicCompactionEngine {
  constructor(ctx, options) {
    const settings = validateCompaction(options)
    super(ctx, {
      thresholdRatio: settings.thresholdPercent / 100,
      ...(settings.retainPercent === 0 ? { retainTokens: 0 } : { retainRatio: settings.retainPercent / 100 }),
      maxTokens: settings.maxSummaryTokens, headroomTokens: settings.headroomTokens,
    })
    // Record the auxiliary request's editable input before native selection and locking.
    ctx.on('agent/pre-step', async ({ agent, signal }, next) => {
      if (!signal.aborted) {
        const events = agent.session.snapshotEvents()
        const previous = events.findLast(event => event.type === 'user/message' && event.data.source?.kind === COMPACTION_SOURCE)
        const text = JSON.stringify(settings)
        if (previous?.data.source.sections[0]?.text !== text || previous.data.content.length > 0) {
          const active = previous && agent.session.surface.nodes.includes(previous.seq)
          const message = createUserMessage({
            content: [],
            source: { kind: COMPACTION_SOURCE, form: 'snapshot', sections: [{ name: COMPACTION_SOURCE, text }] },
          })
          // The loop must admit the first system head before any user surface.
          if (agent.session.surface.nodes.length === 0) {
            const decision = await next()
            return decision.kind === 'enter' && decision.messages.length > 0 ? { ...decision, messages: [...decision.messages, message] } : decision
          }
          agent.session.append('user/message', message, active ? { surfaceOp: { op: 'replace', startSeq: previous.seq, endSeq: previous.seq }, sourceEventSeqs: [previous.seq] } : { surfaceOp: 'append' })
        }
      }
      return next()
    }, { prepend: true })
  }

  /** Replace only the documented summarizer hook; every editable instruction comes from the log. */
  async summarize(input, agent, signal) {
    signal?.throwIfAborted()
    const settings = readCompactionSettings(agent.session.snapshotEvents())
    const target = agent.session.requestHeader()?.config ?? agent.options
    if (!target.provider || !target.model) throw new Error('Для сжатия истории нужна выбранная модель.')
    const assembler = new BlockAssembler()
    for await (const chunk of this.ctx.llm.stream({
      provider: target.provider, model: target.model,
      messages: [...input.messages, { role: 'user', content: [{ type: 'text', text: settings.instructions }] }],
      ...(input.tools === undefined ? {} : { tools: [...input.tools] }),
      toolHistory: agent.session.toolHistory(), maxTokens: settings.maxSummaryTokens,
      sessionId: agent.session.id, purpose: 'compaction', ...(signal ? { signal } : {}),
    })) assembler.push(chunk)
    const finish = assembler.finish
    if (finish.kind === 'error' || finish.kind === 'aborted') throw new LlmError(finish.failure.message, finish.failure.code, finish.failure)
    if (finish.kind === 'max-tokens') throw new LlmError('Изложение не завершено: достигнут лимит ответа для сжатия.', 'MAX_TOKENS')
    const rawOutput = assembler.blocks()
    if (contentHasImage(rawOutput)) throw new LlmError('Изложение должно содержать только текст.', 'UNSUPPORTED_CONTENT')
    if (rawOutput.some(block => block.type === 'tool-call')) throw new LlmError('Вместо изложения модель запросила инструмент.', 'UNSUPPORTED_CONTENT')
    const summary = rawOutput.filter(block => block.type === 'text')
    if (!summary.some(block => block.text.trim())) throw new Error('Модель вернула пустое изложение.')
    return { summary, rawOutput, llmStreamCall: true, provider: target.provider, model: target.model,
      maxTokens: settings.maxSummaryTokens, ...(assembler.usage === undefined ? {} : { usage: assembler.usage }) }
  }
}
