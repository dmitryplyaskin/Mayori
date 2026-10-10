import { validatePreset } from './preset.js'
import { presetNodes } from './tree.js'
import { convertSillyTavernPreset } from './sillytavern.js'

export const MAX_PRESET_FILE_BYTES = 1024 * 1024
const FORMAT = 'mayori-preset'

function editablePreset(input) {
  const data = validatePreset(input)
  return validatePreset({ name: data.name, nodes: presetNodes(data) })
}

/** Portable authoring data; catalog IDs and model projections are not imported. */
export function parsePresetFile(text, options = {}) {
  if (typeof text !== 'string') throw new TypeError('Выберите JSON-файл пресета.')
  if (text.length > MAX_PRESET_FILE_BYTES || new TextEncoder().encode(text).byteLength > MAX_PRESET_FILE_BYTES) {
    throw new TypeError('Размер файла пресета не должен превышать 1 МБ.')
  }
  let record
  try { record = JSON.parse(text.replace(/^\uFEFF/, '')) }
  catch { throw new TypeError('Не удалось прочитать JSON. Проверьте файл пресета.') }
  if (record?.format !== undefined) {
    if (record.format !== FORMAT || record.version !== 1) throw new TypeError('Формат или версия файла пресета не поддерживается.')
    return { preset: editablePreset(record.preset), warnings: [] }
  }
  if (record?.prompts !== undefined) return convertSillyTavernPreset(record, options)
  if (record?.data?.prompts !== undefined && ['full', 'character'].includes(record.type)) {
    if (record.version !== 1) throw new TypeError('Версия экспорта Prompt Manager SillyTavern не поддерживается.')
    return convertSillyTavernPreset(record.data, options)
  }
  return { preset: editablePreset(record), warnings: [] }
}

export function importPreset(text, options) {
  return parsePresetFile(text, options).preset
}

export function exportPreset(preset) {
  const { name, nodes } = editablePreset(preset)
  const safeName = name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-').slice(0, 80).trim()
  return {
    filename: `preset-${safeName || 'untitled'}.mayori.json`,
    text: `${JSON.stringify({ format: FORMAT, version: 1, preset: { name, nodes } }, null, 2)}\n`,
  }
}
