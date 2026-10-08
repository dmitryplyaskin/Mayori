# Архитектура Mayori

Mayori следует архитектуре DeepSeek Harness: каждая функция подключается Cordis-плагином, а заменяемая возможность оформляется как полный capability seam — Service Definition, один или несколько Provider и Consumer. Mayori не меняет `agent-loop`.

## Структура исходников

Исходники организованы по игровым возможностям, внутри которых явно разделены Host, browser и общий код. Это один bundle, без отдельных пакетов и дополнительного framework.

```text
Mayori/
├── index.js                       # стабильный публичный Host entry
├── cordis.patch.yml               # deployment-композиция и preset
├── src/
│   ├── host/
│   │   ├── plugin.js              # Cordis entry и director section
│   │   ├── config.js              # схема и валидация deployment config
│   │   ├── director.js            # текст правил ведущего
│   │   ├── application.js         # сборка Host capability providers
│   │   └── transport/             # HTTP boundary и адаптер операций
│   ├── client/
│   │   ├── plugin.js              # browser composition и обратимые slots
│   │   ├── shell/                 # главная, навигация и бренд
│   │   ├── components/            # общая пагинация и выбор через DSH Menu
│   │   ├── infrastructure/        # RPC и зеркалирование DSH slots
│   │   └── styles.js              # lifecycle-bound стили интерфейса
│   ├── features/
│   │   ├── characters/           # импорт, библиотека, каталог и галерея
│   │   ├── character-session/    # выбор, snapshots, приветствия и сообщения
│   │   ├── message-revisions/    # редактирование, повтор ответа и ветки
│   │   ├── personas/             # каталог и редактор персон игрока
│   │   ├── presets/              # каталог игровых инструкций и выбор из session log
│   │   ├── history/              # каталог DSH, архив и cold previews
│   │   ├── trajectory/           # реконструкция и отображение контекста
│   │   ├── dice/                 # parser, настоящий provider и tool card
│   │   ├── rules/                # числовые проверки, профили и последствия
│   │   └── roll-history/         # чтение сохранённых бросков текущего чата
│   └── shared/
│       └── templates.js           # воспроизводимые ST substitutions
├── test/                         # host/client/shared и те же features
├── scripts/                      # интеграционные smoke-сценарии
├── docs/                         # архитектура и руководства
└── lib/                          # генерируемый browser artifact
```

Внутри feature используются только необходимые ей каталоги:

- `host/` — Cordis Service Definition, Provider, durable store и Host adapters. В библиотеке, персонах и игровых сессиях контракт (`service.js`), хранилище (`store.js`) и координация (`provider.js`) имеют отдельных владельцев. Dice дополнительно содержит конфигурацию и tool consumer; публичные plugin entries остаются в `src/host`.
- `client/` — observable consumers, browser providers и React-компоненты этой возможности.
- `domain/` — платформонезависимые правила и преобразования: parser выражений Dice, валидация и модельная проекция выбранной карточки.
- `shared/` — форматы и codecs, которые нужны обеим сторонам: Character Card и записанный Dice result.

`src/host/application.js` создаёт providers в порядке зависимостей и связывает их с транспортом. Библиотека персонажей больше не создаёт историю, персоны или игровой runtime. `src/host/transport/routes.js` получает готовые сервисы и адаптирует HTTP, не управляя их жизненным циклом. Browser providers используют общий `src/client/infrastructure/rpc.js`; история и персоны не зависят от транспорта библиотеки.

### Направление зависимостей

Host и browser могут потреблять свои feature-модули и общий код. Они не импортируют реализацию другой платформы. `domain/` и `shared/` не зависят от React, Cordis, Node.js API или composition roots. Feature-модуль не импортирует `src/host/` и browser plugin/shell/styles: сборка приложения зависит от возможностей, обратной зависимости нет. Между features допустимы явные зависимости одного слоя; например, cold history reader читает durable store Character Session, а не создаёт его Provider. Циклы импортов запрещены.

Общее поведение переносится в `shared` или browser infrastructure только при реальном использовании несколькими возможностями. Новая игровая возможность получает собственный каталог в `features`, полный Service Definition / Provider / Consumer seam и регистрацию через composition roots и `ctx`. Для маленького seam сервис и provider могут оставаться в одном файле; пустые слои и универсальный `utils` не нужны.

Browser UI может импортировать публичный `@deepseek-ai/dsh-client-ui-primitives`, предоставляемый Web DSH как platform module. Это UI API, а не Host SDK. Все выпадающие поля Mayori используют общий consumer `Select` штатного `Menu`; библиотека DSH владеет keyboard/portal/focus поведением и стилями списка, Mayori — данными выбора и подписью поля. Импорт остаётся external в lazy browser artifact.

