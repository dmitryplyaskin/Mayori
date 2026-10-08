import { call } from '../../../client/infrastructure/rpc.js'

export class MessageRevisionClient {
  getSnapshot() { throw new Error('MessageRevisionClient.getSnapshot() is not implemented') }
  subscribe() { throw new Error('MessageRevisionClient.subscribe() is not implemented') }
  inspect() { throw new Error('MessageRevisionClient.inspect() is not implemented') }
  edit() { throw new Error('MessageRevisionClient.edit() is not implemented') }
  regenerate() { throw new Error('MessageRevisionClient.regenerate() is not implemented') }
}

export class RemoteMessageRevisionProvider extends MessageRevisionClient {
  #snapshot = { busy: false }
  #listeners = new Set()
  constructor(sessionId, open) { super(); this.sessionId = sessionId; this.open = open }
  getSnapshot = () => this.#snapshot
  subscribe = listener => { this.#listeners.add(listener); return () => { this.#listeners.delete(listener) } }
  #publish(busy) { this.#snapshot = { busy }; for (const listener of this.#listeners) listener() }
  inspect(seq) { return call('message-inspect', { sessionId: this.sessionId, seq }) }
  async #change(endpoint, input) {
    if (this.#snapshot.busy) throw new Error('Дождитесь сохранения текущей реплики.')
    this.#publish(true)
    try {
      const value = await call(endpoint, { sessionId: this.sessionId, ...input })
      if (value.changed) await this.open(value.sessionId)
      return value
    } finally { this.#publish(false) }
  }
  edit(seq, text) { return this.#change('message-edit', { seq, text }) }
  regenerate(seq) { return this.#change('message-regenerate', { seq }) }
}
