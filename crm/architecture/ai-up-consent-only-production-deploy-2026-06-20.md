# AI-UP consent-only production deploy

**Purpose:** Зафиксировать выпуск consent interface на `pegasmebel.ru`, восстановление штатного GitHub Actions deploy и live-проверку без включения AI-UP pixel.
**Owner:** Владелец сайта / проектная команда.
**Last updated:** 2026-06-21

## Итог

**Статус: `DEPLOYED / LIVE QA PASS`.**

Consent interface развёрнут на production штатным путём `GitHub -> GitHub Actions -> Timeweb server`.

Финальный production commit: `1c6e64ee`.

Финальный workflow:

- `Site Deploy Production #121`;
- run ID: `27917334586`;
- conclusion: `success`;
- сайт: `https://pegasmebel.ru/`;
- главная страница: HTTP `200`;
- health endpoint: HTTP `200`;
- проверенный JS/CSS asset: HTTP `200`.

AI-UP pixel остался выключен. AI-UP project, sources, лимиты, Bitrix24, Директ и Метрика не менялись.

## AI-UP production safety

Production workflow:

- жёстко задаёт `NEXT_PUBLIC_AIUP_PIXEL_ENABLED=false`;
- не передаёт `NEXT_PUBLIC_AIUP_PIXEL_ID`;
- не добавляет AI-UP ID, snippet или token;
- не включает AI-UP project или sources.

Live Chromium QA подтвердил:

- AI-UP script в DOM отсутствует;
- AI-UP network requests отсутствуют;
- после `marketing=true` AI-UP также не загружается, потому что feature flag выключен.

Секреты, private keys, cookies и реальные AI-UP identifiers в отчёт, Git diff и terminal output не выводились.

## Проверки до deploy

| Проверка | Результат |
|---|---|
| TypeScript typecheck | PASS |
| Consent tests | PASS, 7/7 |
| AI-UP gateway tests | PASS, 24/24 |
| Production build | PASS |
| YAML/actionlint | PASS |
| Shell syntax deploy script | PASS |
| `git diff --check` | PASS |
| AI-UP feature flag | PASS, `false` |
| Production AI-UP ID | PASS, не добавлялся |

Команда `npm test` отсутствует в проекте. Вместо неё выполнены существующие `test:consent` и `test:aiup-gateway`.

`npm ci` сообщил о существующих package vulnerabilities. Автоматический `npm audit fix` не выполнялся, поскольку это отдельный scope.

## Восстановление deploy

В ходе выпуска последовательно устранены реальные production blockers:

1. GitHub Actions SSH user/key приведены в соответствие с рабочим Timeweb SSH-доступом.
2. Release activation запускается от владельца `APP_DIR`, поэтому файлы и server env доступны сервисному пользователю.
3. Временные upload-файлы безопасно очищаются перед новой загрузкой.
4. При ошибке запуска нового release выполняется автоматический rollback.
5. Server CTA guard запускается до переключения `current`.
6. Удалён legacy hero CTA literal, который блокировал CTA guard, без изменения пользовательской кнопки `Получить расчет`.
7. Cleanup пропускает legacy release без write-доступа.
8. Cleanup сортирует releases по времени и никогда не удаляет активный release.
9. Health-check проверяет не только API, но и главную страницу.
10. Публичные deploy-checks используют канонический адрес `https://pegasmebel.ru`, не полагаясь на устаревшие значения старых доменов.

Во время диагностики один новый release кратко дал HTTP `500`; автоматический recovery вернул рабочий manual-restore release. После исправления cleanup финальный deploy завершился успешно, а HTML, JS и CSS проверены с HTTP `200`.

## Live consent QA

Проверка выполнена реальным headless Chromium после успешного deploy.

Viewports:

- desktop: `1440x900`;
- mobile: `390x844`.

| Сценарий | Результат |
|---|---|
| Первый визит показывает consent banner | PASS |
| Desktop без горизонтального overflow | PASS |
| Mobile без горизонтального overflow | PASS |
| Mobile-кнопки полностью доступны | PASS |
| `Принять все` сохраняет analytics/marketing = true | PASS |
| `Отклонить необязательные` сохраняет оба значения false | PASS |
| `Настроить` открывает ручные настройки | PASS |
| Necessary включено и недоступно для отключения | PASS |
| Analytics и marketing переключаются отдельно | PASS |
| Custom analytics=true / marketing=false сохраняется | PASS |
| Выбор сохраняется после reload | PASS |
| Баннер не появляется повторно после сохранения | PASS |
| `Настройки cookies` в футере повторно открывает окно | PASS |
| AI-UP script до consent | PASS, отсутствует |
| AI-UP script после marketing consent | PASS, отсутствует при disabled flag |
| AI-UP network requests | PASS, отсутствуют |
| Page errors desktop/mobile | PASS, отсутствуют |

Mobile modal помещается в viewport; баннер и кнопки не создают горизонтальный скролл.

## Existing analytics observations

В desktop Chromium остались существующие console/network CSP-наблюдения аналитики, включая ранее зафиксированный `mc.yandex.com`. Они не связаны с consent UI и не исправлялись в этом deploy.

Метрика, GA, рекламные кампании и бюджет не менялись.

## Что не менялось

- AI-UP project;
- AI-UP sources и лимиты;
- production AI-UP ID;
- AI-UP feature flag, он остался `false`;
- Bitrix24;
- Яндекс Директ и рекламный бюджет;
- настройки Метрики;
- staging environment.

## Можно ли переходить к следующему preflight перед AI-UP activation

**Да, к отдельному read-only preflight можно переходить.**

Consent interface находится на production и прошёл live desktop/mobile QA. При этом production AI-UP pixel включать сейчас нельзя автоматически.

Следующий этап должен отдельно подтвердить:

1. официальный AI-UP pixel identifier/snippet;
2. точные production env без раскрытия значений;
3. безопасный состав активных AI-UP sources;
4. отдельное разрешение владельца на feature flag;
5. наблюдение за первой идентификацией без создания нежелательных CRM-действий.

## Можно ли включать production AI-UP pixel сейчас

**Нет.**

Consent-only deploy завершён, но AI-UP activation остаётся отдельным действием и требует нового явного подтверждения владельца.
