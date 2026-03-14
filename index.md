# Title: Kitchen_V Project Index
**Purpose:** Человеческая карта проекта: где лежат материалы, зачем они нужны и что делать дальше.  
**Owner:** Вы (основной пользователь), команда проекта (исполнители).  
**Last updated:** 2026-03-14

## Project status
1. Структура проекта приведена к единым сущностям: promotion, analytics, sales, crm, account-management, project-management, archive.
2. Сайт в `promotion/site/` переведен на Next.js и использует Supabase как CMS и хранилище лидов/событий.
3. Исследования рынка перенесены в `analytics/` по смысловым папкам.
4. CRM-документы и сырые лиды/события перенесены в `crm/architecture/`.
5. Ежедневные карточки перенесены в `project-management/daily-plan-fact/` с единым именованием `plan-fact-YYYY-MM-DD.md`.
6. Клиентские презентации и материалы согласования перенесены в `account-management/approvals/`.
7. Старые/временные контейнеры и шаблоны убраны в `archive/`.
8. Ближайший фокус: довести управляемость сайта через Supabase, затем подключать Bitrix, Яндекс Директ и VK Ads.
9. Добавлена human zone `kitchen_obsidian/` для двусторонней синхронизации категорий с Obsidian (без удаления данных).
10. Автосинхронизация включена через `launchd` каждые 15 минут для `kitchen_obsidian/vault/` и `kitchen_obsidian/local-zone/`.
11. Старый Anytype-контур выведен из active-зоны и перенесен в `archive/legacy-anytype/`.
12. Добавлен deploy-only контур для `promotion/site`: GitHub Actions, server ops templates и migration discipline для Supabase.
13. Сайт теперь проектируется как две среды: `staging` и `production`, с hosted Supabase как источником контента и Aeza как runtime-сервером.
14. На сервере включён базовый perimeter: `Caddy`, `fail2ban`, `ufw` и минимальный SSH hardening без отключения текущего парольного входа.

## Core files
Зачем сущность: базовые документы-навигаторы, которые поддерживают понятность проекта.

### Entry
- **Path:** `AGENTS.md`
- **Purpose (RU):** Правила работы по проекту и обязательные принципы ведения структуры.
- **Trigger:** Фиксация единого стандарта работы.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `index.md`
- **Purpose (RU):** Карта проекта для быстрого понимания, где что лежит и зачем.
- **Trigger:** Необходимость единой точки входа для нетехнического пользователя.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `glossary.md`
- **Purpose (RU):** Объяснение терминов маркетинга, продаж и CRM простым языком.
- **Trigger:** Снижение путаницы в терминах и метриках.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `kitchen_obsidian/`
- **Purpose (RU):** Человеко-ориентированная зона на Obsidian: vault, local-zone и registry синхронизации.
- **Trigger:** Переход с Anytype на Obsidian без потери данных.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active
- **Next step:** Поддерживать категории в актуальном состоянии и контролировать логи sync.

### Entry
- **Path:** `scripts/obsidian_sync.py`
- **Purpose (RU):** Скрипт импорта и двусторонней синхронизации `kitchen_obsidian/vault` ↔ `kitchen_obsidian/local-zone`.
- **Trigger:** Нужна автоматическая синхронизация категорий без потери данных.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `kitchen_obsidian/setup-obsidian-sync.md`
- **Purpose (RU):** Пошаговая инструкция «за ручку» по импорту архива, запуску и проверке синхронизации.
- **Trigger:** Нужно настроить Obsidian и автосинк без технической путаницы.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `scripts/install_obsidian_sync_launchd.sh`
- **Purpose (RU):** Устанавливает и запускает launchd задачу двустороннего sync каждые 15 минут.
- **Trigger:** Нужен регулярный sync `kitchen_obsidian/vault` ↔ `kitchen_obsidian/local-zone`.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `.github/workflows/site-ci.yml`
- **Purpose (RU):** Автоматическая проверка сайта перед релизом: установка зависимостей, typecheck и production build только для `promotion/site`.
- **Trigger:** Потребность перестать выкладывать сайт на сервер без автоматической проверки.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active

