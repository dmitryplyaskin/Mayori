import { isLoopbackRequest, isLoopbackAssetRequest, readJsonBody, sendJson } from './http.js'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'

const ROUTE_PATH = '/mayori/characters'
const message = error => error instanceof Error ? error.message : String(error)

/** Adapt HTTP requests to already constructed capability services. */
export function createMayoriRoute({ library, personas, presets, sessionPresets, characterSessions, trajectoryContext, historyDetails, messageRevisions, media }) {
  const route = {
    kind: 'prefix',
    path: ROUTE_PATH,
    handler: async (req, res) => {
      const pathname = new URL(req.url, 'http://dsh.internal').pathname
      const asset = pathname.match(/^\/mayori\/characters\/(media|card-image)\/([a-f0-9]{64})\/(avatar|gallery|preview|original)$/)
      if (req.method === 'GET' && asset) {
        if (!isLoopbackAssetRequest(req)) { res.writeHead(403); res.end('forbidden'); return }
        let file
        try {
          file = asset[1] === 'media' ? await media.read(asset[2], asset[3]) : await library.image(asset[2], asset[3])
          const info = await stat(file.path)
          const headers = { 'content-type': file.type, 'cache-control': asset[1] === 'media' ? 'private, max-age=3600' : 'private, no-cache', etag: file.etag, 'x-content-type-options': 'nosniff' }
          if (req.headers['if-none-match'] === file.etag) { res.writeHead(304, headers); res.end(); return }
          res.writeHead(200, { ...headers, 'content-length': info.size })
          await pipeline(createReadStream(file.path), res)
        } catch {
          if (!res.headersSent) { res.writeHead(404); res.end() }
          else res.destroy()
        } finally { file?.release?.() }
        return
      }
      if (!isLoopbackRequest(req)) {
        res.writeHead(403); res.end('forbidden'); return
      }
      if (req.method !== 'POST') {
        res.writeHead(405, { allow: 'POST' }); res.end(); return
      }
      const endpoint = pathname.slice(ROUTE_PATH.length + 1)
      let payload
      try {
        payload = await readJsonBody(req)
      } catch (error) {
        sendJson(res, error instanceof RangeError ? 413 : 400, { ok: false, error: message(error) })
        return
      }
      try {
        if (endpoint === 'list') sendJson(res, 200, { ok: true, value: await library.query(payload ?? {}) })
        else if (endpoint === 'get') sendJson(res, 200, { ok: true, value: await library.get(payload?.id) })
        else if (endpoint === 'history-details') sendJson(res, 200, { ok: true, value: await historyDetails.read(payload?.ids) })
        else if (endpoint === 'persona-list') sendJson(res, 200, { ok: true, value: await personas.list() })
        else if (endpoint === 'persona-save') sendJson(res, 200, { ok: true, value: await personas.save(payload) })
        else if (endpoint === 'preset-list') sendJson(res, 200, { ok: true, value: await presets.list() })
        else if (endpoint === 'preset-save') sendJson(res, 200, { ok: true, value: await presets.save(payload) })
        else if (['preset-remove', 'preset-default', 'session-preset-state', 'session-preset', 'persona-remove', 'persona-default', 'session-state', 'swipe', 'session-persona', 'trajectory-context', 'message-inspect', 'message-edit', 'message-regenerate'].includes(endpoint)) {
          if (!payload || typeof payload !== 'object') throw new TypeError('Некорректный запрос.')
          let value
          if (endpoint === 'preset-remove') { await presets.remove(payload.id); value = { removed: true } }
          if (endpoint === 'preset-default') { await presets.setDefault(payload.id); value = { saved: true } }
          if (endpoint === 'session-preset-state') value = await sessionPresets.state(payload.sessionId)
          if (endpoint === 'session-preset') value = await sessionPresets.select(payload.sessionId, payload.presetId)
          if (endpoint === 'persona-remove') { await personas.remove(payload.id); value = { removed: true } }
          if (endpoint === 'persona-default') { await personas.setDefault(payload.id); value = { saved: true } }
          if (endpoint === 'session-state') value = await characterSessions.state(payload.sessionId)
          if (endpoint === 'swipe') value = await characterSessions.swipe(payload.sessionId, payload.index)
          if (endpoint === 'session-persona') value = await characterSessions.setPersona(payload.sessionId, payload.personaId)
          if (endpoint === 'trajectory-context') value = trajectoryContext.inspect(payload.sessionId, payload.selection)
          if (endpoint === 'message-inspect') value = await messageRevisions.inspect(payload.sessionId, payload.seq)
          if (endpoint === 'message-edit') value = await messageRevisions.edit(payload.sessionId, payload.seq, payload.text)
          if (endpoint === 'message-regenerate') value = await messageRevisions.regenerate(payload.sessionId, payload.seq)
          sendJson(res, 200, { ok: true, value })
        }
        else if (endpoint === 'import') sendJson(res, 200, { ok: true, value: await library.import(payload) })
        else if (endpoint === 'remove') {
          if (payload === null || typeof payload !== 'object') throw new TypeError('Ожидался идентификатор карточки.')
          await library.remove(payload.id)
          sendJson(res, 200, { ok: true, value: { removed: true } })
        } else if (endpoint === 'prepare-campaign') {
          sendJson(res, 200, { ok: true, value: await characterSessions.prepareCampaign() })
        } else if (endpoint === 'start') {
          if (payload === null || typeof payload !== 'object') throw new TypeError('Ожидались персонаж и кампания.')
          sendJson(res, 200, { ok: true, value: await characterSessions.create(payload.characterId, payload.workspaceId, payload.greetingIndex) })
        } else if (endpoint === 'play') {
          if (payload === null || typeof payload !== 'object') throw new TypeError('Ожидались персонаж и сессия.')
          sendJson(res, 200, { ok: true, value: await characterSessions.select(payload.sessionId, payload.characterId) })
        } else sendJson(res, 404, { ok: false, error: 'Неизвестная операция библиотеки.' })
      } catch (error) {
        sendJson(res, 400, { ok: false, error: message(error) })
      }
    },
  }
  return route
}
