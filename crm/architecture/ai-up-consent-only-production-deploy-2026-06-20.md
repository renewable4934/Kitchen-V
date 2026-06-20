# AI-UP consent-only production deploy

**Purpose:** Зафиксировать попытку выпуска consent interface на `pegasmebel.ru`, результат GitHub Actions и состояние live-сайта без включения AI-UP pixel.
**Owner:** Владелец сайта / проектная команда.
**Last updated:** 2026-06-20

## Итог

**Статус: `FAILED / NOT DEPLOYED`.**

Consent-only кандидат успешно добавлен в `main`, но GitHub Actions остановился на загрузке release по SSH. Активация release на сервере не выполнялась, поэтому consent interface на live-сайте пока отсутствует.

AI-UP pixel не включён. AI-UP project, лимиты, Bitrix24, Директ и Метрика не менялись.

## Deploy candidate

- branch: `codex/consent-only-production-deploy`;
- production commit: `ef12fce6`;
- base: актуальный на момент подготовки `origin/main`;
- push в `main`: выполнен;
- workflow: `Site Deploy Production`;
- workflow run: `27882208220`;
- начало run: `2026-06-20 22:57:07 +03`;
- завершение run: `2026-06-20 22:57:58 +03`;
- conclusion: `failure`.

## AI-UP production safety

Production workflow для этого кандидата:

- жёстко задаёт `NEXT_PUBLIC_AIUP_PIXEL_ENABLED=false`;
- не читает и не записывает `AIUP_PIXEL_ID`;
- не добавляет production AI-UP ID, snippet, token или secret;
- не включает AI-UP project или sources.

Значения секретов и существующих env в отчёт и логи не выводились.

## Проверки до deploy

| Проверка | Результат |
|---|---|
| Нужные consent/pixel commits присутствуют в истории кандидата | PASS |
| Кандидат собран от актуального `origin/main` | PASS |
| Production AI-UP feature flag | PASS, жёстко `false` |
| Production AI-UP ID в workflow/runtime env | PASS, отсутствует |
| `npm ci` | PASS |
| TypeScript typecheck | PASS |
| Consent tests | PASS, 7/7 |
| Production build | PASS |
| `git diff --check` | PASS |

`npm ci` сообщил о существующих package vulnerabilities. Автоматический `npm audit fix` не выполнялся, поскольку это отдельный scope.

## GitHub Actions

Успешные шаги:

1. checkout;
2. setup Node.js;
3. install dependencies;
4. typecheck;
5. production build;
6. deploy secret presence validation;
7. runtime env preparation;
8. release archive preparation;
9. SSH host configuration.

Неуспешный шаг:

- `Upload release package`.

Пропущенные шаги:

- server release activation;
- public health check;
- CMS drift check;
- public mobile CTA check.

Локальный SSH-доступ тем же публичным адресом также не прошёл аутентификацию. Значения ключей и пользователей не раскрывались.

## Live-check после run

Проверка `https://pegasmebel.ru/` после завершения run:

| Проверка | Результат |
|---|---|
| Сайт отвечает HTTP 200 | PASS |
| Consent banner присутствует на live | FAIL, отсутствует |
| Новый AI-UP CSP source присутствует | FAIL, отсутствует |
| AI-UP script присутствует в HTML | PASS, отсутствует |
| AI-UP pixel включён | Нет |

Live-сайт продолжает обслуживать предыдущий release.

## Метрика

Метрика не менялась. Ранее обнаруженное CSP-наблюдение для `mc.yandex.com` остаётся отдельным existing issue и не исправлялось в этом deploy.

## Что не менялось

- AI-UP project;
- AI-UP sources и лимиты;
- production AI-UP ID;
- Bitrix24;
- Яндекс Директ и рекламный бюджет;
- настройки Метрики;
- staging environment.

## Blocker

Production deploy заблокирован SSH-аутентификацией GitHub Actions при `scp`.

Перед повторным run нужно:

1. проверить, что private deploy key в GitHub production environment соответствует public key на сервере;
2. проверить SSH user и права на вход;
3. не менять AI-UP env;
4. повторить workflow только после исправления deploy access.

## Можно ли переходить к следующему preflight перед AI-UP activation

**Нет.**

Сначала consent interface должен быть фактически активирован на production и пройти live desktop/mobile QA. После этого нужен отдельный AI-UP activation preflight.
