import { ConfiguratorSection } from "@/components/configurator-section"
import { ContractSection } from "@/components/contract-section"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { LifestyleSection } from "@/components/lifestyle-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { SiteAnalytics } from "@/components/site-analytics"
import { loadSiteContent } from "@/lib/cms"

export const dynamic = "force-dynamic"

export default async function Home() {
  const content = await loadSiteContent()

  return (
    <>
      <SiteAnalytics
        funnelType="kitchen"
        offerVariant={content.site.offerVariant}
        experimentKey={content.site.experimentKey}
      />
      <Header
        brandName={content.site.brandName}
        logo={content.assets[content.sections.footer.logoKey]}
        links={content.navigation.headerLinks}
        cta={content.navigation.headerCta}
        offerVariant={content.site.offerVariant}
        experimentKey={content.site.experimentKey}
      />
      <main>
        <HeroSection content={content.sections.hero} assets={content.assets} />
        <ConfiguratorSection
          content={content.sections.configurator}
          assets={content.assets}
          offerVariant={content.site.offerVariant}
          experimentKey={content.site.experimentKey}
        />
        <PortfolioSection content={content.sections.portfolio} assets={content.assets} />
        <ContractSection content={content.sections.contract} />
        <LifestyleSection content={content.sections.lifestyle} assets={content.assets} />
      </main>
      <Footer
        brandName={content.site.brandName}
        logo={content.assets[content.sections.footer.logoKey]}
        description={content.sections.footer.description}
        navigationTitle={content.sections.footer.navigationTitle}
        contactsTitle={content.sections.footer.contactsTitle}
        links={content.navigation.footerLinks}
        phone={content.site.contactPhone}
        email={content.site.email}
        address={content.site.address}
        privacyLabel={content.sections.footer.privacyLabel}
        copyrightOwner={content.site.footerCopyrightOwner}
        whatsappPhone={content.site.whatsappPhone}
        whatsappMessage={content.site.whatsappMessage}
        offerVariant={content.site.offerVariant}
        experimentKey={content.site.experimentKey}
      />
    </>
  )
}
