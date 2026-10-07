import { defineTool } from '@deepseek-ai/dsh-tools'
import { compactCheckResult } from '../shared/result.js'

export function registerRulesTool(ctx) {
  ctx.tools.register(defineTool({
    name: 'resolveCheck',
    description: 'Resolve an established numeric game check with a configured, versioned rules profile. '
      + 'Returns rollId, natural selected face, modifier, total, target, explicit outcome and reason, plus damage, configured consequence or errors when present. '
      + 'If getRollDetails is enabled, read full saved traces and rules with getRollDetails({rollIds:[rollId]}) only when needed. '
      + 'Advantage/disadvantage selects one of two dice; discarded faces never cause criticals. Criticals depend on the profile, never on the modified total. '
      + 'Declare normal and critical damage formulas before rolling when damage applies; only the applicable branch rolls. '
      + 'Consequences come from the configured profile; random critical-failure tables use real dice. This records resolution without changing HP or campaign state. '
      + 'Use only rules agreed for this action; do not invent a profile, severe consequence or damage formula. Do not reroll errors for a preferred outcome or choose player actions. '
      + 'Configured profiles: ' + JSON.stringify(ctx.mayoriRules.profiles().map(({ id, version, sides, criticalSuccessMin, criticalFailureMax, naturalFailureMax }) =>
        ({ id, version, sides, ...(criticalSuccessMin ? { criticalSuccessMin } : {}), ...(criticalFailureMax ? { criticalFailureMax } : {}), ...(naturalFailureMax ? { naturalFailureMax } : {}) }))),
    parameters: {
      profile: { type: 'string', required: true, description: 'Configured profile id matching the established game rules.' },
      modifier: { type: 'number', description: 'Modifier added to the selected natural face. Defaults to 0.' },
      target: { type: 'number', required: true, description: 'Established difficulty or defense.' },
      mode: { type: 'string', enum: ['normal', 'advantage', 'disadvantage'], description: 'Defaults to normal.' },
      purpose: { type: 'string', description: 'State the purpose before rolling.' },
      details: { type: 'boolean', description: 'Legacy full-output option; prefer getRollDetails for saved traces. Defaults to false.' },
      damage: { type: 'object', additionalProperties: false, properties: {
        normal: { type: 'string', required: true }, critical: { type: 'string', description: 'Required when the profile enables critical success. For 1d6+3 doubled dice use 2d6+3.' },
      } },
    },
    output: {
      schema: { type: 'json' },
      render: (args, value) => [{ type: 'text', text: JSON.stringify(args.details === true ? value : compactCheckResult(value)) }],
      presentationMeta: (_args, value) => ({ kind: 'mayori-check', result: value }),
    },
    execute: async (args, exec) => ({ ...await ctx.mayoriRules.resolve(args, { signal: exec.signal }), rollId: exec.callId }),
  }))
}
