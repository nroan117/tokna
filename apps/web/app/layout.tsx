import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tokna — AI Application Intelligence Platform',
  description: 'Catch cost, performance, and efficiency regressions across your LLM stack — before they reach production.',
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
