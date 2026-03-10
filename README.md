# Title: Kitchen_V repository
**Purpose:** Главный репозиторий проекта: сайт, документы по маркетингу, CRM и управлению проектом.  
**Owner:** Вы.  
**Last updated:** 2026-03-10

## Что здесь главное

Если смотреть только на запуск сайта, главный путь такой:

- `promotion/site`

Именно там теперь лежит:

- сайт на `Next.js`
- CMS-слой на hosted `Supabase`
- API лидов и событий

## Как сейчас устроен сайт

- `promotion/site/web/unpacked_v0` — эталонный макет из `v0`
- `promotion/site` — боевая управляемая копия этого макета
- `promotion/site/legacy/express` — старая Express-реализация, оставленная как legacy

Практически это значит:

- дизайн и структура взяты из `v0`
- тексты, навигация, секции и картинки теперь могут идти из `Supabase`
- лиды и события тоже сохраняются в `Supabase`

## Быстрый локальный запуск сайта

```bash
cd /Users/maximisaev/repos/Kitchen_V/promotion/site
npm install
cp .env.example .env
npm run dev
```

Открыть:

- `http://localhost:3000/`

Проверка API:

- `http://localhost:3000/api/health`
- `http://localhost:3000/api/cms/bootstrap`

## Что нужно заполнить в `.env`

Файл-шаблон:

- `promotion/site/.env.example`

Минимум для CMS:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Опционально для будущего CRM:

- `CRM_WEBHOOK_URL`
- `BITRIX24_WEBHOOK_URL`

## Как подключить Supabase

1. Создать hosted-проект в Supabase
2. Взять `Project URL` и `anon public key`
3. Вставить их в `promotion/site/.env`
4. Выполнить в `Supabase SQL Editor`:
   - `promotion/site/supabase/schema.sql`
   - `promotion/site/supabase/cms_seed.sql`
5. Перезапустить локальный сайт

Если всё подключено правильно:

- `/api/health` покажет `supabase_enabled: true`
- `/api/cms/bootstrap` покажет, что контент читается из CMS

## Команды сайта

```bash
cd /Users/maximisaev/repos/Kitchen_V/promotion/site
npm run dev
npm run build
npm run typecheck
```

## GitHub

Работа с GitHub уже настроена через SSH на этом Mac.

Это значит:

- я могу делать `commit` и `push`
- вам не нужно каждый раз вводить пароль
- если понадобится новая ветка, я создам её и объясню, что произошло

## Где лежат чувствительные доступы

Секреты не хранятся в Git.

Текущий пароль Supabase Postgres сохранён в `macOS Keychain`:

- service: `Kitchen_V Supabase Postgres`
- account: `postgres`

Найти его на этом Mac можно через `Keychain Access` или командой:

```bash
security find-generic-password -s "Kitchen_V Supabase Postgres" -a "postgres" -g
```
