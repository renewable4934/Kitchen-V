"use client"

// Title: Cookie consent interface
// Purpose: let visitors accept, reject or change optional analytics and marketing choices.
// Owner: Project team
// Last updated: 2026-06-20

import { useEffect, useState } from "react"
import { Cookie, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import {
  COOKIE_CONSENT_OPEN_EVENT,
  createCookieConsentPreferences,
  createDefaultCookieConsentPreferences,
  publishCookieConsent,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent"

function ConsentSetting({
  checked,
  description,
  disabled = false,
  label,
  onCheckedChange,
}: {
  checked: boolean
  description: string
  disabled?: boolean
  label: string
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-border py-4 last:border-b-0">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
    </div>
  )
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => window.dispatchEvent(new Event(COOKIE_CONSENT_OPEN_EVENT))}
    >
      <Settings2 className="size-3.5" aria-hidden="true" />
      Настройки cookies
    </button>
  )
}

export function CookieConsent() {
  const [bannerVisible, setBannerVisible] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [current, setCurrent] = useState<CookieConsentPreferences | null>(null)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const stored = readCookieConsent(window.localStorage)
    const initial = stored ?? createDefaultCookieConsentPreferences()

    setCurrent(initial)
    setAnalytics(initial.analytics)
    setMarketing(initial.marketing)
    setBannerVisible(stored === null)
    publishCookieConsent(initial)

    const openSettings = () => {
      const latest = readCookieConsent(window.localStorage) ?? initial
      setAnalytics(latest.analytics)
      setMarketing(latest.marketing)
      setDialogOpen(true)
    }

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, openSettings)
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, openSettings)
  }, [])

  const savePreferences = (nextAnalytics: boolean, nextMarketing: boolean) => {
    const previousMarketing = current?.marketing === true
    const next = createCookieConsentPreferences({
      analytics: nextAnalytics,
      marketing: nextMarketing,
    })

    writeCookieConsent(window.localStorage, next)
    publishCookieConsent(next)
    setCurrent(next)
    setAnalytics(next.analytics)
    setMarketing(next.marketing)
    setBannerVisible(false)
    setDialogOpen(false)

    if (previousMarketing && !next.marketing) {
      window.location.reload()
    }
  }

  return (
    <>
      {bannerVisible ? (
        <section
          role="dialog"
          aria-label="Настройки cookies"
          aria-describedby="cookie-consent-description"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-5xl border border-border bg-background p-5 shadow-2xl sm:inset-x-6 sm:bottom-6 sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-foreground">
                <Cookie className="size-5" aria-hidden="true" />
                <h2 className="text-base font-semibold">Настройки cookies</h2>
              </div>
              <p id="cookie-consent-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Необходимые cookies обеспечивают работу сайта. Аналитику и маркетинговые технологии можно разрешить
                отдельно. Выбор можно изменить в футере.
              </p>
              <a href="/privacy" className="mt-2 inline-block text-sm text-primary underline-offset-4 hover:underline">
                Подробнее в политике конфиденциальности
              </a>
            </div>
            <div className="grid shrink-0 gap-2 sm:grid-cols-3 lg:w-auto">
              <Button variant="outline" onClick={() => savePreferences(false, false)}>
                Отклонить необязательные
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(true)}>
                Настроить
              </Button>
              <Button onClick={() => savePreferences(true, true)}>Принять все</Button>
            </div>
          </div>
        </section>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Настройки cookies</DialogTitle>
            <DialogDescription>
              Выберите необязательные категории. Продолжение просмотра само по себе не считается согласием.
            </DialogDescription>
          </DialogHeader>

          <div className="border-y border-border">
            <ConsentSetting
              checked
              disabled
              label="Необходимые"
              description="Нужны для базовой работы сайта и не отключаются."
            />
            <ConsentSetting
              checked={analytics}
              onCheckedChange={setAnalytics}
              label="Аналитика"
              description="Разрешает аналитические события сайта. Текущие счётчики работают в существующем режиме."
            />
            <ConsentSetting
              checked={marketing}
              onCheckedChange={setMarketing}
              label="Маркетинг"
              description="Разрешает загрузку маркетинговых технологий, включая AI-UP pixel при отдельном включении."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => savePreferences(analytics, marketing)}>Сохранить выбор</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
