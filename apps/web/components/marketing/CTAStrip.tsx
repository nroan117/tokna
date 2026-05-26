import Link from 'next/link';

export default function CTAStrip() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
      padding: '5rem 1.5rem',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#ffffff',
          margin: '0 0 1rem', lineHeight: 1.2,
        }}>
          Stop AI Cost Waste. Ship Smarter, Automatically.
        </h2>
        <p style={{ fontSize: '1.0625rem', color: '#9ca3af', margin: '0 0 2.5rem' }}>
          Join engineering teams optimizing every token, agent loop, and model call — before it reaches production.
        </p>
        <div className="cta-strip-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Link href="/contact" style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.875rem 2rem',
            background: '#f97316', color: '#ffffff',
            fontWeight: 600, fontSize: '1rem',
            borderRadius: '0.375rem', textDecoration: 'none',
          }}>
            Book a Demo
          </Link>
          <Link href="/docs/intro" style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.875rem 2rem',
            background: 'transparent', color: '#ffffff',
            fontWeight: 600, fontSize: '1rem',
            borderRadius: '0.375rem',
            border: '1px solid rgba(255,255,255,0.2)',
            textDecoration: 'none',
          }}>
            Try Free
          </Link>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
          ✓ 135+ rules &nbsp;·&nbsp; ✓ CI/CD native &nbsp;·&nbsp; ✓ Open source core
        </p>
      </div>
    </section>
  );
}
