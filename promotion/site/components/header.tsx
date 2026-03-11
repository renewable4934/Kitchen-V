"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

import type { ActionLink, NavLink } from "@/lib/site-content"
import { trackSiteEvent } from "@/lib/tracking"

type HeaderProps = {
  brandName: string
  links: NavLink[]
  cta: ActionLink
  offerVariant: string | null
  experimentKey: string | null
}

export function Header({ brandName, links, cta, offerVariant, experimentKey }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleQuizStart = () => {
    void trackSiteEvent("start_quiz", {
      funnel_type: "kitchen",
      offer_variant: offerVariant,
      experiment_key: experimentKey,
      metadata: {
        placement: "header",
      },
    })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="#hero" className="flex items-center gap-2">
          <PegasusLogo />
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">{brandName}</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={cta.href}
          onClick={handleQuizStart}
          className="hidden rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 md:inline-flex"
        >
          {cta.label}
        </a>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <a
              href={cta.href}
              onClick={() => {
                handleQuizStart()
                setMobileOpen(false)
              }}
              className="mt-2 rounded-lg bg-primary px-5 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {cta.label}
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

function PegasusLogo() {
  return (
    <svg
      width="32"
      height="32"
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
  )
}
