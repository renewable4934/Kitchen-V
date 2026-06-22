# AI-UP production activation preflight

**Purpose:** Зафиксировать свежую read-only проверку сайта, consent gate, production-конфигурации, AI-UP sources и маршрута в Bitrix24 перед возможным микро-включением AI-UP pixel.
**Owner:** Владелец сайта / CRM-ответственный / проектная команда.
**Last updated:** 2026-06-22

## Итог

**Статус: `NO-GO`.**

Production, AI-UP, Bitrix24, Метрика и рекламные системы в рамках preflight не изменялись.

Микро-включение сейчас небезопасно по двум причинам:

1. в AI-UP активны шесть sources, а не только `pegasmebel.ru`;
2. production workflow жёстко задаёт pixel feature flag как `false` и не передаёт pixel ID, поэтому безопасного env-only включения сейчас нет.

AI-UP project остаётся остановлен. AI-UP pixel на live-сайте не загружается.

## Live-сайт и consent

Fresh Chromium QA выполнен 22 июня 2026 года.

Viewports:

- desktop: `1440x900`;
- mobile: `390x844`.

| Проверка | Результат |
|---|---|
| `https://pegasmebel.ru/` | PASS, HTTP 200 |
| `/api/health` | PASS, HTTP 200 |
| Consent banner в чистой сессии | PASS |
| `Принять все` | PASS |
| `Отклонить необязательные` | PASS |
| Ручная настройка | PASS |
| Necessary включено и недоступно для отключения | PASS |
| Analytics и marketing переключаются отдельно | PASS |
| Повторное открытие через footer | PASS |
| Сохранение после reload | PASS |
| Desktop/mobile horizontal overflow | PASS, отсутствует |
| Главный CTA `Получить расчет` | PASS |
| Телефонные ссылки | PASS, присутствуют |
| Footer `Настройки cookies` | PASS |
| Page errors | PASS, отсутствуют |

Отдельных HTML `form` на главной странице не обнаружено: текущий configurator реализован интерактивными компонентами. В рамках preflight отправка заявки не выполнялась.

## Live AI-UP status

На live-сайте:

- AI-UP script отсутствует в DOM;
- AI-UP network request отсутствует;
- после `marketing=true` script также отсутствует, потому что feature flag выключен;
- после изменения выбора с `marketing=true` на `false` script отсутствует и дальнейшая загрузка блокируется.

Текущая логика:

- требует одновременно feature flag, непустой public pixel identifier и marketing consent;
- не загружает script без marketing consent;
- удаляет существующий script при отзыве marketing consent;
- защищает от повторного добавления script в текущий документ.

Отзыв согласия блокирует дальнейшую загрузку, но не может отменить данные, уже отправленные внешнему сервису до отзыва.

## Production env readiness

Компонент ожидает:

- `NEXT_PUBLIC_AIUP_PIXEL_ENABLED`;
- `NEXT_PUBLIC_AIUP_PIXEL_ID`.

Безопасный `.env.example` содержит только пустые placeholder-значения.

Текущий production workflow:

- жёстко задаёт `NEXT_PUBLIC_AIUP_PIXEL_ENABLED=false`;
- не читает и не передаёт `NEXT_PUBLIC_AIUP_PIXEL_ID`;
- создаёт runtime env без pixel ID.

Следствие:

**Включение только через изменение GitHub environment variable/secret сейчас невозможно.** Перед будущей активацией потребуется отдельное изменение workflow, проверки, commit, GitHub Actions deploy и live QA.

Реальные identifiers, snippets, tokens, GitHub secrets и server env не читались и не выводились.

## Fresh AI-UP cabinet state

Срез получен непосредственно из AI-UP кабинета 22 июня 2026 года.

| Параметр | Текущее значение |
|---|---:|
| Проект | `Пегас` |
| Статус проекта | Остановлен |
| Общий дневной лимит | 14 |
| Идентификаций всего | 20 |
| Идентификаций сегодня | 0 |
| Sources всего | 51 |
| Sources активных | 6 |
| Sources остановленных | 45 |
| Колл-центр | Выключен |

## Source `pegasmebel.ru`

| Параметр | Текущее значение |
|---|---|
| Source найден | Да |
| Соответствует нашему домену | Да |
| Статус | Активен |
| Дневной лимит | 1 |
| Идентификаций | 0 |
| Регион | По всей РФ |

