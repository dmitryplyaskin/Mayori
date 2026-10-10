import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { validatePreset } from '../shared/preset.js'

/** Host catalog; immutable chat snapshots belong to the native session log. */
export class FileSystemPresetStore {
  #writes = Promise.resolve()
  constructor(root, initialPreset) {
    if (typeof root !== 'string' || !root.trim()) throw new TypeError('presetsPath must be a non-empty string')
    this.root = resolve(root)
    this.path = resolve(this.root, 'presets.json')
    this.initialPreset = { id: 'mayori', ...validatePreset(initialPreset) }
  }
  async #read() {
    let record
    try { record = JSON.parse(await readFile(this.path, 'utf8')) } catch (error) {
      if (error.code !== 'ENOENT') throw error
      return null
    }
    if (![1, 2].includes(record.format) || !Array.isArray(record.presets)
      || record.presets.some(p => !p || typeof p.id !== 'string' || !(p.id === 'mayori' || /^[a-f0-9-]{36}$/.test(p.id)))
      || new Set(record.presets.map(p => p.id)).size !== record.presets.length
      || (record.defaultId !== null && !record.presets.some(p => p.id === record.defaultId))) {
      throw new Error('Каталог пресетов повреждён. Восстановите его из резервной копии.')
    }
    record.presets = record.presets.map(preset => ({ id: preset.id, ...validatePreset(preset) }))
    return record
  }
  async list() {
    await this.#writes
    const record = await this.#read()
    if (record === null) return this.#change(record => ({ presets: record.presets, defaultId: record.defaultId }))
    return { presets: record.presets, defaultId: record.defaultId }
  }
  #change(operation) {
    const result = this.#writes.then(async () => {
      const record = await this.#read() ?? { format: 1, defaultId: 'mayori', presets: [{ ...this.initialPreset }] }
      const value = operation(record)
      await mkdir(this.root, { recursive: true })
      const temporary = resolve(this.root, `${randomUUID()}.tmp`)
      try {
        await writeFile(temporary, `${JSON.stringify(record)}\n`, { flag: 'wx', flush: true })
        await rename(temporary, this.path)
      } finally { await rm(temporary, { force: true }) }
      return value
    })
    this.#writes = result.catch(() => {})
    return result
  }
  save(input) {
    const data = validatePreset(input)
    return this.#change(record => {
      const previous = input.id ? record.presets.find(p => p.id === input.id) : null
      if (input.id && !previous) throw new Error('Пресет больше не найден. Обновите список.')
      const preset = { ...data, id: previous?.id ?? randomUUID() }
      if (data.nodes) record.format = 2
      if (previous) record.presets[record.presets.indexOf(previous)] = preset
      else record.presets.push(preset)
      return preset
    })
  }
  remove(id) {
    return this.#change(record => {
      if (!record.presets.some(p => p.id === id)) throw new Error('Пресет больше не найден.')
      record.presets = record.presets.filter(p => p.id !== id)
      if (record.defaultId === id) record.defaultId = null
    })
  }
  setDefault(id) {
    return this.#change(record => {
      if (id !== null && !record.presets.some(p => p.id === id)) throw new Error('Пресет больше не найден.')
      record.defaultId = id
    })
  }
  async resolve(id) {
    const record = await this.list()
    const selected = id === undefined ? record.defaultId : id
    if (selected === null) return null
    const preset = record.presets.find(p => p.id === selected)
    if (!preset) throw new Error('Пресет больше не найден. Выберите другой.')
    return { ...preset }
  }
}
