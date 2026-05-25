'use client';
import { useState } from 'react';

const TABS = [
  {
    id: 'cost-scanning',
    label: 'Cost Scanning',
    eyebrow: 'Automated cost regression scanning for AI workloads',
    description: 'Automated scanning that finds cost regressions in your LLM code',
    bullets: [
      'Missing token limits',
      'Unbounded retry loops',
      'Model selection waste',
      'Prompt caching gaps',
    ],
    codeBlock: `$ npx tokna@latest scan

🔍 Scanning 47 files...

  ⚠ chat/completion.ts:42
    Rule: missing-max-tokens [HIGH]
    Impact: ~$1,240/mo uncapped
    Fix:  maxTokens: 512

  ⚠ utils/retry.ts:87
    Rule: unbounded-retry [MED]
    Impact: ~$340/mo worst-case
    Fix:  maxRetries: 3

  ⚠ classify/model.ts:14
    Rule: overpriced-model [LOW]
    Impact: ~$180/mo vs gpt-3.5
    Fix:  model: 'gpt-3.5-turbo'

Total: 3 regressions · $1,760/mo est.
Run 'tokna fix' to auto-remediate.`,
  },
  {
    id: 'cicd-integration',
    label: 'CI/CD Integration',
    eyebrow: 'Catch regressions in every pull request automatically',
    description: 'Drop-in GitHub Actions integration — zero config for common setups',
    bullets: [
      'GitHub Actions native support',
      'GitLab CI / Jenkins plugins',
      'PR comments with cost delta',
      'Block merges on HIGH findings',
    ],
    codeBlock: `# .github/workflows/cost-check.yml

name: Cost Regression Check
on: [pull_request]

jobs:
  tokna:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: tokna/action@v1
        with:
          fail-on: HIGH
          comment-on-pr: true
          token: \${{ secrets.GITHUB_TOKEN }}

# PR Comment output:
# ─────────────────────────────────
# 🔍 Tokna Cost Check
# ✅ 0 HIGH · ⚠ 1 MED · ✓ 2 LOW
# Est. monthly impact: +$340
# Details → tokna.ai/runs/abc123`,
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
    codeBlock: `$ tokna report --format json

{
  "period": "2026-04-01 to 2026-05-01",
  "teams": {
    "platform": {
      "score": 94,
      "open_findings": 2,
      "resolved": 18,
      "est_savings": "$4,320/mo"
    },
    "ml-infra": {
      "score": 71,
      "open_findings": 9,
      "resolved": 4,
      "est_savings": "$1,100/mo"
    }
  },
  "total_est_savings": "$5,420/mo",
  "trend": "improving (+12pts MoM)"
}`,
  },
  {
    id: 'rule-engine',
    label: 'Rule Engine',
    eyebrow: 'Define and enforce cost guardrails as code',
    description: 'Write custom rules in YAML — ship them to every repo via policy-as-code',
    bullets: [
      '135+ built-in cost rules',
      'Custom YAML rule authoring',
      'Per-team rule overrides',
      'Semgrep-compatible patterns',
    ],
    codeBlock: `# tokna-rules/token-limits.yaml

rules:
  - id: missing-max-tokens
    severity: HIGH
    pattern: |
      openai.chat.completions.create({
        ...,
        # no max_tokens key
      })
    message: >
      Missing max_tokens can cause runaway
      costs. Add max_tokens: 512 or lower.
    fix: "Add max_tokens: 512"
    tags: [openai, tokens, cost-critical]

  - id: gpt4-in-bulk-job
    severity: MED
    pattern: model == "gpt-4*"
    context: batch_job
    message: >
      GPT-4 in bulk jobs costs 20x GPT-3.5.
      Use gpt-3.5-turbo for classification.`,
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
            Everything you need to stop cost regressions
          </h2>
        </div>

        {/* Tab bar */}
        <div role="tablist" style={{
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
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
          <div>
            <div style={{
              background: '#0f1117', borderRadius: '0.75rem', overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.04)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'block' }} />
              </div>
              <div style={{ padding: '1.25rem', overflow: 'auto' }}>
                <pre style={{
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: '0.8125rem', lineHeight: 1.6, color: '#a1efb7',
                  margin: 0, whiteSpace: 'pre',
                }}>
                  {activeTab.codeBlock}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
