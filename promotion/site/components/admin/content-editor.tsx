"use client"

import { useMemo, useState, useTransition } from "react"

import { AssetField } from "@/components/admin/asset-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { AdminRole } from "@/lib/admin-auth"
import type { CmsAsset, SiteContent } from "@/lib/site-content"

type ContentEditorProps = {
  content: SiteContent
  assets: CmsAsset[]
  adminRole: AdminRole
}

type SaveState = {
  type: "idle" | "success" | "error"
  message: string
}

function createIdleState(): SaveState {
  return {
    type: "idle",
    message: "",
  }
}

async function postJson(payload: unknown) {
  const response = await fetch("/api/admin/content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Не удалось сохранить изменения")
  }
}

export function ContentEditor({ content, assets, adminRole }: ContentEditorProps) {
  const [isPending, startTransition] = useTransition()

  const [settingsState, setSettingsState] = useState(createIdleState())
  const [heroState, setHeroState] = useState(createIdleState())
  const [configuratorState, setConfiguratorState] = useState(createIdleState())
  const [portfolioState, setPortfolioState] = useState(createIdleState())
  const [contractState, setContractState] = useState(createIdleState())
  const [lifestyleState, setLifestyleState] = useState(createIdleState())
  const [navigationState, setNavigationState] = useState(createIdleState())

  const [siteSettings, setSiteSettings] = useState(content.site)
  const [pageMeta, setPageMeta] = useState(content.page)
  const [footerSettings, setFooterSettings] = useState(content.sections.footer)
  const [heroSettings, setHeroSettings] = useState(content.sections.hero)

  const [configuratorJson, setConfiguratorJson] = useState(JSON.stringify(content.sections.configurator, null, 2))
  const [portfolioJson, setPortfolioJson] = useState(JSON.stringify(content.sections.portfolio, null, 2))
  const [contractJson, setContractJson] = useState(JSON.stringify(content.sections.contract, null, 2))
  const [lifestyleJson, setLifestyleJson] = useState(JSON.stringify(content.sections.lifestyle, null, 2))
  const [navigationJson, setNavigationJson] = useState(
    JSON.stringify(
      {
        headerLinks: content.navigation.headerLinks,
        footerLinks: content.navigation.footerLinks,
        headerCta: content.navigation.headerCta,
      },
      null,
      2,
    ),
  )

  const assetRows = useMemo(() => assets, [assets])

  return (
    <Tabs defaultValue="settings" className="gap-6">
      <TabsList className="h-auto w-full flex-wrap justify-start rounded-2xl bg-white/80 p-2">
        <TabsTrigger value="settings">Настройки сайта</TabsTrigger>
        <TabsTrigger value="hero">Hero</TabsTrigger>
        <TabsTrigger value="configurator">Конфигуратор</TabsTrigger>
        <TabsTrigger value="portfolio">Портфолио</TabsTrigger>
        <TabsTrigger value="contract">Условия</TabsTrigger>
        <TabsTrigger value="lifestyle">Кухня и жизнь</TabsTrigger>
        <TabsTrigger value="navigation">Навигация</TabsTrigger>
      </TabsList>

      <TabsContent value="settings" className="space-y-6">
        <Card className="rounded-[1.5rem] border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(44,65,76,0.08)]">
          <CardHeader>
            <CardTitle>Общие настройки сайта</CardTitle>
            <CardDescription>
              Основные контакты, meta-теги страницы и подписи в футере. Эти поля безопаснее редактировать как обычную
              форму.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand-name">Название бренда</Label>
                <Input
                  id="brand-name"
                  value={siteSettings.brandName}
                  onChange={(event) => setSiteSettings({ ...siteSettings, brandName: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand-tagline">Короткий слоган</Label>
                <Input
                  id="brand-tagline"
                  value={siteSettings.brandTagline}
                  onChange={(event) => setSiteSettings({ ...siteSettings, brandTagline: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Телефон</Label>
                <Input
                  id="contact-phone"
                  value={siteSettings.contactPhone}
                  onChange={(event) => setSiteSettings({ ...siteSettings, contactPhone: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  value={siteSettings.email}
                  onChange={(event) => setSiteSettings({ ...siteSettings, email: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Адрес</Label>
                <Input
                  id="address"
                  value={siteSettings.address}
                  onChange={(event) => setSiteSettings({ ...siteSettings, address: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyright-owner">Копирайт</Label>
                <Input
                  id="copyright-owner"
                  value={siteSettings.footerCopyrightOwner}
                  onChange={(event) =>
                    setSiteSettings({ ...siteSettings, footerCopyrightOwner: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-phone">WhatsApp телефон</Label>
                <Input
                  id="whatsapp-phone"
                  value={siteSettings.whatsappPhone}
                  onChange={(event) => setSiteSettings({ ...siteSettings, whatsappPhone: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp-message">Сообщение WhatsApp</Label>
                <Input
                  id="whatsapp-message"
                  value={siteSettings.whatsappMessage}
                  onChange={(event) => setSiteSettings({ ...siteSettings, whatsappMessage: event.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="page-title">Title страницы</Label>
                <Input
                  id="page-title"
                  value={pageMeta.title}
                  onChange={(event) => setPageMeta({ ...pageMeta, title: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="page-description">Description страницы</Label>
                <Textarea
                  id="page-description"
                  rows={4}
                  value={pageMeta.description}
                  onChange={(event) => setPageMeta({ ...pageMeta, description: event.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="footer-description">Описание в футере</Label>
                <Textarea
                  id="footer-description"
                  rows={4}
                  value={footerSettings.description}
                  onChange={(event) => setFooterSettings({ ...footerSettings, description: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="footer-navigation-title">Заголовок меню в футере</Label>
                <Input
                  id="footer-navigation-title"
                  value={footerSettings.navigationTitle}
                  onChange={(event) =>
                    setFooterSettings({ ...footerSettings, navigationTitle: event.target.value })
                  }
                />
                <Label htmlFor="footer-contacts-title" className="pt-3">
                  Заголовок контактов в футере
                </Label>
                <Input
                  id="footer-contacts-title"
                  value={footerSettings.contactsTitle}
                  onChange={(event) =>
                    setFooterSettings({ ...footerSettings, contactsTitle: event.target.value })
                  }
                />
                <Label htmlFor="footer-privacy-label" className="pt-3">
                  Подпись ссылки на privacy
                </Label>
                <Input
                  id="footer-privacy-label"
                  value={footerSettings.privacyLabel}
                  onChange={(event) => setFooterSettings({ ...footerSettings, privacyLabel: event.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {settingsState.message ? (
                  <p
                    className={`text-sm ${
                      settingsState.type === "error" ? "text-destructive" : "text-emerald-700"
                    }`}
                  >
                    {settingsState.message}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setSettingsState(createIdleState())

                  startTransition(async () => {
                    try {
                      await postJson({
                        kind: "settings",
                        data: {
                          site: siteSettings,
                          page: pageMeta,
                          footer: footerSettings,
                        },
                      })
                      setSettingsState({ type: "success", message: "Настройки сохранены" })
                    } catch (error) {
                      setSettingsState({
                        type: "error",
                        message: error instanceof Error ? error.message : "Ошибка сохранения",
                      })
                    }
                  })
                }}
              >
                {isPending ? "Сохранение..." : "Сохранить настройки"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hero" className="space-y-6">
        <Card className="rounded-[1.5rem] border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(44,65,76,0.08)]">
          <CardHeader>
            <CardTitle>Hero-блок</CardTitle>
            <CardDescription>Главный заголовок, подзаголовок, кнопки и основное изображение.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hero-eyebrow">Eyebrow</Label>
                <Input
                  id="hero-eyebrow"
                  value={heroSettings.eyebrow}
                  onChange={(event) => setHeroSettings({ ...heroSettings, eyebrow: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-tagline">Теглайн</Label>
                <Input
                  id="hero-tagline"
                  value={heroSettings.tagline || ""}
                  onChange={(event) => setHeroSettings({ ...heroSettings, tagline: event.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hero-title">Заголовок</Label>
                <Textarea
                  id="hero-title"
                  rows={4}
                  value={heroSettings.title}
                  onChange={(event) => setHeroSettings({ ...heroSettings, title: event.target.value })}
                />
                <p className="text-xs text-muted-foreground">Для переноса строки используйте обычный Enter.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-description">Описание</Label>
                <Textarea
                  id="hero-description"
                  rows={4}
                  value={heroSettings.description}
                  onChange={(event) => setHeroSettings({ ...heroSettings, description: event.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hero-primary-label">Текст основной кнопки</Label>
                <Input
                  id="hero-primary-label"
                  value={heroSettings.primaryCta.label}
                  onChange={(event) =>
                    setHeroSettings({
                      ...heroSettings,
                      primaryCta: { ...heroSettings.primaryCta, label: event.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-primary-href">Ссылка основной кнопки</Label>
                <Input
                  id="hero-primary-href"
                  value={heroSettings.primaryCta.href}
                  onChange={(event) =>
                    setHeroSettings({
                      ...heroSettings,
                      primaryCta: { ...heroSettings.primaryCta, href: event.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-secondary-label">Текст второй кнопки</Label>
                <Input
                  id="hero-secondary-label"
                  value={heroSettings.secondaryCta.label}
                  onChange={(event) =>
                    setHeroSettings({
                      ...heroSettings,
                      secondaryCta: { ...heroSettings.secondaryCta, label: event.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-secondary-href">Ссылка второй кнопки</Label>
                <Input
                  id="hero-secondary-href"
                  value={heroSettings.secondaryCta.href}
                  onChange={(event) =>
                    setHeroSettings({
                      ...heroSettings,
                      secondaryCta: { ...heroSettings.secondaryCta, href: event.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-image-key">Asset key изображения</Label>
                <Input
                  id="hero-image-key"
                  value={heroSettings.imageKey}
                  onChange={(event) => setHeroSettings({ ...heroSettings, imageKey: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-stat-value">Статистика справа</Label>
                <Input
                  id="hero-stat-value"
                  value={heroSettings.statValue}
                  onChange={(event) => setHeroSettings({ ...heroSettings, statValue: event.target.value })}
                />
              </div>
            </div>

            <AssetField defaultAssetKey={heroSettings.imageKey} defaultAlt="Hero image" />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {heroState.message ? (
                  <p className={`text-sm ${heroState.type === "error" ? "text-destructive" : "text-emerald-700"}`}>
                    {heroState.message}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setHeroState(createIdleState())

                  startTransition(async () => {
                    try {
                      await postJson({ kind: "hero", data: heroSettings })
                      setHeroState({ type: "success", message: "Hero-блок сохранён" })
                    } catch (error) {
                      setHeroState({
                        type: "error",
                        message: error instanceof Error ? error.message : "Ошибка сохранения",
                      })
                    }
                  })
                }}
              >
                {isPending ? "Сохранение..." : "Сохранить hero"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="configurator" className="space-y-6">
        <JsonSectionCard
          title="Конфигуратор"
          description="Редактируется как JSON, потому что структура шага и опций уже сложная. Сохраняйте корректный JSON-объект."
          value={configuratorJson}
          onChange={setConfiguratorJson}
          state={configuratorState}
          pending={isPending}
          onSave={() => {
            setConfiguratorState(createIdleState())

            startTransition(async () => {
              try {
                await postJson({ kind: "configurator", data: JSON.parse(configuratorJson) })
                setConfiguratorState({ type: "success", message: "Конфигуратор сохранён" })
              } catch (error) {
                setConfiguratorState({
                  type: "error",
                  message: error instanceof Error ? error.message : "Ошибка сохранения",
                })
              }
            })
          }}
        />
      </TabsContent>

      <TabsContent value="portfolio" className="space-y-6">
        <JsonSectionCard
          title="Портфолио"
          description="Можно менять заголовок блока, описание и список проектов. Для новых картинок сначала загрузите asset."
          value={portfolioJson}
          onChange={setPortfolioJson}
          state={portfolioState}
          pending={isPending}
          onSave={() => {
            setPortfolioState(createIdleState())

            startTransition(async () => {
              try {
                await postJson({ kind: "portfolio", data: JSON.parse(portfolioJson) })
                setPortfolioState({ type: "success", message: "Портфолио сохранено" })
              } catch (error) {
                setPortfolioState({
                  type: "error",
                  message: error instanceof Error ? error.message : "Ошибка сохранения",
                })
              }
            })
          }}
        />
      </TabsContent>

      <TabsContent value="contract" className="space-y-6">
        <JsonSectionCard
          title="Условия"
          description="Здесь редактируются карточки доверия: сроки, гарантия, цена и другие условия."
          value={contractJson}
          onChange={setContractJson}
          state={contractState}
          pending={isPending}
          onSave={() => {
            setContractState(createIdleState())

            startTransition(async () => {
              try {
                await postJson({ kind: "contract", data: JSON.parse(contractJson) })
                setContractState({ type: "success", message: "Блок условий сохранён" })
              } catch (error) {
                setContractState({
                  type: "error",
                  message: error instanceof Error ? error.message : "Ошибка сохранения",
                })
              }
            })
          }}
        />
      </TabsContent>

      <TabsContent value="lifestyle" className="space-y-6">
        <JsonSectionCard
          title="Кухня и жизнь"
          description="Заголовок, описание и карточки lifestyle-сцен. Допустимы asset key или прямые URL, если они уже публичные."
          value={lifestyleJson}
          onChange={setLifestyleJson}
          state={lifestyleState}
          pending={isPending}
          onSave={() => {
            setLifestyleState(createIdleState())

            startTransition(async () => {
              try {
                await postJson({ kind: "lifestyle", data: JSON.parse(lifestyleJson) })
                setLifestyleState({ type: "success", message: "Lifestyle-блок сохранён" })
              } catch (error) {
                setLifestyleState({
                  type: "error",
                  message: error instanceof Error ? error.message : "Ошибка сохранения",
                })
              }
            })
          }}
        />
      </TabsContent>

      <TabsContent value="navigation" className="space-y-6">
        <JsonSectionCard
          title="Навигация"
          description="Формат: headerLinks, footerLinks и headerCta. После сохранения меню сайта обновится сразу."
          value={navigationJson}
          onChange={setNavigationJson}
          state={navigationState}
          pending={isPending}
          onSave={() => {
            setNavigationState(createIdleState())

            startTransition(async () => {
              try {
                await postJson({ kind: "navigation", data: JSON.parse(navigationJson) })
                setNavigationState({ type: "success", message: "Навигация сохранена" })
              } catch (error) {
                setNavigationState({
                  type: "error",
                  message: error instanceof Error ? error.message : "Ошибка сохранения",
                })
              }
            })
          }}
        />
      </TabsContent>

      <Card className="rounded-[1.5rem] border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(44,65,76,0.08)]">
        <CardHeader>
          <CardTitle>Текущие asset key</CardTitle>
          <CardDescription>
            Справочник по уже загруженным изображениям. Роль текущего пользователя: <Badge>{adminRole}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset key</TableHead>
                <TableHead>Alt</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assetRows.map((asset) => (
                <TableRow key={asset.assetKey}>
                  <TableCell className="font-medium">{asset.assetKey}</TableCell>
                  <TableCell className="max-w-[240px] whitespace-normal">{asset.alt}</TableCell>
                  <TableCell className="max-w-[360px] whitespace-normal break-all text-muted-foreground">
                    {asset.publicUrl}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Tabs>
  )
}

type JsonSectionCardProps = {
  title: string
  description: string
  value: string
  onChange: (value: string) => void
  state: SaveState
  pending: boolean
  onSave: () => void
}

function JsonSectionCard({ title, description, value, onChange, state, pending, onSave }: JsonSectionCardProps) {
  return (
    <Card className="rounded-[1.5rem] border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(44,65,76,0.08)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={22} className="font-mono" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {state.message ? (
              <p className={`text-sm ${state.type === "error" ? "text-destructive" : "text-emerald-700"}`}>
                {state.message}
              </p>
            ) : null}
          </div>
          <Button type="button" disabled={pending} onClick={onSave}>
            {pending ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
