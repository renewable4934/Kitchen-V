# Kitchen_V — понятный старт для первого запуска

Этот репозиторий содержит рабочий сайт в папке `promotion/site` и дополнительные бизнес-материалы.

## Что здесь главное

Основной запускаемый проект:

- `promotion/site` — Node.js + Express сайт (лендинги + API для лидов и событий).

Дополнительно:

- `promotion/site/web/unpacked_v0` — архивный экспорт из v0 (отдельный Next.js проект, сейчас не основной).
- Остальные папки в корне (`analytics`, `sales`, `crm` и т.д.) — документы и операционные материалы.

## Как сейчас устроен проект

- `promotion/site/web/unpacked_v0` — это макет из v0, который удобно использовать как визуальный референс.
- `promotion/site` — это реальный кодовый проект, который можно развивать аккуратно и подключать к внешним сервисам.
- Supabase подключается к `promotion/site` как hosted backend для хранения лидов и событий.

Это значит: v0 сейчас лучше считать не "боевым приложением", а источником дизайна и контента, а рабочую управляемую копию разумно собирать в основном проекте.

## Минимальные требования

- Node.js `18+`
- npm

Проверить версии:

```bash
node -v
npm -v
```

## Быстрый запуск локально (3 шага)

```bash
cd promotion/site
npm install
cp .env.example .env
npm run dev
```

Сайт откроется на:

- `http://localhost:3000`

Полезные URL:

- `http://localhost:3000/kuhni-rostov`
- `http://localhost:3000/shkafy-rostov`
- `http://localhost:3000/health`

## Переменные окружения (`.env`)

Шаблон уже есть в:

- `promotion/site/.env.example`

Что важно:

- Не храните реальные ключи и вебхуки в Git.
- Для Supabase заполните:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
- Для CRM заполните **одну** из переменных:
  - `CRM_WEBHOOK_URL`
  - `BITRIX24_WEBHOOK_URL`

Если Supabase пока не настроен, сайт продолжит работать и будет складывать лиды/события локально в `promotion/site/data/*.ndjson`.

## Supabase: что именно было добавлено

- Пакет `@supabase/supabase-js` в `promotion/site`.
- Переиспользуемый серверный клиент Supabase.
- Поддержка env-переменных `SUPABASE_URL` и `SUPABASE_ANON_KEY`.
- Мягкая интеграция в API:
  - `POST /api/lead` сохраняет лид локально и пытается записать его в Supabase.
  - `POST /api/event` сохраняет событие локально и пытается записать его в Supabase.
- SQL-шаблон для создания таблиц:
  - `promotion/site/supabase/schema.sql`

## Как подключить hosted Supabase пошагово

1. Создайте проект в Supabase.
2. Откройте `Project Settings -> API`.
3. Возьмите:
   - `Project URL`
   - `anon public key`
4. Откройте файл `promotion/site/.env`.
5. Добавьте:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
```

6. В Supabase откройте `SQL Editor`.
7. Выполните SQL из файла:
   - `promotion/site/supabase/schema.sql`
8. Затем выполните SQL из файла:
   - `promotion/site/supabase/cms_seed.sql`
9. Перезапустите сайт:

```bash
cd promotion/site
npm run dev
```

10. Проверьте:
   - `http://localhost:3000/health`
   - `http://localhost:3000/api/cms/bootstrap?page=kuhni-rostov`

Если все подключено правильно, там будет `supabase_enabled: true`.
Если в SQL Editor вы видите в конце `false`, это еще не значит, что запрос сломан. Для `drop policy if exists` и похожих команд такое бывает. Признак успеха: нет красной ошибки, а таблицы и строки появились в `Table Editor`.

## Команды проекта

Запуск разработки:

```bash
cd promotion/site
npm run dev
```

Прод-запуск (локально):

```bash
cd promotion/site
npm start
```

Тесты:

```bash
cd promotion/site
npm test
```

## Подготовка к GitHub (пошагово)

Если у вас уже есть пустой репозиторий на GitHub:

```bash
cd /Users/maximisaev/repos/Kitchen_V
git init
git add .
git commit -m "Initial clean project setup"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

Если репозиторий уже инициализирован, пропустите `git init`.

## Что уже сделано для безопасного коммита

- Обновлен `.gitignore` для Node.js, env-файлов, локальных данных и артефактов сборки.
- Секреты не добавлены.
- `.env.example` содержит только шаблонные значения.

## Важное предположение

Этот README предполагает, что для запуска и деплоя вы используете именно `promotion/site` как основной продуктовый сайт.
