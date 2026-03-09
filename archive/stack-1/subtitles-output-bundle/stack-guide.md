# Рекомендуемый стек автора

1. Cursor как основной AI-редактор (Ask/Agent/Plan).
2. JavaScript + Next.js.
3. Git + GitHub.
4. Vercel (деплой, preview-ветки main/dev).
5. v0 (генерация UI-компонентов).
6. Supabase: Postgres + Storage + Auth + RLS.
7. Supabase CLI + MCP + Cursor Rules.
8. Supabase UI Library (Auth, Dropzone).
9. Дополнительно: lucide-react и DnD-библиотека.

# Короткий гайд по подходу

1. Создать Next.js проект через pnpm, запустить локально.
2. Подключить Git/GitHub.
3. Подключить GitHub к Vercel и проверить автодеплой.
4. Работать через main/dev, фичи собирать в dev.
5. Генерировать UI по компонентам (v0), дорабатывать в Cursor.
6. Делать частые commit/push и проверять preview.
7. Подключить Supabase и переменные окружения.
8. Включить авторизацию (закрытый раздел).
9. Перенести фото в Storage, метаданные и порядок — в таблицу Postgres.
10. Сделать админку: reorder, hide/show, delete, upload через Dropzone.

# Суть

- Не генерировать весь сайт одним промптом: собирать по компонентам.
- Идти маленькими итерациями с частыми коммитами.
- Связка Cursor + Vercel + Supabase даёт быстрый и управляемый цикл разработки.
