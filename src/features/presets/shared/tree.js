export const MAX_PRESET_NODES = 256
export const MAX_PRESET_DEPTH = 12
export const MAX_PRESET_TEXT = 64000
export const PRESET_COMPILER_VERSION = 1

/** A legacy preset opens as one literal block without rewriting its text. */
export function presetNodes(preset) {
  return preset.nodes ?? [{ id: 'main-instructions', kind: 'block', title: 'Основные инструкции', enabled: true, text: preset.instructions ?? '' }]
}

export function presetNodeEntries(nodes, ancestors = [], result = []) {
  for (const node of nodes) {
    result.push({ node, ancestors, siblings: nodes })
    if (node.kind === 'group') presetNodeEntries(node.children, [...ancestors, node], result)
  }
  return result
}

export function validatePresetNodes(nodes) {
  const ids = new Set()
  let length = 0
  function visit(items, depth) {
    if (!Array.isArray(items)) throw new TypeError('Содержимое группы должно быть списком блоков или групп.')
    if (depth > MAX_PRESET_DEPTH && items.length) throw new TypeError(`Используйте не больше ${MAX_PRESET_DEPTH} уровней вложенности.`)
    return items.map(node => {
      if (!node || !['block', 'group'].includes(node.kind)
        || typeof node.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(node.id) || ids.has(node.id)) {
        throw new TypeError('У каждого блока и группы должен быть уникальный идентификатор.')
      }
      ids.add(node.id)
      if (ids.size > MAX_PRESET_NODES) throw new TypeError(`В пресете может быть не больше ${MAX_PRESET_NODES} блоков и групп.`)
      if (typeof node.title !== 'string' || !node.title.trim() || node.title.length > 120) {
        throw new TypeError('Укажите название каждого блока и группы длиной до 120 символов.')
      }
      if (typeof node.enabled !== 'boolean') throw new TypeError('Укажите, включён ли блок или группа.')
      const base = { id: node.id, kind: node.kind, title: node.title.trim(), enabled: node.enabled }
      if (node.kind === 'group') return { ...base, children: visit(node.children, depth + 1) }
      if (typeof node.text !== 'string') throw new TypeError('Текст блока должен быть строкой.')
      length += node.text.length
      if (length > MAX_PRESET_TEXT) throw new TypeError('Сократите суммарный текст блоков до 64 000 символов, включая выключенные блоки.')
      return { ...base, text: node.text }
    })
  }
  return visit(nodes, 1)
}

/** Version 1: literal block bodies, in depth-first order; titles are UI metadata. */
export function compilePresetNodes(nodes) {
  return activePresetBlocks(nodes).map(({ node }) => node.text).join('\n\n')
}

export function activePresetBlocks(nodes) {
  return presetNodeEntries(nodes).filter(({ node, ancestors }) => node.kind === 'block'
    && node.enabled && ancestors.every(parent => parent.enabled) && node.text.trim())
}

export function canMovePresetNode(nodes, sourceId, targetId, position) {
  if (!['before', 'after', 'inside'].includes(position)) return false
  const entries = presetNodeEntries(nodes)
  const source = entries.find(entry => entry.node.id === sourceId)
  if (!source) return false
  if (targetId === null) return position === 'inside'
  const target = entries.find(entry => entry.node.id === targetId)
  return !!target && targetId !== sourceId && !target.ancestors.some(node => node.id === sourceId)
    && (position !== 'inside' || target.node.kind === 'group')
}

/** Move the whole subtree; never mutate the source tree or its saved baseline. */
export function movePresetNode(nodes, sourceId, targetId, position) {
  if (!canMovePresetNode(nodes, sourceId, targetId, position)) throw new TypeError('Выберите другое место: группу нельзя вложить в себя или её содержимое.')
  const result = structuredClone(nodes)
  const entries = presetNodeEntries(result)
  const source = entries.find(entry => entry.node.id === sourceId)
  const target = targetId === null ? null : entries.find(entry => entry.node.id === targetId)
  const destination = position === 'inside' ? target?.node.children ?? result : target.siblings
  source.siblings.splice(source.siblings.indexOf(source.node), 1)
  const index = position === 'inside' ? destination.length : destination.indexOf(target.node) + (position === 'after' ? 1 : 0)
  destination.splice(index, 0, source.node)
  if (presetNodeEntries(result).some(entry => entry.ancestors.length >= MAX_PRESET_DEPTH)) {
    throw new TypeError(`Используйте не больше ${MAX_PRESET_DEPTH} уровней вложенности.`)
  }
  return result
}
