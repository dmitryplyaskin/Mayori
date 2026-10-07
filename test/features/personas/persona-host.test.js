import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FileSystemPersonaStore } from '../../../src/features/personas/host/store.js'

async function store(t) {
  const root = await mkdtemp(join(tmpdir(), 'mayori-personas-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  return new FileSystemPersonaStore(root)
}

test('personas and default survive reopening; editing and deletion preserve detached chat snapshots', async t => {
  const first = await store(t)
  const persona = await first.save({ name: 'Алекс', description: '{{user}} — путешественник.', title: 'Разведчик' })
  await first.setDefault(persona.id)
  const reopened = new FileSystemPersonaStore(first.root)
  const snapshot = await reopened.resolve()
  assert.equal(snapshot.name, 'Алекс')
  assert.equal(snapshot.title, 'Разведчик')
  await reopened.save({ ...persona, name: 'Другой' })
  assert.equal(snapshot.name, 'Алекс')
  await reopened.remove(persona.id)
  assert.equal(snapshot.description, '{{user}} — путешественник.')
  assert.deepEqual(await reopened.list(), { personas: [], defaultId: null })
  assert.equal((await reopened.resolve()).name, 'Игрок')
})

test('catalog mutations serialize; rejected writes do not poison subsequent writes', async t => {
  const s = await store(t)
  await assert.rejects(s.save({ id: '../../../escape', name: 'Bad' }), /не найдена/)
  const saved = await Promise.all(['А', 'Б', 'В'].map(name => s.save({ name })))
  assert.equal((await s.list()).personas.length, 3)
  await assert.rejects(s.setDefault('missing'), /не найдена/)
  await s.setDefault(saved[0].id)
  assert.equal((await s.resolve()).name, 'А')
})

test('validates persona names, text, avatars and persisted corruption', async t => {
  const s = await store(t)
  for (const input of [{ name: ' ' }, { name: 'x', description: 5 }, { name: 'x', avatar: 'javascript:alert(1)' },
    { name: 'x', avatar: 'data:image/svg+xml;base64,PHN2Zz4=' }]) assert.throws(() => s.save(input))
  await s.save({ name: 'x' })
  await writeFile(s.path, '{"format":2,"personas":[]}')
  await assert.rejects(s.list(), /повреждён/)
})
