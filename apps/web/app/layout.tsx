import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tokna — AI-powered cloud cost optimization',
  description: 'Catch cloud cost waste before it ships. Automated cost regression detection for LLM applications.',
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
