import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { Select } from '../../../client/components/select.jsx'
import { activePresetBlocks, canMovePresetNode, MAX_PRESET_TEXT, presetNodeEntries, presetNodes } from '../shared/tree.js'
import { presetDropPosition } from './drag.js'

function DragHandle() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{[4, 8, 12].flatMap(y => [5, 11].map(x => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" />))}</svg>
}

export function PresetStructureEditor({ editor, disabled }) {
  const id = useId()
  const state = useSyncExternalStore(editor.subscribe, editor.getSnapshot, editor.getSnapshot)
  const { draft, selectedNodeId, collapsed, preview, undo } = state
  const nodes = presetNodes(draft)
  const entries = presetNodeEntries(nodes)
  const selected = entries.find(entry => entry.node.id === selectedNodeId)
  const active = activePresetBlocks(nodes)
  const total = entries.reduce((sum, { node }) => sum + (node.text?.length ?? 0), 0)
  const rootRef = useRef(null)
  const treeScrollerRef = useRef(null)
  const titleRef = useRef(null)
  const dialogRef = useRef(null)
  const dragRef = useRef(null)
  const suppressClick = useRef(false)
  const [drag, setDrag] = useState(null)
  const [moveId, setMoveId] = useState(null)
  const [targetId, setTargetId] = useState(':root')
  const [position, setPosition] = useState('inside')
  const [moveError, setMoveError] = useState('')
  const [dragNotice, setDragNotice] = useState('')
  const moveTarget = entries.find(entry => entry.node.id === targetId)?.node
  const movePositions = targetId === ':root' ? [{ value: 'inside', label: 'В конец основного списка' }]
    : [...(moveTarget?.kind === 'group' ? [{ value: 'inside', label: 'Внутрь группы, в конец' }] : []),
      { value: 'before', label: 'Перед элементом' }, { value: 'after', label: 'После элемента' }]
  const handleFor = nodeId => rootRef.current?.querySelector(`[data-preset-handle="${CSS.escape(nodeId)}"]`)

  useEffect(() => {
    if (!moveId) return
    dialogRef.current.showModal()
    return () => { dialogRef.current?.close() }
  }, [moveId])

  useEffect(() => {
    let frame
    let resetClick
    if (disabled) { setDrag(null); setDragNotice('') }
    const readEntries = () => presetNodeEntries(presetNodes(editor.getSnapshot().draft))
    const targetAt = current => {
      const element = document.elementFromPoint(current.x, current.y)
      const root = rootRef.current
      if (!element || !root?.contains(element)) return null
      if (element.closest('[data-preset-root-drop]')) return { targetId: null, position: 'inside' }
      const row = element.closest('[data-preset-node]')
      const target = readEntries().find(entry => entry.node.id === row?.dataset.presetNode)
      if (!target) return null
      const position = presetDropPosition(target.node.kind, current.y, row.getBoundingClientRect())
      return canMovePresetNode(presetNodes(editor.getSnapshot().draft), current.sourceId, target.node.id, position)
        ? { targetId: target.node.id, position } : null
    }
    const refresh = () => {
      const current = dragRef.current
      if (!current?.active) return
      const rootBounds = rootRef.current.getBoundingClientRect()
      current.drop = targetAt(current)
      setDrag({ sourceId: current.sourceId, title: current.title, drop: current.drop,
        x: Math.max(0, Math.min(rootBounds.width - 180, current.x - rootBounds.left + 12)), y: current.y - rootBounds.top + 12 })
      const target = readEntries().find(entry => entry.node.id === current.drop?.targetId)?.node
      setDragNotice(current.drop
        ? current.drop.position === 'inside' ? `Перенести в ${target ? `«${target.title}»` : 'основной список'}.`
          : `${current.drop.position === 'before' ? 'Вставить перед' : 'Вставить после'} «${target.title}».`
        : 'Выберите место вставки. Группу нельзя вложить в себя или её содержимое.')
    }
    const autoScroll = () => {
      if (!dragRef.current?.active) return
      const current = dragRef.current
      let scrolled = false
      // The tree and page own scroll independently; drag follows their live rows.
      for (const scroller of [treeScrollerRef.current, rootRef.current.closest('.mayori-presets-panel')]) {
        if (!scroller) continue
        const rect = scroller.getBoundingClientRect()
        if (current.x < rect.left || current.x > rect.right) continue
        const delta = current.y < rect.top + 36 ? -10 : current.y > rect.bottom - 36 ? 10 : 0
        if (delta) {
          const before = scroller.scrollTop
          scroller.scrollBy(0, delta)
          scrolled ||= before !== scroller.scrollTop
        }
      }
      if (scrolled) refresh()
      frame = requestAnimationFrame(autoScroll)
    }
    const move = event => {
      const current = dragRef.current
      if (!current || event.pointerId !== current.pointerId || disabled) return
      current.x = event.clientX; current.y = event.clientY
      if (!current.active && Math.hypot(current.x - current.startX, current.y - current.startY) < 6) return
      event.preventDefault()
      if (!current.active) { current.active = true; frame = requestAnimationFrame(autoScroll) }
      refresh()
    }
    const finish = (event, cancel = false) => {
      const current = dragRef.current
      if (!current || (event && event.pointerId !== current.pointerId)) return
      dragRef.current = null
      cancelAnimationFrame(frame)
      if (current.handle.hasPointerCapture(current.pointerId)) current.handle.releasePointerCapture(current.pointerId)
      setDrag(null)
      if (!current.active) return
      suppressClick.current = true
      resetClick = setTimeout(() => { suppressClick.current = false }, 0)
      if (!cancel && !disabled && current.drop) editor.moveNode(current.sourceId, current.drop.targetId, current.drop.position)
      else setDragNotice('Перенос отменён.')
      if (!cancel && current.drop) setDragNotice('')
      requestAnimationFrame(() => handleFor(current.sourceId)?.focus())
    }
    const up = event => finish(event)
    const cancel = event => finish(event, true)
    const key = event => {
      if (event.key === 'Escape' && dragRef.current) { finish(null, true); event.preventDefault() }
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', cancel)
    window.addEventListener('keydown', key)
    return () => {
      cancelAnimationFrame(frame); clearTimeout(resetClick)
      const current = dragRef.current
      if (current?.handle.hasPointerCapture(current.pointerId)) current.handle.releasePointerCapture(current.pointerId)
      dragRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', cancel)
      window.removeEventListener('keydown', key)
    }
  }, [editor, disabled])

  const startDrag = (event, node) => {
    if (disabled || event.button !== 0) return
    const handle = event.currentTarget
    handle.setPointerCapture(event.pointerId)
    dragRef.current = { sourceId: node.id, title: node.title, pointerId: event.pointerId, handle,
      startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, active: false, drop: null }
  }
  const openMove = nodeId => {
    if (suppressClick.current) { suppressClick.current = false; return }
    setTargetId(':root'); setPosition('inside'); setMoveError(''); setMoveId(nodeId)
  }
  const closeMove = () => {
    const previous = moveId
    setMoveId(null)
    requestAnimationFrame(() => handleFor(previous)?.focus())
  }
  const add = kind => {
    editor.addNode(kind)
    requestAnimationFrame(() => { titleRef.current?.focus(); titleRef.current?.select() })
  }
  const renderNodes = (items, ancestors = []) => <ul data-deep={ancestors.length >= 4 || undefined} className={`mayori-preset-tree-list${ancestors.length ? ' mayori-preset-tree-children' : ''}`}>
    {items.map(node => {
      const hiddenBy = ancestors.find(parent => !parent.enabled)
      const drop = drag?.drop?.targetId === node.id ? drag.drop.position : ''
      return <li key={node.id}>
        <div data-preset-node={node.id} className={`mayori-preset-tree-row${selectedNodeId === node.id ? ' is-selected' : ''}${drag?.sourceId === node.id ? ' is-dragging' : ''}${drop ? ` drop-${drop}` : ''}`}>
          <button type="button" className="mayori-preset-drag-handle" disabled={disabled} data-preset-handle={node.id}
            aria-label={`Переместить ${node.title}`} onPointerDown={event => startDrag(event, node)} onClick={() => openMove(node.id)}><DragHandle /></button>
          {node.kind === 'group' ? <button type="button" className="mayori-preset-tree-fold" disabled={disabled} aria-label={`${collapsed.includes(node.id) ? 'Раскрыть' : 'Свернуть'} ${node.title}`}
            aria-expanded={!collapsed.includes(node.id)} aria-controls={`${id}-${node.id}`} onClick={() => editor.toggleGroup(node.id)}>{collapsed.includes(node.id) ? '▸' : '▾'}</button> : <span className="mayori-preset-tree-spacer" />}
          <label className="mayori-preset-node-toggle"><input type="checkbox" disabled={disabled} aria-label={`Включить ${node.title}`} checked={node.enabled} onChange={event => editor.changeNode(node.id, 'enabled', event.target.checked)} /></label>
          <button type="button" className="mayori-preset-tree-pick" disabled={disabled} aria-pressed={selectedNodeId === node.id} onClick={() => editor.selectNode(node.id)}>
            <span className={node.kind === 'group' ? 'mayori-preset-group-title' : ''}>{node.title || 'Без названия'}</span>
            {ancestors.length >= 4 && <small>Уровень {ancestors.length + 1}</small>}
            {hiddenBy && node.enabled && <small>Выключено в «{hiddenBy.title}»</small>}
          </button>
        </div>
        {node.kind === 'group' && <div id={`${id}-${node.id}`} hidden={collapsed.includes(node.id)}>
          {node.children.length ? renderNodes(node.children, [...ancestors, node]) : <p className="mayori-preset-tree-empty">Пустая группа</p>}
        </div>}
      </li>
    })}
  </ul>

  return <div ref={rootRef} className="mayori-preset-structure" onKeyDown={event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !['INPUT', 'TEXTAREA'].includes(event.target.tagName) && undo) { event.preventDefault(); editor.undo() }
  }}>
    <div className="mayori-preset-structure-heading"><div><h3>Инструкции</h3><p>В итог входят {active.length} из {entries.filter(entry => entry.node.kind === 'block').length} блоков · {draft.instructions.length.toLocaleString('ru-RU')} символов в итоге</p></div>
      <button type="button" className="mayori-preset-button" aria-pressed={preview} onClick={() => editor.update({ preview: !preview })}>{preview ? 'Вернуться к редактору' : 'Посмотреть итог'}</button></div>
    <div className="mayori-preset-structure-layout" hidden={preview}>
      <aside className="mayori-preset-structure-tree" aria-label="Структура пресета">
        <div className="mayori-preset-tree-toolbar"><h3>Структура</h3><button type="button" className="mayori-preset-button" disabled={disabled} onClick={() => add('block')}>+ Блок</button><button type="button" className="mayori-preset-button" disabled={disabled} onClick={() => add('group')}>+ Группа</button></div>
        <div ref={treeScrollerRef} className="mayori-preset-tree-scroll">{renderNodes(nodes)}{!nodes.length && <p className="mayori-preset-tree-empty">Нет блоков.</p>}
          <div data-preset-root-drop className={`mayori-preset-root-drop${drag?.drop?.targetId === null ? ' drop-inside' : ''}`}>Конец основного списка</div>
        </div>
      </aside>
      <section className="mayori-preset-node-editor" aria-label="Редактирование выбранного элемента">
        {selected ? <>
          {!!selected.ancestors.length && <p className="mayori-preset-node-path">{selected.ancestors.map(parent => parent.title).join(' / ')}</p>}
          <label className="mayori-preset-node-field">{selected.node.kind === 'group' ? 'Название группы' : 'Название блока'}<input ref={titleRef} name="presetNodeTitle" autoComplete="off" required maxLength={120} value={selected.node.title} disabled={disabled} onChange={event => editor.changeNode(selected.node.id, 'title', event.target.value)} /></label>
          <label className="mayori-preset-node-toggle"><input type="checkbox" disabled={disabled} checked={selected.node.enabled} onChange={event => editor.changeNode(selected.node.id, 'enabled', event.target.checked)} />{selected.node.kind === 'group' ? 'Включить группу' : 'Включить блок'}</label>
          {selected.node.enabled && selected.ancestors.some(parent => !parent.enabled) && <p className="mayori-preset-node-state">Выключена группа «{selected.ancestors.find(parent => !parent.enabled).title}».</p>}
          {selected.node.kind === 'block' ? <div className="mayori-preset-node-field"><label htmlFor={`${id}-text`}>Текст инструкции</label><textarea id={`${id}-text`} name="presetInstructions" maxLength={MAX_PRESET_TEXT} value={selected.node.text} disabled={disabled} onChange={event => editor.changeNode(selected.node.id, 'text', event.target.value)} /></div>
            : <div className="mayori-preset-group-content"><h3>Содержимое группы</h3>{selected.node.children.length ? <ul>{selected.node.children.map(node => <li key={node.id}><button type="button" className="mayori-preset-text-button" onClick={() => editor.selectNode(node.id)}>{node.title}{node.kind === 'group' ? ' · группа' : ''}</button></li>)}</ul> : <p>Пустая группа.</p>}</div>}
          <div className="mayori-preset-node-actions"><button type="button" className="mayori-preset-button" disabled={disabled} onClick={() => editor.duplicateNode(selected.node.id)}>Дублировать</button><button type="button" className="mayori-preset-text-button mayori-preset-delete" disabled={disabled} onClick={() => editor.removeNode(selected.node.id)}>Удалить {selected.node.kind === 'group' ? 'группу' : 'блок'}</button></div>
        </> : <p>Элемент не выбран.</p>}
      </section>
    </div>
    {preview && <section className="mayori-preset-compiled" aria-label="Итоговые инструкции"><h3>Инструкции для модели</h3><pre>{draft.instructions || 'Нет включённых инструкций.'}</pre><details><summary>Из каких блоков собран текст</summary><ol>{active.map(({ node, ancestors }) => <li key={node.id}>{[...ancestors, node].map(node => node.title).join(' / ')}</li>)}</ol></details></section>}
    <p className="mayori-dice-sr" role="status">{dragNotice}</p>
    <div className="mayori-preset-structure-footer"><span className={total > MAX_PRESET_TEXT ? 'mayori-preset-error' : ''}>{total.toLocaleString('ru-RU')} / 64 000 символов во всех блоках</span>{undo && <button type="button" className="mayori-preset-text-button" disabled={disabled} onClick={() => editor.undo()}>Отменить действие</button>}</div>
    {drag && <div className="mayori-preset-drag-ghost" aria-hidden="true" style={{ left: drag.x, top: drag.y }}>{drag.title}</div>}
    <dialog ref={dialogRef} className="mayori-preset-move-dialog" aria-labelledby={`${id}-move-title`} onCancel={event => { event.preventDefault(); closeMove() }}>
      <h3 id={`${id}-move-title`}>Переместить элемент</h3>
      <div className="mayori-preset-node-field"><label htmlFor={`${id}-target`}>Место назначения</label><Select id={`${id}-target`} aria-label="Место назначения" portal={false} value={targetId} onChange={value => {
        setTargetId(value); setMoveError('')
        if (value === ':root') setPosition('inside')
        else if (position === 'inside' && entries.find(entry => entry.node.id === value)?.node.kind !== 'group') setPosition('before')
      }} options={[{ value: ':root', label: 'Основной список' }, ...entries.filter(entry => canMovePresetNode(nodes, moveId, entry.node.id, entry.node.kind === 'group' ? 'inside' : 'before')).map(entry => ({ value: entry.node.id, label: [...entry.ancestors, entry.node].map(node => node.title).join(' / ') }))]} /></div>
      <div className="mayori-preset-node-field"><label htmlFor={`${id}-position`}>Положение</label><Select id={`${id}-position`} aria-label="Положение" portal={false} value={position} onChange={setPosition} options={movePositions} /></div>
      {moveError && <p role="alert" className="mayori-preset-error">{moveError}</p>}
      <div className="mayori-preset-node-actions"><button type="button" className="mayori-preset-button" onClick={closeMove}>Отмена</button><button type="button" className="mayori-preset-button mayori-preset-primary" disabled={disabled} onClick={() => {
        const target = targetId === ':root' ? null : targetId
        if (!canMovePresetNode(nodes, moveId, target, position)) { setMoveError('Выберите группу для вложения или положение перед / после элемента.'); return }
        if (editor.moveNode(moveId, target, position)) closeMove()
      }}>Переместить</button></div>
    </dialog>
  </div>
}
