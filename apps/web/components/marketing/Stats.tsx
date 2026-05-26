const stats = [
  {
    number: '135+',
    label: 'Cost Rules',
    description: 'Covering token limits, retry loops, model waste, and more',
  },
  {
    number: '3,600+',
    label: 'Repos Scanned',
    description: 'Open source repos analyzed to validate rule accuracy',
  },
  {
    number: '16k+',
    label: 'Findings Detected',
    description: 'Cost regression patterns found across the corpus',
  },
];

export default function Stats() {
  return (
    <section style={{ background: '#f9fafb', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#f97316', margin: '0 0 1rem',
          }}>
            TRUSTED AT SCALE
          </p>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#111827',
            margin: '0 0 1rem', lineHeight: 1.2,
          }}>
            Built by engineers who&apos;ve seen the waste
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#6b7280', margin: 0 }}>
            Real cost intelligence from real production systems.
          </p>
        </div>

        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
            }}>
              <div style={{
                fontSize: '3rem', fontWeight: 800, color: '#f97316',
                lineHeight: 1, marginBottom: '0.5rem',
              }}>
                {stat.number}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
