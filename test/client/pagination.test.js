import assert from 'node:assert/strict'
import test from 'node:test'
import { paginate } from '../../src/client/components/pagination-model.js'

test('pagination limits rows and clamps the page after filtering, deletion or limit changes', () => {
  const rows = Array.from({ length: 45 }, (_, i) => i)
  const last = paginate(rows, 3, 20)
  assert.deepEqual(last, { page: 3, pages: 3, start: 40, end: 45, items: [40, 41, 42, 43, 44] })
  assert.equal(paginate(rows.slice(0, 20), 3, 20).page, 1)
  assert.equal(paginate(rows, 3, 60).page, 1)
  assert.equal(paginate(rows, -5, 20).page, 1)
  assert.deepEqual(paginate([], 9, 20), { page: 1, pages: 1, start: 0, end: 0, items: [] })
})
