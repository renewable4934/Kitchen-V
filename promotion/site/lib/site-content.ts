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
  options: Array<{ value: string; label: string }>
}

export type DiscountOption = {
  value: string
  label: string
  discount: string
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
  name: string
  imageKey: string
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
    contactPhone: "+7 (800) 000-00-00",
    email: "info@pegas-kitchen.ru",
    address: "Москва, Россия",
    whatsappPhone: "",
    whatsappMessage: "Здравствуйте, хочу обсудить проект кухни.",
    footerCopyrightOwner: "ООО «Пегас»",
    offerVariant: "default",
    experimentKey: null,
  },
  navigation: {
    headerLinks: [
      { label: "3D проект для Вас", href: "#configurator" },
      { label: "Портфолио", href: "#portfolio" },
      { label: "Контракт", href: "#contract" },
      { label: "Кухня и человек", href: "#lifestyle" },
    ],
    footerLinks: [
      { label: "Главная", href: "#hero" },
      { label: "3D проект", href: "#configurator" },
      { label: "Портфолио", href: "#portfolio" },
      { label: "Контракт", href: "#contract" },
    ],
    headerCta: {
      label: "Оставить заявку",
      href: "#configurator",
      eventName: "start_quiz",
    },
  },
  sections: {
    hero: {
      eyebrow: "Расправьте крылья",
      title: "Просто выбрать. Легко жить.",
      description:
        "Кухни, которые освобождают пространство и время. Больше не нужно искать подрядчика — всё просто и понятно.",
      primaryCta: {
        label: "Создать проект",
        href: "#configurator",
        eventName: "start_quiz",
      },
      secondaryCta: {
        label: "Смотреть работы",
        href: "#portfolio",
      },
      imageKey: "hero-kitchen",
      statLabel: "Срок изготовления",
      statValue: "14 дней",
    },
    configurator: {
      eyebrow: "3D проект для Вас",
      title: "Создайте свою кухню",
      description: "Ответьте на несколько вопросов, и мы бесплатно подготовим 3D-проект",
      steps: [
        {
          id: "style",
          title: "Атмосфера",
          description: "Выберите стиль кухни",
          options: [
            { value: "modern", label: "Современный" },
            { value: "classic", label: "Классический" },
            { value: "scandinavian", label: "Скандинавский" },
            { value: "minimalist", label: "Минимализм" },
            { value: "loft", label: "Лофт" },
            { value: "eco", label: "Эко" },
          ],
        },
        {
          id: "shape",
          title: "Форма кухни",
          description: "Выберите конфигурацию",
          options: [
            { value: "straight", label: "Прямая" },
            { value: "l-shaped", label: "Угловая" },
            { value: "u-shaped", label: "П-образная" },
          ],
        },
        {
          id: "base-cabinets",
          title: "Напольные шкафы",
          description: "Тип нижних модулей",
          options: [
            { value: "standard", label: "Стандартные" },
            { value: "handleless", label: "Без ручек" },
          ],
        },
        {
          id: "wall-cabinets",
          title: "Навесные шкафы",
          description: "Тип верхних модулей",
          options: [
            { value: "standard", label: "Стандартные" },
            { value: "handleless", label: "Без ручек" },
          ],
        },
        {
          id: "oven",
          title: "Духовка",
          description: "Расположение духового шкафа",
          options: [
            { value: "base", label: "В нижнем шкафу" },
            { value: "tall", label: "В высоком шкафу" },
            { value: "pencil", label: "В пенале" },
          ],
        },
        {
          id: "fridge",
          title: "Холодильник",
          description: "Расположение холодильника",
          options: [
            { value: "builtin", label: "Встроен в шкаф" },
            { value: "standalone", label: "Отдельно стоящий" },
            { value: "side-by-side", label: "Side-by-Side" },
            { value: "external", label: "Вне гарнитура" },
          ],
        },
        {
          id: "sink",
          title: "Мойка и ПМ",
          description: "Мойка и посудомоечная машина",
          options: [
            { value: "sink-only", label: "Только мойка" },
            { value: "sink-pm45", label: "Мойка + ПМ 45" },
            { value: "sink-pm60", label: "Мойка + ПМ 60" },
          ],
        },
        {
          id: "cooktop",
          title: "Печь",
          description: "Тип варочной поверхности",
          options: [
            { value: "electric", label: "Электрическая" },
            { value: "induction", label: "Индукционная" },
            { value: "gas", label: "Газовая" },
          ],
        },
        {
          id: "hood",
          title: "Вытяжка",
          description: "Тип вытяжки",
          options: [
            { value: "builtin", label: "Встроенная" },
            { value: "dome", label: "Купольная" },
            { value: "angled", label: "Наклонная" },
          ],
        },
      ],
      discountTitle: "Соберите скидку",
      discountDescription: "Выберите подходящие варианты для дополнительной скидки",
      discountOptions: [
        { value: "video-review", label: "Оставить видеоотзыв", discount: "5%" },
        { value: "standard-project", label: "Типовой проект", discount: "7%" },
        { value: "stock-parts", label: "Детали со склада", discount: "10%" },
      ],
      contactTitle: "Бесплатный 3D-проект",
      contactDescription: "Оставьте контакты, и мы подготовим дизайн-проект для Вас",
      submitButtonLabel: "Отправить заявку",
      submittingLabel: "Отправка...",
      nextButtonLabel: "Далее",
      backButtonLabel: "Назад",
      messengerLabel: "Связаться через мессенджер",
      consentLabel: "Согласие на обработку персональных данных",
      successTitle: "Заявка отправлена!",
      successDescription:
        "Мы свяжемся с Вами в ближайшее время для обсуждения Вашего проекта. Бесплатный 3D-проект уже в работе.",
      fields: {
        nameLabel: "Имя",
        namePlaceholder: "Ваше имя",
        phoneLabel: "Телефон",
        phonePlaceholder: "+7 (999) 999-99-99",
        commentLabel: "Комментарий",
        commentPlaceholder: "Опишите пожелания к проекту",
      },
    },
    portfolio: {
      eyebrow: "Портфолио",
      title: "Выполненные проекты",
      description:
        "Каждая кухня — индивидуальная история, созданная с вниманием к деталям и любовью к своему делу.",
      items: [
        {
          name: "Анна",
          imageKey: "kitchen-1",
          style: "Скандинавский минимализм",
          review:
            "Кухня мечты! Всё продумано до мелочей, от планировки до освещения. Процесс заказа был настолько простым, что я не верила своим глазам.",
        },
        {
          name: "Михаил",
          imageKey: "kitchen-2",
          style: "Современная классика",
          review:
            "Профессиональный подход на каждом этапе. 3D-проект полностью совпал с результатом. Рекомендую всем, кто ценит качество.",
        },
        {
          name: "Елена",
          imageKey: "kitchen-3",
          style: "Эко-стиль",
          review:
            "Мы долго искали мастеров, которые поймут нашу идею. Пегас превзошёл все ожидания — кухня стала сердцем нашего дома.",
        },
        {
          name: "Пётр",
          imageKey: "kitchen-4",
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
        "Мы делаем процесс покупки кухни простым и предсказуемым — от первого звонка до установки.",
      cards: [
        {
          icon: "clock",
          title: "Начать готовить — быстрее",
          description:
            "Уже через 14 дней кухня может быть Вашей. Быстрое производство без потери качества.",
          highlight: "14 дней",
        },
        {
          icon: "shield",
          title: "Оставаться спокойным — дольше",
          description:
            "Полная гарантия 5 лет на все материалы и работу. Мы уверены в каждом изделии.",
          highlight: "5 лет гарантии",
        },
        {
          icon: "wrench",
          title: "Укомплектовка техникой",
          description:
            "Подберём и установим всю встраиваемую бытовую технику. Всё в одном месте.",
          highlight: "Под ключ",
        },
        {
          icon: "banknote",
          title: "Покупать — выгодно",
          description:
            "Прозрачное ценообразование без скрытых платежей. Погонный метр от 70 000 руб.",
          highlight: "от 70 000 ₽/м",
        },
      ],
    },
    lifestyle: {
      eyebrow: "Кухня и человек",
      title: "Больше, чем мебель",
      description:
        "Кухня — это место, где начинается и заканчивается каждый день. Пространство для жизни, творчества и любви.",
      items: [
        {
          imageKey: "lifestyle-coffee",
          title: "Утренний кофе",
          description: "Начните день с идеальной чашки в пространстве, созданном для вдохновения",
        },
        {
          imageKey: "lifestyle-cooking",
          title: "Совместная готовка",
          description:
            "Кухня как место встреч — где рождаются вкусы и укрепляются отношения",
        },
        {
          imageKey: "lifestyle-family",
          title: "Семейный очаг",
          description: "Пространство, где каждый член семьи чувствует тепло и уют",
        },
        {
          imageKey: "lifestyle-creative",
          title: "Творчество",
          description:
            "Ваша кухня — лаборатория для кулинарных экспериментов и новых идей",
        },
      ],
    },
    footer: {
      description:
        "Кухни, которые освобождают пространство и время. Проектирование, изготовление и установка под ключ.",
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
