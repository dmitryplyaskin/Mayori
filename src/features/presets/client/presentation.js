import { presetNodeEntries, presetNodes } from '../shared/tree.js'

/** Presentation helpers compare content, never mutable library identity alone. */
export function presetChanged(left, right) {
  return left.name !== right.name || left.instructions !== right.instructions
    || JSON.stringify(presetNodes(left)) !== JSON.stringify(presetNodes(right))
}

export function filterPresets(presets, query) {
  const needle = query.trim().toLocaleLowerCase('ru-RU')
  if (!needle) return presets
  return presets.filter(preset => `${preset.name}\n${presetNodeEntries(presetNodes(preset)).map(({ node }) => `${node.title}\n${node.text ?? ''}`).join('\n')}`.toLocaleLowerCase('ru-RU').includes(needle))
}
