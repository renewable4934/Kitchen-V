# Title: promotion/site
**Purpose:** Основной код сайта: Next.js-лендинг, Supabase CMS, API лидов и событий.  
**Owner:** Вы / команда проекта.  
**Last updated:** 2026-03-10

## Что это теперь такое

`promotion/site` — это новый основной сайт на `Next.js App Router`.

Что внутри:

- точная визуальная копия лендинга из `v0`
- CMS-слой на hosted `Supabase`
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
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
```

### Шаг 2. Выполнить SQL в Supabase

Сначала:

- `promotion/site/supabase/schema.sql`

Потом:

- `promotion/site/supabase/cms_seed.sql`

Выполнять нужно по очереди в `Supabase -> SQL Editor -> New query -> Run`.

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

## Как сайт использует Supabase

Схема простая:

1. `cms_sites` хранит общие настройки сайта
2. `cms_pages` хранит meta страницы
3. `cms_sections` хранит содержимое секций лендинга
4. `cms_navigation` хранит пункты меню
5. `cms_assets` хранит URL картинок и alt-тексты
6. `leads` хранит заявки
7. `events` хранит события аналитики

Это позволяет:

- менять тексты без правки кода
- менять ссылки и CTA через CMS
- менять изображения через `cms_assets`
- собирать лиды и события в одной базе

## Команды

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

## Что уже проверено

- `npm run typecheck`
- `npm run build`

Обе команды должны проходить локально на текущем состоянии проекта.
