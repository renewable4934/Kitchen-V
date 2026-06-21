# Title: Kitchen_V Project Index
**Purpose:** Человеческая карта проекта: где лежат материалы, зачем они нужны и что делать дальше.  
**Owner:** Вы (основной пользователь), команда проекта (исполнители).  
**Last updated:** 2026-06-09

## Project status
1. Структура проекта приведена к единым сущностям: promotion, analytics, sales, crm, account-management, project-management, archive.
2. Сайт в `promotion/site/` переведен на Next.js и использует Supabase как CMS и хранилище лидов/событий.
3. Исследования рынка перенесены в `analytics/` по смысловым папкам.
4. CRM-документы и сырые лиды/события перенесены в `crm/architecture/`.
5. Ежедневные карточки перенесены в `project-management/daily-plan-fact/` с единым именованием `plan-fact-YYYY-MM-DD.md`.
6. Клиентские презентации и материалы согласования перенесены в `account-management/approvals/`.
7. Старые/временные контейнеры и шаблоны убраны в `archive/`.
8. В `promotion/site` добавлена закрытая CMS-админка `/admin` с входом через Supabase Auth и ролями `owner` / `editor`.
9. `kitchen_obsidian/local-zone/` остаётся активной human-zone для локальной работы с материалами Pegas.
10. Контур Obsidian отключён: `kitchen_obsidian/vault/` очищен и больше не участвует в синхронизации.
11. Старый Anytype-контур выведен из active-зоны и перенесен в `archive/legacy-anytype/`.
12. Добавлен deploy-only контур для `promotion/site`: GitHub Actions, server ops templates и migration discipline для Supabase.
13. Сайт теперь проектируется как две среды: `staging` и `production`, с hosted Supabase как источником контента и Aeza как runtime-сервером.
14. На сервере включён базовый perimeter: `Caddy`, `fail2ban`, `ufw` и минимальный SSH hardening без отключения текущего парольного входа.
15. После локального CMS/localhost инцидента добавлен отдельный разбор цепочки сбоев и preventive changes для контура `repo -> Supabase CMS -> bootstrap -> UI`.
16. Теперь owner может создавать редакторов внутри CMS без почтового подтверждения, а изменения контента сохраняются сразу в Supabase.
17. Ближайший фокус: спокойно проверить UX CMS на реальных пользователях и только потом расширять её заявками, аналитикой и Telegram-уведомлениями.
18. Для Pegas активен только Plane-sync контур: защищённые страницы Plane и остальные зарегистрированные страницы тянутся в `kitchen_obsidian/local-zone`, а новые локальные markdown публикуются в Plane.
19. Подготовлен отдельный бюджет на апрель 2026: расчетный документ в `project-management/budget/` и PDF-презентация для клиента в `account-management/approvals/`.
20. Добавлен подтвержденный Stage 0 каркас `direct_ai_manager/` для безопасной AI-системы Яндекс Директ: пока только mock-данные, dry-run, guard layer и запрет реальных API/write-операций.
21. Добавлен Stage 0.5 для `direct_ai_manager/`: `.gitignore`, `SECURITY.md`, `STAGE_PLAN.md`, CLI-команда `security-check` и тесты защиты от случайной утечки секретов.
22. Первый тест Яндекс Директа для Pegas создан, получил первые клики, был остановлен после превышения дневного guard; local-only черновик чистки запросов показал высокий риск автотаргетинга и оставил фокус на ручном разборе без возобновления кампании.
23. Добавлен краткий summary-файл для продолжения работы по `direct_ai_manager` и Яндекс Директу в новом чате без потери контекста.
24. Для остановленной кампании Яндекс Директа добавлен Stage 3.18: локальный дизайн будущего cleanup/write-gate без API-запросов, без токенов и без разрешения на production write.
25. Добавлен Stage 3.19: локальный план аудита посадочной страницы и целей Метрики перед любым будущим перезапуском кампании.
26. Добавлен Stage 3.20: локальный шаблон ручного evidence по посадочной странице и целям Метрики перед любым будущим решением о перезапуске.
27. Заполнен Stage 3.20 evidence: перезапуск остаётся заблокирован из-за телефона ниже первого экрана и неподтверждённых form/messenger goals и UTM report visibility.
28. Добавлен Stage 3.21: локальный план улучшения CTA на посадочной, чтобы телефон или звонок были видны на первом экране перед любым будущим перезапуском.
29. Добавлен Stage 3.22: read-only проверка целей Метрики через API; она требует внешний env-файл, не вызывает Директ, не меняет сайт/Метрику и не печатает токены.
30. Подготовлен бюджет на июнь 2026: расчетный документ в `project-management/budget/` и клиентская презентация в `account-management/approvals/`.
31. Добавлен human-zone план управления Яндекс Директом до 30 июня 2026: рабочая Markdown-версия для проекта и PDF-версия для чтения владельцем.
32. Добавлен readonly-аудит AI-UP по проекту `Пегас`: кабинет безопасен для подготовки теста, но источники, интеграции и колл-центр пока не настроены.
33. Подготовлен readonly-список конкурентов-кандидатов для первого теста AI-UP: 15 источников, топ-5 сайтов, 7 телефонов-кандидатов и список источников, которые не стоит добавлять.
34. Проведена safe-mode проверка готовности Bitrix24 к будущей интеграции AI-UP: зафиксированы текущая CRM-структура, список нужных полей и главный блокер в виде непроверенных автоматизаций, поэтому CRM не менялась.
35. Проведен ручной UI-аудит Bitrix24 по автоматизациям: в сделках подтверждены активные роботы с уведомлениями, контролем и планированием звонков, поэтому тестовые AI-UP сущности создавать пока небезопасно.
36. Подготовлен безопасный план будущего подключения AI-UP к Bitrix24: сравнение вариантов, рекомендованный controlled webhook gateway, список нужных полей, требования к новому webhook и схема test-only шлюза без запуска реальных контактов.
37. В Bitrix24 создан отдельный test-only контур `AI-UP / Test`: отдельная воронка сделок, источник `AI-UP`, 12 пользовательских полей для сделок и отдельный входящий webhook только с правом `CRM`.
38. Test-only сделка `TEST / AI-UP / не обрабатывать` успешно создана через новый ограниченный webhook и попала в `AI-UP / Test`; признаков CRM-активностей, автозвонков, SMS, WhatsApp, email и перехода в `Продажи` не обнаружено.
39. В `promotion/site` реализован local-only controlled webhook gateway для будущего AI-UP -> Bitrix24: жёсткий `test-only` режим, manual gate, approval token, allowlist, дедупликация, дневной лимит и safe logging без deploy в production.
40. Local-only проверка gateway завершена успешно: `dry_run` подтвердил mapping на воронку `AI-UP / Test`, а один test-only write создал сделку `ID 21` в `CATEGORY_ID = 1`, `STAGE_ID = C1:NEW` с `activities_count = 0`.
41. Выполнен safety freeze local-only gateway: повторный secret scan и diff review не нашли секретов в коммитируемом наборе, `typecheck` и `test:aiup-gateway` зелёные, fallback на `Продажи` не найден, второй Bitrix write не выполнялся.
42. Gateway расширен безопасным режимом `first_real_test` и выпущен на текущую инфраструктуру только для dry-run, но реальный AI-UP запуск остановлен: в проекте уже обнаружены `48` источников, `7` активных источников, телефонные источники и дневной лимит `56`, что нарушает согласованный контур `5 сайтов / без телефонов / 15 контактов`.
43. Marketing-consent интерфейс подготовлен в коде сайта: есть явные accept/reject/custom сценарии, сохранение выбора, повторное открытие из футера и строгая связь AI-UP с категорией marketing; production pixel остаётся выключенным.
44. Consent-only deploy candidate добавлен в `main`, но production release не активирован: GitHub Actions снова остановился на SSH upload, live-сайт остался на предыдущей версии, AI-UP pixel не включён.

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
- **Last updated:** 2026-06-09
- **Lifecycle:** Active

