import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import sharp from 'sharp'
import { crc32 } from 'node:zlib'
import { FileSystemCharacterLibraryStore } from '../../../src/features/characters/host/store.js'
import { ImageStore } from '../../../src/features/media/host/store.js'
import { mediaId, imageSource, originalImage } from '../../../src/features/media/shared/image.js'
import { mediaConfig } from '../../../src/features/media/host/config.js'
import { FileSystemCharacterSessionStore } from '../../../src/features/character-session/host/store.js'
import { characterSnapshot } from '../../../src/features/character-session/domain/character.js'

test('reimporting the same card with another portrait changes its resource URL and preserves old originals', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mayori-portrait-reimport-'))
  const images = new ImageStore(join(root, 'media')), library = new FileSystemCharacterLibraryStore(root, images)
  t.after(async () => { await library.close(); await images.close(); await rm(root, { recursive: true, force: true }) })
  const card = { spec: 'chara_card_v2', spec_version: '2.0', data: { name: 'Same character' } }
  const text = Buffer.from('chara\0' + Buffer.from(JSON.stringify(card)).toString('base64'))
  const body = Buffer.concat([Buffer.from('tEXt'), text]), length = Buffer.alloc(4), checksum = Buffer.alloc(4)
  length.writeUInt32BE(text.length); checksum.writeUInt32BE(crc32(body))
  const metadata = Buffer.concat([length, body, checksum])
  const portraits = []
  for (const background of ['#abc', '#cba']) {
    const png = await sharp({ create: { width: 32, height: 32, channels: 3, background } }).png().toBuffer()
    const bytes = Buffer.concat([png.subarray(0, -12), metadata, png.subarray(-12)])
    assert.equal((await library.import({ files: [{ name: 'card.png', type: 'image/png', base64: bytes.toString('base64') }] })).imported, 1)
    const summary = (await library.query()).cards[0]
    const full = await library.get(summary.id)
    assert.equal(summary.image, imageSource(full.image, 'gallery'))
    portraits.push({ summary, full, bytes })
  }
  assert.equal(portraits[0].summary.id, portraits[1].summary.id)
  assert.notEqual(portraits[0].summary.image, portraits[1].summary.image)
  await library.remove(portraits[0].summary.id)
  for (const portrait of portraits) assert.deepEqual(await readFile((await images.read(mediaId(portrait.full.image), 'original')).path), portrait.bytes)
})

test('images keep original bytes and lazily generate small cached variants with stable references', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mayori-images-tests-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const source = await sharp({ create: { width: 768, height: 256, channels: 3, background: '#704cba' } }).png().toBuffer()
  const store = new ImageStore(root)
  const reference = await store.put(`data:image/png;base64,${source.toString('base64')}`)
  const id = mediaId(reference)
  assert.equal(await store.put(reference), reference)
  const [avatar, duplicate] = await Promise.all([store.read(id, 'avatar'), store.read(id, 'avatar')])
  assert.equal(avatar.path, duplicate.path)
  assert.equal(avatar.etag, duplicate.etag)
  const dimensions = await sharp(await readFile(avatar.path)).metadata()
  assert.equal(dimensions.width, 96)
  assert.equal(dimensions.height, 32)
  const original = await store.read(id, 'original')
  assert.deepEqual(await readFile(original.path), source)
  const reopened = new ImageStore(root)
  const cached = await reopened.read(id, 'avatar')
  assert.equal(cached.path, avatar.path)
  avatar.release(); duplicate.release(); cached.release()
  await store.close(); await reopened.close()
  assert.equal(imageSource(reference), `/mayori/characters/media/${id}/avatar`)
  assert.equal(originalImage(imageSource(reference)), `/mayori/characters/media/${id}/original`)
  assert.equal(imageSource('https://untrusted/image.png'), null)
  await assert.rejects(store.read('../escape', 'original'), /изображение/)
  assert.throws(() => mediaConfig({ concurrency: 0 }), /concurrency/)
  assert.throws(() => mediaConfig({ quality: 101 }), /quality/)
})

test('thumbnail disk budget evicts derived files and leaves originals intact', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mayori-image-budget-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const store = new ImageStore(root, { maxVariantFiles: 1 })
  const source = await sharp({ create: { width: 300, height: 100, channels: 3, background: '#fab' } }).png().toBuffer()
  const id = mediaId(await store.put(`data:image/png;base64,${source.toString('base64')}`))
  const avatar = await store.read(id, 'avatar'); avatar.release()
  const gallery = await store.read(id, 'gallery'); gallery.release()
  await store.pruning
  await assert.rejects(readFile(avatar.path), { code: 'ENOENT' })
  assert.deepEqual(await readFile((await store.read(id, 'original')).path), source)
  const rebuilt = await store.read(id, 'avatar'); rebuilt.release(); await store.close()
  assert.ok((await readFile(rebuilt.path)).length > 0)
})

test('durable session image references survive removal of the library copy', async t => {
  const root = await mkdtemp(join(tmpdir(), 'mayori-image-snapshots-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const images = new ImageStore(join(root, 'media'))
  const source = await sharp({ create: { width: 32, height: 32, channels: 3, background: '#235' } }).png().toBuffer()
  const reference = await images.put(`data:image/png;base64,${source.toString('base64')}`)
  const libraryCopy = join(root, 'library.png')
  await writeFile(libraryCopy, source)
  const selections = new FileSystemCharacterSessionStore(root)
  await selections.save('chat', { ...characterSnapshot({ id: 'a'.repeat(64), name: 'NPC', data: { name: 'NPC', description: 'Stable' } }), image: reference }, () => {})
  await rm(libraryCopy)
  assert.equal((await selections.read('chat')).image, reference)
  assert.deepEqual(await readFile((await images.read(mediaId(reference), 'original')).path), source)
})
