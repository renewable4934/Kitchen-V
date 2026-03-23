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
    "contentVersion": "landing-literal-2026-03-11",
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
    "eyebrow": "",
    "title": "Просто выбрать.\nЛегко жить.",
    "description": "",
    "tagline": "Кухни, которые освобождают пространство и время",
    "primaryCta": { "label": "Выбрать опции", "href": "#configurator", "eventName": "start_quiz" },
    "secondaryCta": { "label": "Посмотреть проекты", "href": "#portfolio" },
    "imageKey": "hero-kitchen",
    "statLabel": "",
    "statValue": ""
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
    "eyebrow": "3D-проект для вас",
    "title": "Созидание замыслов",
    "description": "Благодаря вашим ответам сможем подготовить индивидуальный 3D проект",
    "steps": [
      {
        "id": "style",
        "title": "Атмосфера",
        "description": "Выберите стиль кухни",
        "kind": "options",
        "options": [
          { "value": "scandinavian-minimalism", "label": "Скандинавский минимализм", "imageKey": "/images/kitchen-1.jpg" },
          { "value": "modern-classic", "label": "Современная классика", "imageKey": "/images/kitchen-2.jpg" },
          { "value": "eco-style", "label": "Эко-стиль", "imageKey": "/images/kitchen-3.jpg" },
          { "value": "premium", "label": "Премиум", "imageKey": "/images/kitchen-4.jpg" }
        ]
      },
      {
        "id": "shape",
        "title": "Форма кухни",
        "description": "Выберите конфигурацию",
        "kind": "options",
        "options": [
          { "value": "straight", "label": "Прямая", "imageKey": "/images/configurator/shape-straight.jpg" },
          { "value": "l-shaped", "label": "Угловая", "imageKey": "/images/configurator/shape-l-shaped.jpg" },
          { "value": "u-shaped", "label": "П-образная", "imageKey": "/images/configurator/shape-u-shaped.jpg" }
        ]
      },
      {
        "id": "length",
        "title": "Длина кухни",
        "description": "",
        "kind": "number",
        "fieldLabel": "Длина кухни, пог. м",
        "placeholder": "Например: 3.2",
        "step": "0.1",
        "options": []
      },
      {
        "id": "base-cabinets",
        "title": "Напольные шкафы",
        "description": "Тип нижних модулей",
        "kind": "options",
        "options": [
          { "value": "standard", "label": "Стандартные", "imageKey": "/images/configurator/base-cabinets-standard.jpg" },
          { "value": "handleless", "label": "Без ручек", "imageKey": "/images/configurator/base-cabinets-handleless.jpg" }
        ]
      },
      {
        "id": "wall-cabinets",
        "title": "Навесные шкафы",
        "description": "Тип верхних модулей",
        "kind": "options",
        "options": [
          { "value": "standard", "label": "Стандартные", "imageKey": "/images/configurator/wall-cabinets-standard.jpg" },
          { "value": "handleless", "label": "Без ручек", "imageKey": "/images/configurator/wall-cabinets-handleless.jpg" }
        ]
      },
      {
        "id": "oven",
        "title": "Духовка",
        "description": "Расположение духового шкафа",
        "kind": "options",
        "options": [
          { "value": "base", "label": "В нижнем шкафу", "imageKey": "/images/configurator/oven-base.jpg" },
          { "value": "tall", "label": "В высоком шкафу", "imageKey": "/images/configurator/oven-tall.jpg" },
          { "value": "pencil", "label": "В пенале", "imageKey": "/images/configurator/oven-pencil.jpg" }
        ]
      },
      {
        "id": "fridge",
        "title": "Холодильник",
        "description": "Расположение холодильника",
        "kind": "options",
        "options": [
          { "value": "builtin", "label": "Встроен в шкаф", "imageKey": "/images/configurator/fridge-builtin.jpg" },
          { "value": "standalone", "label": "Отдельно стоящий", "imageKey": "/images/configurator/fridge-standalone.jpg" },
          { "value": "side-by-side", "label": "Side-by-Side", "imageKey": "/images/configurator/fridge-side-by-side.jpg" },
          { "value": "external", "label": "Вне гарнитура", "imageKey": "/images/configurator/fridge-external.jpg" }
        ]
      },
      {
        "id": "sink",
        "title": "Мойка и посудомоечная машина",
        "description": "Мойка и посудомоечная машина",
        "kind": "options",
        "options": [
          { "value": "sink-only", "label": "Только мойка", "imageKey": "/images/configurator/sink-sink-only.jpg" },
          { "value": "sink-pm45", "label": "Мойка и посудомоечная машина 45", "imageKey": "/images/configurator/sink-sink-pm45.jpg" },
          { "value": "sink-pm60", "label": "Мойка и посудомоечная машина 60", "imageKey": "/images/configurator/sink-sink-pm60.jpg" }
        ]
      },
      {
        "id": "cooktop",
        "title": "Печь",
        "description": "Тип варочной поверхности",
        "kind": "options",
        "options": [
          { "value": "electric", "label": "Электрическая", "imageKey": "/images/configurator/cooktop-electric.jpg" },
          { "value": "induction", "label": "Индукционная", "imageKey": "/images/configurator/cooktop-induction.jpg" },
          { "value": "gas", "label": "Газовая", "imageKey": "/images/configurator/cooktop-gas.jpg" }
        ]
      },
      {
        "id": "hood",
        "title": "Вытяжка",
        "description": "Тип вытяжки",
        "kind": "options",
        "options": [
          { "value": "builtin", "label": "Встроенная", "imageKey": "/images/configurator/hood-builtin.jpg" },
          { "value": "dome", "label": "Купольная", "imageKey": "/images/configurator/hood-dome.jpg" },
          { "value": "angled", "label": "Наклонная", "imageKey": "/images/configurator/hood-angled.jpg" }
        ]
      }
    ],
    "discountTitle": "Соберите скидку",
    "discountDescription": "Выберите подходящие варианты для дополнительной скидки",
    "discountOptions": [
      { "value": "video-review", "label": "Видеоотзыв", "discount": "3%", "kind": "percent", "amount": 3 },
      { "value": "standard-project", "label": "Типовой проект", "discount": "5%", "kind": "percent", "amount": 5 },
      { "value": "kitchen-wardrobe", "label": "Кухня + шкаф", "discount": "4000 ₽", "kind": "fixed", "amount": 4000 },
      { "value": "full-prepayment", "label": "100% предоплата", "discount": "7%", "kind": "percent", "amount": 7 }
    ],
    "contactTitle": "Бесплатный 3D-проект",
    "contactDescription": "Оставьте контакты, и мы подготовим дизайн-проект для вас",
    "submitButtonLabel": "Отправить заявку",
    "submittingLabel": "Отправка...",
    "nextButtonLabel": "Далее",
    "backButtonLabel": "Назад",
    "messengerLabel": "Связаться через мессенджер",
    "consentLabel": "Согласие на обработку персональных данных",
    "successTitle": "Заявка отправлена!",
    "successDescription": "Мы свяжемся с вами в ближайшее время для обсуждения вашего проекта. Бесплатный 3D-проект уже в работе.",
    "fields": {
      "nameLabel": "Имя",
      "namePlaceholder": "ваше имя",
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
        "slug": "anna",
        "name": "Анна",
        "imageKey": "kitchen-1",
        "galleryImageKeys": ["/images/portfolio/anna-1.jpg", "/images/portfolio/anna-2.jpg", "/images/portfolio/anna-3.jpg"],
        "style": "Скандинавский минимализм",
        "review": "Кухня мечты! Всё продумано до мелочей, от планировки до освещения. Процесс заказа был настолько простым, что я не верила своим глазам."
      },
      {
        "slug": "mihail",
        "name": "Михаил",
        "imageKey": "kitchen-2",
        "galleryImageKeys": ["/images/portfolio/mihail-1.jpg", "/images/portfolio/mihail-2.jpg", "/images/portfolio/mihail-3.jpg"],
        "style": "Современная классика",
        "review": "Профессиональный подход на каждом этапе. 3D-проект полностью совпал с результатом. Рекомендую всем, кто ценит качество."
      },
      {
        "slug": "elena",
        "name": "Елена",
        "imageKey": "kitchen-3",
        "galleryImageKeys": ["/images/portfolio/elena-1.jpg", "/images/portfolio/elena-2.jpg", "/images/portfolio/elena-3.jpg"],
        "style": "Эко-стиль",
        "review": "Мы долго искали мастеров, которые поймут нашу идею. Пегас превзошёл все ожидания — кухня стала сердцем нашего дома."
      },
      {
        "slug": "petr",
        "name": "Пётр",
        "imageKey": "kitchen-4",
        "galleryImageKeys": ["/images/portfolio/petr-1.jpg", "/images/portfolio/petr-2.jpg", "/images/portfolio/petr-3.jpg"],
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
    "description": "Процесс покупки кухни простой и предсказуемый — от первого звонка до установки",
    "cards": [
      {
        "icon": "clock",
        "title": "Начать готовить — быстрее",
        "description": "",
        "highlight": "14 дней срок поставки"
      },
      {
        "icon": "shield",
        "title": "Оставаться спокойным — дольше",
        "description": "",
        "highlight": "5 лет гарантии на всё"
      },
      {
        "icon": "banknote",
        "title": "Покупать — выгоднее",
        "description": "",
        "highlight": "70 000 ₽/м стоимость кухни"
      },
      {
        "icon": "wrench",
        "title": "Передать под ключ — надежнее",
        "description": "",
        "highlight": "1 подрядчик"
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
    "description": "Кухня — это место, где начинается и заканчивается каждый день. Простор для жизни, творчества и любви.",
    "items": [
      {
        "imageKey": "lifestyle-coffee",
        "title": "Утренняя бодрость",
        "description": "Начните день с идеальной чашки кофе в пространстве, созданном для вдохновения"
      },
      {
        "imageKey": "lifestyle-cooking",
        "title": "Совместная готовка",
        "description": "Кухня как место встреч"
      },
      {
        "imageKey": "lifestyle-family",
        "title": "Семейный очаг",
        "description": "Уголок, где каждый член семьи чувствует тепло и уют"
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
    "description": "Свобода для полёта мечты",
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
  ('main', 'header', '3D-проект для вас', '#configurator', 10, true),
  ('main', 'header', 'Портфолио', '#portfolio', 20, true),
  ('main', 'header', 'Контракт', '#contract', 30, true),
  ('main', 'header', 'Кухня и человек', '#lifestyle', 40, true),
  ('main', 'header_cta', 'Получить персональный расчет', '#configurator', 50, true),
  ('main', 'footer', 'Главная', '#hero', 10, true),
  ('main', 'footer', '3D-проект', '#configurator', 20, true),
  ('main', 'footer', 'Портфолио', '#portfolio', 30, true),
  ('main', 'footer', 'Контракт', '#contract', 40, true),
  ('main', 'footer', 'Кухня и человек', '#lifestyle', 50, true)
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
