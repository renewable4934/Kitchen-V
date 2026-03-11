-- Title: CMS seed for the exact v0 landing
-- Purpose: fills Supabase CMS tables with the current Pegas landing content, navigation and image references.
-- Owner: Project team
-- Last updated: 2026-03-10

insert into public.cms_sites (id, settings)
values (
  'main',
  $${
    "siteId": "main",
    "brandName": "Пегас",
    "brandTagline": "Кухни, которые освобождают пространство и время.",
    "contactPhone": "+7 (800) 000-00-00",
    "email": "info@pegas-kitchen.ru",
    "address": "Москва, Россия",
    "whatsappPhone": "",
    "whatsappMessage": "Здравствуйте, хочу обсудить проект кухни.",
    "footerCopyrightOwner": "ООО «Пегас»",
    "offerVariant": "default",
    "experimentKey": null
  }$$::jsonb
)
on conflict (id) do update
set settings = excluded.settings,
    updated_at = timezone('utc', now());

insert into public.cms_pages (slug, site_id, meta, published)
values (
  'home',
  'main',
  $${
    "title": "Пегас - Кухни, которые освобождают пространство и время",
    "description": "Премиальные кухни на заказ. Просто выбрать. Легко жить. 3D проект, изготовление за 14 дней, гарантия 5 лет."
  }$$::jsonb,
  true
)
on conflict (slug) do update
set site_id = excluded.site_id,
    meta = excluded.meta,
    published = excluded.published,
    updated_at = timezone('utc', now());

