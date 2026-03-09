# Title: Kitchen_V Project Index
**Purpose:** Человеческая карта проекта: где лежат материалы, зачем они нужны и что делать дальше.  
**Owner:** Вы (основной пользователь), команда проекта (исполнители).  
**Last updated:** 2026-03-05

## Project status
1. Структура проекта приведена к единым сущностям: promotion, analytics, sales, crm, account-management, project-management, archive.
2. Сайт и технические материалы перенесены в `promotion/site/`.
3. Исследования рынка перенесены в `analytics/` по смысловым папкам.
4. CRM-документы и сырые лиды/события перенесены в `crm/architecture/`.
5. Ежедневные карточки перенесены в `project-management/daily-plan-fact/` с единым именованием `plan-fact-YYYY-MM-DD.md`.
6. Клиентские презентации и материалы согласования перенесены в `account-management/approvals/`.
7. Старые/временные контейнеры и шаблоны убраны в `archive/`.
8. Ближайший фокус: поддерживать актуальность `plan-fact` и раз в неделю проводить гигиену архива.
9. Добавлена human zone `kitchen_obsidian/` для двусторонней синхронизации категорий с Obsidian (без удаления данных).
10. Автосинхронизация включена через `launchd` каждые 15 минут для `kitchen_obsidian/vault/` и `kitchen_obsidian/local-zone/`.
11. Старый Anytype-контур выведен из active-зоны и перенесен в `archive/legacy-anytype/`.

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

## promotion
Зачем сущность: привлечение лидов через сайт и рекламные каналы.

### Entry
- **Path:** `promotion/site/`
- **Purpose (RU):** Основной код сайта, backend/API, документация по интеграциям и web-артефакты.
- **Trigger:** Перенос всех материалов сайта в единую папку сайта.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active
- **Next step:** Вести изменения сайта только внутри этой папки.

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
