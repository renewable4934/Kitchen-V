# AI-UP marketing consent interface

**Purpose:** Зафиксировать реализацию интерфейса согласия на cookies, аналитику и маркетинговые технологии перед возможным включением AI-UP pixel.
**Owner:** Владелец сайта / проектная команда / CRM-ответственный.
**Last updated:** 2026-06-20

## Итог

Интерфейс согласия реализован в кодовой базе сайта. AI-UP pixel по-прежнему не включён в production и не может загрузиться без одновременного выполнения трёх условий:

1. feature flag включён;
2. публичный frontend identifier задан;
3. посетитель явно разрешил категорию `marketing`.

Production deploy, запуск AI-UP, изменение источников, лимитов, Bitrix24, Метрики и Директа не выполнялись.

## Что изменено

| Файл | Назначение |
|---|---|
| `promotion/site/lib/cookie-consent.ts` | Версионированное хранение выбора и единые browser events |
| `promotion/site/components/cookie-consent.tsx` | Баннер, настройки категорий и кнопка повторного открытия |
| `promotion/site/lib/cookie-consent.test.ts` | Тесты хранения выбора и AI-UP gate |
| `promotion/site/components/ai-up-pixel.ts` | Связь pixel с актуальным marketing consent и защита от дублей |
| `promotion/site/app/layout.tsx` | Централизованное подключение consent до AI-UP и аналитики |
| `promotion/site/components/footer.tsx` | Постоянная кнопка `Настройки cookies` |
| `promotion/site/app/privacy/page.tsx` | Техническое описание категорий и способа изменить выбор |
| `promotion/site/lib/tracking.ts` | Использование analytics choice для клиентских событий |
| `promotion/site/package.json` | Команда `test:consent` |

## Как работает consent

- Первый визит: сохранённого выбора нет, необязательные категории выключены, показывается баннер.
- `Принять все`: сохраняет `analytics=true`, `marketing=true`.
- `Отклонить необязательные`: сохраняет `analytics=false`, `marketing=false`.
- `Настроить`: открывает отдельные переключатели.
- `necessary`: всегда включена и недоступна для отключения.
- Выбор хранится в `localStorage` с версией схемы и датой обновления.
- Неизвестная, повреждённая или устаревшая версия не считается согласием.
- Кнопка в футере позволяет открыть настройки повторно.
- При отзыве marketing consent выбор сохраняется и страница перезагружается, чтобы ранее выполненный внешний script не продолжал работу в текущем документе.

## Связь с AI-UP

AI-UP script отсутствует в DOM, пока `marketing !== true`. После разрешения компонент дополнительно проверяет feature flag и наличие identifier. DOM ID скрипта фиксирован, поэтому повторные события согласия и переходы не создают дубль.

В коде и отчёте нет реального AI-UP ID, token, snippet, cookie или session data. Для тестовой сборки использовалось искусственное значение.

## Аналитика и Метрика

Выбор `analytics` передаётся клиентским функциям событий сайта. Существующие загрузчики Яндекс Метрики и GA не перестраивались, потому что это отдельное изменение с риском потери текущей аналитики.

Перед юридическим использованием analytics-переключателя как полного запрета необходимо отдельно решить, должны ли существующие счётчики:

- не загружаться до согласия;
- работать в ограниченном режиме;
- оставаться в текущем режиме на выбранном правовом основании.

До этого решения текст интерфейса не обещает, что переключатель блокирует саму загрузку всех существующих счётчиков.

## Проверки

| Проверка | Результат |
|---|---|
| TypeScript typecheck | PASS |
| Consent unit tests | PASS, 7/7 |
| Production build, pixel disabled | PASS |
| Production build, искусственный ID и enabled flag | PASS |
| Первый визит не имеет сохранённого согласия | PASS |
| Reject optional | PASS |
| Accept all | PASS |
| Custom analytics/marketing choice | PASS |
| Старая или повреждённая версия | PASS, fail-closed |
| AI-UP без marketing consent | PASS, blocked |
| Повторное consent update | PASS, второй script запрещён |
| Server HTML до browser consent | PASS, AI-UP URL отсутствует |
| Privacy page | PASS, доступна локально |
| Интерактивная визуальная browser-проверка | PASS через fallback Playwright/Chromium, см. итоговый раздел ниже |

