"use client"

import { trackSiteEvent } from "@/lib/tracking"
import type { NavLink } from "@/lib/site-content"

type FooterProps = {
  brandName: string
  description: string
  navigationTitle: string
  contactsTitle: string
  links: NavLink[]
  phone: string
  email: string
  address: string
  privacyLabel: string
  copyrightOwner: string
  whatsappPhone: string
  whatsappMessage: string
  offerVariant: string | null
  experimentKey: string | null
}

export function Footer({
  brandName,
  description,
  navigationTitle,
  contactsTitle,
  links,
  phone,
  email,
  address,
  privacyLabel,
  copyrightOwner,
  whatsappPhone,
  whatsappMessage,
  offerVariant,
  experimentKey,
}: FooterProps) {
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`
  const whatsappHref =
    whatsappPhone && whatsappPhone.trim()
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
      : null

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
              <span className="font-serif text-lg font-bold text-foreground">{brandName}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">{navigationTitle}</p>
              <nav className="flex flex-col gap-2">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">{contactsTitle}</p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <a
                  href={phoneHref}
                  onClick={() =>
                    void trackSiteEvent("click_call", {
                      funnel_type: "kitchen",
                      offer_variant: offerVariant,
                      experiment_key: experimentKey,
                    })
                  }
                >
                  {phone}
                </a>
                <a href={`mailto:${email}`}>{email}</a>
                <p>{address}</p>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      void trackSiteEvent("open_whatsapp", {
                        funnel_type: "kitchen",
                        offer_variant: offerVariant,
                        experiment_key: experimentKey,
                      })
                    }
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">{`© ${new Date().getFullYear()} ${copyrightOwner}. Все права защищены.`}</p>
          <p className="text-xs text-muted-foreground">{privacyLabel}</p>
        </div>
      </div>
    </footer>
  )
}
