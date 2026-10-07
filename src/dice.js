/** Preset-scoped numeric dice capability with durable, isolated expression outcomes. */
import { Service } from '@deepseek-ai/cordis'
import { randomInt } from 'node:crypto'
import { DICE_RESULT_VERSION } from './dice-result.js'
import { DiceError, fail, checked, boolean, compare, calculate, mathFunction, parseExpression } from './dice-expression.js'

export const DEFAULT_DICE_CONFIG = Object.freeze({
  maxSides: 1_000_000, maxDice: 1000, maxExpressions: 100, maxDepth: 16,
  maxNodes: 1000, maxExpressionLength: 1024, maxExpressionDepth: 64, maxPurposeLength: 300,
  maxExtraRollsPerDie: 100, maxDependencyDepth: 64,
})
const CONFIG_CEILINGS = Object.freeze({
  maxSides: 1_000_000_000, maxDice: 100_000, maxExpressions: 1000, maxDepth: 64,
  maxNodes: 10_000, maxExpressionLength: 8192, maxExpressionDepth: 128, maxPurposeLength: 2000,
  maxExtraRollsPerDie: 10_000, maxDependencyDepth: 128,
})
export function resolveDiceConfig(config = {}) {
  const resolved = { ...DEFAULT_DICE_CONFIG, ...config }
  for (const key of Object.keys(resolved)) {
    if (!Object.hasOwn(CONFIG_CEILINGS, key)) throw new TypeError(`Unknown dice config field: ${key}`)
    if (!Number.isSafeInteger(resolved[key]) || resolved[key] < 1 || resolved[key] > CONFIG_CEILINGS[key]) throw new TypeError(`${key} must be an integer from 1 to ${CONFIG_CEILINGS[key]}`)
  }
  return Object.freeze(resolved)
}
export class DiceService extends Service {
  constructor(ctx) { super(ctx, 'mayoriDice') }
  roll() { throw new Error('DiceService.roll() is not implemented') }
}
const pathKey = path => JSON.stringify(path)
function compileTree(rolls, config) {
  const budget = { dice: 0, nodes: 0 }, fields = [], byPath = new Map(), ancestors = new Set()
  function visit(value, path) {
    const invalid = message => { throw new TypeError(`rolls${pathKey(path)}: ${message}`) }
    if (++budget.nodes > config.maxNodes) invalid(`Request exceeds ${config.maxNodes} tree nodes`)
    if (path.length > config.maxDepth) invalid(`Tree exceeds depth ${config.maxDepth}`)
    if (typeof value === 'string') {
      if (fields.length >= config.maxExpressions) invalid(`Request exceeds ${config.maxExpressions} expressions`)
      const field = { kind: 'expression', path, expression: value }
      fields.push(field); byPath.set(pathKey(path), field)
      try { Object.assign(field, parseExpression(value, config)); budget.dice += field.diceCount }
      catch (error) { if (!(error instanceof DiceError)) throw error; field.error = error }
      return field
    }
    if (value === null || typeof value !== 'object' || (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value)))) invalid('Expected an object, array, or expression string')
    if (ancestors.has(value)) invalid('Cyclic trees are not supported')
    ancestors.add(value)
    try {
      if (Array.isArray(value)) return { kind: 'array', children: Array.from({ length: value.length }, (_, index) => visit(value[index], [...path, index])) }
      return { kind: 'object', children: Object.entries(value).map(([key, child]) => [key, visit(child, [...path, key])]) }
    } finally { ancestors.delete(value) }
  }
  if (rolls === null || typeof rolls !== 'object') throw new TypeError('rolls must be an object or array of expressions')
  const tree = visit(rolls, [])
  if (!fields.length) throw new TypeError('rolls must contain at least one expression')
  // Includes both branches' initial dice; failed parses never reserve a budget.
  if (budget.dice > config.maxDice) throw new TypeError(`Request exceeds ${config.maxDice} potential initial dice`)
  for (const field of fields) {
    if (field.error) continue
    field.dependencies = []
    for (const path of field.references) {
      const target = byPath.get(pathKey(path))
      if (!target) field.error = new DiceError('invalid_reference', `Reference does not name an expression: ${pathKey(path)}`)
      else field.dependencies.push(target)
    }
  }
  const state = new Map(), depths = new Map()
  // Iterative graph validation bounds stack use and computes the same depth for forward/backward references.
  for (const root of fields) {
    if (root.error || state.get(root) === 2) continue
    const stack = [{ field: root, next: 0 }]
    state.set(root, 1)
    while (stack.length) {
      const frame = stack.at(-1), field = frame.field
      if (frame.next < field.dependencies.length) {
        const child = field.dependencies[frame.next++]
        if (child.error || state.get(child) === 2) continue
        if (state.get(child) === 1) {
          for (const cycle of stack.slice(stack.findIndex(item => item.field === child))) cycle.field.error = new DiceError('reference_cycle', 'Cyclic expression references are not supported')
        } else { state.set(child, 1); stack.push({ field: child, next: 0 }) }
      } else {
        const depth = field.error ? 0 : 1 + field.dependencies.reduce((maximum, child) => Math.max(maximum, depths.get(child) ?? 0), 0)
        if (depth > config.maxDependencyDepth) field.error = new DiceError('dependency_depth', 'Reference chain exceeds dependency depth limit')
        depths.set(field, depth); state.set(field, 2); stack.pop()
      }
    }
  }
  return { tree, fields, byPath }
}
export class CryptoDiceProvider extends DiceService {
  constructor(ctx, config = {}, draw = sides => randomInt(1, sides + 1)) {
    super(ctx)
    this.config = resolveDiceConfig(config)
    // Cordis service receivers are proxies; do not use private fields here.
    this.draw = draw
  }
  roll(rolls, { signal, purpose } = {}) {
    signal?.throwIfAborted()
    if (purpose !== undefined && (typeof purpose !== 'string' || !purpose.trim() || purpose.length > this.config.maxPurposeLength)) throw new TypeError(`purpose must contain 1 to ${this.config.maxPurposeLength} characters`)
    const { tree, fields, byPath } = compileTree(rolls, this.config)
    const traces = new Map(fields.map(field => [field, { path: field.path, expression: field.expression, dice: [], references: [], decisions: [] }]))
    const outcomes = new Map()
    let draws = 0
    const pool = (node, trace) => {
      const group = { sides: node.sides, count: node.count, results: [], draws: [] }
      const modified = !!(node.explode || node.reroll)
      if (modified) group.chains = []
      if (node.explode) group.explode = true
      if (node.reroll) group.reroll = node.reroll
      if (node.keep) group.keep = node.keep
      trace.dice.push(group)
      const chains = []
      for (let die = 0; die < node.count; die++) {
        let extras = 0
        const chain = { indices: [] }
        if (modified) group.chains.push(chain)
        const draw = (reason, replaces) => {
          signal?.throwIfAborted()
          if (reason !== 'initial' && extras >= this.config.maxExtraRollsPerDie) fail('extra_roll_limit', 'Extra roll limit reached; the chain is incomplete')
          if (draws >= this.config.maxDice) fail('dice_limit', 'Request draw limit reached; the result is incomplete')
          const face = this.draw(node.sides)
          if (!Number.isSafeInteger(face) || face < 1 || face > node.sides) throw new Error('Dice provider returned an invalid face')
          const index = group.results.length
          group.results.push(face)
          group.draws.push({ drawIndex: draws++, die, reason, ...(replaces === undefined ? {} : { replaces }) })
          if (reason !== 'initial') extras++
          return index
        }
        let reason = 'initial'
        do {
          let index = draw(reason), rerolled = false
          while (node.reroll && compare(node.reroll.operator, group.results[index], node.reroll.threshold) && (!node.reroll.once || !rerolled)) {
            index = draw('reroll', index); rerolled = true
          }
          chain.indices.push(index)
          if (!node.explode || group.results[index] !== node.sides) break
          reason = 'explode'
        } while (true)
        chain.value = checked(chain.indices.reduce((sum, index) => sum + group.results[index], 0))
        chains.push(chain)
      }
      let kept = chains.map((_, index) => index)
      if (node.keep) kept = kept.sort((a, b) => (node.keep.mode === 'highest' ? chains[b].value - chains[a].value : chains[a].value - chains[b].value) || a - b).slice(0, node.keep.count).sort((a, b) => a - b)
      if (modified || node.keep) group.keptIndices = kept.flatMap(index => chains[index].indices).sort((a, b) => a - b)
      return kept.map(index => chains[index].value)
    }
    const evaluate = (root, trace) => {
      // AST frames are explicit: bounded dependency recursion cannot multiply AST call-stack depth.
      const stack = [{ node: root, step: 0, values: [] }]
      let result
      const push = node => stack.push({ node, step: 0, values: [] })
      const finish = value => { stack.pop(); if (stack.length) stack.at(-1).values.push(value); else result = value }
      while (stack.length) {
        signal?.throwIfAborted()
        const frame = stack.at(-1), node = frame.node
        if (node.kind === 'literal') { finish(node.value); continue }
        if (node.kind === 'dice') { finish(checked(pool(node, trace).reduce((a, b) => a + b, 0))); continue }
        if (node.kind === 'count') { finish(pool(node.pool, trace).filter(value => compare(node.test.operator, value, node.test.threshold)).length); continue }
        if (node.kind === 'ref') {
          const outcome = resolve(byPath.get(pathKey(node.path)))
          if (outcome.error) fail('dependency_failed', 'Referenced expression failed: ' + pathKey(node.path))
          trace.references.push({ path: node.path, value: outcome.value }); finish(outcome.value); continue
        }
        if (node.kind === 'function') {
          if (frame.step < node.args.length) push(node.args[frame.step++])
          else finish(mathFunction(node.name, frame.values))
          continue
        }
        if (node.kind === 'if') {
          if (frame.step === 0) { frame.step = 1; push(node.args[0]) }
          else if (frame.step === 1) {
            const condition = boolean(frame.values[0]); frame.step = 2
            trace.decisions.push({ operator: 'if', condition, branch: condition ? 'then' : 'else' })
            push(node.args[condition ? 1 : 2])
          } else finish(frame.values[1])
          continue
        }
        if (node.kind === 'unary') {
          if (frame.step === 0) { frame.step = 1; push(node.child) }
          else { const value = frame.values[0]; finish(node.op === 'not' ? !boolean(value) : checked((node.op === '-' ? -1 : 1) * checked(value))) }
          continue
        }
        if (frame.step === 0) { frame.step = 1; push(node.left); continue }
        const a = frame.values[0], logical = node.op === 'and' || node.op === 'or'
        if (frame.step === 1) {
          if (logical) {
            boolean(a)
            const short = node.op === 'and' ? !a : a
            trace.decisions.push({ operator: node.op, condition: a, branch: short ? 'short-circuit' : 'right' })
            if (short) { finish(a); continue }
          }
          frame.step = 2; push(node.right)
        } else finish(logical ? boolean(frame.values[1]) : calculate(node.op, a, frame.values[1]))
      }
      return result
    }
    const resolve = field => {
      if (outcomes.has(field)) return outcomes.get(field)
      const trace = traces.get(field)
      try {
        if (field.error) throw field.error
        const value = evaluate(field.ast, trace)
        trace.value = value
        const outcome = { value }; outcomes.set(field, outcome); return outcome
      } catch (error) {
        if (!(error instanceof DiceError)) throw error
        trace.value = null; trace.error = error.message; trace.code = error.code
        const outcome = { error }; outcomes.set(field, outcome); return outcome
      }
    }
    const visit = node => node.kind === 'array' ? node.children.map(visit) : node.kind === 'object'
      ? Object.fromEntries(node.children.map(([key, child]) => [key, visit(child)])) : resolve(node).value ?? null
    const values = visit(tree), details = fields.map(field => traces.get(field))
    const errors = details.filter(detail => detail.error).map(detail => ({ path: detail.path, code: detail.code, message: detail.error }))
    return { schemaVersion: DICE_RESULT_VERSION, ...(purpose === undefined ? {} : { purpose: purpose.trim() }), values, errors, details }
  }
}
