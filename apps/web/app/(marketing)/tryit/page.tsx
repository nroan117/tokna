'use client';
import { useState } from 'react';

interface Finding {
  rule_id: string;
  severity: string;
  file: string;
  line: number;
  message: string;
  model: string;
  model_normalized: string;
  model_is_estimate: boolean;
  est_input_tokens_per_call: number;
  est_output_tokens_per_call: number;
  monthly_cost_usd: number;
}

interface CoverageSummary {
  total_rules_checked: number;
  total_findings: number;
}

interface ScanResult {
  repo_url: string;
  daily_call_volume: number;
  total_monthly_usd: number;
  finding_count: number;
  findings: Finding[];
  coverage_summary: CoverageSummary;
  truncated: boolean;
  error: string | null;
}

type Status = 'idle' | 'loading' | 'error' | 'results';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#6b7280',
};

function severityColor(sev: string): string {
  return SEVERITY_COLORS[sev.toLowerCase()] ?? '#6b7280';
}

export default function TryItPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [dailyCalls, setDailyCalls] = useState(100);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<ScanResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    setResult(null);
    try {
      const r = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl, daily_call_volume: dailyCalls }),
      });
      const data = await r.json();
      if (!r.ok || data.error) {
        setError(data.error || `Request failed (${r.status})`);
        setStatus('error');
        return;
      }
      setResult(data as ScanResult);
      setStatus('results');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  const sortedFindings = result
    ? [...result.findings].sort((a, b) => b.monthly_cost_usd - a.monthly_cost_usd)
    : [];

  return (
    <main style={{ background: '#ffffff', minHeight: '70vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 800,
          color: '#111827',
          lineHeight: 1.15,
          marginBottom: '1rem',
        }}>
          Scan a public repo for LLM cost issues.
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#6b7280',
          lineHeight: 1.6,
          marginBottom: '2.5rem',
        }}>
          Paste any public GitHub repo and we&apos;ll run a scan and a cost estimate
          against your code. No setup, no signup.
        </p>

        <form onSubmit={handleSubmit} style={{ marginBottom: '2.5rem' }}>
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            required
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              fontSize: '1rem',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              boxSizing: 'border-box',
            }}
          />
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label
                htmlFor="daily-calls"
                style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}
              >
                Estimated daily LLM calls
              </label>
              <input
                id="daily-calls"
                type="number"
                min={1}
                value={dailyCalls}
                onChange={(e) => setDailyCalls(Number(e.target.value))}
                style={{
                  width: '180px',
                  padding: '0.625rem 0.75rem',
                  fontSize: '0.9375rem',
                  color: '#111827',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.75rem 1.75rem',
                background: status === 'loading' ? '#fdba74' : '#f97316',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.9375rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'loading' ? 'Scanning…' : 'Scan'}
            </button>
          </div>
        </form>

        {status === 'loading' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: '#6b7280',
            fontSize: '0.9375rem',
            marginBottom: '2rem',
          }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                border: '2px solid #e5e7eb',
                borderTopColor: '#f97316',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'tokna-spin 0.8s linear infinite',
              }}
            />
            Cloning &amp; scanning… this can take ~10–40s
          </div>
        )}

        {status === 'error' && (
          <div style={{
            padding: '1rem 1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#dc2626',
            fontSize: '0.9375rem',
            marginBottom: '2rem',
          }}>
            {error}
          </div>
        )}

        {status === 'results' && result && (
          <div>
            {result.total_monthly_usd > 0 ? (
              <div style={{
                padding: '1.25rem 1.5rem',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#ea580c' }}>
                  💸 Estimated +${result.total_monthly_usd}/month
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  (at {result.daily_call_volume} calls/day)
                </div>
              </div>
            ) : (
              <div style={{
                padding: '1.25rem 1.5rem',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem',
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#16a34a',
              }}>
                ✅ No cost issues found across {result.coverage_summary.total_rules_checked} patterns checked
              </div>
            )}

            {sortedFindings.length > 0 && (
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                marginBottom: '1.5rem',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Finding</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>File</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Severity</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Model</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Est. Monthly Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFindings.map((f, i) => (
                      <tr key={`${f.rule_id}-${f.file}-${f.line}-${i}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem 1rem', maxWidth: '340px' }}>
                          <code style={{
                            fontSize: '0.8125rem',
                            color: '#111827',
                            background: '#f9fafb',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.25rem',
                          }}>
                            {f.rule_id}
                          </code>
                          {f.message && (
                            <div style={{
                              marginTop: '0.4rem',
                              fontSize: '0.8125rem',
                              color: '#6b7280',
                              lineHeight: 1.45,
                            }}>
                              {f.message}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontFamily: 'monospace', fontSize: '0.6875rem', maxWidth: '160px', wordBreak: 'break-all', lineHeight: 1.4 }}>
                          {f.file}:{f.line}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.125rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '999px',
                            color: severityColor(f.severity),
                            background: `${severityColor(f.severity)}1a`,
                            textTransform: 'capitalize',
                          }}>
                            {f.severity}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', color: '#111827' }}>
                          {f.model_normalized}{f.model_is_estimate ? ' (est.)' : ''}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#111827' }}>
                          +${f.monthly_cost_usd.toFixed(2)}/mo
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem' }}>
              {result.coverage_summary.total_rules_checked} cost patterns checked ·{' '}
              {result.finding_count} issue(s) found
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.5 }}>
              Findings are real Semgrep matches on your code. Dollar figures are directional
              estimates (the same model the CI product uses).
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes tokna-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}
