import { en } from './en.js'

export const ru = Object.freeze(Object.fromEntries(Object.keys(en).map(key => [key, key])))

/** Interpolate only product placeholders, leaving authored macros intact. */
export function formatMessage(template, params = {}) {
  return template.replace(/\{(p\d+)\}/g, (match, key) => Object.hasOwn(params, key) ? String(params[key]) : match)
}

const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const patterns = Object.entries(en).flatMap(([key, english]) => [key, english].filter(text => /\{p\d+\}/.test(text)).map(text => {
  const names = [...text.matchAll(/\{(p\d+)\}/g)].map(match => match[1])
  const parts = text.split(/\{p\d+\}/).map(escape)
  return { key, names, pattern: new RegExp(`^${parts.join('([\\s\\S]*?)')}$`) }
}))
const englishKeys = new Map(Object.entries(en).map(([key, value]) => [value, key]))

/** For product errors/notices only. Never pass story text, names or instructions. */
export function translateNotice(text, translate) {
  if (typeof text !== 'string' || !text) return text
  if (Object.hasOwn(en, text)) return translate(text)
  const englishKey = englishKeys.get(text)
  if (englishKey) return translate(englishKey)
  for (const { key, names, pattern } of patterns) {
    const match = pattern.exec(text)
    if (match) {
      const params = Object.fromEntries(names.map((name, index) => [name, match[index + 1]]))
      if (key === '{p1}: укажите целое число от {p2} до {p3}.' && Object.hasOwn(en, params.p1)) params.p1 = translate(params.p1)
      return translate(key, params)
    }
  }
  // Import reports can contain several independently recorded notices.
  const sentences = text.split(/(?<=[.!?])(?=\s)/)
  return sentences.length > 1 ? sentences.map(part => {
    const whitespace = part.match(/^\s*/)[0]
    return whitespace + translateNotice(part.slice(whitespace.length), translate)
  }).join('') : text
}
