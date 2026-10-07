import { RollHistoryService } from './service.js'
import { readDiceResult } from '../../dice/shared/result.js'
import { readCheckResult } from '../../rules/shared/result.js'

/** No cache, new journal or randomness: the session log owns every result. */
export class SessionRollHistoryProvider extends RollHistoryService {
  read(session, rollIds) {
    if (!session?.snapshotEvents) throw new TypeError('Read roll details from an active chat.')
    if (!Array.isArray(rollIds) || !rollIds.length || rollIds.length > 20
      || rollIds.some(id => typeof id !== 'string' || !id.trim()) || new Set(rollIds).size !== rollIds.length) {
      throw new TypeError('Provide 1 to 20 distinct rollId values from saved results.')
    }
    const requested = new Set(rollIds), found = new Map(), calls = new Map()
    for (const event of session.snapshotEvents()) {
      if (event.type === 'tool/call' && ['rollDice', 'resolveCheck'].includes(event.data.name)) {
        calls.set(event.data.callId, event.data.name)
      }
      // A model-content rewrite is the same roll, not a second invocation.
      if (event.type !== 'tool/result' || event.surfaceOp?.op === 'replace') continue
      const { message, meta } = event.data
      if (!requested.has(message?.toolCallId)) continue
      const tool = calls.get(message.toolCallId) ?? (meta?.kind === 'mayori-dice' ? 'rollDice' : meta?.kind === 'mayori-check' ? 'resolveCheck' : null)
      if (!tool) continue
      const list = found.get(message.toolCallId) ?? []
      list.push({ ...event.data, tool }); found.set(message.toolCallId, list)
    }
    return { rolls: rollIds.map(rollId => {
      const records = found.get(rollId) ?? []
      if (!records.length) return failure(rollId, 'not_found', 'No saved roll with this rollId in this chat. Do not reroll it.')
      if (records.length !== 1) return failure(rollId, 'ambiguous_id', 'Multiple saved rolls use this rollId.')
      const { message, meta, tool } = records[0]
      const kind = tool === 'rollDice' ? 'mayori-dice' : 'mayori-check'
      const result = meta && meta.kind !== kind ? null : tool === 'rollDice' ? readDiceResult(message.content, meta) : readCheckResult(message.content, meta)
      if (!result || (result.rollId !== undefined && result.rollId !== rollId)) return failure(rollId, 'invalid_record', 'The saved roll is incomplete or inconsistent. Do not reroll it.')
      return { rollId, tool, result }
    }) }
  }
}

function failure(rollId, code, message) { return { rollId, error: { code, message } } }
