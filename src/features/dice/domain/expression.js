/** Small dice expression language. No evaluation of JavaScript or dynamic code. */
export class DiceError extends Error {
  constructor(code, message) { super(message); this.code = code }
}
export const fail = (code, message) => { throw new DiceError(code, message) }
export const checked = value => {
  if (typeof value !== 'number') fail('type_error', 'Expected a numeric value')
  if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) fail('numeric_range', 'Arithmetic result must be finite and within the safe numeric range')
  return Object.is(value, -0) ? 0 : value
}
export const boolean = value => {
  if (typeof value !== 'boolean') fail('type_error', 'Expected a boolean condition')
  return value
}
export const comparators = ['>', '>=', '<', '<=', '==', '!=']
export function compare(op, a, b) {
  if (op === '==' || op === '!=') {
    if (typeof a !== typeof b) fail('type_error', 'Comparison operands must have the same type')
    return op === '==' ? a === b : a !== b
  }
  checked(a); checked(b)
  return op === '>' ? a > b : op === '>=' ? a >= b : op === '<' ? a < b : a <= b
}
export function calculate(op, a, b) {
  if (comparators.includes(op)) return compare(op, a, b)
  checked(a); checked(b)
  if (op === '/' && b === 0) fail('division_by_zero', 'Division by zero')
  return checked(op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b)
}
function alwaysMatches(op, threshold, sides) {
  if (op === '<') return sides < threshold
  if (op === '<=') return sides <= threshold
  if (op === '>') return 1 > threshold
  if (op === '>=') return 1 >= threshold
  if (op === '==') return sides === 1 && threshold === 1
  return !Number.isInteger(threshold) || threshold < 1 || threshold > sides
}
export function parseExpression(source, config) {
  if (!source.trim() || source.length > config.maxExpressionLength) fail('invalid_expression', `Expression must contain 1 to ${config.maxExpressionLength} characters`)
  let position = 0, token, nesting = 0, diceCount = 0
  const references = []
  const syntax = message => fail('invalid_expression', `${message} at position ${token?.start + 1 || position + 1}`)
  function next() {
    while (position < source.length && /\s/.test(source[position])) position++
    const start = position, rest = source.slice(position)
    if (!rest) { token = { kind: 'end', start }; return }
    const matches = [
      ['number', /^(?:\d+(?:\.\d+)?|\.\d+)/], ['string', /^"(?:[^"\\\r\n]|\\.)*"/],
      ['reference', /^\$[A-Za-z_][A-Za-z0-9_]*/],
      ['name', /^(?:floor|ceil|round|max|min|count|ref|if|true|false|and|or|not)\b/],
      ['modifier', /^(?:kh|kl|ro|r)/i], ['operator', /^(?:>=|<=|==|!=)/], ['operator', /^[dD+\-*/()!,\[\]<>]/],
    ]
    for (const [kind, pattern] of matches) {
      const match = pattern.exec(rest)
      if (!match) continue
      const raw = match[0]; position += raw.length
      token = { kind: ['operator', 'modifier', 'name'].includes(kind) ? raw.toLowerCase() : kind, raw, start }; return
    }
    fail('invalid_expression', `Unexpected character at position ${start + 1}`)
  }
  function expect(kind) { if (token.kind !== kind) syntax(`Expected ${kind}`); const old = token; next(); return old }
  function nested(parse) {
    if (++nesting > config.maxExpressionDepth) fail('invalid_expression', `Expression exceeds nesting depth ${config.maxExpressionDepth}`)
    try { return parse() } finally { nesting-- }
  }
  function integer(maximum, label) {
    const raw = expect('number').raw, value = Number(raw)
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < 1 || value > maximum) fail('invalid_expression', `${label} must be an integer from 1 to ${maximum}`)
    return value
  }
  function predicate() {
    const operator = token.kind
    if (!comparators.includes(operator)) syntax('Expected a comparison')
    next()
    let sign = 1
    if (token.kind === '-' || token.kind === '+') { sign = token.kind === '-' ? -1 : 1; next() }
    return { operator, threshold: checked(sign * Number(expect('number').raw)) }
  }
  function dice(count) {
    expect('d')
    const sides = integer(config.maxSides, 'Dice sides')
    if (!Number.isSafeInteger(count) || count < 1 || count > config.maxDice) fail('invalid_expression', `Dice count must be an integer from 1 to ${config.maxDice}`)
    diceCount += count
    const node = { kind: 'dice', count, sides }
    while (['!', 'r', 'ro', 'kh', 'kl'].includes(token.kind)) {
      if (node.keep) syntax('Keep must be the last modifier')
      if (token.kind === '!') {
        if (node.explode) syntax('Duplicate explosion modifier')
        next(); node.explode = true
        if (sides === 1) fail('invalid_expression', 'd1 cannot explode')
      } else if (token.kind === 'r' || token.kind === 'ro') {
        if (node.reroll) syntax('Duplicate reroll modifier')
        const once = token.kind === 'ro'; next()
        node.reroll = { once, ...predicate() }
        if (!once && alwaysMatches(node.reroll.operator, node.reroll.threshold, sides)) fail('invalid_expression', 'Reroll condition matches every possible face')
      } else {
        const mode = token.kind === 'kh' ? 'highest' : 'lowest'; next()
        node.keep = { mode, count: integer(count, 'Keep count') }
      }
    }
    return node
  }
  function reference(path) {
    if (!path.length || path.length > config.maxDepth) fail('invalid_reference', 'Reference path must name an expression within the tree depth limit')
    references.push(path); return { kind: 'ref', path }
  }
  function primary() {
    if (['+', '-', 'not'].includes(token.kind)) {
      const op = token.kind; next(); return { kind: 'unary', op, child: nested(primary) }
    }
    if (token.kind === '(') { next(); const node = nested(() => expression(0)); expect(')'); return node }
    if (token.kind === 'reference') { const path = [token.raw.slice(1)]; next(); return reference(path) }
    if (token.kind === 'true' || token.kind === 'false') { const value = token.kind === 'true'; next(); return { kind: 'literal', value } }
    if (token.kind === 'ref') {
      next(); expect('('); expect('[')
      const path = []
      do {
        if (token.kind === 'string') {
          let key
          try { key = JSON.parse(token.raw) } catch { syntax('Invalid JSON string in reference') }
          next(); path.push(key)
        } else {
          const raw = expect('number').raw, index = Number(raw)
          if (!/^\d+$/.test(raw) || !Number.isSafeInteger(index)) syntax('Expected a nonnegative array index')
          path.push(index)
        }
        if (token.kind !== ',') break
        next()
      } while (true)
      expect(']'); expect(')'); return reference(path)
    }
    if (['floor', 'ceil', 'round', 'max', 'min', 'if', 'count'].includes(token.kind)) {
      const name = token.kind; next(); expect('(')
      return nested(() => {
        const args = [expression(0)]
        if (name === 'count') {
          expect(','); const test = predicate(); expect(')')
          if (args[0].kind !== 'dice') fail('invalid_expression', 'count expects one dice group, not an arithmetic total or reference')
          return { kind: 'count', pool: args[0], test }
        }
        while (token.kind === ',') { next(); args.push(expression(0)) }
        expect(')')
        if (name === 'if' ? args.length !== 3 : ['max', 'min'].includes(name) ? args.length < 2 : args.length !== 1) fail('invalid_expression', `Invalid argument count for ${name}`)
        return { kind: name === 'if' ? 'if' : 'function', name, args }
      })
    }
    if (token.kind === 'd') return dice(1)
    const raw = expect('number').raw
    if (token.kind === 'd') {
      if (!/^\d+$/.test(raw)) syntax('Dice count must be an integer')
      return dice(Number(raw))
    }
    return { kind: 'literal', value: checked(Number(raw)) }
  }
  const precedence = { or: 1, and: 2, '==': 3, '!=': 3, '>': 3, '>=': 3, '<': 3, '<=': 3, '+': 4, '-': 4, '*': 5, '/': 5 }
  function expression(minimum) {
    let left = primary()
    while ((precedence[token.kind] ?? 0) > minimum) {
      const op = token.kind; next()
      const right = expression(precedence[op])
      left = { kind: 'binary', op, left, right }
    }
    return left
  }
  next(); const ast = expression(0); expect('end')
  const pending = [[ast, 1]]
  while (pending.length) {
    const [node, depth] = pending.pop()
    if (depth > config.maxExpressionDepth) fail('invalid_expression', `Expression exceeds syntax tree depth ${config.maxExpressionDepth}`)
    const children = node.args ?? (node.child ? [node.child] : node.left ? [node.left, node.right] : node.pool ? [node.pool] : [])
    for (const child of children) pending.push([child, depth + 1])
  }
  preflight(ast)
  return { ast, references, diceCount }
}
const UNKNOWN = Symbol('dynamic')
/** Constant arithmetic errors are caught before drawing, except inside an undecided lazy branch. */
function preflight(node) {
  if (node.kind === 'literal') return node.value
  if (['dice', 'ref', 'count'].includes(node.kind)) return UNKNOWN
  if (node.kind === 'if') {
    const test = preflight(node.args[0])
    return test === UNKNOWN ? UNKNOWN : preflight(node.args[boolean(test) ? 1 : 2])
  }
  if (node.kind === 'unary') {
    const value = preflight(node.child)
    return value === UNKNOWN ? UNKNOWN : node.op === 'not' ? !boolean(value) : checked((node.op === '-' ? -1 : 1) * checked(value))
  }
  if (node.kind === 'function') {
    const values = node.args.map(preflight)
    for (const value of values) if (value !== UNKNOWN) checked(value)
    return values.includes(UNKNOWN) ? UNKNOWN : mathFunction(node.name, values)
  }
  const a = preflight(node.left)
  if (node.op === 'and' || node.op === 'or') {
    if (a === UNKNOWN) return UNKNOWN
    boolean(a)
    if (node.op === 'and' ? !a : a) return a
    const b = preflight(node.right); return b === UNKNOWN ? UNKNOWN : boolean(b)
  }
  const b = preflight(node.right)
  if (node.op === '/' && b === 0) fail('division_by_zero', 'Division by zero')
  if (!comparators.includes(node.op)) { if (a !== UNKNOWN) checked(a); if (b !== UNKNOWN) checked(b) }
  return a === UNKNOWN || b === UNKNOWN ? UNKNOWN : calculate(node.op, a, b)
}
export function mathFunction(name, args) {
  args.forEach(checked)
  return checked(name === 'max' ? args.reduce((a, b) => Math.max(a, b)) : name === 'min' ? args.reduce((a, b) => Math.min(a, b)) : Math[name](args[0]))
}
