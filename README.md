# Kitchen_V — понятный старт для первого запуска

Этот репозиторий содержит рабочий сайт в папке `promotion/site` и дополнительные бизнес-материалы.

## Что здесь главное

Основной запускаемый проект:

- `promotion/site` — Node.js + Express сайт (лендинги + API для лидов и событий).

Дополнительно:

- `promotion/site/web/unpacked_v0` — архивный экспорт из v0 (отдельный Next.js проект, сейчас не основной).
- Остальные папки в корне (`analytics`, `sales`, `crm` и т.д.) — документы и операционные материалы.

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
- Для CRM заполните **одну** из переменных:
  - `CRM_WEBHOOK_URL`
  - `BITRIX24_WEBHOOK_URL`

Если обе пустые, лиды сохраняются только локально в `promotion/site/data/*.ndjson`.

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
