-- Title: Apply landing content updates
-- Purpose: aligns local migrations with the hosted Supabase landing content currently used by the Next.js site.
-- Owner: Project team
-- Last updated: 2026-03-11

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
values
(
  'home',
  'main',
  $${
    "title": "Пегас - Кухни, которые освобождают пространство и время",
    "description": "Премиальные кухни на заказ. Просто выбрать. Легко жить. 3D проект, изготовление за 14 дней, гарантия 5 лет."
  }$$::jsonb,
  true
),
(
  'kuhni-rostov',
  'main',
  '{}'::jsonb,
  true
),
(
  'shkafy-rostov',
  'main',
  '{}'::jsonb,
  true
)
on conflict (slug) do update
set site_id = excluded.site_id,
    meta = excluded.meta,
    published = excluded.published,
    updated_at = timezone('utc', now());

delete from public.cms_sections
where site_id = 'main'
  and page_slug = 'home';

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
    "imageKey": "hero-kitchen",
    "statLabel": "",
    "statValue": "",
    "primaryCta": {
      "label": "Выбрать опции",
      "href": "#configurator",
      "eventName": "start_quiz"
    },
    "secondaryCta": {
      "label": "Посмотреть проекты",
      "href": "#portfolio"
    }
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
    "description": "Благодаря вашим ответам мы сможем подготовить индивидуальный 3D проект",
    "contactTitle": "Бесплатный 3D-проект",
    "contactDescription": "Оставьте контакты, и мы подготовим дизайн-проект для вас",
    "discountTitle": "Соберите скидку",
    "discountDescription": "Выберите подходящие варианты для дополнительной скидки",
    "successTitle": "Заявка отправлена!",
    "successDescription": "Мы свяжемся с вами в ближайшее время для обсуждения вашего проекта. Бесплатный 3D-проект уже в работе.",
    "consentLabel": "Согласие на обработку персональных данных",
    "messengerLabel": "Связаться через мессенджер",
    "nextButtonLabel": "Далее",
    "backButtonLabel": "Назад",
    "submitButtonLabel": "Отправить заявку",
    "submittingLabel": "Отправка...",
    "fields": {
      "nameLabel": "Имя",
      "phoneLabel": "Телефон",
      "commentLabel": "Комментарий",
      "namePlaceholder": "ваше имя",
      "phonePlaceholder": "+7 (999) 999-99-99",
      "commentPlaceholder": "Опишите пожелания к проекту"
    },
    "discountOptions": [
      {
        "label": "Видеоотзыв",
        "value": "video-review",
        "discount": "3%",
        "kind": "percent",
        "amount": 3
      },
      {
        "label": "Типовой проект",
        "value": "standard-project",
        "discount": "5%",
        "kind": "percent",
        "amount": 5
      },
      {
        "label": "Кухня + шкаф",
        "value": "kitchen-wardrobe",
        "discount": "4000 ₽",
        "kind": "fixed",
        "amount": 4000
      },
      {
        "label": "100% предоплата",
        "value": "full-prepayment",
        "discount": "7%",
        "kind": "percent",
        "amount": 7
      }
    ],
    "steps": [
      {
        "id": "style",
        "title": "Атмосфера",
        "description": "Выберите стиль кухни",
        "kind": "options",
        "options": [
          { "label": "Скандинавский минимализм", "value": "scandinavian-minimalism", "imageKey": "/images/kitchen-1.jpg" },
          { "label": "Современная классика", "value": "modern-classic", "imageKey": "/images/kitchen-2.jpg" },
          { "label": "Эко-стиль", "value": "eco-style", "imageKey": "/images/kitchen-3.jpg" },
          { "label": "Премиум", "value": "premium", "imageKey": "/images/kitchen-4.jpg" }
        ]
      },
      {
        "id": "shape",
        "title": "Форма кухни",
        "description": "Выберите конфигурацию",
        "kind": "options",
        "options": [
          { "label": "Прямая", "value": "straight", "imageKey": "/images/configurator/shape-straight.jpg" },
          { "label": "Угловая", "value": "l-shaped", "imageKey": "/images/configurator/shape-l-shaped.jpg" },
          { "label": "П-образная", "value": "u-shaped", "imageKey": "/images/configurator/shape-u-shaped.jpg" }
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
          { "label": "Стандартные", "value": "standard", "imageKey": "/images/configurator/base-cabinets-standard.jpg" },
          { "label": "Без ручек", "value": "handleless", "imageKey": "/images/configurator/base-cabinets-handleless.jpg" }
        ]
      },
      {
        "id": "wall-cabinets",
        "title": "Навесные шкафы",
        "description": "Тип верхних модулей",
        "kind": "options",
        "options": [
          { "label": "Стандартные", "value": "standard", "imageKey": "/images/configurator/wall-cabinets-standard.jpg" },
          { "label": "Без ручек", "value": "handleless", "imageKey": "/images/configurator/wall-cabinets-handleless.jpg" }
        ]
      },
      {
        "id": "oven",
        "title": "Духовка",
        "description": "Расположение духового шкафа",
        "kind": "options",
        "options": [
          { "label": "В нижнем шкафу", "value": "base", "imageKey": "/images/configurator/oven-base.jpg" },
          { "label": "В высоком шкафу", "value": "tall", "imageKey": "/images/configurator/oven-tall.jpg" },
          { "label": "В пенале", "value": "pencil", "imageKey": "/images/configurator/oven-pencil.jpg" }
        ]
      },
      {
        "id": "fridge",
        "title": "Холодильник",
        "description": "Расположение холодильника",
        "kind": "options",
        "options": [
          { "label": "Встроен в шкаф", "value": "builtin", "imageKey": "/images/configurator/fridge-builtin.jpg" },
          { "label": "Отдельно стоящий", "value": "standalone", "imageKey": "/images/configurator/fridge-standalone.jpg" },
          { "label": "Side-by-Side", "value": "side-by-side", "imageKey": "/images/configurator/fridge-side-by-side.jpg" },
          { "label": "Вне гарнитура", "value": "external", "imageKey": "/images/configurator/fridge-external.jpg" }
        ]
      },
      {
        "id": "sink",
        "title": "Мойка и посудомоечная машина",
        "description": "Мойка и посудомоечная машина",
        "kind": "options",
        "options": [
          { "label": "Только мойка", "value": "sink-only", "imageKey": "/images/configurator/sink-sink-only.jpg" },
          { "label": "Мойка и посудомоечная машина 45", "value": "sink-pm45", "imageKey": "/images/configurator/sink-sink-pm45.jpg" },
          { "label": "Мойка и посудомоечная машина 60", "value": "sink-pm60", "imageKey": "/images/configurator/sink-sink-pm60.jpg" }
        ]
      },
      {
        "id": "cooktop",
        "title": "Печь",
        "description": "Тип варочной поверхности",
        "kind": "options",
        "options": [
          { "label": "Электрическая", "value": "electric", "imageKey": "/images/configurator/cooktop-electric.jpg" },
          { "label": "Индукционная", "value": "induction", "imageKey": "/images/configurator/cooktop-induction.jpg" },
          { "label": "Газовая", "value": "gas", "imageKey": "/images/configurator/cooktop-gas.jpg" }
        ]
      },
      {
        "id": "hood",
        "title": "Вытяжка",
        "description": "Тип вытяжки",
        "kind": "options",
        "options": [
          { "label": "Встроенная", "value": "builtin", "imageKey": "/images/configurator/hood-builtin.jpg" },
          { "label": "Купольная", "value": "dome", "imageKey": "/images/configurator/hood-dome.jpg" },
          { "label": "Наклонная", "value": "angled", "imageKey": "/images/configurator/hood-angled.jpg" }
        ]
      }
    ]
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
        "style": "Скандинавский минимализм",
        "review": "Кухня мечты! Всё продумано до мелочей, от планировки до освещения. Процесс заказа был настолько простым, что я не верила своим глазам.",
        "imageKey": "kitchen-1",
        "galleryImageKeys": ["/images/portfolio/anna-1.jpg", "/images/portfolio/anna-2.jpg", "/images/portfolio/anna-3.jpg"]
      },
      {
        "slug": "mihail",
        "name": "Михаил",
        "style": "Современная классика",
        "review": "Профессиональный подход на каждом этапе. 3D-проект полностью совпал с результатом. Рекомендую всем, кто ценит качество.",
        "imageKey": "kitchen-2",
        "galleryImageKeys": ["/images/portfolio/mihail-1.jpg", "/images/portfolio/mihail-2.jpg", "/images/portfolio/mihail-3.jpg"]
      },
      {
        "slug": "elena",
        "name": "Елена",
        "style": "Эко-стиль",
        "review": "Мы долго искали мастеров, которые поймут нашу идею. Пегас превзошёл все ожидания — кухня стала сердцем нашего дома.",
        "imageKey": "kitchen-3",
        "galleryImageKeys": ["/images/portfolio/elena-1.jpg", "/images/portfolio/elena-2.jpg", "/images/portfolio/elena-3.jpg"]
      },
      {
        "slug": "petr",
        "name": "Пётр",
        "style": "Премиум",
        "review": "Качество материалов и сборки на высшем уровне. Кухня работает как швейцарские часы. Спасибо команде Пегас!",
        "imageKey": "kitchen-4",
        "galleryImageKeys": ["/images/portfolio/petr-1.jpg", "/images/portfolio/petr-2.jpg", "/images/portfolio/petr-3.jpg"]
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
        "highlight": "14 дней срок поставки",
        "description": ""
      },
      {
        "icon": "shield",
        "title": "Оставаться спокойным — дольше",
        "highlight": "5 лет гарантии на всё",
        "description": ""
      },
      {
        "icon": "banknote",
        "title": "Покупать — выгоднее",
        "highlight": "70 000 ₽/м стоимость кухни",
        "description": ""
      },
      {
        "icon": "wrench",
        "title": "Передать под ключ — надежнее",
        "highlight": "1 подрядчик",
        "description": ""
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
        "title": "Утренняя бодрость",
        "description": "Начните день с идеальной чашки кофе в пространстве, созданном для вдохновения",
        "imageKey": "lifestyle-coffee"
      },
      {
        "title": "Совместная готовка",
        "description": "Кухня как место встреч",
        "imageKey": "lifestyle-cooking"
      },
      {
        "title": "Семейный очаг",
        "description": "Уголок, где каждый член семьи чувствует тепло и уют",
        "imageKey": "lifestyle-family"
      },
      {
        "title": "Творчество",
        "description": "Ваша кухня — лаборатория для кулинарных экспериментов и новых идей",
        "imageKey": "lifestyle-creative"
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
    "privacyLabel": "Политика конфиденциальности",
    "contactsTitle": "Контакты",
    "navigationTitle": "Навигация"
  }$$::jsonb
);

