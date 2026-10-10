/** Slash-menu consumer of the persona catalog and Character Chat service. */
export function personaCommand({ personas, chatFor, icon }) {
  return {
    name: 'persona',
    label: () => 'Сменить персону',
    description: () => 'Выбрать, за кого играть в этом чате',
    icon,
    available: session => Boolean(session.sessionId),
    ui: {
      kind: 'popupSelect',
      searchLabels: () => ({ placeholder: 'Поиск персоны…', empty: 'Персон пока нет.', noResults: 'Персоны не найдены.' }),
      async options(session, signal) {
        signal.throwIfAborted()
        const chat = chatFor(session.sessionId)
        await Promise.all([personas.refresh(), chat.refresh()])
        signal.throwIfAborted()
        const catalog = personas.getSnapshot()
        const current = chat.getSnapshot()
        if (catalog.status !== 'ready' || current.status !== 'ready') {
          throw new Error(catalog.error || current.error || 'Не удалось загрузить персоны чата.')
        }
        if (!current.value) throw new Error('Выберите чат персонажа из галереи.')
        const personaId = current.value.persona?.id
        return [
          { id: '__none__', label: 'Без персоны', detail: 'Имя в чате: Игрок', active: !personaId },
          ...catalog.personas.map(persona => ({ id: persona.id, label: persona.name,
            ...(persona.title ? { detail: persona.title } : {}), active: personaId === persona.id })),
        ]
      },
      async onSelect(option, session) {
        await chatFor(session.sessionId).setPersona(option.id === '__none__' ? null : option.id)
      },
    },
  }
}