### Entry
- **Path:** `glossary.md`
- **Purpose (RU):** Объяснение терминов маркетинга, продаж и CRM простым языком.
- **Trigger:** Снижение путаницы в терминах и метриках.
- **Owner:** Вы / команда.
- **Last updated:** 2026-06-09
- **Lifecycle:** Active

### Entry
- **Path:** `direct_ai_manager/`
- **Purpose (RU):** Подтвержденный отдельный Stage 0 каркас для будущей AI-системы управления Яндекс Директ через API: сейчас работает только на mock-данных, dry-run и защитных проверках.
- **Trigger:** Нужно подготовить безопасную архитектуру до получения токенов и API-доступов, не обращаясь к реальному рекламному кабинету.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-04-24
- **Lifecycle:** Active
- **Next step:** Использовать `README.md`, `SAFETY_RULES.md` и `ACCESS_SETUP_CHECKLIST.md`; к реальному API не переходить до отдельного решения владельца проекта.

### Entry
- **Path:** `direct_ai_manager/.gitignore`
- **Purpose (RU):** Защищает локальные секреты, `.env`, SQLite-базы, кэш Python и `STOP_AUTOMATION` от случайного попадания в Git.
- **Trigger:** Stage 0.5: усиление безопасности перед будущим подключением реальных доступов.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-04-24
- **Lifecycle:** Active

### Entry
- **Path:** `direct_ai_manager/SECURITY.md`
- **Purpose (RU):** Простые правила обращения с токенами и секретами: где хранить, что не отправлять в чат и что делать при подозрении на утечку.
- **Trigger:** Stage 0.5: нужно закрепить понятные правила до появления реальных токенов.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-04-24
- **Lifecycle:** Active

### Entry
- **Path:** `direct_ai_manager/STAGE_PLAN.md`
- **Purpose (RU):** План этапов развития системы от mock-only до возможной контролируемой автоматизации после отдельного решения.
- **Trigger:** Stage 0.5: нужно явно отделить текущий безопасный этап от будущих read-only и approval этапов.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-04-24
- **Lifecycle:** Active

### Entry
- **Path:** `direct_ai_manager/stage-3-18-cleanup-write-gate-design-local-report.md`
- **Purpose (RU):** Короткий отчёт о локальном дизайне будущего cleanup/write-gate после отказа от перезапуска кампании без лидов; нужен как понятная точка контроля перед любыми будущими изменениями.
- **Trigger:** Stage 3.18: после no-lead решения нужно подготовить только локальный план чистки и будущего gate без выполнения действий в Яндекс Директе.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-05-24
- **Lifecycle:** Active
- **Next step:** Использовать только как дизайн; любые реальные изменения требуют отдельного явного production write gate.

### Entry
- **Path:** `direct_ai_manager/stage-3-19-landing-goals-audit-plan-local-report.md`
- **Purpose (RU):** Короткий отчёт о локальном плане проверки посадочной страницы, телефона, CTA, целей Метрики и UTM перед обсуждением перезапуска кампании.
- **Trigger:** Stage 3.19: после трафика без лидов нужно вручную проверить путь конверсии и трекинг, не меняя сайт, Метрику или Яндекс Директ.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-05-25
- **Lifecycle:** Active
- **Next step:** Собрать ручные подтверждения по телефону, CTA, целям и UTM; любые изменения делать только отдельным согласованным этапом.

### Entry
- **Path:** `direct_ai_manager/stage-3-20-landing-goals-evidence-template-local-report.md`
- **Purpose (RU):** Короткий отчёт о локальном шаблоне, куда человек занесёт результаты ручной проверки телефона, CTA, целей Метрики, форм, мессенджеров и UTM.
- **Trigger:** Stage 3.20: после плана аудита нужен заполняемый evidence template без изменений сайта, Метрики или Яндекс Директа.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-05-25
- **Lifecycle:** Active
- **Next step:** Заполнить evidence template вручную после проверки посадочной страницы и целей; перезапуск остаётся заблокированным до заполнения.

