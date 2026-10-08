import z from '@deepseek-ai/schemastery'
import { PersistentPluginSettingsProvider } from '../features/plugins/host/provider.js'
import { DEFAULT_PLUGINS } from '../features/plugins/shared/settings.js'
import { Config as CompactionConfig } from '../features/compaction/host/config.js'
import { DEFAULT_COMPACTION } from '../features/compaction/shared/settings.js'
import { isLoopbackRequest, readJsonBody, sendJson } from './transport/http.js'

export const name = 'mayori-plugin-settings'
export const inject = ['settings', 'webServer', 'agents', 'agentPresets']
export const Config = z.object({ ...Object.fromEntries(Object.entries(DEFAULT_PLUGINS).map(([key, value]) => [key, z.boolean().default(value).volatile()])),
  compactionSettings: CompactionConfig.default(DEFAULT_COMPACTION).volatile() })

export function apply(ctx, config) {
  const provider = new PersistentPluginSettingsProvider(ctx, config)
  ctx.effect(() => ctx.settings.configure({ auto: false }, ctx.fiber))
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: '/mayori/plugins', handler: async (req, res) => {
    if (!isLoopbackRequest(req)) { res.writeHead(403); res.end(); return }
    try {
      if (req.method === 'POST') sendJson(res, 200, { ok: true, value: provider.read() })
      else if (req.method === 'PUT') {
        const { plugins, revision, compaction } = await readJsonBody(req)
        sendJson(res, 200, { ok: true, value: await provider.update(plugins, revision, compaction) })
      } else { res.writeHead(405, { allow: 'POST, PUT' }); res.end() }
    } catch (error) { sendJson(res, 400, { ok: false, error: error.message }) }
  } }), 'mayori: plugin preferences route')
}
