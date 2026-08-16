# Разработка

## Требования

- Node.js `^22.19.0` или `>=24.0.0`;
- pnpm 11;
- локальный или установленный DeepSeek Harness для интеграционного smoke test.

## Быстрый цикл

```sh
pnpm install
pnpm run check
```

`check` проверяет синтаксис entry point и запускает unit tests через встроенный `node:test`. Исходник поставляется как ESM JavaScript, поэтому GitHub-установка не требует build script.

## Проверка в локальном DSH

Из каталога рядом с Mayori:

```sh
dsh plugin --profile mayori-dev add ./Mayori
dsh --profile mayori-dev --dump-config
dsh --profile mayori-dev
```

Для source checkout DeepSeek Harness используйте его launcher:

```sh
pnpm dsh plugin --profile mayori-dev add ../Mayori
pnpm dsh --profile mayori-dev --dump-config
```

В dump должны присутствовать слой `dsh-mayori`, persona Mayori и строка `mayori-director`.

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
