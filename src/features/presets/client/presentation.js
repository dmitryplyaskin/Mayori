/** Presentation helpers compare content, never mutable library identity alone. */
export function presetChanged(left, right) {
  return left.name !== right.name || left.instructions !== right.instructions
}

export function filterPresets(presets, query) {
  const needle = query.trim().toLocaleLowerCase('ru-RU')
  if (!needle) return presets
  return presets.filter(preset => `${preset.name}\n${preset.instructions}`.toLocaleLowerCase('ru-RU').includes(needle))
}
