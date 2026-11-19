/** Browser orchestration from a gallery card to a selected chat session. */
import { usePreparedSession } from '../../../client/infrastructure/prepared-session.js'

/** Create and open a character session in the Host-selected Mayori workspace. */
export async function startCharacterSession({ sessions, uiWorkspace, library }, card, greetingIndex = 0) {
  const { sessionId } = await library.start(card.id, greetingIndex)
  await usePreparedSession(sessions, sessionId, 'mayoriGallery', async binding => {
    const renamed = await binding.session.rename(card.name)
    if (!renamed.ok) throw new Error(renamed.error.message)
    uiWorkspace.openSession(sessionId)
  })
  return sessionId
}
