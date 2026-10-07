export class PluginSettingsClient {
  async read() { return this.#call('POST') }
  async update(plugins, revision) { return this.#call('PUT', { plugins, revision }) }
  async #call(method, body = {}) {
    const response = await fetch('/mayori/plugins', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    const result = await response.json()
    if (!response.ok || !result.ok) throw new Error(result.error ?? `HTTP ${response.status}`)
    return result.value
  }
}
