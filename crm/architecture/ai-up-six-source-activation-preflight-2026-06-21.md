# AI-UP six-source activation preflight

**Purpose:** Проверить готовность утверждённого AI-UP контура из собственного сайта и пяти сайтов-конкурентов, не включая project, pixel, сбор контактов или запись в Bitrix24.
**Owner:** Владелец проекта / CRM-ответственный / юридически ответственный.
**Last updated:** 2026-06-22

## Решение

Утверждённый бизнес-контур:

1. `pegasmebel.ru`;
2. `legokuhni.ru`;
3. `kuhnihit.ru`;
4. `rosta-mebel.ru`;
5. `dekol-mebel.ru`;
6. `ukuhni.ru`.

**Общий статус: `NO-GO` для запуска шести sources.**

Шесть активных sources теперь соответствуют бизнес-решению и не являются техническим отклонением. Блокеры:

1. нет подтверждённого основания именно для передачи «Пегасу», хранения в Bitrix24 и маркетингового обзвона контактов посетителей пяти competitor sources;
2. Bitrix route не содержит обязательных legal/no-call полей и не блокирует коммуникацию при неизвестном основании;
3. текущая production-версия workflow ещё не поддерживает env-driven activation pixel.

**Потенциальный `PARTIAL GO` только для `pegasmebel.ru` возможен после отдельного deploy подготовленного workflow и нового финального подтверждения владельца.** Этот preflight не разрешает такой deploy или activation.

Production, AI-UP project, sources, лимиты, Bitrix24, Метрика, Директ и бюджет не менялись.

## Fresh AI-UP state

Срез получен непосредственно из кабинета AI-UP 22 июня 2026 года.

| Параметр | Значение |
|---|---:|
| Project | `Пегас` |
| Project status | Остановлен |
| Общий дневной лимит | 14 |
| Идентификаций всего | 20 |
| Идентификаций сегодня | 0 |
| Sources всего | 51 |
| Sources активных | 6 |
| Sources остановленных | 45 |
| Колл-центр | Выключен |
| Integration | `AI-UP Direct CRM`, подключена |

Активны ровно шесть утверждённых sources. Дополнительных активных sources сверх контура не найдено.

## Target sources

| Source | Тип | Статус | Лимит | Идентификации |
|---|---|---|---:|---:|
| `pegasmebel.ru` | own site | Активен | 1 | 0 |
| `dekol-mebel.ru` | competitor | Активен | 1 | 0 |
| `legokuhni.ru` | competitor | Активен | 3 | 1 |
| `rosta-mebel.ru` | competitor | Активен | 3 | 1 |
| `kuhnihit.ru` | competitor | Активен | 3 | 2 |
| `ukuhni.ru` | competitor | Активен | 3 | 5 |

Сумма source limits равна общему project limit: `14`.

В проекте также присутствуют остановленные phone sources. Их номера в отчёте не приводятся. Активных phone sources не найдено.

## Live consent status

Fresh live Chromium QA:

- `pegasmebel.ru` и health endpoint отвечают HTTP 200;
- consent banner показывается в чистой сессии;
- accept, reject, custom settings и footer reopen работают;
- выбор сохраняется после reload;
- desktop и mobile не имеют горизонтального overflow;
- основной CTA и телефонные ссылки присутствуют;
- AI-UP script отсутствует;
- AI-UP network request отсутствует;
- page errors отсутствуют.

Для собственного сайта:

- marketing consent не отмечен заранее;
- pixel может загрузиться только при сочетании feature flag, identifier и `marketing=true`;
- без marketing consent загрузка блокируется;
- при отзыве marketing consent script удаляется и дальнейшая загрузка блокируется;
- privacy/cookie text соответствует реализованному gate.

Отзыв consent не может отменить данные, уже отправленные внешнему сервису до отзыва.

## Legal and compliance gate

Это технический preflight, а не юридическое заключение.

