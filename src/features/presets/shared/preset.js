export const PRESET_SECTION = 'mayori:roleplay-preset'
export const PRESET_SOURCE = 'mayori-preset'
const OPEN = '<mayori-roleplay-preset>'
const CLOSE = '</mayori-roleplay-preset>'

export function validatePreset(input) {
  if (!input || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 120) {
    throw new TypeError('Укажите название пресета длиной до 120 символов.')
  }
  if (typeof input.instructions !== 'string' || !input.instructions.trim() || input.instructions.length > 64000) {
    throw new TypeError('Укажите инструкции для игры длиной до 64 000 символов.')
  }
  return { name: input.name.trim(), instructions: input.instructions }
}

/** Literal, versioned model instructions double as the durable selection snapshot. */
export function presetContext(preset) {
  const record = JSON.stringify({ version: 1, preset }).replaceAll('<', '\\u003c')
  return `Follow the selected role-playing instructions below. A null preset means no additional role-playing instructions.\n${OPEN}\n${record}\n${CLOSE}`
}

/** The same logged snapshot is used for selection and authored opening branches. */
export function presetSelectionMessage(preset, id) {
  return {
    ...(id === undefined ? {} : { id }), role: 'user',
    source: { kind: PRESET_SOURCE, sections: [{ name: PRESET_SECTION, text: presetContext(preset) }] },
    content: [],
  }
}

export function readPresetSelection(events) {
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index]
    if (event.type === 'agent/inbox/spliced') {
      const message = event.data.inserted?.findLast(message => message.source?.kind === PRESET_SOURCE)
      const section = message?.source.sections?.find(section => section.name === PRESET_SECTION)
      if (section) return decodePreset(section.text)
    }
    if (event.type === 'user/message' && [PRESET_SOURCE, 'runtime-context'].includes(event.data.source?.kind)) {
      const section = event.data.source.sections?.find(section => section.name === PRESET_SECTION)
      if (section) return decodePreset(section.text)
    }
    if (event.type !== 'system/message') continue
    const text = event.data.message.content.filter(block => block.type === 'text').map(block => block.text).join('')
    if (text.includes(`${OPEN}\n`)) return decodePreset(text)
  }
  return undefined
}

function decodePreset(text) {
  const start = text.indexOf(`${OPEN}\n`)
  const end = text.indexOf(`\n${CLOSE}`, start)
  if (start < 0 || end < 0) throw new Error('Снимок пресета в журнале повреждён.')
  const record = JSON.parse(text.slice(start + OPEN.length + 1, end))
  return decodeRecord(record)
}

function decodeRecord(record) {
  if (record.version !== 1) throw new Error('Версия снимка пресета не поддерживается.')
  if (record.preset === null) return null
  const data = validatePreset(record.preset)
  if (typeof record.preset.id !== 'string' || !record.preset.id) throw new Error('Снимок пресета в журнале повреждён.')
  return { id: record.preset.id, ...data }
}
