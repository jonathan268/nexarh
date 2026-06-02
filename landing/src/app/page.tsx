import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import CTA from '@/components/CTA'
import DownloadSection from '@/components/DownloadSection'
import Installation from '@/components/Installation'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'
import Reveal from '@/components/Reveal'

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Reveal><Features /></Reveal>
      <Reveal><CTA /></Reveal>
      <Reveal><DownloadSection /></Reveal>
      <Reveal><Installation /></Reveal>
      <Reveal><FAQ /></Reveal>
      <Footer />
    </>
  )
}
