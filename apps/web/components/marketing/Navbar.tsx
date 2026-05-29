'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}>
          <span style={{ color: '#f97316' }}>⚡</span> Tokna
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link href="/pricing" style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
              Pricing
            </Link>
          </div>
          <Link href="/contact" style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.5rem 1.25rem',
            background: '#f97316',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: '0.375rem',
          }}>
            Book a Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}
