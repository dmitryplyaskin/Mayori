# Разработка

## Требования

- Node.js `^22.19.0` или `>=24.0.0`;
- pnpm 11;
- DeepSeek Harness `0.2.1-alpha.1` для интеграционного smoke test; полный форк не нужен.

## Быстрый цикл

```sh
pnpm install
pnpm run check
```

`check` проверяет синтаксис entry point и запускает unit tests через встроенный `node:test`. Исходник поставляется как ESM JavaScript, поэтому GitHub-установка не требует build script.

Browser half собирается отдельно в формат lazy client module, который ожидает Web DSH:

```sh
pnpm run bundle
```

Команда создаёт `lib/client.js` и source map. Оба artifact входят в Git, чтобы установка из GitHub не выполняла код сборки на машине пользователя.

## Проверка в локальном DSH

Для разработки используйте отдельный Harness home, чтобы профиль, настройки,
credentials и сессии Mayori не затрагивали обычный `~/.dsh`. В PowerShell:

```powershell
$env:DSH_HOME = 'C:\pet_projects\Mayori\.dsh-dev'
```

В source checkout DeepSeek Harness сначала установите Mayori. Эта команда
создаст отсутствующий профиль и добавит bundle:

```powershell
pnpm dsh plugin --profile mayori add C:\pet_projects\Mayori
```

Новый профиль с произвольным именем DSH инициализирует только с
`@deepseek-ai/dsh-base`. Поэтому после первой установки добавьте встроенный Web
bundle перед Mayori в `$DSH_HOME/profiles/mayori/package.json`, сохранив
созданные поля `dependencies`:

```json
{
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app",
        "dsh-mayori"
      ]
    }
  }
}
```

После этого проверьте и запустите именованный профиль штатной формой CLI:

```powershell
pnpm dsh --profile mayori --dump-config
pnpm dsh --profile mayori
```

Для проверки рядом с обычным `web` задайте профилю Mayori отдельный origin в
`$DSH_HOME/profiles/mayori/cordis.patch.yml`:

```yaml
- id: credentials
  config:
    path: !!js dshHomePath('profiles/mayori/.credentials.yaml')
- id: webserver
  config:
    host: !!js ctx.webStartup.host ?? '127.0.0.1'
    port: 3081
```

Отдельный путь credentials не даёт настройкам Mayori перезаписать общее
`$DSH_HOME/.credentials.yaml`.

В dump должны присутствовать слой `dsh-mayori`, `system-prompt.config.personaPrefix` с ролью Mayori, preset `mayori` с `plugins: []`, выбранный default `mayori`, строка `mayori-director` и пути `charactersPath` / `campaignsPath`. После запуска Web в boot graph должен появиться browser module `dsh-mayori`, штатные brand slots должны показывать `Mayori Engine`, а sidebar region — галерею. Collapse, New Session и Settings остаются штатными. На чистом профиле импортируйте карточку, нажмите `Играть` и проверьте автоматическое создание каталога и Workspace, затем открытие именованного чата. Удалите карточку после выбора, перезапустите Host и продолжите чат: snapshot должен восстановиться из `campaignsPath/selections`, а фактически переданный модели контекст — присутствовать в штатном session log.

Для проверки опубликованного пакета вместо source launcher используйте `pnpm dlx @deepseek-ai/dsh@0.2.1-alpha.1`. Все проверки делайте с отдельным `DSH_HOME`; реальный профиль игрока автоматически не переустанавливается.

### Keyless smoke

В изолированном профиле добавьте тестовый overlay (не в профиль игрока):

```yaml
- id: session-telemetry-otel
  disabled: true
- insert:
    - id: mayori-smoke-probe
      name: C:/pet_projects/Mayori/scripts/dsh-smoke-probe.js
```

После установки checkout и сборки browser half запустите `pnpm dlx @deepseek-ai/dsh@0.2.1-alpha.1 --patch <absolute-smoke-overlay.yml> --profile mayori --no-open --port 3090`. Launcher-параметры, включая `--patch`, должны находиться перед app-параметрами `--no-open` / `--port`.

`node scripts/smoke-dsh.js http://127.0.0.1:3090` импортирует карточку, создаёт RPG-сессию, сохраняет выбор, удаляет исходную карточку и проводит ход через детерминированный тестовый LLM provider. Проверяются logged context, ответ и отсутствие coding tools. Скрипт печатает sessionId; после остановки и повторного запуска Host выполните `node scripts/smoke-dsh.js http://127.0.0.1:3090 <sessionId>` для проверки продолжения. Probe не входит в опубликованный пакет, использует локальный тестовый origin и не обращается к реальному LLM API.

Карточка smoke test содержит `{{char}}` в разных регистрах и модельных полях, `{{user}}`, неизвестные и вложенные макросы, команды состояния/случайности, ошибочные группы и совпадения с переменными DSH (`cwd`, `model`). Скрипт проверяет подстановку имени и буквальное сохранение остальных выражений как в запросе модели, так и в session log, включая продолжение после перезапуска. Unit tests используют renderer опубликованного `@deepseek-ai/dsh-system-prompt`, а не копию его логики, и проверяют teardown переменной вместе с контекстом.

Launcher поддерживает произвольные профили через `--profile`. Алиас `dsh web`
встроен в DSH отдельно; установка bundle сама по себе не добавляет формы
`dsh mayori` или `npx @deepseek-ai/dsh mayori`.

Не устанавливайте Mayori через `--profile web`: её browser half содержит
root-scoped branding и gallery contributions, поэтому такая установка намеренно
изменит обычный Web UI. Для очистки ошибочной установки используйте
`pnpm dsh plugin --profile web remove dsh-mayori`.

## Добавление функции

1. Определите владельца данных и события, которые переживают перезапуск.
2. Выберите существующую точку расширения DSH.
3. Для новой заменяемой возможности спроектируйте Service Definition, Provider и Consumer вместе.
4. Зарегистрируйте listeners, prompt sections и tools через `ctx` для автоматического teardown.
5. Добавьте unit test, собранный keyless сценарий и документацию пользовательского поведения.
6. Если новые данные видит модель, обеспечьте их реконструкцию из session log.

## Конфигурация

Deployment-варианты объявляются в экспортируемой Schemastery `Config`. Некорректная самодостаточная конфигурация должна останавливать загрузку с понятной ошибкой. Не прячьте изменяемые настройки в константах внутри `apply()`.

## Публикация

Перед commit выполните `pnpm run check` и smoke test `--dump-config`. При установке из GitHub рекомендуется закреплять полный commit SHA. Если проект перейдёт на TypeScript build, пакет должен либо публиковать готовый `lib/`, либо иметь self-contained `prepare` и явно документировать pnpm `allowBuilds`.
