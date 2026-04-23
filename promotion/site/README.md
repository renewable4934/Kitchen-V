# Title: promotion/site
**Purpose:** Основной код сайта: Next.js-лендинг, Supabase CMS, API лидов и событий.  
**Owner:** Вы / команда проекта.  
**Last updated:** 2026-03-26

## Что это теперь такое

`promotion/site` — это новый основной сайт на `Next.js App Router`.

Что внутри:

- точная визуальная копия лендинга из `v0`
- CMS-слой на hosted `Supabase`
- закрытая CMS-админка `/admin` на Supabase Auth
- production/staging pipeline через `GitHub Actions`
- API:
  - `POST /api/lead`
  - `POST /api/event`
  - `GET /api/health`
- старая Express-версия сохранена в:
  - `promotion/site/legacy/express`

Это значит:

- `web/unpacked_v0` — эталонный макет
- `promotion/site` — боевая управляемая версия
- `legacy/express` — старая реализация, оставленная для истории и сравнения

## Источник правды

Для этого проекта правило теперь такое:

1. `GitHub` хранит код сайта, SQL migrations, deploy-конфигурацию и базовые seed-файлы.
2. hosted `Supabase` хранит CMS-контент, лиды и события.
3. `Aeza` исполняет приложение и держит `Caddy` + `systemd`, но не является местом редактирования кода.

Важно:

- контент из `Supabase` не превращается автоматически в git-коммиты
- любые изменения схемы базы должны попадать в `promotion/site/supabase/migrations/`
- deploy на сервер должен брать только `promotion/site/`, а не весь workspace

## Что нужно для запуска

- Node.js `20.9+`
- npm

Проверка:

```bash
node -v
npm -v
```

## Быстрый запуск локально

```bash
cd /Users/maximisaev/repos/Kitchen_V/promotion/site
npm install
cp .env.example .env
npm run dev
```

Открыть:

- `http://localhost:3000/`
- `http://localhost:3000/admin/login`

Полезные URL:

- `http://localhost:3000/api/health`
- `http://localhost:3000/api/cms/bootstrap`

Старые URL теперь должны уводить на `/`:

- `/kuhni-rostov`
- `/shkafy-rostov`
- `/portfolio`
- `/reviews`
- `/about`
- `/contacts`
- `/privacy`

## Как подключить Supabase CMS

### Шаг 1. Вставить ключи в `.env`

Откройте:

- `promotion/site/.env`

Добавьте:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

Что это значит:

- `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` нужны браузеру для входа в `/admin`
- `SUPABASE_ANON_KEY` используется для безопасного публичного чтения CMS
- `SUPABASE_SERVICE_ROLE_KEY` нужен серверным API-роутам для записи лидов и событий без зависимости от permissive anon policy
- этот же `SUPABASE_SERVICE_ROLE_KEY` нужен owner-панели CMS для создания пользователей и загрузки изображений
- если `SUPABASE_SERVICE_ROLE_KEY` не задан, сайт временно использует `anon` fallback для записи, но для staging/production это нужно считать переходным режимом

### Шаг 2. Выполнить SQL в Supabase

Сначала:

- `promotion/site/supabase/schema.sql`

Потом:

- `promotion/site/supabase/cms_seed.sql`

Потом для админки и загрузки изображений:

- `promotion/site/supabase/migrations/20260326_add_admin_storage_and_policies.sql`

Выполнять нужно по очереди в `Supabase -> SQL Editor -> New query -> Run`.

### Шаг 2.1. Включить настройки Auth для CMS

В `Supabase -> Authentication -> Providers -> Email`:

- выключить `Confirm email`
- оставить вход только по `email + password`
- при необходимости выключить публичный `Signups`, если CMS не должна быть доступна извне

### Шаг 3. Перезапустить локальный сайт

```bash
cd /Users/maximisaev/repos/Kitchen_V/promotion/site
npm run dev
```

### Шаг 4. Проверить, что CMS подключилась

Откройте:

- `http://localhost:3000/api/health`
- `http://localhost:3000/api/cms/bootstrap`

Если всё хорошо:

- `supabase_enabled: true`
- в bootstrap будет `source: "supabase"` или частично `diagnostics.* = "supabase"`

### Шаг 5. Проверить CMS-админку

Откройте:

- `http://localhost:3000/admin/login`

Что уже есть в CMS MVP:

- вход по email и паролю без email confirmation
- `/admin` для редактирования контента сайта
- `/admin/users` только для `owner`
- загрузка изображений в bucket `cms-media`

## Как сайт использует Supabase

Схема простая:

1. `cms_sites` хранит общие настройки сайта
2. `cms_pages` хранит meta страницы
3. `cms_sections` хранит содержимое секций лендинга
4. `cms_navigation` хранит пункты меню
5. `cms_assets` хранит URL картинок и alt-тексты
6. `cms-media` bucket хранит изображения, загруженные из CMS
7. `leads` хранит заявки
8. `events` хранит события аналитики

