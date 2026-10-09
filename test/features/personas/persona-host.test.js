import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FileSystemPersonaStore } from '../../../src/features/personas/host/store.js'
import { FileSystemPersonaProvider } from '../../../src/features/personas/host/provider.js'
import { ImageStore } from '../../../src/features/media/host/store.js'
import { Context } from '@deepseek-ai/cordis'
import sharp from 'sharp'

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

test('persona provider migrates avatars durably and validates uploads before storing resources', async t => {
  const previous = await store(t)
  const bytes = await sharp({ create: { width: 16, height: 16, channels: 3, background: '#123' } }).png().toBuffer()
  const avatar = `data:image/png;base64,${bytes.toString('base64')}`
  const persona = await previous.save({ name: 'Алекс', avatar })
  const media = new ImageStore(join(previous.root, 'media'))
  const provider = new FileSystemPersonaProvider(new Context(), previous.root, media)
  const listed = (await provider.list()).personas[0]
  assert.match(listed.avatar, /^\/mayori\/characters\/media\/[a-f0-9]{64}\/avatar$/)
  assert.match(listed.avatarReference, /^mayori-media:/)
  assert.equal((await previous.resolve(persona.id)).avatar, listed.avatarReference)
  assert.equal((await provider.save({ ...listed, name: 'Изменён' })).avatar, listed.avatar)
  assert.ok(!(await readFile(previous.path, 'utf8')).includes('data:image/'))
  let stored = 0
  provider.media = { put() { stored++; throw new Error('must validate first') } }
  await assert.rejects(provider.save({ name: 'x', avatar: `data:image/png;base64,${'A'.repeat(2_800_004)}` }), /2 МБ/)
  await assert.rejects(provider.save({ name: 'x', avatar: 123 }), /поля/)
  assert.equal(stored, 0)
  await media.close()
})
