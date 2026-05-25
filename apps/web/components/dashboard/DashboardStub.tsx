import Link from 'next/link';
import HealthGauge from './HealthGauge';
import MetricsBar from './MetricsBar';

interface DashboardStubProps {
  icon?: string;
  name: string;
  health: number;
  monthlyWaste: string;
  alertCount: number;
}

export default function DashboardStub({ icon, name, health, monthlyWaste, alertCount }: DashboardStubProps) {
  return (
    <>
      <MetricsBar />
      <div style={{ padding: '1.75rem 2rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <Link href="/dashboard" style={{ color: '#f97316', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ color: '#9ca3af' }}>›</span>
          <span style={{ color: '#374151' }}>{name}</span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem' }}>
            {icon && <span style={{ marginRight: '0.5rem' }}>{icon}</span>}{name}
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Deep-dive analysis · {alertCount} active alerts · Est. waste {monthlyWaste}/mo
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <HealthGauge score={health} maxScore={100} size={130} />
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Dashboard Health
            </div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#dc2626', lineHeight: 1.1, marginBottom: '0.375rem' }}>
              {alertCount}
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Active Alerts
            </div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#f97316', lineHeight: 1.1, marginBottom: '0.375rem' }}>
              {monthlyWaste}
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Est. Monthly Waste
            </div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.25rem', fontWeight: 700, color: '#16a34a', lineHeight: 1.1, marginBottom: '0.375rem' }}>
              Coming
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Deep Dive
            </div>
          </div>
        </div>

        {/* Coming soon card */}
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
          padding: '3rem', textAlign: 'center',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
        }}>
          {icon && <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>}
          <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
            {name} Deep Dive — Coming in Phase 3
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Full analysis including trend charts, regression history, and actionable recommendations
            will be available in the next build phase.
          </div>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(249, 115, 22, 0.15)',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            borderRadius: '0.5rem',
            padding: '0.625rem 1.25rem',
            color: '#f97316', textDecoration: 'none',
            fontSize: '0.875rem', fontWeight: 600,
          }}>
            ← Back to Overview
          </Link>
        </div>
      </div>
    </>
  );
}
