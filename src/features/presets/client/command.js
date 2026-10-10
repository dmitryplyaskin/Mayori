/** Slash-menu consumer of the preset catalog and logged session selection. */
export function presetCommand({ presets, presetFor, icon }) {
  return {
    name: 'preset',
    label: () => 'Сменить пресет',
    description: () => 'Выбрать инструкции для этого чата',
    icon,
    available: session => Boolean(session.sessionId),
    ui: {
      kind: 'popupSelect',
      searchLabels: () => ({ placeholder: 'Поиск пресета…', empty: 'Пресетов пока нет.', noResults: 'Пресеты не найдены.' }),
      async options(session, signal) {
        signal.throwIfAborted()
        const selection = presetFor(session.sessionId)
        await Promise.all([presets.refresh(), selection.refresh()])
        signal.throwIfAborted()
        const catalog = presets.getSnapshot()
        const current = selection.getSnapshot()
        if (catalog.status !== 'ready' || current.status !== 'ready') {
          throw new Error(catalog.error || current.error || 'Не удалось загрузить пресеты чата.')
        }
        return [
          { id: '__none__', label: 'Без пресета', active: current.preset === null },
          ...catalog.presets.map(preset => ({ id: preset.id, label: preset.name, active: current.preset?.id === preset.id })),
        ]
      },
      async onSelect(option, session) {
        await presetFor(session.sessionId).select(option.id === '__none__' ? null : option.id)
      },
    },
  }
}
