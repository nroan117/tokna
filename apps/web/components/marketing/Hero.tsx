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
          {/*
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#f97316',
            margin: 0,
          }}>
            Automated AI Cost Savings
          </p>
          */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 4.5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: 1.2,
            color: '#111827',
            margin: 0,
          }}>
            Maximized performance.
            <br />
            Reduced spend.
            <br />
            <span style={{ color: '#f97316' }}>You focus on building.</span>
          </h1>
          <p style={{
            fontSize: '1.25rem',
            lineHeight: 1.6,
            color: '#4b5563',
            margin: '1.5rem 0 0',
            maxWidth: '600px',
            fontWeight: 450,
          }}>
            Automated optimization for every token, agent loop, and model call.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Link href="/contact" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.875rem 2rem',
              background: '#f97316',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'transform 0.1s ease',
            }}>
              Book a Demo
            </Link>
          </div>
          <p style={{
            fontSize: '0.875rem',
            color: '#9ca3af',
            marginTop: '1.5rem',
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            letterSpacing: '0.02em',
          }}>
            220+ cost rules · Used in CI/CD pipelines
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
              alt="Tokna Dashboard — Automated AI cost savings across 8 verticals"
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
