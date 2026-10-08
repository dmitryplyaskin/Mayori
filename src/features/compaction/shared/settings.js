export const COMPACTION_SOURCE = 'mayori-compaction-settings'

export const DEFAULT_COMPACTION_INSTRUCTIONS = `Составь краткое изложение предыдущей части ролевой игры, чтобы ведущий мог продолжить её без потери важных фактов.

Сохрани язык игры. Используй следующие разделы:
- Текущая сцена: место, время, участники и последнее незавершённое действие.
- Персонажи и отношения: установленные сведения, намерения, обещания и изменения отношений.
- События и решения игрока: важные поступки, их подтверждённые последствия и точные условия договорённостей.
- Открытые сюжетные линии: квесты, загадки, обязательства и нерешённые вопросы.
- Точные данные: известные характеристики, предметы, ресурсы и уже выполненные броски с их результатами и идентификаторами.
- Предпочтения игрока: ограничения, стиль и явные указания.

Отделяй установленные факты от предположений. Не придумывай события, решения игрока, случайные исходы или неизвестные значения. Не продолжай сцену и не вызывай инструменты: верни только текст изложения.
Если в истории уже есть <compacted-summary>, объедини его с новыми событиями, сохраняя актуальные факты и явно произошедшие изменения. Не копируй старое изложение целиком.`

export const DEFAULT_COMPACTION = Object.freeze({
  thresholdPercent: 80, retainPercent: 16, maxSummaryTokens: 4096, headroomTokens: 8192,
  instructions: DEFAULT_COMPACTION_INSTRUCTIONS,
})

/** Validate persisted and submitted settings before they reach the native engine. */
export function validateCompaction(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).some(key => !Object.hasOwn(DEFAULT_COMPACTION, key))) throw new TypeError('Неизвестная настройка сжатия истории.')
  const settings = { ...DEFAULT_COMPACTION, ...value }
  for (const [key, title, min, max] of [['thresholdPercent', 'Порог заполнения контекста', 1, 99], ['retainPercent', 'Доля последних сообщений', 0, 98], ['maxSummaryTokens', 'Лимит ответа для изложения', 1, 65536], ['headroomTokens', 'Дополнительный запас контекста', 0, 65536]]) {
    if (!Number.isSafeInteger(settings[key]) || settings[key] < min || settings[key] > max) throw Object.assign(new TypeError(`${title}: укажите целое число от ${min} до ${max}.`), { field: key })
  }
  if (settings.retainPercent >= settings.thresholdPercent) throw Object.assign(new TypeError('Доля последних сообщений должна быть меньше порога сжатия.'), { field: 'retainPercent' })
  if (typeof settings.instructions !== 'string' || !settings.instructions.trim() || settings.instructions.length > 32768) throw Object.assign(new TypeError('Инструкция сжатия должна содержать от 1 до 32768 символов.'), { field: 'instructions' })
  return Object.freeze(settings)
}

/** Exact auxiliary instructions come from the durable session snapshot. */
export function readCompactionSettings(events) {
  const snapshot = events.findLast(event => event.type === 'user/message' && event.data.source?.kind === COMPACTION_SOURCE)
  if (!snapshot) throw new Error('Перед сжатием начните ход, чтобы сохранить его настройки в журнале чата.')
  return validateCompaction(JSON.parse(snapshot.data.source.sections[0].text))
}