### Entry
- **Path:** `.github/workflows/site-deploy-staging.yml`
- **Purpose (RU):** Автодеплой ветки `staging` на staging-инстанс сайта на сервере Aeza.
- **Trigger:** Появление отдельного тестового контура перед боевым релизом.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active
- **Next step:** Заполнить GitHub environment `staging` секретами и SSH-доступом deploy-user.

### Entry
- **Path:** `.github/workflows/site-deploy-production.yml`
- **Purpose (RU):** Автодеплой ветки `main` на production-инстанс сайта на сервере Aeza.
- **Trigger:** Нужен повторяемый боевой релиз без ручного SSH-copy/paste.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active
- **Next step:** Заполнить GitHub environment `production` секретами и healthcheck URL.

### Entry
- **Path:** `.github/workflows/site-cms-backup.yml`
- **Purpose (RU):** Делает backup CMS-таблиц из hosted Supabase в GitHub Actions artifact.
- **Trigger:** Контент сайта живёт в Supabase и его нужно сохранять без превращения в git-коммиты.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active
- **Next step:** Включить secrets `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` для production и staging.

## promotion
Зачем сущность: привлечение лидов через сайт и рекламные каналы.

### Entry
- **Path:** `promotion/site/`
- **Purpose (RU):** Основной код сайта: Next.js-лендинг, Supabase CMS, API лидов и событий.
- **Trigger:** Перенос всех материалов сайта в единую папку сайта.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-14
- **Lifecycle:** Active
- **Next step:** Подать сайт на пересмотр браузерной репутации после выкладки реальных контактов, `/privacy`, `robots.txt` и `sitemap.xml`.

### Entry
- **Path:** `promotion/site/app/privacy/page.tsx`
- **Purpose (RU):** Реальная страница политики конфиденциальности для сайта, чтобы пользователь и браузер видели условия обработки данных.
- **Trigger:** На новом домене отсутствовала живая страница `/privacy`, а это ухудшало сигналы доверия.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-14
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/app/robots.ts`
- **Purpose (RU):** Отдаёт `robots.txt` для индексации сайта и базовых технических сигналов доверия.
- **Trigger:** На live `robots.txt` отдавал `404`.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-14
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/app/sitemap.ts`
- **Purpose (RU):** Отдаёт `sitemap.xml` с основными URL сайта.
- **Trigger:** На live `sitemap.xml` отдавал `404`.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-14
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/README.md`
- **Purpose (RU):** Пошаговая инструкция по запуску сайта, подключению Supabase и проверке API.
- **Trigger:** Переход сайта с Express на Next.js и появление CMS-слоя.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/nanabanana-prompts.md`
- **Purpose (RU):** Отдельный рабочий набор промтов для генерации изображений кухонь, шагов конструктора и lifestyle-сцен сайта.
- **Trigger:** Понадобился понятный единый документ для дальнейшей генерации новых визуалов.
- **Owner:** Вы.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active
- **Next step:** Использовать промты при следующем обновлении изображений сайта.

### Entry
- **Path:** `promotion/site/supabase/schema.sql`
- **Purpose (RU):** SQL-схема таблиц Supabase для CMS сайта, лидов и аналитических событий.
- **Trigger:** Потребность управлять лендингом через Supabase и хранить заявки централизованно.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-10
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/supabase/migrations/20260311160000_apply_landing_content_updates.sql`
- **Purpose (RU):** Фиксирует в репозитории текущее состояние боевого контента CMS, которое уже было применено в hosted Supabase.
- **Trigger:** Обнаружен drift между remote Supabase и локальной папкой `migrations/`.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active
- **Next step:** Дальше любые schema/content migrations оформлять только через новые SQL-файлы в репозитории.

### Entry
- **Path:** `promotion/site/supabase/cms_seed.sql`
- **Purpose (RU):** Стартовое наполнение Supabase точным контентом и ссылками на изображения из текущего лендинга.
- **Trigger:** Нужно быстро развернуть CMS без ручного набора каждой секции.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-10
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/legacy/express/`
- **Purpose (RU):** Старая Express-версия сайта, оставленная как история и точка сравнения при миграции.
- **Trigger:** Переход на Next.js без потери прежней логики и файлов.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-10
- **Lifecycle:** Active
- **Next step:** Не развивать дальше, использовать только как reference до финальной чистки.

