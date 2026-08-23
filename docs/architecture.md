# Архитектура Mayori

Mayori следует архитектуре DeepSeek Harness: каждая функция подключается Cordis-плагином, а заменяемая возможность оформляется как полный capability seam — Service Definition, один или несколько Provider и Consumer. Mayori не меняет `agent-loop`.

## Текущий вертикальный срез

```text
dsh-mayori bundle
├── cordis.patch.yml
│   ├── заменяет deployment:persona через строку system-prompt
│   └── монтирует mayori-director
├── index.js
│   └── регистрирует mayori:director через ctx.systemPrompt.section()
└── lib/client.js
    ├── заменяет stock sidebar wordmark на Mayori
    └── добавляет browser-local Character Library и gallery action
```

Bundle является слоем композиции, а не отдельным приложением. Поддерживаемая deployment-композиция монтирует его в отдельный именованный профиль `mayori` поверх встроенного Web bundle; штатный профиль `web` не содержит Mayori. Это граница всего browser plugin: branding, Character Library и gallery action существуют на уровне профиля, а не переключаемого session mode. Регистрация prompt-section является обратимым Cordis effect и удаляется вместе с plugin fiber.

Профиль Mayori использует отдельный Web origin (рекомендуемый порт `3081`),
чтобы IndexedDB Character Library не делила namespace с обычным `web` даже при
последовательном запуске профилей в одном браузере.

Browser half объявлен через `dsh.client` и `exports["./client"]`. Текущий branding smoke test добавляет и удаляет один plugin-owned `<style>` через Cordis effect. Stock sidebar пока не объявляет brand-only slot, поэтому selector изолирован внутри browser entry и должен быть заменён регистрацией в публичный branding seat, когда такой контракт появится.

### Character Library

Импортированные Character Card образуют отдельную browser-local capability seam:

- **Service Definition** — `CharacterLibraryService`: snapshot, подписка, пакетный импорт и удаление;
- **Provider** — `IndexedDbCharacterLibraryProvider`: долговечное хранение полного исходного JSON и PNG-portrait в IndexedDB текущего Web origin;
- **Consumer** — `CharacterGalleryAction`: additive-регистрация в публичном `sidebar.footer.action`, импорт и галерея в нативном modal dialog.

Codec принимает JSON v2/v3 и стандартные PNG `tEXt` payloads `chara` / `ccv3`; при наличии обоих выбирает v3. Контейнер и неизвестные поля не превращаются в prompt. Эта библиотека — пользовательский каталог ресурсов, а не campaign journal: пока карточка не выбрана для игры через будущий доменный event, модель её не видит. Поэтому IndexedDB не является скрытым источником model-visible campaign state.

## Инварианты

1. Модель не принимает добровольные решения за персонажа игрока.
2. Случайный результат существует только после ответа реального rules/dice provider.
3. Факт, попавший в модельный запрос, должен восстанавливаться из session log или канонического события, которое проецируется в него.
4. Состояние кампании не прячется в prompt-тексте или process memory.
5. Новые функции подключаются к документированной точке расширения DSH; изменение loop требует отдельного архитектурного решения.

## Планируемые seams

### Campaign state

- Service Definition задаёт операции чтения проекции и добавления доменных событий.
- Provider хранит append-only журнал кампании и строит проекции персонажей, сцен, локаций и отношений.
- Consumer предоставляет модели узкие инструменты чтения и записи подтверждённых фактов.

Session log остаётся источником того, что увидела модель в конкретном ходе. Campaign journal является долгоживущим доменным источником между сессиями; его снимок должен попадать в session log как model-visible context.

### Rules and dice

- Rules Service Definition описывает запрос разрешения действия без привязки к игровой системе.
- Provider реализует конкретную систему или systemless resolution.
- Tool Consumer валидирует модельный JSON, вызывает provider и возвращает доказуемый результат.

Генератор случайности принадлежит provider, а не prompt. Это позволяет воспроизводить броски и менять систему без изменения ведущего.

### Scene direction

Scene service управляет активной сценой, участниками, временем и незавершёнными последствиями. Он потребляет campaign state и rules, но не владеет их данными.

### Client

RPG-клиент должен строиться из session events и доменных проекций: чат, карточки персонажей, журнал, броски и карта сцены остаются независимыми Conversation Nodes. Backend не кодирует представление в результатах инструментов.

## Границы первого релиза

`dsh-mayori` пока содержит persona, director guidance и browser-local Character Library с галереей. Он намеренно не имитирует состояние кампании, правила или броски текстовыми соглашениями: эти возможности будут добавляться полными seams с тестами и долговечными событиями.
