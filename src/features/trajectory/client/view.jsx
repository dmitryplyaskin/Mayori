import { tr, noticeText } from '../../localization/client/service.js'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { remapChildProps } from '../../../client/infrastructure/slot-mirror.js'
import { Select } from '../../../client/components/select.jsx'
import { deduplicateViews } from './context.js'
import { contextTrajectorySnapshot } from './snapshot.js'

/** Preserve the native header while removing duplicate tabs from raw slot entries. */
export function TrajectorySessionHeader({ stock: Stock, stockChildren, childPrefix, revisionNavigation: Navigation, revisionNavigationProps, ...props }) {
  const useConversationViews = selector => props.useConversationViews(views => selector(deduplicateViews(views)))
  return <><Stock {...remapChildProps(props, stockChildren, childPrefix)} useConversationViews={useConversationViews} />
    {Navigation && <Navigation sessionId={props.sessionId} {...revisionNavigationProps} />}</>
}

function RequestTrajectory({ stock: Stock, value, ...props }) {
  const stock = props.useTrajectory(state => state)
  const session = props.useSession(state => state)
  const filtered = useMemo(() => contextTrajectorySnapshot(stock, value), [stock, value])
  const scopedSession = useMemo(() => ({ ...session, hasMore: false, loadingOlder: false }), [session])
  const useTrajectory = selector => selector(filtered)
  const useSession = selector => selector(scopedSession)
  return <Stock {...props} useTrajectory={useTrajectory} useSession={useSession} loadOlder={async () => false} />
}

/** Default request-input view; retain the shipped ledger as an explicit alternative. */
export function ContextTrajectory({ stock: Stock, stockChildren, childPrefix, contextFor, ...props }) {
  const [mode, setMode] = useState('context')
  const [selection, setSelection] = useState('latest')
  const context = contextFor(props.sessionId)
  const snapshot = useSyncExternalStore(context.subscribe, context.getSnapshot, context.getSnapshot)
  const latestSeq = props.useTrajectory(state => state.eventNodes.at(-1)?.seq)
  const running = props.useSession(state => state.running)
  const refresh = () => { void context.refresh(selection === 'latest' ? undefined : selection === 'current' ? selection : Number(selection)) }
  useEffect(() => { if (mode === 'context') refresh() }, [context, mode, selection, latestSeq, running])
  const value = snapshot.status === 'ready' ? snapshot.value : null
  const mapped = remapChildProps(props, stockChildren, childPrefix)
  // Tool inspection always goes to the original ledger, where call details live.
  const journal = mode === 'journal' || props.viewRequest?.focus != null
  return <div className="mayori-trajectory">
    <div className="mayori-trajectory-controls">
      <div className="mayori-trajectory-field"><span>{tr("Показывать")}</span><Select aria-label={tr("Показывать")} value={journal ? 'journal' : 'context'} onChange={value => {
        props.completeViewRequest?.(); setMode(value)
      }} options={[{ value: 'context', label: tr("Контекст запроса") }, { value: 'journal', label: tr("Полный журнал") }]} /></div>
      {!journal && <>
        <div className="mayori-trajectory-field"><span>{tr("Запрос")}</span><Select aria-label={tr("Запрос")} value={selection} onChange={setSelection}
          options={[{ value: 'latest', label: tr("Последний запрос") }, { value: 'current', label: tr("Текущий сохранённый контекст") },
            ...(snapshot.value?.requests ?? []).map(request => ({ value: request.seq, label: tr("№{p1} · Ход {p2}, шаг {p3}{p4}", { p1: request.number, p2: request.turn, p3: request.step, p4: request.failed ? tr(" · Неудачная попытка") : '' }) }))]} /></div>
        <button type="button" onClick={refresh} disabled={snapshot.status === 'loading'}>{tr("Обновить")}</button>
      </>}
    </div>
    {journal ? <div className="mayori-trajectory-journal"><Stock {...mapped} /></div> : <div className="mayori-trajectory-context" aria-busy={snapshot.status === 'loading'}>
      {snapshot.status === 'loading' && <p role="status">{tr("Загрузка контекста…")}</p>}
      {snapshot.error && <p role="alert">{noticeText(snapshot.error)}</p>}
      {value && <>
        <p className="mayori-persona-hint">{value.selectedSeq === 'current'
          ? tr("Сохранённые сообщения для следующего запроса. Системный контекст обновится при отправке.")
          : tr("Вход модели на момент этого запроса. Заменённые сообщения и ответ на запрос исключены.")}</p>
        {!value.messages.length && <p>{tr("В чате пока нет сохранённых сообщений.")}</p>}
        <div className="mayori-trajectory-table"><RequestTrajectory key={value.selectedSeq} stock={Stock} {...mapped} value={value} /></div>
      </>}
    </div>}
  </div>
}
