import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://tokna.ai'),
  alternates: {
    canonical: '/',
  },
  title: 'Tokna — Automate AI Cost Engineering',
  description: 'Automatically reduce AI cost waste so you can focus on building. Prevent regressions before they ship with CI/CD native guardrails.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-144.png', sizes: '144x144', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Tokna — Automate AI Cost Engineering',
    description: 'Automatically reduce AI cost waste so you can focus on building.',
    url: 'https://tokna.ai',
    siteName: 'Tokna',
    images: [
      {
        url: 'https://tokna.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tokna — Automate AI Cost Engineering',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tokna — Automate AI Cost Engineering',
    description: 'Automatically reduce AI cost waste so you can focus on building.',
    images: ['https://tokna.ai/og-image.png'],
  },
};

const schemaOrg = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://tokna.ai/#organization',
      name: 'Tokna',
      url: 'https://tokna.ai',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tokna.ai/favicon-192.png',
      },
      description: 'Tokna automates AI cost engineering — preventing LLM cost regressions before they ship with CI/CD native guardrails and 220+ cost rules.',
      foundingDate: '2026',
      sameAs: [
        'https://github.com/nroan117/tokna',
      ],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://tokna.ai/#software',
      name: 'Tokna',
      url: 'https://tokna.ai',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web, CI/CD, GitHub Actions',
      description: 'AI cost regression detection for LLM applications. 220+ built-in cost rules, CI/CD native, zero config required.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free open source core. Paid tiers available.',
      },
      publisher: {
        '@id': 'https://tokna.ai/#organization',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://tokna.ai/#website',
      url: 'https://tokna.ai',
      name: 'Tokna',
      publisher: {
        '@id': 'https://tokna.ai/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://tokna.ai/tryit?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
