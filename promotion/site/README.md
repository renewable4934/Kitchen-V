# Kitchen_V Site (promotion/site)

Это основной веб-проект: Express-сервер + статические страницы + API для лидов и аналитики.

## Что делает проект

- Отдает страницы лендингов (`/kuhni-rostov`, `/shkafy-rostov` и др.)
- Принимает лиды: `POST /api/lead`
- Принимает аналитические события: `POST /api/event`
- Отдает health-check: `GET /health`
- Может сохранять лиды и события в hosted Supabase без отдельной админки
- Может читать контент страниц и общие настройки из Supabase как из простой CMS

## Быстрый запуск

```bash
npm install
cp .env.example .env
npm run dev
```

Открыть:

- `http://localhost:3000`

## Переменные окружения

Шаблон:

- `.env.example`

Ключевые поля:

- `PORT`
- `NODE_ENV`
- `SUPABASE_URL` (опционально, но нужен для Supabase)
- `SUPABASE_ANON_KEY` (опционально, но нужен для Supabase)
- `DEFAULT_CITY`
- `CONTACT_PHONE`
- `WHATSAPP_PHONE`
- `CRM_WEBHOOK_URL` (опционально)
- `BITRIX24_WEBHOOK_URL` (опционально)

Если Supabase не настроен, сайт все равно работает, а лиды/события сохраняются локально в `data/*.ndjson`.

## Как подключить hosted Supabase

1. Создайте проект в Supabase Cloud.
2. Откройте `Project Settings -> API`.
3. Скопируйте:
   - `Project URL` -> в `SUPABASE_URL`
   - `anon public key` -> в `SUPABASE_ANON_KEY`
4. Откройте SQL Editor в Supabase.
5. Выполните SQL из файла:
   - `supabase/schema.sql`
6. Затем выполните SQL из файла:
   - `supabase/cms_seed.sql`
7. После этого перезапустите локальный сервер:

```bash
npm run dev
```

Проверка:

- `GET /health` покажет `supabase_enabled: true`, если переменные окружения заданы.
- `GET /api/cms/bootstrap?page=kuhni-rostov` вернет CMS-контент для страницы.

Если в SQL Editor в конце показывается `false`, это не всегда ошибка. Важнее, чтобы не было красного сообщения об ошибке и чтобы таблицы появились в `Table Editor`.

## Команды

```bash
npm run dev    # запуск в режиме разработки
npm start      # обычный запуск
npm test       # API тесты
```

## Важно перед публикацией

- Не коммитьте `.env` и реальные ключи.
- Проверьте webhook CRM (если хотите отправку лидов в CRM).
- Убедитесь, что тесты проходят.
