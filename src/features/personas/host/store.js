/** Host-owned Persona capability. The browser never owns persistence. */
import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { DEFAULT_PERSONA } from '../../../shared/templates.js'

function validatePersona(input) {
  if (!input || typeof input.name !== 'string' || !input.name.trim() || input.name.length > 120) {
    throw new TypeError('Укажите имя персоны длиной до 120 символов.')
  }
  for (const key of ['description', 'title', 'avatar']) {
    if (input[key] !== undefined && typeof input[key] !== 'string') throw new TypeError('Некорректные поля персоны.')
  }
  if ((input.description?.length ?? 0) > 32000 || (input.title?.length ?? 0) > 200) throw new TypeError('Описание или подпись персоны слишком длинные.')
  const avatar = input.avatar ?? ''
  if (avatar && (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(avatar) || avatar.length > 2_800_000)) {
    throw new TypeError('Выберите PNG, JPEG или WebP размером до 2 МБ.')
  }
  return { name: input.name.trim(), title: input.title ?? '', description: input.description ?? '', avatar }
}

export class FileSystemPersonaStore {
  #writes = Promise.resolve()
  constructor(root) {
    if (typeof root !== 'string' || !root.trim()) throw new TypeError('personasPath must be a non-empty string')
    this.root = resolve(root)
    this.path = resolve(this.root, 'personas.json')
  }
  async #read() {
    let record
    try { record = JSON.parse(await readFile(this.path, 'utf8')) } catch (error) {
      if (error.code === 'ENOENT') return { format: 1, defaultId: null, personas: [] }
      throw error
    }
    if (record.format !== 1 || !Array.isArray(record.personas)
      || record.personas.some(p => typeof p.id !== 'string' || !/^[a-f0-9-]{36}$/.test(p.id))
      || new Set(record.personas.map(p => p.id)).size !== record.personas.length
      || (record.defaultId !== null && !record.personas.some(p => p.id === record.defaultId))) {
      throw new Error('Каталог персон повреждён. Восстановите его из резервной копии.')
    }
    for (const persona of record.personas) validatePersona(persona)
    return record
  }
  async list() {
    await this.#writes
    const { personas, defaultId } = await this.#read()
    return { personas, defaultId }
  }
  #change(operation) {
    const result = this.#writes.then(async () => {
      const record = await this.#read()
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
    const data = validatePersona(input)
    return this.#change(record => {
      const previous = input.id ? record.personas.find(p => p.id === input.id) : null
      if (input.id && !previous) throw new Error('Персона больше не найдена. Обновите список.')
      const persona = { ...data, id: previous?.id ?? randomUUID() }
      if (previous) record.personas[record.personas.indexOf(previous)] = persona
      else record.personas.push(persona)
      return persona
    })
  }
  remove(id) {
    return this.#change(record => {
      if (!record.personas.some(p => p.id === id)) throw new Error('Персона больше не найдена.')
      record.personas = record.personas.filter(p => p.id !== id)
      if (record.defaultId === id) record.defaultId = null
    })
  }
  setDefault(id) {
    return this.#change(record => {
      if (id !== null && !record.personas.some(p => p.id === id)) throw new Error('Персона больше не найдена.')
      record.defaultId = id
    })
  }
  async resolve(id) {
    const record = await this.list()
    const selected = id === undefined ? record.defaultId : id
    if (selected === null) return { ...DEFAULT_PERSONA }
    const persona = record.personas.find(p => p.id === selected)
    if (!persona) throw new Error('Персона больше не найдена. Выберите другую.')
    return { ...persona }
  }
}
