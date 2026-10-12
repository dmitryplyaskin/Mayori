import { IconButton } from '../../../client/components/icon-button.jsx'
import { Select } from '../../../client/components/select.jsx'
import { blockActive } from '../shared/persona.js'
import { movePersonaNode, removePersonaNode, updatePersonaNode } from './editing.js'

const newNode = type => ({ id: crypto.randomUUID(), type, title: '', enabled: true,
  activation: { auto: false, chatIds: [], characterIds: [], match: '' }, ...(type === 'group' ? { items: [] } : { text: '' }) })

function BlockIcon({ group }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{group
    ? <path d="M3 7V5h7l2 3h9v12H3V7Z" /> : <><path d="M5 3h10l4 4v14H5V3Z" /><path d="M9 11h6M9 15h6" /></>}</svg>
}
function MoveIcon({ down }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={down ? 'M12 4v16M6 14l6 6 6-6' : 'M12 20V4M6 10l6-6 6 6'} /></svg>
}

export function PersonaBlocks({ blocks, onChange, selectedId, onSelect: select, disabled, context = {} }) {
  const entries = blocks.flatMap((node, index) => [{ node, index, siblings: blocks },
    ...(node.type === 'group' ? node.items.map((child, childIndex) => ({ node: child, index: childIndex, siblings: node.items, parent: node })) : [])])
  const selected = entries.find(entry => entry.node.id === selectedId) ?? entries[0]
  const block = selected?.node
  const rule = block?.activation
  const change = patch => onChange(updatePersonaNode(blocks, block.id, patch))
  const activate = patch => change({ activation: { ...rule, ...patch } })
  const add = (type, parent) => {
    const node = newNode(type)
    onChange(parent ? updatePersonaNode(blocks, parent.id, { items: [...parent.items, node] }) : [...blocks, node])
    select(node.id)
  }
  const bind = (key, id) => { if (id) activate({ [key]: [...new Set([...rule[key], id])] }) }
  return <div className="mayori-persona-block-workspace">
    <aside className="mayori-persona-block-outline" aria-label="Список блоков">
      <div className="mayori-persona-block-add">
        <button type="button" disabled={disabled} onClick={() => add('item')}>Добавить блок</button>
        <button type="button" disabled={disabled} onClick={() => add('group')}>Добавить группу</button>
      </div>
      {!!entries.length && <div className="mayori-persona-block-select"><Select aria-label="Выбрать блок" value={block.id} disabled={disabled} onChange={select} options={entries.map(({ node, parent }) => ({ value: node.id,
        label: `${parent ? `${parent.title || 'Группа'} / ` : ''}${node.title || (node.type === 'group' ? 'Новая группа' : 'Новый блок')}` }))} /></div>}
      <ol className="mayori-persona-block-list">{entries.map(({ node, parent }) => {
        const active = blockActive(node, context) && (!parent || blockActive(parent, context))
        return <li key={node.id} data-nested={!!parent}>
          <button type="button" disabled={disabled} aria-pressed={block?.id === node.id} onClick={() => select(node.id)}>
            <span className="mayori-persona-node-kind"><BlockIcon group={node.type === 'group'} /></span>
            <span><strong>{node.title || (node.type === 'group' ? 'Новая группа' : 'Новый блок')}</strong>
              <small>{node.activation.auto ? 'Авто · ' : ''}{active ? 'Включён' : 'Выключен'}{node.type === 'group' ? ` · ${node.items.length}` : ''}</small></span>
          </button>
        </li>
      })}</ol>
      {!entries.length && <p className="mayori-persona-empty">Добавьте одежду, биографию или детали сцены отдельным блоком.</p>}
    </aside>
    {block ? <div className="mayori-persona-block-inspector" key={block.id}>
      <div className="mayori-persona-block-toolbar">
        <label className="mayori-persona-check"><input type="checkbox" disabled={disabled || rule.auto} checked={block.enabled} onChange={event => change({ enabled: event.target.checked })} />Включён</label>
        <IconButton label="Переместить выше" portal disabled={disabled || selected.index === 0} onClick={() => onChange(movePersonaNode(blocks, block.id, -1))}><MoveIcon /></IconButton>
        <IconButton label="Переместить ниже" portal disabled={disabled || selected.index === selected.siblings.length - 1} onClick={() => onChange(movePersonaNode(blocks, block.id, 1))}><MoveIcon down /></IconButton>
        <button type="button" disabled={disabled} onClick={() => {
          const next = entries[entries.indexOf(selected) + 1]?.node.id
          onChange(removePersonaNode(blocks, block.id)); select(next ?? null)
        }}>Удалить {block.type === 'group' ? 'группу' : 'блок'}</button>
      </div>
      <label>Название {block.type === 'group' ? 'группы' : 'блока'}<input maxLength={200} disabled={disabled} value={block.title} onChange={event => change({ title: event.target.value })} /></label>
      {block.type === 'item' ? <label className="mayori-persona-long-text">Текст блока<textarea rows={10} maxLength={32000} disabled={disabled} value={block.text} onChange={event => change({ text: event.target.value })} /></label>
        : <div className="mayori-persona-group-content"><p>Блоков в группе: {block.items.length}</p><button type="button" disabled={disabled} onClick={() => add('item', block)}>Добавить блок в группу</button></div>}
      <details className="mayori-persona-activation" open={rule.auto}>
        <summary>Автоматическая активация</summary>
        <label className="mayori-persona-check"><input type="checkbox" disabled={disabled} checked={rule.auto} onChange={event => activate({ auto: event.target.checked })} />Включать по условиям</label>
        {rule.auto && <>
          <label>Текст в описании персонажа<input disabled={disabled} maxLength={500} value={rule.match} onChange={event => activate({ match: event.target.value })} /></label>
          <div className="mayori-persona-actions">
            <button type="button" disabled={disabled || !context.sessionId} onClick={() => bind('chatIds', context.sessionId)}>Добавить текущий чат</button>
            <button type="button" disabled={disabled || !context.characterId} onClick={() => bind('characterIds', context.characterId)}>Добавить текущего персонажа</button>
          </div>
          {['chatIds', 'characterIds'].map(key => rule[key].map(id => <div className="mayori-persona-binding" key={key + id}>
            <span>{key === 'chatIds' ? 'Чат' : 'Персонаж'}: {id === context[key === 'chatIds' ? 'sessionId' : 'characterId'] ? key === 'characterIds' ? context.characterName || 'текущий' : 'текущий' : id}</span>
            <button type="button" disabled={disabled} onClick={() => activate({ [key]: rule[key].filter(value => value !== id) })}>Убрать</button>
          </div>))}
          <p className="mayori-persona-hint">Достаточно любого условия.</p>
        </>}
      </details>
    </div> : <div className="mayori-persona-block-placeholder"><span aria-hidden="true">≡</span><h3>Дополнения к описанию</h3><p>Включайте нужные детали и собирайте их в группы.</p></div>}
  </div>
}