`test/architecture.test.js` проверяет направление импортов, отсутствие циклов, существование локальных зависимостей и полноту Host import graph в `package.json.files`. Публичные entry points: `dsh-mayori`, `dsh-mayori/dice`, `dsh-mayori/rules`, `dsh-mayori/roll-history`, `dsh-mayori/client` и совместимый legacy `dsh-mayori/mechanics`; внутренние пути не являются API. Host source поставляется как ESM, browser source собирается в `lib/client.js`. Перенос каталогов не изменяет HTTP endpoints, Cordis service names, расположение пользовательских данных или формат session log.

## Текущий вертикальный срез

```text
dsh-mayori bundle
├── cordis.patch.yml
│   ├── отключает deployment:persona через строку system-prompt
│   ├── монтирует mayori-director
│   └── объявляет единый mayori и persisted plugin preferences
├── src/host/{dice,rules,roll-history}-plugin.js
│   └── через application.js собирают независимые игровые возможности
├── index.js
│   └── src/host/plugin.js
│       ├── подключает каталог пресетов и session-scoped игровые инструкции
│       └── собирает Host services и transport через src/host/application.js
└── lib/client.js
    ├── собирается из src/client/plugin.js
    ├── замещает project/session region через публичный `sidebar.workspaces` slot
    ├── сохраняет штатный `sidebar.settings` consumer
    └── добавляет RPC proxy, нативные panel entries для галереи и истории, запуск character chat
```

Bundle является слоем композиции, а не отдельным приложением. Поддерживаемая deployment-композиция монтирует его в отдельный именованный профиль `mayori` поверх встроенного Web bundle; штатный профиль `web` не содержит Mayori. Это граница всего browser plugin: branding, Character Library и gallery action существуют на уровне профиля, а не переключаемого session mode. Регистрация prompt-section является обратимым Cordis effect и удаляется вместе с plugin fiber.

Профиль Mayori использует отдельный Web origin (рекомендуемый порт `3081`) для
изоляции интерфейса и настроек от обычного `web`. Идентичность каталога от origin
не зависит: карточки принадлежат Host и переживают смену порта или браузера.

Поддерживаемая версия DSH — `0.2.1-alpha.1`; пакет объявляет её peer dependency. Browser half объявлен через `dsh.client` и `exports["./client"]`. `MayoriSidebar` регистрируется в публичном root-scoped слоте `sidebar.workspaces` с приоритетом `-100`, поэтому штатный `WorkspaceBrowser` остаётся fallback. Брендинг занимает штатные `sidebar.brand.mark`, `sidebar.brand.name` и `conversation.hero.brand.mark`. `MayoriNavigationSidebar` занимает публичный `sidebar`, использует native store, locale, hooks и callbacks и зеркалит child slots с отдельным владельцем. Его renderer исключает кнопку New Session; бренд направляется в `ctx.layout.selectPanel('mayori-home')` без создания пустой сессии. Panel navigation, toggle, Settings и footer actions продолжают использовать публичные контракты DSH. В `shell.leading` для полностью скрытой desktop-панели остаётся только кнопка раскрытия. Обе регистрации ожидают stock entry и снимаются вместе с подписками при unload. DOM-подмен и скрытия stock chrome по CSS-селекторам нет. Стили и слоты удаляются вместе с Cordis fiber.

Bundle использует единый агентный preset `mayori` для инструментов, без игровых инструкций. Инструкции принадлежат отдельному каталогу пресетов игры. Страница **Настройки → Mayori → Плагины** в публичном `settings.section` управляет независимыми Dice, Rules и RollHistory. Service Definition — `PluginSettingsService`, Provider — `PersistentPluginSettingsProvider` с валидируемыми volatile Config полями и штатным Settings persistence, Consumers — browser panel и scope mount в `application.js`. Изолированный Cordis group сохраняет границу инструментов Mayori. Выбранные инструкции не зависят от переключателей. Изменения применяются к существующим чатам после завершения текущих ответов; фактические схемы запросов и исходные броски сохраняются журналом DSH. [Руководство](plugins.md).

Модельная композиция отключает `system-prompt.includeHarnessIdentity` и `includeRuntimeContext`, а также `web-runtime.surfaceContext`. Поэтому в запросах нет идентичности DSH, пути к его исходникам, Web URL и порта, указаний по HMR, сборке и запуску серверов или технических runtime snapshots. Web runtime сохраняет штатные параметры запуска и продолжает обслуживать интерфейс. Отключённый `ui-deliverables` исключает file-reference guidance, инструкции `present` и карточки результатов coding-задач. `tools.mode: native` исключает инструкции JS-исполнителя даже при заданном `DSH_TOOLS_MODE`. `personaPrefix` пустой. Системная инструкция содержит выбранный игровой пресет и активную карточку с персоной игрока; правила последовательности опираются на установленные события без указаний читать или изменять campaign files. При добавлении игровых dynamic contexts их включение необходимо явно задать в композиции.

### Пресеты ролевой игры

