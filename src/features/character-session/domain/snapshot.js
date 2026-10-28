import { characterSnapshot } from './character.js'
import { mediaId } from '../../media/shared/image.js'
import { validatePersonaExtensions } from '../../personas/shared/persona.js'

export const CHARACTER_SELECTION_SOURCE = 'mayori-character-session'

export function characterSelectionMessage(character, id, originSessionId) {
  return { ...(id === undefined ? {} : { id }), role: 'user', content: [],
    source: { kind: CHARACTER_SELECTION_SOURCE, form: 'snapshot',
      sections: [{ name: CHARACTER_SELECTION_SOURCE, text: JSON.stringify({ version: 1, character,
        ...(originSessionId === undefined ? {} : { originSessionId }) }) }] } }
}

/** A fork owns the exact selection at its inherited cut, independent of parent metadata. */
export function readCharacterSelection(events) {
  return readSelectionRecord(events)?.character
}

export function readCharacterOrigin(events) {
  return readSelectionRecord(events)?.originSessionId
}

function readSelectionRecord(events) {
  for (let index = events.length - 1; index >= 0; index--) {
    const event = events[index]
    const message = event.type === 'user/message' ? event.data : event.type === 'agent/inbox/spliced'
      ? event.data.inserted?.findLast(message => message.source?.kind === CHARACTER_SELECTION_SOURCE) : undefined
    if (message?.source?.kind !== CHARACTER_SELECTION_SOURCE) continue
    const section = message.source.sections?.find(section => section.name === CHARACTER_SELECTION_SOURCE)
    if (!section) throw new Error('Снимок персонажа в журнале повреждён.')
    const record = JSON.parse(section.text)
    if (record.version !== 1) throw new Error('Версия снимка персонажа не поддерживается.')
    if (record.originSessionId !== undefined && (typeof record.originSessionId !== 'string' || !record.originSessionId)) {
      throw new Error('Источник ветки в журнале повреждён.')
    }
    return { ...record, character: validateCharacterSelection(record.character) }
  }
}

/** Insert metadata after the reserved system head and before any authored opening. */
export function seedCharacterSelection(seed, character, id, originSessionId) {
  const events = [...seed]
  if (!events.some(event => event.type === 'system/message')) {
    const opening = events.findIndex(event => event.type === 'assistant/message')
    if (opening < 0) return seed
    const { turn, step } = events[opening].data
    events.splice(opening, 0, { type: 'system/message', surfaceOp: 'append', time: events[opening].time,
      data: { turn, step, message: { id: `${id}:system`, role: 'system', content: [], source: { kind: 'system-prompt' } } } })
  }
  const index = events.findIndex(event => event.type === 'system/message') + 1
  events.splice(index, 0, { type: 'user/message', surfaceOp: 'append',
    data: characterSelectionMessage(character, id, originSessionId), time: events[index - 1].time })
  return events.map((event, seq) => ({ ...event, seq }))
}

/** Validate the same standardized selection in files and inherited session logs. */
export function validateCharacterSelection(character) {
  if (!character?.name || !character.data || typeof character.data.description !== 'string') throw new Error('Снимок персонажа повреждён.')
  const snapshot = characterSnapshot(character)
  if (snapshot.image !== undefined && snapshot.image !== null
    && !mediaId(snapshot.image) && (typeof snapshot.image !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(snapshot.image))) {
    throw new Error('Snapshot аватара персонажа повреждён.')
  }
  for (const [field, value] of Object.entries(snapshot.data)) {
    const stored = character.data[field]
    if (Array.isArray(value) ? !Array.isArray(stored) || stored.some(item => typeof item !== 'string')
      : typeof stored !== 'string') {
      throw new Error('Сохранённый выбор персонажа повреждён. Восстановите файл из резервной копии.')
    }
  }
  const greeting = character.greeting
  if (character.persona !== undefined) {
    const persona = character.persona
    if (!persona || typeof persona.name !== 'string' || !persona.name.trim() || typeof persona.description !== 'string') {
      throw new Error('Snapshot персоны повреждён.')
    }
    validatePersonaExtensions(persona)
    if (persona.promptSnapshot !== undefined && (!persona.promptSnapshot
      || typeof persona.promptSnapshot.description !== 'string' || persona.promptSnapshot.description.length > 256000
      || !Array.isArray(persona.promptSnapshot.activeIds) || persona.promptSnapshot.activeIds.some(id => typeof id !== 'string')
      || persona.promptSnapshot.sessionId !== null && typeof persona.promptSnapshot.sessionId !== 'string'
      || persona.promptSnapshot.characterId !== null && typeof persona.promptSnapshot.characterId !== 'string')) {
      throw new Error('Snapshot описания персоны повреждён.')
    }
    snapshot.persona = { ...persona }
  }
  if (character.templateTime !== undefined) {
    if (!Number.isSafeInteger(character.templateTime) || character.templateTime < 0) throw new Error('Snapshot времени повреждён.')
    snapshot.templateTime = character.templateTime
  }
  if (greeting !== undefined) {
    if (!greeting || !Number.isSafeInteger(greeting.index) || greeting.index < 0
      || typeof greeting.messageId !== 'string' || !greeting.messageId || typeof greeting.text !== 'string') {
      throw new Error('Snapshot приветствия повреждён.')
    }
    snapshot.greeting = { index: greeting.index, messageId: greeting.messageId, text: greeting.text }
  }
  return snapshot
}
