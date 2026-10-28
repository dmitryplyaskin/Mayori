import { mkdir, readFile, writeFile, rm, stat, readdir } from 'node:fs/promises'
import { linkSync, renameSync } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { validateSessionId, buildCharacterContext } from '../domain/character.js'
import { validateCharacterSelection } from '../domain/snapshot.js'

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
    return validateCharacterSelection(record.character)
  }

  /** One-time recovery for pre-migration forks whose inherited cut predates logged selections. */
  async inheritedSelection(events) {
    const greetings = new Set(events.filter(event => event.type === 'assistant/message'
      && event.data.message.source?.provider === 'mayori-character-card').map(event => event.data.message.id))
    if (!greetings.size) return null
    let entries
    try { entries = await readdir(this.root) } catch (error) { if (error.code === 'ENOENT') return null; throw error }
    const context = events.filter(event => event.type === 'system/message').map(event =>
      event.data.message.content.filter(block => block.type === 'text').map(block => block.text).join(''))
      .findLast(text => text.includes('<mayori-character-card>'))
    const matches = []
    for (const entry of entries.filter(entry => entry.endsWith('.json'))) {
      const text = await readFile(resolve(this.root, entry), 'utf8')
      if (![...greetings].some(id => text.includes(id))) continue
      const record = JSON.parse(text)
      if (!greetings.has(record.character?.greeting?.messageId)) continue
      const character = await this.read(record.sessionId)
      const rendered = buildCharacterContext(character)
      if (!context || context.includes(rendered)) matches.push({ character, originSessionId: record.sessionId })
    }
    if (matches.length !== 1) {
      throw new Error('Не удалось восстановить персонажа старой ветки. Откройте исходный чат.')
    }
    const { character, originSessionId } = matches[0]
    return { character, originSessionId }
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
