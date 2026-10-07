import { PluginSettingsService } from './service.js'
import { PLUGIN_SETTINGS_NS, validatePlugins } from '../shared/settings.js'

/** Preferences live in DSH Config; active state only tracks reversible mounts. */
export class PersistentPluginSettingsProvider extends PluginSettingsService {
  #listeners = new Set()
  #active
  #work = Promise.resolve()
  #error = null
  #closed = false
  constructor(ctx, config) {
    super(ctx)
    this.config = config
    this.#active = this.#desired()
    ctx.effect(() => () => { this.#closed = true })
    ctx.on('app-boot/config-reload', () => { void this.refresh().catch(error => ctx.logger.error(error)) })
    ctx.on('agent/status', () => { void this.refresh().catch(error => ctx.logger.error(error)) })
  }
  #desired() { return validatePlugins(Object.fromEntries(Object.entries(this.config).map(([key, ref]) => [key, ref.get()]))) }
  read = () => {
    const descriptor = this.ctx.settings.describe().find(row => row.ns === PLUGIN_SETTINGS_NS)
    const desired = this.#desired()
    return { plugins: desired, active: this.#active, pending: JSON.stringify(desired) !== JSON.stringify(this.#active),
      revision: descriptor?.revision, error: this.#error }
  }
  subscribe = listener => { this.#listeners.add(listener); return () => this.#listeners.delete(listener) }
  refresh = () => {
    const run = async () => {
      if (this.#closed) return
      const desired = this.#desired()
      if (!this.#error && JSON.stringify(desired) === JSON.stringify(this.#active)) return
      // Keep already offered tools alive until all Mayori replies have finished.
      if (this.ctx.agents.list().some(agent => agent.status === 'running' && this.ctx.agentPresets.composedPreset(agent.ctx) === 'mayori')) return
      const results = await Promise.allSettled([...this.#listeners].map(listener => listener(desired)))
      const failed = results.find(result => result.status === 'rejected')
      if (failed) { this.#error = failed.reason?.message ?? String(failed.reason); throw failed.reason }
      this.#active = desired
      this.#error = null
    }
    this.#work = this.#work.then(run, run)
    return this.#work
  }
  update = async (plugins, revision) => {
    validatePlugins(plugins)
    await this.ctx.settings.update(PLUGIN_SETTINGS_NS, plugins, revision)
    await this.refresh()
    return this.read()
  }
}
