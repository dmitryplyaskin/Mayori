/** A closed authored opening turn. The real model begins at the next turn. */
export function greetingSeed(greeting) {
  if (!greeting.text.trim()) return []
  const time = Date.now()
  const events = [
    { type: 'turn/start', data: { turn: 1 } },
    { type: 'step/start', data: { turn: 1, step: 1 } },
    { type: 'system/message', surfaceOp: 'append', data: { turn: 1, step: 1, message: {
      id: `${greeting.messageId}:system`, role: 'system', content: [], source: { kind: 'system-prompt' },
    } } },
    { type: 'assistant/message', surfaceOp: 'append', data: { turn: 1, step: 1, stream: [], message: {
      id: greeting.messageId, role: 'assistant', content: [{ type: 'text', text: greeting.text }],
      source: { kind: 'model', provider: 'mayori-character-card', model: 'authored-greeting' },
    } } },
    { type: 'step/end', data: { turn: 1, step: 1 } },
    { type: 'turn/end', data: { turn: 1, reason: { kind: 'completed' } } },
  ]
  return events.map((event, seq) => ({ ...event, seq, time }))
}
