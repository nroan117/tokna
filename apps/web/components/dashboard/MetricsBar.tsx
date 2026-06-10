import HealthGauge from './HealthGauge';

export default function MetricsBar() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(160px, 1fr) minmax(200px, 1.15fr) minmax(260px, 1fr)',
      gap: '1rem',
      padding: '1.25rem 2rem',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
    }}>
      {/* Monthly Spend */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
        padding: '1.125rem 1.375rem', display: 'flex', flexDirection: 'column', gap: '0.25rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
      }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>
          Monthly Spend
        </div>
        <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
          $142,500
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Last 30 days · all dashboards</div>
      </div>

      {/* Estimated Waste */}
      <div style={{
        background: '#fff7ed',
        border: '1.5px solid #f97316',
        borderRadius: '0.75rem',
        padding: '1.125rem 1.375rem',
        display: 'flex', flexDirection: 'column', gap: '0.25rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 0 0 3px rgba(249, 115, 22, 0.1)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'linear-gradient(90deg, #c2410c, #f97316, #fb923c)',
        }} />
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c2410c' }}>
          ⚠ Estimated Waste
        </div>
        <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#ea580c', lineHeight: 1.1 }}>
          $28,400
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '0.1875rem 0.5rem',
          background: 'rgba(249,115,22,0.12)',
          borderRadius: '0.25rem',
          fontSize: '0.6875rem', fontWeight: 700, color: '#c2410c',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          width: 'fit-content',
        }}>
          ▲ 19.9% of total spend · ACTION REQUIRED
        </div>
      </div>

      {/* Health Score */}
      <div style={{
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
        padding: '1.125rem 1.375rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
      }}>
        <HealthGauge score={72} maxScore={100} size={110} />
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280' }}>
            Health Score
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
            72 / 100
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>↓ 4 pts vs last week</div>
        </div>
      </div>
    </div>
  );
}
