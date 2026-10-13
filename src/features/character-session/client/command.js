import { tr } from '../../localization/client/service.js'
/** Start a fresh character chat through the existing gallery consumer. */
export function newChatCommand({ chatFor, startCharacter, notify, icon }) {
  const pending = new Set()
  return {
    name: 'new',
    label: () => tr("Новый чат"),
    description: () => tr("Начать новую историю с этим персонажем"),
    icon,
    available: session => Boolean(session.sessionId) && !pending.has(session.sessionId),
    ui: {
      kind: 'action',
      async run(session) {
        const sessionId = session.sessionId
        if (pending.has(sessionId)) return
        pending.add(sessionId)
        try {
          const chat = chatFor(sessionId)
          await chat.refresh()
          const snapshot = chat.getSnapshot()
          if (snapshot.status !== 'ready') throw new Error(snapshot.error || tr("Не удалось прочитать текущий чат."))
          if (!snapshot.value?.character) throw new Error(tr("Откройте чат персонажа из галереи."))
          await startCharacter(snapshot.value.character, sessionId)
        } catch (error) {
          notify(sessionId, error instanceof Error ? error.message : String(error))
        } finally { pending.delete(sessionId) }
      },
    },
  }
}
