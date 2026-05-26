const STEPS = [
  {
    number: 1,
    name: 'Connect',
    subheadline: 'Integrate Anywhere',
    body: 'Connect to your CI/CD, GitHub Actions, and cloud billing APIs.',
    bullets: [
      'CI/CD pipelines',
      'GitHub / GitLab / Jenkins',
      'AWS Cost Explorer + GCP Billing',
      'On-premise or cloud',
    ],
  },
  {
    number: 2,
    name: 'Scan',
    subheadline: 'Detect Everything',
    body: 'Scan your LLM code for 135+ cost regression patterns.',
    bullets: [
      'Static analysis of prompts and configs',
      'Token limit violations',
      'Missing cost controls',
      'Model selection anti-patterns',
    ],
  },
  {
    number: 3,
    name: 'Fix',
    subheadline: 'Close the Loop',
    body: 'Get cost findings directly in pull requests.',
    bullets: [
      'Cost findings in PRs',
      'Estimated monthly impact per issue',
      'Track fixes across teams',
      'Continuous monitoring',
    ],
  },
];

export default function Approach() {
  return (
    <section style={{ background: '#f9fafb', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#f97316',
            margin: '0 0 1rem',
          }}>
            THE Tokna APPROACH
          </p>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 1rem',
            lineHeight: 1.2,
          }}>
            AI cost intelligence built into your<br />development workflow
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', margin: 0 }}>
            From first commit to production, Tokna meets you wherever you&apos;re building.
          </p>
        </div>

        <div className="approach-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}>
          {STEPS.map((step) => (
            <div key={step.number} style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.75rem',
              padding: '1.75rem',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
              display: 'flex',
              gap: '1.25rem',
            }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.1)',
                border: '1.5px solid rgba(249, 115, 22, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#f97316',
                flexShrink: 0,
              }}>
                {step.number}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{step.name}</span>
                  <span style={{ fontSize: '0.8125rem', color: '#f97316', fontWeight: 600 }}>{step.subheadline}</span>
                </div>
                <p style={{ fontSize: '0.9375rem', color: '#374151', margin: '0 0 1rem', lineHeight: 1.6 }}>
                  {step.body}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {step.bullets.map((bullet) => (
                    <li key={bullet} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