Сборка выводит существующее предупреждение Next.js об устаревшем имени `middleware`; оно не связано с consent или AI-UP.

## Оставшиеся риски

1. Нужна отдельная проверка текста политики ответственным за правовые требования.
2. Нужна отдельная архитектурная договорённость по полной блокировке загрузчиков Метрики и GA.
3. Production env для AI-UP не задан.
4. Перед любым запуском нужно повторно проверить источники и лимиты AI-UP.

## Можно ли включать production pixel

**Нет.**

Consent blocker устранён в коде, но production activation остаётся отдельным шагом. До включения нужны:

1. consent-only deploy и live browser-проверка;
2. согласование политики и режима текущей аналитики;
3. повторный read-only аудит AI-UP sources;
4. настройка production env без раскрытия значений;
5. отдельное явное подтверждение владельца на включение feature flag.

## Следующий безопасный порядок

1. Проверить интерфейс локально на desktop и mobile.
2. Проверить сценарии accept, reject, custom и повторное открытие из футера.
3. Согласовать отдельное решение по Метрике и GA.
4. Провести повторный AI-UP source audit в read-only.
5. Подготовить production env.
6. Получить отдельное подтверждение владельца.
7. Только затем выполнить штатный GitHub Actions deploy.

## Visual browser audit retry — 2026-06-20 (историческая блокировка)

### Статус

**`BLOCKED`: визуальная browser-проверка не завершена.**

Встроенный браузерный контур не подключился к локальной странице: ошибка возникла до открытия localhost и до выполнения каких-либо действий на сайте. Production-сайт, AI-UP, Bitrix24, Метрика, Директ, env и лимиты не изменялись.

Этот статус относится только к Browser Plugin и заменён итоговым успешным fallback Playwright QA ниже.

### Что повторно проверено без browser automation

| Проверка | Результат |
|---|---|
| TypeScript typecheck | PASS |
| Consent unit tests | PASS, 7/7 |
| Production build с `AIUP_PIXEL_ENABLED=false` | PASS |
| Production build с искусственным test ID | PASS |
| Реальные AI-UP ID, token или snippet | Не использовались |
| Production deploy | Не выполнялся |

### Что нельзя считать проверенным

- desktop viewport и отсутствие критического перекрытия CTA, телефона, формы и навигации;
- mobile viewport, горизонтальный scroll и доступность всех кнопок;
- фактический внешний вид баннера и modal;
- accept/reject/custom через реальные клики;
- повторное открытие настроек из футера;
- сохранение localStorage после browser reload;
- console errors в реальном браузере;
- network requests AI-UP до и после test marketing consent;
- единственность script после route changes в реальном DOM.

### Решение по deploy consent interface

**Пока нет.** Код, typecheck, тесты и обе сборки проходят, но обязательный визуальный gate не закрыт. Разрешение на deploy только consent interface можно рассматривать после повторной проверки в исправно подключённом браузере.

### Можно ли включать production AI-UP pixel сейчас

**Нет.**

Причины:

1. визуальная browser-проверка не завершена;
2. production env для AI-UP не должен задаваться в рамках этого шага;
3. feature flag должен оставаться `false`;
4. требуется отдельный read-only аудит AI-UP sources и отдельное явное подтверждение владельца.

### Deployment checklist после успешной browser-проверки

1. Развернуть только consent interface штатным GitHub Actions процессом.
2. Оставить AI-UP feature flag равным `false`.
3. Не задавать production AI-UP ID или другие AI-UP env.
4. Проверить live consent interface на desktop и mobile.
5. Проверить accept, reject, custom и повторное открытие из футера.
6. Оставить AI-UP activation отдельным будущим этапом.

## Fallback Playwright browser QA — 2026-06-20

### Итоговый статус