- **Service Definition** — Host `RoleplayPresetService` (`mayoriPresets`) для каталога и `SessionPresetService` (`mayoriSessionPresets`) для выбора чата.
- **Providers** — `FileSystemRoleplayPresetProvider` с атомарным каталогом `presetsPath/presets.json` и `LoggedSessionPresetProvider`, восстанавливающий выбор из точного журнала чата через публичный `sessionQuery.readSession()`.
- **Consumers** — защищённые same-origin RPC endpoints `preset-*` / `session-preset*`, observable browser providers и `PresetPanel` в нативной вкладке `mayori-presets`.

Начальный редактируемый пресет Mayori создаётся из прежнего director Config только при первой инициализации каталога. Выбор по умолчанию относится к новым чатам; применение к существующему чату требует idle Agent без очереди и выполняется через `runMaintenance`. В журнал сразу добавляется стандартный `user/message` с source `mayori-preset`: section metadata содержит полный версионированный снимок, content — короткое уведомление о настройке, отличённое от действия игрока. Предыдущее уведомление заменяется через surface replacement. Сама игровая инструкция регистрируется через scoped `ctx.systemPrompt.section()` с `interpolate: false`; DSH штатно сохраняет её в `system/message` при следующем запросе. Pre-step consumer начинает новую request series, чтобы прежние инструкции не оставались в активном префиксе.

Resume и fork читают снимок из своего полного либо унаследованного префикса без обращения к текущему каталогу. Редактирование и удаление пресета не меняют прошлые запросы или копии в чатах. Явный выбор без пресета сохраняется как `null`; новый default не возвращает инструкции после отключения. Snapshot не является состоянием кампании. Services, sections, listeners, HTTP routes и browser slots удаляются вместе с Cordis fiber. [Руководство](presets.md).

### Character Library

Импортированные Character Card образуют отдельную Host-owned capability seam:

- **Service Definition** — Host `CharacterLibraryService`: список, пакетный импорт и удаление;
- **Provider** — `FileSystemCharacterLibraryProvider`: полные JSON-записи и исходные PNG в валидируемом `charactersPath` (по умолчанию `$DSH_HOME/mayori/characters`);
- **Consumers** — lifecycle-bound same-origin Host route `/mayori/characters`, browser `RemoteCharacterLibraryProvider` с observable snapshot и `CharacterGalleryPanel` в root-scoped `main`.

Codec принимает JSON v2/v3 и стандартные PNG `tEXt` payloads `chara` / `ccv3`; при наличии обоих выбирает v3. Host валидирует байты до записи, сериализует карточку под content-derived id и публикует браузеру только снимок каталога. Контейнер и неизвестные поля не превращаются в prompt. Эта библиотека — пользовательский каталог ресурсов, а не campaign journal: пока карточка не выбрана для игры, модель её не видит.

### Навигация и история чатов

`sidebar.panellist` регистрирует `Главная`, `Персонажи`, `Персоны`, `Пресеты` и `История чатов` с идентификаторами `mayori-home`, `mayori-characters`, `mayori-personas`, `mayori-presets` и `mayori-history`. `HomePanel` потребляет существующие сервисы истории и библиотеки: пять последних неархивных чатов и пять карточек по `importedAt`, с переходами через `ctx.layout.selectPanel()`. Wrapper публичного session-maybe `main.conversation` показывает главную без сессии и для безымянных пустых черновиков. Для остальных чатов делегирует stock renderer, зеркаля его child slots с отдельным владельцем. Он ожидает stock contribution через `slots.subscribe`; original registrations и session selection не изменяются. Mayori владеет кнопками навигации, DSH предоставляет metadata панелей и выбранное состояние; соответствующие keyed entries в `main` показывают панели. `MayoriSidebar` занимает `sidebar.workspaces` пустым компонентом, отключая project browser без DOM-подмен. Галерея больше не перекрывает shell полноэкранной модалкой; информация о карточке остаётся нативным dialog.

История использует существующий durable каталог DSH через отдельный presentation seam:

- **Service Definition** — `ChatHistoryService`: observable snapshots каталога и архива, refresh, open, archive и restore;
- **Provider** — `SessionChatHistoryProvider`, зарегистрированный через `ctx.provide('mayoriHistory', ...)`, делегирует `sessions.list`, `sessions.refresh()`, `workspaces.list`, `uiWorkspace.openSession(id)`, `uiWorkspace.archiveSession(id)` и `uiWorkspace.unarchiveSession(id)`;
- **Consumers** — `ChatHistoryPanel` и `HomePanel`: плоский список всех кампаний на Host, поиск по названию/ID и сортировка по `updatedAt`. История использует pagination по 20/40/60 строк.

Превью образует read-only presentation seam: Host `HistoryDetailsService` / `SessionHistoryDetailsProvider`, endpoint `history-details` и browser `ChatHistoryService.details()` / `HistoryRow`. Provider читает только запрошенные ID (до 60, concurrency 4) через публичный `sessionQuery.readSession()` без активации Agent и snapshot `FileSystemCharacterSessionStore` без зависимости от текущего каталога карточек. Имя и аватар не входят в модельный контекст; последнее сообщение восстанавливается из журнала с учётом projections и замен приветствия, исключая технический контекст. Компактация контекста модели не заменяет превью последней реплики. Ошибки изолированы по строкам; поздние ответы не заменяют другой список, `Обновить` повторяет чтение даже при неизменном каталоге. Новое persistent хранилище не создаётся.

