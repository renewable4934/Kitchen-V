"use client"

import Image from "next/image"
import { Cormorant_Garamond } from "next/font/google"

import { trackCTA, trackPhoneClick } from "@/lib/tracking"
import type { NavLink } from "@/lib/site-content"

const footerPhraseFont = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: "600",
})

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
  const safeLinks = Array.isArray(links) ? links : []
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, "")}`
  const addressHref = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`
  const brandLabel = brandName.toUpperCase()
  const whatsappHref =
    whatsappPhone && whatsappPhone.trim()
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
      : null

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-10 xl:flex xl:items-start xl:gap-0">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 sm:gap-4" aria-label={brandName}>
              <Image
                src="/images/pegas-logo.png"
                alt=""
                width={667}
                height={374}
                className="h-auto w-[8.75rem] sm:w-[9.5rem] lg:w-[10.25rem]"
              />
              <span
                className={`${footerPhraseFont.className} translate-y-[0.04em] text-[2.1rem] leading-none font-medium uppercase tracking-[0.045em] text-[#2c414c] sm:text-[2.4rem] lg:text-[2.6rem]`}
              >
                {brandLabel}
              </span>
            </div>
            <p
              className={`${footerPhraseFont.className} mt-3 whitespace-nowrap text-[2.25rem] leading-[1.1] tracking-[0.01em] text-foreground sm:text-[2.45rem] lg:text-[2.6rem] xl:text-[2.8rem]`}
            >
              Свобода полета мечты
            </p>
          </div>

          <div className="sm:col-span-2 xl:ml-auto xl:flex xl:items-start xl:gap-16">
            <div>
              <p className="mb-3 text-base font-semibold text-foreground">{navigationTitle}</p>
              <nav className="flex flex-col gap-2">
                {safeLinks.map((link) => (
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

            <div className="mt-8 sm:mt-0">
              <p className="mb-3 text-base font-semibold text-foreground">{contactsTitle}</p>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <a
                  href={phoneHref}
                  onClick={() =>
                    void trackPhoneClick({
                      sectionName: "footer",
                      funnelType: "kitchen",
                      offerVariant,
                      experimentKey,
                    })
                  }
                >
                  {phone}
                </a>
                <a href={`mailto:${email}`}>{email}</a>
                <a
                  href={addressHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground hover:underline underline-offset-2"
                >
                  {address}
                </a>
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      void trackCTA({
                        buttonName: "WhatsApp",
                        sectionName: "footer",
                        funnelType: "kitchen",
                        offerVariant,
                        experimentKey,
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
          <a href="/privacy" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
            {privacyLabel}
          </a>
        </div>
      </div>
    </footer>
  )
}
