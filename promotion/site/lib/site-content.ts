// Purpose: one exact fallback copy of the v0 landing content and its TypeScript shapes.

export type NavLink = {
  label: string
  href: string
}

export type ActionLink = {
  label: string
  href: string
  eventName?: string
}

export type CmsAsset = {
  assetKey: string
  publicUrl: string
  alt: string
}

export type HeroContent = {
  eyebrow: string
  title: string
  description: string
  tagline?: string
  primaryCta: ActionLink
  secondaryCta: ActionLink
  imageKey: string
  statLabel: string
  statValue: string
}

export type ConfiguratorStep = {
  id: string
  title: string
  description: string
  kind?: "options" | "number"
  options?: Array<{ value: string; label: string; imageKey?: string }>
  fieldLabel?: string
  placeholder?: string
  step?: string
}

export type DiscountOption = {
  value: string
  label: string
  discount: string
  kind?: "percent" | "fixed"
  amount?: number
}

export type ConfiguratorContent = {
  eyebrow: string
  title: string
  description: string
  steps: ConfiguratorStep[]
  discountTitle: string
  discountDescription: string
  discountOptions: DiscountOption[]
  contactTitle: string
  contactDescription: string
  submitButtonLabel: string
  submittingLabel: string
  nextButtonLabel: string
  backButtonLabel: string
  messengerLabel: string
  consentLabel: string
  successTitle: string
  successDescription: string
  fields: {
    nameLabel: string
    namePlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    commentLabel: string
    commentPlaceholder: string
  }
}

export type PortfolioItem = {
  slug: string
  name: string
  imageKey: string
  galleryImageKeys: string[]
  style: string
  review: string
}

export type PortfolioContent = {
  eyebrow: string
  title: string
  description: string
  items: PortfolioItem[]
}

export type ContractCard = {
  icon: "clock" | "shield" | "wrench" | "banknote"
  title: string
  description: string
  highlight: string
}

export type ContractContent = {
  eyebrow: string
  title: string
  description: string
  cards: ContractCard[]
}

export type LifestyleItem = {
  imageKey: string
  title: string
  description: string
}

export type LifestyleContent = {
  eyebrow: string
  title: string
  description: string
  items: LifestyleItem[]
}

export type FooterContent = {
  description: string
  navigationTitle: string
  contactsTitle: string
  privacyLabel: string
}

export type SiteSettings = {
  siteId: string
  brandName: string
  brandTagline: string
  contentVersion?: string | null
  contactPhone: string
  email: string
  address: string
  whatsappPhone: string
  whatsappMessage: string
  footerCopyrightOwner: string
  offerVariant: string | null
  experimentKey: string | null
}

export type SiteContent = {
  source: "supabase" | "local_fallback"
  cmsEnabled: boolean
  page: {
    slug: string
    title: string
    description: string
  }
  site: SiteSettings
  navigation: {
    headerLinks: NavLink[]
    footerLinks: NavLink[]
    headerCta: ActionLink
  }
  sections: {
    hero: HeroContent
    configurator: ConfiguratorContent
    portfolio: PortfolioContent
    contract: ContractContent
    lifestyle: LifestyleContent
    footer: FooterContent
  }
  assets: Record<string, CmsAsset>
  diagnostics: {
    siteSource: "supabase" | "local_fallback"
    pageSource: "supabase" | "local_fallback"
    sectionSource: "supabase" | "local_fallback"
    navigationSource: "supabase" | "local_fallback"
    assetSource: "supabase" | "local_fallback"
    errors: string[]
  }
}

export const CURRENT_CONTENT_VERSION = "landing-literal-2026-03-11"

