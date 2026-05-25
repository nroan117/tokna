import Sidebar from '../../components/dashboard/Sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif",
    }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
