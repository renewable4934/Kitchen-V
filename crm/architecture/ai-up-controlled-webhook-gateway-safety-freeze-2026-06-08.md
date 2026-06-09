# Title: AI-UP Controlled Webhook Gateway Safety Freeze
**Purpose:** Зафиксировать итоговый safety freeze после local-only реализации test-only gateway для AI-UP -> Bitrix24 и подтвердить, что контур остаётся безопасным, без deploy, без реального AI-UP и без новых write-операций в Bitrix24.
**Owner:** Вы / CRM-ответственный / владелец проекта.
**Last updated:** 2026-06-09

## 1. Проверенные файлы

В рамках safety freeze были проверены:
- `promotion/site/app/api/aiup/bitrix-test/route.ts`
- `promotion/site/lib/aiup-bitrix-gateway.ts`
- `promotion/site/lib/aiup-bitrix-gateway-store.ts`
- `promotion/site/lib/aiup-bitrix-gateway.test.ts`
- `promotion/site/.env.example`
- `promotion/site/package.json`
- `promotion/site/tsconfig.json`
- `crm/architecture/ai-up-controlled-webhook-gateway-test-only-2026-06-08.md`
- `index.md`
- `glossary.md`

Также были отдельно просмотрены:
- targeted `git status`;
- targeted `git diff --check`;
- targeted `git diff --stat`;
- unit-тесты gateway;
- локальные ответы dry-run / write из предыдущего безопасного этапа.

## 2. Результат secret scan / manual diff review

Проверка не выявила секретов в gateway-контуре и связанных документах.

Что было проверено:
- diff;
- test files;
- route / handler;
- отчёты;
- `.env.example`;
- `index.md`;
- `glossary.md`;
- staged set перед commit.

Что подтверждено:
- реальный Bitrix24 webhook URL в коммитируемых файлах отсутствует;
- `approval_token` не раскрыт;
- API keys, client secret, env values отсутствуют;
- реальные телефоны клиентов не найдены;
- реальные персональные данные в коммитируемом наборе не найдены.

Допустимые совпадения, которые были найдены и признаны безопасными:
- тестовый телефон `+79990000000`;
- fake URL `https://example.invalid/...` в unit-тесте;
- текстовые упоминания test-only ограничений в отчётах.

## 3. Подтверждение, что deploy не выполнялся

Подтверждено:
- deploy gateway не выполнялся;
- production не менялся;
- GitHub Actions deploy не запускался;
- production Bitrix / production site не трогались в рамках safety freeze.

## 4. Подтверждение, что AI-UP не запускался

Подтверждено:
- AI-UP не запускался;
- реальные AI-UP источники не подключались;
- реальные AI-UP payload не отправлялись.

## 5. Подтверждение, что второй Bitrix write не выполнялся

Подтверждено:
- после ранее выполненного одного test-only write новых write-операций в Bitrix24 не делалось;
- safety freeze использовал только local/readonly проверки;
- дедупликация и лимиты проверялись локально в тестах, без второго CRM write.

## 6. Подтверждение test-only hard block

Локально подтверждено тестами:
- missing `mode` -> отказ;
- `mode=live` -> отказ;
- `mode=prod` -> отказ;
- `mode=production` -> отказ;
- любой `mode != test` -> отказ.

Вывод:
- live/prod/production не могут пройти в create-ветку и не могут попасть в Bitrix24.

## 7. Подтверждение manual gate

Локально подтверждено тестами:
- без `AIUP_GATEWAY_MANUAL_GATE` gateway отказывает;
- при значении, отличном от `test-only-enabled`, gateway отказывает.

Текущее поведение:
- отказ происходит до безопасного выполнения сценария;
- create-ветка не продолжается.

## 8. Подтверждение approval token protection

Локально подтверждено тестами:
- без `approval_token` -> отказ;
- при неверном `approval_token` -> отказ;
- `approval_token` не печатается в ответе шлюза;
- `approval_token` не найден в коммитируемых документах и тестах как реальное значение.

## 9. Подтверждение test-only phone policy

Локально подтверждено:
- разрешён только `+79990000000`;
- любой другой номер отвергается;
- реальные номера не могут пройти через текущий test-only gateway.

## 10. Подтверждение allowlist

Локально подтверждено:
- gateway принимает только разрешённые поля;
- лишние поля игнорируются;
- лишние поля не уходят в Bitrix24 payload.

Разрешённый входной контракт:
- `mode`
- `approval_token`
- `batch_id`
- `name`
- `phone`
- `source_type`
- `source_name`
- `source_url_or_phone`
- `region`
- `channel`
- `status`
- `manager_comment`

## 11. Подтверждение Bitrix mapping only to `AI-UP / Test`

Подтверждено кодом и тестами:
- create mapping ориентирован только на категорию `AI-UP / Test`;
- стартовая стадия только `Новый AI-UP контакт` / `C1:NEW`;
- источник только `AI-UP`;
- dynamic lookup выполняется по названиям, а не по fallback ID.

## 12. Подтверждение отсутствия fallback на `Продажи`

Локально подтверждено тестом:
- если `AI-UP / Test` не найдена, gateway отказывает;
- сделка в другую воронку не создаётся;
- fallback на `Продажи` отсутствует.

Также по коду не найдено логики выбора `Продажи` как запасного варианта.

## 13. Подтверждение duplicate behavior

Локально подтверждено тестами:
- повторный payload не создаёт вторую сделку;
- результат возвращается как `duplicate`;
- `crm.deal.add` не вызывается второй раз;
- локальный журнал корректно фиксирует обработанный payload.

Важно:
- проверка duplicate в freeze-этапе не делала новый write в Bitrix24.

## 14. Подтверждение daily limit behavior

Локально подтверждено тестами:
- лимит `5` test-only созданий в день работает;
- превышение лимита возвращает `429`;
- лимит не требует внешнего платного сервиса;
- используется локальный JSON journal store.

## 15. Подтверждение отсутствия секретов в diff / reports / logs

Повторная targeted проверка подтвердила:
- в коммитируемых файлах нет реальных webhook URL;
- нет реальных env values;
- нет approval token value;
- нет client secret;
- нет API key;
- нет реальных клиентских контактов;
- нет real AI-UP data.

Дополнительное замечание:
- repo-wide `git diff --check` по всему грязному worktree не является чистым из-за старых trailing whitespace в других изменённых файлах;
- targeted gateway-набор проходит `git diff --check`.

## 16. Какие риски остаются

Остающиеся риски:
- gateway пока local-only и не проверялся после deploy;
- live-режим не должен включаться без отдельного решения владельца;
- production route не тестировался и не должен тестироваться на этом этапе;
- test-only контур всё ещё зависит от дисциплины env и отдельного ограниченного webhook;
- абсолютный нулевой риск по всем внутренним уведомлениям вне подтверждённого `activities_count = 0` не объявляется.

## 17. Что можно делать следующим этапом только после отдельного подтверждения владельца

Только после отдельного подтверждения владельца можно:
- деплоить gateway;
- сохранять test webhook в постоянное runtime-окружение;
- подключать controlled runtime за пределами local-only режима;
- запускать новые Bitrix write-проверки;
- подключать реальный AI-UP;
- передавать реальные контакты;
- переводить контур из `test` в `live`.

## Итог

Safety freeze завершён в безопасном режиме.

Подтверждено:
- deploy не выполнялся;
- AI-UP не запускался;
- второй Bitrix write не выполнялся;
- gateway остаётся test-only;
- fallback на `Продажи` отсутствует;
- секреты в коммитируемом наборе не обнаружены.
