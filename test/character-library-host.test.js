import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

import { FileSystemCharacterLibraryStore } from '../src/character-library-host.js'

function sourceCard(name = 'Aster') {
  return {
    spec: 'chara_card_v3',
    spec_version: '3.0',
    data: {
      name,
      description: `${name} description`,
      personality: 'Patient',
      scenario: '',
      first_mes: 'Hello',
      mes_example: '',
      creator_notes: '',
      system_prompt: '',
      post_history_instructions: '',
      alternate_greetings: [],
      group_only_greetings: [],
      tags: ['test'],
      creator: 'Mayori tests',
      character_version: '1',
      extensions: { preserved: true },
    },
  }
}

function importPayload(card, name = 'aster.json') {
  return {
    files: [{
      name,
      type: 'application/json',
      base64: Buffer.from(JSON.stringify(card)).toString('base64'),
    }],
  }
}

test('persists character records in the configured Host directory', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mayori-character-library-'))
  t.after(async () => { await rm(root, { recursive: true, force: true }) })

  const first = new FileSystemCharacterLibraryStore(root)
  const imported = await first.import(importPayload(sourceCard()))
  assert.deepEqual(imported, { imported: 1, rejected: [] })

  const files = await readdir(root)
  assert.equal(files.length, 1)
  assert.match(files[0], /^[a-f0-9]{64}\.json$/)
  const stored = JSON.parse(await readFile(join(root, files[0]), 'utf8'))
  assert.equal(stored.card.data.extensions.preserved, true)
  assert.equal(stored.hasImage, false)

  const reopened = new FileSystemCharacterLibraryStore(root)
  const cards = await reopened.list()
  assert.equal(cards.length, 1)
  assert.equal(cards[0].name, 'Aster')
  assert.equal(cards[0].image, null)
  assert.equal(cards[0].data.extensions.preserved, true)

  await reopened.remove(cards[0].id)
  assert.deepEqual(await reopened.list(), [])
})

test('keeps invalid imports out of the durable catalog', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'mayori-character-library-'))
  t.after(async () => { await rm(root, { recursive: true, force: true }) })
  const provider = new FileSystemCharacterLibraryStore(resolve(root))

  const result = await provider.import({ files: [{
    name: 'broken.json',
    type: 'application/json',
    base64: Buffer.from('{"spec":"chara_card_v1"}').toString('base64'),
  }] })

  assert.equal(result.imported, 0)
  assert.equal(result.rejected.length, 1)
  assert.match(result.rejected[0].error, /v2 и v3/)
  assert.deepEqual(await provider.list(), [])
  assert.throws(() => provider.remove('../escape'), /идентификатор/)
})
