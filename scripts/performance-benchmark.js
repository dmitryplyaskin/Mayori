/** Reproducible local comparison; creates only temporary synthetic resources. */
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'
import { FileSystemCharacterLibraryStore } from '../src/features/characters/host/store.js'
import { ImageStore } from '../src/features/media/host/store.js'
import { mediaId } from '../src/features/media/shared/image.js'

const mode = process.argv[2]
const mib = bytes => Number((bytes / 1048576).toFixed(2))
if (mode === '--worker') {
  const root = process.argv[3], kind = process.argv[4]
  const store = new FileSystemCharacterLibraryStore(root)
  global.gc?.()
  const memory = process.memoryUsage()
  const started = performance.now()
  const data = kind === 'legacy' ? await store.list() : await store.query({ pageSize: 20 })
  const firstPageMs = performance.now() - started
  const responseBytes = Buffer.byteLength(JSON.stringify(data))
  global.gc?.()
  const retainedHeapMiB = mib(process.memoryUsage().heapUsed - memory.heapUsed)
  const rssDeltaMiB = mib(process.memoryUsage().rss - memory.rss)
  let complete = data
  while (complete.indexing) { await new Promise(resolve => setTimeout(resolve, 5)); complete = await store.query({ pageSize: 20 }) }
  const completeIndexMs = performance.now() - started
  const warm = []
  if (kind !== 'legacy') for (let index = 0; index < 5; index++) {
    const before = performance.now(); await store.query({ pageSize: 20 }); warm.push(performance.now() - before)
  }
  console.log(JSON.stringify({ kind, firstPageMs: Number(firstPageMs.toFixed(2)), responseBytes, retainedHeapMiB, rssDeltaMiB,
    ...(warm.length ? { completeIndexMs: Number(completeIndexMs.toFixed(2)), warmPageMs: Number((warm.reduce((a, b) => a + b) / warm.length).toFixed(2)) } : {}) }))
  await store.close()
} else {
  const count = Number(process.argv[2] ?? 250)
  assert.ok(Number.isSafeInteger(count) && count > 0 && count <= 2000)
  const root = await mkdtemp(join(tmpdir(), 'mayori-performance-benchmark-'))
  try {
    const pixels = Buffer.alloc(256 * 256 * 3)
    // Deterministic texture makes compressed image traffic representative.
    let seed = 12345
    for (let index = 0; index < pixels.length; index++) { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; pixels[index] = seed & 255 }
    const image = await sharp(pixels, { raw: { width: 256, height: 256, channels: 3 } }).png().toBuffer()
    for (let index = 0; index < count; index++) {
      const id = index.toString(16).padStart(64, '0'), name = `Character ${index}`
      await writeFile(join(root, `${id}.json`), JSON.stringify({ format: 1, id, name, importedAt: index, hasImage: true,
        card: { data: { name, creator: 'Benchmark', tags: ['benchmark'], description: 'Long character description. '.repeat(320) } } }))
      await writeFile(join(root, `${id}.png`), image)
    }
    const results = []
    for (const kind of ['legacy', 'indexed']) {
      const worker = spawnSync(process.execPath, ['--expose-gc', fileURLToPath(import.meta.url), '--worker', root, kind], { encoding: 'utf8', windowsHide: true })
      assert.equal(worker.status, 0, worker.stderr)
      results.push(JSON.parse(worker.stdout))
    }
    const images = new ImageStore(join(root, 'media'))
    const reference = await images.put(`data:image/png;base64,${image.toString('base64')}`)
    const thumbnail = await images.read(mediaId(reference), 'avatar')
    const thumbnailBytes = (await readFile(thumbnail.path)).length
    thumbnail.release(); await images.close()
    console.log(JSON.stringify({ count, originalImageBytes: image.length, avatarBytes: thumbnailBytes,
      responseReduction: Number((results[0].responseBytes / results[1].responseBytes).toFixed(1)), results }, null, 2))
  } finally { await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }) }
}
