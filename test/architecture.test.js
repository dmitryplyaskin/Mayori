import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = fileURLToPath(new URL('../', import.meta.url))
const portable = path => relative(root, path).replaceAll('\\', '/')

async function sources(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const children = await Promise.all(entries.map(entry => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? sources(path) : /\.(js|jsx)$/.test(path) ? [path] : []
  }))
  return children.flat()
}

async function sourceGraph() {
  const files = await sources(resolve(root, 'src'))
  files.push(resolve(root, 'index.js'))
  return new Map(await Promise.all(files.map(async file => {
    const text = await readFile(file, 'utf8')
    const imports = [...text.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?)(['"])([^'"]+)\1/g)].map(match => match[2])
    return [file, imports]
  })))
}

function layer(path) {
  const name = portable(path)
  if (name.startsWith('src/client/') || name.includes('/client/')) return 'client'
  if (name.startsWith('src/host/') || name.includes('/host/') || name === 'index.js') return 'host'
  return 'shared'
}

test('source layers resolve imports, keep platform boundaries and contain no dependency cycles', async () => {
  const graph = await sourceGraph()
  const dependencies = new Map()
  for (const [file, imports] of graph) {
    const name = portable(file)
    assert.ok(name === 'index.js' || /^src\/(?:host|client|shared)\//.test(name)
      || /^src\/features\/[^/]+\/(?:host|client|domain|shared)\//.test(name), `Source has no architectural owner: ${name}`)
    const ownLayer = layer(file)
    const local = []
    for (const specifier of imports) {
      if (!specifier.startsWith('.')) {
        if (ownLayer !== 'host') assert.ok(!specifier.startsWith('node:'), `${portable(file)} imports ${specifier}`)
        if (ownLayer === 'shared') assert.fail(`${portable(file)} depends on platform package ${specifier}`)
        if (ownLayer === 'client') assert.ok(!specifier.startsWith('@deepseek-ai/') || specifier === '@deepseek-ai/dsh-client-ui-primitives', `${portable(file)} imports Host SDK ${specifier}`)
        if (ownLayer === 'host') assert.ok(!/^react(?:-dom)?(?:\/|$)/.test(specifier), `${portable(file)} imports browser UI`)
        continue
      }
      const target = resolve(dirname(file), specifier)
      assert.ok(graph.has(target), `${portable(file)} has missing import ${specifier}`)
      const targetLayer = layer(target)
      assert.ok(targetLayer === ownLayer || targetLayer === 'shared', `${portable(file)} crosses into ${targetLayer}: ${portable(target)}`)
      if (portable(file).startsWith('src/features/')) {
        assert.ok(!portable(target).startsWith('src/host/'), `${portable(file)} imports Host composition`)
        assert.ok(!/^src\/client\/(plugin\.js|styles\.js|shell\/)/.test(portable(target)), `${portable(file)} imports client composition`)
      }
      local.push(target)
    }
    dependencies.set(file, local)
  }
  const visited = new Set()
  const active = new Set()
  function visit(file) {
    assert.ok(!active.has(file), `Dependency cycle at ${portable(file)}`)
    if (visited.has(file)) return
    active.add(file)
    for (const target of dependencies.get(file)) visit(target)
    active.delete(file)
    visited.add(file)
  }
  for (const file of graph.keys()) visit(file)
})

test('package manifest ships the complete Host import graph while browser sources stay in the build', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'))
  const graph = await sourceGraph()
  // npm always includes package.json even with an explicit files allowlist.
  const included = file => file === 'package.json' || manifest.files.some(entry => file === entry || file.startsWith(`${entry}/`))
  const visited = new Set()
  function inspect(file) {
    if (visited.has(file)) return
    visited.add(file)
    assert.ok(included(portable(file)), `Package omits ${portable(file)}`)
    for (const specifier of graph.get(file) ?? []) {
      if (specifier.startsWith('.')) inspect(resolve(dirname(file), specifier))
    }
  }
  for (const target of Object.values(manifest.exports)) {
    assert.ok(included(target.slice(2)), `Package omits entry ${target}`)
    if (graph.has(resolve(root, target))) inspect(resolve(root, target))
  }
  for (const file of graph.keys()) {
    if (layer(file) === 'client') assert.ok(!included(portable(file)), `Package includes unbuilt browser source ${portable(file)}`)
  }
  assert.equal(manifest.exports['.'], './index.js')
  assert.equal(manifest.exports['./client'], './lib/client.js')
  assert.equal(manifest.exports['./dice'], './src/host/dice-plugin.js')
  assert.equal(manifest.exports['./rules'], './src/host/rules-plugin.js')
  assert.equal(manifest.exports['./roll-history'], './src/host/roll-history-plugin.js')
})
