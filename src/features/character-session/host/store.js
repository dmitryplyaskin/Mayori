import { mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises'
import { linkSync, renameSync } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { validateSessionId, characterSnapshot } from '../domain/character.js'
import { mediaId } from '../../media/shared/image.js'

/** Selection store; source cards stay fixed, persona changes are explicit. */
export class FileSystemCharacterSessionStore {
  constructor(root) { this.root = resolve(root, 'selections') }

  path(sessionId) {
    validateSessionId(sessionId)
    return resolve(this.root, `${createHash('sha256').update(sessionId).digest('hex')}.json`)
  }

  async fingerprint(sessionId) {
    try { const value = await stat(this.path(sessionId)); return `${value.size}:${value.mtimeMs}:${value.ctimeMs}` }
    catch (error) { if (error.code === 'ENOENT') return 'missing'; throw error }
  }

  async read(sessionId) {
    let text
    try { text = await readFile(this.path(sessionId), 'utf8') } catch (error) {
      if (error.code === 'ENOENT') return null
      throw error
    }
    const record = JSON.parse(text)
    if (record.format !== 1 || record.sessionId !== sessionId || !record.character?.name
      || !record.character?.data || typeof record.character.data.description !== 'string') {
      throw new Error('Сохранённый выбор персонажа повреждён. Восстановите файл из резервной копии.')
    }
    const snapshot = characterSnapshot(record.character)
    if (snapshot.image !== undefined && snapshot.image !== null
      && !mediaId(snapshot.image) && (typeof snapshot.image !== 'string' || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(snapshot.image))) {
      throw new Error('Snapshot аватара персонажа повреждён.')
    }
    for (const [field, value] of Object.entries(snapshot.data)) {
      const stored = record.character.data[field]
      if (Array.isArray(value) ? !Array.isArray(stored) || stored.some(item => typeof item !== 'string')
        : typeof stored !== 'string') {
        throw new Error('Сохранённый выбор персонажа повреждён. Восстановите файл из резервной копии.')
      }
    }
    const greeting = record.character.greeting
    if (record.character.persona !== undefined) {
      const persona = record.character.persona
      if (!persona || typeof persona.name !== 'string' || !persona.name.trim() || typeof persona.description !== 'string') {
        throw new Error('Snapshot персоны повреждён.')
      }
      snapshot.persona = { ...persona }
    }
    if (record.character.templateTime !== undefined) {
      if (!Number.isSafeInteger(record.character.templateTime) || record.character.templateTime < 0) throw new Error('Snapshot времени повреждён.')
      snapshot.templateTime = record.character.templateTime
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

  /** Prepare off-path, then publish without an await after the liveness check. */
  async save(sessionId, character, beforeCommit) {
    await mkdir(this.root, { recursive: true })
    const temporary = resolve(this.root, `${randomUUID()}.tmp`)
    try {
      await writeFile(temporary, `${JSON.stringify({ format: 1, sessionId, character })}\n`, { flag: 'wx', flush: true })
      beforeCommit()
      linkSync(temporary, this.path(sessionId))
    } finally {
      await rm(temporary, { force: true })
    }
  }

  async update(sessionId, character, beforeCommit) {
    const temporary = resolve(this.root, `${randomUUID()}.tmp`)
    try {
      await writeFile(temporary, `${JSON.stringify({ format: 1, sessionId, character })}\n`, { flag: 'wx', flush: true })
      beforeCommit()
      renameSync(temporary, this.path(sessionId))
    } finally { await rm(temporary, { force: true }) }
  }
}
