/** A refresh may join a list request begun before the Host created this chat. */
export async function usePreparedSession(sessions, sessionId, source, operation) {
  await sessions.refresh()
  if (!sessions.list.getSnapshot().byId[sessionId]) await sessions.refresh()
  return sessions.using(sessionId, { source }, async reference => operation(await reference.ready))
}
