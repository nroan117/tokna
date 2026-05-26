import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
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
            AI Cost Optimization Platform
          </p>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            color: '#111827',
            margin: 0,
          }}>
            Catch AI cost waste<br />
            <span style={{ color: '#f97316' }}>before it builds & before it ships</span>
          </h1>
          <p style={{
            fontSize: '1.125rem',
            lineHeight: 1.7,
            color: '#6b7280',
            margin: 0,
            maxWidth: '520px',
          }}>
            Every token, every agent loop, every model call — optimized before it reaches production.
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

        {/* Right: Dashboard preview */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            borderRadius: '0.75rem',
            overflow: 'hidden',
            width: '100%',
            maxWidth: '580px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(249,115,22,0.12)',
            border: '1px solid rgba(249,115,22,0.15)',
          }}>
            <Image
              src="/dashboard-preview.png"
              alt="Tokna Dashboard — AI cost intelligence across 8 verticals"
              width={1200}
              height={1000}
              style={{ width: '100%', height: 'auto', display: 'block' }}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
