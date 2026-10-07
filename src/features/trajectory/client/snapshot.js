/** Adapt a reconstructed request to the public stock Trajectory snapshot contract. */
function assistantBlocks(content) {
  return content.map(block => {
    if (block.type === 'text' || block.type === 'reasoning') return { kind: block.type, text: block.text }
    if (block.type === 'image') return block.offloaded ? { kind: 'other', block } : { kind: 'image', attachment: block.attachment }
    if (block.type === 'tool-call') return { kind: 'tool-call', callId: String(block.id), name: block.name, argsRaw: block.arguments }
    return { kind: 'other', block }
  })
}

export function contextTrajectorySnapshot(stock, value) {
  const originals = new Map(stock.eventNodes.map(node => [node.seq, node]))
  const systemPrompts = []
  const eventNodes = []
  for (const item of value.messages) {
    const { seq, message, time, turn, step } = item
    const original = originals.get(seq)
    if (message.role === 'system') {
      systemPrompts.push({ seq, time, turn, step, text: message.content.filter(block => block.type === 'text').map(block => block.text).join(''), update: systemPrompts.length > 0 })
    } else if (message.role === 'assistant') {
      eventNodes.push({ ...original, kind: 'assistant', seq, time, turn, step, messageId: message.id,
        blocks: assistantBlocks(message.content), providerMetadata: { provider: message.source.provider, model: message.source.model } })
    } else if (message.role === 'tool') {
      eventNodes.push({ ...original, kind: 'tool-result', seq, time, callId: String(message.source.callId),
        name: original?.name ?? '', args: original?.args ?? {}, call: original?.call ?? null,
        callTime: original?.callTime ?? null, subCalls: original?.subCalls ?? [],
        content: message.content, isError: message.isError === true })
    } else {
      const kind = message.role === 'user' && message.source.kind === 'user' ? original?.kind === 'steering' ? 'steering' : 'user' : 'context'
      eventNodes.push({ ...original, kind, seq, time, content: message.content, source: message.source,
        ...(kind === 'steering' ? { messageId: message.id } : {}),
        ...(kind === 'context' ? {
          producer: original?.producer ?? { role: 'inject', label: message.source.kind ?? null },
          form: original?.form ?? (['instructions', 'catalog', 'snapshot', 'notice', 'relay', 'recall'].includes(message.source.form) ? message.source.form : null),
        } : {}) })
    }
  }
  const assistantSeqs = new Set(eventNodes.filter(node => node.kind === 'assistant').map(node => node.seq))
  const target = value.selectedSeq === 'current' ? value.requests.at(-1) : value.requests.find(request => request.seq === value.selectedSeq)
  const requests = stock.requests.filter(request => request.purpose === 'assistant' && assistantSeqs.has(request.resultSeq)
    && request.resultSeq !== target?.seq).map(({ promptChange, ...request }) => request)
  if (target) {
    const original = stock.requests.find(request => request.purpose === 'assistant' && request.resultSeq === target.seq)
    const initial = systemPrompts.shift()
    requests.push({ ...original, purpose: 'assistant', turn: target.turn, step: target.step,
      startSeq: original?.startSeq ?? target.startSeq, startedAt: original?.startedAt ?? target.startedAt ?? target.time,
      completedAt: target.time, status: target.failed ? 'error' : 'complete', resultSeq: target.seq,
      ...(value.header ? { prompt: { config: value.header.config, tools: value.header.tools ?? [], system: initial?.text ?? '' } } : {}),
      promptChange: initial && value.header ? { seq: initial.seq, time: initial.time, kind: 'initial' } : undefined,
    })
    if (initial && !value.header) systemPrompts.unshift(initial)
  }
  // An empty request anchor gives the native layout its owning turn without
  // introducing an assistant output or an invented event into the input.
  const partial = target && value.selectedSeq !== 'current' ? { turn: target.turn, step: target.step, blocks: [] } : null
  return { ...stock, eventNodes, systemPrompts, requests, partial, runningCalls: [],
    eventLocations: new Map(eventNodes.flatMap(node => stock.eventLocations.has(node.seq) ? [[node.seq, stock.eventLocations.get(node.seq)]] : [])),
    callSchemas: new Map([...stock.callSchemas, ...(value.header?.tools ?? []).map(tool => [tool.name, tool])]) }
}
