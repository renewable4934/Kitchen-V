# Tilda Integration Guide

Если фронт остается в Tilda, этот проект можно использовать как backend API.

## 1) Размещение backend

- Развернуть проект на VPS/Render/Railway.
- Настроить домен API (например `api.yourdomain.ru`) и SSL.

## 2) Подключение форм Tilda

В Zero Block / HTML Block отправлять данные в:
- `POST https://api.yourdomain.ru/api/lead`

Тело запроса должно содержать:
- `funnel_type`: `kitchen` или `wardrobe`
- `name`, `phone`, `city`
- `utm_*`, `landing_url`, `client_id`

## 3) События аналитики

По действиям на фронте отправлять:
- `POST /api/event`

Рекомендуемые триггеры:
- просмотр первого экрана -> `view_offer`
- клик по телефону -> `click_call`
- старт квиза -> `start_quiz`
- отправка формы -> `submit_lead`
- клик WhatsApp -> `open_whatsapp`

## 4) Bitrix24

Добавить в `.env`:

```env
BITRIX24_WEBHOOK_URL=https://<portal>.bitrix24.ru/rest/<user>/<key>/crm.lead.add.json
```

## 5) Проверка

- Отправьте тестовую форму с UTM-метками
- Убедитесь, что лид появился в Bitrix24 и в `data/leads.ndjson`
- Убедитесь, что события пишутся в `data/events.ndjson`
