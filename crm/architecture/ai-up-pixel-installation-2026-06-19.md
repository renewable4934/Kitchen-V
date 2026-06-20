# Title: AI-UP Pixel Installation 2026-06-19
**Purpose:** Зафиксировать безопасную подготовку официального AI-UP pixel для сайта `pegasmebel.ru`, ограничения consent и порядок будущего production activation.
**Owner:** Вы / владелец сайта / CRM-ответственный.
**Last updated:** 2026-06-19

# AI-UP pixel для pegasmebel.ru

## Итог

В кодовой базе подготовлена интеграция официального AI-UP pixel.

Текущий режим: `PREPARED / DISABLED`.

Пиксель не включён на production и не загружается автоматически:
- feature flag по умолчанию `false`;
- публичный pixel ID отсутствует в репозитории;
- даже при включённом flag требуется явный marketing consent;
- на сайте пока нет consent-баннера, который выдаёт такое согласие.

Production deploy в рамках задачи не выполнялся.

## Официальный источник кода

Использована официальная инструкция AI-UP:

`https://teletype.in/@ai-up/MxFuLRgUBFg`

Инструкция требует:
1. создать источник `Сбор со своего сайта`;
2. задать название и дневной лимит;
3. скопировать выданный AI-UP script;
4. установить его внутри `<head>`;
5. опубликовать сайт.

В проекте AI-UP создан источник:
- название: `pegasmebel.ru`;
- дневной лимит: `1`;
- идентификаций на момент создания: `0`.

AI-UP создал источник активным по умолчанию. Сам проект `Пегас` остаётся остановленным, а код на production не опубликован, поэтому сбор через новый источник не начался.

После создания:
- количество источников проекта изменилось с `50` на `51`;
- общий дневной лимит изменился с `13` на `14`;
- количество идентификаций осталось `20`;
- статус проекта остался `Остановлен`.

Повторная попытка переключить новый источник через UI не дала подтверждённого изменения статуса. Это не создаёт текущего расхода, потому что:
- проект `Пегас` остановлен;
- pixel отсутствует на production;
- feature flag в коде выключен;
- у источника `0` идентификаций.

Перед любым будущим запуском AI-UP статус источника `pegasmebel.ru` нужно проверить отдельно.

Официальный snippet подтверждает:
- script host: официальный домен AI-UP;
- используется один публичный frontend pixel identifier;
- отдельные `project ID`, `source ID` или `client token` для этого snippet не требуются.

Реальный snippet и pixel identifier не записаны в Git, Markdown или отчёт.

## Стек и место подключения

Сайт работает на:
- Next.js `16.1.6`;
- App Router;
- React `19`;
- TypeScript.

Общее подключение выполняется через:

`promotion/site/app/layout.tsx`

Компонент `AiUpPixel` подключён один раз в root layout и поэтому применяется ко всем маршрутам, включая desktop и mobile layout одного адаптивного приложения.

Отдельных mobile routes или отдельного mobile shell нет.

## Реализация

Новый компонент:

`promotion/site/components/ai-up-pixel.ts`

Защиты:
- выполняется только в браузере через `useEffect`;
- не обращается к `window` или `document` во время SSR;
- не создаёт script при отсутствующем ID;
- не создаёт script при выключенном flag;
- не создаёт script без явного marketing consent;
- проверяет существующий script по стабильному DOM ID;
- повторная навигация не создаёт второй script;
- ошибки или отсутствующая конфигурация не ломают страницу.

Официальный endpoint не собирается из предположений: его структура подтверждена snippet, полученным в AI-UP.

## Env-переменные

В `.env.example` добавлены только безопасные placeholders:

```dotenv
NEXT_PUBLIC_AIUP_PIXEL_ENABLED=false
NEXT_PUBLIC_AIUP_PIXEL_ID=
```

Реальное значение `NEXT_PUBLIC_AIUP_PIXEL_ID` нужно хранить:
- локально в игнорируемом `.env`;
- для GitHub Actions в environment secret `AIUP_PIXEL_ID`.

Флаг будущей активации:
- GitHub environment variable `AIUP_PIXEL_ENABLED`;
- до юридического и технического consent-gate значение должно оставаться `false`.

