import { IconButton } from '../../../client/components/icon-button.jsx'
import { blockActive } from '../shared/persona.js'

const newNode = type => ({ id: crypto.randomUUID(), type, title: '', enabled: true,
  activation: { auto: false, chatIds: [], characterIds: [], match: '' }, ...(type === 'group' ? { items: [] } : { text: '' }) })

export function PersonaBlocks({ blocks, onChange, disabled, context = {} }) {
  const change = (id, patch) => onChange(blocks.map(block => block.id === id ? { ...block, ...patch } : block))
  const move = (index, offset) => {
    const next = [...blocks]
    ;[next[index], next[index + offset]] = [next[index + offset], next[index]]
    onChange(next)
  }
  return <div className="mayori-persona-blocks">
    {blocks.map((block, index) => {
      const rule = block.activation ?? { auto: false, chatIds: [], characterIds: [], match: '' }
      const activate = patch => change(block.id, { activation: { ...rule, ...patch } })
      const bind = (key, id) => { if (id) activate({ [key]: [...new Set([...(rule[key] ?? []), id])] }) }
      return <details className="mayori-persona-block" key={block.id} open>
        <summary>{block.title || (block.type === 'group' ? 'Группа' : 'Блок')} <small>{rule.auto ? blockActive(block, context) ? 'Авто · включён' : 'Авто · выключен' : block.enabled ? 'Включён' : 'Выключен'}</small></summary>
        <div className="mayori-persona-block-body">
          <div className="mayori-persona-block-toolbar">
            <label className="mayori-persona-check"><input type="checkbox" disabled={disabled || rule.auto} checked={block.enabled} onChange={event => change(block.id, { enabled: event.target.checked })} />Включён</label>
            <IconButton className="mayori-secondary-button" label="Переместить выше" disabled={disabled || index === 0} onClick={() => move(index, -1)}>↑</IconButton>
            <IconButton className="mayori-secondary-button" label="Переместить ниже" disabled={disabled || index === blocks.length - 1} onClick={() => move(index, 1)}>↓</IconButton>
            <button type="button" className="mayori-secondary-button" disabled={disabled} onClick={() => onChange(blocks.filter(item => item.id !== block.id))}>Удалить {block.type === 'group' ? 'группу' : 'блок'}</button>
          </div>
          <label>Название {block.type === 'group' ? 'группы' : 'блока'}<input maxLength={200} disabled={disabled} value={block.title} onChange={event => change(block.id, { title: event.target.value })} /></label>
          {block.type === 'item' && <label>Текст блока<textarea rows={5} maxLength={32000} disabled={disabled} value={block.text} onChange={event => change(block.id, { text: event.target.value })} /></label>}
          <details className="mayori-persona-activation"><summary>Автоматическая активация</summary>
            <label className="mayori-persona-check"><input type="checkbox" disabled={disabled} checked={rule.auto} onChange={event => activate({ auto: event.target.checked })} />Включать по условиям</label>
            {rule.auto && <>
              <label>Текст в описании персонажа<input disabled={disabled} maxLength={500} value={rule.match} onChange={event => activate({ match: event.target.value })} /></label>
              <div className="mayori-persona-actions">
                <button type="button" className="mayori-secondary-button" disabled={disabled || !context.sessionId} onClick={() => bind('chatIds', context.sessionId)}>Добавить текущий чат</button>
                <button type="button" className="mayori-secondary-button" disabled={disabled || !context.characterId} onClick={() => bind('characterIds', context.characterId)}>Добавить текущего персонажа</button>
              </div>
              {['chatIds', 'characterIds'].map(key => (rule[key] ?? []).map(id => <div className="mayori-persona-binding" key={key + id}>
                <span>{key === 'chatIds' ? 'Чат' : 'Персонаж'}: {id === context[key === 'chatIds' ? 'sessionId' : 'characterId'] ? 'текущий' : id}</span>
                <button type="button" className="mayori-secondary-button" disabled={disabled} onClick={() => activate({ [key]: rule[key].filter(value => value !== id) })}>Убрать</button>
              </div>))}
              <p className="mayori-persona-hint">Достаточно любого условия.</p>
            </>}
          </details>
          {block.type === 'group' && <PersonaBlocks blocks={block.items} onChange={items => change(block.id, { items })} disabled={disabled} context={context} />}
        </div>
      </details>
    })}
    <div className="mayori-persona-actions">
      <button type="button" className="mayori-secondary-button" disabled={disabled} onClick={() => onChange([...blocks, newNode('item')])}>Добавить блок</button>
      {/* One folder level keeps prompt order and group gating explicit. */}
    </div>
  </div>
}

export function newPersonaGroup() { return newNode('group') }
