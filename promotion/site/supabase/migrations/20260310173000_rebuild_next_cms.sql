-- Title: Rebuild Next.js CMS schema and seed
-- Purpose: migrate the remote Supabase project to the new Next.js landing CMS model and seed the exact v0 content.
-- Owner: Project team
-- Last updated: 2026-03-10

create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  funnel_type text not null,
  name text not null,
  phone text not null,
  city text not null default 'Москва',
  comment text,
  prefer_messenger boolean not null default false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  yclid text,
  vkclid text,
  quiz_answers jsonb not null default '{}'::jsonb,
  offer_variant text,
  experiment_key text,
  landing_url text,
  client_id text,
  timestamp timestamptz not null default timezone('utc', now()),
  ip text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.leads add column if not exists comment text;
alter table public.leads add column if not exists prefer_messenger boolean not null default false;
alter table public.leads add column if not exists yclid text;
alter table public.leads add column if not exists vkclid text;
alter table public.leads add column if not exists offer_variant text;
alter table public.leads add column if not exists experiment_key text;
alter table public.leads alter column id set default gen_random_uuid();
alter table public.leads alter column city set default 'Москва';
alter table public.leads alter column timestamp set default timezone('utc', now());

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  funnel_type text,
  offer_variant text,
  experiment_key text,
  landing_url text,
  client_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  yclid text,
  vkclid text,
  metadata jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default timezone('utc', now()),
  ip text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.events add column if not exists experiment_key text;
alter table public.events add column if not exists utm_medium text;
alter table public.events add column if not exists utm_campaign text;
alter table public.events add column if not exists yclid text;
alter table public.events add column if not exists vkclid text;
alter table public.events add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.events add column if not exists created_at timestamptz not null default timezone('utc', now());
alter table public.events alter column id set default gen_random_uuid();
alter table public.events alter column timestamp set default timezone('utc', now());

create table if not exists public.cms_sites (
  id text primary key,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cms_pages (
  slug text primary key,
  site_id text not null default 'main',
  meta jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.cms_pages add column if not exists site_id text not null default 'main';
alter table public.cms_pages add column if not exists meta jsonb not null default '{}'::jsonb;
alter table public.cms_pages add column if not exists published boolean not null default true;
alter table public.cms_pages add column if not exists updated_at timestamptz not null default timezone('utc', now());
alter table public.cms_pages add column if not exists content jsonb not null default '{}'::jsonb;

create table if not exists public.cms_sections (
  id bigint generated always as identity primary key,
  site_id text not null,
  page_slug text not null,
  section_key text not null,
  sort_order integer not null default 100,
  variant_key text not null default 'default',
  is_enabled boolean not null default true,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists cms_sections_unique
on public.cms_sections (site_id, page_slug, section_key, variant_key);

create table if not exists public.cms_navigation (
  id bigint generated always as identity primary key,
  site_id text not null,
  area text not null,
  label text not null,
  href text not null,
  sort_order integer not null default 100,
  is_enabled boolean not null default true,
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists cms_navigation_unique
on public.cms_navigation (site_id, area, href, label);

create table if not exists public.cms_assets (
  asset_key text primary key,
  site_id text not null,
  public_url text not null,
  alt text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.leads enable row level security;
alter table public.events enable row level security;
alter table public.cms_sites enable row level security;
alter table public.cms_pages enable row level security;
alter table public.cms_sections enable row level security;
alter table public.cms_navigation enable row level security;
alter table public.cms_assets enable row level security;

drop policy if exists "Allow anon insert leads" on public.leads;
create policy "Allow anon insert leads"
on public.leads
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow anon insert events" on public.events;
create policy "Allow anon insert events"
on public.events
for insert
to anon, authenticated
with check (true);

drop policy if exists "Allow anon read cms sites" on public.cms_sites;
create policy "Allow anon read cms sites"
on public.cms_sites
for select
to anon, authenticated
using (true);

drop policy if exists "Allow anon read cms pages" on public.cms_pages;
create policy "Allow anon read cms pages"
on public.cms_pages
for select
to anon, authenticated
using (published = true);

drop policy if exists "Allow anon read cms sections" on public.cms_sections;
create policy "Allow anon read cms sections"
on public.cms_sections
for select
to anon, authenticated
using (is_enabled = true);

drop policy if exists "Allow anon read cms navigation" on public.cms_navigation;
create policy "Allow anon read cms navigation"
on public.cms_navigation
for select
to anon, authenticated
using (is_enabled = true);

drop policy if exists "Allow anon read cms assets" on public.cms_assets;
create policy "Allow anon read cms assets"
on public.cms_assets
for select
to anon, authenticated
using (true);

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

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cms_pages'
      and column_name = 'content'
  ) then
    insert into public.cms_pages (slug, site_id, meta, content, published)
    values (
      'home',
      'main',
      $json${
        "title": "Пегас - Кухни, которые освобождают пространство и время",
        "description": "Премиальные кухни на заказ. Просто выбрать. Легко жить. 3D проект, изготовление за 14 дней, гарантия 5 лет."
      }$json$::jsonb,
      '{}'::jsonb,
      true
    )
    on conflict (slug) do update
    set site_id = excluded.site_id,
        meta = excluded.meta,
        content = coalesce(public.cms_pages.content, '{}'::jsonb),
        published = excluded.published,
        updated_at = timezone('utc', now());
  else
    insert into public.cms_pages (slug, site_id, meta, published)
    values (
      'home',
      'main',
      $json${
        "title": "Пегас - Кухни, которые освобождают пространство и время",
        "description": "Премиальные кухни на заказ. Просто выбрать. Легко жить. 3D проект, изготовление за 14 дней, гарантия 5 лет."
      }$json$::jsonb,
      true
    )
    on conflict (slug) do update
    set site_id = excluded.site_id,
        meta = excluded.meta,
        published = excluded.published,
        updated_at = timezone('utc', now());
  end if;
end $$;

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
    "eyebrow": "3D-проект для Вас",
    "title": "Созидание замыслов",
    "description": "Благодаря Вашим ответам мы сможем подготовить индивидуальный 3D проект",
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
  ('main', 'header', '3D-проект для Вас', '#configurator', 10, true),
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
