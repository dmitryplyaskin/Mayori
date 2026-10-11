import { Service } from '@deepseek-ai/cordis'
import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import { validateSessionId } from '../../character-session/domain/character.js'

export class ChatDeletionService extends Service {
  constructor(ctx) { super(ctx, 'mayoriChatDeletion') }
  list() { throw new Error('ChatDeletionService.list() is not implemented') }
  remove() { throw new Error('ChatDeletionService.remove() is not implemented') }
}

/** Durable catalog deletion. DSH retains ownership of the underlying logs. */
export class PersistentChatDeletionProvider extends ChatDeletionService {
  constructor(ctx, root) {
    super(ctx)
    this.root = root
    this.path = join(root, 'deleted-chats.json')
    this.work = Promise.resolve()
  }

  async list() {
    let value
    try { value = JSON.parse(await readFile(this.path, 'utf8')) }
    catch (error) { if (error.code === 'ENOENT') return []; throw error }
    if (value.format !== 1 || !Array.isArray(value.ids)) throw new Error('Список удалённых чатов повреждён.')
    value.ids.forEach(validateSessionId)
    return value.ids
  }

  remove(id) {
    validateSessionId(id)
    const operation = this.work.then(async () => {
      const ids = await this.list()
      if (ids.includes(id)) return ids
      // Archive admission prevents ongoing work; never request a forced stop.
      await this.ctx.workspaceRegistry.archiveSession(id)
      const activity = await this.ctx.waterfall('workspace/session-activity', { sessionId: id }, () => Promise.resolve([]))
      if (activity.length) throw new Error('Чат ещё выполняет работу. Дождитесь завершения.')
      const next = [...ids, id]
      await mkdir(this.root, { recursive: true })
      const temporary = join(this.root, `${randomUUID()}.tmp`)
      try {
        await writeFile(temporary, `${JSON.stringify({ format: 1, ids: next })}\n`, { flag: 'wx', flush: true })
        await rename(temporary, this.path)
      } finally { await rm(temporary, { force: true }) }
      return next
    })
    this.work = operation.catch(() => {})
    return operation
  }
}
