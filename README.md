# Mayori

Mayori превращает [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) из coding harness в основу для продолжительных ролевых игр. Первый релиз — устанавливаемый DSH bundle: он заменяет deployment persona и добавляет конфигурируемые правила ведущего через штатный реестр system prompt.

## Что уже работает

- роль ведущего вместо coding persona;
- собственная RPG-боковая панель с логотипом `Mayori Engine`, без списка coding-проектов и сессий;
- импорт Character Card v2/v3 из JSON и PNG (`chara` / `ccv3`) и полноэкранная галерея персонажей;
- защита агентности персонажа игрока;
- последовательность мира, хронологии и мотиваций NPC;
- разделение внутриигрового и внеигрового разговора;
- файлы кампании как будущий источник канонического состояния;
- честное отношение к случайности: модель не изображает бросок без реального rules/dice provider.

## Установка

Mayori устанавливается в отдельный именованный профиль. Не добавляйте bundle в
штатный профиль `web`: browser plugin регистрирует branding и галерею на уровне
всего профиля.

Сначала создайте профиль и установите Mayori:

```sh
dsh plugin --profile mayori add github:dmitryplyaskin/Mayori
```

Произвольный новый профиль DSH содержит только `@deepseek-ai/dsh-base`.
Добавьте встроенный Web bundle перед Mayori в
`$DSH_HOME/profiles/mayori/package.json`:

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

Чтобы интерфейс Mayori работал на отдельном от обычного Web origin, назначьте ему порт в
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

Так ключи, сохранённые из интерфейса Mayori, также не изменяют общее
`$DSH_HOME/.credentials.yaml`.

Проверьте композицию и запускайте именно именованный профиль:

```sh
dsh --profile mayori --dump-config
dsh --profile mayori
```

Обычный `dsh web` продолжит использовать чистый профиль `web` без Mayori.

Для воспроизводимой установки закрепляйте commit:

```sh
dsh plugin --profile mayori add github:dmitryplyaskin/Mayori#<commit-sha>
```

Если Mayori раньше была установлена в основной профиль, удалите её штатной
командой: `dsh plugin --profile web remove dsh-mayori`.

Пакет поставляет готовые Host и browser JavaScript artifacts и не запускает `prepare` при установке из GitHub.

## Настройка

Bundle добавляет строку `mayori-director`. Её можно заменить в `$DSH_HOME/profiles/mayori/cordis.patch.yml`:

```yaml
- id: mayori-director
  config:
    narratorName: Хранитель
    languagePolicy: Всегда отвечай по-русски.
    campaignStyle: Медленный мистический хоррор с упором на расследование.
    additionalInstructions: Не предлагай больше трёх явных зацепок в одной сцене.
```

Профильный patch применяется после bundle, поэтому пользовательские значения побеждают. Пропущенные поля получают defaults из схемы плагина.

## Галерея персонажей

Пункт `Персонажи` находится в основной навигации боковой панели и доступен без активной сессии. Он открывает полноэкранную галерею: слева находятся импорт, поиск, сортировка и фильтры, справа — адаптивный грид карточек. На карточке доступны `Играть` (пока заглушка) и `Изменить`; вторая кнопка открывает информационную модалку. Галерея принимает несколько файлов за один раз:

- Character Card v2/v3 в `.json`;
- PNG-карточки v2 с блоком `chara`;
- PNG-карточки v3 с блоком `ccv3`; если в PNG есть оба блока, используется v3.

Файл ограничен 16 МБ. Host сохраняет карточки в `$DSH_HOME/mayori/characters`, поэтому каталог не зависит от браузера, порта или Web origin. JSON карточки и исходные PNG лежат в файловом хранилище; повторный импорт того же содержимого обновляет существующую запись, неизвестные поля сохраняются без изменений. Путь можно заменить полем `charactersPath` в конфигурации `mayori-director`. Сейчас галерея не импортирует `.charx` и не добавляет содержимое карточки в контекст модели или состояние кампании.

## Разработка

```sh
pnpm install
pnpm run bundle
pnpm test
pnpm run check
```

Дальнейшие решения описаны в [архитектуре](docs/architecture.md), локальный цикл разработки — в [development guide](docs/development.md), последовательность вертикальных срезов — в [roadmap](docs/roadmap.md).

## Статус

Mayori находится на ранней стадии. Текущий bundle задаёт модельный опыт и заменяет Web sidebar на расширяемую RPG-навигацию, но ещё не реализует отдельные сервисы состояния кампании, правил, бросков и полноценного RPG-интерфейса.

## Лицензия

[MIT](LICENSE)