insert into public.cms_sections (site_id, page_slug, section_key, sort_order, variant_key, is_enabled, content)
values
(
  'main',
  'home',
  'hero',
  10,
  'default',
  true,
  $${
    "eyebrow": "Расправьте крылья",
    "title": "Просто выбрать. Легко жить.",
    "description": "Кухни, которые освобождают пространство и время. Больше не нужно искать подрядчика — всё просто и понятно.",
    "primaryCta": { "label": "Создать проект", "href": "#configurator", "eventName": "start_quiz" },
    "secondaryCta": { "label": "Смотреть работы", "href": "#portfolio" },
    "imageKey": "hero-kitchen",
    "statLabel": "Срок изготовления",
    "statValue": "14 дней"
  }$$::jsonb
),
(
  'main',
  'home',
  'configurator',
  20,
  'default',
  true,
  $${
    "eyebrow": "3D проект для Вас",
    "title": "Создайте свою кухню",
    "description": "Ответьте на несколько вопросов, и мы бесплатно подготовим 3D-проект",
    "steps": [
      {
        "id": "style",
        "title": "Атмосфера",
        "description": "Выберите стиль кухни",
        "options": [
          { "value": "modern", "label": "Современный" },
          { "value": "classic", "label": "Классический" },
          { "value": "scandinavian", "label": "Скандинавский" },
          { "value": "minimalist", "label": "Минимализм" },
          { "value": "loft", "label": "Лофт" },
          { "value": "eco", "label": "Эко" }
        ]
      },
      {
        "id": "shape",
        "title": "Форма кухни",
        "description": "Выберите конфигурацию",
        "options": [
          { "value": "straight", "label": "Прямая" },
          { "value": "l-shaped", "label": "Угловая" },
          { "value": "u-shaped", "label": "П-образная" }
        ]
      },
      {
        "id": "base-cabinets",
        "title": "Напольные шкафы",
        "description": "Тип нижних модулей",
        "options": [
          { "value": "standard", "label": "Стандартные" },
          { "value": "handleless", "label": "Без ручек" }
        ]
      },
      {
        "id": "wall-cabinets",
        "title": "Навесные шкафы",
        "description": "Тип верхних модулей",
        "options": [
          { "value": "standard", "label": "Стандартные" },
          { "value": "handleless", "label": "Без ручек" }
        ]
      },
      {
        "id": "oven",
        "title": "Духовка",
        "description": "Расположение духового шкафа",
        "options": [
          { "value": "base", "label": "В нижнем шкафу" },
          { "value": "tall", "label": "В высоком шкафу" },
          { "value": "pencil", "label": "В пенале" }
        ]
      },
      {
        "id": "fridge",
        "title": "Холодильник",
        "description": "Расположение холодильника",
        "options": [
          { "value": "builtin", "label": "Встроен в шкаф" },
          { "value": "standalone", "label": "Отдельно стоящий" },
          { "value": "side-by-side", "label": "Side-by-Side" },
          { "value": "external", "label": "Вне гарнитура" }
        ]
      },
      {
        "id": "sink",
        "title": "Мойка и ПМ",
        "description": "Мойка и посудомоечная машина",
        "options": [
          { "value": "sink-only", "label": "Только мойка" },
          { "value": "sink-pm45", "label": "Мойка + ПМ 45" },
          { "value": "sink-pm60", "label": "Мойка + ПМ 60" }
        ]
      },
      {
        "id": "cooktop",
        "title": "Печь",
        "description": "Тип варочной поверхности",
        "options": [
          { "value": "electric", "label": "Электрическая" },
          { "value": "induction", "label": "Индукционная" },
          { "value": "gas", "label": "Газовая" }
        ]
      },
      {
        "id": "hood",
        "title": "Вытяжка",
        "description": "Тип вытяжки",
        "options": [
          { "value": "builtin", "label": "Встроенная" },
          { "value": "dome", "label": "Купольная" },
          { "value": "angled", "label": "Наклонная" }
        ]
      }
    ],
    "discountTitle": "Соберите скидку",
    "discountDescription": "Выберите подходящие варианты для дополнительной скидки",
    "discountOptions": [
      { "value": "video-review", "label": "Оставить видеоотзыв", "discount": "5%" },
      { "value": "standard-project", "label": "Типовой проект", "discount": "7%" },
      { "value": "stock-parts", "label": "Детали со склада", "discount": "10%" }
    ],
    "contactTitle": "Бесплатный 3D-проект",
    "contactDescription": "Оставьте контакты, и мы подготовим дизайн-проект для Вас",
    "submitButtonLabel": "Отправить заявку",
    "submittingLabel": "Отправка...",
    "nextButtonLabel": "Далее",
    "backButtonLabel": "Назад",
    "messengerLabel": "Связаться через мессенджер",
    "consentLabel": "Согласие на обработку персональных данных",
    "successTitle": "Заявка отправлена!",
    "successDescription": "Мы свяжемся с Вами в ближайшее время для обсуждения Вашего проекта. Бесплатный 3D-проект уже в работе.",
    "fields": {
      "nameLabel": "Имя",
      "namePlaceholder": "Ваше имя",
      "phoneLabel": "Телефон",
      "phonePlaceholder": "+7 (999) 999-99-99",
      "commentLabel": "Комментарий",
      "commentPlaceholder": "Опишите пожелания к проекту"
    }
  }$$::jsonb
),
(
  'main',
  'home',
  'portfolio',
  30,
  'default',
  true,
  $${
    "eyebrow": "Портфолио",
    "title": "Выполненные проекты",
    "description": "Каждая кухня — индивидуальная история, созданная с вниманием к деталям и любовью к своему делу.",
    "items": [
      {
        "name": "Анна",
        "imageKey": "kitchen-1",
        "style": "Скандинавский минимализм",
        "review": "Кухня мечты! Всё продумано до мелочей, от планировки до освещения. Процесс заказа был настолько простым, что я не верила своим глазам."
      },
      {
        "name": "Михаил",
        "imageKey": "kitchen-2",
        "style": "Современная классика",
        "review": "Профессиональный подход на каждом этапе. 3D-проект полностью совпал с результатом. Рекомендую всем, кто ценит качество."
      },
      {
        "name": "Елена",
        "imageKey": "kitchen-3",
        "style": "Эко-стиль",
        "review": "Мы долго искали мастеров, которые поймут нашу идею. Пегас превзошёл все ожидания — кухня стала сердцем нашего дома."
      },
      {
        "name": "Пётр",
        "imageKey": "kitchen-4",
        "style": "Премиум",
        "review": "Качество материалов и сборки на высшем уровне. Кухня работает как швейцарские часы. Спасибо команде Пегас!"
      }
    ]
  }$$::jsonb
),
(
  'main',
  'home',
  'contract',
  40,
  'default',
  true,
  $${
    "eyebrow": "Контракт",
    "title": "Прозрачные условия",
    "description": "Мы делаем процесс покупки кухни простым и предсказуемым — от первого звонка до установки.",
    "cards": [
      {
        "icon": "clock",
        "title": "Начать готовить — быстрее",
        "description": "Уже через 14 дней кухня может быть Вашей. Быстрое производство без потери качества.",
        "highlight": "14 дней"
      },
      {
        "icon": "shield",
        "title": "Оставаться спокойным — дольше",
        "description": "Полная гарантия 5 лет на все материалы и работу. Мы уверены в каждом изделии.",
        "highlight": "5 лет гарантии"
      },
      {
        "icon": "wrench",
        "title": "Укомплектовка техникой",
        "description": "Подберём и установим всю встраиваемую бытовую технику. Всё в одном месте.",
        "highlight": "Под ключ"
      },
      {
        "icon": "banknote",
        "title": "Покупать — выгодно",
        "description": "Прозрачное ценообразование без скрытых платежей. Погонный метр от 70 000 руб.",
        "highlight": "от 70 000 ₽/м"
      }
    ]
  }$$::jsonb
),
(
  'main',
  'home',
  'lifestyle',
  50,
  'default',
  true,
  $${
    "eyebrow": "Кухня и человек",
    "title": "Больше, чем мебель",
    "description": "Кухня — это место, где начинается и заканчивается каждый день. Пространство для жизни, творчества и любви.",
    "items": [
      {
        "imageKey": "lifestyle-coffee",
        "title": "Утренний кофе",
        "description": "Начните день с идеальной чашки в пространстве, созданном для вдохновения"
      },
      {
        "imageKey": "lifestyle-cooking",
        "title": "Совместная готовка",
        "description": "Кухня как место встреч — где рождаются вкусы и укрепляются отношения"
      },
      {
        "imageKey": "lifestyle-family",
        "title": "Семейный очаг",
        "description": "Пространство, где каждый член семьи чувствует тепло и уют"
      },
      {
        "imageKey": "lifestyle-creative",
        "title": "Творчество",
        "description": "Ваша кухня — лаборатория для кулинарных экспериментов и новых идей"
      }
    ]
  }$$::jsonb
),
(
  'main',
  'home',
  'footer',
  60,
  'default',
  true,
  $${
    "description": "Кухни, которые освобождают пространство и время. Проектирование, изготовление и установка под ключ.",
    "navigationTitle": "Навигация",
    "contactsTitle": "Контакты",
    "privacyLabel": "Политика конфиденциальности"
  }$$::jsonb
)
on conflict (site_id, page_slug, section_key, variant_key) do update
set sort_order = excluded.sort_order,
    is_enabled = excluded.is_enabled,
    content = excluded.content,
    updated_at = timezone('utc', now());

