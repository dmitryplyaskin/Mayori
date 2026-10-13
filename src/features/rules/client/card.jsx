import { tr } from '../../localization/client/service.js'
import { useId } from 'react'
import { dicePurpose } from '../../dice/shared/result.js'
import { readCheckResult } from '../shared/result.js'

const checkOutcomes = () => ({ success: tr("Успех"), failure: tr("Провал"), critical_success: tr("Критический успех"), critical_failure: tr("Критический провал") })
const checkReasons = () => ({
  'natural-critical-success': tr("Выбранная грань попала в диапазон критического успеха."),
  'natural-critical-failure': tr("Выбранная грань попала в диапазон критического провала."),
  'natural-failure': tr("Выбранная грань означает автоматический провал."),
  'target-met': tr("Итог достиг сложности."), 'target-missed': tr("Итог ниже сложности."),
})

/** Show recorded resolution without running rules or rolling again. */
export function CheckToolCard({ phase, block, useDisclosure, inspect }) {
  const outcomes = checkOutcomes(), reasons = checkReasons()
  const id = useId(), { expanded, toggle } = useDisclosure()
  const settled = phase === 'result'
  const result = settled && !block.isError ? readCheckResult(block.content, block.meta) : null
  const stopped = ['interrupted', 'ABORTED', 'ABORTED_BEFORE_DISPATCH'].includes(block.error?.code)
  const state = !settled ? phase : stopped ? 'stopped' : block.isError || result?.errors.length ? 'error' : result ? 'ok' : 'raw'
  const status = state === 'preparing' ? tr("Готовится проверка") : state === 'start' ? tr("Бросаем кубики") : state === 'stopped' ? tr("Проверка прервана")
    : state === 'error' ? tr("Есть ошибки") : state === 'raw' ? tr("Исходный результат") : tr("Готово")
  const purpose = result?.purpose ?? dicePurpose(block)
  const raw = (block.content ?? []).map(item => item.type === 'text' ? item.text : JSON.stringify(item)).join('\n')
  const check = result?.check
  return <section className="mayori-dice-card" data-state={state} aria-label={tr("Игровая проверка")}>
    <div className="mayori-dice-header">
      {settled ? <button type="button" className="mayori-dice-toggle" aria-expanded={expanded} aria-controls={id} onClick={toggle}>
        <span>{tr("Игровая проверка")}</span><span className="mayori-dice-status">{status}</span>
        <span aria-hidden="true">{expanded ? '⌃' : '⌄'}</span>
      </button> : <div className="mayori-dice-toggle"><span>{tr("Игровая проверка")}</span><span className="mayori-dice-status">{status}</span></div>}
      {inspect && <button type="button" className="mayori-dice-inspect" onClick={inspect}>{tr("В журнал")}</button>}
    </div>
    {purpose && <p className="mayori-dice-purpose"><bdi>{purpose}</bdi></p>}
    {check && <div className="mayori-check-summary" data-outcome={check.outcome}>
      <strong className="mayori-check-outcome">{outcomes[check.outcome]}</strong>
      <p>{tr("На d")}{result.rules.sides}: <strong>{check.natural}</strong>{tr(" · модификатор: ")}{check.modifier >= 0 ? '+' : '−'}{Math.abs(check.modifier)}{tr(" · итог: ")}<strong>{check.total}</strong>{tr(" · сложность: ")}{check.target}</p>
      <p>{reasons[check.reason]}</p>
      {result.damage && <p>{tr("Урон: ")}<strong>{result.damage.value}</strong> <code dir="ltr">({result.damage.expression})</code></p>}
      {result.consequence && <p>{tr("Последствие: ")}<bdi>{result.consequence.text}</bdi></p>}
    </div>}
    {!!result?.errors.length && <p className="mayori-dice-error">{tr("Часть проверки не вычислена. Выпавшие грани сохранены; повторного броска не было.")}</p>}
    <div id={id} hidden={!expanded} className="mayori-dice-record">
      {result ? <>
        <p>{tr("Правила: ")}<bdi>{result.rules.id}</bdi>{tr(", версия ")}<bdi>{result.rules.version}</bdi>{tr(". Разница со сложностью: ")}{check?.margin ?? tr("не вычислена")}.</p>
        <details><summary>{tr("Показать полный результат и грани")}</summary><pre>{JSON.stringify(result, null, 2)}</pre></details>
      </> : settled && <pre>{raw || block.error?.reason || tr("Инструмент не вернул результат.")}</pre>}
    </div>
  </section>
}
