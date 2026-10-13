import { tr } from '../../localization/client/service.js'
/** A keyed atomic tool view. DSH owns call pairing, lifecycle and transcript topology. */
import { useId } from 'react'
import { dicePurpose, readDiceResult } from '../shared/result.js'
import { projectDiceGroup } from '../shared/pool.js'

const pathLabel = path => path.map(key => typeof key === 'number' ? `[${key}]` : key).join(' › ')
const errorCopy = message => message === 'Division by zero'
  ? tr("Деление на ноль. Проверьте знаменатель.")
  : message === 'Arithmetic result must be finite and within the safe numeric range'
    ? tr("Результат слишком большой. Проверьте формулу.") : message

function DiceFaces({ dice }) {
  const kept = dice.keptIndices === undefined ? null : new Set(dice.keptIndices)
  const fullText = dice.results.map((face, index) => `${face}${kept && !kept.has(index) ? tr(" (отброшен)") : ''}`).join(', ')
  return <div className="mayori-dice-group">
    <span className="mayori-dice-group-label"><code dir="ltr">{dice.count ?? dice.results.length}d{dice.sides}{dice.explode ? '!' : ''}</code>
      {dice.reroll && <span>{tr("Переброс: {p1}", { p1: dice.reroll.once ? tr("один раз") : tr("пока выполняется правило") })}</span>}
      {dice.keep && <span>{dice.keep.mode === 'highest' ? tr("Лучшие") : tr("Худшие")}: {dice.keep.count}</span>}
    </span>
    <div className="mayori-dice-faces" aria-label={tr("Выпавшие грани")}>
      {dice.results.slice(0, 24).map((face, index) => {
        const dropped = kept && !kept.has(index)
        const Element = dropped ? 's' : 'span'
        const reason = dice.draws?.[index]?.reason
        return <Element key={index} title={reason === 'explode' ? tr("Взрыв") : reason === 'reroll' ? tr("Переброс") : undefined} className={`mayori-dice-face${dropped ? ' mayori-dice-dropped' : ''}`}>
          {reason && reason !== 'initial' && <span className="mayori-dice-sr">{reason === 'explode' ? tr("Взрыв. ") : tr("Переброс. ")}</span>}
          <span className="mayori-dice-sr">{dropped ? tr("Отброшен: ") : tr("Учтён: ")}</span>{face}
        </Element>
      })}
    </div>
    {dice.results.length > 24 && <details className="mayori-dice-all-faces">
      <summary>{tr("Показать все грани ({p1})", { p1: dice.results.length })}</summary><p>{fullText}</p>
    </details>}
  </div>
}