### Entry
- **Path:** `direct_ai_manager/stage-3-20-filled-landing-goals-evidence-readonly-report.md`
- **Purpose (RU):** Короткий отчёт о заполненном evidence по посадочной странице и целям: что подтверждено, какие блокеры остаются и почему Директ пока не перезапускаем.
- **Trigger:** Заполнение Stage 3.20 evidence на основе ручной проверки и read-only наблюдений Метрики.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-05-25
- **Lifecycle:** Active
- **Next step:** Не перезапускать Директ; сначала вынести телефон/CTA выше первого экрана и подтвердить form/messenger goals и UTM report visibility.

### Entry
- **Path:** `direct_ai_manager/stage-3-21-landing-cta-improvement-plan-local-report.md`
- **Purpose (RU):** Короткий отчёт о локальном плане улучшения посадочной: добавить видимый телефон или кнопку звонка выше первого экрана без выполнения изменений.
- **Trigger:** Stage 3.21: заполненный evidence показал главный блокер `phone_not_visible_on_first_screen`.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-05-25
- **Lifecycle:** Active
- **Next step:** Подготовить отдельный website/CMS implementation stage; этот отчёт сам ничего на сайте не меняет.

### Entry
- **Path:** `direct_ai_manager/stage-3-22-metrika-goals-evidence-readonly-report.md`
- **Purpose (RU):** Короткий отчёт о новом read-only этапе: Кодекс может проверить цели Метрики через API, но не создавать/менять цели и не трогать Директ или сайт.
- **Trigger:** Stage 3.22: после локального CTA-плана нужно собирать evidence Метрики через API, а не вручную.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-05-25
- **Lifecycle:** Active
- **Next step:** Передать внешний env-файл через `$METRIKA_ENV` и сгенерировать локальный Stage 3.22 evidence report; campaign не перезапускать.

### Entry
- **Path:** `direct_ai_manager/app/security_check.py`
- **Purpose (RU):** Проверяет проект на случайные секреты: `.env` в Git index, заполненные токены, bearer-заголовки и секреты в SQLite.
- **Trigger:** Stage 0.5: нужна автоматическая проверка перед работой с реальными доступами.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-04-24
- **Lifecycle:** Active

### Entry
- **Path:** `direct_ai_manager/tests/test_security_check.py`
- **Purpose (RU):** Тесты, которые подтверждают работу security-check и защиту логов от сохранения токенов.
- **Trigger:** Stage 0.5: проверки безопасности должны быть покрыты автотестами.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-04-24
- **Lifecycle:** Active

### Entry
- **Path:** `kitchen_obsidian/`
- **Purpose (RU):** Человеко-ориентированная зона проекта: рабочий `local-zone`, очищенный `vault`, Plane registry и карта папок human-zone.
- **Trigger:** Нужна единая human-zone для локальной работы и Plane sync без дальнейшего использования Obsidian.
- **Owner:** Вы.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Работать через `local-zone`, а для Plane поддерживать в актуальном состоянии page-map, file-map и folder-map.

### Entry
- **Path:** `kitchen_obsidian/local-zone/client-data/legal-entity-ip-lukyanovich-sergei-vasilevich.md`
- **Purpose (RU):** Карточка с реквизитами ИП, от лица которого ведётся деятельность: основные данные, контакты, адрес и банковские реквизиты в одном понятном месте.
- **Trigger:** Появилась потребность быстро доставать официальные реквизиты по запросу без поиска по загрузкам и перепискам.
- **Owner:** Вы.
- **Last updated:** 2026-04-14
- **Lifecycle:** Active
- **Next step:** Использовать как основную текстовую карточку для реквизитов и держать в актуальном состоянии при изменениях.

### Entry
- **Path:** `kitchen_obsidian/local-zone/files/rekvizity-ip-lukyanovich-sergei-vasilevich-bank-tochka.pdf`
- **Purpose (RU):** Оригинальный PDF с реквизитами ИП Лукьянович Сергей Васильевич для случаев, когда нужен исходный документ без пересказа.
- **Trigger:** Нужно иметь под рукой официальный файл с реквизитами и синхронизировать его в Plane через файловый реестр.
- **Owner:** Вы.
- **Last updated:** 2026-04-14
- **Lifecycle:** Active
- **Next step:** По запросу использовать этот файл как первоисточник.

### Entry
- **Path:** `kitchen_obsidian/local-zone/next-actions/yandex-direct-plan-until-2026-06-30.md`
- **Purpose (RU):** Рабочий Markdown-план управления Яндекс Директом до 30 июня 2026: ежедневный цикл, недельные решения, метрики и правила безопасных изменений.
- **Trigger:** Нужно зафиксировать июньский план работы с Директом в базе знаний проекта.
- **Owner:** Вы / команда управления проектом.
- **Last updated:** 2026-06-05
- **Lifecycle:** Active
- **Next step:** 6 июня снять detailed probes за 5 июня и принять решение дня: оставить как есть, готовить минус-фразы, менять бюджет или готовить изменение ставок/структуры.

### Entry
- **Path:** `kitchen_obsidian/local-zone/next-actions/yandex-direct-plan-until-2026-06-30.pdf`
- **Purpose (RU):** PDF-версия июньского плана по Яндекс Директу для удобного чтения владельцем проекта.
- **Trigger:** Нужен человекочитаемый файл по тому же плану, что и рабочий Markdown.
- **Owner:** Вы.
- **Last updated:** 2026-06-05
- **Lifecycle:** Active
- **Next step:** Использовать как краткую управленческую инструкцию до 30 июня 2026.

### Entry
- **Path:** `scripts/obsidian_sync.py`
- **Purpose (RU):** Бывший скрипт двусторонней синхронизации `kitchen_obsidian/vault` ↔ `kitchen_obsidian/local-zone`.
- **Trigger:** Исторический контур Obsidian sync, который больше не используется.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-05
- **Lifecycle:** Archived

