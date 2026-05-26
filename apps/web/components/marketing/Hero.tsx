import Link from 'next/link';

export default function Hero() {
  const terminalOutput = `$ npx tokna@latest scan

🔍 Scanning LLM code for cost regressions...

  ✓ Analyzing prompt configurations
  ✓ Checking token limits
  ✓ Reviewing model selections
  ✓ Auditing retry logic

⚠ FINDINGS (3 issues detected):

  [HIGH] Missing max_tokens in chat.ts:42
    Estimated impact: +$1,240/mo
    Fix: Add max_tokens: 512

  [MED]  Unbounded retry loop in api.ts:87
    Estimated impact: +$340/mo
    Fix: Add retry cap

  [LOW]  GPT-4 used for classification
    Estimated impact: +$180/mo
    Fix: Switch to GPT-3.5

✅ Scan complete — 3 regressions found
   Total estimated waste: $1,760/mo`;

  return (
    <section className="hero-section" style={{
      background: '#ffffff',
      padding: '6rem 1.5rem 5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        left: '40%',
        transform: 'translateX(-50%)',
        width: '900px',
        height: '600px',
        background: 'radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div className="hero-grid" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
        position: 'relative',
      }}>
        {/* Left: Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#f97316',
            margin: 0,
          }}>
            Cloud Cost Optimization Platform
          </p>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#111827',
            margin: 0,
          }}>
            Catch cloud cost waste<br />
            <span style={{ color: '#f97316' }}>before it ships</span>
          </h1>
          <p style={{
            fontSize: '1.125rem',
            lineHeight: 1.7,
            color: '#6b7280',
            margin: 0,
            maxWidth: '520px',
          }}>
            Automated cost regression detection for LLM applications. Catch expensive bugs in CI/CD before they reach production.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <Link href="/contact" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.75rem',
              background: '#f97316',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.9375rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
            }}>
              Book a Demo
            </Link>
            <Link href="/docs/intro" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.75rem',
              background: 'transparent',
              color: '#374151',
              fontWeight: 600,
              fontSize: '0.9375rem',
              borderRadius: '0.375rem',
              border: '1px solid #e5e7eb',
              textDecoration: 'none',
            }}>
              Try Free
            </Link>
          </div>
          <p style={{
            fontSize: '0.8125rem',
            color: '#9ca3af',
            margin: 0,
            letterSpacing: '0.02em',
          }}>
            135+ cost rules · Used in CI/CD pipelines
          </p>
        </div>

        {/* Right: Terminal */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            background: '#0f1117',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(249,115,22,0.08)',
          }}>
            {/* Terminal header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'block' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'block' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', display: 'block' }} />
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: 'auto', fontFamily: 'monospace' }}>
                tokna scan
              </span>
            </div>
            {/* Terminal body */}
            <div style={{ padding: '1.25rem', background: '#0f1117' }}>
              <pre style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '0.8125rem',
                lineHeight: 1.6,
                color: '#a1efb7',
                background: '#0f1117',
                margin: 0,
                whiteSpace: 'pre',
              }}>
                {terminalOutput}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
