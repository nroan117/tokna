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
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
