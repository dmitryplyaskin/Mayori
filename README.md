# Mayori

Mayori превращает [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) из coding harness в основу для продолжительных ролевых игр. Первый релиз — устанавливаемый DSH bundle: он заменяет deployment persona и добавляет конфигурируемые правила ведущего через штатный реестр system prompt.

## Что уже работает

- роль ведущего вместо coding persona;
- защита агентности персонажа игрока;
- последовательность мира, хронологии и мотиваций NPC;
- разделение внутриигрового и внеигрового разговора;
- файлы кампании как будущий источник канонического состояния;
- честное отношение к случайности: модель не изображает бросок без реального rules/dice provider.

## Установка

Нужен установленный DSH и существующий профиль, например `web`:

```sh
dsh plugin --profile web add github:dmitryplyaskin/Mayori
dsh --profile web --dump-config
dsh --profile web
```

Для воспроизводимой установки закрепляйте commit:

```sh
dsh plugin --profile web add github:dmitryplyaskin/Mayori#<commit-sha>
```

Пакет поставляет готовый JavaScript и не запускает `prepare` при установке из GitHub.

## Настройка

Bundle добавляет строку `mayori-director`. Её можно заменить в `$DSH_HOME/profiles/web/cordis.patch.yml`:

```yaml
- id: mayori-director
  config:
    narratorName: Хранитель
    languagePolicy: Всегда отвечай по-русски.
    campaignStyle: Медленный мистический хоррор с упором на расследование.
    additionalInstructions: Не предлагай больше трёх явных зацепок в одной сцене.
```

Профильный patch применяется после bundle, поэтому пользовательские значения побеждают. Пропущенные поля получают defaults из схемы плагина.

## Разработка

```sh
pnpm install
pnpm test
pnpm run check
```

Дальнейшие решения описаны в [архитектуре](docs/architecture.md), локальный цикл разработки — в [development guide](docs/development.md), последовательность вертикальных срезов — в [roadmap](docs/roadmap.md).

## Статус

Mayori находится на ранней стадии. Текущий bundle задаёт модельный опыт, но ещё не реализует отдельные сервисы состояния кампании, правил, бросков и RPG-интерфейса.

## Лицензия

[MIT](LICENSE)
