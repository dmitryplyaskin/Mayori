/** Keyless acceptance through the public DSH CLI; all data belongs to a temporary home. */
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { once } from 'node:events'
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

if (!process.argv[2]) throw new Error('Usage: node scripts/storage-isolation-smoke.js <dsh-cli-bin.js> (or <pnpm.js> --published)')
const entry = resolve(process.argv[2])
const published = process.argv[3] === '--published'
const prefix = published ? [entry, 'dlx', '@deepseek-ai/dsh@0.2.1-alpha.2'] : [entry]
const project = resolve(fileURLToPath(new URL('../', import.meta.url)))
const home = await mkdtemp(join(tmpdir(), 'mayori-native-isolation-'))
const dataRoot = join(home, 'rpg-data')
const env = { ...process.env, DSH_HOME: home, DSH_TELEMETRY_DISABLED: '1' }
const workspace = join(home, 'same-workspace-for-both-profiles')
const processes = []
await mkdir(workspace)

async function command(args) {
  const child = spawn(process.execPath, [...prefix, ...args], { env, cwd: project, stdio: ['ignore', 'pipe', 'pipe'] })
  let stdout = '', stderr = ''
  child.stdout.on('data', data => { stdout += data })
  child.stderr.on('data', data => { stderr += data })
  const [code] = await once(child, 'exit')
  assert.equal(code, 0, stderr)
  return stdout
}

const probePath = join(home, 'probe.mjs')
await writeFile(probePath, `
export const name = 'storage-isolation-probe'
export const inject = ['webServer', 'workspaceRegistry', 'sessionController', 'sessions', 'sessionPersistence', 'agents', 'loader', 'appExit']
export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({ kind: 'exact', path: '/_storage-probe', handler: async (req, res) => {
    try {
      if (req.method !== 'POST' || req.headers.origin !== 'http://' + req.headers.host
        || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) {
        res.writeHead(403); res.end(JSON.stringify({ error: 'Probe origin or loopback mismatch', remote: req.socket.remoteAddress, origin: req.headers.origin, host: req.headers.host })); return
      }
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const input = JSON.parse(Buffer.concat(chunks).toString())
      if (input.action === 'stop') {
        res.end('{}')
        setTimeout(() => ctx.appExit(0), 25)
        return
      }
      let created
      if (input.action === 'create') {
        const workspace = await ctx.workspaceRegistry.create(input.path)
        created = await ctx.sessionController.create({ workspaceId: workspace.id })
        await ctx.sessionController.rename({ sessionId: created.sessionId, title: input.title })
        await ctx.sessions.flush(ctx.agents.get(created.sessionId).session)
      }
      const configs = Object.fromEntries([...ctx.loader.entries()].filter(entry =>
        ['session-persistence-jsonl', 'storage-json', 'attachment-local', 'credentials', 'session-query-sqlite', 'mayori-director'].includes(entry.options.id)
      ).map(entry => [entry.options.id, entry.fiber.config]))
      const ids = (await ctx.sessionPersistence.list()).map(item => item.header.id)
      const rows = await ctx.sessionController.list({}, new AbortController().signal)
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ ids, rows: rows.items.map(item => item.sessionId), configs, created }))
    } catch (error) { res.writeHead(500); res.end(JSON.stringify({ error: error.message })) }
  } }))
}
`)

