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
    └── добавляет RPC proxy, полноэкранную gallery action и запуск character chat
```

Bundle является слоем композиции, а не отдельным приложением. Поддерживаемая deployment-композиция монтирует его в отдельный именованный профиль `mayori` поверх встроенного Web bundle; штатный профиль `web` не содержит Mayori. Это граница всего browser plugin: branding, Character Library и gallery action существуют на уровне профиля, а не переключаемого session mode. Регистрация prompt-section является обратимым Cordis effect и удаляется вместе с plugin fiber.

Профиль Mayori использует отдельный Web origin (рекомендуемый порт `3081`) для
изоляции интерфейса и настроек от обычного `web`. Идентичность каталога от origin
не зависит: карточки принадлежат Host и переживают смену порта или браузера.

Поддерживаемая версия DSH — `0.2.1-alpha.1`; пакет объявляет её peer dependency. Browser half объявлен через `dsh.client` и `exports["./client"]`. `MayoriSidebar` регистрируется в публичном root-scoped слоте `sidebar.workspaces` с приоритетом `-100`, поэтому штатный `WorkspaceBrowser` остаётся fallback. Брендинг занимает штатные `sidebar.brand.mark`, `sidebar.brand.name` и `conversation.hero.brand.mark`; shell владеет кнопками нового чата, сворачивания и настроек. DOM-подмен и скрытия stock chrome по CSS-селекторам нет. Стили и слоты удаляются вместе с Cordis fiber.

Bundle объявляет preset `mayori` с пустым списком дочерних плагинов и выбирает его по умолчанию, поэтому новые RPG-сессии не получают инструменты стандартного coding-пресета. Глобальные personaPrefix и director guidance задают роль ведущего. Это первый RPG-срез без фиктивных rules/dice tools; дальнейшие игровые инструменты добавляются в preset явно.

### Character Library

Импортированные Character Card образуют отдельную Host-owned capability seam:

- **Service Definition** — Host `CharacterLibraryService`: список, пакетный импорт и удаление;
- **Provider** — `FileSystemCharacterLibraryProvider`: полные JSON-записи и исходные PNG в валидируемом `charactersPath` (по умолчанию `$DSH_HOME/mayori/characters`);
- **Consumers** — lifecycle-bound same-origin Host route `/mayori/characters`, browser `RemoteCharacterLibraryProvider` с observable snapshot и `CharacterGalleryAction` внутри `MayoriSidebar`.

Codec принимает JSON v2/v3 и стандартные PNG `tEXt` payloads `chara` / `ccv3`; при наличии обоих выбирает v3. Host валидирует байты до записи, сериализует карточку под content-derived id и публикует браузеру только снимок каталога. Контейнер и неизвестные поля не превращаются в prompt. Эта библиотека — пользовательский каталог ресурсов, а не campaign journal: пока карточка не выбрана для игры, модель её не видит.

### Character Session

Запуск игры образует отдельный capability seam:

- **Service Definition** — Host `CharacterSessionService.prepareCampaign()` и `select(sessionId, characterId)`;
- **Provider** — `PersistentCharacterSessionProvider`, который идемпотентно создаёт `$DSH_HOME/mayori/campaigns/default` (корень задаётся валидируемым `campaignsPath`), разрешает карточку через Character Library и хранит неизменяемую связь Session → snapshot в файловом `FileSystemCharacterSessionStore` под `campaignsPath/selections`;
- **Consumer** — browser gallery, которая при отсутствии кампаний регистрирует подготовленный каталог через `workspaces.create`, создаёт новую Session через `sessions.create({ workspaceId })`, удерживает её через `sessions.using`, ожидает `reference.ready`, вызывает same-origin transport, задаёт имя и открывает чат через `uiWorkspace.openSession`. Временный reference освобождается как при успехе, так и при ошибке; навигация получает собственный mainView reference до освобождения временного.

Хранилище выбора содержит только стандартные поля Character Card; неизвестные поля, `extensions` и изображение остаются ресурсами каталога. Запись версионирована, имя файла — SHA-256 идентификатора сессии. Snapshot готовится во временном файле с flush, затем публикуется без перезаписи существующей записи. Выбор выполняется через `agent.runMaintenance`, чтобы ввод не начал ход посреди записи. Повтор того же выбора идемпотентен; другой персонаж требует нового чата.

Ожидаемый serial listener `agent/created` читает snapshot и восстанавливает scoped context до первого ввода, в том числе после перезапуска. При форке snapshot родителя копируется в собственную запись дочерней сессии. При загрузке плагина восстанавливаются также уже активные Agents. Ошибки чтения не подменяются новым выбором. Удаление или обновление карточки не меняет уже созданный чат. Model-visible context материализуется штатной системой prompt contexts в session log; отдельный snapshot является доменным источником, не process memory. `registerEventType`, `session.events` и `agent/session-start` не используются. Старые неизвестные обязательные события автоматически не переписываются.

Импортированные `{{…}}` не относятся к пространству переменных DSH. Provider регистрирует в `agent.ctx.systemPrompt` переменную `mayori_active_character_text` с готовым текстом карточки и контекст `mayori:active-character`, содержащий только ссылку на эту переменную. Публичный renderer DSH подставляет значение за один проход без повторного разбора содержимого; поэтому даже неизвестные или некорректные ST-макросы остаются данными и не вызывают ошибок. Переменная и контекст удаляются вместе при rebind, `agent/disposed` и unload Mayori. Детерминированная подстановка `{{char}}` (без учёта регистра) выполняется только в модельной проекции стандартных текстовых полей, без изменения snapshot. `{{user}}` остаётся маркером игрока без придуманного имени; остальные макросы не исполняются. Контекст с результатом подстановки, а не служебной ссылкой, попадает в штатный session log.

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
