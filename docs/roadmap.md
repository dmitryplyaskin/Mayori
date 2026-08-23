# Roadmap

Roadmap разбит на вертикальные срезы: каждый этап должен запускаться в реальном профиле DSH и давать проверяемое пользовательское поведение.

## 0. Model experience — готово

- устанавливаемый bundle;
- RPG persona и director prompt section;
- browser-plugin branding smoke test;
- отдельный профиль `mayori`, изолированный от штатного `web`;
- импорт Character Card v2/v3 и browser-local галерея;
- конфигурация языка, стиля и дополнительных инструкций;
- unit tests и smoke-процедура.

## 1. Campaign journal

- типизированные события кампании;
- файловый provider с append-only хранением;
- проекции персонажей, локаций и активной сцены;
- инструменты чтения и подтверждения канона;
- model-visible snapshot через session event.

## 2. Rules and dice

- нейтральный Rules Service Definition;
- systemless provider и детерминированно тестируемый dice provider;
- инструменты проверки и разрешения действия;
- отображение бросков без разбора свободного текста.

## 3. RPG Web experience

- Conversation Nodes для бросков и изменений кампании;
- панели персонажа, сцены и журнала;
- восстановление интерфейса только из событий и проекций;
- responsive и keyboard-accessible UX.

## 4. Multiple rulesets and worlds

- устанавливаемые ruleset providers;
- import/export кампаний с версионированным форматом;
- миграции, резервные копии и проверка целостности;
- каталог world-building skills без скрытого изменения канона.
