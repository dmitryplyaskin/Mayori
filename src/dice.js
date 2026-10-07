/** Numeric dice capability: bounded expression parsing and real random draws. */
import { Service } from '@deepseek-ai/cordis'
import { randomInt } from 'node:crypto'

export const DEFAULT_DICE_CONFIG = Object.freeze({
  maxSides: 1_000_000,
  maxDice: 1000,
  maxExpressions: 100,
  maxDepth: 16,
  maxNodes: 1000,
  maxExpressionLength: 1024,
  maxExpressionDepth: 64,
})

const CONFIG_CEILINGS = Object.freeze({
  maxSides: 1_000_000_000, maxDice: 100_000, maxExpressions: 1000,
  maxDepth: 64, maxNodes: 10_000, maxExpressionLength: 8192, maxExpressionDepth: 128,
})

export function resolveDiceConfig(config = {}) {
  const resolved = { ...DEFAULT_DICE_CONFIG, ...config }
  for (const key of Object.keys(resolved)) {
    if (!Object.hasOwn(CONFIG_CEILINGS, key)) throw new TypeError(`Unknown dice config field: ${key}`)
    if (!Number.isSafeInteger(resolved[key]) || resolved[key] < 1 || resolved[key] > CONFIG_CEILINGS[key]) {
      throw new TypeError(`${key} must be an integer from 1 to ${CONFIG_CEILINGS[key]}`)
    }
  }
  return Object.freeze(resolved)
}

export class DiceService extends Service {
  constructor(ctx) { super(ctx, 'mayoriDice') }
  roll() { throw new Error('DiceService.roll() is not implemented') }
}

class ArithmeticError extends Error {}

function checked(value) {
  if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    throw new ArithmeticError('Arithmetic result must be finite and within the safe numeric range')
  }
  return Object.is(value, -0) ? 0 : value
}

function calculate(op, left, right) {
  if (op === '+') return checked(left + right)
  if (op === '-') return checked(left - right)
  if (op === '*') return checked(left * right)
  if (right === 0) throw new ArithmeticError('Division by zero')
  return checked(left / right)
}

/** Parse the complete expression before drawing anything; no JavaScript execution. */
function parseExpression(source, config, budget) {
  if (!source.trim() || source.length > config.maxExpressionLength) {
    throw new TypeError(`Expression must contain 1 to ${config.maxExpressionLength} characters`)
  }
  let position = 0, token, nesting = 0
  function next() {
    while (/\s/.test(source[position] ?? '') && position < source.length) position++
    const start = position
    if (position === source.length) { token = { kind: 'end', start }; return }
    const rest = source.slice(position)
    const number = /^(?:\d+(?:\.\d+)?|\.\d+)/.exec(rest)
    const name = /^(floor|ceil|round)\b/.exec(rest)
    if (number) { position += number[0].length; token = { kind: 'number', raw: number[0], start }; return }
    if (name) { position += name[0].length; token = { kind: 'function', raw: name[0], start }; return }
    if (/^[dD+\-*/()]/.test(rest)) { position++; token = { kind: rest[0].toLowerCase(), start }; return }
    throw new TypeError(`Unexpected character at position ${start + 1}`)
  }
  function expect(kind) {
    if (token.kind !== kind) throw new TypeError(`Expected ${kind} at position ${token.start + 1}`)
    const previous = token
    next()
    return previous
  }
  function dice(count) {
    expect('d')
    const sidesToken = expect('number')
    const sides = Number(sidesToken.raw)
    if (!/^\d+$/.test(sidesToken.raw) || !Number.isSafeInteger(sides) || sides < 1 || sides > config.maxSides) {
      throw new TypeError(`Dice sides must be an integer from 1 to ${config.maxSides}`)
    }
    if (!Number.isSafeInteger(count) || count < 1 || count > config.maxDice) {
      throw new TypeError(`Dice count must be an integer from 1 to ${config.maxDice}`)
    }
    budget.dice += count
    if (budget.dice > config.maxDice) throw new TypeError(`Request exceeds ${config.maxDice} dice`)
    return { kind: 'dice', count, sides }
  }
  function nested(parse) {
    if (++nesting > config.maxExpressionDepth) throw new TypeError(`Expression exceeds nesting depth ${config.maxExpressionDepth}`)
    try { return parse() } finally { nesting-- }
  }
  function primary() {
    if (token.kind === '+' || token.kind === '-') {
      const op = token.kind
      next()
      const child = nested(primary)
      return { kind: 'unary', op, child, constant: child.constant === undefined ? undefined : checked(op === '-' ? -child.constant : child.constant) }
    }
    if (token.kind === '(') {
      next()
      const child = nested(() => expression(0))
      expect(')')
      return child
    }
    if (token.kind === 'function') {
      const name = token.raw
      next()
      expect('(')
      const child = nested(() => expression(0))
      expect(')')
      return { kind: 'function', name, child, constant: child.constant === undefined ? undefined : checked(Math[name](child.constant)) }
    }
    if (token.kind === 'd') return dice(1)
    const numeric = expect('number')
    if (token.kind === 'd') {
      if (!/^\d+$/.test(numeric.raw)) throw new TypeError('Dice count must be an integer')
      return dice(Number(numeric.raw))
    }
    return { kind: 'number', constant: checked(Number(numeric.raw)) }
  }
  function expression(minimum) {
    let left = primary()
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 }
    while ((precedence[token.kind] ?? 0) > minimum) {
      const op = token.kind
      next()
      const right = expression(precedence[op])
      if (op === '/' && right.constant === 0) throw new ArithmeticError('Division by zero')
      const constant = left.constant !== undefined && right.constant !== undefined
        ? calculate(op, left.constant, right.constant) : undefined
      left = { kind: 'binary', op, left, right, constant }
    }
    return left
  }
  next()
  const ast = expression(0)
  expect('end')
  const pending = [[ast, 1]]
  while (pending.length) {
    const [node, depth] = pending.pop()
    if (depth > config.maxExpressionDepth) throw new TypeError(`Expression exceeds syntax tree depth ${config.maxExpressionDepth}`)
    if (node.child) pending.push([node.child, depth + 1])
    if (node.left) pending.push([node.left, depth + 1], [node.right, depth + 1])
  }
  return ast
}

