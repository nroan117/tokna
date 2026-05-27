import SiteFooter from '../../../components/marketing/SiteFooter';

export default function AboutPage() {
  return (
    <>
      <main style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
          About Tokna
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', lineHeight: 1.7 }}>
          Tokna is an AI cost engineering automation platform built by engineers who&apos;ve seen the waste firsthand.
          We help engineering teams catch LLM cost regressions before they reach production.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
