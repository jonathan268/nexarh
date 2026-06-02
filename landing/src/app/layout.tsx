import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NexaRH - Logiciel de Gestion RH Moderne | Employés, Paie, Stages, Formations',
  description:
    'NexaRH est un logiciel de gestion des ressources humaines tout-en-un : employés, contrats, paie, congés, stages, formations, apprenants. Téléchargement gratuit pour Windows, macOS et Linux.',
  keywords: [
    'gestion RH',
    'logiciel RH gratuit',
    'gestion paie',
    'gestion des employés',
    'gestion des stages',
    'gestion des formations',
    'RH desktop',
    'SaaS RH',
    'NexaRH',
    'ressources humaines',
    'paie automatisée',
    'congés',
    'contrats de travail',
    'apprenants',
    'alternance',
  ],
  authors: [{ name: 'NexaRH' }],
  creator: 'NexaRH',
  publisher: 'NexaRH',
  metadataBase: new URL('https://nexarh.app'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://nexarh.app',
    siteName: 'NexaRH',
    title: 'NexaRH - Logiciel de Gestion RH Moderne',
    description:
      'Gérez vos employés, contrats, paie, congés, stages et formations en un seul logiciel. Gratuit, puissant, disponible sur Windows, Mac et Linux.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NexaRH - Gestion RH tout-en-un',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexaRH - Logiciel de Gestion RH Moderne',
    description:
      'Gérez vos employés, contrats, paie, congés, stages et formations en un seul logiciel.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NexaRH',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Windows, macOS, Linux',
    description:
      'Logiciel de gestion des ressources humaines tout-en-un : employés, contrats, paie, congés, stages, formations.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    author: { '@type': 'Organization', name: 'NexaRH' },
  }

  return (
    <html lang="fr">
      <head>
        <link rel="canonical" href="https://nexarh.app" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
