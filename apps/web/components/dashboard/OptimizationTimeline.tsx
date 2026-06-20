'use client';

export interface ROIEvent {
  id: string;
  type: 'GUIDE' | 'AUDIT';
  timestamp: string;
  summary: string;
  savings_usd?: number;
  tokens_saved?: number;
  rule_id?: string;
  status: 'applied' | 'skipped' | 'flagged';
}

interface OptimizationTimelineProps {
  events: ROIEvent[];
  loading?: boolean;
}

function typeColor(type: string) {
  return type === 'GUIDE' ? '#8b5cf6' : '#f97316';
}

function typeBg(type: string) {
  return type === 'GUIDE' ? 'rgba(139,92,246,0.12)' : 'rgba(249,115,22,0.12)';
}

function statusBadge(status: string) {
  if (status === 'applied') return { label: '✓ Applied', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' };
  if (status === 'flagged') return { label: '⚠ Flagged', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' };
  return { label: '— Skipped', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
}

function formatTs(ts: string) {
  try {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  } catch {
    return ts;
  }
}

const SKELETON_ROWS = 5;

export default function OptimizationTimeline({ events, loading = false }: OptimizationTimelineProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            padding: '0.875rem 1.25rem',
            background: '#f8fafc',
            borderRadius: '0.5rem',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <div style={{ width: '48px', height: '20px', background: '#e2e8f0', borderRadius: '0.25rem' }} />
            <div style={{ flex: 1, height: '14px', background: '#e2e8f0', borderRadius: '0.25rem' }} />
            <div style={{ width: '60px', height: '14px', background: '#e2e8f0', borderRadius: '0.25rem' }} />
          </div>
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#9ca3af', fontSize: '0.875rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
        No optimization events yet. Events will appear here as Tokna runs guide and audit passes.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {events.map((ev, i) => {
        const badge = statusBadge(ev.status);
        return (
          <div
            key={ev.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr auto',
              gap: '1rem',
              alignItems: 'center',
              padding: '0.875rem 1.25rem',
              borderBottom: i < events.length - 1 ? '1px solid #f1f5f9' : 'none',
            }}
          >
            {/* Type chip */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '0.25rem 0.375rem',
              background: typeBg(ev.type),
              color: typeColor(ev.type),
              borderRadius: '0.375rem',
              fontSize: '0.6875rem', fontWeight: 700,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {ev.type === 'GUIDE' ? '▶ GUIDE' : '🔍 AUDIT'}
            </span>

            {/* Summary */}
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: 500, marginBottom: '0.125rem' }}>
                {ev.summary}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {ev.rule_id && (
                  <span style={{
                    fontSize: '0.6875rem', color: '#6b7280',
                    background: '#f1f5f9', borderRadius: '0.25rem',
                    padding: '0.0625rem 0.375rem',
                    fontFamily: 'monospace',
                  }}>
                    {ev.rule_id}
                  </span>
                )}
                {ev.savings_usd !== undefined && ev.savings_usd > 0 && (
                  <span style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>
                    −${ev.savings_usd.toFixed(2)}/mo
                  </span>
                )}
                {ev.tokens_saved !== undefined && ev.tokens_saved > 0 && (
                  <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>
                    {(ev.tokens_saved / 1000).toFixed(1)}k tokens
                  </span>
                )}
                <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>
                  {formatTs(ev.timestamp)}
                </span>
              </div>
            </div>

            {/* Status */}
            <span style={{
              padding: '0.1875rem 0.5rem',
              background: badge.bg,
              color: badge.color,
              borderRadius: '0.25rem',
              fontSize: '0.6875rem', fontWeight: 600,
              whiteSpace: 'nowrap',
            }}>
              {badge.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
