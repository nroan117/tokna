import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tokna — AI Cost Optimization Platform',
  description: 'Every token, every agent loop, every model call — optimized before it reaches production.',
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
