/** Browser orchestration from a gallery card to a selected chat session. */
import { usePreparedSession } from '../../../client/infrastructure/prepared-session.js'

function targetWorkspace(sessions, workspaces, sourceSessionId) {
  const current = sourceSessionId ?? Object.values(sessions.list.getSnapshot().byId).find(item => item.retainedBy?.mainView > 0)?.id
  const snapshot = workspaces.list.getSnapshot()
  const currentWorkspace = current === undefined
    ? undefined
    : snapshot.items.find(item => item.sessionIds.includes(current))?.workspaceId
  return currentWorkspace ?? snapshot.items[0]?.workspaceId
}

/** Create a fresh workspace session, bind the card, name it, and navigate. */
export async function startCharacterSession({ sessions, workspaces, uiWorkspace, library, sourceSessionId }, card, greetingIndex = 0) {
  let workspaceId = targetWorkspace(sessions, workspaces, sourceSessionId)
  if (workspaceId === undefined) {
    const campaign = await library.prepareCampaign()
    const workspace = await workspaces.create({ path: campaign.path })
    workspaceId = workspace.workspaceId
  }

  const { sessionId } = await library.start(card.id, workspaceId, greetingIndex)
  await usePreparedSession(sessions, sessionId, 'mayoriGallery', async binding => {
    const renamed = await binding.session.rename(card.name)
    if (!renamed.ok) throw new Error(renamed.error.message)
    uiWorkspace.openSession(sessionId)
  })
  return sessionId
}
