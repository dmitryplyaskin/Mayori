/** Preset-scoped native dice tool; content and presentation metadata are durable. */
import z from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { CryptoDiceProvider } from './provider.js'
import { DEFAULT_DICE_CONFIG, resolveDiceConfig } from './config.js'
import { DICE_RESULT_VERSION } from '../shared/result.js'
export { DiceService } from './service.js'
export { CryptoDiceProvider } from './provider.js'
export const name = 'mayori-dice'
export const inject = ['tools']
export const Config = z.object(Object.fromEntries(Object.entries(DEFAULT_DICE_CONFIG).map(([key, value]) => [key, z.number().default(value)])))
const path = { type: 'array', items: { oneOf: [{ type: 'string' }, { type: 'integer' }] } }
const scalar = { oneOf: [{ type: 'number' }, { type: 'boolean' }, { type: 'null' }] }
const numbers = { type: 'array', items: { type: 'integer' } }
export function registerDiceTool(ctx) {
  ctx.tools.register(defineTool({
    name: 'rollDice',
    description: 'Roll real numeric dice for established game mechanics. Pass rolls as a nested object or array of expression strings. '
      + 'Supports dN, NdN, + - * /, parentheses, unary signs, floor/ceil/round, max/min; khK/klK keep K highest/lowest original dice chains. '
      + '! explodes on the maximum face; ro<3 rerolls each face at most once, r<3 repeatedly; rerolls happen before explosions, keep last. '
      + 'Comparisons > >= < <= == != return booleans and compare totals. count(5d10, >=8) counts qualifying kept dice chains. '
      + 'Boolean true/false, not/and/or and if(condition, then, else) are supported; if and and/or evaluate only the selected branch. '
      + '$attack references the top-level attack result; ref(["checks",0]) references an exact nested path. References reuse results, never reroll; key order does not affect dependency resolution. '
      + 'Example: {"attack":"1d20 + 5","hit":"$attack >= 15","damage":"if($hit, 2d6! + 3, 0)"}. '
      + 'Every explicit dice occurrence rolls independently; dice inside an unselected branch are not drawn. All requested leaves are evaluated, so put conditional dice inside if. '
      + 'Division may be fractional; round explicitly according to the rules. Optionally state purpose before rolling. '
      + 'Returns schemaVersion 2, values with number/boolean leaves, and errors. Failed leaves are null; independent leaves still resolve. '
      + 'Set details: true for full traces; every face, branch and reference remains recorded in the session regardless. '
      + 'Explosion/reroll limits return an error, never a silently truncated total. Do not automatically reroll errors or seek a preferred outcome. '
      + 'Do not choose voluntary actions for the player. These are numeric mechanics; game rules determine success and consequences.',
    parameters: {
      purpose: { type: 'string', description: 'Optional brief purpose stated before rolling.' },
      details: { type: 'boolean', description: 'Include complete traces. Defaults to false; the session still records every draw.' },
      rolls: { required: true, oneOf: [{ type: 'object', additionalProperties: true }, { type: 'array' }], description: 'Nested object/array with expression strings; references name other expression leaves in this same batch.' },
    },
    output: {
      schema: { type: 'object', additionalProperties: false, properties: {
        schemaVersion: { type: 'integer', required: true, const: DICE_RESULT_VERSION }, purpose: { type: 'string' }, values: { type: 'json', required: true },
        errors: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
          path: { ...path, required: true }, code: { type: 'string', required: true }, message: { type: 'string', required: true },
        } } },
        details: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
          path: { ...path, required: true }, expression: { type: 'string', required: true }, value: { ...scalar, required: true }, error: { type: 'string' }, code: { type: 'string' },
          references: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: { path: { ...path, required: true }, value: { ...scalar, required: true } } } },
          decisions: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
            operator: { type: 'string', required: true, enum: ['if', 'and', 'or'] }, condition: { type: 'boolean', required: true }, branch: { type: 'string', required: true, enum: ['then', 'else', 'right', 'short-circuit'] },
          } } },
          dice: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
            sides: { type: 'integer', required: true }, count: { type: 'integer', required: true }, results: { ...numbers, required: true },
            draws: { type: 'array', required: true, items: { type: 'object', additionalProperties: false, properties: {
              drawIndex: { type: 'integer', required: true }, die: { type: 'integer', required: true }, reason: { type: 'string', required: true, enum: ['initial', 'explode', 'reroll'] }, replaces: { type: 'integer' },
            } } },
            explode: { type: 'boolean' }, reroll: { type: 'object', additionalProperties: false, properties: {
              once: { type: 'boolean', required: true }, operator: { type: 'string', required: true, enum: ['>', '>=', '<', '<=', '==', '!='] }, threshold: { type: 'number', required: true },
            } },
            chains: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { indices: { ...numbers, required: true }, value: { type: 'number' } } } },
            keep: { type: 'object', additionalProperties: false, properties: { mode: { type: 'string', required: true, enum: ['highest', 'lowest'] }, count: { type: 'integer', required: true } } },
            keptIndices: numbers,
          } } },
        } } },
      } },
      render: (args, value) => { const { details, ...summary } = value; return [{ type: 'text', text: JSON.stringify(args.details === true ? value : summary) }] },
      presentationMeta: (_args, value) => ({ kind: 'mayori-dice', result: value }),
    },
    async execute(args, exec) { return ctx.mayoriDice.roll(args.rolls, { signal: exec.signal, purpose: args.purpose }) },
  }))
}
export function apply(ctx, config = {}) {
  new CryptoDiceProvider(ctx, resolveDiceConfig(config))
  ctx.inject(['mayoriDice'], registerDiceTool)
}
