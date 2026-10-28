import { z } from 'zod'
import { CHARACTER_SELECTION_SOURCE, readCharacterOrigin } from '../domain/snapshot.js'

/** DSH's public list projection keeps independent forks grouped without creator metadata. */
export async function registerCharacterLineage(ctx) {
  await ctx.sessionProjections.register({
    key: 'mayoriCharacterLineage', stateVersion: 1, stateSchema: z.string(),
    init: header => header.parentSession ?? header.id,
    apply: (state, event) => {
      if (event.type !== 'agent/inbox/spliced' && !(event.type === 'user/message' && event.data.source?.kind === CHARACTER_SELECTION_SOURCE)) return state
      return readCharacterOrigin([event]) ?? state
    },
    wire: { viewSchema: z.object({ originSessionId: z.string() }), view: originSessionId => ({ originSessionId }) },
  })
}