### Entry
- **Path:** `scripts/plane_sync.py`
- **Purpose (RU):** Скрипт bootstrap-импорта Pegas knowledge zone, автоматической публикации локальных markdown в Plane, пакетной pull-синхронизации зарегистрированных Plane pages, ведения `file-registry` для `kitchen_obsidian/local-zone/files` и контроля целевой папочной карты human-zone.
- **Trigger:** Переход рабочей базы знаний Pegas из смешанного Anytype/локального состояния к Plane-driven human-zone.
- **Owner:** Вы / команда.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Поддерживать `plane-page-map.csv`, `plane-file-map.csv` и `plane-folder-map.csv` в актуальном состоянии и использовать их как единую карту синхронизации human-zone.

### Entry
- **Path:** `kitchen_obsidian/setup-obsidian-sync.md`
- **Purpose (RU):** Историческая инструкция по ранее использовавшемуся Obsidian sync.
- **Trigger:** Сохранение старой процедуры без её дальнейшего использования.
- **Owner:** Вы.
- **Last updated:** 2026-03-05
- **Lifecycle:** Archived

### Entry
- **Path:** `scripts/install_obsidian_sync_launchd.sh`
- **Purpose (RU):** Исторический установщик Obsidian sync, который больше не используется.
- **Trigger:** Сохранён для истории после отключения Obsidian контура.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-05
- **Lifecycle:** Archived

### Entry
- **Path:** `scripts/install_plane_sync_launchd.sh`
- **Purpose (RU):** Устанавливает и запускает fast launchd задачу Plane -> `kitchen_obsidian` pull sync с интервалом из `plane-sync-config.yaml` и подхватом переменных окружения из `~/.zprofile`.
- **Trigger:** Нужно быстро подтягивать изменения, которые вы вносите в Plane, не записывая API key в репозиторий.
- **Owner:** Вы / команда.
- **Last updated:** 2026-04-01
- **Lifecycle:** Active

### Entry
- **Path:** `kitchen_obsidian/registry/plane-page-map.csv`
- **Purpose (RU):** Явный registry страниц Plane: какой `page_id` соответствует какому локальному `.md` файлу и каков статус синхронизации.
- **Trigger:** Публичный Pages API Plane не умеет сам перечислять все страницы проекта, поэтому нужна явная карта синка.
- **Owner:** Вы / команда.
- **Last updated:** 2026-04-01
- **Lifecycle:** Active

### Entry
- **Path:** `kitchen_obsidian/registry/plane-file-map.csv`
- **Purpose (RU):** Явный file-registry human-zone: какой файл из `kitchen_obsidian/local-zone/files` как представлен в Plane, в какой категории находится и каков статус его хранения.
- **Trigger:** Принята политика, по которой `files/` не зеркалится бинарно `1-в-1`, а синхронизируется как реестр файлов с локальными оригиналами.
- **Owner:** Вы / команда.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active

### Entry
- **Path:** `kitchen_obsidian/registry/plane-folder-map.csv`
- **Purpose (RU):** Явная карта папок human-zone: какие логические разделы должны существовать в Plane и локальной папке, какой локальный каталог им соответствует и где у раздела уже есть page-landing.
- **Trigger:** Для одинаковой папочной логики Plane и `local-zone` одной только page-map недостаточно: нужен отдельный registry целевой иерархии.
- **Owner:** Вы / команда.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Дозаполнить `page_id` у container-folder разделов после доступа к web-session Plane и затем применить реальные parent/move операции.

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
- **Last updated:** 2026-03-26
- **Lifecycle:** Active
- **Next step:** Проверить owner/editor сценарии входа и удобство редактирования контента для реальных участников команды.

### Entry
- **Path:** `promotion/site/app/admin/`
- **Purpose (RU):** Закрытая админка сайта: вход, вкладки редактирования контента и owner-only управление пользователями.
- **Trigger:** Понадобилась реальная CMS внутри текущего Next.js-сайта без отдельного второго приложения.
- **Owner:** Вы / дизайнер / вебмастер / копирайтер.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active
- **Next step:** Пройти owner и editor сценарии вручную на staging и убедиться, что интерфейс понятен без разработчика.

### Entry
- **Path:** `promotion/site/app/api/admin/`
- **Purpose (RU):** Защищённые серверные точки для сохранения CMS-контента, загрузки изображений и управления пользователями.
- **Trigger:** Нельзя было давать браузеру прямую запись в Supabase-таблицы и Auth без серверной проверки роли.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/components/admin/`
- **Purpose (RU):** Интерфейсные компоненты CMS: форма входа, оболочка админки, редактор контента, загрузка изображений и таблица пользователей.
- **Trigger:** Потребность сделать CMS внутри текущего UI-стека проекта, а не через внешний админ-фреймворк.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/lib/admin-auth.ts`
- **Purpose (RU):** Единые проверки авторизации и ролей `owner` / `editor` для страниц и API админки.
- **Trigger:** Нужно было централизованно защитить `/admin` и `/api/admin/*`.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/lib/admin-cms.ts`
- **Purpose (RU):** Серверная логика чтения и сохранения CMS-контента поверх текущих таблиц `cms_sites`, `cms_pages`, `cms_sections`, `cms_navigation`, `cms_assets`.
- **Trigger:** Требовалось не строить вторую CMS-модель, а довести до рабочего состояния уже существующую схему Supabase.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/lib/admin-users.ts`
- **Purpose (RU):** Owner-only управление учётками Supabase Auth: создание пользователей, смена роли, пароль и временное отключение доступа.
- **Trigger:** Сервер пока не рассылает письма, поэтому пользователей нужно создавать и поддерживать прямо из CMS.
- **Owner:** Вы / владелец сайта.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/lib/supabase-browser.ts`
- **Purpose (RU):** Браузерный клиент Supabase для входа и выхода из CMS через cookie-based session.
- **Trigger:** Для `/admin/login` понадобился отдельный безопасный клиентский контур auth.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/lib/supabase-server.ts`
- **Purpose (RU):** Серверные Supabase-клиенты для middleware, защищённых страниц и API админки.
- **Trigger:** Нужно было синхронно работать с cookie-based session по рекомендациям Supabase для Next.js.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active