insert into public.cms_navigation (site_id, area, label, href, sort_order, is_enabled)
values
  ('main', 'header', '3D проект для Вас', '#configurator', 10, true),
  ('main', 'header', 'Портфолио', '#portfolio', 20, true),
  ('main', 'header', 'Контракт', '#contract', 30, true),
  ('main', 'header', 'Кухня и человек', '#lifestyle', 40, true),
  ('main', 'header_cta', 'Оставить заявку', '#configurator', 50, true),
  ('main', 'footer', 'Главная', '#hero', 10, true),
  ('main', 'footer', '3D проект', '#configurator', 20, true),
  ('main', 'footer', 'Портфолио', '#portfolio', 30, true),
  ('main', 'footer', 'Контракт', '#contract', 40, true)
on conflict (site_id, area, href, label) do update
set sort_order = excluded.sort_order,
    is_enabled = excluded.is_enabled,
    updated_at = timezone('utc', now());

insert into public.cms_assets (asset_key, site_id, public_url, alt, metadata)
values
  ('hero-kitchen', 'main', '/images/hero-kitchen.jpg', 'Современная кухня от Пегас', '{}'::jsonb),
  ('kitchen-1', 'main', '/images/kitchen-1.jpg', 'Кухня для Анны', '{}'::jsonb),
  ('kitchen-2', 'main', '/images/kitchen-2.jpg', 'Кухня для Михаила', '{}'::jsonb),
  ('kitchen-3', 'main', '/images/kitchen-3.jpg', 'Кухня для Елены', '{}'::jsonb),
  ('kitchen-4', 'main', '/images/kitchen-4.jpg', 'Кухня для Петра', '{}'::jsonb),
  ('lifestyle-coffee', 'main', '/images/lifestyle-coffee.jpg', 'Утренний кофе на кухне', '{}'::jsonb),
  ('lifestyle-cooking', 'main', '/images/lifestyle-cooking.jpg', 'Совместная готовка на кухне', '{}'::jsonb),
  ('lifestyle-family', 'main', '/images/lifestyle-family.jpg', 'Семейный уют на кухне', '{}'::jsonb),
  ('lifestyle-creative', 'main', '/images/lifestyle-creative.jpg', 'Творчество на кухне', '{}'::jsonb)
on conflict (asset_key) do update
set site_id = excluded.site_id,
    public_url = excluded.public_url,
    alt = excluded.alt,
    metadata = excluded.metadata,
    updated_at = timezone('utc', now());