Только `snapshot.ids` задаёт членство, поэтому retained-only записи не попадают в историю. Обычные форки сохраняются, `origin: subagent` и безымянные blank-сессии скрываются. Именованный character chat виден до первого сообщения. Директории и `displayTitle` с project fallback не используются для подписей. Существующее постоянное хранилище сессий остаётся единственным источником; новый журнал или browser-local persistence не вводится. Подписка освобождается при unmount, регистрации исчезают при unload. Loading, ошибка обновления, пустой каталог и отсутствие совпадений имеют отдельные состояния. Host-owned `archivedSessionIds` разделяет обычную историю и архив; до загрузки этого снимка строки не показываются. Архивирование подтверждается пользователем и не запрашивает `stopActivity`; отказ `workspace/session-active` показывается без изменения списка. Штатный navigation consumer освобождает выбранную сессию при архивировании. Восстановление возвращает чат в обычный список. Журналы и Character Session snapshots не удаляются.

### Character Session

Запуск игры образует отдельный capability seam:

- **Service Definition** — Host `CharacterSessionService.prepareCampaign()`, `create(characterId, workspaceId, greetingIndex)`, `state(sessionId)`, `swipe(sessionId, index)`, `setPersona(sessionId, personaId)` и legacy `select(sessionId, characterId)`;
- **Provider** — `PersistentCharacterSessionProvider`, который идемпотентно создаёт `$DSH_HOME/mayori/campaigns/default` (корень задаётся валидируемым `campaignsPath`), разрешает карточку через Character Library и хранит неизменяемую связь Session → snapshot в файловом `FileSystemCharacterSessionStore` под `campaignsPath/selections`;
- **Consumer** — browser gallery, которая при отсутствии кампаний регистрирует подготовленный каталог через `workspaces.create`, получает подготовленный sessionId через Host `start`, принимает сохранённую Session через `sessions.create({ workspaceId, sessionId })`, удерживает её через `sessions.using`, ожидает `reference.ready`, задаёт имя и открывает чат через `uiWorkspace.openSession`. Временный reference освобождается как при успехе, так и при ошибке; навигация получает собственный mainView reference до освобождения временного.

Хранилище выбора содержит стандартные поля Character Card, PNG-аватар и сохранённое выбранное приветствие (индекс, итоговый текст и стабильный messageId); неизвестные поля и `extensions` остаются ресурсами каталога. Аватар относится только к представлению и исключён из модельной проекции. Старый snapshot без поля image один раз дополняется картинкой из доступного каталога при restore, либо null, если карточка удалена. Запись версионирована, имя файла — SHA-256 идентификатора сессии. Snapshot готовится во временном файле с flush, затем публикуется без перезаписи существующей записи. Выбор выполняется через `agent.runMaintenance`, чтобы ввод не начал ход посреди записи. Повтор того же выбора идемпотентен; другой персонаж требует нового чата.

При новом выборе `greetingIndex: 0` означает `first_mes`, положительный индекс выбирает соответствующий элемент `alternate_greetings`. Host проверяет индекс до сохранения. При отсутствии текста чат остаётся пустым. Компактные карточки галереи не показывают выбор «Начало истории» и preview. Consumer запускает основное приветствие с индексом 0 с компактной карточки; окно информации сохраняет выбор альтернативного начала и preview с текущей default-персоной, включая карточки с пустым основным приветствием. Альтернативы также доступны внутри чата. Галерея располагает фильтры справа и использует pagination 20/40/60 карточек; количество колонок 3/5/7 (default 5) и лимит сохраняются как валидируемые browser-local presentation preferences. На узких контейнерах количество колонок уменьшается. Эти настройки не являются campaign state. Если в чате есть авторское начало и альтернативы, до первого хода игрока доступны кнопки `‹ 1 / N ›`; очередь ввода и начавшийся ход блокируют изменение на Host. Пустая альтернатива также выбирается и позволяет вернуться к непустой.

Свайп выполняется под `agent.runMaintenance` и добавляет штатный `user/message` с `surfaceOp: replace` и полным `sourceEventSeqs` для текущего приветствия. Его source `mayori-greeting` и JSON-поле `mayori_authored_opening` обозначают авторский сценарный материал, а не действие игрока. Это публичный контекстный seam DSH: `assistant/message` не допускает `sourceEventSeqs`, необходимых для такой замены. Начальный assistant остаётся историческим фактом, но в модельном surface существует только выбранное начало. Индекс закодирован в идентификаторе replacement message и восстанавливается из журнала; mutable browser state не является источником выбора. Компактация модельного surface не удаляет выбранное приветствие из отображаемой истории: Host восстанавливает его из последней авторской записи журнала. Перед ответом consumer вызывает `sessions.flush`.

