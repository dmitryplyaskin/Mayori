/** Browser orchestration from a gallery card to a selected chat session. */

function targetWorkspace(sessions, workspaces) {
  const current = Object.values(sessions.list.getSnapshot().byId).find(item => item.retainedBy?.mainView > 0)?.id
  const snapshot = workspaces.list.getSnapshot()
  const currentWorkspace = current === undefined
    ? undefined
    : snapshot.items.find(item => item.sessionIds.includes(current))?.workspaceId
  return currentWorkspace ?? snapshot.items[0]?.workspaceId
}

/** Create a fresh workspace session, bind the card, name it, and navigate. */
export async function startCharacterSession({ sessions, workspaces, uiWorkspace, library }, card) {
  let workspaceId = targetWorkspace(sessions, workspaces)
  if (workspaceId === undefined) {
    const campaign = await library.prepareCampaign()
    const workspace = await workspaces.create({ path: campaign.path })
    workspaceId = workspace.workspaceId
  }

  const sessionId = await sessions.create({ workspaceId })
  await sessions.using(sessionId, { source: 'mayoriGallery' }, async (reference) => {
    const binding = await reference.ready
    await library.play(card.id, sessionId)
    const renamed = await binding.session.rename(card.name)
    if (!renamed.ok) throw new Error(renamed.error.message)
    uiWorkspace.openSession(sessionId)
  })
  return sessionId
}