export const fallbackSiteContent: SiteContent = {
  source: "local_fallback",
  cmsEnabled: false,
  page: {
    slug: "home",
    title: "Пегас - Кухни, которые освобождают пространство и время",
    description:
      "Премиальные кухни на заказ. Просто выбрать. Легко жить. 3D проект, изготовление за 14 дней, гарантия 5 лет.",
  },
  site: {
    siteId: "main",
    brandName: "Пегас",
    brandTagline: "Кухни, которые освобождают пространство и время.",
    contentVersion: CURRENT_CONTENT_VERSION,
    contactPhone: "+7 916 670-00-43",
    email: "vasiliy.kruk@yandex.com",
    address: "Россия, г. Ростов-на-Дону, Троллейбусная 16 В",
    whatsappPhone: "",
    whatsappMessage: "Здравствуйте, хочу обсудить проект кухни.",
    footerCopyrightOwner: "ООО «Пегас»",
    offerVariant: "default",
    experimentKey: null,
  },
  navigation: {
    headerLinks: [
      { label: "3D-проект", href: "#configurator" },
      { label: "Портфолио", href: "#portfolio" },
      { label: "Контракт", href: "#contract" },
      { label: "Кухня и жизнь", href: "#lifestyle" },
    ],
    footerLinks: [
      { label: "Главная", href: "#hero" },
      { label: "3D-проект", href: "#configurator" },
      { label: "Портфолио", href: "#portfolio" },
      { label: "Контракт", href: "#contract" },
      { label: "Кухня и жизнь", href: "#lifestyle" },
    ],
    headerCta: {
      label: "Получить персональный расчет",
      href: "#configurator",
      eventName: "start_quiz",
    },
  },
  sections: {
    hero: {
      eyebrow: "",
      title: "Просто выбрать.\nЛегко жить.",
      description: "",
      tagline: "Кухни, которые освобождают пространство и время",
      primaryCta: {
        label: "Выбрать опции",
        href: "#configurator",
        eventName: "start_quiz",
      },
      secondaryCta: {
        label: "Посмотреть проекты",
        href: "#portfolio",
      },
      imageKey: "hero-kitchen",
      statLabel: "",
      statValue: "",
    },
    configurator: {
      eyebrow: "3D-проект",
      title: "Созидание замыслов",
      description: "Благодаря вашим ответам сможем подготовить индивидуальный 3D-проект",
      steps: [
        {
          id: "style",
          title: "Атмосфера",
          description: "Выберите стиль кухни",
          kind: "options",
          options: [
            {
              value: "scandinavian-minimalism",
              label: "Скандинавский минимализм",
              imageKey: "/images/kitchen-1.jpg",
            },
            {
              value: "modern-classic",
              label: "Современная классика",
              imageKey: "/images/kitchen-2.jpg",
            },
            {
              value: "eco-style",
              label: "Эко-стиль",
              imageKey: "/images/kitchen-3.jpg",
            },
            {
              value: "premium",
              label: "Премиум",
              imageKey: "/images/kitchen-4.jpg",
            },
          ],
        },
        {
          id: "shape",
          title: "Форма кухни",
          description: "Выберите конфигурацию",
          kind: "options",
          options: [
            { value: "straight", label: "Прямая", imageKey: "/images/configurator/shape-straight.jpg" },
            { value: "l-shaped", label: "Угловая", imageKey: "/images/configurator/shape-l-shaped.jpg" },
            { value: "u-shaped", label: "П-образная", imageKey: "/images/configurator/shape-u-shaped.jpg" },
          ],
        },
        {
          id: "length",
          title: "Длина кухни",
          description: "",
          kind: "number",
          fieldLabel: "Длина кухни, пог. м",
          placeholder: "Например: 3.2",
          step: "0.1",
          options: [],
        },
        {
          id: "base-cabinets",
          title: "Напольные шкафы",
          description: "Тип нижних модулей",
          kind: "options",
          options: [
            {
              value: "standard",
              label: "Стандартные",
              imageKey: "/images/configurator/base-cabinets-standard.jpg",
            },
            {
              value: "handleless",
              label: "Без ручек",
              imageKey: "/images/configurator/base-cabinets-handleless.jpg",
            },
          ],
        },
        {
          id: "wall-cabinets",
          title: "Навесные шкафы",
          description: "Тип верхних модулей",
          kind: "options",
          options: [
            {
              value: "standard",
              label: "Стандартные",
              imageKey: "/images/configurator/wall-cabinets-standard.jpg",
            },
            {
              value: "handleless",
              label: "Без ручек",
              imageKey: "/images/configurator/wall-cabinets-handleless.jpg",
            },
          ],
        },
        {
          id: "oven",
          title: "Духовка",
          description: "Расположение духового шкафа",
          kind: "options",
          options: [
            { value: "base", label: "В нижнем шкафу", imageKey: "/images/configurator/oven-base.jpg" },
            { value: "tall", label: "В высоком шкафу", imageKey: "/images/configurator/oven-tall.jpg" },
            { value: "pencil", label: "В пенале", imageKey: "/images/configurator/oven-pencil.jpg" },
          ],
        },
        {
          id: "fridge",
          title: "Холодильник",
          description: "Расположение холодильника",
          kind: "options",
          options: [
            {
              value: "builtin",
              label: "Встроен в шкаф",
              imageKey: "/images/configurator/fridge-builtin.jpg",
            },
            {
              value: "standalone",
              label: "Отдельно стоящий",
              imageKey: "/images/configurator/fridge-standalone.jpg",
            },
            {
              value: "side-by-side",
              label: "Side-by-Side",
              imageKey: "/images/configurator/fridge-side-by-side.jpg",
            },
            {
              value: "external",
              label: "Вне гарнитура",
              imageKey: "/images/configurator/fridge-external.jpg",
            },
          ],
        },
        {
          id: "sink",
          title: "Мойка и посудомоечная машина",
          description: "Мойка и посудомоечная машина",
          kind: "options",
          options: [
            { value: "sink-only", label: "Только мойка", imageKey: "/images/configurator/sink-sink-only.jpg" },
            {
              value: "sink-pm45",
              label: "Мойка и посудомоечная машина 45",
              imageKey: "/images/configurator/sink-sink-pm45.jpg",
            },
            {
              value: "sink-pm60",
              label: "Мойка и посудомоечная машина 60",
              imageKey: "/images/configurator/sink-sink-pm60.jpg",
            },
          ],
        },
        {
          id: "cooktop",
          title: "Печь",
          description: "Тип варочной поверхности",
          kind: "options",
          options: [
            {
              value: "electric",
              label: "Электрическая",
              imageKey: "/images/configurator/cooktop-electric.jpg",
            },
            {
              value: "induction",
              label: "Индукционная",
              imageKey: "/images/configurator/cooktop-induction.jpg",
            },
            { value: "gas", label: "Газовая", imageKey: "/images/configurator/cooktop-gas.jpg" },
          ],
        },
        {
          id: "hood",
          title: "Вытяжка",
          description: "Тип вытяжки",
          kind: "options",
          options: [
            { value: "builtin", label: "Встроенная", imageKey: "/images/configurator/hood-builtin.jpg" },
            { value: "dome", label: "Купольная", imageKey: "/images/configurator/hood-dome.jpg" },
            { value: "angled", label: "Наклонная", imageKey: "/images/configurator/hood-angled.jpg" },
          ],
        },
      ],
      discountTitle: "Если Вы хотели бы получить скидку, здесь можно выбрать способы её получения.",
      discountDescription: "",
      discountOptions: [
        { value: "video-review", label: "Оставить видеоотзыв о компании", discount: "3%", kind: "percent", amount: 3 },
        { value: "standard-project", label: "Оставить типовой проект", discount: "5%", kind: "percent", amount: 5 },
        { value: "kitchen-wardrobe", label: "Заказать мебель дополнительно к кухне", discount: "2%", kind: "percent", amount: 2 },
        { value: "full-prepayment", label: "Внести предоплату в размере 100%", discount: "7%", kind: "percent", amount: 7 },
      ],
      contactTitle: "Бесплатный 3D-проект",
      contactDescription: "Оставьте контакты, и мы подготовим дизайн-проект для вас",
      submitButtonLabel: "Отправить заявку",
      submittingLabel: "Отправка...",
      nextButtonLabel: "Далее",
      backButtonLabel: "Назад",
      messengerLabel: "Связаться через мессенджер",
      consentLabel: "Согласие на обработку персональных данных",
      successTitle: "Заявка отправлена!",
      successDescription:
        "Мы свяжемся с вами в ближайшее время для обсуждения вашего проекта. Бесплатный 3D-проект уже в работе.",
      fields: {
        nameLabel: "Имя",
        namePlaceholder: "ваше имя",
        phoneLabel: "Напишите пожалуйста ваш номер телефона",
        phonePlaceholder: "Напишите пожалуйста ваш номер телефона",
        commentLabel: "Комментарий",
        commentPlaceholder: "Опишите пожелания к проекту",
      },
    },
    portfolio: {
      eyebrow: "Портфолио",
      title: "Выполненные проекты",
      description:
        "Каждая кухня — индивидуальная история, созданная с вниманием к деталям и любовью к делу.",
      items: [
        {
          slug: "anna",
          name: "Анна",
          imageKey: "kitchen-1",
          galleryImageKeys: [
            "/images/portfolio/anna-1.jpg",
            "/images/portfolio/anna-2.jpg",
            "/images/portfolio/anna-3.jpg",
          ],
          style: "Скандинавский минимализм",
          review:
            "Кухня мечты! Всё продумано до мелочей, от планировки до освещения. Процесс заказа был настолько простым, что я не верила своим глазам.",
        },
        {
          slug: "mihail",
          name: "Михаил",
          imageKey: "kitchen-2",
          galleryImageKeys: [
            "/images/portfolio/mihail-1.jpg",
            "/images/portfolio/mihail-2.jpg",
            "/images/portfolio/mihail-3.jpg",
          ],
          style: "Современная классика",
          review:
            "Профессиональный подход на каждом этапе. 3D-проект полностью совпал с результатом. Рекомендую всем, кто ценит качество.",
        },
        {
          slug: "elena",
          name: "Елена",
          imageKey: "kitchen-3",
          galleryImageKeys: [
            "/images/portfolio/elena-1.jpg",
            "/images/portfolio/elena-2.jpg",
            "/images/portfolio/elena-3.jpg",
          ],
          style: "Эко-стиль",
          review:
            "Мы долго искали мастеров, которые поймут нашу идею. Пегас превзошёл все ожидания — кухня стала сердцем нашего дома.",
        },
        {
          slug: "petr",
          name: "Пётр",
          imageKey: "kitchen-4",
          galleryImageKeys: [
            "/images/portfolio/petr-1.jpg",
            "/images/portfolio/petr-2.jpg",
            "/images/portfolio/petr-3.jpg",
          ],
          style: "Премиум",
          review:
            "Качество материалов и сборки на высшем уровне. Кухня работает как швейцарские часы. Спасибо команде Пегас!",
        },
      ],
    },
    contract: {
      eyebrow: "Контракт",
      title: "Прозрачные условия",
      description:
        "Процесс покупки кухни простой и предсказуемый — от первого звонка до установки",
      cards: [
        {
          icon: "clock",
          title: "14 дней срок поставки",
          description:
            "Среднерыночный срок — от 45 до 60 дней. Здесь производство и логистика выстроены так, что ваша кухня готова за 14.",
          highlight: "",
        },
        {
          icon: "shield",
          title: "Гарантия 5 лет на всё",
          description: "Полная гарантия на фасады, фурнитуру и механизмы. Моментальная замена в случае поломки.",
          highlight: "",
        },
        {
          icon: "wrench",
          title: "1 подрядчик по всем вопросам",
          description:
            "Вся бытовая техника подбирается, доставляется и встраивается в кухню. Скидки от производителей входят в контракт.",
          highlight: "",
        },
        {
          icon: "banknote",
          title: "70 000 ₽ / пог. метр",
          description:
            "В цену уже входят корпуса, фасады, влагостойкая столешница, фурнитура и сборка. Всё прозрачно — без скрытых платежей.",
          highlight: "",
        },
      ],
    },
    lifestyle: {
      eyebrow: "Кухня и жизнь",
      title: "Больше, чем мебель",
      description:
        "Кухня — это место, где начинается и заканчивается каждый день. Простор для жизни, творчества и любви.",
      items: [
        {
          imageKey: "lifestyle-coffee",
          title: "Утренняя бодрость",
          description: "Начало дня с идеальной чашкой кофе в пространстве, созданном для вдохновения",
        },
        {
          imageKey: "lifestyle-cooking",
          title: "Совместная кулинария",
          description: "Атмосфера, в которой рождаются вкусы и укрепляются отношения",
        },
        {
          imageKey: "lifestyle-family",
          title: "Семейный очаг",
          description: "Уголок, где каждый член семьи чувствует тепло и уют",
        },
        {
          imageKey: "lifestyle-creative",
          title: "Творчество",
          description: "Лаборатория для гастрономических экспериментов и новых идей",
        },
      ],
    },
    footer: {
      description: "Свобода для полёта мечты",
      navigationTitle: "Навигация",
      contactsTitle: "Контакты",
      privacyLabel: "Политика конфиденциальности",
    },
  },
  assets: {
    "hero-kitchen": {
      assetKey: "hero-kitchen",
      publicUrl: "/images/hero-kitchen.jpg",
      alt: "Современная кухня от Пегас",
    },
    "kitchen-1": {
      assetKey: "kitchen-1",
      publicUrl: "/images/kitchen-1.jpg",
      alt: "Кухня для Анны",
    },
    "kitchen-2": {
      assetKey: "kitchen-2",
      publicUrl: "/images/kitchen-2.jpg",
      alt: "Кухня для Михаила",
    },
    "kitchen-3": {
      assetKey: "kitchen-3",
      publicUrl: "/images/kitchen-3.jpg",
      alt: "Кухня для Елены",
    },
    "kitchen-4": {
      assetKey: "kitchen-4",
      publicUrl: "/images/kitchen-4.jpg",
      alt: "Кухня для Петра",
    },
    "lifestyle-coffee": {
      assetKey: "lifestyle-coffee",
      publicUrl: "/images/lifestyle-coffee.jpg",
      alt: "Утренний кофе на кухне",
    },
    "lifestyle-cooking": {
      assetKey: "lifestyle-cooking",
      publicUrl: "/images/lifestyle-cooking.jpg",
      alt: "Совместная готовка на кухне",
    },
    "lifestyle-family": {
      assetKey: "lifestyle-family",
      publicUrl: "/images/lifestyle-family.jpg",
      alt: "Семейный уют на кухне",
    },
    "lifestyle-creative": {
      assetKey: "lifestyle-creative",
      publicUrl: "/images/lifestyle-creative.jpg",
      alt: "Творчество на кухне",
    },
  },
  diagnostics: {
    siteSource: "local_fallback",
    pageSource: "local_fallback",
    sectionSource: "local_fallback",
    navigationSource: "local_fallback",
    assetSource: "local_fallback",
    errors: [],
  },
}