Browser `CharacterChatService` / `RemoteCharacterChatProvider` читают Host snapshot. `CharacterMessage` занимает публичные keyed slots `assistant-step`, `user` и `steering`, делегируя приветствие `GreetingMessage`; `GreetingTurnTail` занимает `turn-tail`. Приоритет `-100` сохраняет стандартные renderer, injection hooks, Markdown и locale. Один аватар персонажа показан слева от содержательной реплики, персоны игрока справа от её сообщения, снаружи штатного блока содержимого. Отдельные reasoning-part того же шага, шаги только с мыслями/вызовами инструментов и пустой текст аватар не получают, в том числе при streaming и interrupted status; изображения читаются из snapshot чата, а при отсутствии картинки используется буква имени. Native dialog показывает полный аватар, поддерживает Escape, backdrop и возврат фокуса. Вне character chat штатные сообщения не получают аватаров. Регистрация ожидает стандартные entries через `slots.subscribe`, поскольку объявление слота предшествует регистрации компонентов. Child slots имеют единственного владельца: wrapper объявляет собственные alias seats, зеркалит туда исходные contributions вместе с injections и вложенными children и перенаправляет вызовы стандартного renderer. Исходные registrations не изменяются; новые и удалённые contributions отражаются через подписку. Приветствие, Copy и точка Fork получают актуальный текст и sequence; остальные сообщения делегируются штатным компонентам. Подписки и registrations снимаются с fiber. Ownership и teardown проверяются реальным `SlotCore` опубликованного DSH.

Аватары не участвуют в ширине текстовой колонки: при свободных боковых полях они позиционируются снаружи с отступом 12 px. `ResizeObserver` измеряет реальное место до границ viewport и обрезающих scroll-контейнеров, включая изменение ширины чата и боковой панели. Если с каждой стороны нет 60 px для аватара и focus outline, аватар занимает отдельную строку над сообщением у соответствующего края. Текст, reasoning и штатные действия сохраняют исходные границы DSH; чужие DOM-элементы и стили не изменяются. Observer освобождается при unmount.

Provider готовит закрытый начальный ход через стандартный `agents.create({ seed })`: turn/start, step/start, пустой system/message, assistant/message, step/end и turn/end. Приветствие занимает `turn: 1, step: 1`, реальный ввод начинает следующий ход. Пустой system node сохраняет место для системного prompt: DSH заполнит его при первом запросе. Assistant stream пуст (LLM не вызывается, usage не выдумывается). Контракт DSH требует model source для assistant-role: отдельная статическая identity `mayori-character-card` / `authored-greeting` обозначает авторский текст карточки, а не ответ настроенной модели; adapter-private replay state отсутствует.

Host разрешает текущий preset через `agentPresets.resolve()`, монтирует его через `agentPresets.mount()` и прикрепляет сессию к выбранной кампании через `workspaceRegistry`. После `ctx.sessions.flush(session)` он освобождает собственный временный AgentHandle; browser принимает ID штатным Session Controller, который восстанавливает обычную конфигурацию API и выбранной модели. Все пути после получения handle освобождают его в finally. Создание начальной истории проверяется штатным валидатором и хранилищем DSH.

Сначала сохраняется snapshot выбора, затем создаётся Session с начальной историей. При открытии, resume и fork приветствия не дописываются: они уже принадлежат журналу. Старые snapshots без greeting восстанавливаются без автоматической вставки. Форки наследуют snapshot и исходное сообщение. `first_mes` и альтернативы исключены из постоянной модельной проекции карточки: только выбранное начало попадает в переписку. Остальные стандартные поля сохраняют отдельные именованные поля контекста. Legacy `select` остаётся способом связать пустую сессию с карточкой без вставки приветствия; новый consumer использует `create`.

Ожидаемый serial listener `agent/created` читает snapshot и восстанавливает scoped context до первого ввода, в том числе после перезапуска. При форке snapshot родителя копируется в собственную запись дочерней сессии. При загрузке плагина восстанавливаются также уже активные Agents. Ошибки чтения не подменяются новым выбором. Удаление или обновление карточки не меняет уже созданный чат. Model-visible context материализуется штатной системой prompt sections в `system/message` session log; отдельный snapshot является доменным источником, не process memory. Прежние surviving runtime snapshots с секцией `mayori:active-character` получают logged `user/message` replacements с полным `sourceEventSeqs`, сохраняющие остальные секции. Исторические запросы не меняются; миграция идемпотентна. `registerEventType`, `session.events` и `agent/session-start` не используются. Старые неизвестные обязательные события автоматически не переписываются.

