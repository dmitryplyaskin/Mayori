# Архитектура Mayori

Mayori следует архитектуре DeepSeek Harness: каждая функция подключается Cordis-плагином, а заменяемая возможность оформляется как полный capability seam — Service Definition, один или несколько Provider и Consumer. Mayori не меняет `agent-loop`.

## Текущий вертикальный срез

```text
dsh-mayori bundle
├── cordis.patch.yml
│   ├── заменяет deployment:persona через строку system-prompt
│   └── монтирует mayori-director
├── index.js
│   ├── регистрирует mayori:director через ctx.systemPrompt.section()
│   └── публикует Host Character Library через ctx.webServer
└── lib/client.js
    ├── замещает project/session region через публичный `sidebar.workspaces` slot
    ├── сохраняет штатный `sidebar.settings` consumer
    └── добавляет RPC proxy и полноэкранную gallery action
```

Bundle является слоем композиции, а не отдельным приложением. Поддерживаемая deployment-композиция монтирует его в отдельный именованный профиль `mayori` поверх встроенного Web bundle; штатный профиль `web` не содержит Mayori. Это граница всего browser plugin: branding, Character Library и gallery action существуют на уровне профиля, а не переключаемого session mode. Регистрация prompt-section является обратимым Cordis effect и удаляется вместе с plugin fiber.

Профиль Mayori использует отдельный Web origin (рекомендуемый порт `3081`) для
изоляции интерфейса и настроек от обычного `web`. Идентичность каталога от origin
не зависит: карточки принадлежат Host и переживают смену порта или браузера.

Browser half объявлен через `dsh.client` и `exports["./client"]`. `MayoriSidebar` регистрируется в публичном root-scoped слоте `sidebar.workspaces` с приоритетом `-100`, поэтому штатный `WorkspaceBrowser` остаётся в ledger как fallback и снова становится видимым после выгрузки Mayori. Оригинальный sidebar shell сохраняет fold-state machine и настоящий `sidebar.settings` consumer. Поскольку shell пока не объявляет отдельные seats для brand row и New Session, plugin-owned stylesheet узко скрывает эти две соседние chrome-строки только у shell, чей slot-outlet содержит `.mayori-sidebar-shell`; собственные brand и toggle живут внутри заменённого региона. Стили добавляются и удаляются через Cordis effect.

### Character Library

Импортированные Character Card образуют отдельную Host-owned capability seam:

- **Service Definition** — Host `CharacterLibraryService`: список, пакетный импорт и удаление;
- **Provider** — `FileSystemCharacterLibraryProvider`: полные JSON-записи и исходные PNG в валидируемом `charactersPath` (по умолчанию `$DSH_HOME/mayori/characters`);
- **Consumers** — lifecycle-bound same-origin Host route `/mayori/characters`, browser `RemoteCharacterLibraryProvider` с observable snapshot и `CharacterGalleryAction` внутри `MayoriSidebar`.

Codec принимает JSON v2/v3 и стандартные PNG `tEXt` payloads `chara` / `ccv3`; при наличии обоих выбирает v3. Host валидирует байты до записи, сериализует карточку под content-derived id и публикует браузеру только снимок каталога. Контейнер и неизвестные поля не превращаются в prompt. Эта библиотека — пользовательский каталог ресурсов, а не campaign journal: пока карточка не выбрана для игры через будущий доменный event, модель её не видит.

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

`dsh-mayori` пока содержит persona, director guidance и Host-owned Character Library с полноэкранной галереей. Он намеренно не имитирует состояние кампании, правила или броски текстовыми соглашениями: эти возможности будут добавляться полными seams с тестами и долговечными событиями.
