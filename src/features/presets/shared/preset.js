import { compilePresetNodes, MAX_PRESET_TEXT, PRESET_COMPILER_VERSION, validatePresetNodes } from './tree.js'

export const PRESET_SECTION = 'mayori:roleplay-preset'
export const PRESET_SOURCE = 'mayori-preset'
const OPEN = '<mayori-roleplay-preset>'
const CLOSE = '</mayori-roleplay-preset>'

export function validatePreset(input) {
  if (!input || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 120) {
    throw new TypeError('Укажите название пресета длиной до 120 символов.')
  }
  if (input.nodes !== undefined) {
    const nodes = validatePresetNodes(input.nodes)
    const instructions = compilePresetNodes(nodes)
    if (instructions.length > MAX_PRESET_TEXT) throw new TypeError('Сократите итоговые инструкции до 64 000 символов.')
    return { name: input.name.trim(), nodes, instructions, compilerVersion: PRESET_COMPILER_VERSION }
  }
  if (typeof input.instructions !== 'string' || !input.instructions.trim() || input.instructions.length > MAX_PRESET_TEXT) {
    throw new TypeError('Укажите инструкции длиной до 64 000 символов.')
  }
  return { name: input.name.trim(), instructions: input.instructions }
}

/** Model projection deliberately excludes disabled text and authoring structure. */
export function presetContext(preset) {
  const projected = preset?.nodes ? { id: preset.id, name: preset.name, instructions: preset.instructions, compilerVersion: preset.compilerVersion } : preset
  return encodePreset(projected, preset?.compilerVersion ? 2 : 1)
}

function encodePreset(preset, version) {
  const record = JSON.stringify({ version, preset }).replaceAll('<', '\\u003c')
  return `Follow the selected role-playing instructions below. A null preset means no additional role-playing instructions.\n${OPEN}\n${record}\n${CLOSE}`
}

/** The same logged snapshot is used for selection and authored opening branches. */
export function presetSelectionMessage(preset, id) {
  return {
    ...(id === undefined ? {} : { id }), role: 'user',
    source: { kind: PRESET_SOURCE, sections: [{ name: PRESET_SECTION, text: encodePreset(preset, preset?.compilerVersion ? 2 : 1) }] },
    content: [],
  }
}

export function readPresetSelection(events) {
  let systemFallback
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index]
    if (event.type === 'agent/inbox/spliced') {
      const message = event.data.inserted?.findLast(message => message.source?.kind === PRESET_SOURCE)
      const section = message?.source.sections?.find(section => section.name === PRESET_SECTION)
      if (section) return decodePreset(section.text)
    }
    if (event.type === 'user/message' && [PRESET_SOURCE, 'runtime-context'].includes(event.data.source?.kind)) {
      const section = event.data.source.sections?.find(section => section.name === PRESET_SECTION)
      if (section) {
        const preset = decodePreset(section.text)
        if (event.data.source.kind === PRESET_SOURCE) return preset
        if (systemFallback === undefined) systemFallback = preset
      }
    }
    if (event.type !== 'system/message') continue
    const text = event.data.message.content.filter(block => block.type === 'text').map(block => block.text).join('')
    // System heads contain only the model projection. Prefer the full logged
    // selection even when a newer system head has already been admitted.
    if (systemFallback === undefined && text.includes(`${OPEN}\n`)) systemFallback = decodePreset(text)
  }
  return systemFallback
}

function decodePreset(text) {
  const start = text.indexOf(`${OPEN}\n`)
  const end = text.indexOf(`\n${CLOSE}`, start)
  if (start < 0 || end < 0) throw new Error('Снимок пресета в журнале повреждён.')
  const record = JSON.parse(text.slice(start + OPEN.length + 1, end))
  return decodeRecord(record)
}

function decodeRecord(record) {
  if (![1, 2].includes(record.version)) throw new Error('Версия снимка пресета не поддерживается.')
  if (record.preset === null) return null
  if (record.version === 2) {
    const preset = record.preset
    if (!preset || typeof preset.id !== 'string' || !preset.id || typeof preset.name !== 'string'
      || !preset.name.trim() || preset.name.length > 120 || typeof preset.instructions !== 'string'
      || preset.instructions.length > MAX_PRESET_TEXT || preset.compilerVersion !== PRESET_COMPILER_VERSION) {
      throw new Error('Снимок пресета в журнале повреждён.')
    }
    // Replay uses the frozen compiled text, never a newly compiled catalog copy.
    return { id: preset.id, name: preset.name, instructions: preset.instructions, compilerVersion: preset.compilerVersion,
      ...(preset.nodes === undefined ? {} : { nodes: validatePresetNodes(preset.nodes) }) }
  }
  const data = validatePreset(record.preset)
  if (typeof record.preset.id !== 'string' || !record.preset.id) throw new Error('Снимок пресета в журнале повреждён.')
  return { id: record.preset.id, ...data }
}
