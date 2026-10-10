import assert from 'node:assert/strict'
import { Readable, Writable } from 'node:stream'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import test from 'node:test'
import { createMayoriRoute } from '../../src/host/transport/routes.js'

test('image routes stream bytes, revalidate ETags and release cache leases on every outcome', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mayori-route-images-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const path = join(root, 'image.webp'), bytes = Buffer.from('original image bytes')
  await writeFile(path, bytes)
  let calls = 0, releases = 0
  const media = { read: async () => { calls++; return { path, type: 'image/webp', etag: '"same"', release: () => releases++ } } }
  const route = createMayoriRoute({ media, library: { image: media.read } })
  async function asset(kind, headers = {}) {
    const req = { url: `/mayori/characters/${kind}/${'a'.repeat(64)}/avatar`, method: 'GET',
      headers: { host: '127.0.0.1:3081', 'sec-fetch-site': 'same-origin', ...headers } }
    const chunks = []
    const res = new Writable({ write(chunk, _encoding, next) { chunks.push(chunk); next() } })
    res.writeHead = (status, values) => { res.status = status; res.headers = values; res.headersSent = true }
    await route.handler(req, res)
    return { ...res, body: Buffer.concat(chunks) }
  }
  const response = await asset('media')
  assert.equal(response.status, 200)
  assert.deepEqual(response.body, bytes)
  assert.equal(response.headers['content-length'], bytes.length)
  assert.equal(response.headers['x-content-type-options'], 'nosniff')
  assert.equal((await asset('card-image', { 'if-none-match': '"same"' })).status, 304)
  assert.equal(releases, 2)
  for (const headers of [{ 'sec-fetch-site': 'cross-site' }, { origin: 'http://other.localhost:3081' }, { 'sec-fetch-site': undefined }, { host: 'example.com' }]) {
    assert.equal((await asset('media', headers)).status, 403)
  }
  assert.equal(calls, 2)
  await rm(path)
  assert.equal((await asset('media')).status, 404)
  assert.equal(releases, 3)
})

async function request(route, endpoint, payload, options = {}) {
  const req = Readable.from([Buffer.from(options.body ?? JSON.stringify(payload))])
  req.url = `${route.path}/${endpoint}`
  req.method = options.method ?? 'POST'
  req.headers = { host: '127.0.0.1:3081', origin: 'http://127.0.0.1:3081', 'sec-fetch-site': 'same-origin', ...options.headers }
  const res = {
    writeHead(status, headers) { this.status = status; this.headers = headers },
    end(body) { this.body = body },
  }
  await route.handler(req, res)
  return res
}

test('HTTP adapter dispatches each existing endpoint to its owning capability without constructing providers', async () => {
  const calls = []
  const service = name => new Proxy({}, {
    get: (_target, method) => (...args) => { calls.push([name, method, args]); return `${name}.${method}` },
  })
  const route = createMayoriRoute(Object.fromEntries(['library', 'personas', 'presets', 'sessionPresets', 'characterSessions', 'trajectoryContext', 'historyDetails', 'messageRevisions'].map(name => [name, service(name)])))
  const input = { id: 'resource', ids: ['session'], sessionId: 'session', characterId: 'character', workspaceId: 'workspace', greetingIndex: 1, index: 2, personaId: 'persona', presetId: 'preset', selection: 'current', seq: 9, text: 'Changed' }
  const cases = [
    ['list', 'library', 'query', [input], 'library.query'],
    ['get', 'library', 'get', [input.id], 'library.get'],
    ['import', 'library', 'import', [input], 'library.import'],
    ['remove', 'library', 'remove', [input.id], { removed: true }],
    ['history-details', 'historyDetails', 'read', [input.ids], 'historyDetails.read'],
    ['persona-list', 'personas', 'list', [], 'personas.list'],
    ['persona-save', 'personas', 'save', [input], 'personas.save'],
    ['persona-remove', 'personas', 'remove', [input.id], { removed: true }],
    ['persona-default', 'personas', 'setDefault', [input.id], { saved: true }],
    ['preset-list', 'presets', 'list', [], 'presets.list'],
    ['preset-save', 'presets', 'save', [input], 'presets.save'],
    ['preset-remove', 'presets', 'remove', [input.id], { removed: true }],
    ['preset-default', 'presets', 'setDefault', [input.id], { saved: true }],
    ['session-preset-state', 'sessionPresets', 'state', [input.sessionId], 'sessionPresets.state'],
    ['session-preset', 'sessionPresets', 'select', [input.sessionId, input.presetId], 'sessionPresets.select'],
    ['prepare-campaign', 'characterSessions', 'prepareCampaign', [], 'characterSessions.prepareCampaign'],
    ['start', 'characterSessions', 'create', [input.characterId, input.workspaceId, input.greetingIndex], 'characterSessions.create'],
    ['play', 'characterSessions', 'select', [input.sessionId, input.characterId], 'characterSessions.select'],
    ['session-state', 'characterSessions', 'state', [input.sessionId], 'characterSessions.state'],
    ['swipe', 'characterSessions', 'swipe', [input.sessionId, input.index], 'characterSessions.swipe'],
    ['session-persona', 'characterSessions', 'setPersona', [input.sessionId, input.personaId], 'characterSessions.setPersona'],
    ['trajectory-context', 'trajectoryContext', 'inspect', [input.sessionId, input.selection], 'trajectoryContext.inspect'],
    ['message-inspect', 'messageRevisions', 'inspect', [input.sessionId, input.seq], 'messageRevisions.inspect'],
    ['message-revisions', 'messageRevisions', 'list', [input.sessionId], 'messageRevisions.list'],
    ['message-edit', 'messageRevisions', 'edit', [input.sessionId, input.seq, input.text, input.mode], 'messageRevisions.edit'],
    ['message-regenerate', 'messageRevisions', 'regenerate', [input.sessionId, input.seq], 'messageRevisions.regenerate'],
  ]
  for (const [endpoint, name, method, args, value] of cases) {
    const response = await request(route, endpoint, input)
    assert.equal(response.status, 200, endpoint)
    assert.equal(response.headers['cache-control'], 'no-store')
    assert.deepEqual(JSON.parse(response.body), { ok: true, value }, endpoint)
    assert.deepEqual(calls.at(-1), [name, method, args], endpoint)
  }
  assert.equal(calls.length, cases.length)
})

test('HTTP adapter preserves same-origin checks, method restrictions and error envelopes', async () => {
  let calls = 0
  const route = createMayoriRoute({ library: { query() { calls++; throw new Error('catalog unavailable') } } })
  for (const headers of [
    { origin: 'http://other.localhost:3081' },
    { host: 'example.com', origin: 'http://example.com' },
    { 'sec-fetch-site': 'cross-site' },
    { origin: undefined },
  ]) assert.equal((await request(route, 'list', {}, { headers })).status, 403)
  const method = await request(route, 'list', {}, { method: 'GET' })
  assert.equal(method.status, 405)
  assert.equal(method.headers.allow, 'POST')
  assert.equal((await request(route, 'list', {}, { body: '{invalid' })).status, 400)
  assert.equal((await request(route, 'unknown', {})).status, 404)
  assert.equal((await request(route, 'start', null)).status, 400)
  assert.equal(calls, 0)
  const failure = await request(route, 'list', {})
  assert.equal(failure.status, 400)
  assert.deepEqual(JSON.parse(failure.body), { ok: false, error: 'catalog unavailable' })
  assert.equal(calls, 1)
})