### Entry
- **Path:** `promotion/site/middleware.ts`
- **Purpose (RU):** Защищает `/admin` и `/api/admin/*`, проверяет сессию и не пускает неавторизованных пользователей в CMS.
- **Trigger:** После появления админки нужно было сделать обязательный вход до доступа к контенту и user management.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active

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
- **Last updated:** 2026-03-26
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
- **Path:** `promotion/site/supabase/migrations/20260326_add_admin_storage_and_policies.sql`
- **Purpose (RU):** Создаёт публичный bucket `cms-media` для загрузки изображений из CMS-админки.
- **Trigger:** После запуска admin MVP понадобился управляемый канал загрузки новых картинок без коммита файлов в репозиторий.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-26
- **Lifecycle:** Active
- **Next step:** Применить миграцию в staging и production Supabase перед первым использованием загрузки файлов.

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
- **Path:** `promotion/vk-group/`
- **Purpose (RU):** Материалы для оформления и ведения группы ВК.
- **Trigger:** Подготовка отдельного канала продвижения через группу ВК.
- **Owner:** Вы / маркетолог.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Дособрать тексты описания, карточки услуг и CTA-визуалы для группы.

### Entry
- **Path:** `promotion/vk-group/logo-pegas.png`
- **Purpose (RU):** Рабочий логотип группы ВК для бренда Pegas.
- **Trigger:** Пользователь передал готовый визуал для оформления группы.
- **Owner:** Вы.
- **Last updated:** 2026-04-10
- **Lifecycle:** Active
- **Next step:** Использовать как аватар группы ВК или как основу для адаптации под квадратный формат.

### Entry
- **Path:** `promotion/vk-group/avatar-pegas-vk.png`
- **Purpose (RU):** Финальный квадратный аватар для группы ВК на основе логотипа Pegas.
- **Trigger:** Пользователь утвердил более сильную квадратную версию логотипа под аватар сообщества.
- **Owner:** Вы.
- **Last updated:** 2026-04-16
- **Lifecycle:** Active
- **Next step:** Загрузить как основной аватар группы ВК и проверить читаемость в маленьком круглом превью.

### Entry
- **Path:** `promotion/vk-group/cover-pegas-vk.png`
- **Purpose (RU):** Готовая обложка для группы ВК в фирменном стиле Pegas.
- **Trigger:** Пользователь сгенерировал и передал обложку для оформления сообщества.
- **Owner:** Вы.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Загрузить как основную обложку сообщества ВК и проверить, как она выглядит в десктопной и мобильной версии.

### Entry
- **Path:** `promotion/vk-group/pinned-post-banner-pegas.png`
- **Purpose (RU):** Баннер для закреплённого поста группы ВК в фирменном стиле Pegas.
- **Trigger:** Пользователь сгенерировал визуал для приветственного закреплённого поста.
- **Owner:** Вы.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Использовать в первом закреплённом посте вместе с коротким оффером, описанием и призывом написать в сообщения.

### Entry
- **Path:** `promotion/vk-group/service-card-kitchen-design-pegas.png`
- **Purpose (RU):** Визуал для карточки услуги или поста о дизайне кухни на заказ в стиле Pegas.
- **Trigger:** Пользователь сгенерировал отдельный фирменный визуал для VK-материалов.
- **Owner:** Вы.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Использовать в карточке услуги, посте о проектировании кухни или в серии визуалов преимуществ.

### Entry
- **Path:** `promotion/vk-group/service-card-free-measurement-pegas.png`
- **Purpose (RU):** Визуал для карточки услуги о бесплатном замере кухни в фирменном стиле Pegas.
- **Trigger:** Пользователь сгенерировал отдельный визуал для услуги бесплатного замера.
- **Owner:** Вы.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Использовать в карточке услуги, CTA-публикации или блоке преимуществ о бесплатном замере.

### Entry
- **Path:** `promotion/vk-group/service-card-manufacturing-installation-pegas.png`
- **Purpose (RU):** Визуал для карточки услуги о производстве и монтаже кухни в фирменном стиле Pegas.
- **Trigger:** Пользователь сгенерировал отдельный визуал для услуги производства и установки.
- **Owner:** Вы.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Использовать в карточке услуги, публикации о процессе монтажа или в блоке преимуществ о работе под ключ.

### Entry
- **Path:** `promotion/vk-group/service-card-cost-calculation-pegas.png`
- **Purpose (RU):** Визуал для карточки услуги о расчёте стоимости кухни в фирменном стиле Pegas.
- **Trigger:** Пользователь сгенерировал отдельный визуал для услуги расчёта стоимости.
- **Owner:** Вы.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Использовать в карточке услуги, CTA-публикации о расчёте стоимости или в блоке офферов для первой консультации.

### Entry
- **Path:** `promotion/vk-group/service-card-wardrobes-storage-pegas.png`
- **Purpose (RU):** Визуал для карточки услуги о шкафах и системах хранения в фирменном стиле Pegas.
- **Trigger:** Пользователь сгенерировал отдельный визуал для услуги шкафов и мебели для хранения.
- **Owner:** Вы.
- **Last updated:** 2026-04-13
- **Lifecycle:** Active
- **Next step:** Использовать в карточке услуги, публикации о встроенных шкафах или в блоке дополнительных направлений мебели на заказ.

### Entry
- **Path:** `promotion/vk-group/feed-visual-01-pegas.png`
- **Purpose (RU):** Первый имиджевый визуал для ленты ВК с премиальной кухней в стиле Pegas.
- **Trigger:** Пользователь начал собирать отдельную серию визуалов для публикаций в ленте сообщества.
- **Owner:** Вы.
- **Last updated:** 2026-04-15
- **Lifecycle:** Active
- **Next step:** Использовать в имиджевом посте о стиле, качестве и визуальном уровне кухонь Pegas.

