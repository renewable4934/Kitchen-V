# Kitchen_V Site (promotion/site)

Это основной веб-проект: Express-сервер + статические страницы + API для лидов и аналитики.

## Что делает проект

- Отдает страницы лендингов (`/kuhni-rostov`, `/shkafy-rostov` и др.)
- Принимает лиды: `POST /api/lead`
- Принимает аналитические события: `POST /api/event`
- Отдает health-check: `GET /health`

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
- `DEFAULT_CITY`
- `CONTACT_PHONE`
- `WHATSAPP_PHONE`
- `CRM_WEBHOOK_URL` (опционально)
- `BITRIX24_WEBHOOK_URL` (опционально)

Если webhook не задан, лиды сохраняются локально в `data/*.ndjson`.

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
