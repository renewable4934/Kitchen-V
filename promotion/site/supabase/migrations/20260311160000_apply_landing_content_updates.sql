-- Title: CMS seed for the exact v0 landing
-- Purpose: fills Supabase CMS tables with the current Pegas landing content, navigation and image references.
-- Owner: Project team
-- Last updated: 2026-03-11

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

insert into public.cms_pages (slug, site_id, meta, content, published)
values (
  'home',
  'main',
  $${
    "title": "Пегас - Кухни, которые освобождают пространство и время",
    "description": "Премиальные кухни на заказ. Просто выбрать. Легко жить. 3D-проект, изготовление за 14 дней, гарантия 5 лет."
  }$$::jsonb,
  '{}'::jsonb,
  true
)
on conflict (slug) do update
set site_id = excluded.site_id,
    meta = excluded.meta,
    content = excluded.content,
    published = excluded.published,
    updated_at = timezone('utc', now());

delete from public.cms_sections
where site_id = 'main'
  and page_slug = 'home'
  and variant_key = 'default';

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
    "title": "Просто выбрать. Легко жить.",
    "description": "",
    "signature": "Кухни, которые освобождают пространство и время",
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
    "eyebrow": "",
    "title": "Созидание замыслов",
    "description": "Благодаря Вашим ответам мы сможем подготовить индивидуальный 3D проект",
    "steps": [
      {
        "id": "style",
        "title": "Атмосфера",
        "description": "Выберите стиль кухни",
        "inputType": "options",
        "options": [
          { "value": "scandinavian-minimalism", "label": "Скандинавский минимализм", "imageKey": "kitchen-1", "imageAlt": "Скандинавский минимализм" },
          { "value": "modern-classic", "label": "Современная классика", "imageKey": "kitchen-2", "imageAlt": "Современная классика" },
          { "value": "eco-style", "label": "Эко-стиль", "imageKey": "kitchen-3", "imageAlt": "Эко-стиль" },
          { "value": "premium", "label": "Премиум", "imageKey": "kitchen-4", "imageAlt": "Премиум" }
        ]
      },
      {
        "id": "length",
        "title": "Длина кухни, пог. м",
        "description": "Укажите длину кухни",
        "inputType": "number",
        "placeholder": "Например: 3.2",
        "min": 1,
        "step": 0.1,
        "options": []
      },
      {
        "id": "shape",
        "title": "Форма кухни",
        "description": "Выберите конфигурацию",
        "inputType": "options",
        "options": [
          { "value": "straight", "label": "Прямая", "imageKey": "kitchen-1", "imageAlt": "Прямая кухня" },
          { "value": "l-shaped", "label": "Угловая", "imageKey": "kitchen-2", "imageAlt": "Угловая кухня" },
          { "value": "u-shaped", "label": "П-образная", "imageKey": "kitchen-4", "imageAlt": "П-образная кухня" }
        ]
      },
      {
        "id": "base-cabinets",
        "title": "Напольные шкафы",
        "description": "Тип нижних модулей",
        "inputType": "options",
        "options": [
          { "value": "standard", "label": "Стандартные", "imageKey": "kitchen-2", "imageAlt": "Стандартные напольные шкафы" },
          { "value": "handleless", "label": "Без ручек", "imageKey": "kitchen-4", "imageAlt": "Напольные шкафы без ручек" }
        ]
      },
      {
        "id": "wall-cabinets",
        "title": "Навесные шкафы",
        "description": "Тип верхних модулей",
        "inputType": "options",
        "options": [
          { "value": "standard", "label": "Стандартные", "imageKey": "kitchen-1", "imageAlt": "Стандартные навесные шкафы" },
          { "value": "handleless", "label": "Без ручек", "imageKey": "kitchen-4", "imageAlt": "Навесные шкафы без ручек" }
        ]
      },
      {
        "id": "oven",
        "title": "Духовка",
        "description": "Расположение духового шкафа",
        "inputType": "options",
        "options": [
          { "value": "base", "label": "В нижнем шкафу", "imageKey": "kitchen-1", "imageAlt": "Духовка в нижнем шкафу" },
          { "value": "tall", "label": "В высоком шкафу", "imageKey": "kitchen-2", "imageAlt": "Духовка в высоком шкафу" },
          { "value": "pencil", "label": "В пенале", "imageKey": "kitchen-4", "imageAlt": "Духовка в пенале" }
        ]
      },
      {
        "id": "fridge",
        "title": "Холодильник",
        "description": "Расположение холодильника",
        "inputType": "options",
        "options": [
          { "value": "builtin", "label": "Встроен в шкаф", "imageKey": "kitchen-2", "imageAlt": "Встроенный холодильник" },
          { "value": "standalone", "label": "Отдельно стоящий", "imageKey": "kitchen-3", "imageAlt": "Отдельно стоящий холодильник" },
          { "value": "side-by-side", "label": "Side-by-Side", "imageKey": "kitchen-4", "imageAlt": "Холодильник Side-by-Side" },
          { "value": "external", "label": "Вне гарнитура", "imageKey": "hero-kitchen", "imageAlt": "Холодильник вне гарнитура" }
        ]
      },
      {
        "id": "sink",
        "title": "Мойка и посудомоечная машина",
        "description": "Выберите комбинацию мойки и посудомоечной машины",
        "inputType": "options",
        "options": [
          { "value": "sink-only", "label": "Только мойка", "imageKey": "kitchen-1", "imageAlt": "Кухня только с мойкой" },
          { "value": "sink-dishwasher-45", "label": "Мойка + посудомоечная машина 45", "imageKey": "kitchen-2", "imageAlt": "Кухня с мойкой и посудомоечной машиной 45" },
          { "value": "sink-dishwasher-60", "label": "Мойка + посудомоечная машина 60", "imageKey": "kitchen-4", "imageAlt": "Кухня с мойкой и посудомоечной машиной 60" }
        ]
      },
      {
        "id": "cooktop",
        "title": "Печь",
        "description": "Тип варочной поверхности",
        "inputType": "options",
        "options": [
          { "value": "electric", "label": "Электрическая", "imageKey": "kitchen-3", "imageAlt": "Электрическая варочная поверхность" },
          { "value": "induction", "label": "Индукционная", "imageKey": "kitchen-4", "imageAlt": "Индукционная варочная поверхность" },
          { "value": "gas", "label": "Газовая", "imageKey": "hero-kitchen", "imageAlt": "Газовая варочная поверхность" }
        ]
      },
      {
        "id": "hood",
        "title": "Вытяжка",
        "description": "Тип вытяжки",
        "inputType": "options",
        "options": [
          { "value": "builtin", "label": "Встроенная", "imageKey": "kitchen-2", "imageAlt": "Встроенная вытяжка" },
          { "value": "dome", "label": "Купольная", "imageKey": "hero-kitchen", "imageAlt": "Купольная вытяжка" },
          { "value": "angled", "label": "Наклонная", "imageKey": "kitchen-4", "imageAlt": "Наклонная вытяжка" }
        ]
      }
    ],
    "discountTitle": "Соберите скидку",
    "discountDescription": "Выберите подходящие варианты для дополнительной скидки",
    "discountOptions": [
      { "value": "video-review", "label": "Видеоотзыв", "discountLabel": "3%", "discountType": "percent", "discountValue": 3 },
      { "value": "standard-project", "label": "Типовой проект", "discountLabel": "5%", "discountType": "percent", "discountValue": 5 },
      { "value": "kitchen-wardrobe", "label": "Кухня + шкаф", "discountLabel": "4000 ₽", "discountType": "fixed", "discountValue": 4000 },
      { "value": "full-prepayment", "label": "100% предоплата", "discountLabel": "7%", "discountType": "percent", "discountValue": 7 }
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
    "eyebrow": "",
    "title": "Выполненные проекты",
    "description": "Каждая кухня — индивидуальная история, созданная с вниманием к деталям и любовью к своему делу.",
    "items": [
      {
        "slug": "anna-scandinavian",
        "name": "Анна",
        "imageKey": "kitchen-1",
        "style": "Скандинавский минимализм",
        "review": "Кухня мечты! Всё продумано до мелочей, от планировки до освещения. Процесс заказа был настолько простым, что я не верила своим глазам.",
        "galleryImageKeys": ["kitchen-1", "hero-kitchen", "kitchen-2"],
        "videoReviewUrl": "",
        "videoReviewPosterKey": "kitchen-1"
      },
      {
        "slug": "mihail-modern-classic",
        "name": "Михаил",
        "imageKey": "kitchen-2",
        "style": "Современная классика",
        "review": "Профессиональный подход на каждом этапе. 3D-проект полностью совпал с результатом. Рекомендую всем, кто ценит качество.",
        "galleryImageKeys": ["kitchen-2", "kitchen-4", "hero-kitchen"],
        "videoReviewUrl": "",
        "videoReviewPosterKey": "kitchen-2"
      },
      {
        "slug": "elena-eco-style",
        "name": "Елена",
        "imageKey": "kitchen-3",
        "style": "Эко-стиль",
        "review": "Мы долго искали мастеров, которые поймут нашу идею. Пегас превзошёл все ожидания — кухня стала сердцем нашего дома.",
        "galleryImageKeys": ["kitchen-3", "kitchen-1", "hero-kitchen"],
        "videoReviewUrl": "",
        "videoReviewPosterKey": "kitchen-3"
      },
      {
        "slug": "petr-premium",
        "name": "Пётр",
        "imageKey": "kitchen-4",
        "style": "Премиум",
        "review": "Качество материалов и сборки на высшем уровне. Кухня работает как швейцарские часы. Спасибо команде Пегас!",
        "galleryImageKeys": ["kitchen-4", "hero-kitchen", "kitchen-2"],
        "videoReviewUrl": "",
        "videoReviewPosterKey": "kitchen-4"
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
    "eyebrow": "",
    "title": "Прозрачные условия",
    "description": "Процесс покупки кухни простой и предсказуемый — от первого звонка до установки",
    "cards": [
      { "icon": "clock", "title": "14 дней срок поставки", "description": "Начать готовить — быстрее", "highlight": "" },
      { "icon": "shield", "title": "5 лет гарантии на всё", "description": "Оставаться спокойным — дольше", "highlight": "" },
      { "icon": "banknote", "title": "70 000 ₽/м стоимость кухни", "description": "Покупать — выгоднее", "highlight": "" },
      { "icon": "wrench", "title": "1 подрядчик", "description": "Передать под ключ — надежнее", "highlight": "" }
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
    "eyebrow": "",
    "title": "Больше, чем мебель",
    "description": "Кухня — это место, где начинается и заканчивается каждый день. Простор для жизни, творчества и любви",
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
    "privacyLabel": "Политика конфиденциальности",
    "logoKey": "pegas-logo-main"
  }$$::jsonb
);

delete from public.cms_navigation
where site_id = 'main';

insert into public.cms_navigation (site_id, area, label, href, sort_order, is_enabled)
values
  ('main', 'header', '3D-проект для Вас', '#configurator', 10, true),
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
  ('pegas-logo-main', 'main', '/pegas-logo-main.png', 'Логотип Пегас', '{}'::jsonb),
  ('hero-kitchen', 'main', '/images/hero-kitchen.jpg', 'Современная кухня от Пегас', '{}'::jsonb),
  ('kitchen-1', 'main', '/images/kitchen-1.jpg', 'Кухня для Анны', '{}'::jsonb),
  ('kitchen-2', 'main', '/images/kitchen-2.jpg', 'Кухня для Михаила', '{}'::jsonb),
  ('kitchen-3', 'main', '/images/kitchen-3.jpg', 'Кухня для Елены', '{}'::jsonb),
  ('kitchen-4', 'main', '/images/kitchen-4.jpg', 'Кухня для Петра', '{}'::jsonb),
  ('lifestyle-coffee', 'main', '/images/lifestyle-coffee.jpg', 'Утренняя бодрость на кухне', '{}'::jsonb),
  ('lifestyle-cooking', 'main', '/images/lifestyle-cooking.jpg', 'Совместная готовка на кухне', '{}'::jsonb),
  ('lifestyle-family', 'main', '/images/lifestyle-family.jpg', 'Семейный уют на кухне', '{}'::jsonb),
  ('lifestyle-creative', 'main', '/images/lifestyle-creative.jpg', 'Творчество на кухне', '{}'::jsonb);