async function boot(profile) {
  const child = spawn(process.execPath, [...prefix, '--profile', profile, '--port', '0', '--no-open'], {
    env, cwd: project, stdio: ['ignore', 'pipe', 'pipe'],
  })
  processes.push(child)
  let output = ''
  const origin = await new Promise((accept, reject) => {
    const timer = setTimeout(() => reject(new Error(`Startup timeout: ${output.slice(-4000)}`)), 45000)
    const collect = data => {
      output += String(data).replace(/([?&]token=)[A-Za-z0-9_-]+/g, '$1[redacted]')
      const match = output.match(/http:\/\/127\.0\.0\.1:\d+/)
      if (match) { clearTimeout(timer); accept(match[0]) }
    }
    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    child.once('error', error => { clearTimeout(timer); reject(error) })
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Startup exited ${code}: ${output.slice(-4000)}`)) })
  })
  const call = async body => {
    const response = await fetch(`${origin}/_storage-probe`, {
      method: 'POST', headers: { 'content-type': 'application/json', origin },
      body: JSON.stringify(body), signal: AbortSignal.timeout(20000),
    })
    const text = await response.text()
    assert.ok(text, 'Empty probe response with HTTP ' + response.status + '\n' + output.slice(-4000))
    const result = JSON.parse(text)
    assert.equal(response.ok, true, JSON.stringify(result))
    return result
  }
  child.stopGracefully = async () => {
    const exited = once(child, 'exit')
    await call({ action: 'stop' })
    await exited
  }
  return { child, call }
}

async function stop(child) {
  if (child.exitCode !== null || child.signalCode !== null) return
  if (child.stopGracefully) return child.stopGracefully()
  const exited = once(child, 'exit')
  if (published && process.platform === 'win32') {
    spawnSync('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' })
  } else child.kill('SIGTERM')
  await exited
}

try {
  await command(['--profile', 'mayori', '--from-default-profile', 'web', '--dump-config'])
  await command(['plugin', '--profile', 'mayori', 'add', project])
  await command(['--profile', 'coding', '--from-default-profile', 'web', '--dump-config'])
  const probePatch = '- insert:\n    - id: storage-isolation-probe\n      name: ' + JSON.stringify(probePath) + '\n'
  await writeFile(join(home, 'profiles', 'mayori', 'cordis.patch.yml'),
    '- id: mayori-storage\n  config:\n    root: ' + JSON.stringify(dataRoot) + '\n' + probePatch)
  await writeFile(join(home, 'profiles', 'coding', 'cordis.patch.yml'), probePatch)
  const dump = await command(['--profile', 'mayori', '--dump-config'])
  assert.match(dump, /mayoriStorage\.path\('sessions'\)/)
  assert.match(dump, /name: dsh-mayori\/storage/)
  const [mayori, coding] = await Promise.all([boot('mayori'), boot('coding')])
  const rpg = await mayori.call({ action: 'create', path: workspace, title: 'RPG isolation' })
  const code = await coding.call({ action: 'create', path: workspace, title: 'Coding isolation' })
  const assertCatalog = (result, expected, excluded) => {
    assert.ok(result.ids.includes(expected))
    assert.ok(!result.ids.includes(excluded))
    assert.ok(result.rows.includes(expected))
    assert.ok(!result.rows.includes(excluded))
  }
  assertCatalog(await mayori.call({}), rpg.created.sessionId, code.created.sessionId)
  assertCatalog(await coding.call({}), code.created.sessionId, rpg.created.sessionId)
  assert.equal(rpg.configs['session-persistence-jsonl'].root, join(dataRoot, 'sessions'))
  assert.equal(rpg.configs['storage-json'].root, join(dataRoot, 'storages'))
  assert.equal(rpg.configs['attachment-local'].dshHome, dataRoot)
  assert.equal(rpg.configs.credentials.dshHome, dataRoot)
  assert.equal(rpg.configs['session-query-sqlite'].path, join(dataRoot, 'cache', 'session-search.sqlite'))
  assert.equal(rpg.configs['mayori-director'].charactersPath, join(dataRoot, 'mayori', 'characters'))
  assert.equal(code.configs['session-persistence-jsonl'].root, join(home, 'sessions'))
  assert.notEqual(await readFile(join(dataRoot, 'storages', 'workspace.json'), 'utf8'),
    await readFile(join(home, 'storages', 'workspace.json'), 'utf8'))
  await Promise.all([stop(mayori.child), stop(coding.child)])
  const [resumedMayori, resumedCoding] = await Promise.all([boot('mayori'), boot('coding')])
  assertCatalog(await resumedMayori.call({}), rpg.created.sessionId, code.created.sessionId)
  assertCatalog(await resumedCoding.call({}), code.created.sessionId, rpg.created.sessionId)
  console.log(JSON.stringify({ ok: true, home, sharedWorkspace: true, nativeLaunch: true, coldIsolation: true }))
} finally {
  await Promise.all(processes.map(stop))
}
