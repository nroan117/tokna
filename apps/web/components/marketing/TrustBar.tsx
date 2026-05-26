const MARQUEE_ITEMS = [
  'Top cloud-native fintech',
  'Global SaaS platform',
  'Top 3 US streaming service',
  'Leading AI infrastructure company',
  'Enterprise DevOps platform',
  'Top 5 e-commerce company',
  'Fortune 500 cloud team',
  'High-growth ML startup',
];

export default function TrustBar() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <section style={{
      background: '#f9fafb',
      borderTop: '1px solid #e5e7eb',
      borderBottom: '1px solid #e5e7eb',
      padding: '2rem 0',
      overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '1.25rem', padding: '0 1.5rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0, letterSpacing: '0.02em' }}>
          Engineering teams building <strong style={{ color: '#374151', fontWeight: 600 }}>AI products</strong> trust Tokna to catch cost waste early
        </p>
      </div>
      <div style={{
        width: '100%',
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}>
        <div className="marquee-track" style={{ display: 'flex', width: 'max-content' }}>
          {items.map((item, i) => (
            <span key={`marquee-${i}`} style={{
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              padding: '0.375rem 0',
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: '#374151',
              letterSpacing: '0.01em',
            }}>
              {item}
              <span aria-hidden="true" style={{ color: '#d1d5db', margin: '0 1.25rem', fontSize: '1.25rem', lineHeight: 1 }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