### Entry
- **Path:** `promotion/vk-group/feed-visual-02-pegas.png`
- **Purpose (RU):** Второй имиджевый визуал для ленты ВК с тёмной премиальной кухней в стиле Pegas.
- **Trigger:** Пользователь продолжил собирать серию визуалов для регулярных публикаций в ленте сообщества.
- **Owner:** Вы.
- **Last updated:** 2026-04-16
- **Lifecycle:** Active
- **Next step:** Использовать в посте о премиальных материалах, тёмных кухнях или визуальном уровне бренда Pegas.

### Entry
- **Path:** `promotion/vk-group/feed-visual-04-pegas.png`
- **Purpose (RU):** Четвёртый имиджевый визуал для ленты ВК с акцентом на уют, свет и комфорт кухни Pegas.
- **Trigger:** Пользователь продолжил собирать серию визуалов для регулярных публикаций в ленте сообщества.
- **Owner:** Вы.
- **Last updated:** 2026-04-16
- **Lifecycle:** Active
- **Next step:** Использовать в посте про уют, комфорт в деталях или атмосферу кухни для жизни.

### Entry
- **Path:** `promotion/vk-group/feed-visual-05-pegas.png`
- **Purpose (RU):** Пятый имиджевый визуал для ленты ВК с акцентом на персональный дизайн и точные размеры.
- **Trigger:** Пользователь продолжил собирать серию визуалов для регулярных публикаций в ленте сообщества.
- **Owner:** Вы.
- **Last updated:** 2026-04-16
- **Lifecycle:** Active
- **Next step:** Использовать в посте про индивидуальное проектирование, точные размеры и персональные решения.

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

### Entry
- **Path:** `promotion/yandex-direct/direct-status-report-2026-05-22.md`
- **Purpose (RU):** Комплексный человеческий отчёт о текущем контуре Яндекс Директа: что создано, какой статус кампании, какие расходы были, какие защиты работают и что можно делать дальше.
- **Trigger:** Нужно понятно зафиксировать состояние после первого production-теста, остановки кампании и анализа поисковых запросов.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-05-23
- **Lifecycle:** Active
- **Next step:** Вручную разобрать 17 кликовых запросов, сверить Метрику/заявки и только потом готовить отдельный local-only список минус-фраз или resume checklist.

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
- **Path:** `analytics/customer-behavior/ai-up-pegas-readonly-audit-2026-06-05.md`
- **Purpose (RU):** Readonly-отчет по кабинету AI-UP и проекту `Пегас`: баланс, статус проекта, источники, идентификации, интеграции, колл-центр, риски расходов и вывод для стратегии привлечения клиентов на кухни.
- **Trigger:** Нужно безопасно разобраться в AI-UP перед запуском теста по Ростову-на-Дону и Ростовской области.
- **Owner:** Вы / маркетолог / специалист по продажам.
- **Last updated:** 2026-06-06
- **Lifecycle:** Active
- **Next step:** Собрать и утвердить 5-7 сайтов конкурентов и осторожный тестовый лимит перед любым включением проекта.

### Entry
- **Path:** `analytics/customer-behavior/ai-up-pegas-competitor-source-candidates-2026-06-06.md`
- **Purpose (RU):** Таблица конкурентов-кандидатов для AI-UP: какие сайты и публичные телефоны можно рассматривать для первого теста привлечения клиентов на кухни, а какие источники лучше не добавлять.
- **Trigger:** Подготовка первого безопасного теста AI-UP без добавления источников и без изменения проекта `Пегас`.
- **Owner:** Вы / маркетолог / специалист по продажам.
- **Last updated:** 2026-06-06
- **Lifecycle:** Active
- **Next step:** Вручную утвердить 5 сайтов и дневной лимит перед любым действием внутри AI-UP.

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
- **Path:** `crm/architecture/ai-up-bitrix24-preintegration-readiness-2026-06-06.md`
- **Purpose (RU):** Read-only отчёт о готовности Bitrix24 к будущей интеграции AI-UP: что уже есть, какие поля и воронка нужны, какие автоматизации опасны и почему подключение пока нельзя запускать.
- **Trigger:** Нужно безопасно подготовить CRM-структуру для AI-UP без передачи реальных контактов и без риска запустить автоматические действия.
- **Owner:** Вы / CRM-ответственный / команда проекта.
- **Last updated:** 2026-06-06
- **Lifecycle:** Active
- **Next step:** Использовать отчёт как чек-лист перед ручной проверкой роботов, триггеров и бизнес-процессов; CRM менять только после отдельного подтверждения владельца.

### Entry
- **Path:** `crm/architecture/bitrix24-automation-safety-audit-2026-06-06.md`
- **Purpose (RU):** Ручной UI-отчёт по автоматизациям Bitrix24: что видно по лидам, сделкам, бизнес-процессам, коммуникациям и интеграциям, и почему тестовые AI-UP сущности пока создавать нельзя.
- **Trigger:** Нужно проверить реальный интерфейс Bitrix24 под админским доступом и подтвердить, безопасно ли создавать тестовые лиды или сделки перед AI-UP.
- **Owner:** Вы / CRM-ответственный / владелец портала.
- **Last updated:** 2026-06-06
- **Lifecycle:** Active
- **Next step:** Сначала вручную отключить или обойти опасные автоматизации в сделках и проверить реальные каналы коммуникаций; только потом возвращаться к test-only структуре AI-UP.

### Entry
- **Path:** `crm/architecture/ai-up-bitrix24-connection-plan-2026-06-07.md`
- **Purpose (RU):** Пошаговый безопасный план будущего подключения AI-UP к Bitrix24: сравнение способов интеграции, список полей, требования к новому webhook и схема controlled gateway без запуска реальных контактов.
- **Trigger:** Нужно подготовить архитектуру test-only подключения AI-UP к Bitrix24, не используя текущую воронку `Продажи`, не используя широкий webhook и не передавая реальные контакты.
- **Owner:** Вы / CRM-ответственный / владелец проекта.
- **Last updated:** 2026-06-07
- **Lifecycle:** Active
- **Next step:** Использовать этот план как базу перед отдельным решением владельца о создании test-only воронки, нового ограниченного webhook и controlled gateway.

