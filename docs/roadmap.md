# Roadmap

Roadmap разбит на вертикальные срезы: каждый этап должен запускаться в реальном профиле DSH и давать проверяемое пользовательское поведение.

## 0. Model experience — готово

- устанавливаемый bundle;
- RPG persona и director prompt section;
- собственная RPG-боковая панель;
- отдельный профиль `mayori`, изолированный от штатного `web`;
- импорт Character Card v2/v3, Host-owned файловый каталог и полноэкранная галерея;
- запуск штатного чата из карточки с durable выбором персонажа;
- совместимость с DSH `0.2.1-alpha.1`, штатные brand slots и отдельный RPG preset;
- конфигурация языка, стиля и дополнительных инструкций;
- unit tests и smoke-процедура.

## 1. Campaign journal

- типизированные события кампании;
- файловый provider с append-only хранением;
- проекции персонажей, локаций и активной сцены;
- инструменты чтения и подтверждения канона;
- model-visible snapshot через session event.

## 2. Rules and dice

- RulesService и NumericRulesProvider — готово: versioned profiles, natural criticals, выбранная грань, условный урон, фиксированные последствия и реальные броски таблиц; native resolveCheck и записанный исход в карточке;
- numeric DiceService, CryptoDiceProvider и native `rollDice` — готово: дерево выражений, арифметика, сравнения/count, `kh`/`kl`, взрывы/перебросы, ленивые условия и ссылки, ошибки по полям, version 3, сохранённые пулы/countFaces/face, лимиты и журнал всех граней;
- расширение правил за пределы числовых проверок;
- инструменты проверки и разрешения действия;
- отображение бросков через публичный `tool.call.toolview` из структурированного записанного результата — готово.

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
