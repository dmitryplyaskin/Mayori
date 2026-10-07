/** A keyed atomic tool view. DSH owns call pairing, lifecycle and transcript topology. */
import { useId } from 'react'
import { dicePurpose, readDiceResult } from './dice-result.js'

const pathLabel = path => path.map(key => typeof key === 'number' ? `[${key}]` : key).join(' › ')
const errorCopy = message => message === 'Division by zero'
  ? 'Деление на ноль. Проверьте знаменатель.'
  : message === 'Arithmetic result must be finite and within the safe numeric range'
    ? 'Результат слишком большой. Проверьте формулу.' : message

function DiceFaces({ dice }) {
  const kept = dice.keptIndices === undefined ? null : new Set(dice.keptIndices)
  const fullText = dice.results.map((face, index) => `${face}${kept && !kept.has(index) ? ' (отброшен)' : ''}`).join(', ')
  return <div className="mayori-dice-group">
    <span className="mayori-dice-group-label"><code dir="ltr">{dice.count ?? dice.results.length}d{dice.sides}{dice.explode ? '!' : ''}</code>
      {dice.reroll && <span>Переброс: {dice.reroll.once ? 'один раз' : 'пока выполняется правило'}</span>}
      {dice.keep && <span>{dice.keep.mode === 'highest' ? 'Лучшие' : 'Худшие'}: {dice.keep.count}</span>}
    </span>
    <div className="mayori-dice-faces" aria-label="Выпавшие грани">
      {dice.results.slice(0, 24).map((face, index) => {
        const dropped = kept && !kept.has(index)
        const Element = dropped ? 's' : 'span'
        const reason = dice.draws?.[index]?.reason
        return <Element key={index} title={reason === 'explode' ? 'Взрыв' : reason === 'reroll' ? 'Переброс' : undefined} className={`mayori-dice-face${dropped ? ' mayori-dice-dropped' : ''}`}>
          {reason && reason !== 'initial' && <span className="mayori-dice-sr">{reason === 'explode' ? 'Взрыв. ' : 'Переброс. '}</span>}
          <span className="mayori-dice-sr">{dropped ? 'Отброшен: ' : 'Учтён: '}</span>{face}
        </Element>
      })}
    </div>
    {dice.results.length > 24 && <details className="mayori-dice-all-faces">
      <summary>Показать все грани ({dice.results.length})</summary><p>{fullText}</p>
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
  const status = state === 'preparing' ? 'Готовится бросок' : state === 'start' ? 'Бросаем кубики'
    : state === 'stopped' ? 'Бросок прерван' : state === 'error' ? result?.errors?.length ? 'Есть ошибки' : 'Не удалось вычислить' : state === 'raw' ? 'Исходный результат' : 'Готово'
  const title = <><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="m12 3 9 5v8l-9 5-9-5V8l9-5Zm0 9 9-4M12 12 3 8m9 4v9" />
  </svg><span>Броски кубиков</span><span className="mayori-dice-status">{status}</span></>
  const raw = settled ? (block.content ?? []).map(item => item.type === 'text' ? item.text : JSON.stringify(item, null, 2)).join('\n') : ''
  return <section className="mayori-dice-card" data-state={state} aria-label="Броски кубиков">
    <div className="mayori-dice-header">
      {settled ? <button type="button" className="mayori-dice-toggle" aria-expanded={expanded} aria-controls={id} onClick={toggle}>
        {title}<span aria-hidden="true" className="mayori-dice-chevron">{expanded ? '⌃' : '⌄'}</span>
      </button> : <div className="mayori-dice-toggle">{title}</div>}
      {inspect && <button type="button" className="mayori-dice-inspect" onClick={inspect}>В журнал</button>}
    </div>
    {purpose && <p className="mayori-dice-purpose"><bdi>{purpose}</bdi></p>}
    <div id={id}>
    {result && <ul className="mayori-dice-results">
      {(expanded ? result.details : result.details.slice(0, 6)).map(detail => <li key={JSON.stringify(detail.path)}>
        <div className="mayori-dice-result-row">
          <div className="mayori-dice-formula"><span className="mayori-dice-path"><bdi>{pathLabel(detail.path)}</bdi></span>
            <code dir="ltr">{detail.expression}</code></div>
          {detail.error ? <span className="mayori-dice-result-error">Ошибка</span>
            : <strong className="mayori-dice-total"><span className="mayori-dice-sr">Итог: </span>{typeof detail.value === 'boolean' ? detail.value ? 'Да' : 'Нет' : detail.value}</strong>}
        </div>
        {expanded && <div className="mayori-dice-breakdown">{detail.dice.map((dice, index) => <DiceFaces key={index} dice={dice} />)}
          {detail.error && <p className="mayori-dice-error">{errorCopy(detail.error)}</p>}
          {detail.references?.map((ref, index) => <p className="mayori-dice-path" key={`ref-${index}`}>Использовано: <bdi>{pathLabel(ref.path)}</bdi> = {String(ref.value)}</p>)}
          {detail.decisions?.filter(decision => decision.operator === 'if').map((decision, index) => <p className="mayori-dice-path" key={`if-${index}`}>Условие: {decision.condition ? 'да' : 'нет'}. Выполнена ветка {decision.branch === 'then' ? '«тогда»' : '«иначе»'}.</p>)}
          {!detail.dice.length && !detail.error && <p className="mayori-dice-path">Без броска кубиков</p>}
        </div>}
      </li>)}
    </ul>}
    {result && !expanded && result.details.length > 6 && <p className="mayori-dice-hint">Остальные результаты доступны в подробностях.</p>}
    {result?.error && <p className="mayori-dice-error">Вычисление остановлено. Выпавшие грани сохранены в подробностях.</p>}
    {!!result?.errors?.length && <p className="mayori-dice-error">Ошибки отмечены у отдельных полей. Остальные результаты сохранены.</p>}
    {settled && <div hidden={!expanded} className="mayori-dice-record">
      {result ? <details><summary>Показать исходный результат</summary><pre>{raw}</pre></details>
        : <><p>{interrupted ? 'Сохранённые сведения о прерывании:' : block.isError ? 'Сообщение инструмента:' : 'Результат сохранён в исходном формате.'}</p>
          <pre>{raw || block.error?.reason || 'Инструмент не вернул содержимое.'}</pre></>}
    </div>}
    </div>
  </section>
}
