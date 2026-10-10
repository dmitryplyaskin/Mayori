import { validatePreset } from './preset.js'
import { MAX_PRESET_NODES } from './tree.js'

// Prompt Manager exports may reference built-ins without exporting their text.
const BUILTINS = new Set(['main', 'nsfw', 'jailbreak', 'enhanceDefinitions', 'chatHistory', 'dialogueExamples',
  'worldInfoBefore', 'worldInfoAfter', 'charDescription', 'charPersonality', 'scenario', 'personaDescription'])

function promptOrder(record) {
  if (record.prompt_order === undefined) return undefined
  const orders = record.prompt_order
  if (!Array.isArray(orders)) throw new TypeError('Порядок блоков SillyTavern должен быть списком.')
  // Prompt Manager's full/character exports use a flat order. Completion
  // presets use per-character orders; 100001 is the current global order.
  if (!orders.length || orders.every(entry => typeof entry?.identifier === 'string')) return orders
  if (orders.some(entry => !entry || !Array.isArray(entry.order))) throw new TypeError('Порядок блоков SillyTavern повреждён.')
  const selected = orders.find(entry => String(entry.character_id) === '100001')
    ?? orders.find(entry => String(entry.character_id) === '100000')
    ?? (orders.length === 1 ? orders[0] : null)
  if (!selected) throw new TypeError('В файле несколько порядков для персонажей. Экспортируйте один порядок через Prompt Manager SillyTavern.')
  return selected.order
}

/** Import static instruction bodies, never ST runtime slots or executable extensions. */
export function convertSillyTavernPreset(record, { filename = '' } = {}) {
  if (!Array.isArray(record.prompts) || record.prompts.length > MAX_PRESET_NODES) {
    throw new TypeError(`В пресете SillyTavern может быть не больше ${MAX_PRESET_NODES} блоков.`)
  }
  const prompts = new Map()
  record.prompts.forEach((prompt, index) => {
    if (!prompt || typeof prompt.identifier !== 'string' || !prompt.identifier.trim() || prompts.has(prompt.identifier)) {
      throw new TypeError('У блоков SillyTavern должны быть уникальные идентификаторы.')
    }
    if (prompt.marker !== undefined && typeof prompt.marker !== 'boolean') throw new TypeError('Маркер блока SillyTavern повреждён.')
    if (prompt.role !== undefined && typeof prompt.role !== 'string') throw new TypeError('Роль блока SillyTavern повреждена.')
    if (prompt.enabled !== undefined && typeof prompt.enabled !== 'boolean') throw new TypeError('Переключатель блока SillyTavern повреждён.')
    if (prompt.marker !== true && prompt.content !== undefined && typeof prompt.content !== 'string') throw new TypeError('Текст блока SillyTavern должен быть строкой.')
    if (prompt.injection_position !== undefined && ![0, 1].includes(prompt.injection_position)) throw new TypeError('Позиция вставки SillyTavern не поддерживается.')
    if (prompt.injection_trigger !== undefined && (!Array.isArray(prompt.injection_trigger) || prompt.injection_trigger.some(trigger => typeof trigger !== 'string'))) {
      throw new TypeError('Условия вставки SillyTavern повреждены.')
    }
    prompts.set(prompt.identifier, { prompt, index })
  })
  const order = promptOrder(record)
  const seen = new Set()
  const nodes = []
  let afterHistory = false, incompatible = 0, missing = 0
  function append(identifier, enabled, ordered) {
    const entry = prompts.get(identifier)
    if (!entry) { if (!BUILTINS.has(identifier)) missing++; return }
    const { prompt, index } = entry
    if (prompt.marker === true) return
    const role = prompt.role ?? 'system'
    const annotations = []
    if (role !== 'system') annotations.push(`роль ${role}`)
    if (prompt.injection_position === 1) annotations.push(`вставка в историю: ${prompt.injection_depth ?? 4}`)
    else if (ordered && afterHistory) annotations.push('после истории')
    if (prompt.injection_trigger?.length) annotations.push('условная вставка')
    if (annotations.length) incompatible++
    const title = typeof prompt.name === 'string' && prompt.name.trim() ? prompt.name.trim() : identifier
    const suffix = annotations.length ? ` · ${annotations.join(', ')}` : ''
    nodes.push({ id: `st-${index}`, kind: 'block', title: `${title.slice(0, Math.max(1, 120 - suffix.length))}${suffix}`.slice(0, 120),
      enabled: enabled && !annotations.length, text: prompt.content ?? '' })
  }
  if (order !== undefined) {
    for (const entry of order) {
      if (!entry || typeof entry.identifier !== 'string' || !entry.identifier.trim() || seen.has(entry.identifier) || typeof entry.enabled !== 'boolean') {
        throw new TypeError('Порядок или переключатели SillyTavern повреждены.')
      }
      seen.add(entry.identifier)
      append(entry.identifier, entry.enabled, true)
      if (entry.identifier === 'chatHistory') afterHistory = true
    }
  }
  for (const { prompt } of prompts.values()) {
    if (!seen.has(prompt.identifier)) append(prompt.identifier, order === undefined ? prompt.enabled ?? true : false, false)
  }
  if (!nodes.length) throw new TypeError('В файле SillyTavern нет текстовых блоков для импорта.')
  const fileName = filename.split(/[\\/]/).at(-1).replace(/\.json$/i, '').trim()
  const name = (typeof record.name === 'string' && record.name.trim() ? record.name.trim() : fileName || 'SillyTavern').slice(0, 120)
  const preset = validatePreset({ name, nodes })
  const warnings = ['Перенесены текстовые блоки; настройки генерации и служебные вставки ST не применены.']
  if (nodes.some(node => /\{\{[^}]*\}\}/.test(node.text))) warnings.push('Макросы ST сохранены как текст.')
  if (incompatible) warnings.push(`Блоки с несовместимыми ролями или вставками оставлены выключенными: ${incompatible}.`)
  if (missing) warnings.push(`В файле отсутствуют блоки из порядка: ${missing}.`)
  return { preset, warnings }
}