Импортированные `{{…}}` не относятся к пространству переменных DSH. Provider регистрирует в `agent.ctx.systemPrompt` переменную `mayori_active_character_text` с готовым текстом карточки и section `mayori:active-character`, содержащую только ссылку на эту переменную. Порядок 20000 размещает карточку после штатных инструкций, включая environment suffix, внутри системного сообщения перед перепиской. Текст явно обозначает карточку как данные персонажа и сценария, которые не переопределяют инструкции ведущего и agency игрока. Публичный renderer DSH подставляет значение за один проход без повторного разбора содержимого; поэтому даже неизвестные или некорректные ST-макросы остаются данными и не вызывают ошибок. Переменная и section удаляются вместе при rebind, `agent/disposed` и unload Mayori. Общий `renderTemplate` раскрывает базовые ST identity и field macros в модельных полях, приветствиях и preview в окне информации персонажа. Имена вставляются буквально; рекурсивные ссылки между полями ограничены. UTC date/time берутся из сохранённого `templateTime`, поэтому resume не меняет текст. Источник карточки сохраняется без изменений; результат подстановки попадает в штатный session log. Скрипты, переменные, случайные выборы и dice macros не исполняются.

Character Session Provider регистрирует scoped waterfall `agent/pre-step`: после `next()` успешное admission получает `startsRequestSeries: true`, отказ остаётся без изменений. Штатная SystemPromptProjection поэтому консолидирует prompt на зарезервированном первом system node даже у adapter с `systemPromptUpdate: in-history`; иначе первая сборка могла дописать его после авторского приветствия. Mayori не редактирует loop и не переставляет сообщения только в renderer. Handler снимается вместе с variable и section при rebind, dispose и unload. Request series начинается на каждом шаге character chat; неизменный prompt не требует нового system replacement.

Окно аватара монтируется React portal непосредственно в body только при открытии, поэтому стили и компоновка строки сообщения не влияют на dialog. Непрозрачная поверхность использует действительный theme token `--dsw-alias-bg-layer-1`; отдельные grid rows удерживают заголовок и изображение в viewport. Media region с `min-block-size: 0` и `object-fit: contain` показывает высокие и широкие PNG целиком без наложения на заголовок. Закрытие удаляет portal и возвращает фокус на исходную кнопку.

### Редактирование и повтор ответа

- **Service Definition** — Host `MessageRevisionService.inspect/edit/regenerate`, зарегистрированный как `mayoriMessageRevisions`.
- **Provider** — `SessionMessageRevisionProvider`: использует `sessionController.resolveAgent`, `fork`, `selectModel`, `agent.runMaintenance`, `agent.followup` и `sessions.flush`; исходная сессия не переписывается. Холодные чаты восстанавливаются штатным Controller, не создавая нового источника истории. `CharacterSessionService.state` также ждёт его восстановления перед чтением snapshot.
- **Consumers** — same-origin endpoints `message-inspect`, `message-edit`, `message-regenerate`, browser `RemoteMessageRevisionProvider`, редактор в native dialog и переключатель веток в session header. Иконки ответа добавляются в штатный child slot `conversation.chat.assistant-actions` через обратимый wrapper; иконка игрока монтируется portal в существующую clock/copy row внутри собственного message wrapper. Scoped observer следует за заменой этой строки и отключается при unmount; отдельной панели под текстом нет. Message wrapper сохраняет штатные текст, Markdown, Copy, timestamps и attachments.

Реплика игрока отправляется заново после native fork перед исходным вводом; ответ модели выполняется штатным Agent. Для ручной реплики персонажа `buildForkSeed` перед исходным settlement дополняется закрытым авторским ходом из стандартных событий **до** `ctx.agents.create`. Для приветствия без ввода игрока наследуемый prefix пустой: `session/end-seed` и авторский первый ход создают новое начало. Поэтому счётчик ходов Agent соответствует журналу и после продолжения, и при cold replay. Ветка получает исходный preset, workspace, parent и сохранённый `model/selection`; временный owner освобождается после flush, а browser принимает её через штатный Controller. Identity `mayori-authored-message / manual-edit` отличает авторский текст от фактического запроса: stream пустой, usage отсутствует, reasoning и tool calls не создаются. Изображения и файлы остаются в content. Trajectory исключает ручные settlements из списка запросов, сохраняя их в журнале и последующем модельном контексте.

Повтор ответа возвращается к ближайшему человеческому вводу и не наследует заменяемый ответ или последующие события. Новые вызовы Dice/Rules записывают новые реальные исходы; старые остаются в исходном чате. Native repair закрывает открытый префикс форка. Текущая модель и reasoning effort восстанавливаются из latest pending `model/selection` либо последнего request header, затем устанавливаются штатным Controller.

Изменение старой реплики начинает другое продолжение; предыдущие последующие ответы не подмешиваются. Ветки принадлежат native session catalog и `parentId`/`parentSession` lineage, нового campaign/version store нет. Авторские приветствия редактируются с учётом текущего выбора; регенерация требует человеческого ввода. Host сериализует операции, блокирует running/queued/subagent chats и повторно проверяет живой Agent после awaits. Ошибки после создания ветки дают её ID для восстановления. UI-драфт не становится модельным контекстом до сохранения. [Руководство](messages.md).

### Контекст в Trajectory

