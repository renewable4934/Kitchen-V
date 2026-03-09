import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { ConfiguratorSection } from "@/components/configurator-section"
import { PortfolioSection } from "@/components/portfolio-section"
import { ContractSection } from "@/components/contract-section"
import { LifestyleSection } from "@/components/lifestyle-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ConfiguratorSection />
        <PortfolioSection />
        <ContractSection />
        <LifestyleSection />
      </main>
      <Footer />
    </>
  )
}
