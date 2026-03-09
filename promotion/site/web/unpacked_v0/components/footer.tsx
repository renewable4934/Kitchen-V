export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M16 2C14 6 10 8 8 12C6 16 8 20 10 22C12 24 14 26 16 30C18 26 20 24 22 22C24 20 26 16 24 12C22 8 18 6 16 2Z"
                  fill="currentColor"
                  className="text-primary"
                />
                <path
                  d="M10 14C8 12 4 12 2 14C4 14 6 16 8 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-primary"
                />
                <path
                  d="M22 14C24 12 28 12 30 14C28 14 26 16 24 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-primary"
                />
              </svg>
              <span className="font-serif text-lg font-bold text-foreground">Пегас</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Кухни, которые освобождают пространство и время. 
              Проектирование, изготовление и установка под ключ.
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Навигация
              </p>
              <nav className="flex flex-col gap-2">
                <a href="#hero" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Главная
                </a>
                <a href="#configurator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  3D проект
                </a>
                <a href="#portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Портфолио
                </a>
                <a href="#contract" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Контракт
                </a>
              </nav>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
                Контакты
              </p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>+7 (800) 000-00-00</p>
                <p>info@pegas-kitchen.ru</p>
                <p>Москва, Россия</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            {"© " + new Date().getFullYear() + " ООО «Пегас». Все права защищены."}
          </p>
          <p className="text-xs text-muted-foreground">
            Политика конфиденциальности
          </p>
        </div>
      </div>
    </footer>
  )
}
