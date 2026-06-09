'use client';
import { useState } from 'react';
import type { ReactNode } from 'react';

/* ─── Mockup: Tab 1 — Scan Results Panel ─────────────────────────────────── */
const ScanResultsMockup: ReactNode = (
  <div style={{
    maxWidth: '520px', width: '100%', fontFamily: 'system-ui, sans-serif',
    borderRadius: '0.75rem', border: '1px solid #e2e8f0',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)', overflow: 'hidden', background: '#ffffff',
  }}>
    {/* Header */}
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1rem' }}>🔍</span>
        <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>Tokna Scan Results</span>
        <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>· 47 files</span>
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#ef4444', fontWeight: 600, marginTop: '0.25rem' }}>3 findings detected</div>
    </div>
    {/* HIGH */}
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
        <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px' }}>🔴 HIGH</span>
        <code style={{ fontSize: '0.8125rem', color: '#374151' }}>chat/completion.ts:42</code>
      </div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>missing-max-tokens</div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.125rem' }}>Uncapped completions — est. +$1,240/mo</div>
      <div style={{ fontSize: '0.8125rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: 500 }}>Fix: Add maxTokens: 512</div>
    </div>
    {/* MED */}
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
        <span style={{ background: '#ffedd5', color: '#ea580c', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px' }}>🟠 MED</span>
        <code style={{ fontSize: '0.8125rem', color: '#374151' }}>utils/retry.ts:87</code>
      </div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>unbounded-retry</div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.125rem' }}>No retry cap — est. +$340/mo</div>
      <div style={{ fontSize: '0.8125rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: 500 }}>Fix: Add maxRetries: 3</div>
    </div>
    {/* LOW */}
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
        <span style={{ background: '#dbeafe', color: '#2563eb', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px' }}>🔵 LOW</span>
        <code style={{ fontSize: '0.8125rem', color: '#374151' }}>classify/model.ts:14</code>
      </div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>overpriced-model</div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.125rem' }}>GPT-4 for classification — +$180/mo</div>
      <div style={{ fontSize: '0.8125rem', color: '#16a34a', marginTop: '0.25rem', fontWeight: 500 }}>Fix: Use gpt-3.5-turbo</div>
    </div>
    {/* Footer */}
    <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
        Total estimated waste: <span style={{ color: '#ef4444' }}>$1,760/mo</span>
      </div>
      <button style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
        Run tokna fix →
      </button>
    </div>
  </div>
);

/* ─── Mockup: Tab 2 — GitHub PR Comment ──────────────────────────────────── */
const CICDMockup: ReactNode = (
  <div style={{
    maxWidth: '520px', width: '100%',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    borderRadius: '0.75rem', border: '1px solid #d0d7de',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)', overflow: 'hidden', background: '#ffffff',
  }}>
    {/* PR header */}
    <div style={{ padding: '0.875rem 1.25rem', background: '#f6f8fa', borderBottom: '1px solid #d0d7de' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ background: '#1a7f37', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.625rem', borderRadius: '999px' }}>Open</span>
        <span style={{ fontWeight: 600, color: '#24292f', fontSize: '0.9rem' }}>Pull Request #247</span>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#24292f', fontWeight: 600, marginTop: '0.25rem' }}>
        feat: add streaming support to chat API
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#57606a', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <span style={{ background: '#ddf4ff', color: '#0550ae', padding: '0.0625rem 0.375rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem' }}>main</span>
        <span>←</span>
        <span style={{ background: '#ddf4ff', color: '#0550ae', padding: '0.0625rem 0.375rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.75rem' }}>feature/streaming</span>
      </div>
    </div>
    {/* Comment */}
    <div style={{ padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {/* Bot avatar */}
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', background: '#f97316',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.125rem', flexShrink: 0,
        }}>⚡</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: '#24292f', fontSize: '0.875rem' }}>tokna bot</span>
            <span style={{ color: '#57606a', fontSize: '0.8125rem' }}>· just now</span>
            <span style={{ background: '#ddf4ff', color: '#0550ae', fontSize: '0.6875rem', padding: '0.0625rem 0.375rem', borderRadius: '999px', fontWeight: 600 }}>Bot</span>
          </div>
          {/* Inner Tokna result card */}
          <div style={{ border: '1px solid #d0d7de', borderRadius: '0.5rem', overflow: 'hidden' }}>
            <div style={{ padding: '0.625rem 1rem', background: '#f6f8fa', borderBottom: '1px solid #d0d7de', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem' }}>🔍</span>
              <span style={{ fontWeight: 700, color: '#24292f', fontSize: '0.875rem' }}>Tokna Cost Check</span>
            </div>
            <div style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.625rem', fontSize: '0.8125rem', fontWeight: 600, flexWrap: 'wrap' }}>
                <span style={{ color: '#1a7f37' }}>✅ 0 HIGH</span>
                <span style={{ color: '#bf8700' }}>⚠️ 1 MED</span>
                <span style={{ color: '#57606a' }}>✓ 2 LOW</span>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#24292f', marginBottom: '0.625rem' }}>
                Estimated monthly impact: <strong style={{ color: '#ef4444' }}>+$340</strong>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '0.375rem', padding: '0.625rem 0.75rem', marginBottom: '0.625rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>⚠️ MED · utils/retry.ts:87</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#24292f' }}>unbounded-retry</div>
                <div style={{ fontSize: '0.75rem', color: '#57606a', marginTop: '0.125rem' }}>No retry cap — +$340/mo</div>
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#0550ae', cursor: 'pointer' }}>
                View full report → tokna.ai/runs/…
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Mockup: Tab 3 — Team Dashboard Panel ───────────────────────────────── */
const CostReportsMockup: ReactNode = (
  <div style={{
    maxWidth: '520px', width: '100%', fontFamily: 'system-ui, sans-serif',
    borderRadius: '0.75rem', border: '1px solid #e2e8f0',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)', overflow: 'hidden', background: '#ffffff',
  }}>
    {/* Header */}
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
      <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9375rem' }}>Cost Intelligence Report</span>
      <span style={{ fontSize: '0.8125rem', color: '#6b7280', fontWeight: 500 }}>May 2026</span>
    </div>
    {/* Team row: Platform Engineering */}
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Platform Engineering</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.8125rem', padding: '0.125rem 0.625rem', borderRadius: '999px' }}>94/100</span>
          <span>✅</span>
        </div>
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.5rem' }}>2 open · $4,320/mo savings unlocked</div>
      <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
        <div style={{ background: '#f97316', height: '100%', width: '94%', borderRadius: '999px' }} />
      </div>
    </div>
    {/* Team row: ML Infrastructure */}
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>ML Infrastructure</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ background: '#fffbeb', color: '#d97706', fontWeight: 700, fontSize: '0.8125rem', padding: '0.125rem 0.625rem', borderRadius: '999px' }}>71/100</span>
          <span>⚠️</span>
        </div>
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.5rem' }}>9 open · $12,300/mo at risk</div>
      <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
        <div style={{ background: '#f97316', height: '100%', width: '71%', borderRadius: '999px' }} />
      </div>
    </div>
    {/* Team row: Data Engineering */}
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.9rem' }}>Data Engineering</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 700, fontSize: '0.8125rem', padding: '0.125rem 0.625rem', borderRadius: '999px' }}>83/100</span>
          <span>✅</span>
        </div>
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.5rem' }}>4 open · $2,100/mo savings unlocked</div>
      <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
        <div style={{ background: '#f97316', height: '100%', width: '83%', borderRadius: '999px' }} />
      </div>
    </div>
    {/* Footer */}
    <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '1rem' }}>📈</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>
        Total savings unlocked: <span style={{ color: '#16a34a' }}>$18,720/mo</span>
      </span>
    </div>
  </div>
);

/* ─── Mockup: Tab 4 — Rules Browser ─────────────────────────────────────── */
const RuleEngineMockup: ReactNode = (
  <div style={{
    maxWidth: '520px', width: '100%', fontFamily: 'system-ui, sans-serif',
    borderRadius: '0.75rem', border: '1px solid #e2e8f0',
    boxShadow: '0 20px 50px rgba(0,0,0,0.08)', overflow: 'hidden', background: '#ffffff',
  }}>
    {/* Search bar */}
    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '0.625rem' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem 0.75rem' }}>
        <span style={{ fontSize: '0.875rem' }}>🔍</span>
        <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>Search 220+ rules...</span>
      </div>
      <button style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.8125rem', color: '#374151', cursor: 'pointer', fontWeight: 500 }}>
        All ▾
      </button>
    </div>
    {/* Expanded rule: TKN-001 */}
    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#fffbeb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
        <span style={{ background: '#f97316', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>TKN-001</span>
        <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Token Limits</span>
        <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px' }}>🔴 HIGH</span>
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#374151', marginBottom: '0.5rem' }}>Missing max_tokens bound on completion</div>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.625rem 0.75rem', fontSize: '0.8125rem' }}>
        <div style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
          Matches: <code style={{ fontFamily: 'monospace', color: '#374151' }}>openai.chat()</code> without <code style={{ fontFamily: 'monospace', color: '#374151' }}>maxTokens</code> param
        </div>
        <div style={{ color: '#16a34a', fontWeight: 500 }}>Fix: Add maxTokens: 512</div>
      </div>
    </div>
    {/* TKN-042 */}
    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        <span style={{ background: '#f97316', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>TKN-042</span>
        <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Model Selection</span>
        <span style={{ background: '#ffedd5', color: '#ea580c', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px' }}>🟠 MED</span>
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>GPT-4 used for classification tasks</div>
    </div>
    {/* TKN-087 */}
    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        <span style={{ background: '#f97316', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>TKN-087</span>
        <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Retry Logic</span>
        <span style={{ background: '#ffedd5', color: '#ea580c', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px' }}>🟠 MED</span>
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>Unbounded retry loop detected</div>
    </div>
    {/* TKN-103 */}
    <div style={{ padding: '0.875rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        <span style={{ background: '#f97316', color: '#fff', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>TKN-103</span>
        <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Prompt Caching</span>
        <span style={{ background: '#dbeafe', color: '#2563eb', fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem', borderRadius: '999px' }}>🔵 LOW</span>
      </div>
      <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>Cacheable system prompt not cached</div>
    </div>
  </div>
);

/* ─── Tab definitions ─────────────────────────────────────────────────────── */
const TABS = [
  {
    id: 'cost-scanning',
    label: 'Cost Scanning',
    eyebrow: 'Automated cost regression scanning for AI workloads',
    description: 'Automated scanning that finds cost regressions in your AI code',
    bullets: [
      'Missing token limits',
      'Unbounded retry loops',
      'Model selection waste',
      'Prompt caching gaps',
    ],
    mockup: ScanResultsMockup,
  },
  {
    id: 'cicd-integration',
    label: 'CI/CD Integration',
    eyebrow: 'Prevent regressions in every pull request automatically',
    description: 'Drop-in GitHub Actions integration — zero config for common setups',
    bullets: [
      'GitHub Actions native support',
      'GitLab CI / Jenkins plugins',
      'PR comments with cost delta',
      'Block merges on HIGH findings',
    ],
    mockup: CICDMockup,
  },
  {
    id: 'cost-reports',
    label: 'Cost Reports',
    eyebrow: 'Track cost posture across your entire codebase over time',
    description: 'Aggregate cost findings into team dashboards and trend reports',
    bullets: [
      'Per-repo and per-team cost scores',
      'Weekly cost regression trend',
      'Slack / PagerDuty alerts',
      'FinOps Foundation alignment',
    ],
    mockup: CostReportsMockup,
  },
  {
    id: 'rule-engine',
    label: 'Rule Engine',
    eyebrow: 'Define and enforce cost guardrails as code',
    description: 'Write custom rules in YAML — ship them to every repo via policy-as-code',
    bullets: [
      '220+ built-in cost rules',
      'Custom YAML rule authoring',
      'Per-team rule overrides',
      'Semgrep-compatible patterns',
    ],
    mockup: RuleEngineMockup,
  },
];

export default function ProductTabs() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const activeTab = TABS.find((t) => t.id === activeId) ?? TABS[0];

  return (
    <section style={{ background: '#ffffff', padding: '5rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: '#f97316', margin: '0 0 1rem',
          }}>
            HOW IT WORKS
          </p>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#111827',
            margin: 0, lineHeight: 1.2,
          }}>
            Everything you need to automate AI cost engineering
          </h2>
        </div>

        {/* Tab bar */}
        <div role="tablist" className="product-tabs-row" style={{
          display: 'flex', gap: '0.5rem', marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb', paddingBottom: '0',
        }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tab.id === activeId}
              onClick={() => setActiveId(tab.id)}
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '0.9375rem',
                fontWeight: tab.id === activeId ? 600 : 500,
                color: tab.id === activeId ? '#f97316' : '#374151',
                background: 'transparent',
                border: 'none',
                borderBottom: tab.id === activeId ? '2px solid #f97316' : '2px solid transparent',
                cursor: 'pointer',
                marginBottom: '-1px',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="product-tabs-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          {/* Left: text */}
          <div>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: '#f97316', margin: '0 0 0.75rem',
            }}>
              {activeTab.eyebrow}
            </p>
            <p style={{ fontSize: '1.0625rem', color: '#374151', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
              {activeTab.description}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeTab.bullets.map((bullet) => (
                <li key={bullet} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.9375rem', color: '#374151' }}>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          {/* Right: mockup */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            {activeTab.mockup}
          </div>
        </div>
      </div>
    </section>
  );
}