## Consent

На сайте нет полноценного cookie/consent manager.

В существующем tracking-коде есть только техническая точка расширения, но текущая аналитика по умолчанию считает consent разрешённым. Для AI-UP это поведение не используется.

AI-UP pixel требует отдельного строгого сигнала:

```js
window.__marketingConsent = true
window.dispatchEvent(new Event("marketing-consent-granted"))
```

Этот сигнал сейчас нигде не устанавливается. Следовательно, AI-UP pixel остаётся заблокированным даже при случайном включении feature flag.

Перед production activation нужно:
1. согласовать правовое основание обработки;
2. обновить политику обработки данных;
3. добавить понятный consent UX;
4. выдавать сигнал только после согласия пользователя;
5. отдельно подтвердить включение AI-UP pixel владельцем сайта.

## CSP

Официальный домен AI-UP добавлен только в необходимые CSP directives:
- `script-src`;
- `connect-src`.

Изменены оба источника production CSP:
- `promotion/site/next.config.mjs`;
- `promotion/site/ops/nginx-site.conf.template`.

Широкие wildcard-разрешения не добавлялись.

## Deploy

Production и staging workflows подготовлены для передачи:
- `AIUP_PIXEL_ENABLED` как GitHub environment variable;
- `AIUP_PIXEL_ID` как GitHub environment secret.

Реальные значения в workflow не записаны.

Коммит сам по себе не должен включать pixel: default flag остаётся `false`.

Production deploy не выполнялся.

## Проверки

Успешно:
- `npm run typecheck`;
- `npm run build` с обычной конфигурацией и выключенным AI-UP flag;
- `npm run build` с тестовым публичным ID и включённым flag;
- чистая финальная production build после тестовой сборки;
- guard-проверки `enabled / ID / consent / duplicate`;
- официальный URL строится только на подтверждённом host/path AI-UP;
- при выключенном flag script отсутствует в DOM;
- при включённом flag и тестовом ID script отсутствует без marketing consent;
- на `/` и `/privacy` script не дублируется и не появляется без consent;
- тестовая сборка содержит официальный endpoint и обработчик consent-сигнала.

В локальной браузерной проверке было видно общее hydration warning сайта. Оно присутствовало при полностью отсутствующем AI-UP script и не связано с пикселем. Ошибок `window/document` из компонента AI-UP не обнаружено.

Runtime-подача consent-сигнала через инструмент браузера была заблокирована ограничением безопасного read-only выполнения JavaScript. Ветка успешной загрузки дополнительно проверена чистой функцией guard: при `enabled=true`, непустом ID, `consent=true` и отсутствии существующего script результат разрешает загрузку; при повторном script блокирует дубль.

## Изменённые файлы

- `promotion/site/components/ai-up-pixel.ts`
- `promotion/site/app/layout.tsx`
- `promotion/site/.env.example`
- `promotion/site/next.config.mjs`
- `promotion/site/ops/nginx-site.conf.template`
- `.github/workflows/site-deploy-production.yml`
- `.github/workflows/site-deploy-staging.yml`
- `crm/architecture/ai-up-pixel-installation-2026-06-19.md`
- `index.md`

## Секреты и персональные данные

- Реальный pixel identifier не выводился в отчёт.
- Официальный полный snippet не добавлялся в Git.
- `.env` не добавлялся в Git.
- Токены, cookies и session data не использовались в коде.
- Тестовые лиды, контакты и сделки Bitrix24 не создавались.

## Production activation

До отдельного разрешения владельца:
- `AIUP_PIXEL_ENABLED=false`;
- AI-UP проект остаётся остановленным;
- новый источник не должен использоваться для реального сбора;
- deploy не выполнять.

После реализации consent UX и отдельного подтверждения:
1. сохранить реальный ID в GitHub environment secret `AIUP_PIXEL_ID`;
2. установить environment variable `AIUP_PIXEL_ENABLED=true`;
3. выполнить штатный deploy через GitHub Actions;
4. проверить один script в DOM;
5. проверить отсутствие console/CSP ошибок;
6. проверить, что до согласия запросов AI-UP нет;
7. проверить, что после согласия загружается только официальный AI-UP script.
