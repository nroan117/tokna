import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tokna — AI Cost Engineering, Automated',
  description: 'Prevent AI cost regressions before they ship. Every token, every agent loop, every model call — automatically engineered.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Tokna — AI Cost Engineering, Automated',
    description: 'Prevent AI cost regressions before they ship. Every token, every agent loop, every model call — automatically engineered.',
    url: 'https://tokna.ai',
    siteName: 'Tokna',
    images: [
      {
        url: 'https://tokna.ai/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tokna — AI Cost Engineering, Automated',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tokna — AI Cost Engineering, Automated',
    description: 'Prevent AI cost regressions before they ship.',
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
