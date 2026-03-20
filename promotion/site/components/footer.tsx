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
  const whatsappHref =
    whatsappPhone && whatsappPhone.trim()
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
      : null

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-20 xl:gap-28">
          <div className="flex-1">
            <div className="flex max-w-[21rem] flex-col items-start gap-5 sm:gap-6">
              <Image
                src="/images/pegas-logo.png"
                alt=""
                width={667}
                height={374}
                className="h-auto w-[12rem] sm:w-[13.5rem] lg:w-[15rem]"
              />
              <p
                className={`${footerPhraseFont.className} max-w-[10ch] text-[2.25rem] leading-[1.12] tracking-[0.01em] text-foreground sm:text-[2.6rem] md:text-[2.85rem] lg:text-[3rem]`}
              >
                Свобода полёта мечты
              </p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 sm:gap-12 lg:flex-none lg:gap-16 xl:gap-20">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">{navigationTitle}</p>
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

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">{contactsTitle}</p>
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
                <p>{address}</p>
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
