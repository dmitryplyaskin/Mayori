/** Platform-independent persona blocks, validation and deterministic prompt assembly. */
export const DEFAULT_PROMPT = Object.freeze({ wrapperEnabled: false, wrapperTemplate: '{{PROMPT}}', joiner: '\\n\\n' })

function text(value, fallback, limit) {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || value.length > limit) throw new TypeError('Некорректный текст персоны.')
  return value
}

function flag(value, fallback) {
  if (value === undefined) return fallback
  if (typeof value !== 'boolean') throw new TypeError('Некорректный переключатель персоны.')
  return value
}

function ids(value, pattern) {
  if (value === undefined) return []
  if (!Array.isArray(value) || value.length > 256 || value.some(id => typeof id !== 'string' || !pattern.test(id))) {
    throw new TypeError('Некорректная привязка персоны.')
  }
  return [...new Set(value)]
}

export function validatePersonaExtensions(input) {
  if (!['blocks', 'prompt', 'characterIds', 'descriptionOverride'].some(key => input[key] !== undefined)) return {}
  const seen = new Set()
  let total = (input.description?.length ?? 0)
  const node = (value, child = false) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)
      || !['item', 'group'].includes(value.type) || child && value.type !== 'item'
      || typeof value.id !== 'string' || !/^[\w-]{1,80}$/.test(value.id) || seen.has(value.id)) {
      throw new TypeError('Некорректный блок персоны.')
    }
    seen.add(value.id)
    if (seen.size > 256) throw new TypeError('В персоне может быть до 256 блоков.')
    const activation = value.activation ?? {}
    if (!activation || typeof activation !== 'object' || Array.isArray(activation)) throw new TypeError('Некорректная активация блока.')
    const result = { id: value.id, type: value.type, title: text(value.title, '', 200), enabled: flag(value.enabled, true),
      activation: { auto: flag(activation.auto, false),
        chatIds: ids(activation.chatIds, /^\S[^\r\n]{0,199}$/),
        characterIds: ids(activation.characterIds, /^[a-f0-9]{64}$/),
        match: text(activation.match, '', 500) } }
    if (value.type === 'group') {
      if (!Array.isArray(value.items)) throw new TypeError('Некорректная группа персоны.')
      result.items = value.items.map(item => node(item, true))
    } else {
      result.text = text(value.text, '', 32000)
      total += result.text.length
    }
    return result
  }
  if (input.blocks !== undefined && !Array.isArray(input.blocks)) throw new TypeError('Некорректные блоки персоны.')
  const blocks = (input.blocks ?? []).map(value => node(value))
  const settings = input.prompt ?? {}
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw new TypeError('Некорректный шаблон персоны.')
  const prompt = { wrapperEnabled: flag(settings.wrapperEnabled, false),
    wrapperTemplate: text(settings.wrapperTemplate, DEFAULT_PROMPT.wrapperTemplate, 8000),
    joiner: text(settings.joiner, DEFAULT_PROMPT.joiner, 200) }
  if (prompt.wrapperEnabled && !prompt.wrapperTemplate.includes('{{PROMPT}}')) throw new TypeError('Добавьте {{PROMPT}} в шаблон.')
  const descriptionOverride = input.descriptionOverride == null ? null : text(input.descriptionOverride, '', 32000)
  total += descriptionOverride?.length ?? 0
  const copies = prompt.wrapperEnabled ? prompt.wrapperTemplate.split('{{PROMPT}}').length - 1 : 1
  if (total > 128000 || (total + seen.size * prompt.joiner.length) * copies + prompt.wrapperTemplate.length > 256000) {
    throw new TypeError('Итоговое описание персоны слишком длинное.')
  }
  return { blocks, prompt, descriptionOverride, characterIds: ids(input.characterIds, /^[a-f0-9]{64}$/) }
}

export function blockActive(block, context = {}) {
  const rule = block.activation
  if (!rule?.auto) return block.enabled !== false
  return Boolean(context.sessionId && rule.chatIds?.includes(context.sessionId)
    || context.characterId && rule.characterIds?.includes(context.characterId)
    || rule.match?.trim() && context.characterDescription?.toLowerCase().includes(rule.match.trim().toLowerCase()))
}

export function composePersona(persona, context = {}) {
  const activeIds = []
  const additions = []
  for (const block of persona.blocks ?? []) {
    if (!blockActive(block, context)) continue
    activeIds.push(block.id)
    for (const item of block.type === 'group' ? block.items : [block]) {
      if (block.type === 'group' && !blockActive(item, context)) continue
      if (block.type === 'group') activeIds.push(item.id)
      if (item.text?.trim()) additions.push(item.text)
    }
  }
  const base = persona.descriptionOverride ?? persona.description ?? ''
  const joiner = (persona.prompt?.joiner ?? DEFAULT_PROMPT.joiner).replace(/\\([nrt\\])/g, (_, key) => ({ n: '\n', r: '\r', t: '\t', '\\': '\\' })[key])
  let description = [...(base.trim() ? [base] : []), ...additions].join(joiner)
  if (description.trim() && persona.prompt?.wrapperEnabled) description = persona.prompt.wrapperTemplate.split('{{PROMPT}}').join(description)
  return { description, activeIds }
}

/** A selected persona is detached from the catalog, including its activation results. */
export function snapshotPersona(persona, context) {
  if (!persona.blocks && !persona.prompt && persona.descriptionOverride === undefined) return structuredClone(persona)
  return { ...structuredClone(persona), promptSnapshot: { ...composePersona(persona, context),
    sessionId: context?.sessionId ?? null, characterId: context?.characterId ?? null } }
}

export function effectivePersona(persona) {
  return persona.promptSnapshot ? { ...persona, description: persona.promptSnapshot.description } : persona
}

export function filterPersonas(personas, query = '', sort = 'name') {
  const search = query.trim().toLowerCase()
  return personas.filter(persona => [persona.name, persona.title, persona.description].some(value => value?.toLowerCase().includes(search)))
    .sort((a, b) => sort === 'description' ? b.description.length - a.description.length || a.name.localeCompare(b.name, 'ru')
      : sort === 'connections' ? (b.characterIds?.length ?? 0) - (a.characterIds?.length ?? 0) || a.name.localeCompare(b.name, 'ru')
        : a.name.localeCompare(b.name, 'ru'))
}