/** Raw content stays accessible when the logged format is unsupported or the tool failed. */
export function DiceToolCard({ phase, block, useDisclosure, inspect }) {
  const id = useId()
  const { expanded, toggle } = useDisclosure()
  const settled = phase === 'result'
  const result = settled && !block.isError ? readDiceResult(block.content, block.meta) : null
  const purpose = result?.purpose ?? dicePurpose(block)
  const interrupted = block.error?.code === 'interrupted' || block.error?.code === 'ABORTED' || block.error?.code === 'ABORTED_BEFORE_DISPATCH'
  const state = !settled ? phase : interrupted ? 'stopped' : block.isError || result?.error || result?.errors?.length ? 'error' : result ? 'ok' : 'raw'
  const status = state === 'preparing' ? tr("Готовится бросок") : state === 'start' ? tr("Бросаем кубики")
    : state === 'stopped' ? tr("Бросок прерван") : state === 'error' ? result?.errors?.length ? tr("Есть ошибки") : tr("Не удалось вычислить") : state === 'raw' ? tr("Исходный результат") : tr("Готово")
  const title = <><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm0 9 9-4M12 12 3 8m9 4v9" />
  </svg><span>{tr("Броски кубиков")}</span><span className="mayori-dice-status">{status}</span></>
  const raw = settled ? (block.content ?? []).map(item => item.type === 'text' ? item.text : JSON.stringify(item, null, 2)).join('\n') : ''
  return <section className="mayori-dice-card" data-state={state} aria-label={tr("Броски кубиков")}>
    <div className="mayori-dice-header">
      {settled ? <button type="button" className="mayori-dice-toggle" aria-expanded={expanded} aria-controls={id} onClick={toggle}>
        {title}<span aria-hidden="true" className="mayori-dice-chevron">{expanded ? '⌃' : '⌄'}</span>
      </button> : <div className="mayori-dice-toggle">{title}</div>}
      {inspect && <button type="button" className="mayori-dice-inspect" onClick={inspect}>{tr("В журнал")}</button>}
    </div>
    {purpose && <p className="mayori-dice-purpose"><bdi>{purpose}</bdi></p>}
    <div id={id}>
    {result && <ul className="mayori-dice-results">
      {(expanded ? result.details : result.details.slice(0, 6)).map(detail => <li key={JSON.stringify(detail.path)}>
        <div className="mayori-dice-result-row">
          <div className="mayori-dice-formula"><span className="mayori-dice-path"><bdi>{pathLabel(detail.path)}</bdi></span>
            <code dir="ltr">{detail.expression}</code></div>
          {detail.error ? <span className="mayori-dice-result-error">{tr("Ошибка")}</span>
            : <strong className="mayori-dice-total"><span className="mayori-dice-sr">{tr("Итог: ")}</span>{typeof detail.value === 'boolean' ? detail.value ? tr("Да") : tr("Нет") : detail.value}</strong>}
        </div>
        {!detail.error && !!detail.dice.length && <p className="mayori-dice-observation">
          {detail.dice.map((dice, index) => {
            const { faces } = projectDiceGroup(dice)
            return <span key={index}>{tr("На d")}{dice.sides}: <bdi>{faces.slice(0, 12).join(', ')}{faces.length > 12 ? `… (${faces.length})` : ''}</bdi></span>
          })}
        </p>}
        {expanded && <div className="mayori-dice-breakdown">{detail.dice.map((dice, index) => <DiceFaces key={index} dice={dice} />)}
          {detail.error && <p className="mayori-dice-error">{errorCopy(detail.error)}</p>}
          {detail.references?.map((ref, index) => <p className="mayori-dice-path" key={`ref-${index}`}>{tr("Использовано: ")}<bdi>{pathLabel(ref.path)}</bdi> = {String(ref.value)}</p>)}
          {detail.decisions?.filter(decision => decision.operator === 'if').map((decision, index) => <p className="mayori-dice-path" key={`if-${index}`}>{tr("Условие: {p1}. Выполнена ветка {p2}.", { p1: decision.condition ? tr("да") : tr("нет"), p2: decision.branch === 'then' ? tr("«тогда»") : tr("«иначе»") })}</p>)}
          {!detail.dice.length && !detail.error && <p className="mayori-dice-path">{tr("Без броска кубиков")}</p>}
        </div>}
      </li>)}
    </ul>}
    {result && !expanded && result.details.length > 6 && <p className="mayori-dice-hint">{tr("Остальные результаты доступны в подробностях.")}</p>}
    {result?.error && <p className="mayori-dice-error">{tr("Вычисление остановлено. Выпавшие грани сохранены в подробностях.")}</p>}
    {!!result?.errors?.length && <p className="mayori-dice-error">{tr("Ошибки отмечены у отдельных полей. Остальные результаты сохранены.")}</p>}
    {settled && <div hidden={!expanded} className="mayori-dice-record">
      {result ? <details><summary>{tr("Показать исходный результат")}</summary><pre>{raw}</pre></details>
        : <><p>{interrupted ? tr("Сохранённые сведения о прерывании:") : block.isError ? tr("Сообщение инструмента:") : tr("Результат сохранён в исходном формате.")}</p>
          <pre>{raw || block.error?.reason || tr("Инструмент не вернул содержимое.")}</pre></>}
    </div>}
    </div>
  </section>
}
