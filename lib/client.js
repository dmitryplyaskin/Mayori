window.__ModuleLoader__.load({
	id: "dsh-mayori",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/features/localization/shared/en.js
		/** Product copy uses its Russian source as a stable gettext-style key. */
		const en = {
			"Страницы списка": "List pages",
			"На странице": "Per page",
			"{p1} из {p2}": "{p1} of {p2}",
			"Предыдущая страница": "Previous page",
			"Страница": "Page",
			"из {p1}": "of {p1}",
			"Следующая страница": "Next page",
			"Не удалось выполнить операцию с библиотекой.": "Could not complete the library operation.",
			"Главная": "Home",
			"Персонажи": "Characters",
			"История чатов": "Chat history",
			"Персоны": "Personas",
			"Пресеты": "Presets",
			"Не удалось загрузить последние чаты. Попробуйте открыть историю и обновить список.": "Could not load recent chats. Open chat history and refresh the list.",
			"Не удалось открыть чат. Попробуйте ещё раз.": "Could not open the chat. Try again.",
			"Удалить персонажа «{p1}» из галереи?": "Delete “{p1}” from the gallery?",
			"Добро пожаловать в Mayori": "Welcome to Mayori",
			"Продолжите свою историю или выберите персонажа для нового приключения.": "Continue your story or choose a character for a new adventure.",
			"Последние чаты": "Recent chats",
			"Загружаем чаты…": "Loading chats…",
			"Не удалось загрузить состояние архива.": "Could not load the archive.",
			"Чатов пока нет. Выберите персонажа ниже, чтобы начать историю.": "No chats yet. Choose a character below to start a story.",
			"Перейти в историю чатов ": "Open chat history ",
			"Недавно загруженные персонажи": "Recently imported characters",
			"Загружаем персонажей…": "Loading characters…",
			"В галерее пока нет персонажей. Перейдите в персонажи и импортируйте карточку PNG или JSON.": "No characters yet. Open Characters and import a PNG or JSON card.",
			"Перейти к персонажам ": "Open characters ",
			"Дождитесь сохранения текущего выбора.": "Wait for the current selection to finish saving.",
			"Новый чат": "New chat",
			"Начать новую историю с этим персонажем": "Start a new story with this character",
			"Не удалось прочитать текущий чат.": "Could not read the current chat.",
			"Откройте чат персонажа из галереи.": "Open a character chat from the gallery.",
			"Варианты приветствия": "Greeting variants",
			"Предыдущее приветствие": "Previous greeting",
			"Следующее приветствие": "Next greeting",
			"Открыть аватар: {p1}": "Open avatar: {p1}",
			"Закрыть аватар": "Close avatar",
			"Аватар: {p1}": "Avatar: {p1}",
			"Аватар пока не добавлен.": "No avatar yet.",
			"Персонаж": "Character",
			"Игрок": "Player",
			"Некорректный идентификатор карточки.": "Invalid card ID.",
			"Некорректный идентификатор сессии.": "Invalid session ID.",
			"Чат закрыт. Создайте новый чат из галереи.": "This chat is closed. Start a new chat from the gallery.",
			"Дождитесь окончания ответа перед выбором персонажа.": "Wait for the response to finish before choosing a character.",
			"Для другого персонажа создайте новый чат из галереи.": "Start a new chat from the gallery to choose another character.",
			"Персонаж больше не найден в галерее.": "The character is no longer in the gallery.",
			"Некорректный вариант приветствия.": "Invalid greeting variant.",
			"Кампания не найдена. Обновите страницу.": "Campaign not found. Refresh the page.",
			"Приветствие больше не найдено в карточке.": "The greeting is no longer in the card.",
			"Не удалось открыть чат персонажа.": "Could not open the character chat.",
			"Чат закрыт. Откройте его снова.": "This chat is closed. Open it again.",
			"Приветствие можно менять только до первого хода игрока.": "You can change the greeting before the first player turn.",
			"Выберите чат персонажа из галереи.": "Choose a character chat from the gallery.",
			"Сохранённый выбор персонажа повреждён. Восстановите файл из резервной копии.": "The saved character selection is damaged. Restore the file from a backup.",
			"Snapshot аватара персонажа повреждён.": "The character avatar snapshot is damaged.",
			"Snapshot персоны повреждён.": "The persona snapshot is damaged.",
			"Snapshot описания персоны повреждён.": "The persona description snapshot is damaged.",
			"Snapshot времени повреждён.": "The time snapshot is damaged.",
			"Snapshot приветствия повреждён.": "The greeting snapshot is damaged.",
			"Портрет: {p1}": "Portrait: {p1}",
			"Импорт…": "Importing…",
			"Импортировать": "Import",
			"Автор не указан": "No author specified",
			"Теги": "Tags",
			"Открываем…": "Opening…",
			"Играть": "Play",
			"Изменить": "Edit",
			"Описание": "Description",
			"Характер": "Personality",
			"Сценарий": "Scenario",
			"Первое сообщение": "First message",
			"Пример диалога": "Example dialogue",
			"Заметки автора": "Author notes",
			"Закрыть информацию": "Close details",
			"Начало истории": "Story opening",
			"Основное приветствие": "Default greeting",
			"Без приветствия": "No greeting",
			"Альтернатива {p1}": "Alternative {p1}",
			"Приветствие": "Greeting",
			"История начнётся с вашего сообщения.": "Your message will start the story.",
			"У этой карточки нет дополнительного описания.": "This card has no additional description.",
			"Файл": "File",
			"Добавлен": "Added",
			"Удалить персонажа": "Delete character",
			"Закрыть": "Close",
			"Поиск": "Search",
			"Имя, автор, описание": "Name, author, description",
			"Сортировка": "Sort",
			"Сначала новые": "Newest first",
			"По имени": "Name",
			"По автору": "Author",
			"Автор": "Author",
			"Все авторы": "All authors",
			"Портрет": "Portrait",
			"Все": "All",
			"С портретом": "With a portrait",
			"Без портрета": "Without a portrait",
			"Сбросить фильтры": "Reset filters",
			"Импортировано: {p1}.": "Imported: {p1}.",
			"Персонаж «{p1}» удалён.": "Character “{p1}” deleted.",
			" · Обновляем каталог…": " · Refreshing catalog…",
			"{p1} в галерее{p2}": "{p1} in the gallery{p2}",
			"Не удалось загрузить галерею": "Could not load the gallery",
			"Загрузка…": "Loading…",
			"Фильтры": "Filters",
			"Закрыть фильтры": "Close filters",
			"Фильтры персонажей": "Character filters",
			"Найдено {p1} из {p2}": "Found {p1} of {p2}",
			"Карточек в ряд": "Cards per row",
			"Повторить загрузку": "Retry",
			"Загружаем галерею…": "Loading gallery…",
			"Персонажей пока нет": "No characters yet",
			"Ничего не найдено": "No results",
			"Импортируйте PNG или JSON, чтобы добавить первого персонажа.": "Import a PNG or JSON card to add your first character.",
			"Измените запрос или сбросьте фильтры.": "Change your search or reset filters.",
			"Файл превышает 16 МБ.": "The file exceeds 16 MB.",
			"Некорректные фильтры каталога.": "Invalid catalog filters.",
			"Файл карточки содержит некорректные данные.": "The card file contains invalid data.",
			"Ожидался список файлов карточек.": "Expected a list of card files.",
			"За один раз можно импортировать не больше {p1} файлов.": "You can import up to {p1} files at a time.",
			"Некорректное описание файла карточки.": "Invalid card file description.",
			"Портрет не найден.": "Portrait not found.",
			"Файл {p1}.json не является карточкой Mayori.": "The file {p1}.json is not a Mayori card.",
			"Метаданные карточки содержат некорректный Base64.": "The card metadata contains invalid Base64.",
			"Не удалось декодировать метаданные карточки.": "Could not decode the card metadata.",
			"Файл содержит некорректный JSON.": "The file contains invalid JSON.",
			"Карточка должна быть JSON-объектом.": "The card must be a JSON object.",
			"Поддерживаются только Character Card v2 и v3.": "Only Character Card v2 and v3 are supported.",
			"В карточке отсутствует непустое поле data.name.": "The card must contain a non-empty data.name field.",
			"В карточке отсутствует строковое поле spec_version.": "The card must contain a spec_version string.",
			"Карточка создана для более новой версии {p1}; неизвестные поля сохранены.": "The card uses a newer version, {p1}; unknown fields were preserved.",
			"PNG-файл имеет некорректную сигнатуру.": "The PNG file has an invalid signature.",
			"PNG-файл обрывается внутри блока метаданных.": "The PNG file ends inside a metadata chunk.",
			"Файл карточки превышает лимит 16 МБ.": "The card file exceeds the 16 MB limit.",
			"В PNG не найдены метаданные Character Card (`chara` или `ccv3`).": "No Character Card metadata (chara or ccv3) found in the PNG.",
			"Блок `ccv3` не содержит Character Card v3.": "The ccv3 chunk does not contain a Character Card v3.",
			"Блок `chara` не содержит Character Card v2.": "The chara chunk does not contain a Character Card v2.",
			"Настройки сжатия": "Compaction settings",
			"Порог заполнения контекста, %": "Context usage threshold, %",
			"Сжатие начинается у этого порога или раньше, если нужен запас для ответа.": "Compaction starts at this threshold, or earlier to leave room for a response.",
			"Оставлять последние сообщения, %": "Keep recent messages, %",
			"Доля доступного контекста, которую сохраняем дословно. Должна быть меньше порога сжатия.": "Share of available context kept verbatim. Must be below the compaction threshold.",
			"Инструкция сжатия": "Compaction instruction",
			"Укажите, что сохранять в изложении: обещания, отношения, незавершённые задачи, предметы и ограничения персонажей.": "Specify what to keep: promises, relationships, unfinished tasks, items and character limits.",
			"Вернуть игровую инструкцию": "Restore story instruction",
			"Лимиты в токенах": "Token limits",
			"Лимит ответа для изложения": "Summary response limit",
			"Включает размышления, если модель учитывает их в лимите ответа. Незавершённое изложение не заменяет историю.": "Includes reasoning if the model counts it toward the response limit. An unfinished summary will not replace the history.",
			"Дополнительный запас контекста": "Extra context reserve",
			"Резерв сверх места для обычного ответа. Для моделей с небольшим окном уменьшите это значение.": "Reserve beyond the space for a normal response. Reduce it for models with smaller context windows.",
			"Сохранить настройки сжатия": "Save compaction settings",
			"Есть несохранённые изменения.": "You have unsaved changes.",
			"Для сжатия истории нужна выбранная модель.": "Select a model to compact the history.",
			"Изложение не завершено: достигнут лимит ответа для сжатия.": "The summary is unfinished: the compaction response limit was reached.",
			"Изложение должно содержать только текст.": "The summary must contain only text.",
			"Вместо изложения модель запросила инструмент.": "The model requested a tool instead of returning a summary.",
			"Модель вернула пустое изложение.": "The model returned an empty summary.",
			"Оценка контекста не соответствует текущему журналу.": "The context estimate does not match the current log.",
			"Инструмент сжатия доступен только во время текущего хода.": "The compaction tool is available only during the current turn.",
			"В журнале отсутствует защищённый системный префикс.": "The protected system prefix is missing from the log.",
			"Для сжатия нужен текущий чат.": "Compaction requires a current chat.",
			"Для сжатия нужно доступное окно контекста выбранной модели.": "Compaction requires the selected model’s available context window.",
			"Неизвестная настройка сжатия истории.": "Unknown compaction setting.",
			"Порог заполнения контекста": "Context usage threshold",
			"Доля последних сообщений": "Share of recent messages",
			"{p1}: укажите целое число от {p2} до {p3}.": "{p1}: enter an integer from {p2} to {p3}.",
			"Доля последних сообщений должна быть меньше порога сжатия.": "The share of recent messages must be below the compaction threshold.",
			"Инструкция сжатия должна содержать от 1 до 32768 символов.": "The compaction instruction must contain 1 to 32768 characters.",
			"Перед сжатием начните ход, чтобы сохранить его настройки в журнале чата.": "Start a turn before compaction to record its settings in the chat log.",
			"Деление на ноль. Проверьте знаменатель.": "Division by zero. Check the denominator.",
			"Результат слишком большой. Проверьте формулу.": "The result is too large. Check the formula.",
			" (отброшен)": " (discarded)",
			"один раз": "once",
			"пока выполняется правило": "while the rule applies",
			"Переброс: {p1}": "Reroll: {p1}",
			"Лучшие": "Highest",
			"Худшие": "Lowest",
			"Выпавшие грани": "Rolled faces",
			"Взрыв": "Explosion",
			"Переброс": "Reroll",
			"Взрыв. ": "Explosion. ",
			"Переброс. ": "Reroll. ",
			"Отброшен: ": "Discarded: ",
			"Учтён: ": "Kept: ",
			"Показать все грани ({p1})": "Show all faces ({p1})",
			"Готовится бросок": "Preparing roll",
			"Бросаем кубики": "Rolling dice",
			"Бросок прерван": "Roll interrupted",
			"Есть ошибки": "Contains errors",
			"Не удалось вычислить": "Could not calculate",
			"Исходный результат": "Raw result",
			"Готово": "Done",
			"Броски кубиков": "Dice rolls",
			"В журнал": "Open log",
			"Ошибка": "Error",
			"Итог: ": "Total: ",
			"Да": "Yes",
			"Нет": "No",
			"На d": "On d",
			"Использовано: ": "Used: ",
			"да": "yes",
			"нет": "no",
			"«тогда»": "“then”",
			"«иначе»": "“else”",
			"Условие: {p1}. Выполнена ветка {p2}.": "Condition: {p1}. Executed the {p2} branch.",
			"Без броска кубиков": "No dice roll",
			"Остальные результаты доступны в подробностях.": "More results are available in the details.",
			"Вычисление остановлено. Выпавшие грани сохранены в подробностях.": "Calculation stopped. Rolled faces were preserved in the details.",
			"Ошибки отмечены у отдельных полей. Остальные результаты сохранены.": "Errors are marked next to each field. Other results were preserved.",
			"Показать исходный результат": "Show raw result",
			"Сохранённые сведения о прерывании:": "Recorded interruption details:",
			"Сообщение инструмента:": "Tool message:",
			"Результат сохранён в исходном формате.": "The result was saved in its original format.",
			"Инструмент не вернул содержимое.": "The tool returned no content.",
			"Некорректный список удалённых чатов.": "Invalid deleted chats list.",
			"Чат удалён.": "Chat deleted.",
			"Чат без названия": "Untitled chat",
			"Не удалось загрузить данные чата.": "Could not load chat details.",
			"Загружаем сообщение…": "Loading message…",
			"Сообщений пока нет": "No messages yet",
			"Открыт сейчас": "Currently open",
			"Не удалось загрузить историю. Попробуйте обновить список.": "Could not load history. Refresh the list.",
			"Не удалось открыть чат. Обновите список и попробуйте снова.": "Could not open the chat. Refresh the list and try again.",
			"Убрать чат «{p1}» в архив?": "Archive chat “{p1}”?",
			"Чат восстановлен.": "Chat restored.",
			"Чат перемещён в архив.": "Chat archived.",
			"Чат ещё выполняет работу. Дождитесь завершения или остановите её в чате, затем повторите.": "The chat is still running. Wait for it to finish or stop it in the chat, then try again.",
			"Не удалось восстановить чат.": "Could not restore the chat.",
			"Не удалось переместить чат в архив.": "Could not archive the chat.",
			"Чат ещё выполняет работу. Дождитесь завершения.": "The chat is still running. Wait for it to finish.",
			"Не удалось удалить чат.": "Could not delete the chat.",
			"Обновить": "Refresh",
			"Поиск по названию или ID чата ": "Search by chat title or ID ",
			"Например, имя персонажа": "For example, a character name",
			"Статус": "Status",
			"Статус чатов": "Chat status",
			"Без архива": "Unarchived",
			"Архив": "Archive",
			"Все чаты": "All chats",
			"Чаты": "Chats",
			"Тип чатов": "Chat type",
			"Открытые": "Open",
			"В работе": "Running",
			"Ветки": "Branches",
			"Без веток": "Original chats",
			"Активность": "Activity",
			"Период активности": "Activity period",
			"За всё время": "All time",
			"За 24 часа": "Last 24 hours",
			"За 7 дней": "Last 7 days",
			"За 30 дней": "Last 30 days",
			"Сортировка чатов": "Sort chats",
			"Сначала недавние": "Most recent first",
			"Сначала давние": "Oldest first",
			"Название: А–Я": "Title: A–Z",
			"Название: Я–А": "Title: Z–A",
			"Загружаем историю…": "Loading history…",
			"Найдено чатов: {p1}": "Chats found: {p1}",
			"Не удалось загрузить состояние архива. Проверьте соединение и перезагрузите страницу.": "Could not load the archive. Check your connection and reload the page.",
			"Чаты не найдены. Измените фильтры или поиск.": "No chats found. Change your filters or search.",
			"В архиве пока нет чатов.": "No archived chats yet.",
			"Чатов пока нет.": "No chats yet.",
			"Восстановить чат": "Restore chat",
			"В архив — чат": "Archive chat",
			"Сохраняем…": "Saving…",
			"Восстановить": "Restore",
			"В архив": "Archive",
			"Удалить": "Delete",
			"Удалить чат «{p1}»": "Delete chat “{p1}”",
			"Удалить чат «{p1}»?": "Delete chat “{p1}”?",
			"Отмена": "Cancel",
			"Удаляем…": "Deleting…",
			"Список удалённых чатов повреждён.": "The deleted chats list is damaged.",
			"Изображение": "Image",
			"Некорректный список чатов (не более 60).": "Invalid chats list (up to 60).",
			"Некорректное изображение.": "Invalid image.",
			"Изображение превышает 16 МБ.": "The image exceeds 16 MB.",
			"У этой реплики нет хода игрока для повторной генерации.": "This message has no player turn to regenerate from.",
			"Перезапустите Mayori и обновите страницу для удаления сообщений.": "Restart Mayori and refresh the page to delete messages.",
			"Введите текст сообщения.": "Enter a message.",
			"Редактировать": "Edit",
			"Повторить ответ": "Regenerate response",
			"Удалить сообщение": "Delete message",
			"Загружаем реплику…": "Loading message…",
			"Редактировать сообщение": "Edit message",
			"Удалить сообщение?": "Delete message?",
			"Реплика игрока": "Player message",
			"Реплика персонажа": "Character message",
			"Сохранить в чате": "Save in chat",
			"Создать ветку": "Create branch",
			"Ветка чата": "Chat branch",
			"Редактор обновлён, но Host использует старую версию. Перезапустите Mayori и обновите страницу перед редактированием.": "The editor was updated, but the server is using an older version. Restart Mayori and refresh the page before editing.",
			"Host использует старый повтор с созданием ветки. Перезапустите Mayori и обновите страницу.": "The server is using the older regeneration flow that creates a branch. Restart Mayori and refresh the page.",
			"Для сохранения вариантов перезапустите Mayori и обновите страницу.": "Restart Mayori and refresh the page to save variants.",
			"Дождитесь сохранения текущей реплики.": "Wait for the current message to finish saving.",
			"Предыдущий": "Previous",
			"Следующий": "Next",
			"Варианты ответа": "Response variants",
			"Предыдущий вариант ответа": "Previous response variant",
			"Следующий вариант ответа": "Next response variant",
			"Восстановление сообщения в журнале повреждено.": "The message restoration record is damaged.",
			"Удаление сообщения в журнале повреждено.": "The message deletion record is damaged.",
			"Правка сообщения в журнале повреждена.": "The message edit record is damaged.",
			"У этого ответа нет реплики игрока для повторной генерации.": "This response has no player message to regenerate from.",
			"Реплика игрока для этого ответа удалена.": "The player message for this response was deleted.",
			"Исходный чат": "Original chat",
			"Ветка {p1} · {p2}": "Branch {p1} · {p2}",
			"Варианты ответа в журнале повреждены.": "The response variants in the log are damaged.",
			"Вариант ответа не найден в журнале.": "Response variant not found in the log.",
			"Некорректный идентификатор чата.": "Invalid chat ID.",
			"Не удалось открыть чат для редактирования.": "Could not open the chat for editing.",
			"Редактирование доступно в чате персонажа.": "Editing is available in a character chat.",
			"Дождитесь завершения ответа и отправки сообщений из очереди.": "Wait for the response to finish and queued messages to send.",
			"Некорректная реплика.": "Invalid message.",
			"Реплика не найдена в журнале чата.": "Message not found in the chat log.",
			"Реплика удалена из чата.": "The message was deleted from the chat.",
			"Реплика не содержит сообщения.": "This entry contains no message.",
			"Вызовы инструментов нельзя редактировать как реплику.": "Tool calls cannot be edited as messages.",
			"У этой реплики нет текста для редактирования.": "This message has no text to edit.",
			"Ветка {p1} создана. Откройте её в истории чатов, чтобы продолжить.": "Branch {p1} created. Open it in chat history to continue.",
			"Выберите сохранение в чате или создание ветки.": "Choose to save in chat or create a branch.",
			"Это продолжение уже сжато. Повторите более новый ответ или создайте ветку перед сжатием.": "This continuation was already compacted. Regenerate a newer response or create a branch before compaction.",
			"Авторское приветствие нельзя генерировать заново.": "The author’s greeting cannot be regenerated.",
			"Выберите чат персонажа.": "Choose a character chat.",
			"Вариант ответа не найден.": "Response variant not found.",
			"Список блоков": "Block list",
			"Добавить блок": "Add block",
			"Добавить группу": "Add group",
			"Выбрать блок": "Select block",
			"Группа": "Group",
			"Новая группа": "New group",
			"Новый блок": "New block",
			"Авто · ": "Auto · ",
			"Включён": "Enabled",
			"Выключен": "Disabled",
			"Добавьте одежду, биографию или детали сцены отдельным блоком.": "Add clothing, biography or scene details as a separate block.",
			"Переместить выше": "Move up",
			"Переместить ниже": "Move down",
			"группу": "group",
			"блок": "block",
			"Удалить {p1}": "Delete {p1}",
			"Название ": "Title ",
			"группы": "of group",
			"блока": "of block",
			"Текст блока": "Block text",
			"Блоков в группе: {p1}": "Blocks in group: {p1}",
			"Добавить блок в группу": "Add block to group",
			"Автоматическая активация": "Automatic activation",
			"Включать по условиям": "Enable when conditions match",
			"Текст в описании персонажа": "Text in character description",
			"Добавить текущий чат": "Add current chat",
			"Добавить текущего персонажа": "Add current character",
			"Чат": "Chat",
			"текущий": "current",
			"Убрать": "Remove",
			"Достаточно любого условия.": "Any matching condition is enough.",
			"Дополнения к описанию": "Description additions",
			"Включайте нужные детали и собирайте их в группы.": "Enable the details you need and organize them into groups.",
			"Сменить персону": "Change persona",
			"Выбрать, за кого играть в этом чате": "Choose who to play in this chat",
			"Поиск персоны…": "Search personas…",
			"Персон пока нет.": "No personas yet.",
			"Персоны не найдены.": "No personas found.",
			"Не удалось загрузить персоны чата.": "Could not load chat personas.",
			"Без персоны": "No persona",
			"Имя в чате: Игрок": "Chat name: Player",
			"Блоки": "Blocks",
			"Настройки": "Settings",
			"Предпросмотр": "Preview",
			"Не удалось сохранить. Попробуйте ещё раз.": "Could not save. Try again.",
			"Выберите PNG, JPEG или WebP.": "Choose a PNG, JPEG or WebP image.",
			"Не удалось прочитать изображение.": "Could not read the image.",
			"Аватар добавлен.": "Avatar added.",
			"Изменения отменены.": "Changes discarded.",
			"{p1} (копия)": "{p1} (copy)",
			"Копия создана.": "Copy created.",
			"Удалить персону «{p1}»?": "Delete persona “{p1}”?",
			"Персона удалена.": "Persona deleted.",
			"{p1} в библиотеке": "{p1} in the library",
			"+ Создать персону": "+ Create persona",
			"Библиотека персон": "Persona library",
			"Библиотека · ": "Library · ",
			"Поиск персон": "Search personas",
			"Сортировка персон": "Sort personas",
			"По длине описания": "Description length",
			"По привязкам": "Character bindings",
			"Без описания": "No description",
			"По умолчанию": "Default",
			"В чате": "In chat",
			"Черновик": "Draft",
			"Загружаем персоны…": "Loading personas…",
			"Здесь будут ваши персоны. Создайте первую справа.": "Your personas will appear here. Create your first one on the right.",
			"Сбросить поиск": "Clear search",
			"Обновить список": "Refresh list",
			"Список обновлён.": "List refreshed.",
			"Персона сохранена.": "Persona saved.",
			"Персона": "Persona",
			"Новая персона": "New persona",
			"Не сохранено": "Unsaved",
			"Сохранено": "Saved",
			"Отменить изменения": "Discard changes",
			"Создать копию": "Create copy",
			"Удалить персону": "Delete persona",
			"Действия ": "Actions ",
			"Аватар": "Avatar",
			"Имя в чате": "Chat name",
			"Имя персоны": "Persona name",
			"Подпись": "Subtitle",
			"Например, маг из северных земель": "For example, a mage from the north",
			"Редактор персоны": "Persona editor",
			"Внешность, характер, биография — всё, что собеседник должен знать о вашей персоне.": "Appearance, personality, biography — everything your partner should know about your persona.",
			"Отдельный вариант для модели": "Separate version for the model",
			"Другой вариант описания": "Alternative description",
			"Вариант для модели": "Model version",
			"Сделать базовым описанием": "Use as base description",
			"Выбор персоны": "Persona selection",
			"Выбор для новых чатов сохранён.": "Selection for new chats saved.",
			"Снять выбор по умолчанию": "Clear default",
			"Использовать по умолчанию": "Use as default",
			"Сначала сохраните персону.": "Save the persona first.",
			"Привязки к персонажам": "Character bindings",
			"Привязок пока нет.": "No bindings yet.",
			"Текущий персонаж": "Current character",
			"Сборка описания": "Description assembly",
			"Разделитель блоков": "Block separator",
			"Использовать шаблон": "Use template",
			"Шаблон с ": "Template with ",
			"Убрать аватар": "Remove avatar",
			"Итоговое описание": "Compiled description",
			"{p1} символов": "{p1} characters",
			"Для текущего чата": "For current chat",
			"Без условий чата": "Without chat conditions",
			"{p1} · блоков включено: {p2}": "{p1} · enabled blocks: {p2}",
			"Описание пока пустое.": "The description is empty.",
			"В текущем чате: {p1}": "In current chat: {p1}",
			"Играть в этом чате": "Play in this chat",
			"Персона закреплена за текущим чатом.": "Persona assigned to the current chat.",
			"Сохранить персону": "Save persona",
			"Некорректный аватар.": "Invalid avatar.",
			"Укажите имя персоны длиной до 120 символов.": "Enter a persona name of up to 120 characters.",
			"Некорректные поля персоны.": "Invalid persona fields.",
			"Описание или подпись персоны слишком длинные.": "The persona description or subtitle is too long.",
			"Каталог персон повреждён. Восстановите его из резервной копии.": "The persona catalog is damaged. Restore it from a backup.",
			"Персона больше не найдена. Обновите список.": "Persona no longer found. Refresh the list.",
			"К этому персонажу уже привязана другая персона.": "Another persona is already bound to this character.",
			"Персона больше не найдена.": "Persona no longer found.",
			"К персонажу привязано несколько персон. Оставьте одну привязку.": "Several personas are bound to this character. Keep one binding.",
			"Персона больше не найдена. Выберите другую.": "Persona no longer found. Choose another.",
			"Некорректный текст персоны.": "Invalid persona text.",
			"Некорректный переключатель персоны.": "Invalid persona toggle.",
			"Некорректная привязка персоны.": "Invalid persona binding.",
			"Некорректный блок персоны.": "Invalid persona block.",
			"В персоне может быть до 256 блоков.": "A persona can contain up to 256 blocks.",
			"Некорректная активация блока.": "Invalid block activation.",
			"Некорректная группа персоны.": "Invalid persona group.",
			"Некорректные блоки персоны.": "Invalid persona blocks.",
			"Некорректный шаблон персоны.": "Invalid persona template.",
			"Добавьте {{PROMPT}} в шаблон.": "Add {{PROMPT}} to the template.",
			"Итоговое описание персоны слишком длинное.": "The compiled persona description is too long.",
			"Кости и проверки": "Dice and checks",
			"Даёт ведущему реальные случайные броски для исходов, где есть риск: попадание в цель, проверка навыка, урон. В чате видны выпавшие грани и итог расчёта.": "Gives the narrator real random rolls for uncertain outcomes: attacks, skill checks and damage. Rolled faces and totals appear in chat.",
			"Свободные броски": "Free rolls",
			"Броски по формулам вроде 2d6+3, с поддержкой пулов, перебросов и взрывающихся костей.": "Roll formulas such as 2d6+3, with dice pools, rerolls and exploding dice.",
			"Проверки по правилам": "Rule-based checks",
			"Определяет успех или провал, критический исход, урон и последствия по настроенному профилю правил.": "Resolves success, failure, critical outcomes, damage and consequences using the configured rules profile.",
			"Разбор прошлых бросков": "Past roll details",
			"Ведущий может объяснить, какие грани, перебросы и модификаторы дали итог сохранённого броска.": "The narrator can explain which faces, rerolls and modifiers produced a recorded roll’s total.",
			"Сжатие истории": "History compaction",
			"Освобождает место в контексте модели, чтобы продолжать длинный чат. Старые сцены заменяются кратким изложением, последние реплики остаются целиком. Мелкие детали старых сцен могут не попасть в изложение.": "Frees model context space to continue a long chat. Older scenes are summarized; recent messages stay intact. Some older details may be omitted.",
			"Сжимать историю": "Compact history",
			"Настройки сохранены.": "Settings saved.",
			"Не удалось сохранить настройки. Попробуйте ещё раз.": "Could not save settings. Try again.",
			"Плагины": "Plugins",
			"Поиск по плагинам ": "Search plugins ",
			"Название или описание": "Name or description",
			"Загрузка настроек…": "Loading settings…",
			"Обновить настройки": "Refresh settings",
			"Плагины не найдены. Попробуйте другое название или описание.": "No plugins found. Try another name or description.",
			"Настройки сохранены. Они применятся после завершения текущего ответа.": "Settings saved. They will apply after the current response finishes.",
			"Сменить пресет": "Change preset",
			"Выбрать инструкции для этого чата": "Choose instructions for this chat",
			"Поиск пресета…": "Search presets…",
			"Пресетов пока нет.": "No presets yet.",
			"Пресеты не найдены.": "No presets found.",
			"Не удалось загрузить пресеты чата.": "Could not load chat presets.",
			"Без пресета": "No preset",
			"В пресете может быть не больше {p1} блоков и групп.": "A preset can contain up to {p1} blocks and groups.",
			"Используйте не больше {p1} уровней вложенности.": "Use up to {p1} nesting levels.",
			"Элемент удалён. Можно отменить действие.": "Item deleted. You can undo this action.",
			"{p1} — копия": "{p1} — copy",
			"«{p1}» перемещён. Можно отменить действие.": "“{p1}” moved. You can undo this action.",
			"Действие отменено.": "Action undone.",
			"Размер файла пресета не должен превышать 1 МБ.": "The preset file must not exceed 1 MB.",
			"Не удалось выполнить действие. Попробуйте ещё раз.": "Could not complete the action. Try again.",
			"Перейти к другому пресету? Несохранённые изменения будут потеряны.": "Switch presets? Unsaved changes will be lost.",
			"Пресет импортирован.": "Preset imported.",
			"Инструкции применены к текущему чату.": "Instructions applied to the current chat.",
			"Удалить пресет «{p1}»? В созданных чатах его инструкции сохранятся.": "Delete preset “{p1}”? Its instructions will remain in existing chats.",
			"Пресет удалён из библиотеки.": "Preset deleted from the library.",
			"Файл пресета": "Preset file",
			"Импорт": "Import",
			"Создать пресет": "Create preset",
			"Выбор пресетов для чатов": "Chat preset selection",
			"Для новых чатов": "For new chats",
			"Текущий чат": "Current chat",
			"Нет открытого чата": "No open chat",
			"Загружаем…": "Loading…",
			"{p1} · копия из чата": "{p1} · chat snapshot",
			"Обновить инструкции": "Update instructions",
			"Инструкции в чате обновлены.": "Chat instructions updated.",
			"В чате действует прежняя версия.": "The chat uses an earlier version.",
			"Применяется со следующего хода.": "Applies from the next turn.",
			" · Новый пресет": " · New preset",
			"Библиотека пресетов · {p1}{p2}": "Preset library · {p1}{p2}",
			"Библиотека пресетов": "Preset library",
			"Поиск пресетов": "Search presets",
			"Найти пресет…": "Find a preset…",
			"Новые чаты": "New chats",
			"Загружаем пресеты…": "Loading presets…",
			"Нет пресетов.": "No presets.",
			"По запросу «{p1}» ничего не найдено.": "No results for “{p1}”.",
			"Пресет сохранён.": "Preset saved.",
			"Новый пресет": "New preset",
			"Есть несохранённые изменения": "Unsaved changes",
			"Сохранён в библиотеке": "Saved in library",
			"Действия с пресетом": "Preset actions",
			"Дублировать пресет": "Duplicate preset",
			"Экспорт": "Export",
			"Пресет экспортирован.": "Preset exported.",
			"Удалить пресет": "Delete preset",
			"Название": "Title",
			"Например, камерное фэнтези": "For example, intimate fantasy",
			"Подождите…": "Please wait…",
			"Сохранить и применить": "Save and apply",
			"Применить к чату": "Apply to chat",
			"Сохранить пресет": "Save preset",
			"Дождитесь сохранения текущего пресета.": "Wait for the current preset to finish saving.",
			"В конец основного списка": "At the end of the main list",
			"Внутрь группы, в конец": "Inside the group, at the end",
			"Перед элементом": "Before item",
			"После элемента": "After item",
			"основной список": "main list",
			"Перенести в {p1}.": "Move to {p1}.",
			"Вставить перед": "Insert before",
			"Вставить после": "Insert after",
			"Выберите место вставки. Группу нельзя вложить в себя или её содержимое.": "Choose an insertion point. A group cannot be moved into itself or its contents.",
			"Перенос отменён.": "Move cancelled.",
			"Переместить {p1}": "Move {p1}",
			"Раскрыть": "Expand",
			"Свернуть": "Collapse",
			"Включить {p1}": "Enable {p1}",
			"Без названия": "Untitled",
			"Уровень {p1}": "Level {p1}",
			"Выключено в «{p1}»": "Disabled in “{p1}”",
			"Пустая группа": "Empty group",
			"Инструкции": "Instructions",
			"В итог входят {p1} из {p2} блоков · {p3} символов в итоге": "{p1} of {p2} blocks included · {p3} characters in total",
			"Вернуться к редактору": "Back to editor",
			"Посмотреть итог": "Preview result",
			"Структура пресета": "Preset structure",
			"Структура": "Structure",
			"+ Блок": "+ Block",
			"+ Группа": "+ Group",
			"Нет блоков.": "No blocks.",
			"Конец основного списка": "End of main list",
			"Редактирование выбранного элемента": "Edit selected item",
			"Название группы": "Group title",
			"Название блока": "Block title",
			"Включить группу": "Enable group",
			"Включить блок": "Enable block",
			"Выключена группа «{p1}».": "Group “{p1}” is disabled.",
			"Текст инструкции": "Instruction text",
			"Содержимое группы": "Group contents",
			" · группа": " · group",
			"Пустая группа.": "Empty group.",
			"Дублировать": "Duplicate",
			"Элемент не выбран.": "No item selected.",
			"Итоговые инструкции": "Compiled instructions",
			"Инструкции для модели": "Model instructions",
			"Нет включённых инструкций.": "No enabled instructions.",
			"Из каких блоков собран текст": "Blocks used to compile the text",
			"{p1} / 64 000 символов во всех блоках": "{p1} / 64,000 characters across all blocks",
			"Отменить действие": "Undo",
			"Переместить элемент": "Move item",
			"Место назначения": "Destination",
			"Основной список": "Main list",
			"Положение": "Position",
			"Переместить": "Move",
			"Выберите группу для вложения или положение перед / после элемента.": "Choose a group to move into, or a position before or after an item.",
			"Не удалось открыть чат.": "Could not open the chat.",
			"Выберите основной чат для игры.": "Choose a main chat to play.",
			"Каталог пресетов повреждён. Восстановите его из резервной копии.": "The preset catalog is damaged. Restore it from a backup.",
			"Пресет больше не найден. Обновите список.": "Preset no longer found. Refresh the list.",
			"Пресет больше не найден.": "Preset no longer found.",
			"Пресет больше не найден. Выберите другой.": "Preset no longer found. Choose another.",
			"Укажите название пресета длиной до 120 символов.": "Enter a preset title of up to 120 characters.",
			"Сократите итоговые инструкции до 64 000 символов.": "Reduce the compiled instructions to 64,000 characters.",
			"Укажите инструкции длиной до 64 000 символов.": "Enter instructions of up to 64,000 characters.",
			"Снимок пресета в журнале повреждён.": "The preset snapshot in the log is damaged.",
			"Версия снимка пресета не поддерживается.": "The preset snapshot version is unsupported.",
			"Порядок блоков SillyTavern должен быть списком.": "The SillyTavern block order must be a list.",
			"Порядок блоков SillyTavern повреждён.": "The SillyTavern block order is damaged.",
			"В файле несколько порядков для персонажей. Экспортируйте один порядок через Prompt Manager SillyTavern.": "The file has several character orders. Export a single order through SillyTavern Prompt Manager.",
			"В пресете SillyTavern может быть не больше {p1} блоков.": "A SillyTavern preset can contain up to {p1} blocks.",
			"У блоков SillyTavern должны быть уникальные идентификаторы.": "SillyTavern blocks must have unique IDs.",
			"Маркер блока SillyTavern повреждён.": "The SillyTavern block marker is damaged.",
			"Роль блока SillyTavern повреждена.": "The SillyTavern block role is damaged.",
			"Переключатель блока SillyTavern повреждён.": "The SillyTavern block toggle is damaged.",
			"Текст блока SillyTavern должен быть строкой.": "SillyTavern block text must be a string.",
			"Позиция вставки SillyTavern не поддерживается.": "The SillyTavern insertion position is unsupported.",
			"Условия вставки SillyTavern повреждены.": "The SillyTavern insertion conditions are damaged.",
			"роль {p1}": "role {p1}",
			"вставка в историю: {p1}": "history insertion: {p1}",
			"после истории": "after history",
			"условная вставка": "conditional insertion",
			"Порядок или переключатели SillyTavern повреждены.": "The SillyTavern order or toggles are damaged.",
			"В файле SillyTavern нет текстовых блоков для импорта.": "The SillyTavern file has no text blocks to import.",
			"Перенесены текстовые блоки; настройки генерации и служебные вставки ST не применены.": "Text blocks imported; ST generation settings and internal insertions were not applied.",
			"Макросы ST сохранены как текст.": "ST macros were preserved as text.",
			"Блоки с несовместимыми ролями или вставками оставлены выключенными: {p1}.": "Blocks with incompatible roles or insertions were left disabled: {p1}.",
			"В файле отсутствуют блоки из порядка: {p1}.": "Blocks from the order are missing from the file: {p1}.",
			"Выберите JSON-файл пресета.": "Choose a JSON preset file.",
			"Не удалось прочитать JSON. Проверьте файл пресета.": "Could not read JSON. Check the preset file.",
			"Формат или версия файла пресета не поддерживается.": "The preset file format or version is unsupported.",
			"Версия экспорта Prompt Manager SillyTavern не поддерживается.": "The SillyTavern Prompt Manager export version is unsupported.",
			"Основные инструкции": "Main instructions",
			"Содержимое группы должно быть списком блоков или групп.": "Group contents must be a list of blocks or groups.",
			"У каждого блока и группы должен быть уникальный идентификатор.": "Each block and group must have a unique ID.",
			"Укажите название каждого блока и группы длиной до 120 символов.": "Enter a title of up to 120 characters for each block and group.",
			"Укажите, включён ли блок или группа.": "Specify whether the block or group is enabled.",
			"Текст блока должен быть строкой.": "Block text must be a string.",
			"Сократите суммарный текст блоков до 64 000 символов, включая выключенные блоки.": "Reduce the total block text to 64,000 characters, including disabled blocks.",
			"Выберите другое место: группу нельзя вложить в себя или её содержимое.": "Choose another destination: a group cannot be moved into itself or its contents.",
			"Успех": "Success",
			"Провал": "Failure",
			"Критический успех": "Critical success",
			"Критический провал": "Critical failure",
			"Выбранная грань попала в диапазон критического успеха.": "The selected face is in the critical success range.",
			"Выбранная грань попала в диапазон критического провала.": "The selected face is in the critical failure range.",
			"Выбранная грань означает автоматический провал.": "The selected face means automatic failure.",
			"Итог достиг сложности.": "The total met the target.",
			"Итог ниже сложности.": "The total is below the target.",
			"Готовится проверка": "Preparing check",
			"Проверка прервана": "Check interrupted",
			"Игровая проверка": "Rules check",
			" · модификатор: ": " · modifier: ",
			" · итог: ": " · total: ",
			" · сложность: ": " · target: ",
			"Урон: ": "Damage: ",
			"Последствие: ": "Consequence: ",
			"Часть проверки не вычислена. Выпавшие грани сохранены; повторного броска не было.": "Part of the check could not be calculated. Rolled faces were preserved; no reroll was made.",
			"Правила: ": "Rules: ",
			", версия ": ", version ",
			". Разница со сложностью: ": ". Margin against target: ",
			"не вычислена": "not calculated",
			"Показать полный результат и грани": "Show full result and faces",
			"Инструмент не вернул результат.": "The tool returned no result.",
			"Основные": "General",
			"Настройки Mayori": "Mayori settings",
			"Разделы настроек Mayori": "Mayori settings sections",
			"Закрыть настройки Mayori": "Close Mayori settings",
			"Язык": "Language",
			"Не удалось сохранить язык. Попробуйте ещё раз.": "Could not save the language. Try again.",
			"Показывать": "Show",
			"Контекст запроса": "Request context",
			"Полный журнал": "Full log",
			"Запрос": "Request",
			"Последний запрос": "Latest request",
			"Текущий сохранённый контекст": "Current saved context",
			" · Неудачная попытка": " · Failed attempt",
			"№{p1} · Ход {p2}, шаг {p3}{p4}": "#{p1} · Turn {p2}, step {p3}{p4}",
			"Загрузка контекста…": "Loading context…",
			"Сохранённые сообщения для следующего запроса. Системный контекст обновится при отправке.": "Saved messages for the next request. System context will update when you send a message.",
			"Вход модели на момент этого запроса. Заменённые сообщения и ответ на запрос исключены.": "Model input at the time of this request. Replaced messages and the response to this request are excluded.",
			"В чате пока нет сохранённых сообщений.": "No saved messages in this chat yet.",
			"Запрос не найден в журнале чата.": "Request not found in the chat log.",
			"Некорректный запрос в журнале.": "Invalid request in the log.",
			"Запрос импорта превышает лимит 64 МБ.": "The import request exceeds the 64 MB limit.",
			"Некорректный запрос.": "Invalid request.",
			"Ожидался идентификатор карточки.": "Expected a card ID.",
			"Ожидались персонаж и кампания.": "Expected a character and campaign.",
			"Ожидались персонаж и сессия.": "Expected a character and session.",
			"Неизвестная операция библиотеки.": "Unknown library operation.",
			"Сервис занят. Повторите запрос.": "The service is busy. Try again.",
			"Сервис закрыт.": "The service is closed."
		};
		//#endregion
		//#region src/features/localization/shared/messages.js
		const ru = Object.freeze(Object.fromEntries(Object.keys(en).map((key) => [key, key])));
		/** Interpolate only product placeholders, leaving authored macros intact. */
		function formatMessage(template, params = {}) {
			return template.replace(/\{(p\d+)\}/g, (match, key) => Object.hasOwn(params, key) ? String(params[key]) : match);
		}
		const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const patterns = Object.entries(en).flatMap(([key, english]) => [key, english].filter((text) => /\{p\d+\}/.test(text)).map((text) => {
			const names = [...text.matchAll(/\{(p\d+)\}/g)].map((match) => match[1]);
			const parts = text.split(/\{p\d+\}/).map(escape);
			return {
				key,
				names,
				pattern: new RegExp(`^${parts.join("([\\s\\S]*?)")}$`)
			};
		}));
		const englishKeys = new Map(Object.entries(en).map(([key, value]) => [value, key]));
		/** For product errors/notices only. Never pass story text, names or instructions. */
		function translateNotice(text, translate) {
			if (typeof text !== "string" || !text) return text;
			if (Object.hasOwn(en, text)) return translate(text);
			const englishKey = englishKeys.get(text);
			if (englishKey) return translate(englishKey);
			for (const { key, names, pattern } of patterns) {
				const match = pattern.exec(text);
				if (match) {
					const params = Object.fromEntries(names.map((name, index) => [name, match[index + 1]]));
					if (key === "{p1}: укажите целое число от {p2} до {p3}." && Object.hasOwn(en, params.p1)) params.p1 = translate(params.p1);
					return translate(key, params);
				}
			}
			const sentences = text.split(/(?<=[.!?])(?=\s)/);
			return sentences.length > 1 ? sentences.map((part) => {
				const whitespace = part.match(/^\s*/)[0];
				return whitespace + translateNotice(part.slice(whitespace.length), translate);
			}).join("") : text;
		}
		//#endregion
		//#region src/features/localization/client/service.js
		/** Browser presentation seam; the DSH locale service owns durable preference. */
		var LocalizationService = class {
			translate() {
				throw new Error("LocalizationService.translate() is not implemented");
			}
			getSnapshot() {
				throw new Error("LocalizationService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("LocalizationService.subscribe() is not implemented");
			}
			setLanguage() {
				throw new Error("LocalizationService.setLanguage() is not implemented");
			}
		};
		let active;
		function bindLocalization(provider) {
			const previous = active;
			active = provider;
			return () => {
				if (active === provider) active = previous;
			};
		}
		const tr = (key, params) => active ? active.translate(key, params) : formatMessage(key, params);
		const noticeText = (text) => translateNotice(text, tr);
		const currentLanguage = () => active?.getSnapshot().active ?? "ru";
		const formatLocale = () => currentLanguage().toLowerCase().startsWith("ru") ? "ru-RU" : "en-US";
		//#endregion
		//#region src/features/localization/shared/native-ru.js
		/** Russian language pack for the native controls embedded in Mayori. */
		const nativeRu = {
			trajectory: {
				"view.trajectory": "Контекст",
				"toolbar.aria": "Панель журнала",
				"toolbar.duration": "Длительность",
				"toolbar.useActualDuration": "Использовать фактическую длительность",
				"toolbar.useEqualWidth": "Одинаковая ширина действий",
				"toolbar.actualTime": "Фактическое время",
				"toolbar.turns": "Ходы",
				"toolbar.expandTurns": "Раскрыть ходы",
				"toolbar.collapseTurns": "Свернуть ходы",
				"toolbar.calls": "Вызовы",
				"toolbar.expandCalls": "Раскрыть вызовы",
				"toolbar.collapseCalls": "Свернуть вызовы",
				"toolbar.search": "Поиск в журнале",
				"toolbar.searchPlaceholder": "Поиск",
				"kind.system": "СИСТЕМА",
				"kind.user": "ПОЛЬЗОВАТЕЛЬ",
				"kind.context": "КОНТЕКСТ",
				"kind.compacted": "СЖАТО",
				"kind.message": "Сообщение",
				"kind.assistant": "АССИСТЕНТ",
				"kind.tool": "ИНСТРУМЕНТ",
				"kind.subtool": "ПОДИНСТРУМЕНТ",
				"kind.sub": "Подэлемент",
				"column.input": "Вход",
				"column.output": "Выход",
				"column.think": "Размышления",
				"column.time": "Время",
				"column.model": "Модель",
				"column.tools": "Инструменты",
				"turn.label": "Ход {turn}",
				"section.betweenTurns": "Между ходами",
				"group.message": "Сообщение",
				"group.step": "Шаг {step}",
				"group.compaction": "Сжатие {seq}",
				"status.failed": "Ошибка",
				"status.pending": "Ожидание",
				"status.completed": "Завершено",
				"timing.notAvailable": "Недоступно",
				"timing.notRecorded": "Не записано",
				"timing.stepStartUnavailable": "Начало шага недоступно",
				"timing.firstTokenUnavailable": "Время первого токена недоступно",
				"timing.usageUnavailable": "Использование недоступно",
				"timing.outputTokensUnavailable": "Число выходных токенов недоступно",
				"timing.durationTooShort": "Слишком короткий интервал",
				"timing.showLocalTime": "Показать местное время",
				"timing.showUnixTimestamp": "Показать время Unix",
				"timing.started": "Начало",
				"timing.totalDuration": "Общее время",
				"timing.ttft": "До первого токена",
				"timing.generation": "Генерация",
				"timing.throughput": "Скорость",
				"timing.duration": "Длительность",
				"timing.source": "Источник времени",
				"timing.sessionTimestamps": "Время в журнале чата",
				"timing.sessionTimestampsRunning": "Время в журнале чата (в работе)",
				"timing.request": "Время запроса",
				"unit.milliseconds": "{value} мс",
				"unit.seconds": "{value} с",
				"unit.tokens": "{value} ток",
				"unit.tokensPerSecond": "{value} ток/с",
				"usage.tokens": "Токены",
				"usage.reasoning": "Размышления",
				"usage.content": "Содержимое",
				"usage.notReported": "Использование не сообщено",
				"usage.input": "Вход",
				"usage.cached": "Из кэша",
				"usage.cacheCreated": "Запись в кэш",
				"usage.other": "Другое",
				"usage.output": "Выход",
				"usage.thisRequest": "Этот запрос",
				"usage.sessionCumulative": "Всего в чате",
				"options.notRecorded": "Параметры не записаны",
				"options.json": "JSON параметров запроса",
				"source.unknown": "Неизвестно",
				"source.user": "Пользователь",
				"source.plugin": "Плагин",
				"source.pluginNamed": "Плагин · {plugin}",
				"source.goal": "Цель",
				"source.goalRound": "Цель · раунд {round}",
				"source.notRecorded": "Источник не записан",
				"source.messageJson": "JSON источника сообщения",
				"tab.summary": "Обзор",
				"tab.rawOutput": "Исходный выход",
				"tab.preview": "Предпросмотр",
				"tab.raw": "Исходное",
				"tab.source": "Источник",
				"tab.payload": "Аргументы",
				"tab.result": "Результат",
				"tab.schema": "Схема",
				"tab.timing": "Время",
				"tab.diff": "Изменения",
				"tab.systemPrompt": "Системные инструкции",
				"tab.tools": "Инструменты",
				"tab.options": "Параметры",
				"tab.usage": "Использование",
				"record.toolCallOnly": "(только вызов инструмента)",
				"record.noContent": "Нет содержимого",
				"record.noPayload": "Аргументы не записаны",
				"record.noResult": "Результат не записан",
				"record.noOutput": "Нет выхода",
				"record.schemaUnavailable": "Схема недоступна",
				"record.parameters": "Параметры",
				"record.resultJson": "JSON результата",
				"record.json": "JSON",
				"record.parametersJson": "JSON параметров",
				"record.namedParametersJson": "{name}: JSON параметров",
				"record.payloadJson": "JSON аргументов",
				"record.outputJson": "JSON результата",
				"record.thinking": "Размышления",
				"record.wrapLines": "Переносить строки",
				"code.source": "Код",
				"code.output": "Выход",
				"code.copySource": "Копировать код",
				"code.copyOutput": "Копировать выход",
				"code.originalJson": "Исходный JSON",
				"code.running": "Выполняем…",
				"record.systemPromptMissing": "В этом запросе нет системных инструкций",
				"record.toolsMissing": "В этом запросе нет инструментов",
				"record.systemPrompt": "Системные инструкции",
				"record.tools": "Инструменты",
				"block.openSummary": "Открыть обзор вызовов инструментов блока №{index}",
				"block.openSummaryTitle": "Открыть обзор вызовов",
				"block.label": "Блок №{index} {type}",
				"history.loadingTrajectory": "Загрузка журнала…",
				"history.loadingEarlier": "Загрузка ранней истории…",
				"history.loadingEarlierAria": "Загрузка ранней истории…",
				"history.loadEarlier": "Загрузить раннюю историю",
				"history.clickToLoadEarlier": "Нажмите для загрузки ранней истории",
				"request.label": "Запрос №{request}",
				"request.labelCompaction": "Запрос №{request} · Сжатие",
				"request.compaction": "Сжатие · {section}",
				"request.compactionPurpose": "Сжатие",
				"request.retryProgress": "{retry} из {maximum}",
				"request.collapsedSummary": "Свёрнутый обзор: {kind}, {summary}",
				"request.collapsedTurn": "ход",
				"request.collapsedAssistant": "ассистент",
				"request.rowAria": "{request}{kind}, {content}",
				"request.rowPrefix": "Запрос {request}, ",
				"request.rowAriaCompaction": "Запрос {request}, сжатие",
				"request.noContent": "нет содержимого",
				"summary.toolCalls.one": "Вызовов инструментов: {count}",
				"summary.toolCalls.other": "Вызовов инструментов: {count}",
				"summary.steps.one": "Шагов: {count}",
				"summary.steps.other": "Шагов: {count}",
				"details.event": "Сведения о событии",
				"details.resize": "Изменить ширину сведений",
				"details.resizeTitle": "Перетащите для изменения ширины; двойной щелчок сбрасывает её.",
				"details.close": "Закрыть сведения",
				"details.status": "Статус",
				"details.purpose": "Назначение",
				"details.provider": "Провайдер",
				"details.model": "Модель",
				"details.toolCalls": "Вызовы инструментов",
				"details.subtoolCalls": "Вложенные вызовы инструментов",
				"details.error": "Ошибка",
				"details.lastAttemptError": "Ошибка последней попытки",
				"details.failure.auth": "Некорректный ключ API",
				"details.retry": "Повтор",
				"details.retryDelay": "Задержка повтора",
				"details.result": "Результат",
				"details.compacted": "Сжато",
				"details.assistantMessage": "Сообщение ассистента",
				"details.source": "Источник",
				"details.hierarchy": "Иерархия",
				"details.toolCall": "Вызов инструмента",
				"timeline.aria": "Временная шкала журнала",
				"timeline.overviewAria": "Обзор времени; перетащите по горизонтали для выбора событий",
				"timeline.noTimingData": "Нет данных о времени",
				"timeline.total": "Всего {duration}",
				"timeline.started": "Начало {time}",
				"timeline.ttftDecoding": "Первый токен: {ttft} · генерация: {decoding}",
				"layout.compacting": "Сжимаем контекст…",
				"layout.compactionFailed": "Не удалось сжать контекст",
				"layout.compacted": "Контекст сжат",
				"layout.toolCallOnly": "Только вызов инструмента",
				"attachment.list": "Вложения",
				"attachment.imageName": "Изображение {index}",
				"layout.imageCount": "Изображений: {count}",
				"layout.fileAttachments": "Файлов: {count}",
				"layout.initialSystemPrompt": "Начальные системные инструкции",
				"layout.systemPromptUpdated": "Системные инструкции обновлены",
				"layout.toolsUpdated": "Инструменты обновлены",
				"layout.toolAdded": "Добавлен инструмент: {name}",
				"layout.toolRemoved": "Удалён инструмент: {name}",
				"layout.toolUpdateNotice": "Инструменты обновлены",
				"layout.toolsAdded": "Добавлены: {names}",
				"layout.toolsAddedCount": "Добавлено: {count}",
				"layout.toolsChanged": "Добавлено: {added}, удалено: {removed}",
				"layout.toolsRemoved": "Удалены: {names}",
				"layout.toolsRemovedCount": "Удалено: {count}",
				"layout.systemPromptAndToolsUpdated": "Системные инструкции и инструменты обновлены",
				"layout.compactionInterrupted": "Сжатие прервано до завершения."
			},
			"settings.models": {
				nav: "Модели",
				deepSeekAccount: "Аккаунт DeepSeek",
				title: "Модели",
				intro: "Добавьте ключи API для использования моделей этих провайдеров.",
				edit: "Изменить",
				editProvider: "Изменить {provider}",
				remove: "Удалить",
				removeProvider: "Удалить {provider}",
				deleteTitle: "Удалить {provider}?",
				deleteDescription: "Настройки {provider} будут удалены. Его ключ останется в отдельном хранилище.",
				deleteDescriptionWithCredential: "Настройки {provider} и сохранённый ключ API будут удалены.",
				deleteConfirm: "Удалить {provider}",
				deleting: "Удаляем {provider}…",
				add: "Добавить провайдера моделей",
				addMode: "Способ добавления",
				addCatalog: "Провайдер из каталога",
				addCustom: "Свой API моделей",
				addCatalogHint: "Выберите OpenAI, Anthropic, Kimi или другого провайдера из каталога и добавьте ключ API.",
				addCustomHint: "Подключите шлюз или свой сервер с API OpenAI или Anthropic: укажите адрес, протокол и модели.",
				addCatalogExhausted: "Все провайдеры каталога уже настроены.",
				addCustomUnavailable: "Нет доступных протоколов API.",
				provider: "Провайдер",
				close: "Закрыть",
				cancel: "Отмена",
				apply: "Применить",
				applying: "Применяем…",
				savedProvider: "Настройки {provider} сохранены.",
				credentialConfigured: "Ключ API настроен",
				credentialMissing: "Нет ключа API",
				readOnly: "В этом развёртывании настройки доступны только для чтения.",
				loadFailed: "Не удалось загрузить каталог провайдеров",
				conflict: "Настройки изменены другим пользователем. Закройте редактор и откройте его снова.",
				retry: "Повторить",
				keyInput: "Ключ API",
				keyPlaceholder: "Введите ключ API",
				keyPlaceholderNative: "Введите ключ API или оставьте пустым для авторизации через окружение",
				keyStored: "Настроен — введите новый ключ для замены",
				keyEnvLocked: "Задан в окружении запуска (только чтение)",
				customized: "Свои настройки",
				baseUrl: "Адрес API",
				baseUrlDefault: "По умолчанию у провайдера",
				deepSeekBaseUrl: "https://api.deepseek.com/anthropic",
				deepSeekEndpointHint: "Используйте API с поддержкой Anthropic Messages.",
				models: "Модели",
				modelsInherited: "Модели по умолчанию",
				modelsCustomized: "Свой каталог моделей",
				resetModels: "Вернуть по умолчанию",
				model: "Модель",
				modelId: "ID модели",
				modelName: "Название",
				modelNamePlaceholder: "Если пусто, используется ID модели",
				contextWindow: "Окно контекста",
				contextWindowPlaceholder: "По умолчанию у провайдера",
				maxTokens: "Лимит токенов ответа",
				maxTokensPlaceholder: "По умолчанию у провайдера",
				modelAdvanced: "Параметры модели",
				modelInputTypes: "Типы входа",
				modelInputText: "Текст",
				modelInputImage: "Изображение",
				addModel: "Добавить модель",
				removeModel: "Удалить модель",
				modelsEmpty: "Список моделей пуст. Другой ID модели можно указать напрямую.",
				keyBlank: "Введите ключ API или оставьте пустым, чтобы сохранить прежний.",
				keyBlankNew: "Введите ключ API или оставьте пустым, если провайдер использует другую авторизацию.",
				keyIllegalCharacters: "Некорректный формат ключа API. Проверьте его.",
				modelIdRequired: "Укажите ID модели.",
				modelIdDuplicate: "ID модели должен быть уникальным.",
				modelNameInvalid: "Название не может быть пустым.",
				modelContextInvalid: "Укажите положительный размер контекста, например 131072, 256K или 1M.",
				modelMaxTokensInvalid: "Укажите положительный лимит ответа, например 8192, 64K или 1M.",
				advancedHint: "Другие поля настраиваются в cordis.patch.yml.",
				modelCapacityInvalid: "Укажите число, при необходимости с K или M.",
				modelDuplicate: "Каждый ID модели должен встречаться один раз.",
				fetchModels: "Загрузить доступные модели",
				fetching: "Запрашиваем провайдера…",
				fetchNeedsBaseUrl: "Сначала укажите адрес API.",
				fetchEmpty: "Провайдер не вернул модели. Добавьте их вручную.",
				fetchTitle: "Выберите модели",
				fetchDescription: "Выберите модели провайдера для добавления.",
				fetchSearch: "Поиск моделей",
				fetchNoMatches: "Модели не найдены.",
				fetchSelectAll: "Выбрать все",
				fetchDeselectAll: "Снять выбор",
				fetchAdopt: "Добавить выбранные",
				customTag: "Свой",
				customRoute: "ID провайдера",
				customRouteHint: "Уникальный ID для запросов и ключа доступа: строчные буквы, начиная с буквы.",
				customRouteInvalid: "Начните со строчной буквы; затем используйте строчные буквы, цифры и дефисы.",
				customRouteTaken: "Этот ID уже используется.",
				customDisplayName: "Название",
				customApi: "Протокол API",
				customApiUnset: "Не выбран",
				protocolOpenAiCompletions: "OpenAI Chat Completions",
				protocolOpenAiResponses: "OpenAI Responses",
				protocolAnthropicMessages: "Anthropic Messages",
				customNeedsBaseUrl: "Укажите адрес своего API моделей.",
				customBaseUrlInvalid: "Укажите корректный адрес HTTP или HTTPS.",
				customNeedsModels: "Добавьте хотя бы одну модель.",
				customBaseUrlPlaceholder: "https://gateway.example/v1",
				customAnthropicBaseUrlPlaceholder: "https://gateway.example",
				settingsPathUnresolvable: "Не удалось найти путь настроек",
				create: "Создать провайдера",
				creating: "Создаём…",
				welcomeTitle: "Предварительная версия",
				welcomeBody: "DeepSeek Harness 0.2 пока находится в предварительной версии. Продукт и API плагинов продолжают развиваться; мы будем рады отзывам пользователей и разработчиков. Новое приложение для компьютера рассчитано на широкий круг пользователей, а дополнительные функции разработки можно включить в настройках.\n\nМы создаём открытую инфраструктуру с возможностью повторного использования и объединения компонентов. Приглашаем вас воплощать свои идеи с DeepSeek Harness и развивать экосистему плагинов вместе с сообществом.",
				welcomeContinue: "Продолжить",
				welcomeError: "Не удалось сохранить подтверждение. Попробуйте ещё раз.",
				onboardingTitle: "Добавьте ключ API",
				onboardingDescription: "Настройте провайдера DeepSeek, чтобы начать.",
				onboardingLater: "Настроить позже",
				onboardingSave: "Сохранить и продолжить",
				onboardingSaving: "Сохраняем…",
				keyRequired: "Введите ключ API."
			},
			pluginManager: {
				panel: "Плагины",
				title: "Плагины"
			},
			"schedule.manager": {
				panel: "Задачи по расписанию",
				title: "Задачи по расписанию"
			},
			model: {
				"provider.account": "Аккаунт DeepSeek",
				"command.label": "Модель",
				"command.description": "Выбрать модель для этого чата",
				"option.loadError": "Не удалось загрузить каталог: {message}",
				"trigger.fallback": "Выбрать модель",
				"trigger.loading": "Загрузка моделей…",
				"trigger.selectAria": "Выбрать модель",
				"trigger.aria": "Выбрать модель, сейчас {model}",
				"trigger.ariaEffort": "Выбрать модель, сейчас {model}, уровень размышлений {effort}",
				"menu.aria": "Модель и уровень размышлений",
				"menu.model": "Модель",
				"menu.effort": "Размышления",
				"effort.providerDefault": "По умолчанию",
				"status.loading": "Обновляем модели…",
				"error.action": "Ошибка операции с моделью: {message}",
				"error.sessionInUse": "Чат уже открыт в другом экземпляре DSH. Закройте его там и повторите.",
				"action.reload": "Обновить",
				"warning.groupLoad": "Не удалось загрузить {name}: {message}",
				"search.placeholder": "Поиск моделей…",
				"search.clear": "Сбросить поиск",
				"search.empty": "Модели не найдены.",
				"empty.models": "Нет доступных моделей.",
				"empty.efforts": "Эта модель не предлагает уровни размышлений."
			},
			command: {
				"section.add": "Добавить",
				"section.commands": "Команды",
				"label.goal": "Цель",
				"label.plan": "План",
				"label.feedback": "Обратная связь",
				"label.compact": "Сжатие",
				"label.permission": "Разрешения",
				"label.export": "Экспорт",
				"description.goal": "Задать или посмотреть цель длительной задачи",
				"description.plan": "Включить или выключить режим планирования",
				"description.feedback": "Оставить отзыв об этом чате",
				"description.compact": "Сжать раннюю историю чата",
				"description.permission": "Сменить настройки разрешений",
				"description.export": "Скачать журнал чата в ZIP",
				"token.goal": "цель",
				"token.plan": "план",
				"token.feedback": "отзыв",
				"token.compact": "сжатие",
				"token.permission": "разрешения",
				"token.export": "экспорт",
				"search.placeholder": "Поиск…",
				"search.aria": "Поиск вариантов",
				"status.loading": "Загрузка вариантов…",
				"status.applying": "Применяем…",
				"status.empty": "Нет вариантов",
				"overlay.aria": "Варианты /{command}",
				"listbox.aria": "Результаты /{command}",
				"notice.attachmentsUnsupported": "/{command} не принимает вложения; сначала уберите их"
			},
			common: {
				ok: "ОК",
				cancel: "Отмена",
				close: "Закрыть",
				copy: "Копировать",
				copied: "Скопировано",
				"codeBlock.title": "Блок кода",
				"codeBlock.wrap": "Переносить строки",
				"codeBlock.unwrap": "Не переносить строки",
				"copy.failed": "Не удалось скопировать",
				"copy.value": "Копировать значение",
				"copy.json": "Копировать JSON",
				"copy.path": "Копировать путь свойства",
				"copy.prettyJson": "Копировать форматированный JSON",
				"copy.compactJson": "Копировать компактный JSON",
				"copy.optionsHint": "{action}; параметры копирования — правой кнопкой",
				retry: "Повторить",
				loading: "Загрузка…",
				"load.failed": "Не удалось загрузить",
				submit: "Отправить",
				submitting: "Отправляем…",
				next: "Следующий",
				previous: "Предыдущий",
				skip: "Пропустить",
				delete: "Удалить",
				edit: "Изменить",
				save: "Сохранить",
				search: "Поиск",
				more: "Ещё",
				collapse: "Свернуть",
				expand: "Раскрыть",
				back: "Назад",
				"brand.localBuild": "Локальная сборка DSH",
				"workspace.defaultName": "Рабочая область по умолчанию",
				unknown: "Неизвестно",
				none: "Нет",
				truncated: "Сокращено",
				"json.label": "JSON",
				"markdown.footnotes": "Сноски",
				"markdown.truncatedCharacters": "… сокращено до {total} символов",
				"number.thousand": "{value} тыс.",
				"number.million": "{value} млн"
			},
			sidebar: {
				"session.new": "Новый чат",
				"session.new.label": "Новый чат",
				"toggle.open": "Открыть боковую панель",
				"toggle.collapse": "Свернуть боковую панель",
				"panels.label": "Разделы"
			},
			"settings.locale": { "language.title": "Язык" },
			settings: {
				trigger: "Настройки",
				"shortcut.open": "Открыть настройки",
				title: "Настройки",
				close: "Закрыть",
				"openDocument": "Открыть файл настроек",
				"openDocument.error": "Не удалось открыть файл настроек",
				"general.nav": "Основные",
				"general.currentVersion": "Текущая версия: {version}",
				"developerTools.title": "Показывать рабочие представления",
				"developerTools.error": "Не удалось сохранить. Попробуйте ещё раз.",
				"developerTools.description": "Показывает контекст, изменения кода и все пресеты агента",
				"connection.error": "Соединение потеряно",
				"connection.connecting": "Подключаемся снова",
				"connection.connected": "Подключено",
				"connection.reconnect": "Соединение потеряно; подключиться снова",
				"connection.restart": "Восстанавливаем соединение; подключиться снова"
			},
			conversation: {
				"shortcut.newline": "Новая строка",
				"shortcut.complementary": "Отправить в очередь / изменить текущий ответ",
				"shortcut.slash": "Открыть команды",
				"shortcut.mention": "Открыть ссылки",
				"placeholder.default": "Сообщение, / команды, @ файлы",
				"placeholder.hero": "Начните историю, / команды, @ файлы",
				"placeholder.plan": "Опишите следующий шаг",
				"hint.plan": "опишите следующий шаг",
				"placeholder.unavailable": "Чат недоступен",
				"placeholder.parentOffline": "Исходный чат отключён; текущий ответ можно остановить",
				"placeholder.workspace": "Выберите рабочую область",
				"placeholder.steerQueue": "Cmd/Ctrl+Enter отправляет все сообщения из очереди",
				"input.commands": "Добавить файлы или открыть команды",
				"input.file": "Файл",
				"input.stop": "Остановить ответ",
				"input.send": "Отправить сообщение",
				"input.send.queue": "Добавить в очередь",
				"input.send.steer": "Изменить текущий ответ",
				"attachment.pending": "Вложения",
				"attachment.scrollLeft": "Прокрутить вложения влево",
				"attachment.scrollRight": "Прокрутить вложения вправо",
				"attachment.dropTitle": "Перетащите сюда файлы или изображения",
				"attachment.dropDesc": "До {count} изображений, каждое до {size}",
				"attachment.dropBlocked": "Сейчас нельзя добавить вложения",
				"image.pending": "Изображения",
				"image.openOriginal": "Открыть оригинал",
				"image.openOriginalLabel": "{label}, нажмите для просмотра оригинала",
				"image.remove": "Убрать изображение {name}",
				"image.original": "Оригинал изображения",
				"image.label": "Изображение",
				"image.loadFailed": "Не удалось загрузить изображение; нажмите, чтобы повторить",
				"image.loading": "Загрузка изображения…",
				"image.preview": "Оригинал изображения",
				"image.closePreview": "Закрыть изображение",
				"image.unsupportedType": "Поддерживаются PNG, JPG, WebP и GIF",
				"image.tooMany": "До {count} изображений в сообщении",
				"image.fileTooLarge": "Каждое изображение должно быть меньше {size}",
				"image.totalTooLarge": "Изображения превышают {size}; уберите часть и повторите",
				"image.tooManyPixels": "Слишком высокое разрешение изображения; уменьшите его и повторите",
				"image.dimensionTooLarge": "Стороны изображения должны быть не больше {size} пикселей",
				"image.modelUnsupported": "Выбранная модель не поддерживает изображения; смените модель",
				"image.sendFailed": "Не удалось отправить изображения ({reason}); добавьте их снова",
				"file.pending": "Файлы",
				"file.remove": "Убрать файл {name}",
				"file.uploading": "Загрузка…",
				"file.uploadFailed": "Не удалось загрузить; нажмите, чтобы повторить",
				"file.retry": "Повторить загрузку {name}",
				"file.stillUploading": "Дождитесь загрузки файлов",
				"file.sessionUnavailable": "Чат недоступен; нельзя загрузить файлы",
				"file.notStaged": "Файл не загружен; добавьте его снова",
				"file.label": "Файл",
				"context.aria": "Использовано {percent} контекста",
				"context.used": "контекста использовано",
				"context.system": "Системные инструкции",
				"context.tools": "Определения инструментов",
				"context.messages": "Сообщения",
				"settings.enter.title": "Отправка во время ответа",
				"settings.enter.description": "Действие Enter и кнопки отправки во время ответа; Cmd/Ctrl+Enter выполняет другое действие",
				"settings.enter.queue": "В очередь",
				"settings.enter.steer": "Изменить ответ",
				"hero.headline": "Навстречу неизвестному",
				"hero.preview": "Предпросмотр",
				"hero.chooseWorkspace": "Выбрать рабочую область",
				"session.hierarchy": "Ветки чата"
			},
			chat: {
				"message.stepProcess.thinking": "Обдумываем ответ",
				"message.stepProcess.read": "Читаем файлы",
				"message.stepProcess.readImage": "Читаем изображения",
				"message.stepProcess.write": "Записываем файлы",
				"message.stepProcess.search": "Ищем в коде",
				"message.stepProcess.edit": "Изменяем файлы",
				"message.stepProcess.commands": "Выполняем команды",
				"message.stepProcess.code": "Выполняем код",
				"message.stepProcess.webSearch": "Ищем в интернете",
				"message.stepProcess.webFetch": "Открываем страницы",
				"message.stepProcess.subagents": "Координируем агентов",
				"message.stepProcess.plan": "Обновляем план",
				"message.stepProcess.questions": "Ждём вашего действия",
				"message.stepProcess.tools": "Вызываем инструменты",
				"message.stepProcess.prepare.read": "Готовимся читать файлы",
				"message.stepProcess.prepare.readImage": "Готовимся читать изображения",
				"message.stepProcess.prepare.write": "Готовимся записать файлы",
				"message.stepProcess.prepare.search": "Готовимся искать в коде",
				"message.stepProcess.prepare.edit": "Готовимся изменить файлы",
				"message.stepProcess.prepare.commands": "Готовимся выполнить команды",
				"message.stepProcess.prepare.code": "Готовимся выполнить код",
				"message.stepProcess.prepare.webSearch": "Готовимся искать в интернете",
				"message.stepProcess.prepare.webFetch": "Готовимся открыть страницы",
				"message.stepProcess.prepare.subagents": "Готовимся координировать агентов",
				"message.stepProcess.prepare.plan": "Готовимся обновить план",
				"message.stepProcess.prepare.questions": "Готовим вопросы",
				"message.stepProcess.prepare.tools": "Готовимся вызвать инструменты",
				"message.stepProcess.done.thinking": "Ответ обдуман",
				"message.stepProcess.done.read": "Файлы прочитаны",
				"message.stepProcess.done.readImage": "Изображения прочитаны",
				"message.stepProcess.done.write": "Файлы записаны",
				"message.stepProcess.done.search": "Поиск в коде завершён",
				"message.stepProcess.done.edit": "Файлы изменены",
				"message.stepProcess.done.commands": "Команды выполнены",
				"message.stepProcess.done.code": "Код выполнен",
				"message.stepProcess.done.webSearch": "Поиск в интернете завершён",
				"message.stepProcess.done.webFetch": "Страницы открыты",
				"message.stepProcess.done.subagents": "Координация завершена",
				"message.stepProcess.done.plan": "План обновлён",
				"message.stepProcess.done.questions": "Вопросы заданы",
				"message.stepProcess.done.tools": "Инструменты вызваны",
				"message.stepProcess.joinTwo": "{first} и {second}",
				"message.stepProcess.comma": ", ",
				"message.stepProcess.sharedPrefix": "",
				"message.stepProcess.more": "{title} и другие",
				"message.trigger.request": "Запрошено выполнение",
				"message.trigger.goal": "Продолжаем цель",
				"message.trigger.agent": "Получено сообщение задачи",
				"message.trigger.team": "Получено сообщение команды",
				"message.trigger.subagent": "Статус подзадачи обновлён",
				"message.trigger.github": "Получено событие GitHub",
				"message.trigger.webhook": "Получено внешнее событие",
				"message.trigger.schedule": "Задача по расписанию",
				"message.trigger.job": "Фоновая задача обновлена",
				"message.trigger.plugin": "Статус плагина обновлён",
				"message.trigger.explanation": "Это уведомление запустило ответ.",
				"message.turnProcess.worked": "Завершено",
				"message.turnProcess.took": "Завершено за ",
				"message.turnProcess.failed": "Ошибка",
				"view.chat": "Чат",
				"image.open": "Открыть изображение",
				"image.loading": "Загрузка изображения…",
				"image.failed": "Предпросмотр недоступен",
				"image.dialog": "Предпросмотр изображения",
				"image.close": "Закрыть изображение",
				"number.groupSeparator": "\xA0",
				"duration.compactSeconds": "{seconds}с",
				"duration.compactMinutes": "{minutes}м {seconds}с",
				"duration.milliseconds": "{milliseconds}мс",
				"stats.counts": "Ходов: {turns}, шагов: {steps}",
				"stats.cacheHit": "Кэш: {percent}%",
				"stats.dialog.title": "Статистика чата",
				"stats.dialog.usageTitle": "Использование токенов",
				"stats.dialog.llmTime": "Время модели",
				"stats.dialog.toolTime": "Время инструментов",
				"stats.dialog.ttft": "Среднее время до первого токена",
				"stats.dialog.speed": "Токенов в секунду",
				"chat.loadingHistory": "Загрузка истории…",
				"chat.loadError": "Не удалось загрузить историю: {message} ({code})",
				"chat.loadOlder": "Загрузить более ранние",
				"chat.toBottom": "К последнему сообщению",
				"chat.deepDiving": "Обдумываем ответ",
				"chat.deepDivingFor": "Обдумываем ответ {duration} ···",
				"chat.turnNavigation.label": "Навигация по ходам",
				"chat.turnNavigation.jump": "Перейти к ходу {turn}",
				"chat.turnNavigation.jumpLoad": "Загрузить и перейти к ходу {turn}",
				"chat.turnNavigation.turn": "Ход {turn}",
				"settings.performance.title": "Производительность и использование",
				"settings.performance.description": "Объём сведений о производительности и использовании",
				"settings.performance.compact": "Кратко",
				"settings.performance.detailed": "Подробно",
				"settings.links.title": "Открывать ссылки в чате",
				"settings.links.description": "Где открывать веб-ссылки",
				"settings.links.sidebar": "В боковой панели",
				"settings.links.newTab": "В браузере",
				"settings.transcript.title": "Подробности работы",
				"settings.transcript.description": "Объём сведений о вызовах инструментов",
				"settings.collapse.title": "Когда сворачивать подробности",
				"settings.collapse.description": "Когда автоматически сворачивать подробности работы",
				"settings.collapse.completion": "После завершения",
				"settings.collapse.nextInput": "При следующем сообщении",
				"settings.transcript.compact": "Кратко",
				"settings.transcript.standard": "Обычно",
				"settings.transcript.detailed": "Подробно",
				"settings.transcript.verbose": "Полностью",
				"fileOpen.title": "Не удалось открыть файл",
				"fileOpen.unknown": "Не удалось открыть этот файл",
				"message.extraBlock": "Дополнительный блок",
				"message.systemPrompt": "Системные инструкции",
				"message.systemPromptUpdate": "Обновление системных инструкций",
				"message.toolAdded": "Добавлен инструмент: {name}",
				"message.toolRemoved": "Удалён инструмент: {name}",
				"message.toolsAdded": "Добавлены: {names}",
				"message.toolsAddedCount": "Добавлено: {count}",
				"message.toolsChanged": "Добавлено: {added}, удалено: {removed}",
				"message.toolsRemoved": "Удалены: {names}",
				"message.toolsRemovedCount": "Удалено: {count}",
				"message.toolsUpdated": "Инструменты обновлены",
				"message.contextInjection": "Добавление контекста",
				"message.contextRecall": "Восстановление контекста",
				"message.referenceSummary": "Связанный чат · {labels}",
				"message.referenceSeparator": ", ",
				"message.context.instructions.loaded": "загружено",
				"message.context.instructions.added": "добавлено",
				"message.context.instructions.updated": "обновлено",
				"message.context.instructions.removed": "удалено",
				"message.context.catalog.replaced": "Замена каталога",
				"message.context.catalog.more": "… ещё {count}",
				"message.context.snapshot.supersedes": "Заменяет прежние снимки",
				"message.context.relay.from": "Из чата {session}",
				"message.context.recall.counts": "Сохранено: {retained} · пропущено: {omitted}",
				"message.context.recall.truncated": "сокращено",
				"message.compaction": "Контекст сжат",
				"message.compaction.running": "Сжимаем контекст…",
				"message.compaction.completed": "Сжато записей: {items} (~{tokens} токенов)",
				"message.compaction.expand": "Показать изложение",
				"message.compaction.unavailable": "Изложение недоступно",
				"message.compaction.commandTitle": "сжатие",
				"message.think": "Размышления",
				"message.unknownSurface": "Неизвестное событие: {type}",
				"message.unknownBlock": "Неизвестный блок содержимого",
				"message.turnProcess.toolCalls.one": "Вызовов инструментов: {count}",
				"message.turnProcess.toolCalls.other": "Вызовов инструментов: {count}",
				"message.turnProcess.messages.one": "Сообщений: {count}",
				"message.turnProcess.messages.other": "Сообщений: {count}",
				"message.turnProcess.subagents.one": "Агентов: {count}",
				"message.turnProcess.subagents.other": "Агентов: {count}",
				"message.turnProcess.thoughtForAWhile": "Обдумывал ответ",
				"message.turnProcess.separator": " · ",
				"message.stopped": "Остановлено",
				"message.branch": "Создать ветку чата",
				"message.branchUnavailable": "Доступно для последнего сообщения завершённого хода",
				"message.retry.active": "Повторяем запрос модели",
				"message.retry.cancelled": "Повтор запроса отменён",
				"message.retry.started": "Запрос модели повторён",
				"message.retry.scheduled": "Ждём повтора запроса",
				"message.retry.status": "{label} ({retry}/{maximum}) · {seconds}с",
				"message.retry.delay": "Задержка повтора: ",
				"message.retry.failure": "Причина ошибки: ",
				"message.failure.auth": "Некорректный ключ API",
				"message.accountStopped": "Задача остановлена",
				"message.failure.accountSignedOut": "Остановлено после выхода из DeepSeek.",
				"message.failure.accountSignInRequired": "Войдите в DeepSeek и проверьте поддержку входа на стороне сервера.",
				"message.failure.quota": "Лимит запросов исчерпан.",
				"message.turnError": "Ошибка хода",
				"message.maxTokens": "Достигнут лимит ответа",
				"message.maxTokens.hint": "Ответ оборвался; полученный текст сохранён. Отправьте «продолжай», чтобы продолжить.",
				"message.tokensPerSecond": "{tps} ток/с",
				"message.turnUsage.title": "Использование за ход",
				"message.turnUsage.consumed": "Использовано: {total}",
				"message.turnUsage.model": "Провайдер / модель",
				"message.turnUsage.cacheHit": "Попадания в кэш",
				"message.turnUsage.input": "Вход без кэша",
				"message.turnUsage.cacheRead": "Вход из кэша",
				"message.turnUsage.cacheWrite": "Запись в кэш",
				"message.turnUsage.output": "Выход",
				"message.turnUsage.reasoning": " (размышления: {tokens})",
				"message.turnUsage.count": "{count} ток",
				"duration.secondUnit": "с",
				"duration.minuteUnit": "м ",
				"duration.hourUnit": "ч ",
				"command.running": "Выполняем…",
				"command.failed": "Ошибка команды",
				"command.done": "Завершено",
				"command.title": "Команда",
				"row.running": "Выполняется",
				"row.failed": "Ошибка",
				"json.truncated": "… сокращено, всего {total} символов",
				"clock.md": "{d}.{m}",
				"clock.ymd": "{d}.{m}.{y}"
			}
		};
		//#endregion
		//#region src/features/localization/client/provider.js
		var DshLocalizationProvider = class extends LocalizationService {
			constructor(locale) {
				super();
				this.locale = locale;
				this.translate = locale.bind("mayori");
			}
			getSnapshot = () => this.locale.getSnapshot();
			subscribe = (listener) => this.locale.subscribe(listener);
			setLanguage = (id) => {
				if (!["ru", "en"].includes(id)) throw new TypeError("Unsupported Mayori language");
				return this.locale.setLocale(id);
			};
		};
		/** Language definitions, dictionaries and the helper binding all unload with ctx. */
		function registerLocalization(ctx) {
			if (!ctx.locale.getSnapshot().locales.some((language) => language.id.toLowerCase() === "ru")) ctx.effect(() => ctx.locale.addLanguage({
				id: "ru",
				label: "Русский",
				fallback: "en"
			}), "mayori: Russian language");
			ctx.effect(() => ctx.locale.register("mayori", "en", en), "mayori: English copy");
			ctx.effect(() => ctx.locale.register("mayori", "ru", ru), "mayori: Russian copy");
			for (const [namespace, dictionary] of Object.entries(nativeRu)) ctx.effect(() => ctx.locale.register(namespace, "ru", dictionary), `mayori: Russian ${namespace}`);
			const provider = new DshLocalizationProvider(ctx.locale);
			ctx.provide("mayoriLocale", provider);
			ctx.effect(() => bindLocalization(provider), "mayori: locale binding");
			return provider;
		}
		//#endregion
		//#region src/client/infrastructure/rpc.js
		/** Same-origin transport for Host capability consumers. */
		function unwrap(result) {
			if (result.ok) return result.value;
			throw new Error(typeof result.error === "string" ? result.error : tr("Не удалось выполнить операцию с библиотекой."));
		}
		async function call(endpoint, payload, options = {}) {
			const response = await fetch(`/mayori/characters/${endpoint}`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(payload),
				signal: options.signal
			});
			const result = await response.json().catch(() => ({
				ok: false,
				error: `HTTP ${response.status}`
			}));
			if (!response.ok && result.ok !== false) throw new Error(`HTTP ${response.status}`);
			return unwrap(result);
		}
		//#endregion
		//#region src/features/characters/client/library.js
		/** Browser proxy for the Host-owned Character Library Service. */
		const EMPTY_SNAPSHOT = Object.freeze({
			status: "loading",
			cards: Object.freeze([]),
			total: 0,
			filteredTotal: 0,
			page: 1,
			pageSize: 5,
			facets: {
				creators: [],
				tags: []
			},
			error: null,
			revision: 0
		});
		/** Service Definition consumed by gallery UI. */
		var CharacterLibraryService = class {
			getSnapshot() {
				throw new Error("CharacterLibraryService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("CharacterLibraryService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("CharacterLibraryService.refresh() is not implemented");
			}
			importFiles() {
				throw new Error("CharacterLibraryService.importFiles() is not implemented");
			}
			remove() {
				throw new Error("CharacterLibraryService.remove() is not implemented");
			}
			prepareCampaign() {
				throw new Error("CharacterLibraryService.prepareCampaign() is not implemented");
			}
			play() {
				throw new Error("CharacterLibraryService.play() is not implemented");
			}
			start() {
				throw new Error("CharacterLibraryService.start() is not implemented");
			}
			get() {
				throw new Error("CharacterLibraryService.get() is not implemented");
			}
		};
		function toBase64(bytes) {
			const chunkSize = 32768;
			let binary = "";
			for (let offset = 0; offset < bytes.length; offset += chunkSize) binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
			return btoa(binary);
		}
		/** Client Provider that keeps only an observable snapshot; Host owns persistence. */
		var RemoteCharacterLibraryProvider = class RemoteCharacterLibraryProvider extends CharacterLibraryService {
			#snapshot = EMPTY_SNAPSHOT;
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			#controller;
			#poll;
			#gallery;
			constructor(options = {}, owner) {
				super();
				this.options = {
					page: 1,
					pageSize: 5,
					...options
				};
				this.owner = owner ?? this;
			}
			gallery() {
				return this.#gallery ??= new RemoteCharacterLibraryProvider({ pageSize: 20 }, this);
			}
			get(id) {
				return call("get", { id });
			}
			setQuery(options) {
				const next = {
					...this.options,
					...options
				};
				if (JSON.stringify(next) === JSON.stringify(this.options)) return;
				this.options = next;
				this.refresh().catch(() => {});
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#ensureLoaded();
				if (this.#snapshot.indexing && !this.#poll) this.#poll = setTimeout(() => {
					this.refresh().catch(() => {});
				}, 400);
				return () => {
					this.#listeners.delete(listener);
					if (!this.#listeners.size) {
						clearTimeout(this.#poll);
						this.#poll = void 0;
					}
				};
			};
			async importFiles(files) {
				await this.#ensureLoaded();
				const result = {
					imported: 0,
					rejected: []
				};
				const inputs = [...files];
				for (let offset = 0; offset < inputs.length; offset += 2) {
					const prepared = [];
					for (const file of inputs.slice(offset, offset + 2)) {
						if (file.size > 16777216) {
							result.rejected.push({
								name: file.name,
								error: tr("Файл превышает 16 МБ.")
							});
							continue;
						}
						prepared.push({
							name: file.name || "character-card",
							type: file.type || "",
							base64: toBase64(new Uint8Array(await file.arrayBuffer()))
						});
					}
					if (!prepared.length) continue;
					const partial = await call("import", { files: prepared });
					result.imported += partial.imported;
					result.rejected.push(...partial.rejected);
				}
				await this.owner.refreshAll();
				return result;
			}
			async remove(id) {
				await call("remove", { id });
				await this.owner.refreshAll();
			}
			async refreshAll() {
				await Promise.all([this.refresh(), this.#gallery?.refresh()]);
			}
			async start(characterId, workspaceId, greetingIndex = 0) {
				return call("start", {
					characterId,
					workspaceId,
					greetingIndex
				});
			}
			async play(characterId, sessionId) {
				return call("play", {
					characterId,
					sessionId
				});
			}
			async prepareCampaign() {
				return call("prepare-campaign", {});
			}
			async #ensureLoaded() {
				this.#loading ??= this.refresh().catch(() => {});
				return this.#loading;
			}
			async refresh() {
				const revision = ++this.#revision;
				this.#controller?.abort();
				const controller = this.#controller = new AbortController();
				this.#publish("loading", this.#snapshot.cards, null);
				try {
					const result = await call("list", this.options, { signal: controller.signal });
					if (revision === this.#revision) {
						this.#publish("ready", Array.isArray(result.cards) ? result.cards : [], null, result);
						clearTimeout(this.#poll);
						if (result.indexing && this.#listeners.size) this.#poll = setTimeout(() => {
							this.refresh().catch(() => {});
						}, 400);
					}
				} catch (error) {
					if (revision === this.#revision && !controller.signal.aborted) {
						this.#loading = void 0;
						this.#publish("error", this.#snapshot.cards, error instanceof Error ? error.message : String(error));
					}
					throw error;
				}
			}
			dispose() {
				++this.#revision;
				this.#controller?.abort();
				clearTimeout(this.#poll);
				this.#listeners.clear();
				this.#gallery?.dispose();
				this.#snapshot = EMPTY_SNAPSHOT;
			}
			#publish(status, cards, error, result = {}) {
				this.#snapshot = Object.freeze({
					...this.#snapshot,
					...result,
					status,
					cards: Object.freeze(cards),
					error,
					revision: this.#snapshot.revision + 1
				});
				for (const listener of [...this.#listeners]) listener();
			}
		};
		//#endregion
		//#region src/shared/resources.js
		/** Bounded caches contain derived data only; active callers own their results. */
		var ByteCache = class {
			constructor(maxEntries = 128, maxBytes = 2097152) {
				this.maxEntries = maxEntries;
				this.maxBytes = maxBytes;
				this.bytes = 0;
				this.entries = /* @__PURE__ */ new Map();
			}
			get(key) {
				const entry = this.entries.get(key);
				if (!entry) return void 0;
				this.entries.delete(key);
				this.entries.set(key, entry);
				return entry.value;
			}
			set(key, value, bytes = JSON.stringify(value).length * 2) {
				this.delete(key);
				if (bytes > this.maxBytes) return;
				this.entries.set(key, {
					value,
					bytes
				});
				this.bytes += bytes;
				while (this.entries.size > this.maxEntries || this.bytes > this.maxBytes) this.delete(this.entries.keys().next().value);
			}
			delete(key) {
				const entry = this.entries.get(key);
				if (entry) this.bytes -= entry.bytes;
				this.entries.delete(key);
			}
			clear() {
				this.entries.clear();
				this.bytes = 0;
			}
		};
		//#endregion
		//#region src/features/history/client/history.js
		/** History capability backed by the durable DSH session catalog and archive. */
		var ChatHistoryService = class {
			getSnapshot() {
				throw new Error("ChatHistoryService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("ChatHistoryService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("ChatHistoryService.refresh() is not implemented");
			}
			ensureLoaded() {
				throw new Error("ChatHistoryService.ensureLoaded() is not implemented");
			}
			open() {
				throw new Error("ChatHistoryService.open() is not implemented");
			}
			getArchiveSnapshot() {
				throw new Error("ChatHistoryService.getArchiveSnapshot() is not implemented");
			}
			subscribeArchive() {
				throw new Error("ChatHistoryService.subscribeArchive() is not implemented");
			}
			archive() {
				throw new Error("ChatHistoryService.archive() is not implemented");
			}
			restore() {
				throw new Error("ChatHistoryService.restore() is not implemented");
			}
			remove() {
				throw new Error("ChatHistoryService.remove() is not implemented");
			}
			details() {
				throw new Error("ChatHistoryService.details() is not implemented");
			}
		};
		/** No second persistence store: DSH owns catalog refresh and chat restoration. */
		var SessionChatHistoryProvider = class extends ChatHistoryService {
			constructor(sessions, uiWorkspace, workspaces) {
				super();
				this.sessions = sessions;
				this.uiWorkspace = uiWorkspace;
				this.workspaces = workspaces;
				this.cache = new ByteCache();
				this.pending = /* @__PURE__ */ new Map();
				this.revision = 0;
				this.deletedIds = [];
				this.deletionPhase = "pending";
				this.listeners = /* @__PURE__ */ new Set();
			}
			getSnapshot = () => {
				const source = this.sessions.list.getSnapshot();
				if (this.source !== source || this.filteredIds !== this.deletedIds || this.phase !== this.deletionPhase) {
					const deleted = new Set(this.deletedIds);
					this.source = source;
					this.filteredIds = this.deletedIds;
					this.phase = this.deletionPhase;
					this.snapshot = {
						...source,
						phase: this.deletionPhase === "pending" ? "pending" : source.phase,
						state: this.deletionPhase === "error" ? "error" : source.state,
						ids: this.deletionPhase === "ready" ? source.ids.filter((id) => !deleted.has(id)) : []
					};
				}
				return this.snapshot;
			};
			subscribe = (listener) => {
				this.listeners.add(listener);
				const unsubscribe = this.sessions.list.subscribe(listener);
				return () => {
					this.listeners.delete(listener);
					unsubscribe();
				};
			};
			publishDeleted = (ids) => {
				if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) throw new Error(tr("Некорректный список удалённых чатов."));
				this.deletedIds = [.../* @__PURE__ */ new Set([...this.deletedIds, ...ids])];
				this.deletionPhase = "ready";
				this.listeners.forEach((listener) => listener());
			};
			refresh = async () => {
				this.revision++;
				this.cache.clear();
				try {
					const [ids] = await Promise.all([call("history-deleted", {}), this.sessions.refresh()]);
					this.publishDeleted(ids);
				} catch (error) {
					if (this.deletionPhase !== "ready") {
						this.deletionPhase = "error";
						this.listeners.forEach((listener) => listener());
					}
					throw error;
				}
			};
			ensureLoaded = () => this.getSnapshot().phase === "ready" && this.getSnapshot().state !== "error" ? Promise.resolve() : this.refresh();
			assertAvailable = (id) => {
				if (this.deletedIds.includes(id)) throw new Error(tr("Чат удалён."));
			};
			open = async (id) => {
				this.assertAvailable(id);
				return this.uiWorkspace.openSession(id);
			};
			getArchiveSnapshot = () => this.workspaces.list.getSnapshot();
			subscribeArchive = (listener) => this.workspaces.list.subscribe(listener);
			archive = (id) => this.uiWorkspace.archiveSession(id);
			restore = async (id) => {
				this.assertAvailable(id);
				return this.uiWorkspace.unarchiveSession(id);
			};
			remove = async (id) => {
				await this.uiWorkspace.archiveSession(id);
				const ids = await call("history-remove", { id });
				this.revision++;
				this.cache.clear();
				this.publishDeleted(ids);
			};
			details = async (ids, options = {}) => {
				const snapshot = this.getSnapshot();
				const revision = this.revision;
				const result = {}, missing = [];
				for (const id of ids) {
					const key = `${revision}:${id}:${snapshot.byId[id]?.updatedAt}`;
					const cached = options.force ? void 0 : this.cache.get(key);
					if (cached) result[id] = cached;
					else missing.push([id, key]);
				}
				if (!missing.length) return result;
				const requestKey = JSON.stringify(missing);
				if (!this.pending.has(requestKey)) {
					const request = call("history-details", { ids: missing.map((row) => row[0]) }).then((values) => {
						if (revision === this.revision) {
							for (const [id, key] of missing) if (values[id] && !values[id].error) this.cache.set(key, values[id]);
						}
						return values;
					}).finally(() => this.pending.delete(requestKey));
					this.pending.set(requestKey, request);
				}
				return {
					...result,
					...await this.pending.get(requestKey)
				};
			};
			dispose() {
				this.revision++;
				this.cache.clear();
				this.listeners.clear();
			}
		};
		/** Flatten all campaigns, retain ordinary forks, omit agent children and blanks. */
		function historyRows(snapshot, query = "", archivedSessionIds = [], archivedOnly = false, limit = Infinity, options = {}) {
			const needle = query.trim().toLocaleLowerCase(formatLocale());
			const archived = new Set(archivedSessionIds);
			const rows = [];
			const order = (a, b) => (options.sort === "oldest" ? a.updatedAt - b.updatedAt : options.sort === "title-asc" ? a.title.localeCompare(b.title, formatLocale()) : options.sort === "title-desc" ? b.title.localeCompare(a.title, "ru") : b.updatedAt - a.updatedAt) || a.id.localeCompare(b.id);
			for (const id of snapshot.ids) {
				const row = snapshot.byId[id];
				if (!row || row.origin === "subagent" || row.blank && !row.title?.trim()) continue;
				if (options.status !== "all" && archived.has(id) !== archivedOnly) continue;
				const current = row.retainedBy?.mainView > 0;
				if (options.kind === "current" && !current || options.kind === "branches" && !row.parentId || options.kind === "originals" && row.parentId || options.kind === "running" && !row.running) continue;
				if (options.since !== void 0 && row.updatedAt < options.since) continue;
				const title = row.title?.trim() || tr("Чат без названия");
				if (needle && !`${title}\n${id}`.toLocaleLowerCase(formatLocale()).includes(needle)) continue;
				rows.push({
					id,
					title,
					updatedAt: row.updatedAt,
					current,
					archived: archived.has(id)
				});
				if (Number.isFinite(limit)) {
					rows.sort(order);
					if (rows.length > limit) rows.pop();
				}
			}
			return Number.isFinite(limit) ? rows : rows.sort(order);
		}
		//#endregion
		//#region src/client/components/select.jsx
		/** DSH's shared menu owns placement, keyboard navigation, dismissal and focus return. */
		function Select({ value, options, onChange, disabled = false, portal = true, id, "aria-label": label, "aria-describedby": description }) {
			const [open, setOpen] = (0, react.useState)(false);
			const selectedLabelId = (0, react.useId)();
			const selectedId = String(value);
			const items = options.map((option) => ({
				id: String(option.value),
				label: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"data-mayori-option": String(option.value),
					children: option.label
				}),
				disabled: option.disabled
			}));
			const selected = items.find((option) => option.id === selectedId);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				className: "mayori-select",
				open: open && !disabled,
				portal,
				autoFocus: true,
				items,
				selectedId,
				onClose: () => setOpen(false),
				onSelect: (next) => {
					setOpen(false);
					if (next !== selectedId) onChange(next);
				},
				anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					id,
					type: "button",
					className: "mayori-select-trigger",
					disabled,
					"data-value": selectedId,
					"aria-label": label,
					"aria-describedby": `${selectedLabelId}${description ? ` ${description}` : ""}`,
					"aria-haspopup": "menu",
					"aria-expanded": open && !disabled,
					onClick: () => setOpen((previous) => !previous),
					onKeyDown: (event) => {
						if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
							event.preventDefault();
							setOpen(true);
						}
					},
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						id: selectedLabelId,
						children: selected?.label ?? ""
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
				})
			});
		}
		//#endregion
		//#region src/client/components/pagination-model.js
		const PAGE_SIZE_OPTIONS = [
			20,
			40,
			60
		];
		function paginate(items, requestedPage, pageSize) {
			const size = PAGE_SIZE_OPTIONS.includes(pageSize) ? pageSize : 20;
			const pages = Math.max(1, Math.ceil(items.length / size));
			const page = Math.max(1, Math.min(pages, Number.isSafeInteger(requestedPage) ? requestedPage : 1));
			const start = (page - 1) * size;
			return {
				page,
				pages,
				start,
				end: Math.min(start + size, items.length),
				items: items.slice(start, start + size)
			};
		}
		//#endregion
		//#region src/client/components/icon-button.jsx
		/** Every icon action has the same visible tooltip and accessible name. */
		const IconButton = (0, react.forwardRef)(function IconButton({ label, side = "bottom", portal = false, delayMs = 0, shortcutKeys, children, type = "button", ...props }, ref) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label,
				side,
				portal,
				delayMs,
				shortcutKeys,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					...props,
					type,
					ref,
					"aria-label": label,
					children
				})
			});
		});
		//#endregion
		//#region src/client/components/pagination.jsx
		function Pagination({ pagination, total, pageSize, onPage, onPageSize }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("nav", {
				className: "mayori-pagination",
				"aria-label": tr("Страницы списка"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-filter-control",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("На странице") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": tr("На странице"),
							value: pageSize,
							onChange: (value) => onPageSize(Number(value)),
							options: PAGE_SIZE_OPTIONS.map((size) => ({
								value: size,
								label: size
							}))
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						role: "status",
						children: tr("{p1} из {p2}", {
							p1: total === 0 ? "0" : `${pagination.start + 1}–${pagination.end}`,
							p2: total
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-page-actions",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
								portal: true,
								className: "mayori-secondary-button",
								disabled: pagination.page <= 1,
								onClick: () => {
									onPage(pagination.page - 1);
								},
								label: tr("Предыдущая страница"),
								children: "‹"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "mayori-filter-control",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Страница") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "number",
									min: "1",
									max: pagination.pages,
									value: pagination.page,
									onChange: (event) => {
										const value = Number(event.target.value);
										if (Number.isSafeInteger(value) && value >= 1 && value <= pagination.pages) onPage(value);
									}
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("из {p1}", { p1: pagination.pages }) }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
								portal: true,
								className: "mayori-secondary-button",
								disabled: pagination.page >= pagination.pages,
								onClick: () => {
									onPage(pagination.page + 1);
								},
								label: tr("Следующая страница"),
								children: "›"
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/features/media/shared/image.js
		const HASH = "[a-f0-9]{64}";
		const REFERENCE = new RegExp(`^mayori-media:(${HASH})$`);
		const URL$1 = new RegExp(`^/mayori/characters/(?:media/${HASH}/(?:avatar|gallery|preview|original)|card-image/${HASH}/(?:avatar|gallery|preview|original))$`);
		function mediaId(value) {
			return typeof value === "string" ? REFERENCE.exec(value)?.[1] ?? null : null;
		}
		function imageSource(value, variant = "avatar") {
			const id = mediaId(value);
			if (id) return `/mayori/characters/media/${id}/${variant}`;
			return typeof value === "string" && (URL$1.test(value) || /^data:image\/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) ? value : null;
		}
		function originalImage(value) {
			return imageSource(value, "original")?.replace(/\/(avatar|gallery|preview)$/, "/original") ?? null;
		}
		//#endregion
		//#region src/features/history/client/panel.jsx
		function ChatHistoryIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 11a9 9 0 1 1 2.6 7M3 4v7h7M12 7v5l3 2" })
			});
		}
		/** Load only the rows being displayed; late results never overwrite a new list. */
		function useHistoryDetails(history, rows, refreshKey = 0) {
			const [result, setResult] = (0, react.useState)({
				key: "",
				value: {},
				loading: false
			});
			const key = JSON.stringify(rows.map((row) => [row.id, row.updatedAt]));
			const requestKey = `${refreshKey}:${key}`;
			(0, react.useEffect)(() => {
				let active = true;
				const ids = JSON.parse(key).map((row) => row[0]);
				setResult({
					key: requestKey,
					value: {},
					loading: ids.length > 0
				});
				if (ids.length) Promise.resolve().then(() => history.details(ids)).then((value) => {
					if (active) setResult({
						key: requestKey,
						value,
						loading: false
					});
				}).catch(() => {
					if (active) setResult({
						key: requestKey,
						loading: false,
						value: Object.fromEntries(ids.map((id) => [id, { error: tr("Не удалось загрузить данные чата.") }]))
					});
				});
				return () => {
					active = false;
				};
			}, [
				history,
				key,
				requestKey
			]);
			return result.key === requestKey ? result : {
				value: {},
				loading: rows.length > 0
			};
		}
		function HistoryRow({ row, detail, loading, disabled, onOpen }) {
			const avatar = imageSource(detail?.avatar);
			const [failedImage, setFailedImage] = (0, react.useState)(null);
			const name = detail?.characterName || row.title;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mayori-history-row",
				disabled,
				onClick: () => {
					onOpen(row.id);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "mayori-history-avatar",
						"aria-hidden": "true",
						children: avatar && failedImage !== avatar ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							src: avatar,
							alt: "",
							loading: "lazy",
							onError: () => {
								setFailedImage(avatar);
							}
						}) : Array.from(name)[0]?.toUpperCase()
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "mayori-history-text",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: name }),
							detail?.characterName && row.title !== name && row.title !== tr("Чат без названия") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: row.title }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-history-preview",
								children: loading ? tr("Загружаем сообщение…") : noticeText(detail?.error) || detail?.preview || tr("Сообщений пока нет")
							}),
							row.current && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: tr("Открыт сейчас") })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", {
						dateTime: new Date(row.updatedAt).toISOString(),
						children: new Date(row.updatedAt).toLocaleString(formatLocale(), {
							dateStyle: "medium",
							timeStyle: "short"
						})
					})
				]
			});
		}
		/** A flat catalog consumer; opening a row restores the existing conversation. */
		function ChatHistoryPanel({ history }) {
			const snapshot = (0, react.useSyncExternalStore)(history.subscribe, history.getSnapshot, history.getSnapshot);
			const archiveSnapshot = (0, react.useSyncExternalStore)(history.subscribeArchive, history.getArchiveSnapshot, history.getArchiveSnapshot);
			const [status, setStatus] = (0, react.useState)("active");
			const [kind, setKind] = (0, react.useState)("all");
			const [period, setPeriod] = (0, react.useState)("all");
			const [sort, setSort] = (0, react.useState)("recent");
			const archivedOnly = status === "archived";
			const [changingId, setChangingId] = (0, react.useState)(null);
			const changingRef = (0, react.useRef)(false);
			const controlsRef = (0, react.useRef)(null);
			const [removing, setRemoving] = (0, react.useState)(null);
			const dialogRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const dialogTitle = (0, react.useId)();
			const [notice, setNotice] = (0, react.useState)("");
			const [query, setQuery] = (0, react.useState)("");
			const [page, setPage] = (0, react.useState)(1);
			const [pageSize, setPageSize] = (0, react.useState)(20);
			(0, react.useEffect)(() => {
				setPage(1);
			}, [
				query,
				status,
				kind,
				period,
				sort,
				pageSize
			]);
			const [error, setError] = (0, react.useState)(null);
			const [refreshing, setRefreshing] = (0, react.useState)(false);
			const [detailsRevision, setDetailsRevision] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				if (notice && changingId === null) controlsRef.current?.focus();
			}, [notice, changingId]);
			(0, react.useEffect)(() => {
				if (removing) dialogRef.current?.showModal();
			}, [removing]);
			const closeRemoval = () => {
				if (changingRef.current) return;
				dialogRef.current?.close();
				setRemoving(null);
				if (triggerRef.current?.isConnected) triggerRef.current.focus();
				else controlsRef.current?.focus();
			};
			(0, react.useEffect)(() => {
				let active = true;
				setRefreshing(true);
				Promise.resolve().then(() => history.ensureLoaded()).catch(() => {
					if (active) setError(tr("Не удалось загрузить историю. Попробуйте обновить список."));
				}).finally(() => {
					if (active) setRefreshing(false);
				});
				return () => {
					active = false;
				};
			}, [history]);
			const refresh = async () => {
				setError(null);
				setRefreshing(true);
				try {
					await history.refresh();
				} catch {
					setError(tr("Не удалось загрузить историю. Попробуйте обновить список."));
				} finally {
					setRefreshing(false);
					setDetailsRevision((value) => value + 1);
				}
			};
			const open = async (id) => {
				setError(null);
				try {
					await history.open(id);
				} catch {
					setError(tr("Не удалось открыть чат. Обновите список и попробуйте снова."));
				}
			};
			const changeArchive = async (row) => {
				if (changingRef.current) return;
				if (!row.archived && !window.confirm(tr("Убрать чат «{p1}» в архив?", { p1: row.title }))) return;
				changingRef.current = true;
				setChangingId(row.id);
				setError(null);
				setNotice("");
				try {
					if (row.archived) await history.restore(row.id);
					else await history.archive(row.id);
					setNotice(row.archived ? tr("Чат восстановлен.") : tr("Чат перемещён в архив."));
				} catch (failure) {
					setError(failure?.rpcError?.code === "workspace/session-active" ? tr("Чат ещё выполняет работу. Дождитесь завершения или остановите её в чате, затем повторите.") : row.archived ? tr("Не удалось восстановить чат.") : tr("Не удалось переместить чат в архив."));
				} finally {
					changingRef.current = false;
					setChangingId(null);
				}
			};
			const remove = async (event) => {
				event.preventDefault();
				if (changingRef.current || !removing) return;
				changingRef.current = true;
				setChangingId(removing.id);
				setError(null);
				setNotice("");
				try {
					await history.remove(removing.id);
					setRemoving(null);
					setNotice(tr("Чат удалён."));
				} catch (failure) {
					setError(failure?.rpcError?.code === "workspace/session-active" ? tr("Чат ещё выполняет работу. Дождитесь завершения.") : failure.message || tr("Не удалось удалить чат."));
				} finally {
					changingRef.current = false;
					setChangingId(null);
				}
			};
			const loading = refreshing || snapshot.phase === "pending" || archiveSnapshot.phase === "pending";
			const language = currentLanguage();
			const rows = (0, react.useMemo)(() => archiveSnapshot.phase === "ready" && archiveSnapshot.state !== "error" ? historyRows(snapshot, query, archiveSnapshot.archivedSessionIds, archivedOnly, Infinity, {
				status,
				kind,
				sort,
				since: period === "all" ? void 0 : Date.now() - Number(period) * 864e5
			}) : [], [
				snapshot,
				query,
				archiveSnapshot,
				archivedOnly,
				status,
				kind,
				sort,
				period,
				language
			]);
			const pagination = paginate(rows, page, pageSize);
			const details = useHistoryDetails(history, pagination.items, detailsRevision);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-history-panel",
				"aria-labelledby": "mayori-history-title",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "mayori-history-header",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
							id: "mayori-history-title",
							children: tr("История чатов")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "mayori-history-controls",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								ref: controlsRef,
								type: "button",
								className: "mayori-secondary-button",
								disabled: refreshing || changingId !== null,
								onClick: () => {
									refresh();
								},
								children: tr("Обновить")
							})
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "mayori-search",
						children: [tr("Поиск по названию или ID чата "), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "search",
							value: query,
							onChange: (event) => {
								setQuery(event.target.value);
							},
							placeholder: tr("Например, имя персонажа")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-history-filters",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [tr("Статус"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
								"aria-label": tr("Статус чатов"),
								value: status,
								disabled: changingId !== null,
								onChange: setStatus,
								options: [
									{
										value: "active",
										label: tr("Без архива")
									},
									{
										value: "archived",
										label: tr("Архив")
									},
									{
										value: "all",
										label: tr("Все чаты")
									}
								]
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [tr("Чаты"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
								"aria-label": tr("Тип чатов"),
								value: kind,
								onChange: setKind,
								options: [
									{
										value: "all",
										label: tr("Все")
									},
									{
										value: "current",
										label: tr("Открытые")
									},
									{
										value: "running",
										label: tr("В работе")
									},
									{
										value: "branches",
										label: tr("Ветки")
									},
									{
										value: "originals",
										label: tr("Без веток")
									}
								]
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [tr("Активность"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
								"aria-label": tr("Период активности"),
								value: period,
								onChange: setPeriod,
								options: [
									{
										value: "all",
										label: tr("За всё время")
									},
									{
										value: "1",
										label: tr("За 24 часа")
									},
									{
										value: "7",
										label: tr("За 7 дней")
									},
									{
										value: "30",
										label: tr("За 30 дней")
									}
								]
							})] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [tr("Сортировка"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
								"aria-label": tr("Сортировка чатов"),
								value: sort,
								onChange: setSort,
								options: [
									{
										value: "recent",
										label: tr("Сначала недавние")
									},
									{
										value: "oldest",
										label: tr("Сначала давние")
									},
									{
										value: "title-asc",
										label: tr("Название: А–Я")
									},
									{
										value: "title-desc",
										label: tr("Название: Я–А")
									}
								]
							})] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: loading ? tr("Загружаем историю…") : notice || tr("Найдено чатов: {p1}", { p1: rows.length })
					}),
					archiveSnapshot.state === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mayori-error",
						children: tr("Не удалось загрузить состояние архива. Проверьте соединение и перезагрузите страницу.")
					}),
					error && !removing && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mayori-error",
						children: noticeText(error)
					}),
					!loading && !error && archiveSnapshot.state !== "error" && rows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: query.trim() || kind !== "all" || period !== "all" ? tr("Чаты не найдены. Измените фильтры или поиск.") : archivedOnly ? tr("В архиве пока нет чатов.") : tr("Чатов пока нет.") }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: "mayori-history-list",
						children: pagination.items.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
							className: "mayori-history-item",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryRow, {
								row,
								detail: details.value[row.id],
								loading: details.loading,
								disabled: changingId === row.id,
								onOpen: open
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-history-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-secondary-button",
									disabled: changingId !== null || archiveSnapshot.state === "error",
									"aria-label": `${row.archived ? tr("Восстановить чат") : tr("В архив — чат")} «${row.title}»`,
									onClick: () => {
										changeArchive(row);
									},
									children: changingId === row.id ? tr("Сохраняем…") : row.archived ? tr("Восстановить") : tr("В архив")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-secondary-button",
									disabled: changingId !== null || archiveSnapshot.state === "error",
									"aria-haspopup": "dialog",
									"aria-label": tr("Удалить чат «{p1}»", { p1: row.title }),
									onClick: (event) => {
										triggerRef.current = event.currentTarget;
										setError(null);
										setRemoving(row);
									},
									children: tr("Удалить")
								})]
							})]
						}, row.id))
					}),
					rows.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pagination, {
						pagination,
						total: rows.length,
						pageSize,
						onPage: setPage,
						onPageSize: setPageSize
					}),
					removing && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
						ref: dialogRef,
						className: "mayori-message-editor mayori-message-confirm",
						"aria-labelledby": dialogTitle,
						onCancel: (event) => {
							event.preventDefault();
							closeRemoval();
						},
						onKeyDown: (event) => event.stopPropagation(),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							onSubmit: remove,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									id: dialogTitle,
									children: tr("Удалить чат «{p1}»?", { p1: removing.title })
								}),
								error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mayori-error",
									children: noticeText(error)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-message-editor-actions",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										autoFocus: true,
										disabled: changingId !== null,
										onClick: closeRemoval,
										children: tr("Отмена")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										disabled: changingId !== null,
										children: changingId !== null ? tr("Удаляем…") : tr("Удалить")
									})]
								})
							]
						})
					}), document.body)
				]
			});
		}
		//#endregion
		//#region src/features/characters/client/catalog-view.js
		/** Browser presentation preferences; no campaign data is persisted here. */
		const COLUMN_OPTIONS = [
			3,
			5,
			7
		];
		const CATALOG_PREFERENCE_KEY = "mayori.characters.view";
		function catalogPreferences(value) {
			return {
				columns: COLUMN_OPTIONS.includes(value?.columns) ? value.columns : 5,
				pageSize: PAGE_SIZE_OPTIONS.includes(value?.pageSize) ? value.pageSize : 20
			};
		}
		function readCatalogPreferences() {
			try {
				return catalogPreferences(JSON.parse(globalThis.localStorage.getItem(CATALOG_PREFERENCE_KEY)));
			} catch {
				return catalogPreferences(null);
			}
		}
		function saveCatalogPreferences(value) {
			try {
				globalThis.localStorage.setItem(CATALOG_PREFERENCE_KEY, JSON.stringify(catalogPreferences(value)));
			} catch {}
		}
		function recentCharacters(cards) {
			return [...cards].sort((a, b) => b.importedAt - a.importedAt || a.id.localeCompare(b.id)).slice(0, 5);
		}
		//#endregion
		//#region src/shared/templates.js
		/** Deterministic subset of SillyTavern macros, shared by Host and previews. */
		const DEFAULT_PERSONA = Object.freeze({
			id: null,
			name: "Игрок",
			description: "",
			avatar: "",
			title: ""
		});
		function renderTemplate(text, character, persona = DEFAULT_PERSONA, timestamp = 0) {
			if (persona.promptSnapshot) persona = {
				...persona,
				description: persona.promptSnapshot.description
			};
			const data = character.data ?? {};
			const date = new Date(timestamp);
			const names = {
				user: persona.name,
				char: character.name,
				charifnotgroup: character.name,
				group: character.name,
				groupnotmuted: character.name,
				notchar: persona.name
			};
			const fields = {
				persona: persona.description,
				description: data.description,
				chardesc: data.description,
				personality: data.personality,
				charpersonality: data.personality,
				scenario: data.scenario,
				charexamples: data.mes_example,
				mesexamples: data.mes_example,
				charexamplesraw: data.mes_example,
				charprompt: data.system_prompt,
				charjailbreak: data.post_history_instructions,
				charversion: data.character_version,
				charcreator: data.creator
			};
			const constants = {
				newline: "\n",
				space: " ",
				noop: "",
				original: "",
				input: "",
				isodate: date.toISOString().slice(0, 10),
				isotime: date.toISOString().slice(11, 19),
				date: date.toISOString().slice(0, 10),
				time: date.toISOString().slice(11, 16),
				weekday: [
					"Sunday",
					"Monday",
					"Tuesday",
					"Wednesday",
					"Thursday",
					"Friday",
					"Saturday"
				][date.getUTCDay()]
			};
			const expand = (value, path = []) => String(value ?? "").replace(/\{\{\/\/[^{}]*\}\}/g, "").replace(/[\t \r\n]*\{\{\s*trim\s*\}\}[\t \r\n]*/gi, "").replace(/\{\{\s*([a-z][a-z0-9]*)\s*\}\}|<USER>|<BOT>/gi, (raw, token) => {
				const key = token?.toLowerCase() ?? (raw.toUpperCase() === "<USER>" ? "user" : "char");
				if (Object.hasOwn(names, key)) return names[key];
				if (Object.hasOwn(constants, key)) return constants[key];
				if (!Object.hasOwn(fields, key)) return raw;
				if (path.includes(key) || path.length >= 12) return "";
				return expand(fields[key], [...path, key]);
			});
			return expand(text);
		}
		//#endregion
		//#region src/features/personas/shared/persona.js
		/** Platform-independent persona blocks, validation and deterministic prompt assembly. */
		const DEFAULT_PROMPT = Object.freeze({
			wrapperEnabled: false,
			wrapperTemplate: "{{PROMPT}}",
			joiner: "\\n\\n"
		});
		function blockActive(block, context = {}) {
			const rule = block.activation;
			if (!rule?.auto) return block.enabled !== false;
			return Boolean(context.sessionId && rule.chatIds?.includes(context.sessionId) || context.characterId && rule.characterIds?.includes(context.characterId) || rule.match?.trim() && context.characterDescription?.toLowerCase().includes(rule.match.trim().toLowerCase()));
		}
		function composePersona(persona, context = {}) {
			const activeIds = [];
			const additions = [];
			for (const block of persona.blocks ?? []) {
				if (!blockActive(block, context)) continue;
				activeIds.push(block.id);
				for (const item of block.type === "group" ? block.items : [block]) {
					if (block.type === "group" && !blockActive(item, context)) continue;
					if (block.type === "group") activeIds.push(item.id);
					if (item.text?.trim()) additions.push(item.text);
				}
			}
			const base = persona.descriptionOverride ?? persona.description ?? "";
			const joiner = (persona.prompt?.joiner ?? DEFAULT_PROMPT.joiner).replace(/\\([nrt\\])/g, (_, key) => ({
				n: "\n",
				r: "\r",
				t: "	",
				"\\": "\\"
			})[key]);
			let description = [...base.trim() ? [base] : [], ...additions].join(joiner);
			if (description.trim() && persona.prompt?.wrapperEnabled) description = persona.prompt.wrapperTemplate.split("{{PROMPT}}").join(description);
			return {
				description,
				activeIds
			};
		}
		/** A selected persona is detached from the catalog, including its activation results. */
		function snapshotPersona(persona, context) {
			if (!persona.blocks && !persona.prompt && persona.descriptionOverride === void 0) return structuredClone(persona);
			return {
				...structuredClone(persona),
				promptSnapshot: {
					...composePersona(persona, context),
					sessionId: context?.sessionId ?? null,
					characterId: context?.characterId ?? null
				}
			};
		}
		function filterPersonas(personas, query = "", sort = "name") {
			const search = query.trim().toLowerCase();
			return personas.filter((persona) => [
				persona.name,
				persona.title,
				persona.description
			].some((value) => value?.toLowerCase().includes(search))).sort((a, b) => sort === "description" ? b.description.length - a.description.length || a.name.localeCompare(b.name, "ru") : sort === "connections" ? (b.characterIds?.length ?? 0) - (a.characterIds?.length ?? 0) || a.name.localeCompare(b.name, "ru") : a.name.localeCompare(b.name, "ru"));
		}
		//#endregion
		//#region src/features/characters/client/gallery.jsx
		/** Full-screen Gallery Consumer for the Host-owned Character Library. */
		const EMPTY_ARRAY = Object.freeze([]);
		function icon(name) {
			const common = {
				width: 20,
				height: 20,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.5,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": true
			};
			if (name === "gallery") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...common,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5z" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "9",
						cy: "9",
						r: "1.5"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5 17 4.5-4.5 3 3 2-2L19 18" })
				]
			});
			if (name === "upload") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...common,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" })]
			});
			if (name === "close") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...common,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m6 6 12 12M18 6 6 18" })
			});
			if (name === "trash") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...common,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" })
			});
			if (name === "search") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...common,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "11",
					cy: "11",
					r: "6.5"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m16 16 4 4" })]
			});
			if (name === "filter") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...common,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 6h16M7 12h10M10 18h4" })
			});
			if (name === "play") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				...common,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m9 7 8 5-8 5z" })
			});
			if (name === "edit") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				...common,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m4 20 4.2-1 10.6-10.6a2 2 0 0 0-2.8-2.8L5.4 16.2z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m14.8 6.8 2.8 2.8" })]
			});
			return null;
		}
		function text$1(value) {
			return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
		}
		function cardTags(card) {
			return Array.isArray(card.data.tags) ? card.data.tags.filter((value) => typeof value === "string" && value.trim() !== "").map((value) => value.trim()) : EMPTY_ARRAY;
		}
		function safeAssetUri(card) {
			const image = imageSource(card.image, "gallery");
			if (image) return image;
			const assets = Array.isArray(card.data.assets) ? card.data.assets : EMPTY_ARRAY;
			const main = assets.find((asset) => asset?.type === "icon" && asset?.name === "main") ?? assets.find((asset) => asset?.type === "icon");
			const uri = typeof main?.uri === "string" ? main.uri : "";
			return /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(uri) ? uri : null;
		}
		function useCardImage(card) {
			const [source, setSource] = (0, react.useState)(() => safeAssetUri(card));
			(0, react.useEffect)(() => {
				if (!(card.image instanceof Blob)) {
					setSource(safeAssetUri(card));
					return;
				}
				const url = URL.createObjectURL(card.image);
				setSource(url);
				return () => {
					URL.revokeObjectURL(url);
				};
			}, [card]);
			return source;
		}
		function CardPortrait({ card, className = "", large = false }) {
			const source = useCardImage(card);
			return source === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `mayori-card-fallback ${className}`,
				"aria-hidden": "true",
				children: card.name.slice(0, 1).toUpperCase()
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
				className,
				src: large ? originalImage(source) ?? source : source,
				alt: tr("Портрет: {p1}", { p1: card.name }),
				loading: "lazy",
				decoding: "async"
			});
		}
		function ImportControl({ busy, inputRef, onFiles, compact = false }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: `mayori-import-button${compact ? " mayori-import-compact" : ""}`,
				"aria-disabled": busy || void 0,
				children: [
					icon("upload"),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: busy ? tr("Импорт…") : tr("Импортировать") }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						ref: inputRef,
						type: "file",
						accept: ".png,.json,image/png,application/json",
						multiple: true,
						disabled: busy,
						onChange: (event) => {
							onFiles(event.currentTarget.files ?? []);
						}
					})
				]
			});
		}
		function CharacterCard({ card, onPlay, onEdit, playBusy, playDisabled }) {
			const tags = cardTags(card).slice(0, 3);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
				className: "mayori-card",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "mayori-card-media",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardPortrait, { card })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-card-body",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-card-heading",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: card.name }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: text$1(card.data.creator) ?? tr("Автор не указан") })]
						}),
						tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: "mayori-tags",
							"aria-label": tr("Теги"),
							children: tags.map((tag, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: tag }, `${tag}-${index}`))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-card-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-card-play",
								disabled: playDisabled,
								"aria-busy": playBusy || void 0,
								onClick: () => {
									onPlay(card, 0);
								},
								children: [icon("play"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: playBusy ? tr("Открываем…") : tr("Играть") })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-card-edit",
								onClick: (event) => {
									onEdit(card, event.currentTarget);
								},
								children: [icon("edit"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Изменить") })]
							})]
						})
					]
				})] })
			});
		}
		function CharacterInfoDialog({ card, onClose, onRemove, triggerRef, onPlay, playDisabled, persona = DEFAULT_PERSONA }) {
			const dialogRef = (0, react.useRef)(null);
			const [greetingIndex, setGreetingIndex] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				setGreetingIndex(0);
			}, [card?.id]);
			(0, react.useEffect)(() => {
				const dialog = dialogRef.current;
				if (dialog === null) return;
				if (card !== null && !dialog.open) dialog.showModal();
				if (card === null && dialog.open) dialog.close();
			}, [card]);
			const finishClose = () => {
				onClose();
				requestAnimationFrame(() => {
					triggerRef.current?.focus();
				});
			};
			if (card === null) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
				ref: dialogRef,
				className: "mayori-character-dialog",
				onClose: finishClose
			});
			const sections = [
				[tr("Описание"), text$1(card.data.description)],
				[tr("Характер"), text$1(card.data.personality)],
				[tr("Сценарий"), text$1(card.data.scenario)],
				[tr("Первое сообщение"), text$1(card.data.first_mes)],
				[tr("Пример диалога"), text$1(card.data.mes_example)],
				[tr("Заметки автора"), text$1(card.data.creator_notes)]
			].filter(([, value]) => value !== null);
			const tags = cardTags(card);
			const greetings = [card.data.first_mes ?? "", ...card.data.alternate_greetings ?? []];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
				ref: dialogRef,
				className: "mayori-character-dialog",
				"aria-labelledby": "mayori-character-title",
				onClose: finishClose,
				onCancel: (event) => {
					event.preventDefault();
					dialogRef.current?.close();
				},
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-character-shell",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "mayori-character-header",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: "mayori-character-title",
								children: card.name
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: text$1(card.data.creator) ?? tr("Автор не указан") })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
								portal: false,
								className: "mayori-icon-action",
								label: tr("Закрыть информацию"),
								onClick: () => {
									dialogRef.current?.close();
								},
								children: icon("close")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-character-content",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "mayori-character-portrait",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CardPortrait, {
									card,
									large: true
								})
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-character-details",
								children: [
									tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: "mayori-tags",
										"aria-label": tr("Теги"),
										children: tags.map((tag, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: tag }, `${tag}-${index}`))
									}),
									card.warnings?.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-card-warning",
										children: card.warnings.join(" ")
									}),
									onPlay && greetings.length > 1 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-character-opening",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-filter-control",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Начало истории") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
												"aria-label": tr("Начало истории"),
												value: greetingIndex,
												disabled: playDisabled,
												portal: false,
												onChange: (value) => setGreetingIndex(Number(value)),
												options: greetings.map((greeting, index) => ({
													value: index,
													label: index === 0 ? greeting.trim() ? tr("Основное приветствие") : tr("Без приветствия") : tr("Альтернатива {p1}", { p1: index })
												}))
											})]
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
											className: "mayori-greeting-preview",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: tr("Приветствие") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: renderTemplate(greetings[greetingIndex] ?? "", card, persona, Date.now()) || tr("История начнётся с вашего сообщения.") })]
										})]
									}),
									sections.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dl", { children: sections.map(([label, value]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: value })] }, label)) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-character-empty",
										children: tr("У этой карточки нет дополнительного описания.")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
										className: "mayori-character-meta",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: tr("Файл") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: card.sourceName })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: tr("Добавлен") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: new Intl.DateTimeFormat(formatLocale(), {
											dateStyle: "medium",
											timeStyle: "short"
										}).format(card.importedAt) })] })]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
							className: "mayori-character-footer",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-danger-button",
								onClick: () => {
									onRemove(card, dialogRef.current);
								},
								children: [icon("trash"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Удалить персонажа") })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-character-footer-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-secondary-button",
									onClick: () => {
										dialogRef.current?.close();
									},
									children: tr("Закрыть")
								}), onPlay && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-secondary-button mayori-card-play",
									disabled: playDisabled,
									onClick: () => {
										dialogRef.current?.close();
										onPlay(card, greetingIndex);
									},
									children: tr("Играть")
								})]
							})]
						})
					]
				})
			});
		}
		function Filters({ facets, query, setQuery, sort, setSort, creator, setCreator, portrait, setPortrait, selectedTags, setSelectedTags, onReset }) {
			const creators = facets?.creators ?? EMPTY_ARRAY;
			const tags = facets?.tags ?? EMPTY_ARRAY;
			const toggleTag = (tag) => {
				setSelectedTags(selectedTags.includes(tag) ? selectedTags.filter((value) => value !== tag) : [...selectedTags, tag]);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-filter-fields",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "mayori-search",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Поиск") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "mayori-search-control",
							children: [icon("search"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "search",
								value: query,
								placeholder: tr("Имя, автор, описание"),
								onChange: (event) => {
									setQuery(event.currentTarget.value);
								}
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-filter-control",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Сортировка") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": tr("Сортировка"),
							value: sort,
							onChange: setSort,
							options: [
								{
									value: "newest",
									label: tr("Сначала новые")
								},
								{
									value: "name",
									label: tr("По имени")
								},
								{
									value: "creator",
									label: tr("По автору")
								}
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-filter-control",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Автор") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": tr("Автор"),
							value: creator,
							onChange: setCreator,
							options: [{
								value: "all",
								label: tr("Все авторы")
							}, ...creators.map((value) => ({
								value,
								label: value
							}))]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
						className: "mayori-filter-group",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: tr("Портрет") }), [
							["all", tr("Все")],
							["with", tr("С портретом")],
							["without", tr("Без портрета")]
						].map(([value, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "radio",
							name: "mayori-portrait",
							value,
							checked: portrait === value,
							onChange: () => {
								setPortrait(value);
							}
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })] }, value))]
					}),
					tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
						className: "mayori-filter-group mayori-tag-filter",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: tr("Теги") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { children: tags.map(([tag, count]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: selectedTags.includes(tag),
								onChange: () => {
									toggleTag(tag);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tag }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: count })
						] }, tag)) })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mayori-reset-button",
						onClick: onReset,
						children: tr("Сбросить фильтры")
					})
				]
			});
		}
		function CharacterGalleryPanel({ library, personas, startCharacter }) {
			const personaSnapshot = (0, react.useSyncExternalStore)(personas.subscribe, personas.getSnapshot, personas.getSnapshot);
			const inputRef = (0, react.useRef)(null);
			const detailTriggerRef = (0, react.useRef)(null);
			const catalog = (0, react.useMemo)(() => library.gallery(), [library]);
			const snapshot = (0, react.useSyncExternalStore)(catalog.subscribe, catalog.getSnapshot, catalog.getSnapshot);
			const [query, setQuery] = (0, react.useState)("");
			const [sort, setSort] = (0, react.useState)("newest");
			const [creator, setCreator] = (0, react.useState)("all");
			const [portrait, setPortrait] = (0, react.useState)("all");
			const [selectedTags, setSelectedTags] = (0, react.useState)([]);
			const [filtersOpen, setFiltersOpen] = (0, react.useState)(false);
			const [selectedCard, setSelectedCard] = (0, react.useState)(null);
			const persona = snapshotPersona(personaSnapshot.personas.find((item) => item.characterIds?.includes(selectedCard?.id)) ?? personaSnapshot.personas.find((item) => item.id === personaSnapshot.defaultId) ?? DEFAULT_PERSONA, {
				characterId: selectedCard?.id,
				characterDescription: selectedCard?.data?.description
			});
			const [busy, setBusy] = (0, react.useState)(false);
			const [playingId, setPlayingId] = (0, react.useState)(null);
			const [notice, setNotice] = (0, react.useState)(null);
			const [preferences, setPreferences] = (0, react.useState)(readCatalogPreferences);
			const [page, setPage] = (0, react.useState)(1);
			const mainRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				saveCatalogPreferences(preferences);
			}, [preferences]);
			(0, react.useEffect)(() => {
				setPage(1);
			}, [
				query,
				sort,
				creator,
				portrait,
				selectedTags,
				preferences.pageSize
			]);
			(0, react.useEffect)(() => {
				const timeout = setTimeout(() => catalog.setQuery({
					query,
					sort,
					creator,
					portrait,
					tags: selectedTags,
					page,
					pageSize: preferences.pageSize
				}), query ? 150 : 0);
				return () => clearTimeout(timeout);
			}, [
				catalog,
				query,
				sort,
				creator,
				portrait,
				selectedTags,
				page,
				preferences.pageSize
			]);
			const cards = snapshot.cards;
			const pagination = {
				...paginate([], snapshot.page, preferences.pageSize),
				items: cards,
				page: snapshot.page,
				pages: Math.max(1, Math.ceil(snapshot.filteredTotal / preferences.pageSize)),
				start: cards.length ? (snapshot.page - 1) * preferences.pageSize : 0,
				end: Math.min(snapshot.filteredTotal, snapshot.page * preferences.pageSize)
			};
			(0, react.useEffect)(() => {
				mainRef.current?.scrollTo({ top: 0 });
			}, [pagination.page]);
			const importFiles = async (fileList) => {
				if (fileList.length === 0) return;
				setBusy(true);
				setNotice(null);
				try {
					const result = await library.importFiles(fileList);
					setNotice({
						kind: result.rejected.length > 0 ? "error" : "success",
						imported: result.imported,
						rejected: result.rejected
					});
				} catch (error) {
					setNotice({
						kind: "error",
						text: error instanceof Error ? error.message : String(error)
					});
				} finally {
					setBusy(false);
					if (inputRef.current !== null) inputRef.current.value = "";
				}
			};
			const remove = async (card, infoDialog) => {
				if (!window.confirm(tr("Удалить персонажа «{p1}» из галереи?", { p1: card.name }))) return;
				try {
					await library.remove(card.id);
					infoDialog?.close();
					setNotice({
						kind: "success",
						text: tr("Персонаж «{p1}» удалён.", { p1: card.name })
					});
				} catch (error) {
					setNotice({
						kind: "error",
						text: error instanceof Error ? error.message : String(error)
					});
				}
			};
			const play = async (card, greetingIndex) => {
				setPlayingId(card.id);
				setNotice(null);
				try {
					await startCharacter(card, greetingIndex);
				} catch (error) {
					setNotice({
						kind: "error",
						text: error instanceof Error ? error.message : String(error)
					});
				} finally {
					setPlayingId(null);
				}
			};
			const resetFilters = () => {
				setQuery("");
				setSort("newest");
				setCreator("all");
				setPortrait("all");
				setSelectedTags([]);
			};
			const detailRevision = (0, react.useRef)(0);
			(0, react.useEffect)(() => () => {
				++detailRevision.current;
			}, []);
			const showDetails = async (item, trigger) => {
				detailTriggerRef.current = trigger;
				const revision = ++detailRevision.current;
				try {
					const card = await library.get(item.id);
					if (revision === detailRevision.current) setSelectedCard(card);
				} catch (error) {
					if (revision === detailRevision.current) setNotice({
						kind: "error",
						text: error.message
					});
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: "mayori-gallery-panel",
				"aria-labelledby": "mayori-gallery-title",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-gallery-shell",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "mayori-gallery-header",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-gallery-title",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: "mayori-gallery-title",
								children: tr("Персонажи")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: snapshot.status === "ready" ? tr("{p1} в галерее{p2}", {
								p1: snapshot.total,
								p2: snapshot.indexing ? tr(" · Обновляем каталог…") : ""
							}) : snapshot.status === "error" ? tr("Не удалось загрузить галерею") : tr("Загрузка…") })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-gallery-header-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-filter-toggle",
								"aria-controls": "mayori-filter-panel",
								"aria-expanded": filtersOpen,
								onClick: () => {
									setFiltersOpen((value) => !value);
								},
								children: [icon("filter"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Фильтры") })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImportControl, {
								busy,
								inputRef,
								onFiles: importFiles,
								compact: true
							})]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-gallery-workspace",
						children: [
							filtersOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "mayori-filter-scrim",
								"aria-label": tr("Закрыть фильтры"),
								onClick: () => {
									setFiltersOpen(false);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
								id: "mayori-filter-panel",
								className: `mayori-filter-panel${filtersOpen ? " is-open" : ""}`,
								"aria-label": tr("Фильтры персонажей"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-filter-panel-header",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: tr("Фильтры") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mayori-icon-action",
											"aria-label": tr("Закрыть фильтры"),
											onClick: () => {
												setFiltersOpen(false);
											},
											children: icon("close")
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImportControl, {
										busy,
										inputRef,
										onFiles: importFiles
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Filters, {
										facets: snapshot.facets,
										query,
										setQuery,
										sort,
										setSort,
										creator,
										setCreator,
										portrait,
										setPortrait,
										selectedTags,
										setSelectedTags,
										onReset: resetFilters
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
								ref: mainRef,
								className: "mayori-gallery-main",
								id: "mayori-gallery-content",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-gallery-results",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											role: "status",
											"aria-live": "polite",
											children: snapshot.status === "ready" ? tr("Найдено {p1} из {p2}", {
												p1: snapshot.filteredTotal,
												p2: snapshot.total
											}) : ""
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-column-control mayori-filter-control",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Карточек в ряд") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
												"aria-label": tr("Карточек в ряд"),
												value: preferences.columns,
												onChange: (columns) => setPreferences((previous) => ({
													...previous,
													columns: Number(columns)
												})),
												options: COLUMN_OPTIONS.map((columns) => ({
													value: columns,
													label: columns
												}))
											})]
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "mayori-gallery-notice",
										role: "status",
										"aria-live": "polite",
										children: notice !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: notice.kind === "error" ? "mayori-error" : "mayori-success",
											children: notice.text !== void 0 ? noticeText(notice.text) : [notice.imported > 0 ? tr("Импортировано: {p1}.", { p1: notice.imported }) : "", ...notice.rejected.map((item) => `${item.name}: ${noticeText(item.error)}`)].filter(Boolean).join(" ")
										})
									}),
									snapshot.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										role: "alert",
										className: "mayori-error",
										children: [
											noticeText(snapshot.error),
											" ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "mayori-secondary-button",
												disabled: busy,
												onClick: () => {
													catalog.refresh().catch(() => {});
												},
												children: tr("Повторить загрузку")
											})
										]
									}),
									snapshot.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-empty",
										children: tr("Загружаем галерею…")
									}),
									snapshot.status === "ready" && cards.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-empty",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "mayori-empty-icon",
												children: icon("gallery")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: snapshot.total === 0 ? tr("Персонажей пока нет") : tr("Ничего не найдено") }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: snapshot.total === 0 ? tr("Импортируйте PNG или JSON, чтобы добавить первого персонажа.") : tr("Измените запрос или сбросьте фильтры.") })
										]
									}),
									cards.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: "mayori-card-grid",
										style: { "--mayori-columns": preferences.columns },
										children: pagination.items.map((card) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterCard, {
											card,
											onPlay: play,
											playBusy: playingId === card.id,
											playDisabled: playingId !== null,
											onEdit: showDetails
										}, card.id))
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Pagination, {
										pagination,
										total: snapshot.filteredTotal,
										pageSize: preferences.pageSize,
										onPage: setPage,
										onPageSize: (pageSize) => {
											setPreferences((value) => ({
												...value,
												pageSize
											}));
										}
									})] })
								]
							})
						]
					})]
				})
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterInfoDialog, {
				card: selectedCard,
				onClose: () => {
					setSelectedCard(null);
				},
				onRemove: remove,
				triggerRef: detailTriggerRef,
				persona,
				onPlay: play,
				playDisabled: playingId !== null
			})] });
		}
		/** The sidebar shell owns the actual button, label, tooltip and selected state. */
		function CharacterGalleryIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "4",
						y: "4",
						width: "16",
						height: "16",
						rx: "2"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "9",
						cy: "9",
						r: "1.5"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5 17 4.5-4.5 3 3 2-2L19 18" })
				]
			});
		}
		//#endregion
		//#region src/features/character-session/client/start.js
		/** Browser orchestration from a gallery card to a selected chat session. */
		function targetWorkspace(sessions, workspaces, sourceSessionId) {
			const current = sourceSessionId ?? Object.values(sessions.list.getSnapshot().byId).find((item) => item.retainedBy?.mainView > 0)?.id;
			const snapshot = workspaces.list.getSnapshot();
			return (current === void 0 ? void 0 : snapshot.items.find((item) => item.sessionIds.includes(current))?.workspaceId) ?? snapshot.items[0]?.workspaceId;
		}
		/** Create a fresh workspace session, bind the card, name it, and navigate. */
		async function startCharacterSession({ sessions, workspaces, uiWorkspace, library, sourceSessionId }, card, greetingIndex = 0) {
			let workspaceId = targetWorkspace(sessions, workspaces, sourceSessionId);
			if (workspaceId === void 0) {
				const campaign = await library.prepareCampaign();
				workspaceId = (await workspaces.create({ path: campaign.path })).workspaceId;
			}
			const { sessionId } = await library.start(card.id, workspaceId, greetingIndex);
			await sessions.refresh();
			await sessions.using(sessionId, { source: "mayoriGallery" }, async (reference) => {
				const renamed = await (await reference.ready).session.rename(card.name);
				if (!renamed.ok) throw new Error(renamed.error.message);
				uiWorkspace.openSession(sessionId);
			});
			return sessionId;
		}
		//#endregion
		//#region src/client/infrastructure/slot-mirror.js
		/** Reuse child contributions without claiming their original declarations. */
		function mirroredChildren(children, prefix) {
			return Object.fromEntries(Object.entries(children ?? {}).map(([name, spec]) => [`${prefix}.${name}`, spec]));
		}
		function remapChildProps(props, children, prefix) {
			const key = (name) => Object.hasOwn(children ?? {}, name) ? `${prefix}.${name}` : name;
			return {
				...props,
				...props.renderSlot ? { renderSlot: (name, owner, options) => props.renderSlot(key(name), owner, options) } : {},
				...props.renderSlotChain ? { renderSlotChain: (name, owner, options) => props.renderSlotChain(key(name), owner, options) } : {}
			};
		}
		/** Mirror public entries, injections and nested children into an owned child seat. */
		function mirrorSlot(ctx, original, alias) {
			const records = /* @__PURE__ */ new Map();
			const remove = (record) => {
				for (const dispose of record.children) dispose();
				record.dispose();
			};
			const sync = () => {
				const entries = ctx.slots.entries(original);
				for (const [entry, record] of records) if (!entries.includes(entry)) {
					records.delete(entry);
					remove(record);
				}
				for (const entry of entries) {
					if (records.has(entry)) continue;
					const Component = entry.component;
					const children = mirroredChildren(entry.children, alias);
					const record = {
						children: [],
						dispose: () => {}
					};
					records.set(entry, record);
					record.dispose = ctx.slots.register({
						name: alias,
						...entry.options,
						inject: entry.inject,
						locale: entry.locale,
						store: entry.store,
						select: entry.select,
						...Object.keys(children).length ? { children } : {}
					}, (props) => (0, react.createElement)(Component, remapChildProps(props, entry.children, alias)));
					record.children = Object.keys(entry.children ?? {}).map((name) => mirrorSlot(ctx, name, `${alias}.${name}`));
				}
			};
			const unsubscribe = ctx.slots.subscribe(original, sync);
			sync();
			return () => {
				unsubscribe();
				for (const record of records.values()) remove(record);
				records.clear();
			};
		}
		//#endregion
		//#region src/client/shell/sidebar.jsx
		/** Mayori-owned replacement for the stock workspace/coding sidebar region. */
		function MayoriMark({ className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className,
				width: "24",
				height: "24",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M17.75 4.9a7.85 7.85 0 1 0 1.35 12.55A8.8 8.8 0 0 1 9.4 5.7a7.8 7.8 0 0 1 8.35-.8Z",
					fill: "currentColor"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "m16.5 7.25.55 1.55 1.55.55-1.55.55-.55 1.55-.55-1.55-1.55-.55 1.55-.55.55-1.55Z",
					fill: "currentColor"
				})]
			});
		}
		function MayoriBrandName() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Mayori Engine" });
		}
		/** Workspace-region occupant. Settings retains its own public slot. */
		function MayoriSidebar() {
			return null;
		}
		/** The fully hidden desktop sidebar only needs its expand control. */
		function MayoriLeadingControls({ toggleSidebar, useShortcuts, t }) {
			const shortcut = useShortcuts((rows) => rows.find((row) => row.id === "sidebar.left.toggle"));
			const label = t("toggle.open");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
				className: "mayori-navigation-toggle",
				label,
				side: "right",
				delayMs: 500,
				shortcutKeys: shortcut?.keys,
				"aria-keyshortcuts": shortcut?.aria,
				onClick: () => toggleSidebar(),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					width: "18",
					height: "18",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.5",
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
						x: "3",
						y: "4",
						width: "18",
						height: "16",
						rx: "3"
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 4v16" })]
				})
			});
		}
		/** Each panel subscribes to selection through the sidebar's public runtime. */
		function NavigationRow({ id, label, wide, usePanelInfo, selectPanel, renderSlot }) {
			const active = usePanelInfo((info) => info.activePanelId === id);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label,
				side: "right",
				delayMs: 500,
				disabled: wide,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mayori-navigation-row",
					"aria-label": label,
					"aria-current": active ? "page" : void 0,
					onClick: () => selectPanel(id),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "mayori-navigation-glyph",
						"aria-hidden": "true",
						children: renderSlot("sidebar.panellist", {
							size: wide ? 16 : 18,
							active
						}, { only: id })
					}), wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "mayori-navigation-label",
						children: label
					})]
				})
			});
		}
		/** Public sidebar consumer: home navigation without a generic New Session action. */
		function MayoriNavigationSidebar(props) {
			const { stockChildren, childPrefix } = props;
			const { collapsed, width, openHome, toggleSidebar, selectPanel, usePanels, usePanelInfo, useShortcuts, t, renderSlot } = remapChildProps(props, stockChildren, childPrefix);
			const panels = usePanels((snapshot) => snapshot);
			const shortcut = useShortcuts((rows) => rows.find((row) => row.id === "sidebar.left.toggle"));
			const wide = !collapsed;
			const toggleLabel = t(collapsed ? "toggle.open" : "toggle.collapse");
			const toggleSide = globalThis.document?.documentElement?.hasAttribute("data-windows-titlebar") ? "bottom" : "right";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-navigation",
				"data-collapsed": collapsed,
				style: wide ? { width } : void 0,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-navigation-header",
						"data-window-drag": true,
						children: [wide && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mayori-navigation-brand",
							onClick: openHome,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								children: renderSlot("sidebar.brand.mark", { size: 24 })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-navigation-name",
								children: renderSlot("sidebar.brand.name", {})
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(IconButton, {
							className: "mayori-navigation-toggle",
							label: toggleLabel,
							side: toggleSide,
							delayMs: 500,
							shortcutKeys: shortcut?.keys,
							"aria-keyshortcuts": shortcut?.aria,
							onClick: () => toggleSidebar(),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
								width: "18",
								height: "18",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "1.5",
								"aria-hidden": "true",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("rect", {
									x: "3",
									y: "4",
									width: "18",
									height: "16",
									rx: "3"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 4v16" })]
							}), !wide && renderSlot("sidebar.toggle.badge", {})]
						})]
					}),
					panels.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
						className: "mayori-navigation-panels",
						"aria-label": t("panels.label"),
						children: panels.map(({ id, label }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NavigationRow, {
							id,
							label,
							wide,
							usePanelInfo,
							selectPanel,
							renderSlot
						}, id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-navigation-region",
						children: renderSlot("sidebar.workspaces", {
							wide,
							expandSidebar: () => {
								if (collapsed) toggleSidebar();
							}
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-navigation-footer",
						children: [renderSlot("sidebar.footer.action", { wide }), renderSlot("sidebar.settings", { wide })]
					})
				]
			});
		}
		//#endregion
		//#region src/features/personas/client/personas.js
		var PersonaService = class {
			getSnapshot() {
				throw new Error("PersonaService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("PersonaService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("PersonaService.refresh() is not implemented");
			}
			save() {
				throw new Error("PersonaService.save() is not implemented");
			}
			remove() {
				throw new Error("PersonaService.remove() is not implemented");
			}
			setDefault() {
				throw new Error("PersonaService.setDefault() is not implemented");
			}
		};
		var RemotePersonaProvider = class extends PersonaService {
			draft = null;
			#snapshot = {
				status: "loading",
				personas: [],
				defaultId: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#loading ??= this.refresh().catch(() => {});
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh() {
				const revision = ++this.#revision;
				try {
					const value = await call("persona-list", {});
					if (revision === this.#revision) this.#publish({
						...value,
						status: "ready",
						error: null
					});
				} catch (error) {
					if (revision === this.#revision) this.#publish({
						...this.#snapshot,
						status: "error",
						error: error.message
					});
					throw error;
				}
			}
			async save(persona) {
				const result = await call("persona-save", persona);
				await this.refresh();
				return result;
			}
			async remove(id) {
				await call("persona-remove", { id });
				await this.refresh();
			}
			async setDefault(id) {
				await call("persona-default", { id });
				await this.refresh();
			}
		};
		//#endregion
		//#region src/features/character-session/client/chat.js
		/** Observable per-chat consumer of the Host Character Session capability. */
		var CharacterChatService = class {
			getSnapshot() {
				throw new Error("CharacterChatService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("CharacterChatService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("CharacterChatService.refresh() is not implemented");
			}
			swipe() {
				throw new Error("CharacterChatService.swipe() is not implemented");
			}
			setPersona() {
				throw new Error("CharacterChatService.setPersona() is not implemented");
			}
		};
		var RemoteCharacterChatProvider = class extends CharacterChatService {
			#snapshot = {
				status: "loading",
				value: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			#changing = false;
			#controller;
			constructor(sessionId) {
				super();
				this.sessionId = sessionId;
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#loading ??= this.refresh();
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh() {
				if (this.#changing) return;
				const revision = ++this.#revision;
				this.#controller?.abort();
				const controller = this.#controller = new AbortController();
				try {
					const value = await call("session-state", { sessionId: this.sessionId }, { signal: controller.signal });
					if (revision === this.#revision) this.#publish({
						status: "ready",
						value,
						error: null
					});
				} catch (error) {
					if (revision === this.#revision) this.#publish({
						...this.#snapshot,
						status: "error",
						error: error.message
					});
				}
			}
			async #change(endpoint, input) {
				if (this.#changing) throw new Error(tr("Дождитесь сохранения текущего выбора."));
				this.#changing = true;
				++this.#revision;
				this.#publish({
					...this.#snapshot,
					status: "saving",
					error: null
				});
				try {
					const value = await call(endpoint, {
						sessionId: this.sessionId,
						...input
					});
					++this.#revision;
					this.#publish({
						status: "ready",
						value,
						error: null
					});
					return value;
				} catch (error) {
					this.#changing = false;
					await this.refresh();
					this.#publish({
						...this.#snapshot,
						error: error.message
					});
					throw error;
				} finally {
					this.#changing = false;
				}
			}
			swipe(index) {
				return this.#change("swipe", { index });
			}
			setPersona(personaId) {
				return this.#change("session-persona", { personaId });
			}
			dispose() {
				++this.#revision;
				this.#controller?.abort();
				this.#snapshot = {
					status: "loading",
					value: null,
					error: null
				};
				this.#loading = void 0;
			}
		};
		//#endregion
		//#region src/features/personas/client/editing.js
		const emptyPersona = () => ({
			name: "",
			title: "",
			description: "",
			avatar: "",
			blocks: [],
			prompt: { ...DEFAULT_PROMPT },
			characterIds: [],
			descriptionOverride: null
		});
		const personaDraft = (persona) => ({
			...emptyPersona(),
			...structuredClone(persona ?? {})
		});
		const personaChanged = (draft, saved) => JSON.stringify(personaDraft(draft)) !== JSON.stringify(personaDraft(saved));
		/** Updates preserve prompt order and the single group level. */
		function updatePersonaNode(blocks, id, patch) {
			return blocks.map((node) => node.id === id ? {
				...node,
				...patch
			} : node.type === "group" ? {
				...node,
				items: updatePersonaNode(node.items, id, patch)
			} : node);
		}
		function removePersonaNode(blocks, id) {
			return blocks.filter((node) => node.id !== id).map((node) => node.type === "group" ? {
				...node,
				items: removePersonaNode(node.items, id)
			} : node);
		}
		function movePersonaNode(blocks, id, offset) {
			const index = blocks.findIndex((node) => node.id === id);
			if (index < 0) return blocks.map((node) => node.type === "group" ? {
				...node,
				items: movePersonaNode(node.items, id, offset)
			} : node);
			const target = index + offset;
			if (target < 0 || target >= blocks.length) return blocks;
			const next = [...blocks];
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		}
		/** Browser-only drafts survive library switches and panel unmounts. */
		var PersonaDrafts = class {
			#values = /* @__PURE__ */ new Map();
			remember(draft) {
				this.#values.set(draft.id ?? ":new", structuredClone(draft));
			}
			open(saved) {
				return personaDraft(this.#values.get(saved?.id ?? ":new") ?? saved);
			}
			forget(id) {
				this.#values.delete(id ?? ":new");
			}
			changed(saved) {
				const draft = this.#values.get(saved?.id ?? ":new");
				return !!draft && personaChanged(draft, saved);
			}
		};
		//#endregion
		//#region src/features/personas/client/blocks.jsx
		const newNode = (type) => ({
			id: crypto.randomUUID(),
			type,
			title: "",
			enabled: true,
			activation: {
				auto: false,
				chatIds: [],
				characterIds: [],
				match: ""
			},
			...type === "group" ? { items: [] } : { text: "" }
		});
		function BlockIcon({ group }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "18",
				height: "18",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: group ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 7V5h7l2 3h9v12H3V7Z" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5 3h10l4 4v14H5V3Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9 11h6M9 15h6" })] })
			});
		}
		function MoveIcon({ down }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "18",
				height: "18",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: down ? "M12 4v16M6 14l6 6 6-6" : "M12 20V4M6 10l6-6 6 6" })
			});
		}
		function PersonaBlocks({ blocks, onChange, selectedId, onSelect: select, disabled, context = {} }) {
			const entries = blocks.flatMap((node, index) => [{
				node,
				index,
				siblings: blocks
			}, ...node.type === "group" ? node.items.map((child, childIndex) => ({
				node: child,
				index: childIndex,
				siblings: node.items,
				parent: node
			})) : []]);
			const selected = entries.find((entry) => entry.node.id === selectedId) ?? entries[0];
			const block = selected?.node;
			const rule = block?.activation;
			const change = (patch) => onChange(updatePersonaNode(blocks, block.id, patch));
			const activate = (patch) => change({ activation: {
				...rule,
				...patch
			} });
			const add = (type, parent) => {
				const node = newNode(type);
				onChange(parent ? updatePersonaNode(blocks, parent.id, { items: [...parent.items, node] }) : [...blocks, node]);
				select(node.id);
			};
			const bind = (key, id) => {
				if (id) activate({ [key]: [.../* @__PURE__ */ new Set([...rule[key], id])] });
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-persona-block-workspace",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
					className: "mayori-persona-block-outline",
					"aria-label": tr("Список блоков"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-persona-block-add",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled,
								onClick: () => add("item"),
								children: tr("Добавить блок")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled,
								onClick: () => add("group"),
								children: tr("Добавить группу")
							})]
						}),
						!!entries.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "mayori-persona-block-select",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
								"aria-label": tr("Выбрать блок"),
								value: block.id,
								disabled,
								onChange: select,
								options: entries.map(({ node, parent }) => ({
									value: node.id,
									label: `${parent ? `${parent.title || tr("Группа")} / ` : ""}${node.title || (node.type === "group" ? tr("Новая группа") : tr("Новый блок"))}`
								}))
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", {
							className: "mayori-persona-block-list",
							children: entries.map(({ node, parent }) => {
								const active = blockActive(node, context) && (!parent || blockActive(parent, context));
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
									"data-nested": !!parent,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled,
										"aria-pressed": block?.id === node.id,
										onClick: () => select(node.id),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-persona-node-kind",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BlockIcon, { group: node.type === "group" })
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: node.title || (node.type === "group" ? tr("Новая группа") : tr("Новый блок")) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
											node.activation.auto ? tr("Авто · ") : "",
											active ? tr("Включён") : tr("Выключен"),
											node.type === "group" ? ` · ${node.items.length}` : ""
										] })] })]
									})
								}, node.id);
							})
						}),
						!entries.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "mayori-persona-empty",
							children: tr("Добавьте одежду, биографию или детали сцены отдельным блоком.")
						})
					]
				}), block ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-persona-block-inspector",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-persona-block-toolbar",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "mayori-persona-check",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										disabled: disabled || rule.auto,
										checked: block.enabled,
										onChange: (event) => change({ enabled: event.target.checked })
									}), tr("Включён")]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
									label: tr("Переместить выше"),
									portal: true,
									disabled: disabled || selected.index === 0,
									onClick: () => onChange(movePersonaNode(blocks, block.id, -1)),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MoveIcon, {})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
									label: tr("Переместить ниже"),
									portal: true,
									disabled: disabled || selected.index === selected.siblings.length - 1,
									onClick: () => onChange(movePersonaNode(blocks, block.id, 1)),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MoveIcon, { down: true })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled,
									onClick: () => {
										const next = entries[entries.indexOf(selected) + 1]?.node.id;
										onChange(removePersonaNode(blocks, block.id));
										select(next ?? null);
									},
									children: tr("Удалить {p1}", { p1: block.type === "group" ? tr("группу") : tr("блок") })
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [block.type === "group" ? tr("Название группы") : tr("Название блока"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							maxLength: 200,
							disabled,
							value: block.title,
							onChange: (event) => change({ title: event.target.value })
						})] }),
						block.type === "item" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: "mayori-persona-long-text",
							children: [tr("Текст блока"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								rows: 10,
								maxLength: 32e3,
								disabled,
								value: block.text,
								onChange: (event) => change({ text: event.target.value })
							})]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-persona-group-content",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("Блоков в группе: {p1}", { p1: block.items.length }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled,
								onClick: () => add("item", block),
								children: tr("Добавить блок в группу")
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
							className: "mayori-persona-activation",
							open: rule.auto,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: tr("Автоматическая активация") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "mayori-persona-check",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										disabled,
										checked: rule.auto,
										onChange: (event) => activate({ auto: event.target.checked })
									}), tr("Включать по условиям")]
								}),
								rule.auto && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [tr("Текст в описании персонажа"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										disabled,
										maxLength: 500,
										value: rule.match,
										onChange: (event) => activate({ match: event.target.value })
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-persona-actions",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: disabled || !context.sessionId,
											onClick: () => bind("chatIds", context.sessionId),
											children: tr("Добавить текущий чат")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: disabled || !context.characterId,
											onClick: () => bind("characterIds", context.characterId),
											children: tr("Добавить текущего персонажа")
										})]
									}),
									["chatIds", "characterIds"].map((key) => rule[key].map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-persona-binding",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
											key === "chatIds" ? tr("Чат") : tr("Персонаж"),
											": ",
											id === context[key === "chatIds" ? "sessionId" : "characterId"] ? key === "characterIds" ? context.characterName || tr("текущий") : tr("текущий") : id
										] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											disabled,
											onClick: () => activate({ [key]: rule[key].filter((value) => value !== id) }),
											children: tr("Убрать")
										})]
									}, key + id))),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-persona-hint",
										children: tr("Достаточно любого условия.")
									})
								] })
							]
						})
					]
				}, block.id) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-persona-block-placeholder",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							"aria-hidden": "true",
							children: "≡"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: tr("Дополнения к описанию") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("Включайте нужные детали и собирайте их в группы.") })
					]
				})]
			});
		}
		//#endregion
		//#region src/features/personas/client/panel.jsx
		const personaTabs = () => [
			["description", tr("Описание")],
			["blocks", tr("Блоки")],
			["settings", tr("Настройки")],
			["preview", tr("Предпросмотр")]
		];
		function PersonaIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "7",
					r: "4"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4 21v-2a8 8 0 0 1 16 0v2" })]
			});
		}
		function PersonaPanel({ personas, sessions, chatFor }) {
			const tabs = personaTabs();
			const snapshot = (0, react.useSyncExternalStore)(personas.subscribe, personas.getSnapshot, personas.getSnapshot);
			const catalog = (0, react.useSyncExternalStore)(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot);
			const currentId = catalog.ids.find((id) => catalog.byId[id]?.retainedBy?.mainView > 0);
			const drafts = (0, react.useRef)(personas.drafts ??= new PersonaDrafts()).current;
			const [draft, setDraft] = (0, react.useState)(() => personaDraft(personas.draft));
			(0, react.useEffect)(() => {
				personas.draft = draft;
				drafts.remember(draft);
			}, [
				draft,
				personas,
				drafts
			]);
			const initialSelection = (0, react.useRef)(!!personas.draft);
			(0, react.useEffect)(() => {
				if (!initialSelection.current && snapshot.status === "ready") {
					initialSelection.current = true;
					setDraft(drafts.open(snapshot.personas.find((persona) => persona.id === snapshot.defaultId) ?? snapshot.personas[0]));
				}
			}, [snapshot, drafts]);
			const [tab, setTab] = (0, react.useState)("description");
			const [nodeId, setNodeId] = (0, react.useState)(null);
			const [libraryOpen, setLibraryOpen] = (0, react.useState)(false);
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const [notice, setNotice] = (0, react.useState)("");
			const nameRef = (0, react.useRef)(null);
			const imageRef = (0, react.useRef)(null);
			const formRef = (0, react.useRef)(null);
			const pending = (0, react.useRef)(false);
			const [currentPersona, setCurrentPersona] = (0, react.useState)(null);
			const [context, setContext] = (0, react.useState)({});
			const [query, setQuery] = (0, react.useState)("");
			const [sort, setSort] = (0, react.useState)("name");
			const uid = (0, react.useId)();
			const saved = snapshot.personas.find((persona) => persona.id === draft.id);
			const dirty = personaChanged(draft, saved);
			(0, react.useEffect)(() => {
				let active = true;
				setCurrentPersona(null);
				setContext({});
				if (!currentId) return;
				const chat = chatFor(currentId);
				const update = () => {
					if (active) {
						const state = chat.getSnapshot().value;
						setCurrentPersona(state?.persona ?? null);
						setContext({
							...state?.personaContext,
							characterName: state?.character?.name
						});
					}
				};
				const unsubscribe = chat.subscribe(update);
				chat.refresh();
				update();
				return () => {
					active = false;
					unsubscribe();
				};
			}, [currentId, chatFor]);
			const run = async (operation, success) => {
				if (pending.current) return;
				pending.current = true;
				setBusy(true);
				setError("");
				setNotice("");
				try {
					await operation();
					setNotice(success);
				} catch (failure) {
					setError(failure.message || tr("Не удалось сохранить. Попробуйте ещё раз."));
				} finally {
					pending.current = false;
					setBusy(false);
				}
			};
			const choose = (persona) => {
				initialSelection.current = true;
				drafts.remember(draft);
				setDraft(drafts.open(persona));
				setError("");
				setNotice("");
				setLibraryOpen(false);
			};
			const create = () => {
				choose(void 0);
				setTab("description");
				nameRef.current?.focus();
			};
			const field = (key, value) => {
				initialSelection.current = true;
				setDraft((previous) => ({
					...previous,
					[key]: value
				}));
			};
			const save = async () => {
				const result = await personas.save(draft);
				drafts.forget(draft.id);
				drafts.remember(result);
				setDraft(personaDraft(result));
				return result;
			};
			const image = async (event) => {
				const file = event.target.files?.[0];
				event.target.value = "";
				if (!file) return;
				if (![
					"image/png",
					"image/jpeg",
					"image/webp"
				].includes(file.type)) {
					setError(tr("Выберите PNG, JPEG или WebP."));
					return;
				}
				await run(async () => {
					const data = await new Promise((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = () => resolve(reader.result);
						reader.onerror = () => reject(new Error(tr("Не удалось прочитать изображение.")));
						reader.readAsDataURL(file);
					});
					field("avatar", data);
				}, tr("Аватар добавлен."));
			};
			const preview = composePersona(draft, context);
			const rows = filterPersonas(snapshot.personas, query, sort);
			const promptField = (key, value) => field("prompt", {
				...draft.prompt,
				[key]: value
			});
			const action = (id) => {
				setMenuOpen(false);
				if (id === "discard") {
					drafts.forget(draft.id);
					setDraft(personaDraft(saved));
					setError("");
					setNotice(tr("Изменения отменены."));
				} else if (id === "copy") run(async () => {
					const { id: _id, characterIds: _connections, ...copy } = draft;
					const result = await personas.save({
						...copy,
						name: tr("{p1} (копия)", { p1: draft.name.slice(0, 112) }),
						characterIds: []
					});
					choose(result);
				}, tr("Копия создана."));
				else if (id === "delete" && window.confirm(tr("Удалить персону «{p1}»?", { p1: draft.name }))) run(async () => {
					await personas.remove(draft.id);
					drafts.forget(draft.id);
					setDraft(drafts.open(personas.getSnapshot().personas[0]));
				}, tr("Персона удалена."));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-personas-panel",
				"aria-labelledby": `${uid}-title`,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: "mayori-personas-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						id: `${uid}-title`,
						children: tr("Персоны")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "mayori-persona-hint",
						children: tr("{p1} в библиотеке", { p1: snapshot.personas.length })
					})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: busy,
						onClick: create,
						children: tr("+ Создать персону")
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-personas-workspace",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
						className: "mayori-persona-catalog",
						"data-open": libraryOpen,
						"aria-label": tr("Библиотека персон"),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mayori-persona-library-toggle",
							"aria-expanded": libraryOpen,
							"aria-controls": `${uid}-library`,
							onClick: () => setLibraryOpen((value) => !value),
							children: [
								tr("Библиотека · "),
								snapshot.personas.length,
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: libraryOpen ? "−" : "+"
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-persona-library-body",
							id: `${uid}-library`,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-persona-library-tools",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "mayori-dice-sr",
										children: tr("Поиск персон")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "search",
										placeholder: tr("Поиск персон"),
										value: query,
										onChange: (event) => setQuery(event.target.value)
									})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
										"aria-label": tr("Сортировка персон"),
										value: sort,
										onChange: setSort,
										options: [
											{
												value: "name",
												label: tr("По имени")
											},
											{
												value: "description",
												label: tr("По длине описания")
											},
											{
												value: "connections",
												label: tr("По привязкам")
											}
										]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: "mayori-persona-list",
									children: rows.map((persona) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "mayori-persona-row",
										"aria-pressed": draft.id === persona.id,
										disabled: busy,
										onClick: () => choose(persona),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-persona-avatar",
											"aria-hidden": "true",
											children: persona.avatar ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
												src: persona.avatar,
												alt: ""
											}) : persona.name.slice(0, 1)
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "mayori-persona-row-text",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: persona.name }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: persona.title || persona.description.slice(0, 90) || tr("Без описания") }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "mayori-persona-badges",
													children: [
														snapshot.defaultId === persona.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: tr("По умолчанию") }),
														currentPersona?.id === persona.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: tr("В чате") }),
														(persona.id === draft.id ? dirty : drafts.changed(persona)) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("em", { children: tr("Черновик") })
													]
												})
											]
										})]
									}) }, persona.id))
								}),
								snapshot.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-persona-empty",
									children: tr("Загружаем персоны…")
								}),
								snapshot.status === "ready" && !snapshot.personas.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-persona-empty",
									children: tr("Здесь будут ваши персоны. Создайте первую справа.")
								}),
								!!snapshot.personas.length && !rows.length && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-persona-empty",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("Ничего не найдено") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setQuery(""),
										children: tr("Сбросить поиск")
									})]
								}),
								snapshot.error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									role: "alert",
									className: "mayori-persona-empty",
									children: [noticeText(snapshot.error), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											run(() => personas.refresh(), tr("Список обновлён."));
										},
										children: tr("Обновить список")
									})]
								})
							]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						ref: formRef,
						className: "mayori-persona-form",
						onKeyDown: (event) => {
							if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
								event.preventDefault();
								if (!busy) formRef.current.requestSubmit();
							}
						},
						onSubmit: (event) => {
							event.preventDefault();
							run(save, tr("Персона сохранена."));
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-persona-edit-area",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
									className: "mayori-persona-editor-header",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: draft.id ? tr("Персона") : tr("Новая персона") }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-persona-hint",
											children: dirty ? tr("Не сохранено") : draft.id ? tr("Сохранено") : ""
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
											open: menuOpen && !busy,
											portal: true,
											autoFocus: true,
											onClose: () => setMenuOpen(false),
											onSelect: action,
											items: [
												{
													id: "discard",
													label: tr("Отменить изменения"),
													disabled: !dirty
												},
												{
													id: "copy",
													label: tr("Создать копию"),
													disabled: !draft.id
												},
												{
													id: "delete",
													label: tr("Удалить персону"),
													disabled: !draft.id
												}
											],
											anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
												type: "button",
												disabled: busy,
												"aria-haspopup": "menu",
												"aria-expanded": menuOpen && !busy,
												onClick: () => setMenuOpen((value) => !value),
												children: [tr("Действия "), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													"aria-hidden": "true",
													children: "⌄"
												})]
											})
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-persona-identity",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "mayori-persona-avatar-picker",
											disabled: busy,
											onClick: () => imageRef.current?.click(),
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "mayori-persona-avatar",
												"aria-hidden": "true",
												children: draft.avatar ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
													src: draft.avatar,
													alt: ""
												}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PersonaIcon, { size: 28 })
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Аватар") })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											ref: imageRef,
											hidden: true,
											type: "file",
											"aria-label": tr("Аватар"),
											accept: "image/png,image/jpeg,image/webp",
											disabled: busy,
											onChange: (event) => {
												image(event);
											}
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [tr("Имя в чате"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											ref: nameRef,
											name: "personaName",
											placeholder: tr("Имя персоны"),
											autoComplete: "off",
											required: true,
											maxLength: 120,
											value: draft.name,
											disabled: busy,
											onChange: (event) => field("name", event.target.value)
										})] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [tr("Подпись"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											name: "personaTitle",
											placeholder: tr("Например, маг из северных земель"),
											maxLength: 200,
											value: draft.title,
											disabled: busy,
											onChange: (event) => field("title", event.target.value)
										})] })
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									role: "tablist",
									"aria-label": tr("Редактор персоны"),
									className: "mayori-persona-tabs",
									children: tabs.map(([key, label], index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										role: "tab",
										id: `${uid}-tab-${key}`,
										"aria-controls": `${uid}-content-${key}`,
										"aria-selected": tab === key,
										tabIndex: tab === key ? 0 : -1,
										onClick: () => setTab(key),
										onKeyDown: (event) => {
											const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
											if (next !== null) {
												event.preventDefault();
												setTab(tabs[next][0]);
												document.getElementById(`${uid}-tab-${tabs[next][0]}`)?.focus();
											}
										},
										children: [label, key === "blocks" && draft.blocks.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											"aria-hidden": "true",
											className: "mayori-persona-tab-count",
											children: draft.blocks.reduce((count, node) => count + (node.type === "group" ? node.items.length : 1), 0)
										})]
									}, key))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-persona-editor-content",
									role: "tabpanel",
									tabIndex: 0,
									id: `${uid}-content-${tab}`,
									"aria-labelledby": `${uid}-tab-${tab}`,
									children: [
										tab === "description" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-persona-description",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												className: "mayori-persona-long-text",
												children: [tr("Описание"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
													name: "personaDescription",
													placeholder: tr("Внешность, характер, биография — всё, что собеседник должен знать о вашей персоне."),
													rows: 12,
													maxLength: 32e3,
													value: draft.description,
													disabled: busy,
													onChange: (event) => field("description", event.target.value)
												})]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
												className: "mayori-persona-variant",
												open: draft.descriptionOverride !== null,
												children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: tr("Отдельный вариант для модели") }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
														className: "mayori-persona-check",
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
															type: "checkbox",
															disabled: busy,
															checked: draft.descriptionOverride !== null,
															onChange: (event) => field("descriptionOverride", event.target.checked ? draft.description : null)
														}), tr("Другой вариант описания")]
													}),
													draft.descriptionOverride !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [tr("Вариант для модели"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
														rows: 8,
														maxLength: 32e3,
														disabled: busy,
														value: draft.descriptionOverride,
														onChange: (event) => field("descriptionOverride", event.target.value)
													})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: busy,
														onClick: () => setDraft((previous) => ({
															...previous,
															description: previous.descriptionOverride,
															descriptionOverride: null
														})),
														children: tr("Сделать базовым описанием")
													})] })
												]
											})]
										}),
										tab === "blocks" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PersonaBlocks, {
											blocks: draft.blocks,
											onChange: (value) => field("blocks", value),
											selectedId: nodeId,
											onSelect: setNodeId,
											disabled: busy,
											context
										}),
										tab === "settings" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-persona-settings",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: tr("Выбор персоны") }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: busy || !draft.id,
														onClick: () => {
															run(() => personas.setDefault(snapshot.defaultId === draft.id ? null : draft.id), tr("Выбор для новых чатов сохранён."));
														},
														children: snapshot.defaultId === draft.id ? tr("Снять выбор по умолчанию") : tr("Использовать по умолчанию")
													}),
													!draft.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
														className: "mayori-persona-hint",
														children: tr("Сначала сохраните персону.")
													})
												] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: tr("Привязки к персонажам") }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
														type: "button",
														disabled: busy || !context.characterId || draft.characterIds.includes(context.characterId),
														onClick: () => field("characterIds", [...draft.characterIds, context.characterId]),
														children: tr("Добавить текущего персонажа")
													}),
													!draft.characterIds.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
														className: "mayori-persona-hint",
														children: tr("Привязок пока нет.")
													}),
													draft.characterIds.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
														className: "mayori-persona-binding",
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: id === context.characterId ? context.characterName || tr("Текущий персонаж") : id }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
															type: "button",
															disabled: busy,
															onClick: () => field("characterIds", draft.characterIds.filter((value) => value !== id)),
															children: tr("Убрать")
														})]
													}, id))
												] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: tr("Сборка описания") }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [tr("Разделитель блоков"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
														maxLength: 200,
														value: draft.prompt.joiner,
														disabled: busy,
														onChange: (event) => promptField("joiner", event.target.value)
													})] }),
													/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
														className: "mayori-persona-check",
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: draft.prompt.wrapperEnabled,
															disabled: busy,
															onChange: (event) => promptField("wrapperEnabled", event.target.checked)
														}), tr("Использовать шаблон")]
													}),
													draft.prompt.wrapperEnabled && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [
														tr("Шаблон с "),
														"{{PROMPT}}",
														/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
															rows: 5,
															maxLength: 8e3,
															value: draft.prompt.wrapperTemplate,
															disabled: busy,
															onChange: (event) => promptField("wrapperTemplate", event.target.value)
														})
													] })
												] }),
												draft.avatar && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: tr("Аватар") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													disabled: busy,
													onClick: () => field("avatar", ""),
													children: tr("Убрать аватар")
												})] })
											]
										}),
										tab === "preview" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-persona-preview-content",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: "mayori-persona-preview-heading",
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: tr("Итоговое описание") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: "mayori-persona-hint",
														children: tr("{p1} символов", { p1: preview.description.length.toLocaleString(formatLocale()) })
													})]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
													className: "mayori-persona-hint",
													children: tr("{p1} · блоков включено: {p2}", {
														p1: currentId ? tr("Для текущего чата") : tr("Без условий чата"),
														p2: preview.activeIds.length
													})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
													className: "mayori-persona-preview",
													children: preview.description || tr("Описание пока пустое.")
												})
											]
										})
									]
								}),
								tabs.filter(([key]) => key !== tab).map(([key]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									hidden: true,
									role: "tabpanel",
									id: `${uid}-content-${key}`,
									"aria-labelledby": `${uid}-tab-${key}`
								}, key))
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
							className: "mayori-persona-footer",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-persona-feedback",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "status",
									children: busy ? tr("Сохраняем…") : noticeText(notice) || (currentPersona ? tr("В текущем чате: {p1}", { p1: currentPersona.name }) : "")
								}), error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mayori-error",
									children: noticeText(error)
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-persona-footer-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: busy || !currentId || !context.characterId,
									onClick: () => {
										if (formRef.current.reportValidity()) run(async () => {
											const result = await save();
											await chatFor(currentId).setPersona(result.id);
										}, tr("Персона закреплена за текущим чатом."));
									},
									children: tr("Играть в этом чате")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "mayori-persona-primary",
									type: "submit",
									disabled: busy,
									"aria-busy": busy,
									children: tr("Сохранить персону")
								})]
							})]
						})]
					})]
				})]
			});
		}
		const MAX_PRESET_TEXT = 64e3;
		/** A legacy preset opens as one literal block without rewriting its text. */
		function presetNodes(preset) {
			return preset.nodes ?? [{
				id: "main-instructions",
				kind: "block",
				title: "Основные инструкции",
				enabled: true,
				text: preset.instructions ?? ""
			}];
		}
		function presetNodeEntries(nodes, ancestors = [], result = []) {
			for (const node of nodes) {
				result.push({
					node,
					ancestors,
					siblings: nodes
				});
				if (node.kind === "group") presetNodeEntries(node.children, [...ancestors, node], result);
			}
			return result;
		}
		function validatePresetNodes(nodes) {
			const ids = /* @__PURE__ */ new Set();
			let length = 0;
			function visit(items, depth) {
				if (!Array.isArray(items)) throw new TypeError("Содержимое группы должно быть списком блоков или групп.");
				if (depth > 12 && items.length) throw new TypeError(`Используйте не больше 12 уровней вложенности.`);
				return items.map((node) => {
					if (!node || !["block", "group"].includes(node.kind) || typeof node.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(node.id) || ids.has(node.id)) throw new TypeError("У каждого блока и группы должен быть уникальный идентификатор.");
					ids.add(node.id);
					if (ids.size > 256) throw new TypeError(`В пресете может быть не больше 256 блоков и групп.`);
					if (typeof node.title !== "string" || !node.title.trim() || node.title.length > 120) throw new TypeError("Укажите название каждого блока и группы длиной до 120 символов.");
					if (typeof node.enabled !== "boolean") throw new TypeError("Укажите, включён ли блок или группа.");
					const base = {
						id: node.id,
						kind: node.kind,
						title: node.title.trim(),
						enabled: node.enabled
					};
					if (node.kind === "group") return {
						...base,
						children: visit(node.children, depth + 1)
					};
					if (typeof node.text !== "string") throw new TypeError("Текст блока должен быть строкой.");
					length += node.text.length;
					if (length > 64e3) throw new TypeError("Сократите суммарный текст блоков до 64 000 символов, включая выключенные блоки.");
					return {
						...base,
						text: node.text
					};
				});
			}
			return visit(nodes, 1);
		}
		/** Version 1: literal block bodies, in depth-first order; titles are UI metadata. */
		function compilePresetNodes(nodes) {
			return activePresetBlocks(nodes).map(({ node }) => node.text).join("\n\n");
		}
		function activePresetBlocks(nodes) {
			return presetNodeEntries(nodes).filter(({ node, ancestors }) => node.kind === "block" && node.enabled && ancestors.every((parent) => parent.enabled) && node.text.trim());
		}
		function canMovePresetNode(nodes, sourceId, targetId, position) {
			if (![
				"before",
				"after",
				"inside"
			].includes(position)) return false;
			const entries = presetNodeEntries(nodes);
			if (!entries.find((entry) => entry.node.id === sourceId)) return false;
			if (targetId === null) return position === "inside";
			const target = entries.find((entry) => entry.node.id === targetId);
			return !!target && targetId !== sourceId && !target.ancestors.some((node) => node.id === sourceId) && (position !== "inside" || target.node.kind === "group");
		}
		/** Move the whole subtree; never mutate the source tree or its saved baseline. */
		function movePresetNode(nodes, sourceId, targetId, position) {
			if (!canMovePresetNode(nodes, sourceId, targetId, position)) throw new TypeError("Выберите другое место: группу нельзя вложить в себя или её содержимое.");
			const result = structuredClone(nodes);
			const entries = presetNodeEntries(result);
			const source = entries.find((entry) => entry.node.id === sourceId);
			const target = targetId === null ? null : entries.find((entry) => entry.node.id === targetId);
			const destination = position === "inside" ? target?.node.children ?? result : target.siblings;
			source.siblings.splice(source.siblings.indexOf(source.node), 1);
			const index = position === "inside" ? destination.length : destination.indexOf(target.node) + (position === "after" ? 1 : 0);
			destination.splice(index, 0, source.node);
			if (presetNodeEntries(result).some((entry) => entry.ancestors.length >= 12)) throw new TypeError(`Используйте не больше 12 уровней вложенности.`);
			return result;
		}
		//#endregion
		//#region src/features/presets/client/editor.js
		const blankPreset = () => ({
			name: "",
			instructions: ""
		});
		const blank$1 = blankPreset;
		/** Presentation draft owned by the catalog provider, surviving panel unmounts. */
		var PresetEditor = class {
			#snapshot = {
				initialized: false,
				draft: blank$1(),
				saved: blank$1(),
				busy: false,
				error: "",
				notice: "",
				selectedNodeId: "main-instructions",
				collapsed: [],
				preview: false,
				undo: null
			};
			#listeners = /* @__PURE__ */ new Set();
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => this.#listeners.delete(listener);
			};
			update(value) {
				this.#snapshot = {
					...this.#snapshot,
					...value
				};
				for (const listener of this.#listeners) listener();
			}
			initialize(catalog) {
				if (this.#snapshot.initialized || catalog.status !== "ready") return;
				this.choose(catalog.presets.find((preset) => preset.id === catalog.defaultId) ?? catalog.presets[0] ?? blank$1());
			}
			choose(preset) {
				this.update({
					initialized: true,
					draft: structuredClone(preset),
					saved: preset.id ? structuredClone(preset) : blank$1(),
					error: "",
					notice: "",
					selectedNodeId: presetNodes(preset)[0]?.id ?? null,
					collapsed: [],
					preview: false,
					undo: null
				});
			}
			change(key, value) {
				this.update({
					draft: {
						...this.#snapshot.draft,
						[key]: value
					},
					notice: "",
					undo: null
				});
			}
			accept(preset) {
				this.update({
					draft: structuredClone(preset),
					saved: structuredClone(preset),
					undo: null
				});
			}
			reset() {
				this.update({
					draft: structuredClone(this.#snapshot.saved),
					selectedNodeId: presetNodes(this.#snapshot.saved)[0]?.id ?? null,
					collapsed: [],
					preview: false,
					undo: null,
					error: "",
					notice: ""
				});
			}
			selectNode(id) {
				this.update({
					selectedNodeId: id,
					preview: false
				});
			}
			toggleGroup(id) {
				const collapsed = new Set(this.#snapshot.collapsed);
				collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id);
				this.update({ collapsed: [...collapsed] });
			}
			#edit(operation, notice = "") {
				if (this.#snapshot.busy) return;
				try {
					const nodes = structuredClone(presetNodes(this.#snapshot.draft));
					const result = operation(nodes) ?? nodes;
					const entries = presetNodeEntries(result);
					if (entries.length > 256) throw new TypeError(tr("В пресете может быть не больше {p1} блоков и групп.", { p1: 256 }));
					if (entries.some((entry) => entry.ancestors.length >= 12)) throw new TypeError(tr("Используйте не больше {p1} уровней вложенности.", { p1: 12 }));
					this.update({
						draft: {
							...this.#snapshot.draft,
							nodes: result,
							instructions: compilePresetNodes(result),
							compilerVersion: 1
						},
						error: "",
						notice
					});
					return true;
				} catch (error) {
					this.update({ error: error.message });
					return false;
				}
			}
			changeNode(id, key, value) {
				if (this.#snapshot.busy || ![
					"title",
					"text",
					"enabled"
				].includes(key)) return;
				this.#edit((nodes) => {
					const node = presetNodeEntries(nodes).find((entry) => entry.node.id === id)?.node;
					if (!node || key === "text" && node.kind !== "block") return;
					node[key] = value;
				});
				this.update({ undo: null });
			}
			addNode(kind) {
				if (!["block", "group"].includes(kind)) return;
				const id = crypto.randomUUID();
				const previous = {
					draft: structuredClone(this.#snapshot.draft),
					selectedNodeId: this.#snapshot.selectedNodeId
				};
				const selection = presetNodeEntries(presetNodes(this.#snapshot.draft)).find((entry) => entry.node.id === this.#snapshot.selectedNodeId);
				if (this.#edit((nodes) => {
					const entry = presetNodeEntries(nodes).find((entry) => entry.node.id === this.#snapshot.selectedNodeId);
					(entry?.node.kind === "group" ? entry.node.children : entry?.siblings ?? nodes).push({
						id,
						kind,
						title: kind === "group" ? tr("Новая группа") : tr("Новый блок"),
						enabled: true,
						...kind === "group" ? { children: [] } : { text: "" }
					});
				})) this.update({
					selectedNodeId: id,
					preview: false,
					undo: previous,
					collapsed: this.#snapshot.collapsed.filter((id) => id !== selection?.node.id)
				});
			}
			removeNode(id) {
				const previous = {
					draft: structuredClone(this.#snapshot.draft),
					selectedNodeId: this.#snapshot.selectedNodeId
				};
				if (this.#edit((nodes) => {
					const entry = presetNodeEntries(nodes).find((entry) => entry.node.id === id);
					if (entry) entry.siblings.splice(entry.siblings.indexOf(entry.node), 1);
				}, tr("Элемент удалён. Можно отменить действие."))) {
					const entries = presetNodeEntries(presetNodes(this.#snapshot.draft));
					this.update({
						undo: previous,
						selectedNodeId: entries.some((entry) => entry.node.id === this.#snapshot.selectedNodeId) ? this.#snapshot.selectedNodeId : entries[0]?.node.id ?? null
					});
				}
			}
			duplicateNode(id) {
				const previous = {
					draft: structuredClone(this.#snapshot.draft),
					selectedNodeId: this.#snapshot.selectedNodeId
				};
				let copyId;
				if (this.#edit((nodes) => {
					const entry = presetNodeEntries(nodes).find((entry) => entry.node.id === id);
					if (!entry) return;
					const copy = structuredClone(entry.node);
					for (const { node } of presetNodeEntries([copy])) node.id = crypto.randomUUID();
					copy.title = tr("{p1} — копия", { p1: copy.title }).slice(0, 120);
					copyId = copy.id;
					entry.siblings.splice(entry.siblings.indexOf(entry.node) + 1, 0, copy);
				})) this.update({
					undo: previous,
					selectedNodeId: copyId ?? id
				});
			}
			moveNode(sourceId, targetId, position) {
				const previous = {
					draft: structuredClone(this.#snapshot.draft),
					selectedNodeId: this.#snapshot.selectedNodeId
				};
				const nodes = presetNodes(this.#snapshot.draft);
				const title = presetNodeEntries(nodes).find((entry) => entry.node.id === sourceId)?.node.title;
				if (!this.#edit(() => movePresetNode(nodes, sourceId, targetId, position), tr("«{p1}» перемещён. Можно отменить действие.", { p1: title }))) return false;
				this.update({
					undo: previous,
					selectedNodeId: sourceId,
					collapsed: position === "inside" ? this.#snapshot.collapsed.filter((id) => id !== targetId) : this.#snapshot.collapsed
				});
				return true;
			}
			undo() {
				if (this.#snapshot.busy || !this.#snapshot.undo) return;
				this.update({
					...this.#snapshot.undo,
					undo: null,
					error: "",
					notice: tr("Действие отменено.")
				});
			}
		};
		//#endregion
		//#region src/features/presets/client/presets.js
		var RoleplayPresetService = class {
			getSnapshot() {
				throw new Error("RoleplayPresetService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("RoleplayPresetService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("RoleplayPresetService.refresh() is not implemented");
			}
			save() {
				throw new Error("RoleplayPresetService.save() is not implemented");
			}
			remove() {
				throw new Error("RoleplayPresetService.remove() is not implemented");
			}
			setDefault() {
				throw new Error("RoleplayPresetService.setDefault() is not implemented");
			}
		};
		var RemoteRoleplayPresetProvider = class extends RoleplayPresetService {
			editor = new PresetEditor();
			#snapshot = {
				status: "loading",
				presets: [],
				defaultId: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#loading ??= this.refresh().catch(() => {});
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh() {
				const revision = ++this.#revision;
				try {
					const value = await call("preset-list", {});
					if (revision === this.#revision) this.#publish({
						...value,
						status: "ready",
						error: null
					});
				} catch (error) {
					if (revision === this.#revision) this.#publish({
						...this.#snapshot,
						status: "error",
						error: error.message
					});
					throw error;
				}
			}
			async save(preset) {
				const value = await call("preset-save", preset);
				await this.refresh();
				return value;
			}
			async remove(id) {
				await call("preset-remove", { id });
				await this.refresh();
			}
			async setDefault(id) {
				await call("preset-default", { id });
				await this.refresh();
			}
		};
		var SessionPresetService = class {
			getSnapshot() {
				throw new Error("SessionPresetService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("SessionPresetService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("SessionPresetService.refresh() is not implemented");
			}
			select() {
				throw new Error("SessionPresetService.select() is not implemented");
			}
		};
		var RemoteSessionPresetProvider = class extends SessionPresetService {
			#snapshot = {
				status: "loading",
				preset: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			#changing = false;
			constructor(sessionId) {
				super();
				this.sessionId = sessionId;
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				this.#loading ??= this.refresh();
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh() {
				if (this.#changing) return;
				const revision = ++this.#revision;
				try {
					const value = await call("session-preset-state", { sessionId: this.sessionId });
					if (revision === this.#revision) this.#publish({
						...value,
						status: "ready",
						error: null
					});
				} catch (error) {
					if (revision === this.#revision) this.#publish({
						...this.#snapshot,
						status: "error",
						error: error.message
					});
				}
			}
			async select(presetId) {
				if (this.#changing) throw new Error(tr("Дождитесь сохранения текущего пресета."));
				this.#changing = true;
				++this.#revision;
				this.#publish({
					...this.#snapshot,
					status: "saving",
					error: null
				});
				try {
					const value = await call("session-preset", {
						sessionId: this.sessionId,
						presetId
					});
					++this.#revision;
					this.#publish({
						...value,
						status: "ready",
						error: null
					});
					return value;
				} catch (error) {
					this.#changing = false;
					await this.refresh();
					this.#publish({
						...this.#snapshot,
						error: error.message
					});
					throw error;
				} finally {
					this.#changing = false;
				}
			}
		};
		//#endregion
		//#region src/features/presets/client/presentation.js
		/** Presentation helpers compare content, never mutable library identity alone. */
		function presetChanged(left, right) {
			return left.name !== right.name || left.instructions !== right.instructions || JSON.stringify(presetNodes(left)) !== JSON.stringify(presetNodes(right));
		}
		function filterPresets(presets, query) {
			const needle = query.trim().toLocaleLowerCase(formatLocale());
			if (!needle) return presets;
			return presets.filter((preset) => `${preset.name}\n${presetNodeEntries(presetNodes(preset)).map(({ node }) => `${node.title}\n${node.text ?? ""}`).join("\n")}`.toLocaleLowerCase(formatLocale()).includes(needle));
		}
		//#endregion
		//#region src/features/presets/client/drag.js
		/** The middle half of a group is a nest target; its edges insert siblings. */
		function presetDropPosition(kind, y, bounds) {
			const ratio = (y - bounds.top) / bounds.height;
			if (kind === "group" && ratio > .25 && ratio < .75) return "inside";
			return ratio < .5 ? "before" : "after";
		}
		//#endregion
		//#region src/features/presets/client/structure.jsx
		function DragHandle() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 16 16",
				fill: "currentColor",
				"aria-hidden": "true",
				children: [
					4,
					8,
					12
				].flatMap((y) => [5, 11].map((x) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: x,
					cy: y,
					r: "1"
				}, `${x}-${y}`)))
			});
		}
		function PresetStructureEditor({ editor, disabled }) {
			const id = (0, react.useId)();
			const { draft, selectedNodeId, collapsed, preview, undo } = (0, react.useSyncExternalStore)(editor.subscribe, editor.getSnapshot, editor.getSnapshot);
			const nodes = presetNodes(draft);
			const entries = presetNodeEntries(nodes);
			const selected = entries.find((entry) => entry.node.id === selectedNodeId);
			const active = activePresetBlocks(nodes);
			const total = entries.reduce((sum, { node }) => sum + (node.text?.length ?? 0), 0);
			const rootRef = (0, react.useRef)(null);
			const treeScrollerRef = (0, react.useRef)(null);
			const titleRef = (0, react.useRef)(null);
			const dialogRef = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			const suppressClick = (0, react.useRef)(false);
			const [drag, setDrag] = (0, react.useState)(null);
			const [moveId, setMoveId] = (0, react.useState)(null);
			const [targetId, setTargetId] = (0, react.useState)(":root");
			const [position, setPosition] = (0, react.useState)("inside");
			const [moveError, setMoveError] = (0, react.useState)("");
			const [dragNotice, setDragNotice] = (0, react.useState)("");
			const moveTarget = entries.find((entry) => entry.node.id === targetId)?.node;
			const movePositions = targetId === ":root" ? [{
				value: "inside",
				label: tr("В конец основного списка")
			}] : [
				...moveTarget?.kind === "group" ? [{
					value: "inside",
					label: tr("Внутрь группы, в конец")
				}] : [],
				{
					value: "before",
					label: tr("Перед элементом")
				},
				{
					value: "after",
					label: tr("После элемента")
				}
			];
			const handleFor = (nodeId) => rootRef.current?.querySelector(`[data-preset-handle="${CSS.escape(nodeId)}"]`);
			(0, react.useEffect)(() => {
				if (!moveId) return;
				dialogRef.current.showModal();
				return () => {
					dialogRef.current?.close();
				};
			}, [moveId]);
			(0, react.useEffect)(() => {
				let frame;
				let resetClick;
				if (disabled) {
					setDrag(null);
					setDragNotice("");
				}
				const readEntries = () => presetNodeEntries(presetNodes(editor.getSnapshot().draft));
				const targetAt = (current) => {
					const element = document.elementFromPoint(current.x, current.y);
					const root = rootRef.current;
					if (!element || !root?.contains(element)) return null;
					if (element.closest("[data-preset-root-drop]")) return {
						targetId: null,
						position: "inside"
					};
					const row = element.closest("[data-preset-node]");
					const target = readEntries().find((entry) => entry.node.id === row?.dataset.presetNode);
					if (!target) return null;
					const position = presetDropPosition(target.node.kind, current.y, row.getBoundingClientRect());
					return canMovePresetNode(presetNodes(editor.getSnapshot().draft), current.sourceId, target.node.id, position) ? {
						targetId: target.node.id,
						position
					} : null;
				};
				const refresh = () => {
					const current = dragRef.current;
					if (!current?.active) return;
					const rootBounds = rootRef.current.getBoundingClientRect();
					current.drop = targetAt(current);
					setDrag({
						sourceId: current.sourceId,
						title: current.title,
						drop: current.drop,
						x: Math.max(0, Math.min(rootBounds.width - 180, current.x - rootBounds.left + 12)),
						y: current.y - rootBounds.top + 12
					});
					const target = readEntries().find((entry) => entry.node.id === current.drop?.targetId)?.node;
					setDragNotice(current.drop ? current.drop.position === "inside" ? tr("Перенести в {p1}.", { p1: target ? `«${target.title}»` : tr("основной список") }) : `${current.drop.position === "before" ? tr("Вставить перед") : tr("Вставить после")} «${target.title}».` : tr("Выберите место вставки. Группу нельзя вложить в себя или её содержимое."));
				};
				const autoScroll = () => {
					if (!dragRef.current?.active) return;
					const current = dragRef.current;
					let scrolled = false;
					for (const scroller of [treeScrollerRef.current, rootRef.current.closest(".mayori-presets-panel")]) {
						if (!scroller) continue;
						const rect = scroller.getBoundingClientRect();
						if (current.x < rect.left || current.x > rect.right) continue;
						const delta = current.y < rect.top + 36 ? -10 : current.y > rect.bottom - 36 ? 10 : 0;
						if (delta) {
							const before = scroller.scrollTop;
							scroller.scrollBy(0, delta);
							scrolled ||= before !== scroller.scrollTop;
						}
					}
					if (scrolled) refresh();
					frame = requestAnimationFrame(autoScroll);
				};
				const move = (event) => {
					const current = dragRef.current;
					if (!current || event.pointerId !== current.pointerId || disabled) return;
					current.x = event.clientX;
					current.y = event.clientY;
					if (!current.active && Math.hypot(current.x - current.startX, current.y - current.startY) < 6) return;
					event.preventDefault();
					if (!current.active) {
						current.active = true;
						frame = requestAnimationFrame(autoScroll);
					}
					refresh();
				};
				const finish = (event, cancel = false) => {
					const current = dragRef.current;
					if (!current || event && event.pointerId !== current.pointerId) return;
					dragRef.current = null;
					cancelAnimationFrame(frame);
					if (current.handle.hasPointerCapture(current.pointerId)) current.handle.releasePointerCapture(current.pointerId);
					setDrag(null);
					if (!current.active) return;
					suppressClick.current = true;
					resetClick = setTimeout(() => {
						suppressClick.current = false;
					}, 0);
					if (!cancel && !disabled && current.drop) editor.moveNode(current.sourceId, current.drop.targetId, current.drop.position);
					else setDragNotice(tr("Перенос отменён."));
					if (!cancel && current.drop) setDragNotice("");
					requestAnimationFrame(() => handleFor(current.sourceId)?.focus());
				};
				const up = (event) => finish(event);
				const cancel = (event) => finish(event, true);
				const key = (event) => {
					if (event.key === "Escape" && dragRef.current) {
						finish(null, true);
						event.preventDefault();
					}
				};
				window.addEventListener("pointermove", move, { passive: false });
				window.addEventListener("pointerup", up);
				window.addEventListener("pointercancel", cancel);
				window.addEventListener("keydown", key);
				return () => {
					cancelAnimationFrame(frame);
					clearTimeout(resetClick);
					const current = dragRef.current;
					if (current?.handle.hasPointerCapture(current.pointerId)) current.handle.releasePointerCapture(current.pointerId);
					dragRef.current = null;
					window.removeEventListener("pointermove", move);
					window.removeEventListener("pointerup", up);
					window.removeEventListener("pointercancel", cancel);
					window.removeEventListener("keydown", key);
				};
			}, [editor, disabled]);
			const startDrag = (event, node) => {
				if (disabled || event.button !== 0) return;
				const handle = event.currentTarget;
				handle.setPointerCapture(event.pointerId);
				dragRef.current = {
					sourceId: node.id,
					title: node.title,
					pointerId: event.pointerId,
					handle,
					startX: event.clientX,
					startY: event.clientY,
					x: event.clientX,
					y: event.clientY,
					active: false,
					drop: null
				};
			};
			const openMove = (nodeId) => {
				if (suppressClick.current) {
					suppressClick.current = false;
					return;
				}
				setTargetId(":root");
				setPosition("inside");
				setMoveError("");
				setMoveId(nodeId);
			};
			const closeMove = () => {
				const previous = moveId;
				setMoveId(null);
				requestAnimationFrame(() => handleFor(previous)?.focus());
			};
			const add = (kind) => {
				editor.addNode(kind);
				requestAnimationFrame(() => {
					titleRef.current?.focus();
					titleRef.current?.select();
				});
			};
			const renderNodes = (items, ancestors = []) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				"data-deep": ancestors.length >= 4 || void 0,
				className: `mayori-preset-tree-list${ancestors.length ? " mayori-preset-tree-children" : ""}`,
				children: items.map((node) => {
					const hiddenBy = ancestors.find((parent) => !parent.enabled);
					const drop = drag?.drop?.targetId === node.id ? drag.drop.position : "";
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						"data-preset-node": node.id,
						className: `mayori-preset-tree-row${selectedNodeId === node.id ? " is-selected" : ""}${drag?.sourceId === node.id ? " is-dragging" : ""}${drop ? ` drop-${drop}` : ""}`,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
								portal: true,
								className: "mayori-preset-drag-handle",
								disabled,
								"data-preset-handle": node.id,
								label: tr("Переместить {p1}", { p1: node.title }),
								onPointerDown: (event) => startDrag(event, node),
								onClick: () => openMove(node.id),
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DragHandle, {})
							}),
							node.kind === "group" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
								portal: true,
								className: "mayori-preset-tree-fold",
								disabled,
								label: `${collapsed.includes(node.id) ? tr("Раскрыть") : tr("Свернуть")} ${node.title}`,
								"aria-expanded": !collapsed.includes(node.id),
								"aria-controls": `${id}-${node.id}`,
								onClick: () => editor.toggleGroup(node.id),
								children: collapsed.includes(node.id) ? "▸" : "▾"
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "mayori-preset-tree-spacer" }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								className: "mayori-preset-node-toggle",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									disabled,
									"aria-label": tr("Включить {p1}", { p1: node.title }),
									checked: node.enabled,
									onChange: (event) => editor.changeNode(node.id, "enabled", event.target.checked)
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "mayori-preset-tree-pick",
								disabled,
								"aria-pressed": selectedNodeId === node.id,
								onClick: () => editor.selectNode(node.id),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: node.kind === "group" ? "mayori-preset-group-title" : "",
										children: node.title || tr("Без названия")
									}),
									ancestors.length >= 4 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: tr("Уровень {p1}", { p1: ancestors.length + 1 }) }),
									hiddenBy && node.enabled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: tr("Выключено в «{p1}»", { p1: hiddenBy.title }) })
								]
							})
						]
					}), node.kind === "group" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						id: `${id}-${node.id}`,
						hidden: collapsed.includes(node.id),
						children: node.children.length ? renderNodes(node.children, [...ancestors, node]) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "mayori-preset-tree-empty",
							children: tr("Пустая группа")
						})
					})] }, node.id);
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: "mayori-preset-structure",
				onKeyDown: (event) => {
					if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !["INPUT", "TEXTAREA"].includes(event.target.tagName) && undo) {
						event.preventDefault();
						editor.undo();
					}
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-preset-structure-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: tr("Инструкции") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("В итог входят {p1} из {p2} блоков · {p3} символов в итоге", {
							p1: active.length,
							p2: entries.filter((entry) => entry.node.kind === "block").length,
							p3: draft.instructions.length.toLocaleString(formatLocale())
						}) })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mayori-preset-button",
							"aria-pressed": preview,
							onClick: () => editor.update({ preview: !preview }),
							children: preview ? tr("Вернуться к редактору") : tr("Посмотреть итог")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-preset-structure-layout",
						hidden: preview,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
							className: "mayori-preset-structure-tree",
							"aria-label": tr("Структура пресета"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-tree-toolbar",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: tr("Структура") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mayori-preset-button",
										disabled,
										onClick: () => add("block"),
										children: tr("+ Блок")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mayori-preset-button",
										disabled,
										onClick: () => add("group"),
										children: tr("+ Группа")
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								ref: treeScrollerRef,
								className: "mayori-preset-tree-scroll",
								children: [
									renderNodes(nodes),
									!nodes.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-preset-tree-empty",
										children: tr("Нет блоков.")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										"data-preset-root-drop": true,
										className: `mayori-preset-root-drop${drag?.drop?.targetId === null ? " drop-inside" : ""}`,
										children: tr("Конец основного списка")
									})
								]
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
							className: "mayori-preset-node-editor",
							"aria-label": tr("Редактирование выбранного элемента"),
							children: selected ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								!!selected.ancestors.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-preset-node-path",
									children: selected.ancestors.map((parent) => parent.title).join(" / ")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "mayori-preset-node-field",
									children: [selected.node.kind === "group" ? tr("Название группы") : tr("Название блока"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										ref: titleRef,
										name: "presetNodeTitle",
										autoComplete: "off",
										required: true,
										maxLength: 120,
										value: selected.node.title,
										disabled,
										onChange: (event) => editor.changeNode(selected.node.id, "title", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "mayori-preset-node-toggle",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										disabled,
										checked: selected.node.enabled,
										onChange: (event) => editor.changeNode(selected.node.id, "enabled", event.target.checked)
									}), selected.node.kind === "group" ? tr("Включить группу") : tr("Включить блок")]
								}),
								selected.node.enabled && selected.ancestors.some((parent) => !parent.enabled) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-preset-node-state",
									children: tr("Выключена группа «{p1}».", { p1: selected.ancestors.find((parent) => !parent.enabled).title })
								}),
								selected.node.kind === "block" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-preset-node-field",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										htmlFor: `${id}-text`,
										children: tr("Текст инструкции")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										id: `${id}-text`,
										name: "presetInstructions",
										maxLength: MAX_PRESET_TEXT,
										value: selected.node.text,
										disabled,
										onChange: (event) => editor.changeNode(selected.node.id, "text", event.target.value)
									})]
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-preset-group-content",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: tr("Содержимое группы") }), selected.node.children.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: selected.node.children.map((node) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "mayori-preset-text-button",
										onClick: () => editor.selectNode(node.id),
										children: [node.title, node.kind === "group" ? tr(" · группа") : ""]
									}) }, node.id)) }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("Пустая группа.") })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "mayori-preset-node-actions",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mayori-preset-button",
										disabled,
										onClick: () => editor.duplicateNode(selected.node.id),
										children: tr("Дублировать")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mayori-preset-text-button mayori-preset-delete",
										disabled,
										onClick: () => editor.removeNode(selected.node.id),
										children: tr("Удалить {p1}", { p1: selected.node.kind === "group" ? tr("группу") : tr("блок") })
									})]
								})
							] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("Элемент не выбран.") })
						})]
					}),
					preview && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "mayori-preset-compiled",
						"aria-label": tr("Итоговые инструкции"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: tr("Инструкции для модели") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: draft.instructions || tr("Нет включённых инструкций.") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: tr("Из каких блоков собран текст") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", { children: active.map(({ node, ancestors }) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: [...ancestors, node].map((node) => node.title).join(" / ") }, node.id)) })] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "mayori-dice-sr",
						role: "status",
						children: noticeText(dragNotice)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-preset-structure-footer",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: total > 64e3 ? "mayori-preset-error" : "",
							children: tr("{p1} / 64 000 символов во всех блоках", { p1: total.toLocaleString(formatLocale()) })
						}), undo && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mayori-preset-text-button",
							disabled,
							onClick: () => editor.undo(),
							children: tr("Отменить действие")
						})]
					}),
					drag && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-preset-drag-ghost",
						"aria-hidden": "true",
						style: {
							left: drag.x,
							top: drag.y
						},
						children: drag.title
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dialog", {
						ref: dialogRef,
						className: "mayori-preset-move-dialog",
						"aria-labelledby": `${id}-move-title`,
						onCancel: (event) => {
							event.preventDefault();
							closeMove();
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: `${id}-move-title`,
								children: tr("Переместить элемент")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-node-field",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									htmlFor: `${id}-target`,
									children: tr("Место назначения")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
									id: `${id}-target`,
									"aria-label": tr("Место назначения"),
									portal: false,
									value: targetId,
									onChange: (value) => {
										setTargetId(value);
										setMoveError("");
										if (value === ":root") setPosition("inside");
										else if (position === "inside" && entries.find((entry) => entry.node.id === value)?.node.kind !== "group") setPosition("before");
									},
									options: [{
										value: ":root",
										label: tr("Основной список")
									}, ...entries.filter((entry) => canMovePresetNode(nodes, moveId, entry.node.id, entry.node.kind === "group" ? "inside" : "before")).map((entry) => ({
										value: entry.node.id,
										label: [...entry.ancestors, entry.node].map((node) => node.title).join(" / ")
									}))]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-node-field",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									htmlFor: `${id}-position`,
									children: tr("Положение")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
									id: `${id}-position`,
									"aria-label": tr("Положение"),
									portal: false,
									value: position,
									onChange: setPosition,
									options: movePositions
								})]
							}),
							moveError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: "alert",
								className: "mayori-preset-error",
								children: noticeText(moveError)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-node-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-preset-button",
									onClick: closeMove,
									children: tr("Отмена")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-preset-button mayori-preset-primary",
									disabled,
									onClick: () => {
										const target = targetId === ":root" ? null : targetId;
										if (!canMovePresetNode(nodes, moveId, target, position)) {
											setMoveError(tr("Выберите группу для вложения или положение перед / после элемента."));
											return;
										}
										if (editor.moveNode(moveId, target, position)) closeMove();
									},
									children: tr("Переместить")
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/features/presets/shared/preset.js
		function validatePreset(input) {
			if (!input || typeof input.name !== "string" || !input.name.trim() || input.name.length > 120) throw new TypeError("Укажите название пресета длиной до 120 символов.");
			if (input.nodes !== void 0) {
				const nodes = validatePresetNodes(input.nodes);
				const instructions = compilePresetNodes(nodes);
				if (instructions.length > 64e3) throw new TypeError("Сократите итоговые инструкции до 64 000 символов.");
				return {
					name: input.name.trim(),
					nodes,
					instructions,
					compilerVersion: 1
				};
			}
			if (typeof input.instructions !== "string" || !input.instructions.trim() || input.instructions.length > 64e3) throw new TypeError("Укажите инструкции длиной до 64 000 символов.");
			return {
				name: input.name.trim(),
				instructions: input.instructions
			};
		}
		//#endregion
		//#region src/features/presets/shared/sillytavern.js
		const BUILTINS = /* @__PURE__ */ new Set([
			"main",
			"nsfw",
			"jailbreak",
			"enhanceDefinitions",
			"chatHistory",
			"dialogueExamples",
			"worldInfoBefore",
			"worldInfoAfter",
			"charDescription",
			"charPersonality",
			"scenario",
			"personaDescription"
		]);
		function promptOrder(record) {
			if (record.prompt_order === void 0) return void 0;
			const orders = record.prompt_order;
			if (!Array.isArray(orders)) throw new TypeError("Порядок блоков SillyTavern должен быть списком.");
			if (!orders.length || orders.every((entry) => typeof entry?.identifier === "string")) return orders;
			if (orders.some((entry) => !entry || !Array.isArray(entry.order))) throw new TypeError("Порядок блоков SillyTavern повреждён.");
			const selected = orders.find((entry) => String(entry.character_id) === "100001") ?? orders.find((entry) => String(entry.character_id) === "100000") ?? (orders.length === 1 ? orders[0] : null);
			if (!selected) throw new TypeError("В файле несколько порядков для персонажей. Экспортируйте один порядок через Prompt Manager SillyTavern.");
			return selected.order;
		}
		/** Import static instruction bodies, never ST runtime slots or executable extensions. */
		function convertSillyTavernPreset(record, { filename = "" } = {}) {
			if (!Array.isArray(record.prompts) || record.prompts.length > 256) throw new TypeError(`В пресете SillyTavern может быть не больше 256 блоков.`);
			const prompts = /* @__PURE__ */ new Map();
			record.prompts.forEach((prompt, index) => {
				if (!prompt || typeof prompt.identifier !== "string" || !prompt.identifier.trim() || prompts.has(prompt.identifier)) throw new TypeError("У блоков SillyTavern должны быть уникальные идентификаторы.");
				if (prompt.marker !== void 0 && typeof prompt.marker !== "boolean") throw new TypeError("Маркер блока SillyTavern повреждён.");
				if (prompt.role !== void 0 && typeof prompt.role !== "string") throw new TypeError("Роль блока SillyTavern повреждена.");
				if (prompt.enabled !== void 0 && typeof prompt.enabled !== "boolean") throw new TypeError("Переключатель блока SillyTavern повреждён.");
				if (prompt.marker !== true && prompt.content !== void 0 && typeof prompt.content !== "string") throw new TypeError("Текст блока SillyTavern должен быть строкой.");
				if (prompt.injection_position !== void 0 && ![0, 1].includes(prompt.injection_position)) throw new TypeError("Позиция вставки SillyTavern не поддерживается.");
				if (prompt.injection_trigger !== void 0 && (!Array.isArray(prompt.injection_trigger) || prompt.injection_trigger.some((trigger) => typeof trigger !== "string"))) throw new TypeError("Условия вставки SillyTavern повреждены.");
				prompts.set(prompt.identifier, {
					prompt,
					index
				});
			});
			const order = promptOrder(record);
			const seen = /* @__PURE__ */ new Set();
			const nodes = [];
			let afterHistory = false, incompatible = 0, missing = 0;
			function append(identifier, enabled, ordered) {
				const entry = prompts.get(identifier);
				if (!entry) {
					if (!BUILTINS.has(identifier)) missing++;
					return;
				}
				const { prompt, index } = entry;
				if (prompt.marker === true) return;
				const role = prompt.role ?? "system";
				const annotations = [];
				if (role !== "system") annotations.push(`роль ${role}`);
				if (prompt.injection_position === 1) annotations.push(`вставка в историю: ${prompt.injection_depth ?? 4}`);
				else if (ordered && afterHistory) annotations.push("после истории");
				if (prompt.injection_trigger?.length) annotations.push("условная вставка");
				if (annotations.length) incompatible++;
				const title = typeof prompt.name === "string" && prompt.name.trim() ? prompt.name.trim() : identifier;
				const suffix = annotations.length ? ` · ${annotations.join(", ")}` : "";
				nodes.push({
					id: `st-${index}`,
					kind: "block",
					title: `${title.slice(0, Math.max(1, 120 - suffix.length))}${suffix}`.slice(0, 120),
					enabled: enabled && !annotations.length,
					text: prompt.content ?? ""
				});
			}
			if (order !== void 0) for (const entry of order) {
				if (!entry || typeof entry.identifier !== "string" || !entry.identifier.trim() || seen.has(entry.identifier) || typeof entry.enabled !== "boolean") throw new TypeError("Порядок или переключатели SillyTavern повреждены.");
				seen.add(entry.identifier);
				append(entry.identifier, entry.enabled, true);
				if (entry.identifier === "chatHistory") afterHistory = true;
			}
			for (const { prompt } of prompts.values()) if (!seen.has(prompt.identifier)) append(prompt.identifier, order === void 0 ? prompt.enabled ?? true : false, false);
			if (!nodes.length) throw new TypeError("В файле SillyTavern нет текстовых блоков для импорта.");
			const fileName = filename.split(/[\\/]/).at(-1).replace(/\.json$/i, "").trim();
			const preset = validatePreset({
				name: (typeof record.name === "string" && record.name.trim() ? record.name.trim() : fileName || "SillyTavern").slice(0, 120),
				nodes
			});
			const warnings = ["Перенесены текстовые блоки; настройки генерации и служебные вставки ST не применены."];
			if (nodes.some((node) => /\{\{[^}]*\}\}/.test(node.text))) warnings.push("Макросы ST сохранены как текст.");
			if (incompatible) warnings.push(`Блоки с несовместимыми ролями или вставками оставлены выключенными: ${incompatible}.`);
			if (missing) warnings.push(`В файле отсутствуют блоки из порядка: ${missing}.`);
			return {
				preset,
				warnings
			};
		}
		const FORMAT = "mayori-preset";
		function editablePreset(input) {
			const data = validatePreset(input);
			return validatePreset({
				name: data.name,
				nodes: presetNodes(data)
			});
		}
		/** Portable authoring data; catalog IDs and model projections are not imported. */
		function parsePresetFile(text, options = {}) {
			if (typeof text !== "string") throw new TypeError("Выберите JSON-файл пресета.");
			if (text.length > 1048576 || new TextEncoder().encode(text).byteLength > 1048576) throw new TypeError("Размер файла пресета не должен превышать 1 МБ.");
			let record;
			try {
				record = JSON.parse(text.replace(/^\uFEFF/, ""));
			} catch {
				throw new TypeError("Не удалось прочитать JSON. Проверьте файл пресета.");
			}
			if (record?.format !== void 0) {
				if (record.format !== FORMAT || record.version !== 1) throw new TypeError("Формат или версия файла пресета не поддерживается.");
				return {
					preset: editablePreset(record.preset),
					warnings: []
				};
			}
			if (record?.prompts !== void 0) return convertSillyTavernPreset(record, options);
			if (record?.data?.prompts !== void 0 && ["full", "character"].includes(record.type)) {
				if (record.version !== 1) throw new TypeError("Версия экспорта Prompt Manager SillyTavern не поддерживается.");
				return convertSillyTavernPreset(record.data, options);
			}
			return {
				preset: editablePreset(record),
				warnings: []
			};
		}
		function exportPreset(preset) {
			const { name, nodes } = editablePreset(preset);
			return {
				filename: `preset-${name.replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-").slice(0, 80).trim() || "untitled"}.mayori.json`,
				text: `${JSON.stringify({
					format: FORMAT,
					version: 1,
					preset: {
						name,
						nodes
					}
				}, null, 2)}\n`
			};
		}
		//#endregion
		//#region src/features/presets/client/files.js
		async function readPresetFile(file) {
			if (file.size > 1048576) throw new TypeError(tr("Размер файла пресета не должен превышать 1 МБ."));
			return parsePresetFile(await file.text(), { filename: file.name });
		}
		function downloadPreset(preset) {
			const { filename, text } = exportPreset(preset);
			const url = URL.createObjectURL(new Blob([text], { type: "application/json;charset=utf-8" }));
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			document.body.append(link);
			try {
				link.click();
			} finally {
				link.remove();
				setTimeout(() => URL.revokeObjectURL(url), 1e3);
			}
		}
		//#endregion
		//#region src/features/presets/client/panel.jsx
		const blank = () => ({
			name: "",
			instructions: ""
		});
		function PresetIcon({ size = 20 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 7h8M8 12h8M8 17h5" })]
			});
		}
		function Glyph({ kind }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "18",
				height: "18",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: kind === "plus" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 5v14M5 12h14" }) : kind === "search" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "10.5",
					cy: "10.5",
					r: "6.5"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m16 16 4 4" })] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "5",
						cy: "12",
						r: "1"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "12",
						r: "1"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "19",
						cy: "12",
						r: "1"
					})
				] })
			});
		}
		function PresetPanel({ presets, sessions, presetFor }) {
			const id = (0, react.useId)();
			const snapshot = (0, react.useSyncExternalStore)(presets.subscribe, presets.getSnapshot, presets.getSnapshot);
			const catalog = (0, react.useSyncExternalStore)(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot);
			const currentId = catalog.ids.find((id) => catalog.byId[id]?.retainedBy?.mainView > 0);
			const editor = presets.editor;
			const { draft, saved, busy, error, notice } = (0, react.useSyncExternalStore)(editor.subscribe, editor.getSnapshot, editor.getSnapshot);
			const [query, setQuery] = (0, react.useState)("");
			const [current, setCurrent] = (0, react.useState)(null);
			const nameRef = (0, react.useRef)(null);
			const formRef = (0, react.useRef)(null);
			const menuRef = (0, react.useRef)(null);
			const libraryRef = (0, react.useRef)(null);
			const importRef = (0, react.useRef)(null);
			const dirty = presetChanged(draft, saved);
			const disabled = busy || snapshot.status === "loading";
			const currentReady = currentId && current?.status === "ready";
			const currentLibrary = snapshot.presets.find((preset) => preset.id === current?.preset?.id);
			const currentOutdated = currentLibrary && presetChanged(currentLibrary, current.preset);
			const matches = filterPresets(snapshot.presets, query);
			(0, react.useEffect)(() => {
				editor.initialize(snapshot);
			}, [editor, snapshot]);
			(0, react.useEffect)(() => {
				let active = true;
				setCurrent(null);
				if (!currentId) return;
				const provider = presetFor(currentId);
				const update = () => {
					if (active) setCurrent(provider.getSnapshot());
				};
				const unsubscribe = provider.subscribe(update);
				provider.refresh();
				update();
				return () => {
					active = false;
					unsubscribe();
				};
			}, [currentId, presetFor]);
			(0, react.useEffect)(() => {
				if (!dirty) return;
				const warn = (event) => {
					event.preventDefault();
					event.returnValue = "";
				};
				window.addEventListener("beforeunload", warn);
				return () => {
					window.removeEventListener("beforeunload", warn);
				};
			}, [dirty]);
			(0, react.useEffect)(() => {
				const close = (event) => {
					if (menuRef.current && !menuRef.current.contains(event.target)) menuRef.current.open = false;
				};
				window.addEventListener("pointerdown", close);
				return () => {
					window.removeEventListener("pointerdown", close);
				};
			}, []);
			const run = async (operation, success) => {
				if (editor.getSnapshot().busy) return;
				editor.update({
					busy: true,
					error: "",
					notice: ""
				});
				try {
					const result = await operation();
					editor.update({ notice: result === false ? "" : typeof success === "function" ? success(result) : success });
				} catch (failure) {
					editor.update({ error: failure.message || tr("Не удалось выполнить действие. Попробуйте ещё раз.") });
				} finally {
					editor.update({ busy: false });
				}
			};
			const choose = (preset) => {
				if (dirty && !window.confirm(tr("Перейти к другому пресету? Несохранённые изменения будут потеряны."))) return false;
				editor.choose(preset);
				if (menuRef.current) menuRef.current.open = false;
				if (libraryRef.current) libraryRef.current.open = false;
				nameRef.current?.focus();
				return true;
			};
			const field = (key, value) => {
				editor.change(key, value);
			};
			const importFile = (event) => {
				const file = event.target.files[0];
				event.target.value = "";
				if (file) run(async () => {
					const imported = await readPresetFile(file);
					return choose(imported.preset) ? imported : false;
				}, (imported) => [tr("Пресет импортирован."), ...imported.warnings].join(" "));
			};
			const save = async () => {
				const value = await presets.save(draft);
				editor.accept(value);
				return value;
			};
			const apply = () => {
				if (!formRef.current.reportValidity()) return;
				run(async () => {
					const value = dirty || !draft.id ? await save() : draft;
					await presetFor(currentId).select(value.id);
				}, tr("Инструкции применены к текущему чату."));
			};
			const remove = () => {
				menuRef.current.open = false;
				if (!window.confirm(tr("Удалить пресет «{p1}»? В созданных чатах его инструкции сохранятся.", { p1: saved.name }))) return;
				run(async () => {
					await presets.remove(draft.id);
					const next = presets.getSnapshot().presets[0] ?? blank();
					editor.choose(next);
				}, tr("Пресет удалён из библиотеки."));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
				className: "mayori-presets-panel",
				"aria-labelledby": `${id}-title`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-presets-content",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "mayori-presets-header",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
								id: `${id}-title`,
								children: tr("Пресеты")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-presets-header-actions",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										ref: importRef,
										type: "file",
										hidden: true,
										accept: ".json,application/json",
										"aria-label": tr("Файл пресета"),
										onChange: importFile
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "mayori-preset-button",
										disabled,
										onClick: () => importRef.current.click(),
										children: tr("Импорт")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: "mayori-preset-button",
										disabled,
										onClick: () => choose(blank()),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, { kind: "plus" }), tr("Создать пресет")]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-presets-usage",
							"aria-label": tr("Выбор пресетов для чатов"),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-usage",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									htmlFor: `${id}-default`,
									children: tr("Для новых чатов")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
									id: `${id}-default`,
									"aria-label": tr("Для новых чатов"),
									value: snapshot.defaultId ?? "",
									disabled,
									onChange: (value) => {
										run(() => presets.setDefault(value || null), tr("Выбор для новых чатов сохранён."));
									},
									options: [{
										value: "",
										label: tr("Без пресета")
									}, ...snapshot.presets.map((preset) => ({
										value: preset.id,
										label: preset.name
									}))]
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-usage",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
										htmlFor: `${id}-current`,
										children: tr("Текущий чат")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-preset-current-control",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
											id: `${id}-current`,
											"aria-label": tr("Текущий чат"),
											value: current?.preset?.id ?? "",
											disabled: disabled || !currentReady,
											"aria-describedby": currentId ? `${id}-current-help` : void 0,
											onChange: (value) => {
												run(() => presetFor(currentId).select(value || null), tr("Инструкции применены к текущему чату."));
											},
											options: [
												{
													value: "",
													label: !currentId ? tr("Нет открытого чата") : !current || current.status === "loading" ? tr("Загружаем…") : tr("Без пресета")
												},
												...current?.preset && !currentLibrary ? [{
													value: current.preset.id,
													label: tr("{p1} · копия из чата", { p1: current.preset.name })
												}] : [],
												...snapshot.presets.map((preset) => ({
													value: preset.id,
													label: preset.name
												}))
											]
										}), currentOutdated && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mayori-preset-button",
											disabled: disabled || !currentReady,
											onClick: () => {
												run(() => presetFor(currentId).select(currentLibrary.id), tr("Инструкции в чате обновлены."));
											},
											children: tr("Обновить инструкции")
										})]
									}),
									currentId && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										id: `${id}-current-help`,
										children: currentOutdated ? tr("В чате действует прежняя версия.") : tr("Применяется со следующего хода.")
									}),
									current?.error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
										role: "alert",
										children: [
											noticeText(current.error),
											" ",
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: "mayori-preset-text-button",
												onClick: () => {
													presetFor(currentId).refresh();
												},
												children: tr("Повторить загрузку")
											})
										]
									})
								]
							})]
						}),
						snapshot.error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							role: "alert",
							className: "mayori-preset-error",
							children: [
								noticeText(snapshot.error),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mayori-preset-button",
									disabled: busy,
									onClick: () => {
										run(() => presets.refresh(), tr("Список обновлён."));
									},
									children: tr("Обновить список")
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
							ref: libraryRef,
							className: "mayori-preset-library-disclosure",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: tr("Библиотека пресетов · {p1}{p2}", {
								p1: snapshot.presets.length,
								p2: draft.id ? ` · ${saved.name}` : tr(" · Новый пресет")
							}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-preset-library",
								"aria-label": tr("Библиотека пресетов"),
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "mayori-preset-search",
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "mayori-dice-sr",
												children: tr("Поиск пресетов")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, { kind: "search" }),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
												type: "search",
												placeholder: tr("Найти пресет…"),
												value: query,
												onChange: (event) => setQuery(event.target.value)
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: "mayori-preset-list",
										children: matches.map((preset) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: "mayori-preset-row",
											"aria-pressed": draft.id === preset.id,
											disabled: busy,
											onClick: () => choose(preset),
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "mayori-preset-row-title",
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PresetIcon, { size: 18 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: preset.name })]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "mayori-preset-preview",
													children: preset.instructions
												}),
												(snapshot.defaultId === preset.id || current?.preset?.id === preset.id) && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: "mayori-preset-tags",
													children: [snapshot.defaultId === preset.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Новые чаты") }), current?.preset?.id === preset.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Текущий чат") })]
												})
											]
										}) }, preset.id))
									}),
									snapshot.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-preset-empty",
										children: tr("Загружаем пресеты…")
									}),
									snapshot.status === "ready" && !snapshot.presets.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-preset-empty",
										children: tr("Нет пресетов.")
									}),
									query && !matches.length && !!snapshot.presets.length && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-preset-empty",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("По запросу «{p1}» ничего не найдено.", { p1: query }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "mayori-preset-text-button",
											onClick: () => setQuery(""),
											children: tr("Сбросить поиск")
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "mayori-presets-workspace",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
								ref: formRef,
								className: "mayori-preset-editor",
								onSubmit: (event) => {
									event.preventDefault();
									run(save, tr("Пресет сохранён."));
								},
								onKeyDown: (event) => {
									if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
										event.preventDefault();
										if (!disabled) formRef.current.requestSubmit();
									}
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-preset-editor-heading",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: draft.id ? saved.name : tr("Новый пресет") }), (dirty || draft.id) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-preset-save-state",
											children: dirty ? tr("Есть несохранённые изменения") : tr("Сохранён в библиотеке")
										})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
											ref: menuRef,
											className: "mayori-preset-menu",
											onBlur: (event) => {
												if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false;
											},
											onKeyDown: (event) => {
												if (event.key === "Escape") {
													event.currentTarget.open = false;
													event.currentTarget.querySelector("summary").focus();
													event.stopPropagation();
												}
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: tr("Действия с пресетом"),
												side: "top",
												portal: true,
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", {
													"aria-label": tr("Действия с пресетом"),
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Glyph, { kind: "more" })
												})
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [
												draft.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													disabled: busy,
													onClick: () => choose({
														...draft,
														id: void 0,
														name: tr("{p1} — копия", { p1: draft.name }).slice(0, 120)
													}),
													children: tr("Дублировать пресет")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													disabled,
													onClick: () => {
														menuRef.current.open = false;
														menuRef.current.querySelector("summary").focus();
														run(() => downloadPreset(draft), tr("Пресет экспортирован."));
													},
													children: tr("Экспорт")
												}),
												draft.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: "mayori-preset-delete",
													disabled: busy,
													onClick: remove,
													children: tr("Удалить пресет")
												})
											] })]
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-preset-name-field",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
											htmlFor: `${id}-name`,
											children: tr("Название")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											id: `${id}-name`,
											ref: nameRef,
											name: "presetName",
											autoComplete: "off",
											placeholder: tr("Например, камерное фэнтези"),
											required: true,
											maxLength: 120,
											value: draft.name,
											disabled,
											onChange: (event) => field("name", event.target.value)
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(PresetStructureEditor, {
										editor,
										disabled
									}),
									error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										role: "alert",
										className: "mayori-preset-error",
										children: noticeText(error)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("footer", {
										className: "mayori-preset-editor-footer",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "mayori-preset-feedback",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												role: "status",
												children: busy ? tr("Подождите…") : noticeText(notice)
											})
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-preset-editor-actions",
											children: [
												dirty && draft.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: "mayori-preset-text-button",
													disabled,
													onClick: () => {
														editor.reset();
													},
													children: tr("Отменить изменения")
												}),
												currentId && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: "mayori-preset-button",
													disabled: disabled || !currentReady,
													onClick: apply,
													children: dirty || !draft.id ? tr("Сохранить и применить") : tr("Применить к чату")
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
													className: "mayori-preset-button mayori-preset-primary",
													type: "submit",
													disabled,
													"aria-busy": busy,
													children: tr("Сохранить пресет")
												})
											]
										})]
									})
								]
							})
						})
					]
				})
			});
		}
		//#endregion
		//#region src/features/message-revisions/domain/revisions.js
		/** Native parent links own branch navigation; no second version store is needed. */
		function branchRows(snapshot, sessionId) {
			const rows = snapshot.byId;
			const rootOf = (id) => {
				const seen = /* @__PURE__ */ new Set();
				while (rows[id]?.parentId && rows[rows[id].parentId] && !seen.has(id)) {
					seen.add(id);
					id = rows[id].parentId;
				}
				return id;
			};
			const root = rootOf(sessionId);
			return snapshot.ids.filter((id) => rows[id]?.origin !== "subagent" && rootOf(id) === root).sort((a, b) => a === root ? -1 : b === root ? 1 : (rows[a].updatedAt ?? 0) - (rows[b].updatedAt ?? 0) || a.localeCompare(b)).map((id, index) => ({
				id,
				label: id === root ? "Исходный чат" : `Ветка ${index + (snapshot.ids.includes(root) ? 0 : 1)} · ${rows[id].title?.trim() || "Чат без названия"}`
			}));
		}
		//#endregion
		//#region src/features/message-revisions/client/revisions.js
		/** A refreshed browser must never send a save to the older generating edit API. */
		function assertSafeEdit(value) {
			if (value?.editRunsModel !== false || !Array.isArray(value.editModes) || !["current", "branch"].every((mode) => value.editModes.includes(mode))) throw new Error(tr("Редактор обновлён, но Host использует старую версию. Перезапустите Mayori и обновите страницу перед редактированием."));
		}
		function assertCurrentRegeneration(value) {
			if (value?.regenerateMode !== "current") throw new Error(tr("Host использует старый повтор с созданием ветки. Перезапустите Mayori и обновите страницу."));
			if (value.regenerateKeepsVariants !== true) throw new Error(tr("Для сохранения вариантов перезапустите Mayori и обновите страницу."));
		}
		var MessageRevisionClient = class {
			getSnapshot() {
				throw new Error("MessageRevisionClient.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("MessageRevisionClient.subscribe() is not implemented");
			}
			inspect() {
				throw new Error("MessageRevisionClient.inspect() is not implemented");
			}
			edit() {
				throw new Error("MessageRevisionClient.edit() is not implemented");
			}
			remove() {
				throw new Error("MessageRevisionClient.remove() is not implemented");
			}
			regenerate() {
				throw new Error("MessageRevisionClient.regenerate() is not implemented");
			}
			selectVariant() {
				throw new Error("MessageRevisionClient.selectVariant() is not implemented");
			}
		};
		var RemoteMessageRevisionProvider = class extends MessageRevisionClient {
			#snapshot = {
				busy: false,
				edits: {},
				variants: []
			};
			#listeners = /* @__PURE__ */ new Set();
			#loading;
			#revision = 0;
			#editReady = false;
			#currentReady = false;
			constructor(sessionId, open, loadThrough = async () => {}) {
				super();
				this.sessionId = sessionId;
				this.open = open;
				this.loadThrough = loadThrough;
			}
			async #loadVariants(variants) {
				const selected = variants.filter((group) => group.replySeq !== null).map((group) => group.startSeq).filter(Number.isSafeInteger);
				if (selected.length) await this.loadThrough(Math.min(...selected));
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(update) {
				this.#snapshot = {
					...this.#snapshot,
					...update
				};
				for (const listener of this.#listeners) listener();
			}
			refresh() {
				if (this.#loading) return this.#loading;
				const revision = this.#revision;
				this.#loading = Promise.all([call("message-revisions", { sessionId: this.sessionId }), call("message-variants", { sessionId: this.sessionId })]).then(async ([edits, variants]) => {
					if (revision === this.#revision) {
						this.#publish({
							edits,
							variants,
							error: null
						});
						await this.#loadVariants(variants);
					}
					return edits;
				}).catch((error) => {
					if (revision === this.#revision) this.#publish({ error: error.message });
					return null;
				}).finally(() => {
					this.#loading = void 0;
				});
				return this.#loading;
			}
			async inspect(seq) {
				const value = await call("message-inspect", {
					sessionId: this.sessionId,
					seq
				});
				try {
					assertSafeEdit(value);
					this.#editReady = true;
				} catch {
					this.#editReady = false;
				}
				this.#currentReady = value?.regenerateMode === "current" && value.regenerateKeepsVariants === true;
				return value;
			}
			async #change(endpoint, input) {
				if (this.#snapshot.busy) throw new Error(tr("Дождитесь сохранения текущей реплики."));
				this.#publish({
					busy: true,
					error: null
				});
				let submitted = false;
				try {
					if (endpoint === "message-edit" && !this.#editReady) assertSafeEdit(await this.inspect(input.seq));
					if (endpoint === "message-regenerate" && !this.#currentReady) assertCurrentRegeneration(await this.inspect(input.seq));
					submitted = true;
					const value = await call(endpoint, {
						sessionId: this.sessionId,
						...input
					});
					if (value.changed && value.sessionId !== this.sessionId) await this.open(value.sessionId);
					if (value.changed && value.sessionId === this.sessionId) {
						++this.#revision;
						if (value.edits) this.#publish({
							edits: value.edits,
							...value.variants ? { variants: value.variants } : {}
						});
						else {
							await this.#loading;
							await this.refresh();
						}
						if (value.variants) await this.#loadVariants(value.variants);
					}
					return value;
				} catch (error) {
					if (submitted && !(endpoint === "message-edit" && input.mode === "branch")) {
						++this.#revision;
						await this.#loading;
						await this.refresh();
					}
					throw error;
				} finally {
					this.#publish({ busy: false });
				}
			}
			edit(seq, text, mode = "current") {
				return this.#change("message-edit", {
					seq,
					text,
					mode
				});
			}
			remove(seq) {
				return this.#change("message-remove", { seq });
			}
			regenerate(seq) {
				return this.#change("message-regenerate", { seq });
			}
			selectVariant(seq, index) {
				return this.#change("message-variant", {
					seq,
					index
				});
			}
			dispose() {
				++this.#revision;
				this.#listeners.clear();
			}
		};
		//#endregion
		//#region src/features/message-revisions/client/controls.jsx
		function RevisionIcon({ repeat, remove }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				focusable: "false",
				children: remove ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" }) }) : repeat ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 7v5h-5" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M20 12a8 8 0 1 0-2.3 5.7M20 12l-3-4" })] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z" }) })
			});
		}
		/** Use the stock user message's existing clock/copy row inside our owned wrapper. */
		function UserRevisionToolbar({ container, children }) {
			const [toolbar, setToolbar] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				const root = container.current;
				const sync = () => {
					setToolbar(root.querySelector("[data-clock=\"start\"]"));
				};
				sync();
				const observer = new MutationObserver(sync);
				observer.observe(root, {
					childList: true,
					subtree: true
				});
				return () => {
					observer.disconnect();
				};
			}, [container]);
			return toolbar ? (0, react_dom.createPortal)(children, toolbar) : null;
		}
		/** Character state gates actions contributed to the native assistant-actions slot. */
		function AssistantRevisionActions({ chatFor, revisionFor, sessionId, closing, useSession, turn }) {
			const chat = chatFor(sessionId);
			const snapshot = (0, react.useSyncExternalStore)(chat.subscribe, chat.getSnapshot, chat.getSnapshot);
			const seq = closing?.finalNode?.seq;
			const greeting = snapshot.value?.greeting;
			const blocks = greeting && greeting.messageId === closing?.finalNode?.messageId ? [{
				kind: "text",
				text: greeting.text
			}] : closing?.blocks ?? [];
			if (!snapshot.value?.character || !revisionFor || !useSession || !Number.isSafeInteger(seq) || seq < 1 || blocks.some((block) => block.kind === "tool-call") || !blocks.some((block) => block.kind === "text" && block.text.trim())) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MessageRevisionControls, {
				revisions: revisionFor(sessionId),
				seq,
				useSession,
				canRepeat: turn > 1
			});
		}
		/** The author chooses where to save; editing never starts model work. */
		function MessageRevisionControls({ revisions, seq, canRepeat, useSession }) {
			const snapshot = (0, react.useSyncExternalStore)(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot);
			const activity = useSession((state) => state.running || state.awaitingFirstTurn || state.pendingSubmissions.length > 0);
			const dialog = (0, react.useRef)(null);
			const trigger = (0, react.useRef)(null);
			const field = (0, react.useRef)(null);
			const epoch = (0, react.useRef)(0);
			const pending = (0, react.useRef)(false);
			const titleId = (0, react.useId)();
			const textId = (0, react.useId)();
			const errorId = (0, react.useId)();
			const [editor, setEditor] = (0, react.useState)(null);
			const [text, setText] = (0, react.useState)("");
			const [error, setError] = (0, react.useState)("");
			const [loading, setLoading] = (0, react.useState)(false);
			(0, react.useEffect)(() => () => {
				++epoch.current;
			}, []);
			(0, react.useEffect)(() => {
				if (editor) dialog.current?.showModal();
				else trigger.current?.focus();
			}, [editor]);
			const busy = activity || snapshot.busy || loading;
			const open = async (mode, button) => {
				if (busy || pending.current) return;
				pending.current = true;
				const revision = ++epoch.current;
				trigger.current = button;
				setError("");
				setLoading(true);
				try {
					const value = await revisions.inspect(seq);
					if (revision !== epoch.current) return;
					if (mode === "edit") assertSafeEdit(value);
					if (mode === "regenerate") {
						assertCurrentRegeneration(value);
						if (!value.canRegenerate) throw new Error(value.regenerateError || tr("У этой реплики нет хода игрока для повторной генерации."));
					}
					if (mode === "delete" && !value.canDelete) throw new Error(tr("Перезапустите Mayori и обновите страницу для удаления сообщений."));
					if (mode === "regenerate") await revisions.regenerate(seq);
					else {
						setText(mode === "edit" ? value.text : "");
						setEditor({
							mode,
							...value
						});
					}
				} catch (failure) {
					if (revision === epoch.current) setError(failure.message);
				} finally {
					pending.current = false;
					if (revision === epoch.current) setLoading(false);
				}
			};
			const close = () => {
				if (!snapshot.busy) dialog.current?.close();
			};
			const submit = async (event) => {
				event.preventDefault();
				event.stopPropagation();
				if (busy || pending.current) return;
				if (editor.mode === "edit" && !text.trim()) {
					setError(tr("Введите текст сообщения."));
					field.current?.focus();
					return;
				}
				pending.current = true;
				setError("");
				const revision = epoch.current;
				try {
					if (editor.mode === "edit") await revisions.edit(seq, text, event.nativeEvent?.submitter?.value === "branch" ? "branch" : "current");
					else await revisions.remove(seq);
					if (revision === epoch.current) dialog.current?.close();
				} catch (failure) {
					if (revision === epoch.current) setError(failure.message);
				} finally {
					pending.current = false;
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: "mayori-message-actions",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
							label: tr("Редактировать"),
							"aria-haspopup": "dialog",
							"aria-disabled": busy || void 0,
							onClick: (event) => {
								open("edit", event.currentTarget);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RevisionIcon, {})
						}),
						canRepeat && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
							label: tr("Повторить ответ"),
							"aria-disabled": busy || void 0,
							onClick: (event) => {
								open("regenerate", event.currentTarget);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RevisionIcon, { repeat: true })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
							label: tr("Удалить сообщение"),
							"aria-haspopup": "dialog",
							"aria-disabled": busy || void 0,
							onClick: (event) => {
								open("delete", event.currentTarget);
							},
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RevisionIcon, { remove: true })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "mayori-revision-status",
							role: "status",
							children: loading ? tr("Загружаем реплику…") : snapshot.busy ? tr("Сохраняем…") : ""
						})
					]
				}),
				error && !editor && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mayori-error",
					children: noticeText(error)
				}),
				editor && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
					ref: dialog,
					className: `mayori-message-editor${editor.mode === "delete" ? " mayori-message-confirm" : ""}`,
					"aria-labelledby": titleId,
					onCancel: (event) => {
						if (snapshot.busy) event.preventDefault();
					},
					onKeyDown: (event) => {
						event.stopPropagation();
					},
					onClose: () => {
						setEditor(null);
						setError("");
					},
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: titleId,
								children: editor.mode === "edit" ? tr("Редактировать сообщение") : tr("Удалить сообщение?")
							}),
							editor.mode === "edit" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								htmlFor: textId,
								children: editor.role === "user" ? tr("Реплика игрока") : tr("Реплика персонажа")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								ref: field,
								id: textId,
								autoFocus: true,
								value: text,
								disabled: snapshot.busy,
								"aria-invalid": error && !text.trim() ? true : void 0,
								"aria-describedby": error ? errorId : void 0,
								onChange: (event) => {
									setText(event.target.value);
									setError("");
								},
								onKeyDown: (event) => {
									if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
										event.preventDefault();
										event.currentTarget.form.requestSubmit();
									}
								}
							})] }),
							error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								id: errorId,
								role: "alert",
								className: "mayori-error",
								children: noticeText(error)
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-message-editor-actions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									autoFocus: editor.mode === "delete",
									disabled: snapshot.busy,
									onClick: close,
									children: tr("Отмена")
								}), editor.mode === "edit" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									value: "current",
									disabled: busy,
									children: tr("Сохранить в чате")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									value: "branch",
									disabled: busy,
									children: tr("Создать ветку")
								})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: busy,
									children: snapshot.busy ? tr("Удаляем…") : tr("Удалить")
								})]
							})
						]
					})
				}), document.body)
			] });
		}
		/** The DSH catalog retains explicitly authored branches across reload and restart. */
		function RevisionBranchNavigation({ sessionId, sessions, open }) {
			const rows = branchRows((0, react.useSyncExternalStore)(sessions.list.subscribe, sessions.list.getSnapshot, sessions.list.getSnapshot), sessionId);
			if (rows.length < 2) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-revision-branches",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Ветка чата") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
					"aria-label": tr("Ветка чата"),
					value: sessionId,
					onChange: open,
					options: rows.map((row) => ({
						value: row.id,
						label: noticeText(row.label)
					}))
				})]
			});
		}
		//#endregion
		//#region src/features/message-revisions/client/variants.js
		/** Saved answers use the same compact, cyclic navigation as authored greetings. */
		function AnswerVariantNavigation({ revisions, group, useSession, IconButton }) {
			const snapshot = (0, react.useSyncExternalStore)(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot);
			const activity = useSession((state) => state.running || state.awaitingFirstTurn || state.pendingSubmissions.length > 0);
			const pending = (0, react.useRef)(false);
			const [error, setError] = (0, react.useState)("");
			const swipe = async (direction) => {
				if (pending.current || snapshot.busy || activity || !group.count) return;
				pending.current = true;
				setError("");
				const index = group.index < 0 ? direction < 0 ? group.count - 1 : 0 : (group.index + direction + group.count) % group.count;
				try {
					await revisions.selectVariant(group.replySeq ?? group.groupId, index);
				} catch (failure) {
					setError(failure.message);
				} finally {
					pending.current = false;
					requestAnimationFrame(() => {
						if (document.activeElement !== document.body) return;
						[...document.querySelectorAll(`[data-answer-variant-group="${group.groupId}"]`)].find((node) => node.dataset.answerVariantChat === revisions.sessionId)?.querySelector(direction < 0 ? "[data-variant-action=\"previous\"]" : "[data-variant-action=\"next\"]")?.focus();
					});
				}
			};
			if (group.count < 2 && group.index >= 0) return null;
			const busy = snapshot.busy || activity;
			return (0, react.createElement)("div", {
				className: "mayori-answer-variants",
				"data-answer-variant-group": group.groupId,
				"data-answer-variant-chat": revisions.sessionId
			}, (0, react.createElement)("div", {
				className: "mayori-greeting-swipes",
				"aria-label": tr("Варианты ответа")
			}, (0, react.createElement)(IconButton, {
				label: tr("Предыдущий вариант ответа"),
				"data-variant-action": "previous",
				disabled: busy,
				onClick: () => {
					swipe(-1);
				}
			}, "‹"), (0, react.createElement)("span", {
				role: "status",
				"aria-live": "polite"
			}, `${group.index < 0 ? "—" : group.index + 1} / ${group.count}`), (0, react.createElement)(IconButton, {
				label: tr("Следующий вариант ответа"),
				"data-variant-action": "next",
				disabled: busy,
				onClick: () => {
					swipe(1);
				}
			}, "›")), error ? (0, react.createElement)("p", {
				role: "alert",
				className: "mayori-error"
			}, noticeText(error)) : null);
		}
		function AnswerVariants({ revisions, seq, useSession, IconButton }) {
			const group = (0, react.useSyncExternalStore)(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot).variants.find((group) => group.replySeq === seq);
			return group ? (0, react.createElement)(AnswerVariantNavigation, {
				revisions,
				group,
				useSession,
				IconButton
			}) : null;
		}
		//#endregion
		//#region src/features/message-revisions/client/message.js
		/** Logged author corrections update their original rows, not a second context bubble. */
		function RevisionContextMessage({ stock, stockChildren, childPrefix, ...props }) {
			if ([
				"mayori-message-edit",
				"mayori-message-remove",
				"mayori-message-restore",
				"mayori-answer-variants"
			].includes(props.node.data.source?.kind)) return null;
			return (0, react.createElement)(stock, remapChildProps(props, stockChildren, childPrefix));
		}
		const PROCESS_KINDS = /* @__PURE__ */ new Set([
			"assistant-step",
			"tool-call",
			"turn-process",
			"turn-tail",
			"turn-trigger",
			"model-retry",
			"turn-error",
			"turn-max-tokens"
		]);
		/** Deleted replies retire their process; regeneration retires the whole old turn. */
		function removedNode(node, edits = {}) {
			const data = node.data;
			const seq = node.kind === "turn-tail" ? data.closing?.finalNode?.seq : node.kind === "assistant-step" ? data.finalNode?.seq : data.seq;
			if (edits[seq]?.deleted) return true;
			const turn = node.location?.turn?.turn ?? data.turn;
			return Object.values(edits).some((edit) => {
				if (!edit.deleted) return false;
				if (turn !== void 0 && edit.reason === "regenerate" && edit.turn === turn) return true;
				if (!edit.processRange || !PROCESS_KINDS.has(node.kind)) return false;
				if (node.kind === "turn-process" && edit.turn === turn) return true;
				const anchor = seq ?? node.anchorSeq ?? data.root?.seq;
				return anchor >= edit.processRange.startSeq && anchor <= edit.processRange.endSeq;
			});
		}
		/** Filter native flow entries so retired turns do not leave empty process group headers. */
		function visibleRevisionEntries(entries, nodes, groups, edits) {
			return entries.filter((entry) => {
				if (entry.kind === "node") {
					const node = nodes.get(entry.key);
					return !node || !removedNode(node, edits);
				}
				const group = groups?.groupSource(entry.key).getSnapshot();
				if (group?.data?.turn !== void 0 && Object.values(edits ?? {}).some((edit) => edit.deleted && edit.reason === "regenerate" && edit.turn === group.data.turn)) return false;
				if (group?.data?.turn !== void 0 && Object.values(edits ?? {}).some((edit) => edit.deleted && edit.processRange && edit.turn === group.data.turn)) {
					const process = group.members.map((member) => nodes.get(member.key)).filter((node) => node && PROCESS_KINDS.has(node.kind));
					if (process.length && process.every((node) => removedNode(node, edits))) return false;
				}
				return !group || !group.members.length || group.members.some((member) => {
					const node = nodes.get(member.key);
					return !node || !removedNode(node, edits);
				});
			});
		}
		function RevisionChatFlow({ stock, stockChildren, childPrefix, revisionFor, IconButton, ...props }) {
			const revisions = revisionFor(props.sessionId);
			const snapshot = (0, react.useSyncExternalStore)(revisions.subscribe, revisions.getSnapshot, revisions.getSnapshot);
			const nodes = props.useChat((state) => state.nodes);
			const groups = props.useConversation((state) => state.views.grouped("chat"));
			const activity = props.useSession?.((state) => state.running || (state.pendingSubmissions?.length ?? 0) > 0);
			(0, react.useEffect)(() => {
				revisions.refresh();
			}, [revisions, activity]);
			return [(0, react.createElement)(stock, {
				...remapChildProps(props, stockChildren, childPrefix),
				key: "flow",
				entries: visibleRevisionEntries(props.entries, nodes, groups, snapshot.edits)
			}), ...!activity ? snapshot.variants.filter((group) => group.replySeq === null || !nodes.values().some((node) => node.kind === "assistant-step" && node.data.finalNode?.seq === group.replySeq)).map((group) => (0, react.createElement)(AnswerVariantNavigation, {
				key: group.groupId,
				group,
				revisions,
				useSession: props.useSession,
				IconButton
			})) : []];
		}
		/** Apply a logged text edit to the native display/copy node without inventing model output. */
		function editedNode(node, edits) {
			const data = node.data;
			const seq = node.kind === "turn-tail" ? data.closing?.finalNode?.seq : node.kind === "assistant-step" ? data.finalNode?.seq : data.seq;
			const edit = edits?.[seq];
			if (!edit) return node;
			const blocks = (original) => [{
				kind: "text",
				text: edit.text
			}, ...(original ?? []).filter((block) => block.kind !== "text")];
			if (node.kind === "turn-tail") return {
				...node,
				data: {
					...data,
					mayoriEdited: true,
					closing: {
						...data.closing,
						blocks: blocks(data.closing.blocks),
						finalNode: {
							...data.closing.finalNode,
							blocks: blocks(data.closing.finalNode.blocks)
						}
					}
				}
			};
			if (node.kind === "assistant-step") return {
				...node,
				data: {
					...data,
					mayoriEdited: true,
					blocks: blocks(data.blocks)
				}
			};
			return {
				...node,
				data: {
					...data,
					content: edit.content
				}
			};
		}
		//#endregion
		//#region src/features/character-session/client/greeting.jsx
		/** Keep the shipped Markdown renderer; only authored greetings use the Host view. */
		function GreetingMessage({ stock: Stock, chatFor, ...props }) {
			return props.node.data.turn === 1 && props.node.data.step === 1 && props.node.data.finalNode ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AuthoredGreeting, {
				stock: Stock,
				chatFor,
				...props
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...props });
		}
		function AuthoredGreeting({ stock: Stock, chatFor, ...props }) {
			const chat = chatFor(props.sessionId);
			const snapshot = (0, react.useSyncExternalStore)(chat.subscribe, chat.getSnapshot, chat.getSnapshot);
			const activity = props.useSession((state) => state.running || state.pendingSubmissions.length > 0 || state.awaitingFirstTurn);
			const attempted = props.useSession((state) => state.promptAttempted);
			const started = props.useChat((state) => state.timeline.turnOrder.some((turn) => turn > 1));
			const pending = (0, react.useRef)(false);
			const [error, setError] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				chat.refresh();
			}, [
				chat,
				activity,
				attempted,
				started
			]);
			const candidate = snapshot.value?.greeting;
			const greeting = candidate?.messageId === props.node.data.finalNode?.messageId ? candidate : null;
			const node = greeting && !props.node.data.mayoriEdited ? {
				...props.node,
				data: {
					...props.node.data,
					blocks: greeting.text.trim() ? [{
						kind: "text",
						text: greeting.text
					}] : []
				}
			} : props.node;
			const swipe = async (direction) => {
				if (pending.current || activity || !greeting) return;
				pending.current = true;
				setError("");
				try {
					await chat.swipe((greeting.index + direction + greeting.count) % greeting.count);
				} catch (failure) {
					setError(failure.message);
				} finally {
					pending.current = false;
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-greeting-message",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
						...props,
						node
					}),
					greeting?.canSwipe && !props.node.data.mayoriEdited && greeting.count > 1 && !activity && !started && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-greeting-swipes",
						"aria-label": tr("Варианты приветствия"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
								label: tr("Предыдущее приветствие"),
								disabled: snapshot.status === "saving",
								onClick: () => {
									swipe(-1);
								},
								children: "‹"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								role: "status",
								"aria-live": "polite",
								children: [
									greeting.index + 1,
									" / ",
									greeting.count
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
								label: tr("Следующее приветствие"),
								disabled: snapshot.status === "saving",
								onClick: () => {
									swipe(1);
								},
								children: "›"
							})
						]
					}),
					(error || snapshot.error) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: "mayori-error",
						children: noticeText(error || snapshot.error)
					})
				]
			});
		}
		/** Copy and fork actions refer to the selected greeting, including logged swipes. */
		function GreetingTurnTail({ stock: Stock, stockChildren, childPrefix, chatFor, revisionFor, ...props }) {
			const mapped = remapChildProps(props, stockChildren, childPrefix);
			const revisions = revisionFor?.(props.sessionId);
			const revisionSnapshot = (0, react.useSyncExternalStore)(revisions?.subscribe ?? (() => () => {}), revisions?.getSnapshot ?? (() => null), revisions?.getSnapshot ?? (() => null));
			const activity = props.useSession?.((state) => state.running || (state.pendingSubmissions?.length ?? 0) > 0);
			(0, react.useEffect)(() => {
				revisions?.refresh?.();
			}, [revisions, activity]);
			if (removedNode(props.node, revisionSnapshot?.edits)) return null;
			mapped.node = editedNode(props.node, revisionSnapshot?.edits);
			const render = mapped.renderSlot;
			mapped.renderSlot = (name, owner, options) => name === "conversation.chat.assistant-actions" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [render(name, owner, options), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssistantRevisionActions, {
				chatFor,
				revisionFor,
				sessionId: props.sessionId,
				closing: props.node.data.closing,
				useSession: props.useSession,
				turn: props.node.data.turn
			})] }) : render(name, owner, options);
			return props.node.data.turn === 1 && props.node.data.closing ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AuthoredGreetingTail, {
				stock: Stock,
				chatFor,
				...mapped
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...mapped });
		}
		function AuthoredGreetingTail({ stock: Stock, chatFor, ...props }) {
			const chat = chatFor(props.sessionId);
			const greeting = (0, react.useSyncExternalStore)(chat.subscribe, chat.getSnapshot, chat.getSnapshot).value?.greeting;
			if (props.node.data.mayoriEdited || greeting?.messageId !== props.node.data.closing.finalNode.messageId) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...props });
			const blocks = greeting.text.trim() ? [{
				kind: "text",
				text: greeting.text
			}] : [];
			const node = {
				...props.node,
				data: {
					...props.node.data,
					seq: Math.max(props.node.data.seq, greeting.eventSeq ?? 0),
					closing: {
						...props.node.data.closing,
						blocks,
						finalNode: {
							...props.node.data.closing.finalNode,
							blocks
						}
					}
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
				...props,
				node
			});
		}
		//#endregion
		//#region src/features/character-session/client/messages.jsx
		function Avatar({ name, image }) {
			const dialog = (0, react.useRef)(null);
			const trigger = (0, react.useRef)(null);
			const titleId = (0, react.useId)();
			const [failed, setFailed] = (0, react.useState)(false);
			const [opened, setOpened] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setFailed(false);
			}, [image]);
			(0, react.useEffect)(() => {
				if (opened) dialog.current?.showModal();
			}, [opened]);
			const portrait = image && !failed;
			const close = () => {
				dialog.current?.close();
				setOpened(false);
				trigger.current?.focus();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
				ref: trigger,
				className: "mayori-message-avatar",
				label: tr("Открыть аватар: {p1}", { p1: name }),
				"aria-haspopup": "dialog",
				onClick: () => {
					setOpened(true);
				},
				onKeyDown: (event) => {
					if (event.key === "Enter" || event.key === " ") event.stopPropagation();
				},
				children: portrait ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
					src: image,
					alt: "",
					loading: "lazy",
					decoding: "async",
					onError: () => {
						setFailed(true);
					}
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					"aria-hidden": "true",
					children: Array.from(name.trim())[0]?.toLocaleUpperCase() || "?"
				})
			}), opened && (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dialog", {
				ref: dialog,
				className: "mayori-avatar-dialog",
				"aria-labelledby": titleId,
				onClose: () => {
					setOpened(false);
					trigger.current?.focus();
				},
				onCancel: (event) => {
					event.preventDefault();
					close();
				},
				onKeyDown: (event) => {
					event.stopPropagation();
				},
				onClick: (event) => {
					if (event.target !== event.currentTarget) return;
					const bounds = event.currentTarget.getBoundingClientRect();
					if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-avatar-dialog-header",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						id: titleId,
						children: name
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
						portal: false,
						autoFocus: true,
						onClick: close,
						label: tr("Закрыть аватар"),
						children: "×"
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "mayori-avatar-dialog-media",
					children: portrait ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
						src: originalImage(image),
						alt: tr("Аватар: {p1}", { p1: name }),
						decoding: "async",
						onError: () => {
							setFailed(true);
						}
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("Аватар пока не добавлен.") })
				})]
			}), document.body)] });
		}
		/** Keep the stock text column intact; use a separate row when its gutters cannot fit a portrait. */
		function MessageWithAvatar({ assistant, name, image, children, actions }) {
			const row = (0, react.useRef)(null);
			const [placement, setPlacement] = (0, react.useState)("above");
			(0, react.useEffect)(() => {
				const element = row.current;
				const viewport = element.ownerDocument.documentElement;
				const view = element.ownerDocument.defaultView;
				const clips = [];
				for (let parent = element.parentElement; parent; parent = parent.parentElement) {
					const style = view.getComputedStyle(parent);
					if ([style.overflowX, style.overflowY].some((value) => value !== "visible")) clips.push(parent);
				}
				const measure = () => {
					let left = 0;
					let right = viewport.clientWidth;
					for (const clip of clips) {
						const bounds = clip.getBoundingClientRect();
						left = Math.max(left, bounds.left + clip.clientLeft);
						right = Math.min(right, bounds.left + clip.clientLeft + clip.clientWidth);
					}
					const bounds = element.getBoundingClientRect();
					setPlacement(bounds.left - left >= 60 && right - bounds.right >= 60 ? "side" : "above");
				};
				const observer = new view.ResizeObserver(measure);
				for (const target of [
					element,
					viewport,
					...clips
				]) observer.observe(target);
				measure();
				return () => {
					observer.disconnect();
				};
			}, []);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: row,
				className: `mayori-message mayori-message-${assistant ? "character" : "user"}`,
				"data-avatar-placement": placement,
				children: [
					assistant && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
						name,
						image
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-message-content",
						children
					}),
					actions && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UserRevisionToolbar, {
						container: row,
						children: actions
					}),
					!assistant && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Avatar, {
						name,
						image
					})
				]
			});
		}
		/** Session snapshots own portraits; the stock renderer still owns message content. */
		function CharacterMessage({ stock, stockChildren, childPrefix, chatFor, revisionFor, ...props }) {
			const chat = chatFor(props.sessionId);
			const snapshot = (0, react.useSyncExternalStore)(chat.subscribe, chat.getSnapshot, chat.getSnapshot);
			const mapped = remapChildProps(props, stockChildren, childPrefix);
			const revisions = revisionFor?.(props.sessionId);
			const revisionSnapshot = (0, react.useSyncExternalStore)(revisions?.subscribe ?? (() => () => {}), revisions?.getSnapshot ?? (() => null), revisions?.getSnapshot ?? (() => null));
			const activity = props.useSession?.((state) => state.running || (state.pendingSubmissions?.length ?? 0) > 0);
			(0, react.useEffect)(() => {
				revisions?.refresh?.();
			}, [revisions, activity]);
			if (removedNode(props.node, revisionSnapshot?.edits)) return null;
			mapped.node = editedNode(props.node, revisionSnapshot?.edits);
			const assistant = props.node.kind === "assistant-step";
			const Stock = stock;
			const content = assistant ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GreetingMessage, {
				stock: Stock,
				chatFor,
				...mapped
			}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...mapped });
			if (!snapshot.value?.character) return content;
			if (assistant) {
				if (props.groupPart === "reasoning") return content;
				const greeting = props.node.data.turn === 1 && props.node.data.step === 1 && snapshot.value.greeting?.messageId === props.node.data.finalNode?.messageId ? snapshot.value.greeting : null;
				if (!(greeting ? [{
					kind: "text",
					text: greeting.text
				}] : props.node.data.blocks)?.some((block) => block.kind !== "reasoning" && block.kind !== "tool-call" && (block.kind !== "text" || block.text.trim()))) return content;
			}
			const person = assistant ? snapshot.value.character : snapshot.value.persona;
			const name = person?.name || (assistant ? tr("Персонаж") : tr("Игрок"));
			const seq = assistant ? props.node.data.finalNode?.seq : props.node.data.seq;
			const editable = !assistant && revisionFor && props.useSession && Number.isSafeInteger(seq) && seq > 0 && props.node.data.content?.some((block) => block.type === "text" && block.text.trim());
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(MessageWithAvatar, {
				assistant,
				name,
				image: assistant ? person?.image : person?.avatar,
				actions: editable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MessageRevisionControls, {
					revisions: revisionFor(props.sessionId),
					seq,
					useSession: props.useSession,
					canRepeat: false
				}),
				children: [content, assistant && revisions && props.useSession && props.groupPart !== "reasoning" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AnswerVariants, {
					revisions,
					seq,
					useSession: props.useSession,
					IconButton
				})]
			});
		}
		//#endregion
		//#region src/features/trajectory/client/context.js
		const uniqueViews = /* @__PURE__ */ new WeakMap();
		/** DSH 0.2.1's tab consumer reads raw registrations, including shadowed entries. */
		function deduplicateViews(views) {
			if (!uniqueViews.has(views)) {
				const seen = /* @__PURE__ */ new Set();
				const filtered = views.filter((view) => {
					if (seen.has(view.id)) return false;
					seen.add(view.id);
					return true;
				});
				const chatIndex = filtered.findIndex((view) => view.id === "chat");
				if (chatIndex > 0) filtered.unshift(...filtered.splice(chatIndex, 1));
				uniqueViews.set(views, filtered.length === views.length && chatIndex <= 0 ? views : filtered);
			}
			return uniqueViews.get(views);
		}
		var TrajectoryContextService = class {
			getSnapshot() {
				throw new Error("TrajectoryContextService.getSnapshot() is not implemented");
			}
			subscribe() {
				throw new Error("TrajectoryContextService.subscribe() is not implemented");
			}
			refresh() {
				throw new Error("TrajectoryContextService.refresh() is not implemented");
			}
		};
		/** Session-bound browser provider; an old response cannot overwrite a new selection. */
		var RemoteTrajectoryContextProvider = class extends TrajectoryContextService {
			#snapshot = {
				status: "loading",
				value: null,
				error: null
			};
			#listeners = /* @__PURE__ */ new Set();
			#revision = 0;
			#controller;
			constructor(sessionId) {
				super();
				this.sessionId = sessionId;
			}
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			#publish(value) {
				this.#snapshot = value;
				for (const listener of this.#listeners) listener();
			}
			async refresh(selection) {
				const revision = ++this.#revision;
				this.#controller?.abort();
				const controller = this.#controller = new AbortController();
				this.#publish({
					status: "loading",
					value: this.#snapshot.value,
					error: null
				});
				try {
					const value = await call("trajectory-context", {
						sessionId: this.sessionId,
						selection
					}, { signal: controller.signal });
					if (revision === this.#revision) this.#publish({
						status: "ready",
						value,
						error: null
					});
				} catch (error) {
					if (revision === this.#revision) this.#publish({
						status: "error",
						value: null,
						error: error.message
					});
				}
			}
			release() {
				if (!this.#listeners.size) this.dispose();
			}
			dispose() {
				++this.#revision;
				this.#controller?.abort();
				this.#snapshot = {
					status: "loading",
					value: null,
					error: null
				};
			}
		};
		//#endregion
		//#region src/features/trajectory/client/snapshot.js
		/** Adapt a reconstructed request to the public stock Trajectory snapshot contract. */
		function assistantBlocks(content) {
			return content.map((block) => {
				if (block.type === "text" || block.type === "reasoning") return {
					kind: block.type,
					text: block.text
				};
				if (block.type === "image") return block.offloaded ? {
					kind: "other",
					block
				} : {
					kind: "image",
					attachment: block.attachment
				};
				if (block.type === "tool-call") return {
					kind: "tool-call",
					callId: String(block.id),
					name: block.name,
					argsRaw: block.arguments
				};
				return {
					kind: "other",
					block
				};
			});
		}
		function contextTrajectorySnapshot(stock, value) {
			const originals = new Map(stock.eventNodes.map((node) => [node.seq, node]));
			const systemPrompts = [];
			const eventNodes = [];
			for (const item of value.messages) {
				const { seq, message, time, turn, step } = item;
				const original = originals.get(seq);
				if (message.role === "system") systemPrompts.push({
					seq,
					time,
					turn,
					step,
					text: message.content.filter((block) => block.type === "text").map((block) => block.text).join(""),
					update: systemPrompts.length > 0
				});
				else if (message.role === "assistant") eventNodes.push({
					...original,
					kind: "assistant",
					seq,
					time,
					turn,
					step,
					messageId: message.id,
					blocks: assistantBlocks(message.content),
					providerMetadata: {
						provider: message.source.provider,
						model: message.source.model
					}
				});
				else if (message.role === "tool") eventNodes.push({
					...original,
					kind: "tool-result",
					seq,
					time,
					callId: String(message.source.callId),
					name: original?.name ?? "",
					args: original?.args ?? {},
					call: original?.call ?? null,
					callTime: original?.callTime ?? null,
					subCalls: original?.subCalls ?? [],
					content: message.content,
					isError: message.isError === true
				});
				else {
					const kind = message.role === "user" && message.source.kind === "user" ? original?.kind === "steering" ? "steering" : "user" : "context";
					eventNodes.push({
						...original,
						kind,
						seq,
						time,
						content: message.content,
						source: message.source,
						...kind === "steering" ? { messageId: message.id } : {},
						...kind === "context" ? {
							producer: original?.producer ?? {
								role: "inject",
								label: message.source.kind ?? null
							},
							form: original?.form ?? ([
								"instructions",
								"catalog",
								"snapshot",
								"notice",
								"relay",
								"recall"
							].includes(message.source.form) ? message.source.form : null)
						} : {}
					});
				}
			}
			const assistantSeqs = new Set(eventNodes.filter((node) => node.kind === "assistant").map((node) => node.seq));
			const target = value.selectedSeq === "current" ? value.requests.at(-1) : value.requests.find((request) => request.seq === value.selectedSeq);
			const requests = stock.requests.filter((request) => request.purpose === "assistant" && assistantSeqs.has(request.resultSeq) && request.resultSeq !== target?.seq).map(({ promptChange, ...request }) => request);
			if (target) {
				const original = stock.requests.find((request) => request.purpose === "assistant" && request.resultSeq === target.seq);
				const initial = systemPrompts.shift();
				requests.push({
					...original,
					purpose: "assistant",
					turn: target.turn,
					step: target.step,
					startSeq: original?.startSeq ?? target.startSeq,
					startedAt: original?.startedAt ?? target.startedAt ?? target.time,
					completedAt: target.time,
					status: target.failed ? "error" : "complete",
					resultSeq: target.seq,
					...value.header ? { prompt: {
						config: value.header.config,
						tools: value.header.tools ?? [],
						system: initial?.text ?? ""
					} } : {},
					promptChange: initial && value.header ? {
						seq: initial.seq,
						time: initial.time,
						kind: "initial"
					} : void 0
				});
				if (initial && !value.header) systemPrompts.unshift(initial);
			}
			const partial = target && value.selectedSeq !== "current" ? {
				turn: target.turn,
				step: target.step,
				blocks: []
			} : null;
			return {
				...stock,
				eventNodes,
				systemPrompts,
				requests,
				partial,
				runningCalls: [],
				eventLocations: new Map(eventNodes.flatMap((node) => stock.eventLocations.has(node.seq) ? [[node.seq, stock.eventLocations.get(node.seq)]] : [])),
				callSchemas: new Map([...stock.callSchemas, ...(value.header?.tools ?? []).map((tool) => [tool.name, tool])])
			};
		}
		//#endregion
		//#region src/features/trajectory/client/view.jsx
		/** Preserve the native header while removing duplicate tabs from raw slot entries. */
		function TrajectorySessionHeader({ stock: Stock, stockChildren, childPrefix, revisionNavigation: Navigation, revisionNavigationProps, ...props }) {
			const useConversationViews = (selector) => props.useConversationViews((views) => selector(deduplicateViews(views)));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
				...remapChildProps(props, stockChildren, childPrefix),
				useConversationViews
			}), Navigation && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Navigation, {
				sessionId: props.sessionId,
				...revisionNavigationProps
			})] });
		}
		function RequestTrajectory({ stock: Stock, value, ...props }) {
			const stock = props.useTrajectory((state) => state);
			const session = props.useSession((state) => state);
			const filtered = (0, react.useMemo)(() => contextTrajectorySnapshot(stock, value), [stock, value]);
			const scopedSession = (0, react.useMemo)(() => ({
				...session,
				hasMore: false,
				loadingOlder: false
			}), [session]);
			const useTrajectory = (selector) => selector(filtered);
			const useSession = (selector) => selector(scopedSession);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
				...props,
				useTrajectory,
				useSession,
				loadOlder: async () => false
			});
		}
		/** Default request-input view; retain the shipped ledger as an explicit alternative. */
		function ContextTrajectory({ stock: Stock, stockChildren, childPrefix, contextFor, ...props }) {
			const [mode, setMode] = (0, react.useState)("context");
			const [selection, setSelection] = (0, react.useState)("latest");
			const context = contextFor(props.sessionId);
			const snapshot = (0, react.useSyncExternalStore)(context.subscribe, context.getSnapshot, context.getSnapshot);
			const latestSeq = props.useTrajectory((state) => state.eventNodes.at(-1)?.seq);
			const running = props.useSession((state) => state.running);
			const refresh = () => {
				context.refresh(selection === "latest" ? void 0 : selection === "current" ? selection : Number(selection));
			};
			(0, react.useEffect)(() => {
				if (mode === "context") refresh();
			}, [
				context,
				mode,
				selection,
				latestSeq,
				running
			]);
			const value = snapshot.status === "ready" ? snapshot.value : null;
			const mapped = remapChildProps(props, stockChildren, childPrefix);
			const journal = mode === "journal" || props.viewRequest?.focus != null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-trajectory",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-trajectory-controls",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-trajectory-field",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Показывать") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": tr("Показывать"),
							value: journal ? "journal" : "context",
							onChange: (value) => {
								props.completeViewRequest?.();
								setMode(value);
							},
							options: [{
								value: "context",
								label: tr("Контекст запроса")
							}, {
								value: "journal",
								label: tr("Полный журнал")
							}]
						})]
					}), !journal && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-trajectory-field",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Запрос") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
							"aria-label": tr("Запрос"),
							value: selection,
							onChange: setSelection,
							options: [
								{
									value: "latest",
									label: tr("Последний запрос")
								},
								{
									value: "current",
									label: tr("Текущий сохранённый контекст")
								},
								...(snapshot.value?.requests ?? []).map((request) => ({
									value: request.seq,
									label: tr("№{p1} · Ход {p2}, шаг {p3}{p4}", {
										p1: request.number,
										p2: request.turn,
										p3: request.step,
										p4: request.failed ? tr(" · Неудачная попытка") : ""
									})
								}))
							]
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: refresh,
						disabled: snapshot.status === "loading",
						children: tr("Обновить")
					})] })]
				}), journal ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "mayori-trajectory-journal",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, { ...mapped })
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-trajectory-context",
					"aria-busy": snapshot.status === "loading",
					children: [
						snapshot.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "status",
							children: tr("Загрузка контекста…")
						}),
						snapshot.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							children: noticeText(snapshot.error)
						}),
						value && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-persona-hint",
								children: value.selectedSeq === "current" ? tr("Сохранённые сообщения для следующего запроса. Системный контекст обновится при отправке.") : tr("Вход модели на момент этого запроса. Заменённые сообщения и ответ на запрос исключены.")
							}),
							!value.messages.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("В чате пока нет сохранённых сообщений.") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "mayori-trajectory-table",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RequestTrajectory, {
									stock: Stock,
									...mapped,
									value
								}, value.selectedSeq)
							})
						] })
					]
				})]
			});
		}
		//#endregion
		//#region src/client/shell/home.jsx
		function HomeIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" })
			});
		}
		/** Also occupies the empty Conversation through its public session-maybe seat. */
		function HomeConversation(props) {
			const { sessionId, useSessions, stock: Stock, stockChildren, childPrefix, renderSlot, selectPanel } = props;
			const blank = useSessions((snapshot) => {
				const row = sessionId === void 0 ? void 0 : snapshot.byId[sessionId];
				return sessionId === void 0 || row?.blank === true && !row.title?.trim();
			});
			(0, react.useEffect)(() => {
				if (blank) selectPanel("mayori-home");
			}, [blank, selectPanel]);
			if (blank) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HomePanel, { ...props });
			const delegate = (name, ...args) => renderSlot(Object.hasOwn(stockChildren ?? {}, name) ? `${childPrefix}.${name}` : name, ...args);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stock, {
				...props,
				renderSlot: delegate
			});
		}
		function HomePanel({ history, library, personas, startCharacter, selectPanel }) {
			const personaSnapshot = (0, react.useSyncExternalStore)(personas.subscribe, personas.getSnapshot, personas.getSnapshot);
			const persona = personaSnapshot.personas.find((item) => item.id === personaSnapshot.defaultId) ?? DEFAULT_PERSONA;
			const snapshot = (0, react.useSyncExternalStore)(history.subscribe, history.getSnapshot, history.getSnapshot);
			const archive = (0, react.useSyncExternalStore)(history.subscribeArchive, history.getArchiveSnapshot, history.getArchiveSnapshot);
			const catalog = (0, react.useSyncExternalStore)(library.subscribe, library.getSnapshot, library.getSnapshot);
			const language = currentLanguage();
			const rows = (0, react.useMemo)(() => archive.phase === "ready" && archive.state !== "error" ? historyRows(snapshot, "", archive.archivedSessionIds, false, 5) : [], [
				snapshot,
				archive,
				language
			]);
			const cards = recentCharacters(catalog.cards);
			const details = useHistoryDetails(history, rows);
			const [error, setError] = (0, react.useState)("");
			const [refreshing, setRefreshing] = (0, react.useState)(false);
			const [playingId, setPlayingId] = (0, react.useState)(null);
			const [selectedCard, setSelectedCard] = (0, react.useState)(null);
			const triggerRef = (0, react.useRef)(null);
			const detailRevision = (0, react.useRef)(0);
			(0, react.useEffect)(() => () => {
				++detailRevision.current;
			}, []);
			const showDetails = async (item, trigger) => {
				triggerRef.current = trigger;
				const revision = ++detailRevision.current;
				try {
					const card = await library.get(item.id);
					if (revision === detailRevision.current) setSelectedCard(card);
				} catch (failure) {
					if (revision === detailRevision.current) setError(failure.message);
				}
			};
			const playingRef = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				let active = true;
				setRefreshing(true);
				Promise.resolve().then(() => history.ensureLoaded()).catch(() => {
					if (active) setError(tr("Не удалось загрузить последние чаты. Попробуйте открыть историю и обновить список."));
				}).finally(() => {
					if (active) setRefreshing(false);
				});
				return () => {
					active = false;
				};
			}, [history]);
			const open = async (id) => {
				setError("");
				try {
					await history.open(id);
				} catch {
					setError(tr("Не удалось открыть чат. Попробуйте ещё раз."));
				}
			};
			const play = async (card, greetingIndex) => {
				if (playingRef.current) return;
				playingRef.current = true;
				setPlayingId(card.id);
				setError("");
				try {
					await startCharacter(card, greetingIndex);
				} catch (failure) {
					setError(failure instanceof Error ? failure.message : String(failure));
				} finally {
					playingRef.current = false;
					setPlayingId(null);
				}
			};
			const remove = async (card, dialog) => {
				if (!window.confirm(tr("Удалить персонажа «{p1}» из галереи?", { p1: card.name }))) return;
				try {
					await library.remove(card.id);
					dialog?.close();
				} catch (failure) {
					setError(failure instanceof Error ? failure.message : String(failure));
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-home-panel",
				"aria-labelledby": "mayori-home-title",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-home-content",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "mayori-home-welcome",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "mayori-home-mark",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MayoriMark, {})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
									id: "mayori-home-title",
									children: tr("Добро пожаловать в Mayori")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: tr("Продолжите свою историю или выберите персонажа для нового приключения.") })
							]
						}),
						error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "mayori-error",
							children: noticeText(error)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "mayori-home-section",
							"aria-labelledby": "mayori-home-chats",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									id: "mayori-home-chats",
									children: tr("Последние чаты")
								}),
								(refreshing || snapshot.phase === "pending" || archive.phase === "pending") && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "status",
									children: tr("Загружаем чаты…")
								}),
								archive.state === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mayori-error",
									children: tr("Не удалось загрузить состояние архива.")
								}),
								!refreshing && snapshot.phase === "ready" && archive.phase === "ready" && archive.state !== "error" && rows.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-home-empty",
									children: tr("Чатов пока нет. Выберите персонажа ниже, чтобы начать историю.")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: "mayori-history-list",
									children: rows.map((row) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(HistoryRow, {
										row,
										detail: details.value[row.id],
										loading: details.loading,
										onOpen: open
									}) }, row.id))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "mayori-secondary-button",
									onClick: () => {
										selectPanel("mayori-history");
									},
									children: [tr("Перейти в историю чатов "), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "→"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "mayori-home-section",
							"aria-labelledby": "mayori-home-characters",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									id: "mayori-home-characters",
									children: tr("Недавно загруженные персонажи")
								}),
								catalog.status === "loading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "status",
									children: tr("Загружаем персонажей…")
								}),
								catalog.status === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: "mayori-error",
									children: noticeText(catalog.error)
								}),
								catalog.status === "ready" && cards.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "mayori-home-empty",
									children: tr("В галерее пока нет персонажей. Перейдите в персонажи и импортируйте карточку PNG или JSON.")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: "mayori-card-grid",
									children: cards.map((card) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterCard, {
										card,
										onPlay: play,
										playBusy: playingId === card.id,
										playDisabled: playingId !== null,
										onEdit: showDetails
									}, card.id))
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "mayori-secondary-button",
									onClick: () => {
										selectPanel("mayori-characters");
									},
									children: [tr("Перейти к персонажам "), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "→"
									})]
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterInfoDialog, {
					card: selectedCard,
					onClose: () => {
						setSelectedCard(null);
					},
					onRemove: remove,
					triggerRef,
					persona,
					onPlay: play,
					playDisabled: playingId !== null
				})]
			});
		}
		//#endregion
		//#region src/features/dice/shared/pool.js
		/** Project recorded groups; never generate randomness or reinterpret expressions. */
		function projectDiceGroup(group) {
			const indices = group.keptIndices ?? group.results.map((_, index) => index);
			const kept = new Set(indices);
			const faces = indices.map((index) => group.results[index]);
			const totals = group.chains ? group.chains.filter((chain) => chain.indices.some((index) => kept.has(index))).map((chain) => chain.value) : faces;
			return {
				sides: group.sides,
				faces,
				totals
			};
		}
		function diceObservations(details) {
			return details.filter((detail) => !detail.error && detail.dice.length).map((detail) => ({
				path: detail.path,
				groups: detail.dice.map(projectDiceGroup)
			}));
		}
		//#endregion
		//#region src/features/dice/shared/result.js
		/** Browser-safe durable dice result contract; versions 1 and unversioned logs remain readable. */
		const record$1 = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
		const numeric$1 = (value) => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
		const scalar = (value) => numeric$1(value) || typeof value === "boolean";
		const pathValid = (path) => Array.isArray(path) && path.length <= 64 && path.every((key) => typeof key === "string" || Number.isSafeInteger(key) && key >= 0);
		const indices = (list, maximum) => Array.isArray(list) && list.every((index, at) => Number.isSafeInteger(index) && index >= 0 && index < maximum && (at === 0 || index > list[at - 1]));
		const comparators = [
			">",
			">=",
			"<",
			"<=",
			"==",
			"!="
		];
		/** Model projection: the complete trace stays in the recorded metadata. */
		function compactDiceResult(result) {
			return {
				rollId: result.rollId,
				values: result.values,
				...result.errors.length ? { errors: result.errors } : {}
			};
		}
		function readDiceResult(content, meta) {
			if (!Array.isArray(content) || content.length !== 1 || content[0]?.type !== "text" || typeof content[0].text !== "string" || content[0].text.length > 8e6) return null;
			let value;
			try {
				value = JSON.parse(content[0].text);
			} catch {
				return null;
			}
			if (record$1(value) && !Object.hasOwn(value, "details")) {
				if (Object.hasOwn(value, "rollId")) {
					const full = meta?.kind === "mayori-dice" ? validateDiceResult(meta.result) : null;
					return full?.schemaVersion === 3 && full.rollId === value.rollId && JSON.stringify(compactDiceResult(full)) === JSON.stringify(value) ? full : null;
				}
				if (![
					1,
					2,
					3
				].includes(value.schemaVersion) || !record$1(meta) || meta.kind !== "mayori-dice") return null;
				const full = validateDiceResult(meta.result);
				const fields = value.schemaVersion >= 2 ? [
					"schemaVersion",
					"purpose",
					"values",
					"errors",
					...value.schemaVersion === 3 ? ["observations"] : []
				] : [
					"schemaVersion",
					"purpose",
					"values",
					"error"
				];
				if (!full || full.schemaVersion !== value.schemaVersion || Object.keys(value).some((key) => !fields.includes(key)) || fields.some((key) => JSON.stringify(value[key]) !== JSON.stringify(full[key]))) return null;
				return full;
			}
			return validateDiceResult(value);
		}
		function validateDiceResult(value) {
			if (!record$1(value) || Object.hasOwn(value, "schemaVersion") && ![
				1,
				2,
				3
			].includes(value.schemaVersion) || Object.hasOwn(value, "rollId") && (typeof value.rollId !== "string" || !value.rollId.trim()) || value.purpose !== void 0 && (typeof value.purpose !== "string" || !value.purpose.trim() || value.purpose.length > 2e3) || !Array.isArray(value.details) || !value.details.length || value.details.length > 1e3) return null;
			const v2 = value.schemaVersion >= 2, paths = /* @__PURE__ */ new Map(), drawIndices = /* @__PURE__ */ new Set();
			let faces = 0;
			for (const detail of value.details) {
				if (!record$1(detail) || !pathValid(detail.path) || typeof detail.expression !== "string" || detail.expression.length > 1e5 || !detail.expression.trim() && !(v2 && detail.error) || !Array.isArray(detail.dice) || (detail.error === void 0 ? !(v2 ? scalar : numeric$1)(detail.value) : typeof detail.error !== "string" || !detail.error) || v2 && detail.error !== void 0 && (detail.value !== null || typeof detail.code !== "string" || !detail.code)) return null;
				const key = JSON.stringify(detail.path);
				if (paths.has(key)) return null;
				paths.set(key, detail);
				if (v2 && (!Array.isArray(detail.references) || detail.references.length > 8192 || !detail.references.every((ref) => record$1(ref) && pathValid(ref.path) && scalar(ref.value)) || !Array.isArray(detail.decisions) || detail.decisions.length > 8192 || !detail.decisions.every((decision) => record$1(decision) && typeof decision.condition === "boolean" && (decision.operator === "if" ? decision.branch === (decision.condition ? "then" : "else") : ["and", "or"].includes(decision.operator) && decision.branch === ((decision.operator === "and" ? !decision.condition : decision.condition) ? "short-circuit" : "right"))))) return null;
				for (const dice of detail.dice) {
					if (!record$1(dice) || !Number.isSafeInteger(dice.sides) || dice.sides < 1 || dice.sides > 1e9 || !Array.isArray(dice.results) || !dice.results.length && !(v2 && detail.error)) return null;
					faces += dice.results.length;
					if (faces > 1e5 || !dice.results.every((face) => Number.isSafeInteger(face) && face >= 1 && face <= dice.sides)) return null;
					if (dice.keep !== void 0 && (!record$1(dice.keep) || !["highest", "lowest"].includes(dice.keep.mode) || !Number.isSafeInteger(dice.keep.count) || dice.keep.count < 1 || dice.keep.count > (v2 ? dice.count : dice.results.length))) return null;
					if (dice.keptIndices !== void 0 && !indices(dice.keptIndices, dice.results.length)) return null;
					if (!v2) {
						if (dice.keep ? dice.keptIndices?.length !== dice.keep.count : dice.keptIndices !== void 0) return null;
						continue;
					}
					if (!Number.isSafeInteger(dice.count) || dice.count < 1 || dice.count > 1e5 || !Array.isArray(dice.draws) || dice.draws.length !== dice.results.length) return null;
					for (const [index, draw] of dice.draws.entries()) {
						if (!record$1(draw) || !Number.isSafeInteger(draw.drawIndex) || draw.drawIndex < 0 || draw.drawIndex >= 1e5 || drawIndices.has(draw.drawIndex) || index > 0 && draw.drawIndex <= dice.draws[index - 1].drawIndex || !Number.isSafeInteger(draw.die) || draw.die < 0 || draw.die >= dice.count || ![
							"initial",
							"explode",
							"reroll"
						].includes(draw.reason) || (draw.reason === "reroll" ? !Number.isSafeInteger(draw.replaces) || draw.replaces < 0 || draw.replaces >= index || dice.draws[draw.replaces].die !== draw.die : draw.replaces !== void 0)) return null;
						drawIndices.add(draw.drawIndex);
					}
					if (dice.explode !== void 0 && dice.explode !== true) return null;
					if (dice.reroll !== void 0 && (!record$1(dice.reroll) || typeof dice.reroll.once !== "boolean" || !comparators.includes(dice.reroll.operator) || !numeric$1(dice.reroll.threshold))) return null;
					if (dice.explode || dice.reroll) {
						if (!Array.isArray(dice.chains) || dice.chains.length > dice.count || !detail.error && dice.chains.length !== dice.count) return null;
						for (const [die, chain] of dice.chains.entries()) if (!record$1(chain) || !indices(chain.indices, dice.results.length) || !chain.indices.every((index) => dice.draws[index].die === die) || (chain.value === void 0 ? !detail.error : !numeric$1(chain.value) || chain.value !== chain.indices.reduce((sum, index) => sum + dice.results[index], 0))) return null;
						if (!detail.error && dice.keptIndices === void 0) return null;
						if (dice.keptIndices !== void 0) {
							const kept = new Set(dice.keptIndices);
							const selected = dice.chains.filter((chain) => chain.indices.some((index) => kept.has(index)));
							if (selected.some((chain) => !chain.indices.every((index) => kept.has(index))) || selected.flatMap((chain) => chain.indices).length !== kept.size || selected.length !== (dice.keep?.count ?? dice.count)) return null;
						}
					} else if (dice.chains !== void 0 || !detail.error && dice.results.length !== dice.count || (dice.keep ? !detail.error && dice.keptIndices?.length !== dice.keep.count : dice.keptIndices !== void 0)) return null;
				}
			}
			if (v2) {
				if (value.error !== void 0 || !Array.isArray(value.errors) || value.errors.length > 1e3) return null;
				const errors = /* @__PURE__ */ new Map();
				for (const error of value.errors) {
					if (!record$1(error) || !pathValid(error.path) || typeof error.code !== "string" || typeof error.message !== "string") return null;
					const key = JSON.stringify(error.path), detail = paths.get(key);
					if (errors.has(key) || !detail?.error || detail.error !== error.message || detail.code !== error.code) return null;
					errors.set(key, error);
				}
				if (value.details.filter((detail) => detail.error).length !== errors.size || !validTree(value.values, paths, true)) return null;
				for (const index of drawIndices) if (index >= drawIndices.size) return null;
				for (const detail of value.details) for (const ref of detail.references) if (paths.get(JSON.stringify(ref.path))?.value !== ref.value) return null;
			} else if (value.error !== void 0) {
				const last = value.details.at(-1);
				if (value.values !== null || !record$1(value.error) || !pathValid(value.error.path) || typeof value.error.message !== "string" || !value.error.message || JSON.stringify(value.error.path) !== JSON.stringify(last.path) || value.error.message !== last.error || value.details.slice(0, -1).some((detail) => detail.error !== void 0)) return null;
			} else if (value.details.some((detail) => detail.error !== void 0) || !validTree(value.values, paths, false)) return null;
			if (value.schemaVersion === 3 && JSON.stringify(value.observations) !== JSON.stringify(diceObservations(value.details))) return null;
			return value;
		}
		function validTree(values, paths, v2) {
			if (values === null || typeof values !== "object") return false;
			const pending = [[values, []]];
			let nodes = 0, leaves = 0;
			while (pending.length) {
				const [node, path] = pending.pop();
				if (++nodes > 1e4 || path.length > 64) return false;
				if (numeric$1(node) || v2 && (typeof node === "boolean" || node === null)) {
					const detail = paths.get(JSON.stringify(path));
					if (!detail || detail.value !== node || node === null && !detail.error) return false;
					leaves++;
				} else if (Array.isArray(node)) node.forEach((child, index) => pending.push([child, [...path, index]]));
				else if (record$1(node)) Object.entries(node).forEach(([key, child]) => pending.push([child, [...path, key]]));
				else return false;
			}
			return leaves === paths.size;
		}
		function dicePurpose(block) {
			const observed = block?.args?.textPrefix?.("purpose", 2e3) ?? block?.args?.text?.("purpose");
			if (typeof observed === "string") return observed;
			try {
				const args = JSON.parse(block?.call?.argsRaw ?? block?.argsRaw ?? "{}");
				return typeof args.purpose === "string" ? args.purpose : "";
			} catch {
				return "";
			}
		}
		//#endregion
		//#region src/features/dice/client/card.jsx
		/** A keyed atomic tool view. DSH owns call pairing, lifecycle and transcript topology. */
		const pathLabel = (path) => path.map((key) => typeof key === "number" ? `[${key}]` : key).join(" › ");
		const errorCopy = (message) => message === "Division by zero" ? tr("Деление на ноль. Проверьте знаменатель.") : message === "Arithmetic result must be finite and within the safe numeric range" ? tr("Результат слишком большой. Проверьте формулу.") : message;
		function DiceFaces({ dice }) {
			const kept = dice.keptIndices === void 0 ? null : new Set(dice.keptIndices);
			const fullText = dice.results.map((face, index) => `${face}${kept && !kept.has(index) ? tr(" (отброшен)") : ""}`).join(", ");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-dice-group",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: "mayori-dice-group-label",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", {
								dir: "ltr",
								children: [
									dice.count ?? dice.results.length,
									"d",
									dice.sides,
									dice.explode ? "!" : ""
								]
							}),
							dice.reroll && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Переброс: {p1}", { p1: dice.reroll.once ? tr("один раз") : tr("пока выполняется правило") }) }),
							dice.keep && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
								dice.keep.mode === "highest" ? tr("Лучшие") : tr("Худшие"),
								": ",
								dice.keep.count
							] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-dice-faces",
						"aria-label": tr("Выпавшие грани"),
						children: dice.results.slice(0, 24).map((face, index) => {
							const dropped = kept && !kept.has(index);
							const Element = dropped ? "s" : "span";
							const reason = dice.draws?.[index]?.reason;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(Element, {
								title: reason === "explode" ? tr("Взрыв") : reason === "reroll" ? tr("Переброс") : void 0,
								className: `mayori-dice-face${dropped ? " mayori-dice-dropped" : ""}`,
								children: [
									reason && reason !== "initial" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "mayori-dice-sr",
										children: reason === "explode" ? tr("Взрыв. ") : tr("Переброс. ")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "mayori-dice-sr",
										children: dropped ? tr("Отброшен: ") : tr("Учтён: ")
									}),
									face
								]
							}, index);
						})
					}),
					dice.results.length > 24 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
						className: "mayori-dice-all-faces",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: tr("Показать все грани ({p1})", { p1: dice.results.length }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: fullText })]
					})
				]
			});
		}
		/** Raw content stays accessible when the logged format is unsupported or the tool failed. */
		function DiceToolCard({ phase, block, useDisclosure, inspect }) {
			const id = (0, react.useId)();
			const { expanded, toggle } = useDisclosure();
			const settled = phase === "result";
			const result = settled && !block.isError ? readDiceResult(block.content, block.meta) : null;
			const purpose = result?.purpose ?? dicePurpose(block);
			const interrupted = block.error?.code === "interrupted" || block.error?.code === "ABORTED" || block.error?.code === "ABORTED_BEFORE_DISPATCH";
			const state = !settled ? phase : interrupted ? "stopped" : block.isError || result?.error || result?.errors?.length ? "error" : result ? "ok" : "raw";
			const status = state === "preparing" ? tr("Готовится бросок") : state === "start" ? tr("Бросаем кубики") : state === "stopped" ? tr("Бросок прерван") : state === "error" ? result?.errors?.length ? tr("Есть ошибки") : tr("Не удалось вычислить") : state === "raw" ? tr("Исходный результат") : tr("Готово");
			const title = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
					"aria-hidden": "true",
					width: "18",
					height: "18",
					viewBox: "0 0 24 24",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "1.5",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m12 3 9 5v8l-9 5-9-5V8l9-5Zm0 9 9-4M12 12 3 8m9 4v9" })
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Броски кубиков") }),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: "mayori-dice-status",
					children: status
				})
			] });
			const raw = settled ? (block.content ?? []).map((item) => item.type === "text" ? item.text : JSON.stringify(item, null, 2)).join("\n") : "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-dice-card",
				"data-state": state,
				"aria-label": tr("Броски кубиков"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-dice-header",
						children: [settled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mayori-dice-toggle",
							"aria-expanded": expanded,
							"aria-controls": id,
							onClick: toggle,
							children: [title, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								"aria-hidden": "true",
								className: "mayori-dice-chevron",
								children: expanded ? "⌃" : "⌄"
							})]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "mayori-dice-toggle",
							children: title
						}), inspect && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mayori-dice-inspect",
							onClick: inspect,
							children: tr("В журнал")
						})]
					}),
					purpose && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "mayori-dice-purpose",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: purpose })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						id,
						children: [
							result && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: "mayori-dice-results",
								children: (expanded ? result.details : result.details.slice(0, 6)).map((detail) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-dice-result-row",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "mayori-dice-formula",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "mayori-dice-path",
												children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: pathLabel(detail.path) })
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
												dir: "ltr",
												children: detail.expression
											})]
										}), detail.error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-dice-result-error",
											children: tr("Ошибка")
										}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", {
											className: "mayori-dice-total",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: "mayori-dice-sr",
												children: tr("Итог: ")
											}), typeof detail.value === "boolean" ? detail.value ? tr("Да") : tr("Нет") : detail.value]
										})]
									}),
									!detail.error && !!detail.dice.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-dice-observation",
										children: detail.dice.map((dice, index) => {
											const { faces } = projectDiceGroup(dice);
											return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
												tr("На d"),
												dice.sides,
												": ",
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("bdi", { children: [faces.slice(0, 12).join(", "), faces.length > 12 ? `… (${faces.length})` : ""] })
											] }, index);
										})
									}),
									expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "mayori-dice-breakdown",
										children: [
											detail.dice.map((dice, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiceFaces, { dice }, index)),
											detail.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: "mayori-dice-error",
												children: errorCopy(detail.error)
											}),
											detail.references?.map((ref, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
												className: "mayori-dice-path",
												children: [
													tr("Использовано: "),
													/* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: pathLabel(ref.path) }),
													" = ",
													String(ref.value)
												]
											}, `ref-${index}`)),
											detail.decisions?.filter((decision) => decision.operator === "if").map((decision, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: "mayori-dice-path",
												children: tr("Условие: {p1}. Выполнена ветка {p2}.", {
													p1: decision.condition ? tr("да") : tr("нет"),
													p2: decision.branch === "then" ? tr("«тогда»") : tr("«иначе»")
												})
											}, `if-${index}`)),
											!detail.dice.length && !detail.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
												className: "mayori-dice-path",
												children: tr("Без броска кубиков")
											})
										]
									})
								] }, JSON.stringify(detail.path)))
							}),
							result && !expanded && result.details.length > 6 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-dice-hint",
								children: tr("Остальные результаты доступны в подробностях.")
							}),
							result?.error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-dice-error",
								children: tr("Вычисление остановлено. Выпавшие грани сохранены в подробностях.")
							}),
							!!result?.errors?.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "mayori-dice-error",
								children: tr("Ошибки отмечены у отдельных полей. Остальные результаты сохранены.")
							}),
							settled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								hidden: !expanded,
								className: "mayori-dice-record",
								children: result ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: tr("Показать исходный результат") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: raw })] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: interrupted ? tr("Сохранённые сведения о прерывании:") : block.isError ? tr("Сообщение инструмента:") : tr("Результат сохранён в исходном формате.") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: raw || block.error?.reason || tr("Инструмент не вернул содержимое.") })] })
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region src/features/rules/domain/check.js
		/** Explicit, versioned numeric-check policies. No platform SDK or hidden campaign state. */
		const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
		const text = (value, limit) => typeof value === "string" && value.length <= limit;
		const numeric = (value) => typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
		const fields = [
			"id",
			"version",
			"sides",
			"criticalSuccessMin",
			"criticalFailureMax",
			"naturalFailureMax",
			"failureEffect",
			"criticalFailureEffects"
		];
		function validateProfile(profile) {
			if (!record(profile) || Object.keys(profile).some((key) => !fields.includes(key))) throw new TypeError("Invalid rules profile fields");
			const value = {
				criticalSuccessMin: 0,
				criticalFailureMax: 0,
				naturalFailureMax: 0,
				failureEffect: "",
				criticalFailureEffects: [],
				...profile
			};
			if (!text(value.id, 64) || !/^[a-z][a-z0-9-]*$/.test(value.id) || !text(value.version, 64) || !value.version.trim()) throw new TypeError("Rules profiles need an id and a non-empty version");
			if (!Number.isSafeInteger(value.sides) || value.sides < 2 || value.sides > 1e9) throw new TypeError("Rules sides must be an integer from 2 to 1000000000");
			for (const key of [
				"criticalSuccessMin",
				"criticalFailureMax",
				"naturalFailureMax"
			]) if (!Number.isSafeInteger(value[key]) || value[key] < 0 || value[key] > value.sides) throw new TypeError(`${key} must be 0 (disabled) or a face within the die`);
			if (value.criticalSuccessMin && value.criticalSuccessMin <= Math.max(value.criticalFailureMax, value.naturalFailureMax)) throw new TypeError("Critical success and failure ranges must not overlap");
			if (!text(value.failureEffect, 1e3) || !Array.isArray(value.criticalFailureEffects) || value.criticalFailureEffects.length > 100 || !value.criticalFailureEffects.every((effect) => text(effect, 1e3) && effect.trim())) throw new TypeError("Effects must be bounded text; critical failure tables allow at most 100 entries");
			if (value.criticalFailureEffects.length && !value.criticalFailureMax) throw new TypeError("A critical failure table needs an enabled critical failure rule");
			return structuredClone(value);
		}
		function normalizeCheck(input) {
			if (!record(input) || Object.keys(input).some((key) => ![
				"profile",
				"modifier",
				"target",
				"mode",
				"damage",
				"purpose",
				"details"
			].includes(key))) throw new TypeError("Invalid check fields");
			if (!text(input.profile, 64) || !input.profile) throw new TypeError("Select a configured rules profile");
			if (!numeric(input.modifier ?? 0) || !numeric(input.target)) throw new TypeError("modifier and target must be finite safe-range numbers");
			const mode = input.mode ?? "normal";
			if (![
				"normal",
				"advantage",
				"disadvantage"
			].includes(mode)) throw new TypeError("Invalid check mode");
			if (input.details !== void 0 && typeof input.details !== "boolean") throw new TypeError("details must be boolean");
			if (input.purpose !== void 0 && (!text(input.purpose, 2e3) || !input.purpose.trim())) throw new TypeError("purpose must be non-empty text");
			if (input.damage !== void 0 && (!record(input.damage) || Object.keys(input.damage).some((key) => !["normal", "critical"].includes(key)) || !text(input.damage.normal, 8192) || !input.damage.normal.trim() || input.damage.critical !== void 0 && (!text(input.damage.critical, 8192) || !input.damage.critical.trim()))) throw new TypeError("damage needs normal and optional critical expressions");
			return {
				profile: input.profile,
				modifier: input.modifier ?? 0,
				target: input.target,
				mode,
				...input.damage ? { damage: structuredClone(input.damage) } : {},
				...input.purpose === void 0 ? {} : { purpose: input.purpose.trim() }
			};
		}
		function checkRolls(request, rules) {
			const pool = request.mode === "normal" ? `d${rules.sides}` : `2d${rules.sides}${request.mode === "advantage" ? "kh" : "kl"}1`;
			const critical = rules.criticalSuccessMin ? `$natural >= ${rules.criticalSuccessMin}` : "false";
			const fumble = rules.criticalFailureMax ? `$natural <= ${rules.criticalFailureMax}` : "false";
			const miss = rules.naturalFailureMax ? `$natural <= ${rules.naturalFailureMax}` : "false";
			const rolls = {
				pool,
				natural: "face($pool)",
				total: `$pool + (${numberLiteral(request.modifier)})`,
				critical,
				fumble,
				naturalFailure: miss,
				hit: `if($critical, true, if($fumble or $naturalFailure, false, $total >= (${numberLiteral(request.target)})))`
			};
			if (request.damage) rolls.damage = `if($hit, if($critical, (${request.damage.critical ?? request.damage.normal}) + 0, (${request.damage.normal}) + 0), 0)`;
			if (rules.criticalFailureEffects.length) rolls.effect = `if($fumble, d${rules.criticalFailureEffects.length}, 0)`;
			return rolls;
		}
		function numberLiteral(value) {
			const source = String(value);
			if (!source.includes("e")) return source;
			const [mantissa, power] = source.split("e"), negative = mantissa.startsWith("-");
			const [integer, fraction = ""] = mantissa.replace("-", "").split(".");
			const digits = integer + fraction, point = integer.length + Number(power);
			const expanded = point <= 0 ? `0.${"0".repeat(-point)}${digits}` : point >= digits.length ? digits + "0".repeat(point - digits.length) : `${digits.slice(0, point)}.${digits.slice(point)}`;
			return negative ? "-" + expanded : expanded;
		}
		/** Derive meaning from recorded numbers and the recorded policy, never from current Config. */
		function checkMeaning(request, rules, values) {
			if (!numeric(values.natural) || !numeric(values.total) || typeof values.hit !== "boolean") return null;
			const critical = !!rules.criticalSuccessMin && values.natural >= rules.criticalSuccessMin;
			const fumble = !!rules.criticalFailureMax && values.natural <= rules.criticalFailureMax;
			const naturalFailure = !!rules.naturalFailureMax && values.natural <= rules.naturalFailureMax;
			const hit = critical || !fumble && !naturalFailure && values.total >= request.target;
			const margin = values.total - request.target;
			if (!numeric(margin) || values.total !== values.natural + request.modifier || values.critical !== critical || values.fumble !== fumble || values.naturalFailure !== naturalFailure || values.hit !== hit) throw new TypeError("Inconsistent recorded check");
			return {
				natural: values.natural,
				modifier: request.modifier,
				total: values.total,
				target: request.target,
				margin,
				outcome: critical ? "critical_success" : fumble ? "critical_failure" : hit ? "success" : "failure",
				reason: critical ? "natural-critical-success" : fumble ? "natural-critical-failure" : naturalFailure ? "natural-failure" : hit ? "target-met" : "target-missed"
			};
		}
		//#endregion
		//#region src/features/rules/shared/result.js
		function buildCheckResult(request, rules, dice) {
			const check = checkMeaning(request, rules, dice.values);
			const damage = request.damage && check && ["success", "critical_success"].includes(check.outcome) && typeof dice.values.damage === "number" ? {
				value: dice.values.damage,
				expression: check.outcome === "critical_success" ? request.damage.critical ?? request.damage.normal : request.damage.normal
			} : null;
			let consequence = null;
			if (check?.outcome === "critical_failure" && rules.criticalFailureEffects.length) {
				const index = dice.values.effect;
				if (Number.isSafeInteger(index) && index >= 1 && index <= rules.criticalFailureEffects.length) consequence = {
					text: rules.criticalFailureEffects[index - 1],
					index
				};
			} else if (check && ["failure", "critical_failure"].includes(check.outcome) && rules.failureEffect) consequence = { text: rules.failureEffect };
			return {
				schemaVersion: 1,
				...request.purpose ? { purpose: request.purpose } : {},
				request,
				rules,
				check,
				damage,
				consequence,
				errors: dice.errors,
				dice
			};
		}
		function compactCheckResult(result) {
			if (result.rollId) {
				const { margin, ...check } = result.check ?? {};
				return {
					rollId: result.rollId,
					check: result.check ? check : null,
					...result.damage ? { damage: result.damage.value } : {},
					...result.consequence ? { consequence: result.consequence.text } : {},
					...result.errors.length ? { errors: result.errors } : {}
				};
			}
			const { dice, ...summary } = result;
			return {
				...summary,
				observations: dice.observations
			};
		}
		function readCheckResult(content, meta) {
			try {
				if (!Array.isArray(content) || content.length !== 1 || content[0]?.type !== "text" || content[0].text.length > 8e6) return null;
				const value = JSON.parse(content[0].text);
				const full = Object.hasOwn(value, "dice") ? value : meta?.kind === "mayori-check" ? meta.result : null;
				if (!full || full.schemaVersion !== 1 || !validateDiceResult(full.dice) || full.dice.schemaVersion !== 3) return null;
				if (Object.hasOwn(full, "rollId") && (typeof full.rollId !== "string" || !full.rollId.trim())) return null;
				const request = normalizeCheck(full.request), rules = validateProfile(full.rules);
				if (request.profile !== rules.id || full.dice.purpose !== request.purpose) return null;
				const expected = checkRolls(request, rules);
				if (Object.keys(expected).length !== full.dice.details.length || full.dice.details.some((detail) => detail.path.length !== 1 || expected[detail.path[0]] !== detail.expression)) return null;
				const group = full.dice.details.find((detail) => detail.path[0] === "pool");
				if (!group?.error) {
					if (group?.dice.length !== 1) return null;
					const pool = projectDiceGroup(group.dice[0]);
					if (pool.sides !== rules.sides || pool.faces.length !== 1 || pool.faces[0] !== full.dice.values.natural) return null;
				}
				const rebuilt = buildCheckResult(request, rules, full.dice);
				const { rollId, ...payload } = full;
				if (JSON.stringify(rebuilt) !== JSON.stringify(payload)) return null;
				if (!Object.hasOwn(value, "dice") && JSON.stringify(compactCheckResult(full)) !== JSON.stringify(value)) return null;
				return full;
			} catch {
				return null;
			}
		}
		//#endregion
		//#region src/features/rules/client/card.jsx
		const checkOutcomes = () => ({
			success: tr("Успех"),
			failure: tr("Провал"),
			critical_success: tr("Критический успех"),
			critical_failure: tr("Критический провал")
		});
		const checkReasons = () => ({
			"natural-critical-success": tr("Выбранная грань попала в диапазон критического успеха."),
			"natural-critical-failure": tr("Выбранная грань попала в диапазон критического провала."),
			"natural-failure": tr("Выбранная грань означает автоматический провал."),
			"target-met": tr("Итог достиг сложности."),
			"target-missed": tr("Итог ниже сложности.")
		});
		/** Show recorded resolution without running rules or rolling again. */
		function CheckToolCard({ phase, block, useDisclosure, inspect }) {
			const outcomes = checkOutcomes(), reasons = checkReasons();
			const id = (0, react.useId)(), { expanded, toggle } = useDisclosure();
			const settled = phase === "result";
			const result = settled && !block.isError ? readCheckResult(block.content, block.meta) : null;
			const stopped = [
				"interrupted",
				"ABORTED",
				"ABORTED_BEFORE_DISPATCH"
			].includes(block.error?.code);
			const state = !settled ? phase : stopped ? "stopped" : block.isError || result?.errors.length ? "error" : result ? "ok" : "raw";
			const status = state === "preparing" ? tr("Готовится проверка") : state === "start" ? tr("Бросаем кубики") : state === "stopped" ? tr("Проверка прервана") : state === "error" ? tr("Есть ошибки") : state === "raw" ? tr("Исходный результат") : tr("Готово");
			const purpose = result?.purpose ?? dicePurpose(block);
			const raw = (block.content ?? []).map((item) => item.type === "text" ? item.text : JSON.stringify(item)).join("\n");
			const check = result?.check;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-dice-card",
				"data-state": state,
				"aria-label": tr("Игровая проверка"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-dice-header",
						children: [settled ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mayori-dice-toggle",
							"aria-expanded": expanded,
							"aria-controls": id,
							onClick: toggle,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Игровая проверка") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "mayori-dice-status",
									children: status
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: expanded ? "⌃" : "⌄"
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-dice-toggle",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Игровая проверка") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-dice-status",
								children: status
							})]
						}), inspect && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mayori-dice-inspect",
							onClick: inspect,
							children: tr("В журнал")
						})]
					}),
					purpose && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "mayori-dice-purpose",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: purpose })
					}),
					check && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-check-summary",
						"data-outcome": check.outcome,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
								className: "mayori-check-outcome",
								children: outcomes[check.outcome]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
								tr("На d"),
								result.rules.sides,
								": ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: check.natural }),
								tr(" · модификатор: "),
								check.modifier >= 0 ? "+" : "−",
								Math.abs(check.modifier),
								tr(" · итог: "),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: check.total }),
								tr(" · сложность: "),
								check.target
							] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: reasons[check.reason] }),
							result.damage && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
								tr("Урон: "),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: result.damage.value }),
								" ",
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("code", {
									dir: "ltr",
									children: [
										"(",
										result.damage.expression,
										")"
									]
								})
							] }),
							result.consequence && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [tr("Последствие: "), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: result.consequence.text })] })
						]
					}),
					!!result?.errors.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "mayori-dice-error",
						children: tr("Часть проверки не вычислена. Выпавшие грани сохранены; повторного броска не было.")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						id,
						hidden: !expanded,
						className: "mayori-dice-record",
						children: result ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
							tr("Правила: "),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: result.rules.id }),
							tr(", версия "),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("bdi", { children: result.rules.version }),
							tr(". Разница со сложностью: "),
							check?.margin ?? tr("не вычислена"),
							"."
						] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: tr("Показать полный результат и грани") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: JSON.stringify(result, null, 2) })] })] }) : settled && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: raw || block.error?.reason || tr("Инструмент не вернул результат.") })
					})
				]
			});
		}
		//#endregion
		//#region src/client/styles.js
		/** Plugin-owned style; removed with the client fiber. */
		const BRAND_STYLE = String.raw`
.mayori-personas-panel { box-sizing: border-box; display: flex; flex-direction: column; block-size: 100%; min-block-size: 0; overflow: hidden; container-type: inline-size; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1); font-size: 14px; line-height: 1.5; }
.mayori-personas-panel :is(h2,h3,h4,p) { margin: 0; }
.mayori-personas-panel h2 { font-size: 24px; line-height: 1.25; font-weight: 650; }
.mayori-personas-panel h3 { font-size: 16px; font-weight: 600; }
.mayori-personas-panel h4 { font-size: 15px; font-weight: 600; }
.mayori-personas-panel button { box-sizing: border-box; min-block-size: 40px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 8px 12px; font: inherit; font-weight: 500; line-height: 1.4; color: inherit; background: var(--dsw-alias-bg-layer-1); cursor: pointer; }
@media (hover: hover) { .mayori-personas-panel button:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); } }
.mayori-personas-panel :disabled { opacity: 0.5; cursor: default; }
.mayori-personas-panel :is(button,input,textarea,summary,[tabindex]):focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px; }
.mayori-personas-panel :is(input:not([type=checkbox]),textarea) { box-sizing: border-box; inline-size: 100%; min-inline-size: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; padding: 10px 12px; color: inherit; background: var(--dsw-alias-bg-layer-1); font: inherit; font-size: 16px; line-height: 1.5; }
.mayori-personas-panel input::placeholder,.mayori-personas-panel textarea::placeholder { color: var(--dsw-alias-label-secondary); opacity: 1; }
.mayori-personas-panel label { display: grid; gap: 6px; min-inline-size: 0; font-weight: 500; }
.mayori-personas-panel textarea { resize: vertical; font-weight: 400; }
.mayori-persona-hint,.mayori-persona-empty,.mayori-persona-row small,.mayori-persona-block-list small { font-size: 13px; font-weight: 400; color: var(--dsw-alias-label-secondary); }
.mayori-personas-header { display: flex; flex: none; align-items: center; justify-content: space-between; gap: 16px; padding: 20px 24px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-personas-header > div { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
.mayori-personas-workspace { display: grid; flex: 1; min-block-size: 0; grid-template-columns: 264px minmax(0,1fr); }
.mayori-persona-catalog { min-inline-size: 0; min-block-size: 0; border-inline-end: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
.mayori-persona-library-body { display: flex; flex-direction: column; block-size: 100%; min-block-size: 0; }
.mayori-persona-library-tools { display: grid; flex: none; gap: 8px; padding: 16px; }
.mayori-persona-library-tools .mayori-select-trigger { min-block-size: 40px; background: transparent; }
.mayori-persona-list { list-style: none; margin: 0; padding: 0 12px 16px; min-block-size: 0; overflow: auto; overscroll-behavior: contain; display: flex; flex-direction: column; gap: 4px; }
.mayori-personas-panel .mayori-persona-row { display: flex; align-items: center; inline-size: 100%; min-inline-size: 0; gap: 12px; padding: 12px; text-align: start; border-color: transparent; background: transparent; font-weight: 400; }
.mayori-personas-panel .mayori-persona-row[aria-pressed=true] { background: var(--dsw-alias-bg-layer-1); border-color: var(--dsw-alias-border-l2); box-shadow: inset 3px 0 var(--dsw-alias-label-primary); }
.mayori-persona-avatar { display: grid; place-items: center; inline-size: 44px; block-size: 44px; border-radius: 12px; flex: none; overflow: hidden; background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-primary); font-size: 20px; font-weight: 600; }
.mayori-persona-avatar img { inline-size: 100%; block-size: 100%; object-fit: cover; }
.mayori-persona-row-text { min-inline-size: 0; flex: 1; }
.mayori-persona-row-text strong { display: block; overflow-wrap: anywhere; font-weight: 600; }
.mayori-persona-row-text > small { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; margin-block-start: 2px; }
.mayori-persona-badges { display: flex; gap: 4px 8px; flex-wrap: wrap; }
.mayori-persona-badges em { font-style: normal; font-size: 11px; margin-block-start: 6px; border: 1px solid var(--dsw-alias-border-l2); padding: 0 5px; border-radius: 4px; }
.mayori-persona-empty { padding: 12px 20px; }
.mayori-persona-form { display: flex; flex-direction: column; min-inline-size: 0; min-block-size: 0; }
.mayori-persona-edit-area { display: flex; flex-direction: column; flex: 1; min-block-size: 0; overflow: hidden; }
.mayori-persona-editor-header { display: flex; flex: none; align-items: center; gap: 12px; padding: 16px 24px 0; }
.mayori-persona-editor-header > .mayori-persona-hint { margin-inline-end: auto; }
.mayori-persona-editor-header > :last-child { margin-inline-start: auto; }
.mayori-persona-identity { display: grid; flex: none; grid-template-columns: 68px minmax(0,1fr) minmax(0,1fr); gap: 16px; align-items: center; padding: 16px 24px 20px; }
.mayori-personas-panel .mayori-persona-avatar-picker { display: grid; justify-items: center; gap: 4px; padding: 0; border: 0; background: transparent; font-size: 12px; font-weight: 400; }
.mayori-persona-avatar-picker .mayori-persona-avatar { inline-size: 64px; block-size: 64px; border-radius: 16px; }
.mayori-persona-tabs { display: flex; flex: none; padding-inline: 24px; border-block-end: 1px solid var(--dsw-alias-border-l2); gap: 24px; }
.mayori-personas-panel .mayori-persona-tabs button { position: relative; padding: 12px 0; border: 0; border-radius: 0; background: transparent; color: var(--dsw-alias-label-secondary); font-weight: 500; }
.mayori-personas-panel .mayori-persona-tabs button[aria-selected=true] { color: var(--dsw-alias-label-primary); }
.mayori-persona-tabs button[aria-selected=true]::after { content: ''; position: absolute; inset-inline: 0; inset-block-end: -1px; block-size: 2px; background: currentColor; }
.mayori-persona-tab-count { margin-inline-start: 6px; font-size: 11px; font-variant-numeric: tabular-nums; }
.mayori-persona-editor-content { flex: 1; min-block-size: 0; overflow: auto; overscroll-behavior: contain; padding: 24px; scroll-padding-block: 16px; }
.mayori-persona-description { display: flex; flex-direction: column; gap: 20px; min-block-size: 100%; }
.mayori-persona-long-text { display: flex !important; flex-direction: column; flex: 1; }
.mayori-persona-long-text textarea { flex: 1; min-block-size: 220px; }
.mayori-persona-variant { flex: none; border-block-start: 1px solid var(--dsw-alias-border-l2); padding-block-start: 12px; }
.mayori-personas-panel summary { cursor: pointer; min-block-size: 36px; padding-block: 4px; box-sizing: border-box; }
.mayori-persona-variant[open],.mayori-persona-activation[open] { display: grid; gap: 12px; }
.mayori-persona-variant > button { justify-self: start; }
.mayori-personas-panel .mayori-persona-check { display: flex; align-items: center; gap: 8px; min-block-size: 32px; font-weight: 400; }
.mayori-persona-check input { margin: 0; inline-size: 18px; block-size: 18px; flex: none; accent-color: var(--dsw-alias-label-primary); }
.mayori-persona-settings { display: grid; gap: 28px; max-inline-size: 800px; }
.mayori-persona-settings section { display: grid; gap: 12px; align-content: start; }
.mayori-persona-settings section + section { border-block-start: 1px solid var(--dsw-alias-border-l2); padding-block-start: 24px; }
.mayori-persona-settings section > button { justify-self: start; }
.mayori-persona-settings input:not([type=checkbox]) { max-inline-size: 360px; }
.mayori-persona-binding { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
.mayori-persona-binding span { flex: 1; min-inline-size: 0; overflow-wrap: anywhere; }
.mayori-persona-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.mayori-persona-preview-heading { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-block-end: 4px; }
.mayori-persona-preview { white-space: pre-wrap; overflow-wrap: anywhere; margin: 20px 0 0; padding: 20px; min-block-size: 240px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); font: inherit; font-size: 16px; line-height: 1.7; }
.mayori-persona-footer { flex: none; display: flex; align-items: center; gap: 16px; justify-content: space-between; padding: 16px 24px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-persona-feedback { min-inline-size: 0; font-size: 12px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.mayori-persona-feedback [role=alert] { color: var(--dsw-alias-label-primary); font-weight: 600; }
.mayori-persona-footer-actions { display: flex; flex: none; gap: 8px; }
.mayori-personas-panel .mayori-persona-primary { border-color: var(--dsw-alias-label-primary); background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-layer-1); }
@media (hover: hover) { .mayori-personas-panel .mayori-persona-primary:hover:not(:disabled) { background: var(--dsw-alias-label-primary); opacity: 0.86; } }
.mayori-personas-panel .mayori-persona-library-toggle { display: none; }
.mayori-persona-block-workspace { display: grid; grid-template-columns: 220px minmax(0,1fr); gap: 24px; min-block-size: 100%; }
.mayori-persona-block-outline { min-inline-size: 0; border-inline-end: 1px solid var(--dsw-alias-border-l2); padding-inline-end: 20px; }
.mayori-persona-block-add { display: grid; gap: 8px; margin-block-end: 12px; }
.mayori-persona-block-select { display: none; }
.mayori-persona-block-list { display: grid; list-style: none; gap: 4px; padding: 0; margin: 0; }
.mayori-persona-block-list li[data-nested=true] { margin-inline-start: 16px; border-inline-start: 1px solid var(--dsw-alias-border-l2); padding-inline-start: 8px; }
.mayori-persona-block-list button { display: flex; align-items: center; gap: 8px; inline-size: 100%; padding: 10px 8px; text-align: start; border-color: transparent; background: transparent; }
.mayori-persona-block-list button[aria-pressed=true] { background: var(--dsw-alias-bg-module-platform); border-color: var(--dsw-alias-border-l2); }
.mayori-persona-block-list button > span:last-child { min-inline-size: 0; overflow-wrap: anywhere; }
.mayori-persona-block-list strong { display: block; font-weight: 500; }
.mayori-persona-block-list small { display: block; margin-block-start: 2px; font-size: 12px; }
.mayori-persona-node-kind { flex: none; font-size: 22px; }
.mayori-persona-block-inspector { min-inline-size: 0; display: flex; flex-direction: column; gap: 16px; }
.mayori-persona-block-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.mayori-persona-block-toolbar label { margin-inline-end: auto; }
.mayori-persona-block-toolbar > button { min-inline-size: 40px; }
.mayori-persona-activation { border-block-start: 1px solid var(--dsw-alias-border-l2); padding-block-start: 12px; }
.mayori-persona-group-content { display: grid; gap: 12px; padding: 20px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 8px; }
.mayori-persona-group-content button { justify-self: start; }
.mayori-persona-block-placeholder { display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 8px; padding: 24px; text-align: center; }
.mayori-persona-block-placeholder > span { font-size: 40px; color: var(--dsw-alias-label-secondary); }
.mayori-persona-block-placeholder p { color: var(--dsw-alias-label-secondary); max-inline-size: 32ch; }
@container (max-width: 1100px) { .mayori-personas-workspace { grid-template-columns: 228px minmax(0,1fr); } .mayori-persona-block-workspace { grid-template-columns: 180px minmax(0,1fr); gap: 16px; } .mayori-persona-block-outline { padding-inline-end: 12px; } .mayori-persona-footer { flex-wrap: wrap; gap: 8px; } .mayori-persona-footer-actions { margin-inline-start: auto; } }
@container (max-width: 820px) { .mayori-persona-block-workspace { grid-template-columns: minmax(0,1fr); align-content: start; } .mayori-persona-block-outline { border-inline-end: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); padding: 0 0 16px; } .mayori-persona-block-add { grid-template-columns: 1fr 1fr; } .mayori-persona-block-list { display: none; } .mayori-persona-block-select { display: block; } }
@container (max-width: 680px) {
  .mayori-personas-header { padding: 12px 16px; gap: 8px; } .mayori-personas-header h2 { font-size: 20px; } .mayori-personas-header > div { gap: 0; flex-direction: column; } .mayori-personas-header > button { max-inline-size: 50%; }
  .mayori-personas-workspace { display: flex; flex-direction: column; }
  .mayori-persona-catalog { flex: none; border-inline-end: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); }
  .mayori-personas-panel .mayori-persona-library-toggle { display: flex; justify-content: space-between; inline-size: 100%; border: 0; border-radius: 0; background: transparent; padding: 10px 16px; }
  .mayori-persona-library-body { display: none; max-block-size: 260px; }
  .mayori-persona-catalog[data-open=true] .mayori-persona-library-body { display: flex; }
  .mayori-persona-library-tools { padding: 8px 16px; grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
  .mayori-persona-form { flex: 1; }
  .mayori-persona-editor-header { padding: 12px 16px 0; flex-wrap: wrap; gap: 4px 8px; } .mayori-persona-editor-header h3 { font-size: 14px; } .mayori-persona-editor-header > .mayori-persona-hint { font-size: 11px; }
  .mayori-persona-identity { grid-template-columns: 48px minmax(0,1fr); gap: 8px 12px; padding: 12px 16px; } .mayori-persona-identity > label:last-child { grid-column: 2; } .mayori-persona-avatar-picker { grid-row: 1 / 3; } .mayori-persona-avatar-picker .mayori-persona-avatar { inline-size: 48px; block-size: 48px; border-radius: 12px; }
  .mayori-persona-identity label { gap: 2px; font-size: 12px; } .mayori-persona-identity input { padding: 6px 10px; }
  .mayori-persona-tabs { padding-inline: 12px; gap: 0; justify-content: space-between; } .mayori-personas-panel .mayori-persona-tabs button { font-size: 12px; padding: 12px 3px; } .mayori-persona-tab-count { display: none; }
  .mayori-persona-editor-content { padding: 16px; }
  .mayori-persona-footer { padding: 12px 16px max(12px,env(safe-area-inset-bottom)); gap: 8px; }
  .mayori-persona-footer-actions { flex: 1; flex-wrap: wrap; margin: 0; } .mayori-persona-footer-actions > button { flex: 1 1 140px; min-block-size: 44px; font-size: 13px; padding: 8px; }
  .mayori-persona-feedback { flex-basis: 100%; }
  .mayori-persona-preview { padding: 12px; }
}
@media (forced-colors: active) { .mayori-persona-tabs button[aria-selected=true],.mayori-persona-row[aria-pressed=true],.mayori-persona-block-list button[aria-pressed=true] { outline: 2px solid Highlight; outline-offset: -2px; } }
@container (max-width: 360px) { .mayori-persona-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; } .mayori-personas-panel .mayori-persona-tabs button { text-align: start; font-size: 13px; } .mayori-persona-editor-header > .mayori-persona-hint { flex: 1; } }
@media (max-height: 700px) { .mayori-persona-edit-area { overflow: auto; overscroll-behavior: contain; scroll-padding-block: 16px; } .mayori-persona-editor-content { flex: none; overflow: visible; } .mayori-persona-description { min-block-size: 300px; } }
` + String.raw`
.mayori-select { display: inline-flex; inline-size: 100%; min-inline-size: 0; vertical-align: middle; }
.mayori-select-trigger { display: inline-flex; align-items: center; justify-content: space-between; gap: 12px; box-sizing: border-box; inline-size: 100%; min-inline-size: 0; min-block-size: 40px; padding: 9px 12px; border: 0; border-radius: var(--dsw-radius-md, 8px); background: var(--dsw-alias-bg-module-platform, var(--dsw-alias-bg-layer-2)); color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; font-weight: 400; line-height: 22px; text-align: start; cursor: pointer; }
.mayori-select-trigger > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mayori-select-trigger > svg { flex: none; inline-size: 16px; block-size: 16px; }
.mayori-select-trigger:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-select-trigger:focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 3px; }
.mayori-select-trigger:disabled { opacity: 0.5; cursor: default; }
.mayori-dice-card { min-inline-size: 0; margin-block: 8px; padding: 12px 16px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font: inherit; font-size: 14px; }
.mayori-dice-header { display: flex; align-items: flex-start; gap: 8px; }
.mayori-dice-toggle { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; flex: 1; min-inline-size: 0; min-block-size: 36px; padding: 4px 0; border: 0; background: transparent; color: inherit; font: inherit; text-align: start; }
button.mayori-dice-toggle { cursor: pointer; }
.mayori-dice-toggle > svg { flex: none; }
.mayori-dice-toggle > span:first-of-type { font-weight: 600; }
.mayori-dice-chevron { margin-inline-start: auto; }
.mayori-dice-status, .mayori-dice-path, .mayori-dice-hint, .mayori-dice-group-label { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-dice-status { margin-inline-start: auto; }
.mayori-dice-inspect { min-block-size: 36px; padding: 4px 8px; flex: none; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; font-size: 12px; cursor: pointer; }
.mayori-dice-inspect:hover, button.mayori-dice-toggle:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-dice-card :is(button, summary):focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 3px; }
.mayori-dice-purpose { margin: 4px 0 12px; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-dice-results { list-style: none; margin: 0; padding: 0; }
.mayori-dice-results > li { padding-block: 10px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-dice-result-row { display: flex; align-items: baseline; gap: 16px; }
.mayori-dice-formula { display: grid; flex: 1; min-inline-size: 0; gap: 3px; }
.mayori-dice-card code { color: inherit; font-size: 13px; white-space: pre-wrap; overflow-wrap: anywhere; }
.mayori-dice-path { overflow-wrap: anywhere; }
.mayori-dice-total { font-size: 20px; font-weight: 600; font-variant-numeric: tabular-nums; }
.mayori-dice-result-error { font-weight: 600; }
.mayori-dice-breakdown { display: grid; gap: 8px; margin-block-start: 10px; }
.mayori-dice-group-label { display: flex; flex-wrap: wrap; gap: 8px; margin-block-end: 6px; }
.mayori-dice-faces { display: flex; flex-wrap: wrap; gap: 6px; }
.mayori-dice-face { display: inline-flex; align-items: center; justify-content: center; min-inline-size: 28px; min-block-size: 28px; padding-inline: 4px; box-sizing: border-box; border: 1px solid var(--dsw-alias-border-l2); border-radius: 6px; font-variant-numeric: tabular-nums; }
.mayori-dice-dropped { color: var(--dsw-alias-label-secondary); text-decoration-thickness: 2px; }
.mayori-dice-error { margin-block: 8px; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-dice-card summary { min-block-size: 32px; padding-block: 4px; box-sizing: border-box; cursor: pointer; }
.mayori-dice-record pre, .mayori-dice-all-faces p { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 12px; line-height: 1.5; }
.mayori-dice-hint { margin: 8px 0 0; line-height: 1.5; }
.mayori-dice-observation { display: flex; flex-wrap: wrap; gap: 4px 12px; margin: 6px 0 0; line-height: 1.5; }
.mayori-check-summary p { margin: 6px 0; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-check-outcome { font-size: 18px; }
.mayori-dice-sr { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.mayori-navigation { --dsh-sidebar-inline-padding: 12px; display: flex; flex-direction: column; box-sizing: border-box; block-size: 100%; min-block-size: 0; padding: 6px 12px; background: var(--dsw-specific-sidebar-fill); color: var(--dsw-alias-label-primary); font-size: 14px; }
.mayori-navigation-header { display: flex; align-items: center; gap: 8px; flex: none; block-size: 48px; padding-inline: 4px; }
:is(.mayori-navigation-brand, .mayori-navigation-toggle, .mayori-navigation-row) { display: flex; align-items: center; border: 0; background: transparent; color: inherit; font: inherit; cursor: pointer; }
:is(.mayori-navigation-brand, .mayori-navigation-toggle, .mayori-navigation-row):focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, currentColor); outline-offset: -2px; }
.mayori-navigation-brand { flex: 1; min-inline-size: 0; gap: 8px; padding: 0; block-size: 36px; text-align: start; }
.mayori-navigation-brand > span:first-child { display: flex; flex: none; }
.mayori-navigation-name { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 18px; font-weight: 600; line-height: 24px; }
.mayori-navigation-toggle { position: relative; justify-content: center; flex: none; inline-size: 28px; block-size: 28px; padding: 0; border-radius: 8px; }
.mayori-navigation-toggle:hover, .mayori-navigation-row:hover, .mayori-navigation-row[aria-current=page] { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-navigation-panels { display: grid; gap: 4px; flex: none; }
.mayori-navigation-row { gap: 10px; min-inline-size: 0; inline-size: 100%; min-block-size: 36px; padding: 8px 12px; border-radius: 12px; text-align: start; }
.mayori-navigation-glyph { display: flex; align-items: center; justify-content: center; flex: none; inline-size: 18px; }
.mayori-navigation-label { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.mayori-navigation-region { flex: 1; min-block-size: 0; overflow: auto; }
.mayori-navigation-footer { display: flex; flex-direction: column; flex: none; gap: 4px; }
.mayori-navigation[data-collapsed=true] { --dsh-sidebar-inline-padding: 10px; padding: 18px 10px 6px; }
.mayori-navigation[data-collapsed=true] .mayori-navigation-header { block-size: 36px; padding: 0; margin-block-end: 12px; }
.mayori-navigation[data-collapsed=true] .mayori-navigation-toggle { inline-size: 36px; block-size: 36px; border-radius: 12px; }
.mayori-navigation[data-collapsed=true] .mayori-navigation-row { justify-content: center; inline-size: 36px; padding: 8px; }
html[data-windows-titlebar] .mayori-navigation-toggle { position: fixed; inset-block-start: calc((var(--dsh-windows-titlebar-height) - 28px) / 2); inset-inline-start: 12px; z-index: 30; -webkit-app-region: no-drag; inline-size: 28px; block-size: 28px; }
html[data-windows-titlebar] .mayori-navigation-header { block-size: 40px; }
html[data-windows-titlebar] .mayori-navigation[data-collapsed=true] { padding: 0; }
html[data-windows-titlebar] .mayori-navigation[data-collapsed=true] :is(.mayori-navigation-panels, .mayori-navigation-region, .mayori-navigation-footer) { display: none; }
html[data-platform=darwin] .mayori-navigation { background: transparent; padding-block-start: 52px; }
.mayori-message { position: relative; display: grid; grid-template-areas: 'avatar' 'content'; gap: 8px; min-inline-size: 0; }
.mayori-message-content { grid-area: content; min-inline-size: 0; }
.mayori-message-actions { display: inline-flex; flex: none; align-items: center; gap: 8px; color: var(--dsw-alias-label-tertiary); }
[data-clock]:has(> .mayori-message-actions) { flex-wrap: wrap; height: auto; min-block-size: calc(28px + var(--dsh-content-font-delta, 0px)); }
.mayori-message-actions button { display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; inline-size: calc(28px + var(--dsh-content-font-delta, 0px)); block-size: calc(28px + var(--dsh-content-font-delta, 0px)); padding: 6px; border: 0; border-radius: var(--dsw-radius-sm, 6px); background: transparent; color: inherit; cursor: pointer; }
.mayori-message-actions svg { inline-size: calc(15px + var(--dsh-content-font-delta, 0px)); block-size: calc(15px + var(--dsh-content-font-delta, 0px)); }
[data-clock=end] .mayori-message-actions svg { inline-size: calc(17px + var(--dsh-content-font-delta, 0px)); block-size: calc(17px + var(--dsh-content-font-delta, 0px)); }
.mayori-message-actions button:hover:not([aria-disabled="true"]) { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary); }
.mayori-revision-status { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.mayori-message-actions button:is(:disabled, [aria-disabled="true"]) { cursor: default; opacity: 0.5; }
.mayori-message-actions button:focus-visible, .mayori-message-editor :is(button, textarea):focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px; }
.mayori-message-editor { box-sizing: border-box; inline-size: min(720px, calc(100vw - 32px)); max-block-size: calc(100dvh - 32px); margin: auto; padding: 24px; overflow: auto; border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-message-editor::backdrop { background: oklch(0 0 0 / 0.56); }
.mayori-message-editor form { display: grid; gap: 12px; }
.mayori-message-editor h2, .mayori-message-editor p { margin: 0; }
.mayori-message-editor h2 { font-size: 20px; }
.mayori-message-editor p { line-height: 1.5; }
.mayori-message-confirm { inline-size: min(360px, calc(100vw - 32px)); }
.mayori-message-editor textarea { box-sizing: border-box; inline-size: 100%; min-block-size: 180px; max-block-size: 45dvh; resize: vertical; padding: 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: inherit; font: inherit; font-size: 16px; line-height: 1.5; }
.mayori-message-editor-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; }
.mayori-message-editor-actions button { min-block-size: 44px; padding: 8px 16px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: inherit; font: inherit; cursor: pointer; }
.mayori-message-editor-actions button:disabled { cursor: default; opacity: 0.5; }
.mayori-revision-branches { grid-column: 1 / -1; min-inline-size: 0; padding-block: 8px; font-size: 12px; color: var(--dsw-alias-label-secondary); }
.mayori-revision-branches { display: flex; align-items: center; gap: 8px; }
.mayori-revision-branches > span:first-child { flex: none; }
.mayori-revision-branches .mayori-select { inline-size: auto; max-inline-size: min(480px, 70%); }
.mayori-message > .mayori-message-avatar { grid-area: avatar; justify-self: start; }
.mayori-message-user > .mayori-message-avatar { justify-self: end; }
.mayori-message[data-avatar-placement=side] { display: block; min-block-size: 44px; }
.mayori-message[data-avatar-placement=side] > .mayori-message-avatar { position: absolute; inset-block-start: 0; z-index: 1; }
.mayori-message-character[data-avatar-placement=side] > .mayori-message-avatar { inset-inline-end: calc(100% + 12px); }
.mayori-message-user[data-avatar-placement=side] > .mayori-message-avatar { inset-inline-start: calc(100% + 12px); }
.mayori-message .mayori-message-avatar { display: grid; place-items: center; flex: none; box-sizing: border-box; inline-size: 44px; block-size: 44px; padding: 0; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2); border-radius: 50%; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); font: inherit; font-size: 20px; cursor: pointer; }
.mayori-message-avatar img { inline-size: 100%; block-size: 100%; object-fit: cover; }
.mayori-message-avatar:hover { border-color: var(--dsw-alias-label-secondary); }
.mayori-message-avatar:focus-visible, .mayori-avatar-dialog button:focus-visible { outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 3px; }
.mayori-avatar-dialog { box-sizing: border-box; inline-size: min(720px, calc(100vw - 32px)); block-size: min(900px, calc(100dvh - 32px)); max-inline-size: calc(100vw - 32px); max-block-size: calc(100dvh - 32px); margin: auto; padding: 0; overflow: hidden; border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-avatar-dialog[open] { display: grid; grid-template-rows: auto minmax(0, 1fr); }
.mayori-avatar-dialog::backdrop { background: oklch(0 0 0 / 0.56); }
.mayori-avatar-dialog-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 16px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-avatar-dialog h2 { margin: 0; min-inline-size: 0; overflow-wrap: anywhere; font-size: 20px; }
.mayori-avatar-dialog button { flex: none; inline-size: 44px; block-size: 44px; border: 0; border-radius: 8px; background: var(--dsw-alias-bg-layer-2); color: inherit; font: inherit; font-size: 26px; cursor: pointer; }
.mayori-avatar-dialog button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-avatar-dialog-media { display: grid; place-items: center; min-inline-size: 0; min-block-size: 0; overflow: hidden; padding: 16px; }
.mayori-avatar-dialog-media img { display: block; inline-size: 100%; block-size: 100%; min-inline-size: 0; min-block-size: 0; object-fit: contain; }
.mayori-trajectory { display: flex; flex-direction: column; block-size: 100%; min-block-size: 0; color: var(--dsw-alias-label-primary); }
.mayori-trajectory-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 16px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-trajectory-field { display: flex; align-items: center; gap: 8px; min-inline-size: 0; max-inline-size: 100%; }
.mayori-trajectory-field > span:first-child { flex: none; }
.mayori-trajectory-controls > button { max-inline-size: 100%; min-block-size: 40px; padding: 6px 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; color: inherit; background: var(--dsw-alias-bg-l1); font: inherit; }
.mayori-trajectory-controls > button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.mayori-trajectory-context { display: flex; flex: 1; flex-direction: column; min-block-size: 0; }
.mayori-trajectory-context > p { padding-inline: 16px; }
.mayori-trajectory-table { flex: 1; min-block-size: 0; }
.mayori-trajectory-journal { flex: 1; min-block-size: 0; }
.mayori-presets-panel { block-size: 100%; overflow-y: auto; container-type: inline-size; color: var(--dsw-alias-label-primary, CanvasText); background: var(--dsw-alias-bg-l1, Canvas); font-size: 14px; }
.mayori-presets-content { box-sizing: border-box; display: flex; flex-direction: column; gap: 24px; min-block-size: 100%; max-inline-size: 1360px; margin-inline: auto; padding: 28px 32px; }
.mayori-presets-panel :is(h1, h2, p) { margin: 0; }
.mayori-presets-panel :is(button, input, textarea, summary):focus-visible { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: 3px; }
.mayori-presets-panel :is(input, textarea) { box-sizing: border-box; min-inline-size: 0; inline-size: 100%; min-block-size: 42px; border: 1px solid var(--dsw-alias-border-l2, GrayText); border-radius: 9px; padding: 10px 12px; color: inherit; background: var(--dsw-alias-bg-l1, Canvas); font: inherit; }
.mayori-presets-panel :is(input, textarea)::placeholder { color: var(--dsw-alias-label-secondary, GrayText); opacity: 1; }
.mayori-presets-panel :is(button, summary) { cursor: pointer; }
.mayori-presets-panel :disabled { opacity: 0.5; cursor: default; }
.mayori-presets-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.mayori-presets-header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.mayori-presets-header h1 { font-size: 26px; line-height: 1.3; font-weight: 650; }
.mayori-preset-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-block-size: 42px; flex: none; padding: 10px 14px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; background: var(--dsw-alias-bg-l1, Canvas); color: inherit; font: inherit; font-weight: 500; }
.mayori-preset-button:hover, .mayori-preset-menu :is(summary, button):hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-preset-button.mayori-preset-primary { background: var(--dsw-alias-label-primary, CanvasText); border-color: var(--dsw-alias-label-primary, CanvasText); color: var(--dsw-alias-bg-l1, Canvas); }
.mayori-preset-primary:hover { opacity: 0.86; }
.mayori-presets-usage { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 18px 20px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-l2, var(--dsw-alias-bg-layer-2, Canvas)); }
.mayori-preset-usage { display: grid; align-content: start; gap: 8px; min-inline-size: 0; }
.mayori-presets-panel label { font-weight: 500; font-size: 13px; }
.mayori-preset-usage p { font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-current-control { display: flex; gap: 8px; min-inline-size: 0; }
.mayori-presets-workspace { min-inline-size: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 14px; }
.mayori-preset-library-disclosure { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; }
.mayori-preset-library-disclosure > summary { padding: 14px 18px; overflow-wrap: anywhere; }
.mayori-preset-library { display: flex; flex-direction: column; gap: 16px; padding: 16px; background: var(--dsw-alias-bg-l2, Canvas); border-end-start-radius: 10px; border-end-end-radius: 10px; }
.mayori-preset-search { position: relative; display: flex; align-items: center; }
.mayori-preset-search > svg { position: absolute; inset-inline-start: 12px; pointer-events: none; color: var(--dsw-alias-label-secondary); }
.mayori-preset-search input { padding-inline-start: 38px; font-weight: 400; }
.mayori-preset-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; max-block-size: 320px; overflow-y: auto; overscroll-behavior: contain; list-style: none; padding: 5px; margin: -5px; }
.mayori-preset-row { display: flex; flex-direction: column; align-items: stretch; gap: 10px; inline-size: 100%; padding: 14px 12px; border: 1px solid transparent; border-radius: 10px; color: inherit; background: transparent; font: inherit; text-align: start; }
.mayori-preset-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-preset-row[aria-pressed=true] { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-l1, Canvas); box-shadow: 0 2px 5px oklch(0 0 0 / 0.03); }
.mayori-preset-row-title { display: flex; gap: 8px; align-items: flex-start; min-inline-size: 0; }
.mayori-preset-row-title svg { flex: none; margin-block-start: 1px; color: var(--dsw-alias-label-secondary); }
.mayori-preset-row-title strong { font-size: 14px; font-weight: 600; line-height: 1.5; overflow-wrap: anywhere; }
.mayori-preset-preview { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }
.mayori-preset-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.mayori-preset-tags > span { padding: 3px 6px; border-radius: 4px; background: var(--dsw-alias-interactive-bg-hover); font-size: 10px; line-height: 1.5; }
.mayori-preset-empty { padding: 8px 6px; color: var(--dsw-alias-label-secondary); font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; }
.mayori-preset-editor { min-inline-size: 0; display: flex; flex-direction: column; gap: 22px; padding: 24px; }
.mayori-preset-editor-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.mayori-preset-editor-heading > div { min-inline-size: 0; }
.mayori-preset-editor h2 { font-size: 19px; font-weight: 600; line-height: 1.4; overflow-wrap: anywhere; }
.mayori-preset-save-state { display: block; margin-block-start: 4px; color: var(--dsw-alias-label-secondary); font-size: 12px; line-height: 1.5; }
.mayori-preset-name-field { display: grid; gap: 8px; }
.mayori-preset-editor-footer { display: grid; gap: 12px; padding-block-start: 16px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-preset-feedback { font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-feedback p:empty { display: block; block-size: 0; }
.mayori-preset-editor-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.mayori-preset-text-button { min-block-size: 40px; padding: 8px 4px; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
.mayori-preset-menu { position: relative; flex: none; }
.mayori-preset-menu summary { display: grid; place-items: center; inline-size: 40px; block-size: 40px; border-radius: 8px; list-style: none; }
.mayori-preset-menu summary::-webkit-details-marker { display: none; }
.mayori-preset-menu > div { position: absolute; z-index: 4; inset-inline-end: 0; inset-block-start: calc(100% + 6px); inline-size: 210px; padding: 6px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; background: var(--dsw-alias-bg-l1, Canvas); box-shadow: 0 8px 24px oklch(0 0 0 / 0.12); }
.mayori-preset-menu button { display: block; inline-size: 100%; min-block-size: 40px; padding: 10px; border: 0; border-radius: 6px; background: transparent; color: inherit; text-align: start; font: inherit; }
.mayori-preset-menu .mayori-preset-delete { color: var(--dsw-alias-label-error, #b42318); }
.mayori-preset-error { font-size: 13px; line-height: 1.6; overflow-wrap: anywhere; color: var(--dsw-alias-label-error); }
.mayori-preset-structure { position: relative; min-inline-size: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; }
.mayori-preset-structure [hidden] { display: none !important; }
.mayori-preset-structure h3 { margin: 0; font-size: 14px; font-weight: 600; line-height: 1.5; }
.mayori-preset-structure-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 16px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-preset-structure-heading p, .mayori-preset-node-path, .mayori-preset-node-state { font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.mayori-preset-structure-heading p, .mayori-preset-structure-footer span { font-variant-numeric: tabular-nums; }
.mayori-preset-structure-layout { display: grid; grid-template-columns: max(210px, calc(100% * 0.9 / 2.3 - 50px)) minmax(0, 1fr); }
.mayori-preset-structure-tree { min-inline-size: 0; background: var(--dsw-alias-bg-l2, Canvas); border-inline-end: 1px solid var(--dsw-alias-border-l2); padding: 14px 8px; }
.mayori-preset-tree-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 0 8px 12px; }
.mayori-preset-tree-toolbar h3 { flex-basis: 100%; }
.mayori-preset-tree-scroll { max-block-size: 580px; overflow-y: auto; overscroll-behavior: contain; padding: 4px; }
.mayori-preset-tree-list { list-style: none; padding: 0; margin: 0; }
.mayori-preset-tree-children { margin-inline-start: 14px; padding-inline-start: 5px; border-inline-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-preset-tree-children[data-deep=true] { margin-inline-start: 0; padding-inline-start: 0; border-inline-start: 0; }
.mayori-preset-tree-row { position: relative; display: flex; align-items: center; gap: 2px; margin-block: 4px; border: 1px solid transparent; border-radius: 7px; }
.mayori-preset-tree-row.is-selected { background: var(--dsw-alias-interactive-bg-hover, Canvas); border-color: var(--dsw-alias-border-l2); }
.mayori-preset-tree-row.is-dragging { opacity: 0.5; }
.mayori-preset-tree-row.drop-before::before, .mayori-preset-tree-row.drop-after::after { content: ''; position: absolute; inset-inline: 0; block-size: 3px; background: var(--dsw-alias-label-primary, CanvasText); }
.mayori-preset-tree-row.drop-before::before { inset-block-start: -4px; }
.mayori-preset-tree-row.drop-after::after { inset-block-end: -4px; }
.mayori-preset-tree-row.drop-inside, .mayori-preset-root-drop.drop-inside { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: -2px; background: var(--dsw-alias-interactive-bg-hover, Canvas); }
.mayori-presets-panel .mayori-preset-drag-handle { display: grid; place-items: center; flex: none; inline-size: 28px; min-block-size: 38px; padding: 4px; border: 0; border-radius: 5px; color: var(--dsw-alias-label-secondary); background: transparent; cursor: grab; touch-action: none; }
.mayori-presets-panel .mayori-preset-drag-handle:active:not(:disabled) { cursor: grabbing; }
.mayori-preset-tree-fold { flex: none; inline-size: 22px; min-block-size: 38px; border: 0; border-radius: 5px; padding: 2px; font: inherit; background: transparent; color: inherit; }
.mayori-preset-tree-spacer { flex: none; inline-size: 22px; }
.mayori-presets-panel .mayori-preset-node-toggle { display: inline-flex; align-items: center; gap: 8px; min-block-size: 38px; }
.mayori-presets-panel .mayori-preset-node-toggle input { inline-size: 17px; min-block-size: 17px; block-size: 17px; margin: 0; padding: 0; flex: none; accent-color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-preset-tree-pick { flex: 1; min-inline-size: 0; min-block-size: 44px; padding: 8px 6px; border: 0; border-radius: 5px; text-align: start; font: inherit; color: inherit; background: transparent; overflow-wrap: anywhere; }
.mayori-preset-group-title { font-weight: 600; }
.mayori-preset-tree-pick small { display: block; font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-tree-empty { padding: 10px 16px; font-size: 13px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.mayori-preset-root-drop { margin-block-start: 14px; padding: 10px; border: 1px dashed var(--dsw-alias-border-l2); border-radius: 6px; font-size: 12px; color: var(--dsw-alias-label-secondary); text-align: center; }
.mayori-preset-node-editor { display: flex; flex-direction: column; align-items: stretch; gap: 16px; min-inline-size: 0; padding: 22px; }
.mayori-preset-node-field { display: flex; flex-direction: column; gap: 8px; min-inline-size: 0; }
.mayori-presets-panel .mayori-preset-node-field textarea { min-block-size: 300px; max-inline-size: none; resize: vertical; font-size: 16px; line-height: 1.6; }
.mayori-preset-group-content { display: grid; gap: 8px; }
.mayori-preset-group-content ul { padding-inline-start: 20px; margin: 0; }
.mayori-preset-node-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mayori-preset-node-actions .mayori-preset-delete { color: var(--dsw-alias-label-error, #b42318); }
.mayori-preset-structure-footer { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; padding: 12px 16px; border-block-start: 1px solid var(--dsw-alias-border-l2); font-size: 12px; line-height: 1.5; color: var(--dsw-alias-label-secondary); }
.mayori-preset-compiled { padding: 20px; }
.mayori-preset-compiled pre { margin: 14px 0; max-inline-size: 75ch; white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-size: 16px; line-height: 1.6; }
.mayori-preset-compiled summary { min-block-size: 40px; padding-block: 8px; }
.mayori-preset-compiled ol { padding-inline-start: 24px; overflow-wrap: anywhere; }
.mayori-preset-drag-ghost { position: absolute; z-index: 5; inline-size: 180px; padding: 10px 12px; border: 1px solid var(--dsw-alias-label-primary, CanvasText); border-radius: 8px; pointer-events: none; color: var(--dsw-alias-label-primary, CanvasText); background: var(--dsw-alias-bg-l1, Canvas); box-shadow: 0 6px 18px oklch(0 0 0 / 0.2); overflow-wrap: anywhere; }
.mayori-preset-move-dialog { box-sizing: border-box; inline-size: min(460px, calc(100% - 32px)); max-block-size: calc(100dvh - 32px); padding: 24px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: var(--dsw-alias-bg-l1, Canvas); color: var(--dsw-alias-label-primary, CanvasText); overflow-y: auto; overscroll-behavior: contain; }
.mayori-preset-move-dialog::backdrop { background: oklch(0 0 0 / 0.4); }
.mayori-preset-move-dialog > * + * { margin-block-start: 16px; }
@media (hover: hover) { .mayori-preset-tree-pick:hover, .mayori-preset-tree-fold:hover, .mayori-presets-panel .mayori-preset-drag-handle:hover { background: var(--dsw-alias-interactive-bg-hover); } }
@media (pointer: coarse) { .mayori-presets-panel :is(.mayori-preset-drag-handle, .mayori-preset-tree-fold) { min-block-size: 44px; } }
@container (max-width: 900px) {
  .mayori-presets-content { padding: 24px; }
  .mayori-preset-structure-layout { grid-template-columns: max(190px, calc(100% * 0.9 / 2.1 - 50px)) minmax(0, 1fr); }
  .mayori-preset-current-control { flex-wrap: wrap; }
}
@container (max-width: 680px) {
  .mayori-presets-content { block-size: auto; min-block-size: 100%; padding: 20px 16px; gap: 20px; }
  .mayori-presets-header { flex-wrap: wrap; gap: 12px; }
  .mayori-presets-header h1 { font-size: 24px; }
  .mayori-presets-usage { grid-template-columns: minmax(0, 1fr); gap: 18px; padding: 16px; }
  .mayori-preset-structure-layout { grid-template-columns: minmax(0, 1fr); }
  .mayori-preset-structure-tree { border-inline-end: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); }
  .mayori-preset-node-editor { padding: 16px 12px; }
  .mayori-preset-tree-scroll { max-block-size: 380px; }
  .mayori-preset-tree-children { margin-inline-start: 5px; padding-inline-start: 2px; }
  .mayori-preset-editor { padding: 20px 16px; gap: 20px; }
  .mayori-preset-editor-footer { position: sticky; inset-block-end: 0; z-index: 2; background: var(--dsw-alias-bg-l1, Canvas); padding-block-end: max(8px, env(safe-area-inset-bottom)); }
  .mayori-presets-panel :is(input, textarea) { font-size: 16px; }
  .mayori-presets-panel .mayori-select-trigger { min-block-size: 44px; }
  .mayori-preset-editor-actions > button { flex: 1 1 auto; min-block-size: 44px; }
}
.mayori-greeting-swipes { display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-block-start: 8px; font-variant-numeric: tabular-nums; }
.mayori-greeting-swipes button { inline-size: 44px; block-size: 44px; border: 0; border-radius: 8px; font-size: 24px; color: inherit; background: transparent; cursor: pointer; }
.mayori-greeting-swipes button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-greeting-swipes button:disabled { opacity: 0.5; cursor: wait; }
.mayori-greeting-swipes button:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
 .mayori-gallery-panel {
  block-size: 100%; min-block-size: 0; overflow: hidden;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
  color: var(--dsw-alias-label-primary);
}
.mayori-gallery-panel button:focus-visible, .mayori-history-panel button:focus-visible,
.mayori-gallery-panel input:focus-visible, .mayori-history-panel input:focus-visible,
.mayori-character-dialog button:focus-visible {
  outline: 2px solid var(--dsw-alias-label-primary); outline-offset: 2px;
}
.mayori-history-panel { box-sizing: border-box; block-size: 100%; overflow-y: auto; padding: 24px; color: var(--dsw-alias-label-primary); }
.mayori-history-header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; }
.mayori-history-panel .mayori-search input { padding-inline-start: 12px; }
.mayori-history-list { padding: 0; margin: 20px 0; list-style: none; }
.mayori-history-item { display: flex; align-items: center; gap: 8px; }
.mayori-history-item > .mayori-history-row { flex: 1; min-inline-size: 0; }
.mayori-history-item > .mayori-secondary-button { flex: none; }
.mayori-history-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; }
.mayori-history-controls label { display: flex; align-items: center; gap: 8px; }
.mayori-history-filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-block: 16px; }
.mayori-history-filters > label { display: grid; gap: 6px; min-inline-size: 0; }
.mayori-history-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.mayori-history-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; inline-size: 100%; padding: 16px 12px; border: 0; border-block-end: 1px solid var(--dsw-alias-border-l2); background: transparent; color: inherit; font: inherit; text-align: start; cursor: pointer; }
.mayori-history-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-history-row > span { min-inline-size: 0; overflow-wrap: anywhere; }
.mayori-history-row small { display: block; margin-block-start: 4px; }
.mayori-history-row time, .mayori-history-row small { color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-gallery-shell { display: grid; grid-template-rows: 72px minmax(0, 1fr); block-size: 100%; }
.mayori-gallery-header {
  position: relative; z-index: 4; display: flex; align-items: center; justify-content: space-between; gap: 24px;
  padding: 12px 20px 12px 24px; border-block-end: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill));
}
.mayori-gallery-header h2, .mayori-gallery-header p, .mayori-card h3, .mayori-card p,
.mayori-empty h3, .mayori-empty p, .mayori-character-header h2, .mayori-character-header p { margin: 0; }
.mayori-gallery-title { min-inline-size: 0; }
.mayori-gallery-title h2 { font-size: 24px; line-height: 1.15; letter-spacing: -0.02em; }
.mayori-gallery-title p { margin-block-start: 3px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
.mayori-gallery-header-actions { display: flex; align-items: center; gap: 8px; }
.mayori-icon-action {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  inline-size: 40px; block-size: 40px; padding: 0; border: 0; border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); cursor: pointer;
}
.mayori-icon-action:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-filter-toggle {
  display: none; align-items: center; justify-content: center; gap: 8px; min-block-size: 40px;
  padding: 0 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit; cursor: pointer;
}
.mayori-gallery-workspace { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 260px; min-block-size: 0; }
.mayori-filter-panel {
  display: flex; min-block-size: 0; flex-direction: column; gap: 24px; padding: 24px 20px;
  grid-column: 2; grid-row: 1; border-inline-start: 1px solid var(--dsw-alias-border-l2); overflow-y: auto; overscroll-behavior: contain;
  background: var(--dsw-alias-bg-l2, var(--dsw-specific-sidebar-fill));
}
.mayori-filter-panel-header { display: none; align-items: center; justify-content: space-between; gap: 16px; }
.mayori-filter-panel-header h3 { margin: 0; font-size: 18px; }
.mayori-import-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-block-size: 42px;
  padding: 9px 16px; border-radius: 12px; background: var(--dsw-alias-label-primary);
  color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); font-size: 14px;
  font-weight: 600; cursor: pointer;
}
.mayori-import-button[aria-disabled="true"] { opacity: 0.58; cursor: progress; }
.mayori-import-compact { display: none; min-block-size: 40px; padding: 8px 12px; border-radius: 10px; }
.mayori-import-button input {
  position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden;
  clip-path: inset(50%); white-space: nowrap;
}
.mayori-filter-fields { display: grid; gap: 24px; }
.mayori-search, .mayori-filter-control { display: grid; gap: 7px; color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; }
.mayori-search-control { position: relative; display: flex; align-items: center; }
.mayori-search-control > svg { position: absolute; inset-inline-start: 12px; inline-size: 18px; block-size: 18px; pointer-events: none; }
.mayori-search input {
  inline-size: 100%; min-block-size: 42px; box-sizing: border-box; padding: 9px 12px;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 16px;
}
.mayori-search input { padding-inline-start: 38px; }
.mayori-filter-group { display: grid; gap: 10px; margin: 0; padding: 0; border: 0; }
.mayori-filter-group legend { margin-block-end: 8px; color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; }
.mayori-filter-group label {
  display: grid; grid-template-columns: 20px minmax(0, 1fr) auto; align-items: center; gap: 8px;
  min-block-size: 32px; color: var(--dsw-alias-label-primary); cursor: pointer;
}
.mayori-filter-group input { inline-size: 16px; block-size: 16px; margin: 0; accent-color: currentColor; }
.mayori-tag-filter > div { display: grid; max-block-size: 220px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-tag-filter small { color: var(--dsw-alias-label-secondary); font-size: 11px; font-variant-numeric: tabular-nums; }
.mayori-reset-button {
  min-block-size: 40px; padding: 8px 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; cursor: pointer;
}
.mayori-reset-button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.mayori-gallery-main { grid-column: 1; grid-row: 1; min-inline-size: 0; min-block-size: 0; padding: 20px 24px 32px; overflow-y: auto; overscroll-behavior: contain; container-type: inline-size; }
.mayori-gallery-results { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-block-size: 30px; }
.mayori-gallery-results p { margin: 0; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-gallery-notice { min-block-size: 28px; padding-block: 2px 10px; font-size: 13px; }
.mayori-gallery-notice p { margin: 0; }
.mayori-error, .mayori-card-warning { color: var(--dsw-alias-label-error, #b42318); }
.mayori-success { color: var(--dsw-alias-label-success, #16794b); }
.mayori-card-grid {
  display: grid; grid-template-columns: repeat(var(--mayori-columns, 5), minmax(0, 1fr));
  align-items: stretch; gap: 18px; margin: 0; padding: 0; list-style: none;
}
.mayori-card article {
  display: grid; grid-template-rows: auto minmax(0, 1fr); block-size: 100%; overflow: hidden; container-type: inline-size;
  border: 1px solid var(--dsw-alias-border-l2); border-radius: 16px;
  background: var(--dsw-alias-bg-l2, var(--dsw-specific-sidebar-fill));
}
.mayori-card-media {
  position: relative; display: grid; place-items: center; aspect-ratio: 4 / 5;
  overflow: hidden; background: var(--dsw-alias-interactive-bg-hover);
}
.mayori-card-media img {
  inline-size: 100%; block-size: 100%; object-fit: cover;
  outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px;
}
body[data-ds-dark-theme] .mayori-card-media img { outline-color: oklch(1 0 0 / 0.1); }
.mayori-card-fallback {
  display: grid; place-items: center; inline-size: 72px; block-size: 72px; border-radius: 50%;
  background: var(--dsw-alias-button-elevated-fill); font-size: 32px; font-weight: 600;
}
.mayori-card-body { display: flex; flex-direction: column; gap: 12px; padding: 14px; }
.mayori-card-heading { min-inline-size: 0; }
.mayori-card-heading h3 { overflow-wrap: anywhere; font-size: 17px; line-height: 1.3; }
.mayori-card-heading p { margin-block-start: 4px; overflow: hidden; color: var(--dsw-alias-label-secondary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.mayori-tags { display: flex; flex-wrap: wrap; gap: 6px; margin: 0; padding: 0; list-style: none; }
.mayori-tags li {
  max-inline-size: 100%; overflow: hidden; padding: 4px 8px; border-radius: 999px;
  background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary);
  font-size: 11px; text-overflow: ellipsis; white-space: nowrap;
}
.mayori-card-actions { display: grid; grid-template-columns: 1fr 1fr; margin-block-start: auto; gap: 8px; }
.mayori-greeting-preview { min-inline-size: 0; font-size: 13px; }
.mayori-greeting-preview summary { cursor: pointer; }
.mayori-greeting-preview p { max-block-size: 180px; overflow-y: auto; white-space: pre-wrap; overflow-wrap: anywhere; margin-block-start: 8px; }
.mayori-card-actions button, .mayori-persona-actions button, .mayori-secondary-button, .mayori-danger-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-block-size: 40px;
  padding: 8px 10px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px;
  background: transparent; color: var(--dsw-alias-label-primary); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
}
.mayori-card-actions button > svg, .mayori-danger-button > svg { inline-size: 17px; block-size: 17px; }
.mayori-card-play { background: var(--dsw-alias-label-primary) !important; color: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)) !important; border-color: transparent !important; }
.mayori-card-play:disabled { opacity: 0.62; cursor: progress; }
.mayori-card-edit:hover, .mayori-secondary-button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.mayori-empty {
  display: grid; place-items: center; align-content: center; min-block-size: 280px;
  padding: 32px; text-align: center; color: var(--dsw-alias-label-secondary);
}
.mayori-empty h3 { margin-block-start: 14px; color: var(--dsw-alias-label-primary); }
.mayori-empty p { margin-block-start: 6px; max-inline-size: 40ch; line-height: 1.5; }
.mayori-empty-icon {
  display: grid; place-items: center; inline-size: 52px; block-size: 52px;
  border-radius: 16px; background: var(--dsw-alias-interactive-bg-hover);
}
.mayori-character-dialog {
  inline-size: min(920px, calc(100vw - 32px)); max-inline-size: none;
  block-size: min(760px, calc(100dvh - 32px)); max-block-size: none;
  margin: auto; padding: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 18px;
  background: var(--dsw-alias-bg-l1, var(--dsw-specific-sidebar-fill)); color: var(--dsw-alias-label-primary);
  overflow: hidden; box-shadow: 0 24px 64px oklch(0 0 0 / 0.28), 0 2px 8px oklch(0 0 0 / 0.14);
}
.mayori-character-dialog::backdrop { background: oklch(0 0 0 / 0.56); }
.mayori-character-shell { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; block-size: 100%; }
.mayori-character-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px 20px 16px 24px; border-block-end: 1px solid var(--dsw-alias-border-l2); }
.mayori-character-header h2 { overflow-wrap: anywhere; font-size: 24px; line-height: 1.2; }
.mayori-character-header p { margin-block-start: 5px; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-character-content { display: grid; grid-template-columns: minmax(220px, 34%) minmax(0, 1fr); min-block-size: 0; overflow: hidden; }
.mayori-character-portrait { display: grid; place-items: center; min-block-size: 0; overflow: hidden; background: var(--dsw-alias-interactive-bg-hover); }
.mayori-character-portrait img { inline-size: 100%; block-size: 100%; object-fit: cover; outline: 1px solid oklch(0 0 0 / 0.1); outline-offset: -1px; }
body[data-ds-dark-theme] .mayori-character-portrait img { outline-color: oklch(1 0 0 / 0.1); }
.mayori-character-details { min-inline-size: 0; padding: 24px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-character-details > .mayori-tags { margin-block-end: 24px; }
.mayori-card-warning { margin: 0 0 20px; font-size: 12px; line-height: 1.5; }
.mayori-character-details dl { display: grid; gap: 24px; margin: 0; }
.mayori-character-details dl > div { display: grid; gap: 7px; }
.mayori-character-details dt { color: var(--dsw-alias-label-secondary); font-size: 12px; font-weight: 600; }
.mayori-character-details dd { margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; line-height: 1.55; }
.mayori-character-meta { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-block-start: 32px !important; padding-block-start: 20px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-character-meta dd { color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-character-empty { color: var(--dsw-alias-label-secondary); }
.mayori-character-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 20px 14px 24px; border-block-start: 1px solid var(--dsw-alias-border-l2); }
.mayori-danger-button { border-color: color-mix(in oklch, currentColor 28%, transparent); color: var(--dsw-alias-label-error, #b42318); }
.mayori-danger-button:hover { background: color-mix(in oklch, currentColor 10%, transparent); }
.mayori-filter-scrim { display: none; }
@media (max-width: 900px) {
  .mayori-gallery-workspace { grid-template-columns: minmax(0, 1fr); }
  .mayori-filter-toggle { display: inline-flex; }
  .mayori-import-compact { display: inline-flex; }
  .mayori-filter-panel {
    position: absolute; z-index: 6; inset-block: 0; inset-inline-end: 0; inline-size: min(320px, calc(100vw - 48px));
    box-sizing: border-box; border-inline-start: 1px solid var(--dsw-alias-border-l2);
    box-shadow: -16px 0 40px oklch(0 0 0 / 0.2); transform: translateX(105%); visibility: hidden;
  }
  .mayori-filter-panel.is-open { transform: translateX(0); visibility: visible; }
  .mayori-filter-panel-header { display: flex; }
  .mayori-filter-scrim { position: absolute; z-index: 5; inset: 0; display: block; border: 0; background: oklch(0 0 0 / 0.42); }
  .mayori-character-content { grid-template-columns: minmax(180px, 32%) minmax(0, 1fr); }
}
@media (max-width: 620px) {
  .mayori-gallery-shell { grid-template-rows: 64px minmax(0, 1fr); }
  .mayori-gallery-header { padding-inline: 16px 12px; }
  .mayori-gallery-title h2 { font-size: 20px; }
  .mayori-gallery-title p { display: none; }
  .mayori-filter-toggle span, .mayori-import-compact span { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); }
  .mayori-filter-toggle, .mayori-import-compact { inline-size: 40px; padding: 0; }
  .mayori-gallery-main { padding: 16px 16px 28px; }
  .mayori-card-grid { gap: 12px; }
  .mayori-character-dialog { inset: 0; inline-size: 100vw; block-size: 100dvh; margin: 0; border: 0; border-radius: 0; }
  .mayori-character-content { display: block; overflow-y: auto; }
  .mayori-character-portrait { aspect-ratio: 16 / 10; }
  .mayori-character-details { overflow: visible; }
  .mayori-character-meta { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: no-preference) {
  .mayori-icon-action:active, .mayori-import-button:active, .mayori-card-actions button:active,
  .mayori-secondary-button:active, .mayori-danger-button:active { transform: scale(0.96); }
  .mayori-filter-panel { transition-property: transform, visibility; transition-duration: 160ms; transition-timing-function: ease-out; }
}
.mayori-home-panel { box-sizing: border-box; block-size: 100%; min-block-size: 0; overflow-y: auto; padding: 40px 32px; color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-1, Canvas); }
.mayori-home-content { max-inline-size: 1480px; margin-inline: auto; container-type: inline-size; }
.mayori-home-welcome { margin-block-end: 40px; }
.mayori-home-mark { display: grid; place-items: center; inline-size: 48px; block-size: 48px; margin-block-end: 16px; border-radius: 16px; background: var(--dsw-alias-interactive-bg-hover); }
.mayori-home-welcome h1 { margin: 0; font-size: clamp(26px, 3vw, 36px); line-height: 1.2; text-wrap: balance; }
.mayori-home-welcome p, .mayori-home-empty { color: var(--dsw-alias-label-secondary); line-height: 1.6; }
.mayori-home-section + .mayori-home-section { margin-block-start: 40px; }
.mayori-home-section h2 { margin: 0 0 16px; font-size: 20px; }
.mayori-home-section > .mayori-secondary-button { margin-block-start: 16px; }
.mayori-home-section .mayori-history-list { margin-block: 0; }
.mayori-home-panel :is(button, input):focus-visible, .mayori-history-panel input:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
.mayori-history-row { display: grid; grid-template-columns: 52px minmax(0, 1fr) auto; }
.mayori-history-row .mayori-history-avatar { display: grid; place-items: center; inline-size: 52px; block-size: 52px; overflow: hidden; border-radius: 14px; background: var(--dsw-alias-interactive-bg-hover); font-size: 22px; }
.mayori-history-avatar img { inline-size: 100%; block-size: 100%; object-fit: cover; }
.mayori-history-text { display: grid; gap: 4px; }
.mayori-history-text strong { font-weight: 600; }
.mayori-history-preview { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--dsw-alias-label-secondary); font-size: 13px; }
.mayori-history-row time { white-space: nowrap; }
.mayori-history-row:disabled, .mayori-secondary-button:disabled { opacity: 0.55; cursor: default; }
.mayori-column-control { display: flex; align-items: center; gap: 8px; }
.mayori-column-control .mayori-select { inline-size: 68px; }
.mayori-pagination { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; margin-block-start: 24px; font-size: 13px; font-variant-numeric: tabular-nums; }
.mayori-pagination .mayori-filter-control { display: flex; align-items: center; gap: 8px; }
.mayori-pagination .mayori-select { inline-size: auto; min-inline-size: 68px; }
.mayori-page-actions { display: flex; align-items: center; gap: 8px; }
.mayori-page-actions input { box-sizing: border-box; inline-size: 64px; min-block-size: 42px; padding: 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; font: inherit; font-size: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); color: inherit; }
.mayori-page-actions button { min-inline-size: 40px; font-size: 20px; }
.mayori-character-opening { display: grid; gap: 12px; margin-block-end: 24px; }
.mayori-character-footer, .mayori-character-footer-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.mayori-character-footer-actions { margin-inline-start: auto; }
@container (max-width: 1000px) { .mayori-card-grid { grid-template-columns: repeat(min(var(--mayori-columns, 5), 5), minmax(0, 1fr)); } }
@container (max-width: 650px) { .mayori-card-grid { grid-template-columns: repeat(min(var(--mayori-columns, 5), 3), minmax(0, 1fr)); } }
@container (max-width: 540px) { .mayori-card-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .mayori-card-actions { grid-template-columns: 1fr; } }
@container (max-width: 340px) { .mayori-card-grid { grid-template-columns: minmax(0, 1fr); } }
@container (max-width: 240px) { .mayori-card-actions { grid-template-columns: 1fr; } }
@media (max-width: 700px) {
  .mayori-home-panel { padding: 24px 16px; }
  .mayori-history-panel { padding: 16px; }
  .mayori-history-item { flex-wrap: wrap; gap: 4px; margin-block-end: 12px; }
  .mayori-history-item > .mayori-history-row { flex-basis: 100%; }
  .mayori-history-actions { margin-inline-start: 56px; }
  .mayori-history-row { grid-template-columns: 44px minmax(0, 1fr); gap: 12px; padding-inline: 0; }
  .mayori-history-row .mayori-history-avatar { inline-size: 44px; block-size: 44px; }
  .mayori-history-row time { grid-column: 2; white-space: normal; }
  .mayori-column-control { flex-wrap: wrap; }
}
`;
		//#endregion
		//#region src/features/plugins/client/settings.js
		var PluginSettingsClient = class {
			async read() {
				return this.#call("POST");
			}
			async update(plugins, revision, compaction) {
				return this.#call("PUT", {
					plugins,
					revision,
					compaction
				});
			}
			async #call(method, body = {}) {
				const response = await fetch("/mayori/plugins", {
					method,
					headers: { "content-type": "application/json" },
					body: JSON.stringify(body)
				});
				const result = await response.json();
				if (!response.ok || !result.ok) throw new Error(result.error ?? `HTTP ${response.status}`);
				return result.value;
			}
		};
		//#endregion
		//#region src/features/compaction/shared/settings.js
		const DEFAULT_COMPACTION_INSTRUCTIONS = `Составь краткое изложение предыдущей части ролевой игры, чтобы ведущий мог продолжить её без потери важных фактов.

Сохрани язык игры. Используй следующие разделы:
- Текущая сцена: место, время, участники и последнее незавершённое действие.
- Персонажи и отношения: установленные сведения, намерения, обещания и изменения отношений.
- События и решения игрока: важные поступки, их подтверждённые последствия и точные условия договорённостей.
- Открытые сюжетные линии: квесты, загадки, обязательства и нерешённые вопросы.
- Точные данные: известные характеристики, предметы, ресурсы и уже выполненные броски с их результатами и идентификаторами.
- Предпочтения игрока: ограничения, стиль и явные указания.

Отделяй установленные факты от предположений. Не придумывай события, решения игрока, случайные исходы или неизвестные значения. Не продолжай сцену и не вызывай инструменты: верни только текст изложения.
Если в истории уже есть <compacted-summary>, объедини его с новыми событиями, сохраняя актуальные факты и явно произошедшие изменения. Не копируй старое изложение целиком.`;
		const DEFAULT_COMPACTION = Object.freeze({
			thresholdPercent: 80,
			retainPercent: 16,
			maxSummaryTokens: 4096,
			headroomTokens: 8192,
			instructions: DEFAULT_COMPACTION_INSTRUCTIONS
		});
		/** Validate persisted and submitted settings before they reach the native engine. */
		function validateCompaction(value) {
			if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).some((key) => !Object.hasOwn(DEFAULT_COMPACTION, key))) throw new TypeError("Неизвестная настройка сжатия истории.");
			const settings = {
				...DEFAULT_COMPACTION,
				...value
			};
			for (const [key, title, min, max] of [
				[
					"thresholdPercent",
					"Порог заполнения контекста",
					1,
					99
				],
				[
					"retainPercent",
					"Доля последних сообщений",
					0,
					98
				],
				[
					"maxSummaryTokens",
					"Лимит ответа для изложения",
					1,
					65536
				],
				[
					"headroomTokens",
					"Дополнительный запас контекста",
					0,
					65536
				]
			]) if (!Number.isSafeInteger(settings[key]) || settings[key] < min || settings[key] > max) throw Object.assign(/* @__PURE__ */ new TypeError(`${title}: укажите целое число от ${min} до ${max}.`), { field: key });
			if (settings.retainPercent >= settings.thresholdPercent) throw Object.assign(/* @__PURE__ */ new TypeError("Доля последних сообщений должна быть меньше порога сжатия."), { field: "retainPercent" });
			if (typeof settings.instructions !== "string" || !settings.instructions.trim() || settings.instructions.length > 32768) throw Object.assign(/* @__PURE__ */ new TypeError("Инструкция сжатия должна содержать от 1 до 32768 символов."), { field: "instructions" });
			return Object.freeze(settings);
		}
		//#endregion
		//#region src/features/compaction/client/panel.jsx
		function CompactionSettings({ settings, busy, onSave }) {
			const [draft, setDraft] = (0, react.useState)(settings);
			const [error, setError] = (0, react.useState)("");
			const [invalid, setInvalid] = (0, react.useState)("");
			const form = (0, react.useRef)(null);
			const confirmed = (0, react.useRef)(JSON.stringify(settings));
			(0, react.useEffect)(() => {
				const next = JSON.stringify(settings);
				if (next !== confirmed.current) {
					confirmed.current = next;
					setDraft(settings);
					setError("");
					setInvalid("");
				}
			}, [settings]);
			const change = (key, value) => {
				setDraft((current) => ({
					...current,
					[key]: value
				}));
				setError("");
				setInvalid("");
			};
			const submit = (event) => {
				event.preventDefault();
				try {
					onSave(validateCompaction(Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, key === "instructions" ? value : Number(value)]))));
				} catch (failure) {
					const field = failure.field ?? "instructions";
					setError(failure.message);
					setInvalid(field);
					form.current?.querySelector(`#mayori-compaction-${field}`)?.focus();
				}
			};
			const normalized = Object.fromEntries(Object.entries(draft).map(([key, value]) => [key, key === "instructions" ? value : Number(value)]));
			const dirty = JSON.stringify(normalized) !== JSON.stringify(settings);
			const number = (key, label, min, max, help) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-compaction-field",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						htmlFor: `mayori-compaction-${key}`,
						children: label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						id: `mayori-compaction-${key}`,
						type: "number",
						min,
						max,
						step: "1",
						required: true,
						value: draft[key],
						"aria-invalid": invalid === key || void 0,
						"aria-describedby": `mayori-compaction-${key}-help${invalid === key ? " mayori-compaction-error" : ""}`,
						onChange: (event) => change(key, event.target.value)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						id: `mayori-compaction-${key}-help`,
						children: help
					})
				]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("form", {
				ref: form,
				className: "mayori-compaction-form",
				onSubmit: submit,
				"aria-labelledby": "mayori-compaction-title",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
					disabled: busy,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", {
							id: "mayori-compaction-title",
							children: tr("Настройки сжатия")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-compaction-numbers",
							children: [number("thresholdPercent", tr("Порог заполнения контекста, %"), 1, 99, tr("Сжатие начинается у этого порога или раньше, если нужен запас для ответа.")), number("retainPercent", tr("Оставлять последние сообщения, %"), 0, 98, tr("Доля доступного контекста, которую сохраняем дословно. Должна быть меньше порога сжатия."))]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-compaction-field",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									htmlFor: "mayori-compaction-instructions",
									children: tr("Инструкция сжатия")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									id: "mayori-compaction-instructions-help",
									children: tr("Укажите, что сохранять в изложении: обещания, отношения, незавершённые задачи, предметы и ограничения персонажей.")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
									id: "mayori-compaction-instructions",
									rows: "12",
									maxLength: 32768,
									required: true,
									value: draft.instructions,
									"aria-invalid": invalid === "instructions" || void 0,
									"aria-describedby": `mayori-compaction-instructions-help${invalid === "instructions" ? " mayori-compaction-error" : ""}`,
									onChange: (event) => change("instructions", event.target.value)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => change("instructions", DEFAULT_COMPACTION_INSTRUCTIONS),
									children: tr("Вернуть игровую инструкцию")
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: tr("Лимиты в токенах") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-compaction-numbers",
							children: [number("maxSummaryTokens", tr("Лимит ответа для изложения"), 1, 65536, tr("Включает размышления, если модель учитывает их в лимите ответа. Незавершённое изложение не заменяет историю.")), number("headroomTokens", tr("Дополнительный запас контекста"), 0, 65536, tr("Резерв сверх места для обычного ответа. Для моделей с небольшим окном уменьшите это значение."))]
						})] }),
						error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							id: "mayori-compaction-error",
							role: "alert",
							children: noticeText(error)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "mayori-compaction-actions",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: !dirty,
								children: tr("Сохранить настройки сжатия")
							}), dirty && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: tr("Есть несохранённые изменения.") })]
						})
					]
				})
			});
		}
		//#endregion
		//#region src/features/plugins/client/panel.jsx
		const pluginEntries = () => [{
			id: "dice",
			title: tr("Кости и проверки"),
			description: tr("Даёт ведущему реальные случайные броски для исходов, где есть риск: попадание в цель, проверка навыка, урон. В чате видны выпавшие грани и итог расчёта."),
			settings: [
				[
					"dice",
					tr("Свободные броски"),
					tr("Броски по формулам вроде 2d6+3, с поддержкой пулов, перебросов и взрывающихся костей.")
				],
				[
					"rules",
					tr("Проверки по правилам"),
					tr("Определяет успех или провал, критический исход, урон и последствия по настроенному профилю правил.")
				],
				[
					"rollHistory",
					tr("Разбор прошлых бросков"),
					tr("Ведущий может объяснить, какие грани, перебросы и модификаторы дали итог сохранённого броска.")
				]
			]
		}, {
			id: "compaction",
			title: tr("Сжатие истории"),
			description: tr("Освобождает место в контексте модели, чтобы продолжать длинный чат. Старые сцены заменяются кратким изложением, последние реплики остаются целиком. Мелкие детали старых сцен могут не попасть в изложение."),
			settings: [[
				"compaction",
				tr("Сжимать историю"),
				""
			]]
		}];
		function MayoriSettings({ preferences }) {
			const entries = pluginEntries();
			const [value, setValue] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const [notice, setNotice] = (0, react.useState)("");
			const [query, setQuery] = (0, react.useState)("");
			const search = query.trim().toLocaleLowerCase(formatLocale());
			const matches = ({ id, title, description, settings }) => [
				id,
				title,
				description,
				...settings.flat()
			].join(" ").toLocaleLowerCase(formatLocale()).includes(search);
			const count = entries.filter(matches).length;
			const mounted = (0, react.useRef)(false);
			const saving = (0, react.useRef)(false);
			const read = async () => {
				try {
					const next = await preferences.read();
					if (mounted.current && !saving.current) {
						setValue(next);
						setError(next.error ?? "");
					}
				} catch (failure) {
					if (mounted.current) setError(failure.message);
				}
			};
			(0, react.useEffect)(() => {
				mounted.current = true;
				read();
				return () => {
					mounted.current = false;
				};
			}, [preferences]);
			(0, react.useEffect)(() => {
				if (!value?.pending) return;
				const timer = setInterval(() => {
					read();
				}, 1e3);
				return () => clearInterval(timer);
			}, [value?.pending, preferences]);
			const save = async (plugins, compaction = value?.compaction) => {
				if (saving.current || !value) return;
				saving.current = true;
				setBusy(true);
				setError("");
				setNotice("");
				try {
					const next = await preferences.update(plugins, value.revision, compaction);
					if (mounted.current) {
						setValue(next);
						setNotice(tr("Настройки сохранены."));
					}
				} catch (failure) {
					if (mounted.current) setError(failure.message || tr("Не удалось сохранить настройки. Попробуйте ещё раз."));
				} finally {
					saving.current = false;
					if (mounted.current) setBusy(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "mayori-settings",
				"aria-labelledby": "mayori-settings-title",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
						id: "mayori-settings-title",
						children: tr("Плагины")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "mayori-plugin-search",
						children: [tr("Поиск по плагинам "), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							type: "search",
							value: query,
							placeholder: tr("Название или описание"),
							onChange: (event) => setQuery(event.target.value)
						})]
					}),
					!value && !error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: tr("Загрузка настроек…")
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						role: "alert",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: noticeText(error) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: () => {
								setError("");
								read();
							},
							children: tr("Обновить настройки")
						})]
					}),
					value && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-plugin-list",
						"aria-busy": busy,
						children: [entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
							className: "mayori-plugin",
							hidden: !matches(entry),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("summary", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-plugin-title",
								children: entry.title
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "mayori-plugin-state",
								children: entry.settings.some(([key]) => value.plugins[key]) ? tr("Включён") : tr("Выключен")
							})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "mayori-plugin-body",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "mayori-plugin-description",
										id: `mayori-plugin-${entry.id}-help`,
										children: entry.description
									}),
									entry.settings.map(([key, title, description]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "mayori-plugin-row",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-plugin-setting-title",
											children: title
										}), description && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "mayori-plugin-setting-description",
											id: `mayori-setting-${key}-help`,
											children: description
										})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "checkbox",
											role: "switch",
											"aria-label": title,
											"aria-describedby": description ? `mayori-setting-${key}-help` : `mayori-plugin-${entry.id}-help`,
											checked: value.plugins[key],
											disabled: busy,
											onChange: (event) => {
												save({
													...value.plugins,
													[key]: event.target.checked
												});
											}
										})]
									}, key)),
									entry.id === "compaction" && value.compaction && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CompactionSettings, {
										settings: value.compaction,
										busy,
										onSave: (options) => save(value.plugins, options)
									})
								]
							})]
						}, entry.id)), count === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "status",
							children: tr("Плагины не найдены. Попробуйте другое название или описание.")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						"aria-live": "polite",
						children: value?.pending ? tr("Настройки сохранены. Они применятся после завершения текущего ответа.") : noticeText(notice)
					})
				]
			});
		}
		const PLUGIN_SETTINGS_STYLE = `
.mayori-settings { color: inherit; }
.mayori-settings h2 { margin: 0 0 12px; font-size: 1.25rem; }
.mayori-settings p { line-height: 1.5; overflow-wrap: anywhere; }
.mayori-plugin-search { display: block; margin-block: 24px; font-size: 14px; }
.mayori-plugin-search input { display: block; box-sizing: border-box; inline-size: 100%; min-inline-size: 0; min-block-size: 42px; margin-block-start: 8px; padding: 10px 12px; font: inherit; font-size: 16px; color: inherit; background: var(--dsw-alias-bg-layer-1, Canvas); border: 1px solid var(--dsw-alias-border-l2, GrayText); border-radius: 8px; }
.mayori-plugin-list { margin: 24px 0; }
.mayori-plugin { border-block-end: 1px solid var(--dsw-alias-border-l2, color-mix(in srgb, currentColor 15%, transparent)); }
.mayori-plugin > summary { padding-block: 16px; cursor: pointer; overflow-wrap: anywhere; }
.mayori-plugin-title { font-weight: 600; margin-inline-start: 6px; }
.mayori-plugin-state { display: block; margin-block-start: 4px; margin-inline-start: 22px; font-size: .85rem; color: var(--dsw-alias-label-secondary, GrayText); }
.mayori-plugin-body { padding-block-end: 16px; }
.mayori-plugin-description { margin-block-start: 0; }
.mayori-plugin-row { display: flex; align-items: center; gap: 20px; padding: 12px 0; cursor: pointer; }
.mayori-plugin-row > span { flex: 1; min-width: 0; }
.mayori-plugin-setting-title { display: block; font-weight: 500; }
.mayori-plugin-setting-description { display: block; margin-block-start: 4px; }
.mayori-plugin-description, .mayori-plugin-setting-description { max-inline-size: 75ch; color: var(--dsw-alias-label-secondary, GrayText); line-height: 1.5; font-size: .9rem; }
.mayori-plugin-row input { appearance: none; color: inherit; width: 44px; height: 26px; flex: 0 0 44px; border: 1px solid color-mix(in srgb, currentColor 45%, transparent); border-radius: 999px; background: color-mix(in srgb, currentColor 12%, transparent); position: relative; cursor: pointer; margin: 0; }
.mayori-plugin-row input::before { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; top: 3px; left: 3px; background: currentColor; }
.mayori-plugin-row input:checked { background: var(--mayori-accent, #497568); border-color: var(--mayori-accent, #497568); color: white; }
.mayori-plugin-row input:checked::before { left: 21px; }
.mayori-plugin-row input:focus-visible { outline: 2px solid currentColor; outline-offset: 4px; }
.mayori-plugin-row input:disabled { opacity: .5; cursor: wait; }
.mayori-compaction-form { margin-block: 24px; }
.mayori-compaction-form fieldset { margin: 0; padding: 0; border: 0; min-inline-size: 0; }
.mayori-compaction-form legend { font-weight: 600; font-size: 1.05rem; }
.mayori-compaction-numbers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.mayori-compaction-field { margin-block: 16px; min-inline-size: 0; }
.mayori-compaction-field label { display: block; margin-block-end: 8px; font-weight: 600; }
.mayori-compaction-field p { font-size: .9rem; color: var(--dsw-alias-label-secondary, GrayText); margin-block: 8px; }
.mayori-compaction-field :is(input, textarea) { box-sizing: border-box; inline-size: 100%; min-inline-size: 0; min-block-size: 42px; padding: 10px 12px; font: inherit; font-size: 16px; line-height: 1.5; color: inherit; background: var(--dsw-alias-bg-layer-1, Canvas); border: 1px solid var(--dsw-alias-border-l2, GrayText); border-radius: 8px; }
.mayori-compaction-field textarea { resize: vertical; }
.mayori-compaction-form :is(input, textarea, button, summary):focus-visible { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: 3px; }
.mayori-compaction-form button { padding: 10px 14px; min-block-size: 42px; border-radius: 8px; border: 1px solid var(--dsw-alias-border-l2, GrayText); background: var(--dsw-alias-bg-layer-2, Canvas); color: inherit; font: inherit; cursor: pointer; }
.mayori-compaction-form button:disabled { opacity: .5; cursor: default; }
.mayori-compaction-form summary { cursor: pointer; padding-block: 12px; }
.mayori-compaction-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; margin-block-start: 20px; }
.mayori-compaction-actions span { font-size: .9rem; }
@media (forced-colors: active) { .mayori-plugin-row input { appearance: auto; } }
@media (max-width: 600px) {
  .mayori-compaction-numbers { grid-template-columns: minmax(0, 1fr); gap: 0; }
}
`;
		//#endregion
		//#region src/features/localization/client/selector.jsx
		/** Shares selection and persistence with the native DSH Language row. */
		function LanguageSelector({ localization }) {
			const id = (0, react.useId)();
			const snapshot = (0, react.useSyncExternalStore)(localization.subscribe, localization.getSnapshot, localization.getSnapshot);
			const [error, setError] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const select = async (value) => {
				setError("");
				setBusy(true);
				try {
					await localization.setLanguage(value);
				} catch {
					setError("Не удалось сохранить язык. Попробуйте ещё раз.");
				} finally {
					setBusy(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "mayori-language-setting",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
						htmlFor: id,
						children: tr("Язык")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Select, {
						id,
						"aria-label": tr("Язык"),
						value: snapshot.active,
						disabled: busy,
						portal: false,
						options: snapshot.locales.filter((language) => [
							"ru",
							"en",
							snapshot.active
						].includes(language.id)).map((language) => ({
							value: language.id,
							label: language.label
						})),
						onChange: (value) => {
							select(value);
						}
					}),
					error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: noticeText(error)
					})
				]
			});
		}
		//#endregion
		//#region src/features/settings/client/modal.jsx
		const settingsTabs = () => [[
			"general",
			tr("Основные"),
			_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutlineMedium
		], [
			"plugins",
			tr("Плагины"),
			_deepseek_ai_dsh_client_ui_primitives.IconPersonalizationOutlineMedium
		]];
		/** Independent settings entry; the native DSH settings consumer keeps its own state. */
		function MayoriSettingsLauncher({ wide, preferences, localization }) {
			const [open, setOpen] = (0, react.useState)(false);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: tr("Настройки Mayori"),
				side: "right",
				delayMs: 500,
				disabled: wide,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mayori-navigation-row mayori-settings-trigger",
					"aria-label": tr("Настройки Mayori"),
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "mayori-navigation-glyph",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPersonalizationOutlineMedium, { size: wide ? 16 : 18 })
					}), wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "mayori-navigation-label",
						children: tr("Настройки Mayori")
					})]
				})
			}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MayoriSettingsModal, {
				preferences,
				localization,
				onClose: () => setOpen(false)
			})] });
		}
		function MayoriSettingsModal({ preferences, localization, onClose }) {
			const tabs = settingsTabs();
			const [active, setActive] = (0, react.useState)("general");
			const [horizontal, setHorizontal] = (0, react.useState)(false);
			const tablist = (0, react.useRef)(null);
			const id = (0, react.useId)();
			(0, react.useEffect)(() => {
				const query = window.matchMedia("(max-width: 600px)");
				const update = () => setHorizontal(query.matches);
				update();
				query.addEventListener("change", update);
				return () => query.removeEventListener("change", update);
			}, []);
			const navigate = (event) => {
				const previous = horizontal ? "ArrowLeft" : "ArrowUp";
				const next = horizontal ? "ArrowRight" : "ArrowDown";
				if (![
					previous,
					next,
					"Home",
					"End"
				].includes(event.key)) return;
				event.preventDefault();
				const index = tabs.findIndex(([key]) => key === active);
				const target = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === next ? 1 : -1) + tabs.length) % tabs.length;
				setActive(tabs[target][0]);
				tablist.current?.querySelectorAll("[role=\"tab\"]")[target]?.focus();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				headless: true,
				title: tr("Настройки Mayori"),
				onClose,
				className: "mayori-settings-modal",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-settings-nav",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: tr("Настройки Mayori") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						ref: tablist,
						className: "mayori-settings-tabs",
						role: "tablist",
						"aria-label": tr("Разделы настроек Mayori"),
						"aria-orientation": horizontal ? "horizontal" : "vertical",
						onKeyDown: navigate,
						children: tabs.map(([key, label, Icon]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							role: "tab",
							id: `${id}-${key}-tab`,
							"aria-selected": active === key,
							"aria-controls": `${id}-${key}-panel`,
							tabIndex: active === key ? 0 : -1,
							"data-modal-autofocus": active === key ? "" : void 0,
							onClick: () => setActive(key),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Icon, { size: 16 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label })]
						}, key))
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "mayori-settings-content",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "mayori-settings-header",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
							label: tr("Закрыть настройки Mayori"),
							onClick: onClose,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
						})
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "mayori-settings-options",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							role: "tabpanel",
							id: `${id}-general-panel`,
							"aria-labelledby": `${id}-general-tab`,
							hidden: active !== "general",
							tabIndex: 0,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LanguageSelector, { localization })
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							role: "tabpanel",
							id: `${id}-plugins-panel`,
							"aria-labelledby": `${id}-plugins-tab`,
							hidden: active !== "plugins",
							tabIndex: 0,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MayoriSettings, { preferences })
						})]
					})]
				})]
			});
		}
		const SETTINGS_MODAL_STYLE = `
.mayori-language-setting { display: grid; grid-template-columns: minmax(80px, 1fr) minmax(140px, 240px); align-items: center; gap: 16px; padding-block: 16px; }
.mayori-language-setting [role="alert"] { grid-column: 1 / -1; }
.mayori-settings-modal { inline-size: min(1200px, 100%); block-size: 800px; max-block-size: 100%; flex-direction: row; gap: 0; padding: 0; color: var(--dsw-alias-label-primary, CanvasText); }
.mayori-settings-nav { flex: 0 0 188px; padding: 22px 12px 0; box-sizing: border-box; }
.mayori-settings-nav h1 { margin: 0 0 18px; padding-inline: 12px; font-size: 16px; line-height: 24px; font-weight: 500; }
.mayori-settings-tabs { display: flex; flex-direction: column; gap: 4px; }
.mayori-settings-tabs button { display: flex; align-items: center; gap: 8px; min-block-size: 40px; padding: 9px 12px; border: 0; border-radius: var(--dsw-radius-md, 12px); background: transparent; color: inherit; font: inherit; font-size: 14px; text-align: start; cursor: pointer; }
.mayori-settings-tabs button:hover { background: var(--dsw-specific-sidebar-nav-item-hover, color-mix(in srgb, currentColor 6%, transparent)); }
.mayori-settings-tabs button[aria-selected="true"] { background: var(--dsw-specific-sidebar-nav-item-active, color-mix(in srgb, currentColor 10%, transparent)); }
.mayori-settings-tabs svg { flex: none; }
.mayori-settings-content { flex: 1; min-inline-size: 0; min-block-size: 0; display: flex; flex-direction: column; }
.mayori-settings-header { flex: none; display: flex; justify-content: flex-end; padding: 16px 14px 8px; }
.mayori-settings-header button { display: inline-flex; align-items: center; justify-content: center; inline-size: 32px; block-size: 32px; padding: 0; border: 0; border-radius: var(--dsw-radius-sm, 8px); background: transparent; color: inherit; cursor: pointer; }
.mayori-settings-header button:hover { background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, currentColor 6%, transparent)); }
.mayori-settings-options { flex: 1; min-block-size: 0; padding: 0 24px 24px; overflow-y: auto; overscroll-behavior: contain; }
.mayori-settings-modal :is(button, input, summary, [role="tabpanel"]):focus-visible { outline: 2px solid var(--dsw-alias-label-primary, CanvasText); outline-offset: 3px; }
.mayori-settings-trigger { inline-size: 100%; }
@media (max-width: 600px) {
  .mayori-settings-modal { flex-direction: column; }
  .mayori-settings-nav { flex: none; padding: 16px 12px 0; }
  .mayori-settings-nav h1 { padding-inline-end: 36px; margin-block-end: 12px; }
  .mayori-settings-tabs { flex-direction: row; }
  .mayori-settings-tabs button { flex: 1; }
  .mayori-settings-header { padding-block-start: 4px; }
  .mayori-settings-options { padding-inline: 16px; }
}
`;
		//#endregion
		//#region src/client/infrastructure/session-providers.js
		/** Keep subscribed providers stable while evicting inactive session state. */
		var SessionProviders = class {
			constructor(factory, limit = 16) {
				this.factory = factory;
				this.limit = limit;
				this.entries = /* @__PURE__ */ new Map();
			}
			get(id) {
				let entry = this.entries.get(id);
				if (!entry) {
					const provider = this.factory(id);
					entry = {
						provider,
						users: 0
					};
					const subscribe = provider.subscribe;
					provider.subscribe = (listener) => {
						entry.users++;
						const release = subscribe(listener);
						let live = true;
						return () => {
							if (!live) return;
							live = false;
							release();
							entry.users--;
							provider.release?.();
							this.trim();
						};
					};
				}
				this.entries.delete(id);
				this.entries.set(id, entry);
				this.trim(id);
				return entry.provider;
			}
			trim(protectedId) {
				for (const [id, entry] of this.entries) {
					if (this.entries.size <= this.limit) break;
					if (entry.users || id === protectedId) continue;
					entry.provider.dispose?.();
					this.entries.delete(id);
				}
			}
			dispose() {
				for (const entry of this.entries.values()) entry.provider.dispose?.();
				this.entries.clear();
			}
		};
		//#endregion
		//#region src/features/presets/client/command.js
		/** Slash-menu consumer of the preset catalog and logged session selection. */
		function presetCommand({ presets, presetFor, icon }) {
			return {
				name: "preset",
				label: () => tr("Сменить пресет"),
				description: () => tr("Выбрать инструкции для этого чата"),
				icon,
				available: (session) => Boolean(session.sessionId),
				ui: {
					kind: "popupSelect",
					searchLabels: () => ({
						placeholder: tr("Поиск пресета…"),
						empty: tr("Пресетов пока нет."),
						noResults: tr("Пресеты не найдены.")
					}),
					async options(session, signal) {
						signal.throwIfAborted();
						const selection = presetFor(session.sessionId);
						await Promise.all([presets.refresh(), selection.refresh()]);
						signal.throwIfAborted();
						const catalog = presets.getSnapshot();
						const current = selection.getSnapshot();
						if (catalog.status !== "ready" || current.status !== "ready") throw new Error(catalog.error || current.error || tr("Не удалось загрузить пресеты чата."));
						return [{
							id: "__none__",
							label: tr("Без пресета"),
							active: current.preset === null
						}, ...catalog.presets.map((preset) => ({
							id: preset.id,
							label: preset.name,
							active: current.preset?.id === preset.id
						}))];
					},
					async onSelect(option, session) {
						await presetFor(session.sessionId).select(option.id === "__none__" ? null : option.id);
					}
				}
			};
		}
		//#endregion
		//#region src/features/personas/client/command.js
		/** Slash-menu consumer of the persona catalog and Character Chat service. */
		function personaCommand({ personas, chatFor, icon }) {
			return {
				name: "persona",
				label: () => tr("Сменить персону"),
				description: () => tr("Выбрать, за кого играть в этом чате"),
				icon,
				available: (session) => Boolean(session.sessionId),
				ui: {
					kind: "popupSelect",
					searchLabels: () => ({
						placeholder: tr("Поиск персоны…"),
						empty: tr("Персон пока нет."),
						noResults: tr("Персоны не найдены.")
					}),
					async options(session, signal) {
						signal.throwIfAborted();
						const chat = chatFor(session.sessionId);
						await Promise.all([personas.refresh(), chat.refresh()]);
						signal.throwIfAborted();
						const catalog = personas.getSnapshot();
						const current = chat.getSnapshot();
						if (catalog.status !== "ready" || current.status !== "ready") throw new Error(catalog.error || current.error || tr("Не удалось загрузить персоны чата."));
						if (!current.value) throw new Error(tr("Выберите чат персонажа из галереи."));
						const personaId = current.value.persona?.id;
						return [{
							id: "__none__",
							label: tr("Без персоны"),
							detail: tr("Имя в чате: Игрок"),
							active: !personaId
						}, ...catalog.personas.map((persona) => ({
							id: persona.id,
							label: persona.name,
							...persona.title ? { detail: persona.title } : {},
							active: personaId === persona.id
						}))];
					},
					async onSelect(option, session) {
						await chatFor(session.sessionId).setPersona(option.id === "__none__" ? null : option.id);
					}
				}
			};
		}
		//#endregion
		//#region src/features/character-session/client/command.js
		/** Start a fresh character chat through the existing gallery consumer. */
		function newChatCommand({ chatFor, startCharacter, notify, icon }) {
			const pending = /* @__PURE__ */ new Set();
			return {
				name: "new",
				label: () => tr("Новый чат"),
				description: () => tr("Начать новую историю с этим персонажем"),
				icon,
				available: (session) => Boolean(session.sessionId) && !pending.has(session.sessionId),
				ui: {
					kind: "action",
					async run(session) {
						const sessionId = session.sessionId;
						if (pending.has(sessionId)) return;
						pending.add(sessionId);
						try {
							const chat = chatFor(sessionId);
							await chat.refresh();
							const snapshot = chat.getSnapshot();
							if (snapshot.status !== "ready") throw new Error(snapshot.error || tr("Не удалось прочитать текущий чат."));
							if (!snapshot.value?.character) throw new Error(tr("Откройте чат персонажа из галереи."));
							await startCharacter(snapshot.value.character, sessionId);
						} catch (error) {
							notify(sessionId, error instanceof Error ? error.message : String(error));
						} finally {
							pending.delete(sessionId);
						}
					}
				}
			};
		}
		//#endregion
		//#region src/client/shell/composer.js
		const shortenHint = (text) => text.replace(/ or run (?:a )?task\b/, "").replace(/ or sessions\b/, "");
		/** Keep the native editor and its state-specific guidance. */
		function MayoriComposer({ stock: Stock, stockChildren, childPrefix, ...props }) {
			const mapped = remapChildProps(props, stockChildren, childPrefix);
			mapped.t = (key, ...args) => {
				const text = props.t(key, ...args);
				return key === "placeholder.default" || key === "placeholder.hero" ? shortenHint(text) : text;
			};
			if (!props.disabled && !props.blocked && props.sessionId != null && props.variant === "hero" && props.placeholder === props.t("placeholder.hero")) mapped.placeholder = shortenHint(props.placeholder);
			return (0, react.createElement)(Stock, mapped);
		}
		/** Shadow only the requested controls; Cordis restores the stock entries on unload. */
		function registerComposerPresentation(ctx) {
			ctx.slots.inject("conversation.chat.assistant-actions", () => ctx.slots.register({
				name: "conversation.chat.assistant-actions",
				id: "feedback",
				priority: -100
			}, () => null));
			ctx.slots.inject("conversation.input.permission", () => ctx.slots.register({
				name: "conversation.input.permission",
				priority: -100
			}, () => null));
			ctx.slots.inject("conversation.composer.bar", () => ctx.effect(() => {
				let installed = false;
				const disposers = [];
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries("conversation.composer.bar")[0];
					if (!stock) return;
					installed = true;
					const prefix = "mayori.composer";
					disposers.push(ctx.slots.register({
						name: "conversation.composer.bar",
						priority: -100,
						store: stock.store,
						locale: stock.locale,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							stock: stock.component,
							stockChildren: stock.children,
							childPrefix: prefix
						})
					}, MayoriComposer));
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
				};
				const unsubscribe = ctx.slots.subscribe("conversation.composer.bar", register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: composer presentation"));
		}
		//#endregion
		//#region src/client/plugin.js
		/** Mayori browser plugin: custom RPG sidebar plus the Character Library UI. */
		const inject = [
			"slots",
			"sessions",
			"workspaces",
			"uiWorkspace",
			"layout",
			"commandUi",
			"locale"
		];
		/** Register reversible browser contributions through Cordis. */
		function apply(ctx) {
			const localization = registerLocalization(ctx);
			registerComposerPresentation(ctx);
			const preferences = new PluginSettingsClient();
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "mayori-settings",
				order: 35,
				inject: () => ({
					preferences,
					localization
				})
			}, MayoriSettingsLauncher));
			const library = new RemoteCharacterLibraryProvider();
			ctx.effect(() => () => library.dispose(), "mayori: catalog requests");
			ctx.provide("mayoriCharacters", library);
			const personas = new RemotePersonaProvider();
			ctx.provide("mayoriPersonas", personas);
			const presets = new RemoteRoleplayPresetProvider();
			ctx.provide("mayoriPresets", presets);
			const sessionPresets = new SessionProviders((id) => new RemoteSessionPresetProvider(id));
			const presetFor = (sessionId) => sessionPresets.get(sessionId);
			ctx.provide("mayoriSessionPresets", { forSession: presetFor });
			const chats = new SessionProviders((id) => new RemoteCharacterChatProvider(id));
			const chatFor = (sessionId) => chats.get(sessionId);
			const commands = [
				presetCommand({
					presets,
					presetFor,
					icon: PresetIcon
				}),
				personaCommand({
					personas,
					chatFor,
					icon: PersonaIcon
				}),
				newChatCommand({
					chatFor,
					icon: CharacterGalleryIcon,
					startCharacter: (card, sourceSessionId) => startCharacterSession({
						sessions: ctx.sessions,
						workspaces: ctx.workspaces,
						uiWorkspace: ctx.uiWorkspace,
						library,
						sourceSessionId
					}, card),
					notify: (sessionId, text) => {
						const scope = ctx.sessions.scope(sessionId);
						scope?.get("conversation")?.input.for(scope).notify("error", text);
					}
				})
			];
			for (const command of commands) ctx.effect(() => {
				const unregister = ctx.commandUi.register(command);
				return () => {
					ctx.commandUi.dismiss(command.name);
					unregister();
				};
			}, "mayori: chat command");
			const contexts = new SessionProviders((id) => new RemoteTrajectoryContextProvider(id), 4);
			const contextFor = (sessionId) => contexts.get(sessionId);
			ctx.provide("mayoriTrajectoryContext", { forSession: contextFor });
			const revisions = new SessionProviders((sessionId) => new RemoteMessageRevisionProvider(sessionId, async (id) => {
				try {
					await ctx.sessions.refresh();
				} finally {
					ctx.uiWorkspace.openSession(id);
				}
			}, (seq) => ctx.sessions.using(sessionId, { source: "mayoriVariants" }, async (reference) => {
				await (await reference.ready).session.loadThrough(seq);
			})));
			const revisionFor = (sessionId) => revisions.get(sessionId);
			ctx.effect(() => () => {
				sessionPresets.dispose();
				chats.dispose();
				contexts.dispose();
				revisions.dispose();
			}, "mayori: session provider caches");
			ctx.provide("mayoriMessageRevisions", { forSession: revisionFor });
			ctx.effect(() => {
				const style = document.createElement("style");
				style.dataset.plugin = "dsh-mayori";
				style.dataset.mayori = "client";
				style.textContent = BRAND_STYLE + SETTINGS_MODAL_STYLE + PLUGIN_SETTINGS_STYLE;
				document.head.appendChild(style);
				return () => {
					style.remove();
				};
			}, "mayori: client styles");
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "rollDice"
			}, DiceToolCard));
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "resolveCheck"
			}, CheckToolCard));
			ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.register({
				name: "sidebar.brand.mark",
				priority: -100
			}, MayoriMark));
			ctx.slots.inject("sidebar.brand.name", () => ctx.slots.register({
				name: "sidebar.brand.name",
				priority: -100
			}, MayoriBrandName));
			ctx.slots.inject("conversation.hero.brand.mark", () => ctx.slots.register({
				name: "conversation.hero.brand.mark",
				priority: -100
			}, MayoriMark));
			ctx.slots.inject("sidebar.workspaces", () => ctx.slots.register({
				name: "sidebar.workspaces",
				priority: -100
			}, MayoriSidebar));
			for (const [slotName, Component] of [["sidebar", MayoriNavigationSidebar], ["shell.leading", MayoriLeadingControls]]) ctx.slots.inject(slotName, () => ctx.effect(() => {
				let installed = false;
				const disposers = [];
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries(slotName)[0];
					if (!stock) return;
					installed = true;
					const prefix = `mayori.navigation.${slotName}`;
					disposers.push(ctx.slots.register({
						name: slotName,
						priority: -100,
						store: stock.store,
						locale: stock.locale,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							stockChildren: stock.children,
							childPrefix: prefix,
							openHome: () => ctx.layout.selectPanel("mayori-home")
						})
					}, Component));
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
				};
				const unsubscribe = ctx.slots.subscribe(slotName, register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: home navigation"));
			const history = new SessionChatHistoryProvider(ctx.sessions, ctx.uiWorkspace, ctx.workspaces);
			ctx.effect(() => () => history.dispose(), "mayori: history cache");
			ctx.provide("mayoriHistory", history);
			const homeProps = () => ({
				history,
				library,
				personas,
				selectPanel: (id) => ctx.layout.selectPanel(id),
				startCharacter: (card, greetingIndex) => startCharacterSession({
					sessions: ctx.sessions,
					workspaces: ctx.workspaces,
					uiWorkspace: ctx.uiWorkspace,
					library
				}, card, greetingIndex)
			});
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-home",
				inject: homeProps
			}, HomePanel));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-home",
				order: -30,
				label: () => tr("Главная")
			}, HomeIcon));
			ctx.slots.inject("main.conversation", () => ctx.effect(() => {
				let installed = false;
				const disposers = [];
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries("main.conversation")[0];
					if (!stock) return;
					installed = true;
					const prefix = "mayori.home.conversation";
					disposers.push(ctx.slots.register({
						name: "main.conversation",
						priority: -100,
						store: stock.store,
						locale: stock.locale,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							...homeProps(),
							stock: stock.component,
							stockChildren: stock.children,
							childPrefix: prefix
						})
					}, HomeConversation));
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
				};
				const unsubscribe = ctx.slots.subscribe("main.conversation", register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: home conversation"));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-characters",
				inject: () => ({
					library,
					personas,
					startCharacter: (card, greetingIndex) => startCharacterSession({
						sessions: ctx.sessions,
						workspaces: ctx.workspaces,
						uiWorkspace: ctx.uiWorkspace,
						library
					}, card, greetingIndex)
				})
			}, CharacterGalleryPanel));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-history",
				inject: () => ({ history })
			}, ChatHistoryPanel));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-personas",
				inject: () => ({
					personas,
					sessions: ctx.sessions,
					chatFor
				})
			}, PersonaPanel));
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: "mayori-presets",
				inject: () => ({
					presets,
					sessions: ctx.sessions,
					presetFor
				})
			}, PresetPanel));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-characters",
				order: -20,
				label: () => tr("Персонажи")
			}, CharacterGalleryIcon));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-history",
				order: -10,
				label: () => tr("История чатов")
			}, ChatHistoryIcon));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-personas",
				order: -15,
				label: () => tr("Персоны")
			}, PersonaIcon));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: "mayori-presets",
				order: -12,
				label: () => tr("Пресеты")
			}, PresetIcon));
			ctx.slots.inject("conversation.chat.node", () => ctx.effect(() => {
				const installed = /* @__PURE__ */ new Set();
				const disposers = [];
				const register = () => {
					for (const [key, component] of [
						["assistant-step", CharacterMessage],
						["user", CharacterMessage],
						["steering", CharacterMessage],
						["turn-tail", GreetingTurnTail],
						["context", RevisionContextMessage]
					]) {
						if (installed.has(key)) continue;
						const stock = ctx.slots.entries("conversation.chat.node").find((entry) => entry.options.key === key);
						if (!stock) continue;
						installed.add(key);
						const prefix = `mayori.greeting.${key}`;
						disposers.push(ctx.slots.register({
							name: "conversation.chat.node",
							key,
							priority: -100,
							locale: stock.locale,
							children: mirroredChildren(stock.children, prefix),
							inject: (...args) => ({
								...stock.inject?.(...args),
								stock: stock.component,
								stockChildren: stock.children,
								childPrefix: prefix,
								chatFor,
								revisionFor
							})
						}, component));
						for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
					}
				};
				const unsubscribe = ctx.slots.subscribe("conversation.chat.node", register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: greeting renderer"));
			ctx.slots.inject("conversation.chat.flow", () => ctx.effect(() => {
				let dispose;
				let installed = false;
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries("conversation.chat.flow")[0];
					if (!stock) return;
					installed = true;
					const prefix = "mayori.revisions.flow";
					const disposers = [ctx.slots.register({
						...stock.options,
						name: "conversation.chat.flow",
						priority: -100,
						locale: stock.locale,
						store: stock.store,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							stock: stock.component,
							stockChildren: stock.children,
							childPrefix: prefix,
							revisionFor,
							IconButton
						})
					}, RevisionChatFlow)];
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
					dispose = () => {
						for (const stop of disposers) stop();
					};
				};
				const unsubscribe = ctx.slots.subscribe("conversation.chat.flow", register);
				register();
				return () => {
					unsubscribe();
					dispose?.();
				};
			}, "mayori: revision chat flow"));
			ctx.slots.inject("conversation.view", () => ctx.effect(() => {
				let installed = false;
				const disposers = [];
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries("conversation.view").find((entry) => entry.options.id === "trajectory");
					if (!stock) return;
					installed = true;
					const prefix = "mayori.trajectory";
					disposers.push(ctx.slots.register({
						...stock.options,
						name: "conversation.view",
						id: "trajectory",
						priority: -100,
						locale: stock.locale,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							stock: stock.component,
							stockChildren: stock.children,
							childPrefix: prefix,
							contextFor
						})
					}, ContextTrajectory));
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
				};
				const unsubscribe = ctx.slots.subscribe("conversation.view", register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: trajectory context"));
			ctx.slots.inject("conversation.session.header", () => ctx.effect(() => {
				let installed = false;
				const disposers = [];
				const register = () => {
					if (installed) return;
					const stock = ctx.slots.entries("conversation.session.header")[0];
					if (!stock) return;
					installed = true;
					const prefix = "mayori.trajectory.header";
					disposers.push(ctx.slots.register({
						name: "conversation.session.header",
						priority: -100,
						store: stock.store,
						locale: stock.locale,
						children: mirroredChildren(stock.children, prefix),
						inject: (...args) => ({
							...stock.inject?.(...args),
							stock: stock.component,
							stockChildren: stock.children,
							childPrefix: prefix,
							revisionNavigation: RevisionBranchNavigation,
							revisionNavigationProps: {
								sessions: { list: history },
								open: history.open
							}
						})
					}, TrajectorySessionHeader));
					for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`));
				};
				const unsubscribe = ctx.slots.subscribe("conversation.session.header", register);
				register();
				return () => {
					unsubscribe();
					for (const dispose of disposers) dispose();
				};
			}, "mayori: trajectory header"));
		}
		//#endregion
		exports.BRAND_STYLE = BRAND_STYLE;
		exports.CheckToolCard = CheckToolCard;
		exports.DiceToolCard = DiceToolCard;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map