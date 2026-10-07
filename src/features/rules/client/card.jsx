import { useId } from 'react'
import { dicePurpose } from '../../dice/shared/result.js'
import { readCheckResult } from '../shared/result.js'

const outcomes = { success: 'Успех', failure: 'Провал', critical_success: 'Критический успех', critical_failure: 'Критический провал' }
const reasons = {
  'natural-critical-success': 'Выбранная грань попала в диапазон критического успеха.',
  'natural-critical-failure': 'Выбранная грань попала в диапазон критического провала.',
  'natural-failure': 'Выбранная грань означает автоматический провал.',
  'target-met': 'Итог достиг сложности.', 'target-missed': 'Итог ниже сложности.',
}

/** Show recorded resolution without running rules or rolling again. */
export function CheckToolCard({ phase, block, useDisclosure, inspect }) {
  const id = useId(), { expanded, toggle } = useDisclosure()
  const settled = phase === 'result'
  const result = settled && !block.isError ? readCheckResult(block.content, block.meta) : null
  const stopped = ['interrupted', 'ABORTED', 'ABORTED_BEFORE_DISPATCH'].includes(block.error?.code)
  const state = !settled ? phase : stopped ? 'stopped' : block.isError || result?.errors.length ? 'error' : result ? 'ok' : 'raw'
  const status = state === 'preparing' ? 'Готовится проверка' : state === 'start' ? 'Бросаем кубики' : state === 'stopped' ? 'Проверка прервана'
    : state === 'error' ? 'Есть ошибки' : state === 'raw' ? 'Исходный результат' : 'Готово'
  const purpose = result?.purpose ?? dicePurpose(block)
  const raw = (block.content ?? []).map(item => item.type === 'text' ? item.text : JSON.stringify(item)).join('\n')
  const check = result?.check
  return <section className="mayori-dice-card" data-state={state} aria-label="Игровая проверка">
    <div className="mayori-dice-header">
      {settled ? <button type="button" className="mayori-dice-toggle" aria-expanded={expanded} aria-controls={id} onClick={toggle}>
        <span>Игровая проверка</span><span className="mayori-dice-status">{status}</span>
        <span aria-hidden="true">{expanded ? '⌃' : '⌄'}</span>
      </button> : <div className="mayori-dice-toggle"><span>Игровая проверка</span><span className="mayori-dice-status">{status}</span></div>}
      {inspect && <button type="button" className="mayori-dice-inspect" onClick={inspect}>В журнал</button>}
    </div>
    {purpose && <p className="mayori-dice-purpose"><bdi>{purpose}</bdi></p>}
    {check && <div className="mayori-check-summary" data-outcome={check.outcome}>
      <strong className="mayori-check-outcome">{outcomes[check.outcome]}</strong>
      <p>На d{result.rules.sides}: <strong>{check.natural}</strong> · модификатор: {check.modifier >= 0 ? '+' : '−'}{Math.abs(check.modifier)} · итог: <strong>{check.total}</strong> · сложность: {check.target}</p>
      <p>{reasons[check.reason]}</p>
      {result.damage && <p>Урон: <strong>{result.damage.value}</strong> <code dir="ltr">({result.damage.expression})</code></p>}
      {result.consequence && <p>Последствие: <bdi>{result.consequence.text}</bdi></p>}
    </div>}
    {!!result?.errors.length && <p className="mayori-dice-error">Часть проверки не вычислена. Выпавшие грани сохранены; повторного броска не было.</p>}
    <div id={id} hidden={!expanded} className="mayori-dice-record">
      {result ? <>
        <p>Правила: <bdi>{result.rules.id}</bdi>, версия <bdi>{result.rules.version}</bdi>. Разница со сложностью: {check?.margin ?? 'не вычислена'}.</p>
        <details><summary>Показать полный результат и грани</summary><pre>{JSON.stringify(result, null, 2)}</pre></details>
      </> : settled && <pre>{raw || block.error?.reason || 'Инструмент не вернул результат.'}</pre>}
    </div>
  </section>
}
