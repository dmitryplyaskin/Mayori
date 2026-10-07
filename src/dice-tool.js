/** Preset-scoped native dice tool; its rendered JSON is the durable result. */
import z from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { CryptoDiceProvider, DEFAULT_DICE_CONFIG, resolveDiceConfig } from './dice.js'
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
      + 'Supports dN, NdN, + - * /, parentheses, unary signs, floor(), ceil(), round(); '
      + 'for example {"attack":"d20 + 4","damage":["3d6 + 4","floor(2d8 / 2)"]}. '
      + 'NdN sums N independent dice. Every dice occurrence and leaf rolls independently. '
      + 'Division may be fractional; round explicitly when the rules require it. '
      + 'Returns values in the same shape and details with all rolled faces. '
      + 'If error is present, values is null; inspect the retained draws and do not automatically reroll. '
      + 'Do not invent rolls, reroll to obtain a preferred outcome, or choose voluntary actions for the player. '
      + 'This tool computes numbers; success, failure, and consequences follow the established rules.',
    parameters: {
      rolls: { required: true, oneOf: [
        { type: 'object', additionalProperties: true }, { type: 'array' },
      ], description: 'Nested JSON object or array; each leaf is a dice/arithmetic expression string. No references between leaves.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        values: { type: 'json', required: true },
        details: { type: 'array', required: true, items: {
          type: 'object', additionalProperties: false, properties: {
            path: { type: 'array', required: true, items: { oneOf: [{ type: 'string' }, { type: 'integer' }] } },
            expression: { type: 'string', required: true },
            dice: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
              sides: { type: 'integer', required: true }, results: { type: 'array', required: true, items: { type: 'integer' } },
            } } },
            value: { type: 'number' }, error: { type: 'string' },
          },
        } },
        error: { type: 'object', additionalProperties: false, properties: {
          path: { type: 'array', required: true, items: { oneOf: [{ type: 'string' }, { type: 'integer' }] } },
          message: { type: 'string', required: true },
        } },
      } },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    async execute(args, exec) {
      return ctx.mayoriDice.roll(args.rolls, { signal: exec.signal })
    },
  }))
}

export function apply(ctx, config = {}) {
  const resolved = resolveDiceConfig(config)
  new CryptoDiceProvider(ctx, resolved)
  ctx.inject(['mayoriDice'], registerDiceTool)
}