delete from public.cms_navigation
where site_id = 'main';

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
('main', 'footer', 'Кухня и человек', '#lifestyle', 50, true);

delete from public.cms_assets
where site_id = 'main';

insert into public.cms_assets (asset_key, site_id, public_url, alt, metadata)
values
('hero-kitchen', 'main', '/images/hero-kitchen.jpg', 'Современная кухня от Пегас', '{}'::jsonb),
('kitchen-1', 'main', '/images/kitchen-1.jpg', 'Кухня для Анны', '{}'::jsonb),
('kitchen-2', 'main', '/images/kitchen-2.jpg', 'Кухня для Михаила', '{}'::jsonb),
('kitchen-3', 'main', '/images/kitchen-3.jpg', 'Кухня для Елены', '{}'::jsonb),
('kitchen-4', 'main', '/images/kitchen-4.jpg', 'Кухня для Петра', '{}'::jsonb),
('lifestyle-coffee', 'main', '/images/lifestyle-coffee.jpg', 'Утренний кофе на кухне', '{}'::jsonb),
('lifestyle-cooking', 'main', '/images/lifestyle-cooking.jpg', 'Совместная готовка на кухне', '{}'::jsonb),
('lifestyle-creative', 'main', '/images/lifestyle-creative.jpg', 'Творчество на кухне', '{}'::jsonb),
('lifestyle-family', 'main', '/images/lifestyle-family.jpg', 'Семейный уют на кухне', '{}'::jsonb)
on conflict (asset_key) do update
set site_id = excluded.site_id,
    public_url = excluded.public_url,
    alt = excluded.alt,
    metadata = excluded.metadata,
    updated_at = timezone('utc', now());