function compileTree(rolls, config) {
  const budget = { dice: 0, expressions: 0, nodes: 0 }
  const ancestors = new Set()
  function visit(value, path) {
    const fail = message => { throw new TypeError(`rolls${JSON.stringify(path)}: ${message}`) }
    if (++budget.nodes > config.maxNodes) fail(`Request exceeds ${config.maxNodes} tree nodes`)
    if (path.length > config.maxDepth) fail(`Tree exceeds depth ${config.maxDepth}`)
    if (typeof value === 'string') {
      if (++budget.expressions > config.maxExpressions) fail(`Request exceeds ${config.maxExpressions} expressions`)
      try { return { kind: 'expression', path, expression: value, ast: parseExpression(value, config, budget) } }
      catch (error) { fail(error.message) }
    }
    if (value === null || typeof value !== 'object'
      || (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value)))) {
      fail('Expected an object, array, or expression string')
    }
    if (ancestors.has(value)) fail('Cyclic trees are not supported')
    ancestors.add(value)
    try {
      if (Array.isArray(value)) {
        const children = []
        for (let index = 0; index < value.length; index++) children.push(visit(value[index], [...path, index]))
        return { kind: 'array', children }
      }
      return { kind: 'object', children: Object.entries(value).map(([key, child]) => [key, visit(child, [...path, key])]) }
    } finally { ancestors.delete(value) }
  }
  if (rolls === null || typeof rolls !== 'object') throw new TypeError('rolls must be an object or array of expressions')
  const tree = visit(rolls, [])
  if (budget.expressions === 0) throw new TypeError('rolls must contain at least one expression')
  return tree
}

export class CryptoDiceProvider extends DiceService {
  constructor(ctx, config = {}, draw = sides => randomInt(1, sides + 1)) {
    super(ctx)
    this.config = resolveDiceConfig(config)
    // Cordis traces service receivers with proxies, which cannot access private fields.
    this.draw = draw
  }

  /** Return the same tree plus a complete trace. Runtime arithmetic failure retains consumed draws. */
  roll(rolls, { signal } = {}) {
    signal?.throwIfAborted()
    const tree = compileTree(rolls, this.config)
    const details = []
    let failed
    const evaluate = (node, trace) => {
      signal?.throwIfAborted()
      if (node.constant !== undefined) return node.constant
      if (node.kind === 'dice') {
        const dice = { sides: node.sides, results: [] }
        trace.dice.push(dice)
        for (let index = 0; index < node.count; index++) {
          signal?.throwIfAborted()
          const result = this.draw(node.sides)
          if (!Number.isSafeInteger(result) || result < 1 || result > node.sides) throw new Error('Dice provider returned an invalid face')
          dice.results.push(result)
        }
        return checked(dice.results.reduce((sum, result) => sum + result, 0))
      }
      if (node.kind === 'unary') return checked((node.op === '-' ? -1 : 1) * evaluate(node.child, trace))
      if (node.kind === 'function') return checked(Math[node.name](evaluate(node.child, trace)))
      return calculate(node.op, evaluate(node.left, trace), evaluate(node.right, trace))
    }
    const visit = node => {
      if (node.kind === 'array') return node.children.map(visit)
      if (node.kind === 'object') return Object.fromEntries(node.children.map(([key, child]) => [key, visit(child)]))
      const trace = { path: node.path, expression: node.expression, dice: [] }
      details.push(trace)
      try { trace.value = evaluate(node.ast, trace); return trace.value }
      catch (error) {
        if (!(error instanceof ArithmeticError)) throw error
        trace.error = error.message
        failed = { path: node.path, message: error.message }
        throw error
      }
    }
    try { return { values: visit(tree), details } }
    catch (error) {
      if (!failed) throw error
      return { values: null, details, error: failed }
    }
  }
}