Это позволяет:

- менять тексты без правки кода
- менять ссылки и CTA через CMS
- менять изображения через `cms_assets`
- управлять доступом редакторов и владельцев через Supabase Auth
- собирать лиды и события в одной базе

## Ветки и окружения

Целевая схема:

- `staging` -> staging окружение
- `main` -> production окружение
- Pull Request в `staging` или `main` -> только проверки
- Merge в `staging` -> staging deploy
- Merge в `main` -> production deploy

GitHub workflows лежат в:

- `.github/workflows/site-ci.yml`
- `.github/workflows/site-deploy-staging.yml`
- `.github/workflows/site-deploy-production.yml`
- `.github/workflows/site-cms-backup.yml`

## Что нужно в GitHub Environments

Для каждого окружения (`staging`, `production`) нужны secrets:

```bash
SSH_HOST=
SSH_PORT=22
SSH_USER=
SSH_PRIVATE_KEY=
APP_DIR=
APP_PORT=
APP_DOMAIN=
SERVICE_NAME=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRM_WEBHOOK_URL=
BITRIX24_WEBHOOK_URL=
HEALTHCHECK_URL=
```

Принцип:

- `APP_DIR`, `APP_PORT`, `APP_DOMAIN`, `SERVICE_NAME` разделяются по окружениям
- `SUPABASE_*` для staging и production должны указывать на разные hosted projects
- `SSH_PRIVATE_KEY` должен вести на deploy-user, а не на `root`

## Что лежит в ops

Файлы в `promotion/site/ops/` нужны для Aeza:

- `bootstrap-server.sh` — первичная подготовка сервера
- `deploy-release.sh` — безопасный выпуск новой версии
- `nginx-site.conf.template` — шаблон reverse proxy для `Caddy`
- `systemd-site.service.template` — шаблон systemd unit

Если staging и production живут на одном сервере, bootstrap запускается дважды с разными:

- `APP_NAME`
- `APP_DOMAIN`
- `APP_PORT`
- `SERVICE_NAME`

Что bootstrap делает на сервере:

- ставит `Node.js 20`, `Caddy`, `fail2ban`, `ufw`, `unattended-upgrades`
- включает базовый SSH hardening без отключения парольного входа
- открывает только `22`, `80`, `443`
- настраивает `Caddy` как reverse proxy перед приложением
- включает `fail2ban` для защиты SSH от перебора

## Backup CMS

Workflow `site-cms-backup.yml`:

- по расписанию сохраняет CMS-таблицы production в artifact
- вручную позволяет снять backup и для staging

Это нужно, чтобы `Supabase` оставался источником правды для контента, но без потери истории и без попытки превращать CMS-изменения в код.

## Source Of Truth

- `Git` хранит код, canonical fallback, seed и migrations.
- `Supabase` хранит live CMS content, но `contentVersion` сам по себе не доказывает, что строки внутри актуальны.
- `VPS` хранит только runtime release и не должен быть местом ручного редактирования сайта.

## CMS Drift Check

После deploy или CMS restore нужно прогонять live-проверку:

```bash
npm run check:cms-drift
```

Скрипт проверяет:

- `https://pegasmebel.ru/api/cms/bootstrap`
- публичный HTML `https://pegasmebel.ru`

И падает, если:

- вернулись `Оставить заявку`, `3D проект для Вас`, `Создайте свою кухню`, `ПМ`
- в HTML снова появился `zakazpegas.ru`
- в HTML снова появились hardcoded stale labels вроде `Неоклассика` или `Сканди-дзен`
- отсутствуют canonical строки вроде `Получить персональный расчет`, `Созидание замыслов`, `Свобода для полёта мечты`

## Change Protocol

- Любое изменение CMS начинается с export backup + checksum + rollback SQL/JSON.
- Любое изменение canonical контента в CMS сопровождается обновлением Git seed/migration.
- Любой deploy проверяет release id, health, bootstrap и public HTML expectations.
- Нельзя считать `contentVersion` достаточным доказательством актуальности CMS rows без bootstrap/html проверки.

## Команды

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run check:cms-drift
```

## Что появилось в CMS MVP

- `middleware.ts` защищает `/admin` и `/api/admin/*`
- `app/admin/` содержит экран входа, контентную CMS и owner-only управление пользователями
- `app/api/admin/` содержит защищённые endpoints сохранения CMS, asset upload и user management
- `components/admin/` содержит UI-слой CMS без отдельного второго приложения

## Что уже проверено

- `npm run typecheck`
- `npm run build`

Обе команды должны проходить локально на текущем состоянии проекта.
