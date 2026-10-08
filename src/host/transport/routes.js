import { isLoopbackRequest, readJsonBody, sendJson } from './http.js'

const ROUTE_PATH = '/mayori/characters'
const message = error => error instanceof Error ? error.message : String(error)

/** Adapt HTTP requests to already constructed capability services. */
export function createMayoriRoute({ library, personas, characterSessions, trajectoryContext, historyDetails, messageRevisions }) {
  const route = {
    kind: 'prefix',
    path: ROUTE_PATH,
    handler: async (req, res) => {
      if (!isLoopbackRequest(req)) {
        res.writeHead(403); res.end('forbidden'); return
      }
      if (req.method !== 'POST') {
        res.writeHead(405, { allow: 'POST' }); res.end(); return
      }
      const endpoint = new URL(req.url, 'http://dsh.internal').pathname.slice(ROUTE_PATH.length + 1)
      let payload
      try {
        payload = await readJsonBody(req)
      } catch (error) {
        sendJson(res, error instanceof RangeError ? 413 : 400, { ok: false, error: message(error) })
        return
      }
      try {
        if (endpoint === 'list') sendJson(res, 200, { ok: true, value: { cards: await library.list() } })
        else if (endpoint === 'history-details') sendJson(res, 200, { ok: true, value: await historyDetails.read(payload?.ids) })
        else if (endpoint === 'persona-list') sendJson(res, 200, { ok: true, value: await personas.list() })
        else if (endpoint === 'persona-save') sendJson(res, 200, { ok: true, value: await personas.save(payload) })
        else if (['persona-remove', 'persona-default', 'session-state', 'swipe', 'session-persona', 'trajectory-context', 'message-inspect', 'message-edit', 'message-regenerate'].includes(endpoint)) {
          if (!payload || typeof payload !== 'object') throw new TypeError('Некорректный запрос.')
          let value
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
