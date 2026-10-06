/** Deterministic subset of SillyTavern macros, shared by Host and previews. */
export const DEFAULT_PERSONA = Object.freeze({ id: null, name: 'Игрок', description: '', avatar: '', title: '' })

export function renderTemplate(text, character, persona = DEFAULT_PERSONA, timestamp = 0) {
  const data = character.data ?? {}
  const date = new Date(timestamp)
  const names = { user: persona.name, char: character.name, charifnotgroup: character.name,
    group: character.name, groupnotmuted: character.name, notchar: persona.name }
  const fields = { persona: persona.description, description: data.description, chardesc: data.description,
    personality: data.personality, charpersonality: data.personality, scenario: data.scenario,
    charexamples: data.mes_example, mesexamples: data.mes_example, charexamplesraw: data.mes_example,
    charprompt: data.system_prompt, charjailbreak: data.post_history_instructions,
    charversion: data.character_version, charcreator: data.creator }
  const constants = { newline: '\n', space: ' ', noop: '', original: '', input: '',
    isodate: date.toISOString().slice(0, 10), isotime: date.toISOString().slice(11, 19),
    date: date.toISOString().slice(0, 10), time: date.toISOString().slice(11, 16),
    weekday: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getUTCDay()] }
  const expand = (value, path = []) => String(value ?? '')
    .replace(/\{\{\/\/[^{}]*\}\}/g, '')
    .replace(/[\t \r\n]*\{\{\s*trim\s*\}\}[\t \r\n]*/gi, '')
    .replace(/\{\{\s*([a-z][a-z0-9]*)\s*\}\}|<USER>|<BOT>/gi, (raw, token) => {
      const key = token?.toLowerCase() ?? (raw.toUpperCase() === '<USER>' ? 'user' : 'char')
      if (Object.hasOwn(names, key)) return names[key]
      if (Object.hasOwn(constants, key)) return constants[key]
      if (!Object.hasOwn(fields, key)) return raw
      if (path.includes(key) || path.length >= 12) return ''
      return expand(fields[key], [...path, key])
    })
  return expand(text)
}
