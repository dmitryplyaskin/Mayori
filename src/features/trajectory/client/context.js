import { call } from '../../../client/infrastructure/rpc.js'

const uniqueViews = new WeakMap()
/** DSH 0.2.1's tab consumer reads raw registrations, including shadowed entries. */
export function deduplicateViews(views) {
  if (!uniqueViews.has(views)) {
    const seen = new Set()
    const filtered = views.filter(view => {
      if (seen.has(view.id)) return false
      seen.add(view.id); return true
    })
    // Slot priority chooses the renderer; it must not put Trajectory before Chat.
    const chatIndex = filtered.findIndex(view => view.id === 'chat')
    if (chatIndex > 0) filtered.unshift(...filtered.splice(chatIndex, 1))
    uniqueViews.set(views, filtered.length === views.length && chatIndex <= 0 ? views : filtered)
  }
  return uniqueViews.get(views)
}

export class TrajectoryContextService {
  getSnapshot() { throw new Error('TrajectoryContextService.getSnapshot() is not implemented') }
  subscribe() { throw new Error('TrajectoryContextService.subscribe() is not implemented') }
  refresh() { throw new Error('TrajectoryContextService.refresh() is not implemented') }
}

/** Session-bound browser provider; an old response cannot overwrite a new selection. */
export class RemoteTrajectoryContextProvider extends TrajectoryContextService {
  #snapshot = { status: 'loading', value: null, error: null }
  #listeners = new Set()
  #revision = 0
  #controller
  constructor(sessionId) { super(); this.sessionId = sessionId }
  getSnapshot = () => this.#snapshot
  subscribe = listener => { this.#listeners.add(listener); return () => { this.#listeners.delete(listener) } }
  #publish(value) { this.#snapshot = value; for (const listener of this.#listeners) listener() }
  async refresh(selection) {
    const revision = ++this.#revision
    this.#controller?.abort()
    const controller = this.#controller = new AbortController()
    this.#publish({ status: 'loading', value: this.#snapshot.value, error: null })
    try {
      const value = await call('trajectory-context', { sessionId: this.sessionId, selection }, { signal: controller.signal })
      if (revision === this.#revision) this.#publish({ status: 'ready', value, error: null })
    } catch (error) {
      if (revision === this.#revision) this.#publish({ status: 'error', value: null, error: error.message })
    }
  }
  release() { if (!this.#listeners.size) this.dispose() }
  dispose() { ++this.#revision; this.#controller?.abort(); this.#snapshot = { status: 'loading', value: null, error: null } }
}