### Entry
- **Path:** `crm/architecture/ai-up-bitrix24-test-contour-created-2026-06-07.md`
- **Purpose (RU):** Подробный отчёт о фактическом создании безопасного test-only контура AI-UP в Bitrix24: отдельная воронка, стадии, источник, поля, ограниченный webhook, тестовая сделка и результаты проверки на отсутствие автоматических действий.
- **Trigger:** После approval на создание test-only структуры нужно было подготовить сам контур в Bitrix24, не включая AI-UP, не используя рабочую воронку `Продажи` и не передавая реальные контакты.
- **Owner:** Вы / CRM-ответственный / владелец портала.
- **Last updated:** 2026-06-08
- **Lifecycle:** Active
- **Next step:** Использовать этот отчёт как исходную точку перед отдельным решением владельца о реализации controlled webhook gateway и сохранении режима только `test-only`.

### Entry
- **Path:** `crm/architecture/ai-up-controlled-webhook-gateway-test-only-2026-06-08.md`
- **Purpose (RU):** Подробный отчёт о local-only реализации controlled webhook gateway для будущего AI-UP -> Bitrix24: какие ограничения встроены, какие Bitrix mapping-данные найдены, как прошли dry-run и один test-only write и почему production пока не трогался.
- **Trigger:** После создания test-only контура в Bitrix24 нужно было безопасно реализовать и проверить локальный gateway без deploy, без реального AI-UP и без передачи реальных контактов.
- **Owner:** Вы / CRM-ответственный / владелец проекта.
- **Last updated:** 2026-06-09
- **Lifecycle:** Active
- **Next step:** Использовать gateway как reference implementation и не переводить его в deploy/live без отдельного подтверждения владельца.

### Entry
- **Path:** `crm/architecture/ai-up-controlled-webhook-gateway-safety-freeze-2026-06-08.md`
- **Purpose (RU):** Итоговый safety freeze отчёт по local-only gateway: какие файлы проверены, что показал secret scan, как подтверждены hard block, manual gate, approval token, allowlist, mapping только в `AI-UP / Test`, duplicate, дневной лимит и запрет на второй Bitrix write.
- **Trigger:** После локальной реализации и одного test-only write нужно было зафиксировать безопасное состояние контура до любого deploy или подключения реального AI-UP.
- **Owner:** Вы / CRM-ответственный / владелец проекта.
- **Last updated:** 2026-06-09
- **Lifecycle:** Active
- **Next step:** Использовать этот freeze как контрольную точку; любые deploy, live-режим, реальные контакты и новые write-проверки делать только по отдельному подтверждению владельца.

### Entry
- **Path:** `crm/architecture/ai-up-controlled-webhook-gateway-public-dry-run-2026-06-08.md`
- **Purpose (RU):** Короткий отчёт о фактическом deploy test-only gateway на текущую инфраструктуру сайта и о публичном dry-run без AI-UP, без реальных контактов и без записи в Bitrix24.
- **Trigger:** Нужно было выпустить уже готовый controlled webhook gateway на существующий сайт, включить только test-only runtime-режим и проверить публичный endpoint безопасным dry-run.
- **Owner:** Вы / CRM-ответственный / владелец проекта.
- **Last updated:** 2026-06-09
- **Lifecycle:** Active
- **Next step:** Держать endpoint только в dry-run/test-only режиме до отдельного подтверждения владельца на любой write-шаг; отдельно привести в порядок GitHub environment secrets и cleanup старых релизов на сервере.

### Entry
- **Path:** `crm/architecture/ai-up-first-real-test-launch-2026-06-09.md`
- **Purpose (RU):** Итоговый отчёт по попытке запуска первого реального AI-UP теста: какой patch понадобился для gateway, какой dry-run был выполнен и почему фактический старт был остановлен из-за небезопасной текущей конфигурации AI-UP проекта.
- **Trigger:** После подтверждения владельца на первый реальный AI-UP тест нужно было быстро проверить проект, выпустить минимальный patch gateway и решить, можно ли безопасно стартовать реальный поток до 15 контактов.
- **Owner:** Вы / CRM-ответственный / владелец проекта.
- **Last updated:** 2026-06-09
- **Lifecycle:** Active
- **Next step:** Вернуть AI-UP проект к согласованному контуру `5 сайтов / без телефонов / лимит 15`, подключить только controlled gateway и только потом отдельно подтверждать реальный запуск.

### Entry
- **Path:** `crm/architecture/ai-up-consent-only-production-deploy-2026-06-20.md`
- **Purpose (RU):** Итоговый отчёт о consent-only production deploy: восстановление GitHub Actions, безопасная конфигурация AI-UP и live desktop/mobile QA.
- **Trigger:** После успешного Chromium QA владелец разрешил production deploy только consent interface при выключенном AI-UP pixel.
- **Owner:** Вы / владелец сайта / проектная команда.
- **Last updated:** 2026-06-21
- **Lifecycle:** Active
- **Next step:** Провести отдельный read-only preflight AI-UP activation; pixel и AI-UP project не включать без нового явного подтверждения владельца.

### Entry
- **Path:** `crm/architecture/ai-up-marketing-consent-interface-2026-06-20.md`
- **Purpose (RU):** Отчёт о реализации баннера и настроек cookies, хранении выбора, связи marketing consent с AI-UP pixel и browser QA.
- **Trigger:** Production preflight выявил отсутствие полноценного интерфейса marketing consent как главный блокер.
- **Owner:** Вы / владелец сайта / CRM-ответственный.
- **Last updated:** 2026-06-20
- **Lifecycle:** Active
- **Next step:** Выпустить consent interface отдельно, оставив AI-UP feature flag выключенным; activation pixel проводить только отдельным этапом.

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
- **Path:** `account-management/client-calls/`
- **Purpose (RU):** Папка для записей клиентских созвонов и связанных с ними материалов.
- **Trigger:** Появилась потребность хранить звонки с клиентом в одном месте и быстро находить нужную запись по дате.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-04-07
- **Lifecycle:** Active
- **Next step:** При появлении новых записей класть их сюда и, при необходимости, добавлять краткие заметки по итогам звонка.