**`PASS` для локального consent interface и AI-UP consent gate.**

Проверка выполнена реальным Chromium через временный Playwright-контур без Browser Plugin. Production deploy, production env и внешние кабинеты не изменялись.

### Viewport и evidence

- desktop: `1440×900`;
- mobile: `390×844`;
- screenshots: `promotion/site/local_artifacts/consent-browser-qa-2026-06-20/`;
- машинные результаты:
  - `disabled-results.json` — 32 успешные проверки;
  - `enabled-results.json` — 36 успешных проверок.

Сохранены кадры первого визита, окна настроек, состояния после accept/reject и мобильного футера для disabled и test-enabled сборок.

### Проверенные сценарии

| Сценарий | Результат |
|---|---|
| Первый визит показывает баннер | PASS |
| `Принять все` сохраняет analytics/marketing = true | PASS |
| Выбор сохраняется после reload | PASS |
| Баннер не появляется повторно после сохранения | PASS |
| `Отклонить необязательные` сохраняет оба значения false | PASS |
| `Настроить` открывает modal | PASS |
| Necessary включено и disabled | PASS |
| Analytics и marketing переключаются независимо | PASS |
| Комбинация analytics=true / marketing=false | PASS |
| Комбинация analytics=false / marketing=true | PASS |
| Повторное открытие из футера | PASS |
| Desktop без горизонтального overflow | PASS |
| Mobile без горизонтального overflow | PASS |
| Mobile-кнопки помещаются в viewport | PASS |
| Баннер не пересекает видимые header/hero CTA | PASS |
| Console/page errors в изолированной consent-сборке | PASS, отсутствуют |

### AI-UP gate

Disabled mode:

- script отсутствует в DOM;
- AI-UP network request отсутствует;
- marketing consent не может включить pixel без feature flag.

Safe test-enabled mode:

- использован только искусственный identifier;
- внешний запрос перехвачен локально и не передавался в AI-UP;
- без marketing consent script и request отсутствуют;
- после marketing consent появляется ровно один script в текущем документе;
- повторные consent events и повторное открытие настроек не создают второй script или request;
- после reject и reload script отсутствует.

Несколько запросов в полном test-run связаны с отдельными browser reload и новыми документами. Внутри одного документа защита от дублей подтверждена отдельными assertions.

### Визуальный результат

Визуальных дефектов consent UI не найдено:

- desktop banner аккуратно расположен ниже hero CTA;
- desktop modal читаем и не выходит за viewport;
- mobile banner сохраняет доступность header и основных CTA;
- mobile modal полностью помещается по ширине и высоте, элементы доступны;
- футер и `Настройки cookies` не обрезаны;
- текст русский, кнопки и переключатели читаемы.

Формы с HTML `submit` на проверяемой странице не обнаружены; визуально баннер не перекрывает показанные CTA и навигацию.

### Наблюдение по Метрике

При первом production-like запуске с текущим локальным ID Метрики Chromium показал существующие CSP-ошибки для `mc.yandex.com`, тогда как CSP разрешает `mc.yandex.ru`. Это не связано с consent UI и не исправлялось из-за запрета менять Метрику в этой задаче.

Для чистой проверки consent интерфейса обе локальные сборки были повторены с пустыми analytics env. В них console/page errors отсутствуют. CSP-наблюдение следует разобрать отдельной задачей до общего production preflight.

### Можно ли переходить к production deploy только consent interface

**Технически да, после отдельного явного подтверждения владельца.**

Условия consent-only deploy:

1. AI-UP feature flag остаётся `false`;
2. production AI-UP ID и другие AI-UP env не задаются;
3. deploy выполняется только штатным GitHub Actions процессом;
4. после deploy выполняется live desktop/mobile проверка consent;
5. AI-UP activation не входит в этот deploy.

### Можно ли включать production AI-UP pixel сейчас

**Нет.**

Сначала нужны отдельный consent-only deploy, live QA, повторный preflight AI-UP sources/env и отдельное явное подтверждение владельца на включение pixel.
