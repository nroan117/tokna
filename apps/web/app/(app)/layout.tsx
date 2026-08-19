'use client';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/dashboard/Sidebar';

// Routes that render on the dark Tokna surface; the shell matches so no light
// gutters show around the page content or beside the sidebar.
const DARK_ROUTES = ['/dashboard/token-efficiency'];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dark = DARK_ROUTES.some(r => pathname.startsWith(r));
  const bg = dark ? '#0d0d0d' : '#f8fafc';
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: bg,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
    }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: bg, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
