import Link from 'next/link';

/*
const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Cost Scanning', href: '/docs/cost-scanning' },
      { label: 'CI/CD Integration', href: '/docs/cicd' },
      { label: 'Cost Reports', href: '/docs/reports' },
      { label: 'Rule Engine', href: '/docs/rules' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For FinOps Directors', href: '/solutions/finops' },
      { label: 'For Platform Engineers', href: '/solutions/platform' },
      { label: 'For Developers', href: '/solutions/developers' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs/intro' },
      { label: 'GitHub', href: 'https://github.com' },
      { label: 'Blog', href: '/blog' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];
*/

export default function SiteFooter() {
  return (
    <footer style={{
      background: '#111827',
      padding: '4rem 1.5rem 2rem',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/*
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          marginBottom: '3rem',
        }}>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 style={{
                fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: '#9ca3af',
                margin: '0 0 1rem',
              }}>
                {col.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      style={{ fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none' }}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        */}

        <div style={{
          borderTop: '1px solid #1f2937',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              © 2026 Tokna. All rights reserved.
            </p>
            <Link href="/contact" style={{ fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none' }}>
              Contact
            </Link>
          </div>
          {/*
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none' }}>
              GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none' }}>
              LinkedIn
            </a>
          </div>
          */}
        </div>
      </div>
    </footer>
  );
}
