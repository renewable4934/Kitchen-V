# Title: AI-UP Controlled Webhook Gateway Test-Only
**Purpose:** Зафиксировать локальную реализацию controlled webhook gateway для будущего AI-UP -> Bitrix24, результаты dry-run и одного test-only write, а также подтверждённые защитные ограничения.
**Owner:** Вы / CRM-ответственный / владелец проекта.
**Last updated:** 2026-06-09

## 1. Что было сделано

В `promotion/site` подготовлен local-only gateway для будущего контура `AI-UP -> controlled webhook gateway -> Bitrix24`.

Что входит в реализацию:
- endpoint: `/api/aiup/bitrix-test`;
- API route `app/api/aiup/bitrix-test/route.ts`;
- основная логика шлюза в `lib/aiup-bitrix-gateway.ts`;
- локальный журнал дедупликации и дневного лимита в `lib/aiup-bitrix-gateway-store.ts`;
- unit-тесты `lib/aiup-bitrix-gateway.test.ts`;
- новые безопасные env-переменные в `.env.example`.

Handler-логика:
- `POST /api/aiup/bitrix-test` принимает test-only payload;
- query `dry_run=1` оставляет сценарий в read-only режиме;
- create/write ветка разрешена только для локального test-only сценария и только при корректном gate.

Важно:
- deploy не запускался;
- production не менялся;
- AI-UP не включался;
- реальные контакты не передавались.

## 2. Какие защитные ограничения встроены

Шлюз работает только в жёстком `test-only` режиме.

Подтверждённые ограничения:
- требуется `AIUP_GATEWAY_MODE = test-only`;
- требуется ручной gate `AIUP_GATEWAY_MANUAL_GATE = test-only-enabled`;
- требуется отдельный `approval_token`;
- разрешён только `mode = test`;
- `live`, `prod`, `production` жёстко блокируются;
- разрешён только выделенный тестовый телефон `+79990000000`;
- используется только отдельный ограниченный webhook со scope `CRM`;
- старый широкий webhook не используется;
- работает allowlist полей payload;
- обязательные поля проверяются до обращения в Bitrix24;
- есть локальная дедупликация по `phone + source_type + source_name + batch_id`;
- есть проверка дублей в самом Bitrix24;
- есть дневной лимит;
- логи и ответ шлюза маскируют телефон и не печатают токены.

## 2.1 Какие env-переменные нужны

В `.env.example` добавлены только имена переменных, без секретных значений:
- `AIUP_GATEWAY_MANUAL_GATE`
- `AIUP_GATEWAY_APPROVAL_TOKEN`
- `BITRIX24_TEST_CRM_WEBHOOK_URL`
- `AIUP_GATEWAY_DAILY_LIMIT`
- `AIUP_GATEWAY_MODE`

Важно:
- реальные значения в Git не сохранялись;
- production env не менялся;
- test webhook не сохранялся в репозитории.

## 3. Какие Bitrix24 mapping-данные найдены динамически

Шлюз не хардкодит идентификаторы, а ищет их через Bitrix24 API по названиям.

Подтверждено на 2026-06-09:
- воронка `AI-UP / Test` -> `CATEGORY_ID = 1`;
- стартовая стадия `Новый AI-UP контакт` -> `STAGE_ID = C1:NEW`;
- источник `AI-UP` -> `SOURCE_ID = 1`.

Также динамически подтверждены коды 12 пользовательских полей сделки:
- `AI-UP Source Type` -> `UF_CRM_1780857999`
- `AI-UP Source Name` -> `UF_CRM_1780858167`
- `AI-UP Source URL or Phone` -> `UF_CRM_1780858208`
- `AI-UP Region` -> `UF_CRM_1780858216`
- `AI-UP Imported At` -> `UF_CRM_1780858223`
- `AI-UP Status` -> `UF_CRM_1780858230`
- `AI-UP Channel` -> `UF_CRM_1780858237`
- `AI-UP Manager Comment` -> `UF_CRM_1780858244`
- `AI-UP Call Attempts` -> `UF_CRM_1780858251`
- `AI-UP Contact Quality` -> `UF_CRM_1780858259`
- `AI-UP Next Step` -> `UF_CRM_1780858266`
- `AI-UP Batch ID` -> `UF_CRM_1780858273`

## 4. Какой webhook использовался

Для локальной проверки использовался отдельный входящий webhook из integration `id = 3`.

