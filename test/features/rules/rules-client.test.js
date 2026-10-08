import assert from 'node:assert/strict'
import test from 'node:test'
import * as React from 'react'
import * as jsx from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { Context } from '@deepseek-ai/cordis'
import { CryptoDiceProvider } from '../../../src/features/dice/host/provider.js'
import { NumericRulesProvider } from '../../../src/features/rules/host/provider.js'
import { compactCheckResult } from '../../../src/features/rules/shared/result.js'

async function loadCard() {
  const previous = globalThis.window
  let module
  globalThis.window = { __ModuleLoader__: { load(value) { module = value } } }
  try {
    await import(`../../../lib/client.js?rules=${Date.now()}`)
    return module.factory(id => {
      if (id === 'react') return React
      if (id === 'react/jsx-runtime') return jsx
      if (id === 'react-dom') return { createPortal(value) { return value } }
      if (id === '@deepseek-ai/dsh-client-ui-primitives') return {}
      throw new Error(`Unexpected module: ${id}`)
    }).CheckToolCard
  } finally {
    if (previous === undefined) delete globalThis.window
    else globalThis.window = previous
  }
}

test('compact check card shows natural one, modified seven, critical failure and configured effect without disclosure', async t => {
  const Card = await loadCard(), ctx = new Context(); t.after(() => ctx.fiber.dispose())
  new CryptoDiceProvider(ctx, {}, () => 1)
  new NumericRulesProvider(ctx, ctx.mayoriDice, { profiles: [{ id: 'house', version: '1', sides: 20, criticalFailureMax: 1,
    criticalFailureEffects: ['<script>Шум привлекает внимание</script>'] }] })
  const result = { ...ctx.mayoriRules.resolve({ profile: 'house', modifier: 6, target: 5 }), rollId: 'saved-critical' }
  const block = { content: [{ type: 'text', text: JSON.stringify(compactCheckResult(result)) }], meta: { kind: 'mayori-check', result } }
  const html = renderToStaticMarkup(React.createElement(Card, { phase: 'result', block, useDisclosure: () => ({ expanded: false, toggle() {} }), inspect() {} }))
  assert.match(html, /Критический провал/); assert.match(html, /На d20: <strong>1<\/strong>/)
  assert.match(html, /модификатор: \+6 · итог: <strong>7<\/strong>/)
  assert.match(html, /Последствие:/); assert.match(html, /&lt;script&gt;Шум привлекает внимание/)
  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /aria-expanded="false"[^>]+aria-controls=/)
  assert.match(html, /Правила: <bdi>house<\/bdi>, версия <bdi>1<\/bdi>/)
})

test('check card preserves partial errors and raw fallback for unsupported or mismatched records', async t => {
  const Card = await loadCard(), ctx = new Context(); t.after(() => ctx.fiber.dispose())
  const faces = [15, 6, 6]
  new CryptoDiceProvider(ctx, { maxDice: 3 }, () => faces.shift())
  new NumericRulesProvider(ctx, ctx.mayoriDice)
  const result = ctx.mayoriRules.resolve({ profile: 'standard', target: 12, damage: { normal: 'd6!' } })
  const render = (phase, block) => renderToStaticMarkup(React.createElement(Card, { phase, block, useDisclosure: () => ({ expanded: true, toggle() {} }) }))
  const html = render('result', { content: [{ type: 'text', text: JSON.stringify(result) }] })
  assert.match(html, /Есть ошибки/); assert.match(html, /Успех/)
  assert.match(html, /Часть проверки не вычислена/); assert.doesNotMatch(html, /Урон:/)
  result.schemaVersion = 99
  const unknown = render('result', { content: [{ type: 'text', text: JSON.stringify(result) }] })
  assert.match(unknown, /Исходный результат/); assert.doesNotMatch(unknown, /mayori-check-outcome/)
  assert.match(render('preparing', { args: { textPrefix: () => 'Атака' } }), /Готовится проверка/)
  assert.match(render('result', { isError: true, error: { code: 'ABORTED' }, content: [] }), /Проверка прервана/)
})