Официальные публичные материалы AI-UP содержат общее заявление, что сервис работает с аудиторией, давшей согласие оператору связи. Одновременно политика AI-UP:

- перечисляет номера телефонов среди обрабатываемых данных;
- указывает согласие субъекта как одно из условий обработки;
- ограничивает передачу третьим лицам случаями, связанными с законом или согласием субъекта.

В кабинете и доступных официальных материалах не найден документ, который подтверждает применительно к каждому competitor source:

- передачу контакта именно компании «Пегас»;
- использование контакта для маркетингового звонка «Пегаса»;
- хранение контакта в Bitrix24 «Пегаса»;
- допустимый текст первого обращения;
- evidence identifier или consent record, который можно сохранить вместе с контактом;
- процесс opt-out / do-not-call между AI-UP и «Пегасом».

### Source compliance matrix

| Source | Lawful basis status | Хранение в Bitrix24 | Маркетинговый звонок | Решение |
|---|---|---|---|---|
| `pegasmebel.ru` | Confirmed на уровне live marketing consent gate | Возможно после фактической identification и соблюдения политики | Только при наличии применимого consent/evidence | Технически готов, activation отдельно |
| `dekol-mebel.ru` | Unknown / missing | Не подтверждено | Не разрешать | NO-GO |
| `legokuhni.ru` | Unknown / missing | Не подтверждено | Не разрешать | NO-GO |
| `rosta-mebel.ru` | Unknown / missing | Не подтверждено | Не разрешать | NO-GO |
| `kuhnihit.ru` | Unknown / missing | Не подтверждено | Не разрешать | NO-GO |
| `ukuhni.ru` | Unknown / missing | Не подтверждено | Не разрешать | NO-GO |

Нельзя использовать формулировки «вы оставляли заявку у конкурента» или аналогичные утверждения без подтверждённого факта и юридически допустимого основания.

Режим `quarantine/no-call` можно рассматривать только после подтверждения права получить и хранить контакт. Сейчас не подтверждено даже это основание, поэтому сбор competitor contacts запускать нельзя.

## Bitrix24 route readiness

Read-only evidence:

- в AI-UP интеграция `AI-UP Direct CRM` отображается как подключённая;
- production содержит controlled gateway route;
- gateway поддерживает `source_type`, `source_name` и source URL/domain;
- gateway имеет allowlist, manual gate, режимы, daily limit и duplicate checks;
- пять competitor domains входят в текущий allowlist;
- tests подтверждают текущий технический контракт;
- новые записи в Bitrix24 не создавались.

Недостающие обязательные поля:

- `consent_basis_status`;
- `call_allowed`;
- `no_call_until_legal_confirmed`;
- ссылка или идентификатор consent/evidence;
- дата и источник legal verification;
- opt-out / do-not-call status.

Требуемая будущая структура:

| Поле | Значение |
|---|---|
| `source` | `AI-UP` |
| `source_domain` | домен source |
| `source_type` | `own_site` или `competitor_source` |
| `consent_basis_status` | `confirmed`, `unknown`, `missing` |
| `call_allowed` | `true` или `false` |
| `no_call_until_legal_confirmed` | `true` для неподтверждённых contacts |

Текущий route различает источники, но не обеспечивает legal quarantine. Поэтому route **не готов** к автоматическому шести-source запуску.

Дополнительная неопределённость: собственный домен не входит в allowlist режима first real competitor contact. Нужно отдельно определить, идёт ли `pegasmebel.ru` через Direct CRM integration или через controlled gateway, и затем закрепить один однозначный маршрут.

## Production workflow readiness

До preflight production workflow:

- жёстко задавал pixel flag как `false`;
- не передавал pixel identifier;
- не позволял безопасное включение только через GitHub Environment config.

Локально подготовлено изменение workflow:

- default feature flag остаётся `false`;
- flag читается только из GitHub Environment variable;
- identifier читается только из GitHub Environment secret;
- при `true` и отсутствующем identifier workflow завершается до build/deploy;
- значения identifier не печатаются;
- реальные значения не добавлены в Git или env;
- runtime env получает identifier только через защищённую конфигурацию.