### Entry
- **Path:** `account-management/client-calls/client-kickoff-questionnaire-2026-02-20.md`
- **Purpose (RU):** Опросник для стартового созвона и фиксации входных данных.
- **Trigger:** Проведение kick-off и сбор обязательных вводных.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/client-calls/call-client-2026-02-25.m4a`
- **Purpose (RU):** Аудиозапись клиентского созвона от 25.02.2026.
- **Trigger:** Нужно сохранить историю коммуникации с клиентом в проектной папке и в Plane.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-04-07
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/client-calls/call-client-2026-03-01.m4a`
- **Purpose (RU):** Аудиозапись клиентского созвона от 01.03.2026.
- **Trigger:** Нужно сохранить историю коммуникации с клиентом в проектной папке и в Plane.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-04-07
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/client-calls/call-client-2026-03-06.m4a`
- **Purpose (RU):** Аудиозапись клиентского созвона от 06.03.2026.
- **Trigger:** Нужно сохранить историю коммуникации с клиентом в проектной папке и в Plane.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-04-07
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/approvals/`
- **Purpose (RU):** Презентации и материалы на согласование с клиентом.
- **Trigger:** Потребность в прозрачном согласовании плана и сметы.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-04-02
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/approvals/project-budget-presentation-2026-04-01.md`
- **Purpose (RU):** Презентация бюджета Pegas на апрель 2026 в стиле текущего сайта и с переносом полного неиспользованного медиабюджета в апрель.
- **Trigger:** Потребность быстро согласовать клиенту апрельский бюджет отдельным презентационным файлом.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-04-02
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/approvals/project-budget-presentation-2026-04-01.pdf`
- **Purpose (RU):** Готовый PDF для отправки клиенту с апрельским бюджетом Pegas.
- **Trigger:** Нужен итоговый согласовательный файл в формате PDF, а не только исходный markdown.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-04-02
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/approvals/project-budget-presentation-2026-06-01.md`
- **Purpose (RU):** Презентация бюджета Pegas на июнь 2026: команда, операционные расходы, Яндекс Директ и тест нового канала.
- **Trigger:** Пользователь попросил подготовить июньский бюджет по образцу апрельской сметы.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-06-01
- **Lifecycle:** Active

### Entry
- **Path:** `account-management/approvals/project-budget-presentation-2026-06-01.pdf`
- **Purpose (RU):** Готовый PDF для отправки клиенту с июньским бюджетом Pegas.
- **Trigger:** Нужен итоговый согласовательный файл в формате PDF, а не только исходный markdown.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-06-01
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
- **Path:** `project-management/backlog/chat-summary-direct-ai-manager-2026-05-23.md`
- **Purpose (RU):** Краткая сводка текущего чата по `direct_ai_manager`, Яндекс Директу, статусу кампании, последним стадиям и безопасным следующим шагам.
- **Trigger:** Нужно продолжить работу в новом чате без потери контекста.
- **Owner:** Вы / команда проекта.
- **Last updated:** 2026-05-23
- **Lifecycle:** Active
- **Next step:** Открывать в новом чате как стартовый контекст перед любой работой по Директу.

### Entry
- **Path:** `project-management/budget/project-budget-2026-02-20-2026-03-31.md`
- **Purpose (RU):** Смета услуг и медиабюджетов на период.
- **Trigger:** Финансовое планирование проекта.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-03-05
- **Lifecycle:** Active

### Entry
- **Path:** `project-management/budget/project-budget-2026-04-01-2026-04-30.md`
- **Purpose (RU):** Отдельный расчет бюджета Pegas на апрель 2026 с разбивкой на команду, ежемесячные расходы и рекламный бюджет.
- **Trigger:** Потребность сформировать понятную смету на один месяц на основе текущих расходов в Plane и перенесённого медиабюджета.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-04-02
- **Lifecycle:** Active

### Entry
- **Path:** `project-management/budget/project-budget-2026-06-01-2026-06-30.md`
- **Purpose (RU):** Отдельный расчет бюджета Pegas на июнь 2026 с суммами по команде, операционным расходам, Яндекс Директу и тесту канала "лиды от конкурентов".
- **Trigger:** Пользователь попросил подготовить июньскую смету с новыми суммами и без VK Ads.
- **Owner:** Вы / клиент.
- **Last updated:** 2026-06-01
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
- **Last updated:** 2026-03-12
- **Lifecycle:** Active

### Entry
- **Path:** `project-management/backlog/risk-register.md`
- **Purpose (RU):** Реестр ключевых рисков проекта и способов заранее снижать их влияние.
- **Trigger:** Потребность фиксировать не только текущие задачи, но и системные угрозы по сайту, CRM и операциям.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-12
- **Lifecycle:** Active
- **Next step:** Добавлять новые риски сразу после значимых инцидентов и изменений контура.

### Entry
- **Path:** `project-management/backlog/decision-log.md`
- **Purpose (RU):** Журнал ключевых решений проекта и причин, почему выбран именно такой подход.
- **Trigger:** Необходимость помнить не только "что сделали", но и "почему решили именно так".
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-12
- **Lifecycle:** Active
- **Next step:** Фиксировать сюда решения, которые меняют правила работы сайта, CMS, релизов и эксплуатации.

### Entry
- **Path:** `project-management/backlog/incident-review-cms-localhost-2026-03-12.md`
- **Purpose (RU):** Отдельный разбор локального CMS/localhost инцидента: цепочка сбоев, root causes, незакрытые слабые места и preventive changes.
- **Trigger:** Runtime-падение сайта из-за разрыва контракта между remote CMS и UI после обновления контента.
- **Owner:** Вы / команда.
- **Last updated:** 2026-03-12
- **Lifecycle:** Active
- **Next step:** Использовать как основу для антиаварийных изменений в CMS-процессе, CI и локальном runbook.

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
