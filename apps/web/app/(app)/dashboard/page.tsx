import Link from 'next/link';
import HealthGauge from '../../../components/dashboard/HealthGauge';
import MetricsBar from '../../../components/dashboard/MetricsBar';

const VERTICALS = [
  { name: 'Model Selection',    meta: '14 models audited',             health: 65, status: 'warn', monthlyWaste: '$6,400',  href: '/dashboard/model-selection' },
  { name: 'Inference Infra',    meta: '48 GPU pods • A100/H100',       health: 58, status: 'crit', monthlyWaste: '$12,300', href: '/dashboard/inference-infra' },
  { name: 'System Performance', meta: 'P99 latency: 820 ms',           health: 82, status: 'good', monthlyWaste: '$1,100',  href: '/dashboard/system-performance' },
  { name: 'Token Efficiency',   meta: 'Avg 4,200 tokens/req',          health: 71, status: 'warn', monthlyWaste: '$3,100',  href: '/dashboard/token-efficiency' },
  { name: 'Agentic Workflows',  meta: '23 active pipelines',            health: 77, status: 'warn', monthlyWaste: '$2,800',  href: '/dashboard/agentic-workflows' },
  { name: 'Retrieval (RAG)',    meta: '4 vector stores • 2M chunks',   health: 85, status: 'good', monthlyWaste: '$1,200',  href: '/dashboard/retrieval-rag' },
  { name: 'Developer Tooling',  meta: '8 dev environments',             health: 90, status: 'good', monthlyWaste: '$900',    href: '/dashboard/developer-tooling' },
  { name: 'Observability',      meta: '3 logging clusters',             health: 68, status: 'warn', monthlyWaste: '$600',    href: '/dashboard/observability' },
] as const;

const REGRESSIONS = [
  { severity: 'crit', dashboard: 'Inference Infra',    finding: 'VRAM under-provisioned on 12 A100 pods — avg 34% idle waste',         impact: '$8,200', detected: '2h ago' },
  { severity: 'crit', dashboard: 'Model Selection',    finding: 'GPT-4o used for simple classification — 80% cheaper alt available',   impact: '$6,400', detected: '1d ago' },
  { severity: 'warn', dashboard: 'Token Efficiency',   finding: 'System prompts exceed 2k tokens on 60% of requests',                  impact: '$3,100', detected: '3h ago' },
  { severity: 'warn', dashboard: 'Agentic Workflows',  finding: 'Agent loops averaging 14 steps — target ≤ 8',                          impact: '$2,800', detected: '5h ago' },
  { severity: 'info', dashboard: 'Retrieval (RAG)',    finding: 'Chunk overlap at 40% — reduce to 20% for 15% throughput gain',         impact: '$1,200', detected: '6h ago' },
] as const;

function healthColor(status: string) {
  return status === 'good' ? '#16a34a' : status === 'warn' ? '#f97316' : '#dc2626';
}

function SeverityBadge({ sev }: { sev: string }) {
  const label = sev === 'crit' ? 'Critical' : sev === 'warn' ? 'Warning' : 'Info';
  const fg = sev === 'crit' ? '#dc2626' : sev === 'warn' ? '#ea580c' : '#2563eb';
  const bg = sev === 'crit' ? '#fee2e2' : sev === 'warn' ? '#ffedd5' : '#dbeafe';
  const dot = sev === 'crit' ? '#ef4444' : sev === 'warn' ? '#f97316' : '#3b82f6';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.3125rem 0.75rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 700,
      background: bg,
      color: fg,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot }} />
      {label}
    </span>
  );
}

export default function DashboardOverview() {
  return (
    <>
      <MetricsBar />
      <div style={{ padding: '1.75rem 2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem' }}>
            Dashboard Overview
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            AI cost health across all 8 Tokna dashboards · Updated 2 min ago
          </p>
        </div>

        {/* Dashboards grid */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.875rem', fontWeight: 700, color: '#374151',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            Cost Dashboards
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>
              8 active · 3 need attention
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {VERTICALS.map((v) => (
              <Link key={v.name} href={v.href} className="dashboard-card" style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
                padding: '1.25rem', textDecoration: 'none',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700,
                    color: healthColor(v.status),
                    background: `${healthColor(v.status)}18`,
                    padding: '0.1875rem 0.5rem', borderRadius: '0.25rem',
                  }}>
                    {v.health}/100
                  </span>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111827', marginBottom: '0.25rem' }}>
                  {v.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.875rem' }}>
                  {v.meta}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>Est. waste</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f97316' }}>{v.monthlyWaste}/mo</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Regressions table */}
        <div>
          <div style={{
            fontSize: '0.875rem', fontWeight: 700, color: '#374151',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            Critical Regressions
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>
              2 critical · 2 warnings · 1 info
            </span>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['Severity', 'Dashboard', 'Finding', 'Est. Monthly Impact', 'Detected'].map((h) => (
                    <th key={h} style={{
                      padding: '0.875rem 1.25rem', textAlign: 'left',
                      fontSize: '0.6875rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGRESSIONS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: i < REGRESSIONS.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      <SeverityBadge sev={r.severity} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 600, verticalAlign: 'middle' }}>
                      {r.dashboard}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', color: '#334155', verticalAlign: 'middle', lineHeight: 1.5 }}>
                      {r.finding}
                    </td>
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#dc2626' }}>{r.impact}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontSize: '0.8125rem', color: '#94a3b8', verticalAlign: 'middle' }}>
                      {r.detected}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