- **Service Definition** — Host `TrajectoryContextService.inspect(sessionId, selection)` и observable browser `TrajectoryContextService`;
- **Provider** — `SessionTrajectoryContextProvider`, читающий журнал живой сессии и использующий публичные `foldSurface`, `deriveEventMessage`, `foldRequestHeader` вместе с зарегистрированными `sessions.messageProjections`;
- **Consumer** — защищённый same-origin endpoint `trajectory-context`, `RemoteTrajectoryContextProvider` и wrapper публичного `conversation.view` entry `trajectory`.

По умолчанию Trajectory показывает вход последнего завершённого запроса. Выбор запроса — sequence его `assistant/message` или `assistant/attempt`; авторское начало карточки не считается запросом. Префикс до settlement восстанавливает вход потоковой попытки, исключая её ответ и учитывая замены и проекции только на тот момент. Неудачные попытки доступны отдельно. «Текущий сохранённый контекст» показывает текущий surface, включая последний ответ; до первого запроса это единственный доступный снимок. Он не обещает ещё не материализованные обновления system/runtime context. Чтение не добавляет события и не вызывает модель. Инструменты и параметры берутся из исторического request header. Это сообщения DSH до преобразования provider adapter в сетевой формат.

Оба режима используют штатный Trajectory renderer, таблицу, таймлайн, поиск, panel деталей, hooks и locale. Для «Контекста запроса» pure adapter `contextTrajectorySnapshot` переводит сообщения Host в публичные `TrajectorySnapshot` / Conversation Node contracts. Он сохраняет timestamps и позиции из журнала, использует только реконструированное содержимое (в том числе после message projections), передаёт актуальные system prompt и schemas в native details и исключает старые prompt changes. Пустой partial anchor задаёт положение выбранного запроса без assistant output или нового события. Контекст целиком загружен с Host; stock pagination раскрывает его resident rows без подмешивания старого полного журнала. При смене запроса состояние таблицы сбрасывается. «Полный журнал» получает исходный stock snapshot. Child image slot зеркалится через alias с отдельным владельцем. Wrapper ожидает stock entry через `slots.subscribe`, регистрации и подписки удаляются с fiber. DSH 0.2.1 строит список вкладок из raw slot registrations; wrapper штатного `conversation.session.header` удаляет повторные view IDs только из отображения, сохраняя store, hooks, contributions и исходный registry. Старый RPC-ответ не может заменить новый выбор запроса; ошибки не показывают прежний снимок как актуальный. Автоматические тесты сравнивают snapshot с фактическими сообщениями тестового adapter.

Порядок view tabs определяется Mayori header consumer: после дедупликации `chat` всегда идёт первым, затем остальные entries в исходном порядке. Приоритет wrapper выбирает renderer Trajectory, но не меняет положение чата. Исходный массив регистраций не изменяется; результат memoized для стабильного observable selector.

### Персона игрока

- **Service Definition** — Host `PersonaService` (`list`, `save`, `remove`, `setDefault`, `resolve`) и observable browser `PersonaService`;
- **Provider** — `FileSystemPersonaProvider` с сериализованными атомарными записями `personas.json` в валидируемом `personasPath`, по умолчанию `$DSH_HOME/mayori/personas`;
- **Consumers** — same-origin route, `RemotePersonaProvider`, `PersonaPanel`, preview в окне информации персонажа и Character Session Provider.

Персона содержит имя, необязательные описание, подпись и PNG/JPEG/WebP avatar. Подпись и avatar не входят в модельный контекст. Default применяется только при создании чата; без него используется имя `Игрок` и пустое описание. Snapshot персоны сохраняется рядом с выбранной карточкой и наследуется при форке. Изменение или удаление записи каталога не меняет созданные чаты. Явное «Играть в этом чате» атомарно обновляет persona snapshot под maintenance, перевязывает logged prompt context и, только до первого хода, заменяет приветствие. Исторические действия игрока не переписываются. Доменное описание не даёт модели права выбирать за игрока.

### Dice

- **Service Definition** — preset-scoped `DiceService.roll(rolls, { signal, purpose })` и read-only `validate(rolls, { purpose })`, зарегистрированный как `mayoriDice` в отдельном Cordis realm (`isolate.mayoriDice: true`);
- **Provider** — `CryptoDiceProvider`: ограниченный парсер выражений и независимые равномерные целочисленные броски через `node:crypto.randomInt`, без каталога видов костей;
- **Consumer** — native `rollDice`, зарегистрированный через `ctx.tools.register` в дочернем плагине пресета Mayori. `registerDiceTool` можно подключить к другому provider того же сервиса.

Вход — дерево объектов/массивов со строковыми выражениями в листьях. Ограниченный парсер `src/features/dice/domain/expression.js` поддерживает арифметику, сравнения, boolean-логику, count/countFaces/face, сохранённые пулы, составные предикаты, kh/kl, взрывы, перебросы и ссылки. Provider сначала разбирает все листья и валидирует структуру/бюджеты/граф зависимостей, затем вычисляет результаты с memoization, ленивым if и short-circuit логикой. Ошибка выражения сохраняется в своём поле; глобальные структурные лимиты проверяются до случайности. Никакого eval или agent-loop patch нет.

