'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Overview',      to: '/dashboard',                   exact: true },
  { label: 'Models & APIs', to: '/dashboard/model-selection',   exact: false },
  { label: 'Infrastructure', to: '/dashboard/inference-infra',  exact: false },
  { label: 'Development',   to: '/dashboard/agentic-workflows', exact: false },
  { label: 'Observability', to: '/dashboard/observability',     exact: false },
];

// Pages that render on the dark Tokna surface get a matching dark sidebar.
const DARK_ROUTES = ['/dashboard/token-efficiency'];

const LIGHT = {
  bg: '#ffffff', border: '#e5e7eb', brand: '#f97316', sub: '#6b7280', section: '#9ca3af',
  link: '#374151', active: '#f97316', activeBg: 'rgba(249, 115, 22, 0.1)',
};
const DARK = {
  bg: '#0d0d0d', border: 'rgba(255,255,255,0.10)', brand: '#3987e5', sub: '#898781', section: '#898781',
  link: '#c3c2b7', active: '#ffffff', activeBg: 'rgba(57,135,229,0.18)',
};

export default function Sidebar() {
  const pathname = usePathname();
  const t = DARK_ROUTES.some(r => pathname.startsWith(r)) ? DARK : LIGHT;

  function isActive(to: string, exact: boolean): boolean {
    const norm = pathname.replace(/\/$/, '');
    if (exact) return norm === to || norm === '';
    return norm.startsWith(to);
  }

  return (
    <aside style={{
      width: '248px',
      flexShrink: 0,
      background: t.bg,
      borderRight: `1px solid ${t.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 0 2rem',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{
        padding: '0 1.25rem 1.25rem',
        borderBottom: `1px solid ${t.border}`,
        marginBottom: '1rem',
      }}>
        <div style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: t.brand,
        }}>
          ⚡ Tokna
        </div>
        <div style={{ fontSize: '0.75rem', color: t.sub, marginTop: '0.25rem' }}>
          Cost Engineering
        </div>
      </div>

      {/* Section label */}
      <div style={{
        padding: '0.5rem 1.25rem 0.25rem',
        fontSize: '0.6rem',
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: t.section,
      }}>
        Dashboards
      </div>

      {/* Nav items */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <li key={item.to} style={{ margin: '0.125rem 0.625rem' }}>
              <Link
                href={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5625rem 0.875rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8125rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? t.active : t.link,
                  textDecoration: 'none',
                  background: active ? t.activeBg : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