Source однозначно соответствует live-сайту, но его региональный охват шире основной географии бизнеса. Для микро-теста это отдельный риск качества, хотя лимит равен 1.

## Активные sources

Сейчас активны:

| Source | Тип | Лимит | Идентификации |
|---|---|---:|---:|
| `pegasmebel.ru` | наш сайт | 1 | 0 |
| `dekol-mebel.ru` | конкурент | 1 | 0 |
| `legokuhni.ru` | конкурент | 3 | 1 |
| `rosta-mebel.ru` | конкурент | 3 | 1 |
| `kuhnihit.ru` | конкурент | 3 | 2 |
| `ukuhni.ru` | конкурент | 3 | 5 |

Сумма лимитов активных sources равна общему лимиту проекта: `14`.

Следствие:

**Если сейчас запустить project, работать начнут все шесть активных sources.** Ограничение только source `pegasmebel.ru` не обеспечено.

## Телефонные sources

В проекте присутствуют телефонные sources:

- на первой странице списка найдено 26 телефонных sources;
- их реальные номера в отчёте не приводятся;
- активных телефонных sources в свежем срезе не найдено;
- часть остановленных телефонных sources уже имеет исторические идентификации.

Наличие телефонных sources само по себе не блокирует микро-тест, пока они остановлены, но требует повторной проверки непосредственно перед любым запуском project.

## Bitrix24 route

Read-only evidence:

- в AI-UP на вкладке интеграций отображается `AI-UP Direct CRM` со статусом `Подключен`;
- production-код содержит route controlled gateway;
- production workflow требует наличие одного из разрешённых Bitrix24 webhook secrets;
- gateway содержит allowlist полей, проверку режима, manual gate, проверку источника, дневной лимит и защиту от дублей;
- ранее route проходил dry-run и тесты, но в этом preflight новые записи не создавались.

Включение pixel само по себе не должно создавать Bitrix24 запись без полученной AI-UP identification. Это вывод из текущей архитектуры: pixel только загружает клиентский script, а CRM integration обрабатывает полученный контакт.

Ограничение:

- фактическая end-to-end доставка новой production identification в Bitrix24 сегодня не проверялась;
- первая реальная identification должна сопровождаться ручной проверкой AI-UP и Bitrix24.

Статус route: **подтверждён частично / risk controlled**. Это не главный blocker текущего preflight, потому что AI-UP source safety уже даёт `NO-GO`.

## Security and privacy

Проверено:

- реальные AI-UP values отсутствуют в Git;
- `.env.example` содержит только placeholders;
- pixel identifier не логируется приложением;
- production workflow не печатает pixel identifier;
- consent text прямо сообщает, что AI-UP может загрузиться только после marketing consent и отдельного технического включения;
- privacy page соответствует реализованному consent gate;
- pre-checked marketing consent отсутствует.

Публичный frontend identifier при будущем включении технически будет доступен браузеру и попадёт в URL загрузки script. Его всё равно нужно хранить централизованно в GitHub environment secret/config и не включать в отчёты.

## Блокеры

До микро-включения необходимо отдельными подтверждёнными действиями:

1. оставить активным только `pegasmebel.ru`;
2. остановить пять активных competitor sources;
3. повторно подтвердить, что телефонные sources остановлены;
4. сохранить project в статусе `Остановлен` до завершения технической части;
5. решить, нужен ли регион `По всей РФ` или только целевая география;
6. подготовить workflow для безопасного чтения feature flag и pixel ID из production environment;
7. проверить, что default и missing env по-прежнему означают `disabled`;
8. выполнить отдельный consent-preserving deploy;
9. повторить live проверку без marketing consent и с ним;
10. только после отдельного разрешения включить project с source limit `1`;
11. вручную наблюдать первую identification и проверить маршрут в Bitrix24.

## Точный вывод

**Переходить к микро-включению AI-UP pixel сейчас нельзя.**

Текущий live-сайт и consent gate технически готовы. Не готовы:

- безопасный состав AI-UP sources;
- env-only production activation path.

После устранения этих двух блокеров нужен новый fresh preflight. Этот отчёт не является разрешением на изменение AI-UP, production env или deploy.