Изменение не pushed и не deployed. Production по-прежнему работает с выключенным pixel.

## Checks

| Проверка | Результат |
|---|---|
| Fresh live consent QA | PASS |
| Live AI-UP script absent | PASS |
| Live AI-UP request absent | PASS |
| Fresh AI-UP cabinet audit | PASS |
| Дополнительные active sources | PASS, отсутствуют |
| Workflow lint | PASS |
| Workflow flag validation: disabled | PASS |
| Workflow flag validation: enabled + identifier | PASS |
| Workflow flag validation: enabled без identifier | PASS, fail closed |
| Typecheck | PASS |
| Consent tests | PASS, 7/7 |
| Gateway tests | PASS, 24/24 |
| Production build | PASS |

## Launch options

### Variant 1: conservative six-source

Не запускать до legal и Bitrix fixes.

После устранения блокеров:

- все шесть target sources;
- общий дневной лимит `6`;
- лимит каждого source `1`;
- обязательный `source_domain`;
- competitor contacts идут в quarantine/no-call, если хранение разрешено, но право звонить ещё не подтверждено;
- ручная проверка каждой identification.

Это рекомендуемый вариант для первого шести-source теста.

### Variant 2: business aggressive

Допустим только после письменного legal evidence:

- все шесть sources;
- отдельное согласование limits;
- звонок только при `call_allowed=true`;
- evidence, source domain и opt-out status сохраняются в Bitrix24;
- скрипт звонка согласован юридически.

### Variant 3: safest

- сначала `pegasmebel.ru` с limit `1`;
- затем competitor sources по одному;
- на каждом шаге проверяются evidence, Bitrix mapping и opt-out.

Это более безопасная альтернатива утверждённому одновременному запуску шести sources.

## Required evidence before GO

Нужно получить от AI-UP и проверить с ответственным за compliance:

1. форму и текст согласия, применимые к competitor audience;
2. перечень получателей или категорий третьих лиц;
3. разрешённые цели: передача, хранение, маркетинговый звонок;
4. способ доказать consent для конкретного контакта;
5. срок хранения и порядок удаления;
6. процедуру opt-out / do-not-call;
7. допустимый первый call script;
8. договорное распределение ролей и ответственности.

## Exact activation checklist after all blockers

Не выполнять в рамках этого preflight:

1. получить и утвердить legal evidence;
2. доработать Bitrix fields и gateway fail-closed rules;
3. deploy workflow при сохранённом `AIUP_PIXEL_ENABLED=false`;
4. live QA после workflow deploy;
5. задать protected public identifier без его вывода;
6. установить общий limit `6` и source limits `1`;
7. повторно убедиться, что активны ровно шесть target sources;
8. включить pixel feature flag отдельным подтверждённым deploy;
9. проверить отсутствие script без marketing consent;
10. проверить единственный script после consent;
11. только по отдельному финальному подтверждению включить AI-UP project;
12. вручную наблюдать первую identification;
13. проверить source domain, legal status и отсутствие звонка при `call_allowed=false`;
14. при любом отклонении остановить project и pixel.

## Final GO / NO-GO

- `pegasmebel.ru`: **PARTIAL GO candidate**, но только после отдельного workflow deploy и финального подтверждения activation.
- пять competitor sources: **NO-GO** до документального legal evidence и Bitrix quarantine controls.
- весь шести-source contour: **NO-GO**.

Текущие шесть active sources соответствуют новому бизнес-решению. Они не могут быть запущены только на основании технической доступности контактов.

## Official AI-UP materials reviewed

- `https://ai-up.ru/terms-conditions`
- `https://ai-up.ru/privacy`
- `https://ai-up.ru/how-work`

Публичные заявления сервиса зафиксированы как vendor claims и не заменяют проверку применимого согласия и права конкретного клиента сервиса на хранение и обзвон.