Canonical result версии 3 содержит values с числовыми/boolean/null листьями, массив errors, observations выбранных граней и полную details. Tool boundary добавляет `rollId`, равный сохранённому callId. Каждая грань имеет глобальный drawIndex, исходную кость и причину появления; модифицированные группы сохраняют цепочки, перебросы и выбор. Ссылки и выбранные ветки входят в trace. Лимиты взрывов/перебросов возвращают ошибку поля с фактическими гранями, никогда неполный итог. Обычный model-visible content содержит только rollId, values и непустой errors. `output.presentationMeta` сохраняет полный результат в metadata штатного tool/result. Совместимый `details: true` включает полный JSON сразу. Resume/fork читают прежние события без повторных бросков; скрытое состояние/seed не вводятся. Все deployment-лимиты входят в валидируемый Config. Полная семантика описана в [dice guide](dice.md).

### Roll history

- **Service Definition** — preset-scoped `RollHistoryService.read(session, rollIds)`, зарегистрированный как `mayoriRollHistory`;
- **Provider** — `SessionRollHistoryProvider`, читающий исходные `tool/result` текущего журнала, включая унаследованные записи и результаты вне модельного surface;
- **Consumer** — native `getRollDetails`, принимающий 1–20 разных rollId и возвращающий полные результаты либо отдельные ошибки по каждому ID.

Provider не создаёт отдельного хранилища, не вызывает Dice/Rules и не использует текущий Config. Доступ ограничен `exec.agent.session`, без произвольного sessionId. Перезапуск и форк сохраняют идентификаторы; content rewrites не считаются новыми бросками. Общие readers проверяют compact/full contract и metadata. Seam подключается отдельным необязательным `dsh-mayori/roll-history`, а не автоматически через Dice. Подробности описаны в [руководстве](roll-history.md).

Browser consumer DiceToolCard зарегистрирован в публичном keyed tool.call.toolview по имени rollDice. DSH владеет Conversation Node, pairing, фазами и Inspect. Pure browser-safe readDiceResult читает версии 3, 2, 1 и unversioned записи, проверяет trace и совпадение компактного content с block.meta без вычисления формул. Карточка отображает успешные boolean и числа рядом с ошибочными полями и выбранные грани без раскрытия; подробности содержат цепочки и выбор ветки. Неизвестные версии/повреждённые записи доступны исходным текстом. Native buttons/details, штатный useDisclosure и theme tokens сохраняют существующий UI контракт; все registrations исчезают с Cordis fiber.

### Числовые Rules

- **Service Definition** — preset-scoped `RulesService` (`mayoriRules`): `profiles()` и `resolve(request, { signal })`.
- **Provider** — `NumericRulesProvider`: валидируемые versioned Config profiles, сравнение с target, natural criticals и configured failure effects. Случайность принадлежит потребляемому `DiceService`; все проверки, условный урон и таблица последствий выполняются одним batch.
- **Consumers** — native `resolveCheck` и browser `CheckToolCard` в keyed `tool.call.toolview`.

`src/host/rules-plugin.js` вызывает отдельную Rules composition в `src/host/application.js` и требует `mayoriDice`; отсутствие зависимости блокирует подключение, а её выгрузка снимает Rules consumer. Dice provider может работать с `exposeTool: false`. Формулы урона задаются до броска; fixed effects и random tables находятся в Config profiles. Полный snapshot профиля, вход и результат версии 1 записываются в tool/result metadata; natural face, modifier, total, target, outcome, damage и consequence входят и в compact content. Reader восстанавливает карточку из записи, проверяя согласованность snapshot и recorded dice, без текущего provider/Config. Изменение правил не меняет исторический исход. Неполный урон или таблица сохраняет успешную проверку и error trace; повторного броска нет. Provider не изменяет HP или campaign state. Детали — [rules guide](rules.md).

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

### Rules

- Rules Service Definition описывает запрос разрешения действия без привязки к игровой системе.
- Provider реализует конкретную систему или systemless resolution.
- Tool Consumer валидирует модельный JSON, вызывает provider и возвращает доказуемый результат.

Генератор случайности принадлежит реализованному Dice provider, а не prompt. Numeric Rules provider уже потребляет этот сервис; исторические броски восстанавливаются из записанных результатов.

### Scene direction

Scene service управляет активной сценой, участниками, временем и незавершёнными последствиями. Он потребляет campaign state и rules, но не владеет их данными.

### Client

RPG-клиент должен строиться из session events и доменных проекций: чат, карточки персонажей, журнал, броски и карта сцены остаются независимыми Conversation Nodes. Backend не кодирует представление в результатах инструментов.

## Границы первого релиза

`dsh-mayori` содержит библиотеку игровых пресетов и session-scoped инструкции, Host-owned Character Library с галереей и историей чатов и numeric Dice/Rules capabilities. Состояние кампании и конкретные игровые rulesets будут добавляться полными seams с тестами и долговечными событиями.