### Entry
- **Path:** `promotion/site/public/images/configurator/`
- **Purpose (RU):** Локальные изображения для карточек выбора в конструкторе, чтобы шаги опросника показывались с картинками.
- **Trigger:** По ТЗ в конструктор добавлены визуальные карточки для шагов выбора.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/public/images/portfolio/`
- **Purpose (RU):** Дополнительные фотографии кухонь для модальных окон проектов в портфолио.
- **Trigger:** По ТЗ у каждого проекта появилась собственная галерея фото внутри модального окна.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/ops/bootstrap-server.sh`
- **Purpose (RU):** Скрипт первичной подготовки Aeza-сервера: установка Node.js, Caddy, fail2ban, ufw, структуры каталогов и deploy-user.
- **Trigger:** Переход с концепции Vercel на собственный runtime-сервер Aeza.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active
- **Next step:** Запустить на сервере после подтверждения модели staging/prod и добавить SSH-ключ deploy-user.

### Entry
- **Path:** `promotion/site/ops/deploy-release.sh`
- **Purpose (RU):** Серверный скрипт выкладки новой версии сайта с проверкой `/api/health` и rollback при неуспехе.
- **Trigger:** Нужен безопасный релиз без ручной последовательности команд через SSH.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/ops/nginx-site.conf.template`
- **Purpose (RU):** Шаблон Caddy-конфига для домена сайта, reverse proxy и локального порта приложения.
- **Trigger:** На одном сервере нужно уметь поднять production и staging раздельно и понятно.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/ops/systemd-site.service.template`
- **Purpose (RU):** Шаблон systemd-сервиса для фонового запуска Next.js и автоперезапуска после сбоев.
- **Trigger:** Сайт должен работать как системный сервис, а не как команда в открытом SSH-окне.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-11
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/yandex-direct/ads-checklist.md`
- **Purpose (RU):** Чеклист запуска и оптимизации рекламы (Яндекс + VK).
- **Trigger:** Потребность в едином стандарте запуска рекламных кампаний.
- **Owner:** Вы / маркетолог.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active
- **Next step:** Держать чеклист актуальным после каждого запуска.

## analytics
Зачем сущность: исследования рынка, конкурентов и поведения клиентов.

### Entry
- **Path:** `analytics/competitors/companies-master-2026-02-19.csv`
- **Purpose (RU):** База конкурентов для анализа рынка.
- **Trigger:** Исследование локального рынка кухонь.
- **Owner:** Вы / аналитик.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `analytics/customer-behavior/buyer-criteria-2026-02-19.md`
- **Purpose (RU):** Критерии выбора клиента при покупке кухни.
- **Trigger:** Подготовка офферов и рекламных сообщений.
- **Owner:** Вы / маркетолог.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `analytics/competitor-marketing-sales/`
- **Purpose (RU):** Методики, расчеты и источники по объему рынка и долям.
- **Trigger:** Необходимость обосновать бюджет и KPI на данных.
- **Owner:** Вы / аналитик.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active
- **Next step:** Дополнять новыми измерениями при обновлении исследования.

## sales
Зачем сущность: управление процессом продаж и менеджерами.

### Entry
- **Path:** `sales/`
- **Purpose (RU):** Зарезервированная структура под звонки, гайды и договоры менеджеров.
- **Trigger:** Приведение проекта к целевой структуре.
- **Owner:** Вы / отдел продаж.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active
- **Next step:** Добавлять материалы продаж только в подпапки этой сущности.

## crm
Зачем сущность: архитектура CRM, доступы и процесс обработки лидов.

### Entry
- **Path:** `crm/architecture/crm-architecture.md`
- **Purpose (RU):** Описание этапов воронки, обязательных полей и SLA.
- **Trigger:** Нужна единая CRM-логика для маркетинга и продаж.
- **Owner:** Вы / CRM-ответственный.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `crm/architecture/leads.ndjson`
- **Purpose (RU):** Хранилище сырого потока лидов из сайта/API.
- **Trigger:** Логирование входящих заявок для контроля и аудита.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `crm/architecture/events.ndjson`
- **Purpose (RU):** Хранилище событий поведения пользователя на сайте.
- **Trigger:** Сквозная аналитика источников и конверсий.
- **Owner:** Вы / аналитик.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `crm/access/`
- **Purpose (RU):** Папка для инструкций по доступам. Сам пароль Supabase Postgres хранится не в Git, а в macOS Keychain.
- **Trigger:** Нужен безопасный способ хранить доступ к базе и чтобы его можно было найти позже без публикации секрета.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-10
- **Lifecycle:** Active
- **Next step:** Для поиска пароля использовать Keychain запись `Kitchen_V Supabase Postgres` с account `postgres`.

## account-management
Зачем сущность: работа с клиентом, согласования и материалы по договору.

### Entry
- **Path:** `account-management/client-calls/client-kickoff-questionnaire-2026-02-20.md`
- **Purpose (RU):** Опросник для стартового созвона и фиксации входных данных.
- **Trigger:** Проведение kick-off и сбор обязательных вводных.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/approvals/`
- **Purpose (RU):** Презентации и материалы на согласование с клиентом.
- **Trigger:** Потребность в прозрачном согласовании плана и сметы.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/contract/`
- **Purpose (RU):** Документы, связанные с условиями работ и согласиями.
- **Trigger:** Необходимость хранить юридически значимые тексты в одном месте.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

## project-management
Зачем сущность: планирование, контроль выполнения, бюджет и метрики проекта.

### Entry
- **Path:** `project-management/daily-plan-fact/`
- **Purpose (RU):** Ежедневный ритм план-факт и фиксация блокеров/фокуса.
- **Trigger:** Требование ежедневного управляемого цикла работы.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active
- **Next step:** Каждый день закрывать фактом и планом на следующий день.

### Entry
- **Path:** `project-management/roadmap/`
- **Purpose (RU):** Дорожные карты, статус и периодные планы проекта.
- **Trigger:** Координация работ по неделям и этапам.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `project-management/budget/project-budget-2026-02-20-2026-03-31.md`
- **Purpose (RU):** Смета услуг и медиабюджетов на период.
- **Trigger:** Финансовое планирование проекта.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `project-management/finance-tracking/`
- **Purpose (RU):** KPI и ежедневный трекинг метрик по проекту.
- **Trigger:** Контроль эффективности по цифрам.
- **Owner:** Вы / аналитик.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `project-management/backlog/`
- **Purpose (RU):** Журнал решений, рисков, внутренних планов и операционных реестров.
- **Trigger:** Сохранение управленческого контекста проекта.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

## archive
Зачем сущность: хранение неактуальных или вспомогательных материалов без удаления.

### Entry
- **Path:** `archive/legacy-structure/`
- **Purpose (RU):** Старые контейнеры (`docs`, `data`, `presentations`, `research`, `tmp-docs`) после миграции структуры.
- **Trigger:** Перестройка проекта под новую модель хранения.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Archived
- **Next step:** Раз в неделю проверять и решать, что оставить в архиве.

### Entry
- **Path:** `archive/stack-1/`
- **Purpose (RU):** Внешние учебные материалы, не относящиеся к текущему боевому контуру проекта.
- **Trigger:** Очистка рабочей структуры от вспомогательных обучающих артефактов.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Archived

### Entry
- **Path:** `archive/legacy-anytype/`
- **Purpose (RU):** Деактивированный контур Anytype (скрипты, конфиги и human-zone), сохраненный без удаления для истории.
- **Trigger:** Переход на Obsidian как новую human-zone систему.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Archived

### Entry
- **Path:** `archive/legacy-anytype/20260305T181707Z/kitchen_anytype/`
- **Purpose (RU):** Бывшая human-zone `kitchen_anytype`, переведенная в архив после миграции на Obsidian.
- **Trigger:** Закрытие активного Anytype-контура и сохранение данных без удаления.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Archived
