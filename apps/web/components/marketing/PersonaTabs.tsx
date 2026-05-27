'use client';
import { useState } from 'react';

const tabs = [
  {
    id: 'finops',
    label: 'For FinOps Directors',
    subtitle: 'Visibility & Control',
    description:
      'You need automated cost engineering for LLM workloads before they blow your budget. Tokna gives you shift-left cost automation without requiring manual intervention.',
    bullets: [
      'Catch regressions before production — not after the bill arrives',
      'Application-level cost attribution (not just cloud billing)',
      'Continuous monitoring in CI/CD pipelines',
      'Actionable findings, not raw metrics',
    ],
  },
  {
    id: 'platform',
    label: 'For Platform Engineers',
    subtitle: 'Automation & Scale',
    description:
      'You need guardrails that run in CI/CD without slowing down your teams. Tokna integrates in minutes and runs silently until something breaks.',
    bullets: [
      'Drop-in GitHub Action — 5-minute setup',
      '135+ rules, zero config required',
      'PR comments with cost impact estimates',
      'Works with any LLM provider',
    ],
  },
  {
    id: 'developers',
    label: 'For Developers',
    subtitle: 'Speed & Feedback',
    description:
      'You want to ship fast without accidentally introducing a $10k/month token explosion. Tokna catches it in your PR so you never get paged for it.',
    bullets: [
      'Cost feedback in the PR, not post-incident',
      'Specific line-level findings',
      'Fix suggestions included',
      'No new tools to learn — just your existing workflow',
    ],
  },
];

export default function PersonaTabs() {
  const [activeTab, setActiveTab] = useState('finops');
  const activePersona = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <section style={{ background: '#ffffff', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#f97316', margin: '0 0 1rem',
          }}>
            SOLUTIONS FOR EVERY TEAM
          </p>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#111827',
            margin: '0 0 1rem', lineHeight: 1.2,
          }}>
            AI cost engineering that works for everyone
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#6b7280', margin: 0 }}>
            Whether you&apos;re managing cloud budgets or writing LLM code, Tokna meets you
            where you are.
          </p>
        </div>

        {/* Tab bar */}
        <div className="persona-tabs-row" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.625rem 1.25rem',
                fontSize: '0.9375rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#ffffff' : '#374151',
                background: activeTab === tab.id ? '#f97316' : '#f3f4f6',
                border: activeTab === tab.id ? '1px solid #f97316' : '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '2.5rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '0.375rem 0.875rem',
            background: 'rgba(249, 115, 22, 0.1)',
            color: '#f97316',
            fontWeight: 600,
            fontSize: '0.8125rem',
            borderRadius: '2rem',
            marginBottom: '1.25rem',
          }}>
            {activePersona.subtitle}
          </div>
          <p style={{ fontSize: '1.0625rem', color: '#374151', lineHeight: 1.7, margin: '0 0 1.75rem' }}>
            {activePersona.description}
          </p>
          <div>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              What You Get:
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activePersona.bullets.map((bullet) => (
                <li key={bullet} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.9375rem', color: '#374151' }}>
                  <span style={{ color: '#16a34a', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          <a href="/docs/intro" style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '0.75rem 1.5rem',
            background: '#f97316', color: '#ffffff',
            fontWeight: 600, fontSize: '0.9375rem',
            borderRadius: '0.375rem', textDecoration: 'none',
          }}>
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
