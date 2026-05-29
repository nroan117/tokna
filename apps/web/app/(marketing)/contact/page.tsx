import Link from 'next/link';
import SiteFooter from '../../../components/marketing/SiteFooter';

export default function ContactPage() {
  return (
    <>
      <main style={{ 
        padding: '8rem 2rem', 
        textAlign: 'center', 
        minHeight: '70vh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3rem)', 
            fontWeight: 800, 
            color: '#111827', 
            marginBottom: '1.5rem',
            lineHeight: 1.1 
          }}>
            Book a Demo
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#4b5563', 
            lineHeight: 1.6,
            marginBottom: '2.5rem' 
          }}>
            Interested in seeing how Tokna can automatically reduce AI cost waste so you can focus on building? We&apos;d love to chat.
          </p>
          <div style={{
            padding: '2.5rem',
            background: '#f9fafb',
            borderRadius: '1rem',
            border: '1px solid #e5e7eb',
          }}>
            <p style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              color: '#374151', 
              marginBottom: '0.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Email us
            </p>
            <a 
              href="mailto:hello@tokna.ai" 
              style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: '#f97316',
                textDecoration: 'none'
              }}
            >
              hello@tokna.ai
            </a>
          </div>
          <div style={{ marginTop: '3rem' }}>
            <Link href="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'underline' }}>
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
