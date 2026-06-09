# Title: AI-UP controlled webhook gateway public dry-run
# Purpose: Зафиксировать безопасный deploy test-only gateway и результат публичного dry-run без запуска AI-UP, без реальных контактов и без записи в Bitrix24.
# Owner: Вы / CRM-ответственный / владелец проекта.
# Last updated: 2026-06-09

## Что было сделано

- На текущую инфраструктуру сайта `pegasmebel.ru` выпущен test-only gateway endpoint:
  - `POST /api/aiup/bitrix-test`
- Deploy выполнен из изолированного release-пакета на базе коммита `34a25333` с одним дополнительным безопасным исправлением:
  - публичный `dry_run=1` больше не делает ни write, ни read-запросы в Bitrix24;
  - runtime ожидает `AIUP_GATEWAY_MODE=test`, как и требовалось для хостинга.
- Runtime env на сервере дополнен только нужными ключами без раскрытия значений:
  - `AIUP_GATEWAY_MANUAL_GATE`
  - `AIUP_GATEWAY_APPROVAL_TOKEN`
  - `BITRIX24_TEST_CRM_WEBHOOK_URL`
  - `AIUP_GATEWAY_DAILY_LIMIT`
  - `AIUP_GATEWAY_MODE`

## Результат публичного dry-run

- Публичный endpoint доступен по адресу:
  - `https://pegasmebel.ru/api/aiup/bitrix-test`
- Выполнен один smoke test через:
  - `POST https://pegasmebel.ru/api/aiup/bitrix-test?dry_run=1`
- Использован только тестовый payload:
  - `mode = test`
  - `phone = +79990000000`
  - `batch_id = aiup-public-dry-run-2026-06-08-001`
  - `source_type = public_dry_run`
  - `source_name = TEST_PUBLIC_DRY_RUN`
  - `status = dry_run`
- Endpoint вернул успешный ответ:
  - `HTTP 200`
  - `ok = true`
  - `result = dry_run`
  - `category_name = AI-UP / Test`
  - `source_name = AI-UP`
  - `stage_name = Новый AI-UP контакт`
  - `created_deal_id` отсутствует

## Подтверждения безопасности

- Bitrix write не выполнялся.
- Новая сделка в Bitrix24 не создавалась.
- AI-UP не запускался.
- Реальные контакты не передавались.
- Старый широкий webhook не использовался.
- Секреты, webhook URL, approval token и env values в отчёт не включены.

## Что важно знать

- Сам release активен и сайт после deploy отвечает по `api/health`.
- Во время deploy выявлен технический долг на сервере:
  - старые root-owned release-папки мешают штатной очистке старых релизов;
  - из-за этого `deploy-release.sh` завершился с ошибкой cleanup, хотя новый release стал активным и сервис успешно перезапустился.
- Это не повлияло на dry-run gateway, но требует отдельной серверной гигиены позже.

## Что нужно для следующего шага

- Если понадобится следующий controlled test, можно использовать тот же endpoint только в `dry_run=1`.
- Перед любым реальным write-шагом нужно отдельное подтверждение владельца.
- Перед будущими обычными deploy через `GitHub Actions` нужно синхронно добавить эти же gateway env-переменные в GitHub environment secrets, иначе последующий CI/CD deploy может перезаписать server `.env` без gateway-настроек.
