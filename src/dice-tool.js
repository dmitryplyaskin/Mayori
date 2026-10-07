/** Preset-scoped native dice tool; content and presentation metadata are durable. */
import z from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { CryptoDiceProvider, DEFAULT_DICE_CONFIG, resolveDiceConfig } from './dice.js'
import { DICE_RESULT_VERSION } from './dice-result.js'
export { DiceService, CryptoDiceProvider } from './dice.js'

export const name = 'mayori-dice'
export const inject = ['tools']
export const Config = z.object(Object.fromEntries(Object.entries(DEFAULT_DICE_CONFIG)
  .map(([key, value]) => [key, z.number().default(value)])))

/** Consumer can also be mounted against a replacement DiceService provider. */
export function registerDiceTool(ctx) {
  ctx.tools.register(defineTool({
    name: 'rollDice',
    description: 'Roll real numeric dice for established game mechanics. '
      + 'Pass rolls as a nested object or array with expression strings at every leaf. '
      + 'Supports dN, NdN, khK (keep K highest), klK (keep K lowest), + - * /, parentheses, unary signs, floor(), ceil(), round(); '
      + 'for example {"attack":"d20 + 4","damage":["3d6 + 4","floor(2d8 / 2)"]}. '
      + 'NdN sums N independent dice. Every dice occurrence and leaf rolls independently. '
      + 'For advantage use 2d20kh1; for disadvantage use 2d20kl1; 4d6kh3 keeps three highest dice. '
      + 'All faces are recorded, including discarded ones. Optionally state the purpose before rolling. '
      + 'Division may be fractional; round explicitly when the rules require it. '
      + 'Returns values in the same shape. Set details: true to include the full trace with all rolled faces; otherwise details is omitted. '
      + 'If error is present, values is null; consumed draws remain recorded. Do not automatically reroll. '
      + 'Do not invent rolls, reroll to obtain a preferred outcome, or choose voluntary actions for the player. '
      + 'This tool computes numbers; success, failure, and consequences follow the established rules.',
    parameters: {
      purpose: { type: 'string', description: 'Optional brief purpose of this batch, such as a stealth check. State it before rolling.' },
      details: { type: 'boolean', description: 'Include the full trace with expressions, paths and all rolled faces. Defaults to false; the session still records every face.' },
      rolls: { required: true, oneOf: [
        { type: 'object', additionalProperties: true }, { type: 'array' },
      ], description: 'Nested JSON object or array; each leaf is a dice/arithmetic expression string. No references between leaves.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        schemaVersion: { type: 'integer', required: true, const: DICE_RESULT_VERSION },
        purpose: { type: 'string' },
        values: { type: 'json', required: true },
        details: { type: 'array', required: true, items: {
          type: 'object', additionalProperties: false, properties: {
            path: { type: 'array', required: true, items: { oneOf: [{ type: 'string' }, { type: 'integer' }] } },
            expression: { type: 'string', required: true },
            dice: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
              sides: { type: 'integer', required: true }, results: { type: 'array', required: true, items: { type: 'integer' } },
              keep: { type: 'object', additionalProperties: false, properties: {
                mode: { type: 'string', required: true, enum: ['highest', 'lowest'] }, count: { type: 'integer', required: true },
              } },
              keptIndices: { type: 'array', items: { type: 'integer' } },
            } } },
            value: { type: 'number' }, error: { type: 'string' },
          },
        } },
        error: { type: 'object', additionalProperties: false, properties: {
          path: { type: 'array', required: true, items: { oneOf: [{ type: 'string' }, { type: 'integer' }] } },
          message: { type: 'string', required: true },
        } },
      } },
      render: (args, value) => {
        const { details, ...summary } = value
        return [{ type: 'text', text: JSON.stringify(args.details === true ? value : summary) }]
      },
      presentationMeta: (_args, value) => ({ kind: 'mayori-dice', result: value }),
    },
    async execute(args, exec) {
      return ctx.mayoriDice.roll(args.rolls, { signal: exec.signal, purpose: args.purpose })
    },
  }))
}

export function apply(ctx, config = {}) {
  const resolved = resolveDiceConfig(config)
  new CryptoDiceProvider(ctx, resolved)
  ctx.inject(['mayoriDice'], registerDiceTool)
}