Подтверждено:
- webhook взят не из старого широкого контура;
- scope webhook ограничен только `CRM`;
- URL и токен в отчёте не раскрываются;
- временная копия webhook после проверки удалена из `/tmp`.

## 5. Проверка кода

Локальные проверки на 2026-06-09:
- `npm run typecheck` -> успешно;
- `npm run test:aiup-gateway` -> успешно, `12/12` тестов зелёные.

Что покрывают тесты:
- блокировку неверного режима;
- блокировку любого `mode`, отличного от `test`;
- проверку approval token;
- отказ без `approval_token`;
- отказ без `manual gate`;
- отказ при неверном `manual gate`;
- запрет нетестового телефона;
- allowlist полей;
- dry-run;
- write-сценарий;
- дедупликацию;
- дневной лимит;
- отказ без `AI-UP / Test` вместо fallback в другую воронку;
- отсутствие утечки `approval_token` и полного телефона в ответе.

## 6. Dry-run результат

Локальный dry-run прошёл успешно.

Подтверждено:
- `status = 200`;
- `result = dry_run`;
- целевая воронка: `AI-UP / Test`;
- стартовая стадия: `Новый AI-UP контакт`;
- источник: `AI-UP`;
- лишние поля не потребовались, `ignored_fields = []`.

Важно:
- dry-run ничего не записывал в Bitrix24;
- webhook использовался только для чтения mapping и проверки дублей.

## 7. Один test-only write

После dry-run был выполнен ровно один test-only write через новый ограниченный CRM webhook.

Результат:
- `status = 200`;
- `result = created`;
- создана сделка `ID = 21`;
- заголовок сделки: `TEST / AI-UP / gateway / 2026-06-09 / не обрабатывать`.

Проверка сделки после создания:
- `CATEGORY_ID = 1`;
- `STAGE_ID = C1:NEW`;
- `SOURCE_ID = 1`;
- `activities_count = 0`.

Практический смысл:
- запись попала именно в `AI-UP / Test`;
- признаков CRM-активностей после создания не обнаружено;
- верификация не показала автосозданных дел в CRM.

## 8. Что именно ушло в Bitrix24

В test-only сделку ушли только разрешённые поля:
- test-only `TITLE`;
- тестовый телефон;
- test-only `source_type`;
- test-only `source_name`;
- `source_url_or_phone`;
- `region`;
- `status`;
- `channel`;
- `manager_comment`;
- `batch_id`;
- служебные поля стартовой категории, стадии и источника;
- `REGISTER_SONET_EVENT = N`.

Что не делалось:
- не создавались лиды;
- не трогалась воронка `Продажи`;
- не включались телефония, задачи, SMS, WhatsApp, email или бизнес-процессы;
- не запускался AI-UP.

## 9. Что не было сделано специально

Сознательно не выполнялось:
- deploy в production;
- сохранение test webhook в Git;
- подключение Make, Albato или реального AI-UP;
- перевод шлюза в live;
- использование старого широкого webhook;
- массовые тесты;
- больше одного write в Bitrix24.

## 9.1 Ограничения проверки

Что не проверялось на этом этапе:
- реальный AI-UP;
- production route после deploy;
- live-режим;
- реальная передача клиентских контактов;
- автоматизации за пределами уже изолированного test-only контура.

Что важно понимать:
- выводы относятся только к local-only gateway и к test-only Bitrix contour;
- любое расширение этого контура требует отдельного подтверждения владельца.

## 10. Вывод

Local-only controlled webhook gateway для `Пегас` подготовлен и подтверждён в safe-режиме.

Что уже можно считать доказанным:
- кодовый шлюз работает;
- dynamic mapping с Bitrix24 работает;
- dry-run работает;
- один test-only write работает;
- созданная запись попадает в `AI-UP / Test`;
- у проверенной сделки `activities_count = 0`.

Что всё ещё требует отдельного подтверждения владельца:
- сохранение test webhook в постоянное локальное окружение;
- любой deploy этого route;
- подключение реального AI-UP;
- снятие блока с live-режима;
- передача реальных контактов;
- любые дальнейшие write-операции сверх test-only контура.

## Итог

Следующий безопасный шаг возможен только отдельным подтверждением владельца:
- либо оставить gateway локальным как reference implementation;
- либо отдельно согласовать controlled deploy в test-only окружение;
- но live AI-UP и реальные контакты по-прежнему запрещены.
