'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface GroupedFinding {
  rule_id: string;
  severity: string;
  message: string;
  category: string;
  count: number;
  total_monthly_usd: number;
  models: string[];
  instances: Finding[];
}

interface ExampleRepo {
  id: string;
  name: string;
  repo_url: string;
  daily_calls: number;
  description: string;
  icon: string;
  findings_badge: string;
  slug: string;
}

const EXAMPLE_REPOS: ExampleRepo[] = [
  {
    id: 'autogpt',
    slug: 'autogpt',
    name: 'AutoGPT',
    repo_url: 'https://github.com/Significant-Gravitas/AutoGPT',
    daily_calls: 500,
    description: 'Autonomous agent loops and tool-use at scale.',
    icon: '🤖',
    findings_badge: 'High Impact',
  },
  {
    id: 'vercel',
    slug: 'vercel',
    name: 'Vercel AI Chatbot',
    repo_url: 'https://github.com/vercel/ai-chatbot',
    daily_calls: 1000,
    description: 'Modern Next.js streaming and model optimizations.',
    icon: '▲',
    findings_badge: 'Production Clean',
  },
  {
    id: 'openai',
    slug: 'openai',
    name: 'OpenAI Python SDK',
    repo_url: 'https://github.com/openai/openai-python',
    daily_calls: 250,
    description: 'Official SDK implementation and token management.',
    icon: '❄️',
    findings_badge: 'Best Practices',
  },
];

type Status = 'idle' | 'loading' | 'error' | 'results';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#d97706',
  low: '#6b7280',
};

const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 3,
  high: 2,
  medium: 1,
  low: 0.5,
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

function severityColor(sev: string): string {
  return SEVERITY_COLORS[sev.toLowerCase()] ?? '#6b7280';
}

function getCategory(ruleId: string): string {
  const id = ruleId.toLowerCase();
  if (id.includes('openai')) return 'OpenAI';
  if (id.includes('anthropic') || id.includes('claude')) return 'Anthropic';
  if (id.includes('gemini') || id.includes('google')) return 'Google';
  if (id.includes('langchain')) return 'LangChain';
  if (id.includes('embedding')) return 'Embeddings';
  if (id.includes('cache')) return 'Caching';
  if (id.includes('token') || id.includes('context')) return 'Tokens / Context';
  if (id.includes('retry') || id.includes('loop') || id.includes('recursion')) return 'Loops & Retries';
  if (id.includes('output') || id.includes('response')) return 'Output Caps';
  if (id.includes('model')) return 'Model Config';
  return 'General';
}

function highestSeverity(severities: string[]): string {
  for (const s of SEVERITY_ORDER) {
    if (severities.some((x) => x.toLowerCase() === s)) return s;
  }
  return severities[0] ?? 'low';
}

function groupFindings(findings: Finding[]): GroupedFinding[] {
  const map = new Map<string, GroupedFinding>();
  for (const f of findings) {
    const existing = map.get(f.rule_id);
    if (existing) {
      existing.count += 1;
      existing.total_monthly_usd += f.monthly_cost_usd;
      existing.instances.push(f);
      if (!existing.models.includes(f.model_normalized)) {
        existing.models.push(f.model_normalized);
      }
      // update severity to highest
      existing.severity = highestSeverity([existing.severity, f.severity]);
    } else {
      map.set(f.rule_id, {
        rule_id: f.rule_id,
        severity: f.severity,
        message: f.message,
        category: getCategory(f.rule_id),
        count: 1,
        total_monthly_usd: f.monthly_cost_usd,
        models: [f.model_normalized],
        instances: [f],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total_monthly_usd - a.total_monthly_usd);
}

function calcScore(grouped: GroupedFinding[], totalRulesChecked: number): number {
  if (grouped.length === 0) return 100;
  
  // Use a logarithmic-style penalty based on the variety and severity of issues found.
  // This produces a much wider range of scores than dividing by the total rule count.
  const weightedDiversity = grouped.reduce((sum, g) => {
    return sum + (SEVERITY_WEIGHT[g.severity.toLowerCase()] ?? 0.5);
  }, 0);

  // Formula: Score = 100 * (0.88 ^ WeightedDiversity)
  // - 1 Medium rule triggered (~1.0 weight) -> ~88%
  // - 1 High rule triggered (~2.0 weight) -> ~77%
  // - 1 Critical rule triggered (~3.0 weight) -> ~68%
  // - 10 Medium rules -> ~28%
  // - 30+ rules (demo repos) -> < 5%
  const score = Math.round(100 * Math.pow(0.88, weightedDiversity));
  
  return Math.max(1, score);
}

function scoreColor(score: number): string {
  if (score >= 80) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function truncatePath(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts.slice(-2).join('/');
}

export default function TryItPage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState('');
  const [dailyCalls, setDailyCalls] = useState(100);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [animScore, setAnimScore] = useState(0);
  const [animOffset, setAnimOffset] = useState(0);

  function toggleRule(ruleId: string) {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  }

  async function handleExampleSelect(example: ExampleRepo) {
    setRepoUrl(example.repo_url);
    setDailyCalls(example.daily_calls);
    setStatus('loading');
    setError('');
    setResult(null);
    setExpandedRules(new Set());

    try {
      // Proactive fetch for cached results
      const r = await fetch(`/api/examples/${example.slug}`);
      const data = await r.json();
      
      if (r.ok && data.status === 'complete') {
        setResult(data as ScanResult);
        setStatus('results');
        return;
      }
      
      // Fallback to normal scan if cache is missing or incomplete
      const scanRes = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: example.repo_url, daily_call_volume: example.daily_calls }),
      });
      const scanData = await scanRes.json();
      if (scanRes.status === 202 && scanData.scan_id) {
        router.push(`/tryit/${scanData.scan_id}`);
        return;
      }
      setError('Example scan failed to start.');
      setStatus('error');
    } catch (err) {
      setError('Could not load example.');
      setStatus('error');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    setResult(null);
    setExpandedRules(new Set());

    // Normalize URL: auto-prepend https:// if missing
    let normalizedUrl = repoUrl.trim();
    if (normalizedUrl && !normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      const r = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: normalizedUrl, daily_call_volume: dailyCalls }),
      });
      const data = await r.json();
      if (!r.ok || data.error) {
        setError(data.error || `Request failed (${r.status})`);
        setStatus('error');
        return;
      }
      // Async path: backend returns 202 + scan_id → redirect to progress page
      if (r.status === 202 && data.scan_id) {
        router.push(`/tryit/${data.scan_id}`);
        return;
      }
      // Legacy synchronous path (200 with full results)
      setResult(data as ScanResult);
      setStatus('results');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  // Keep for compatibility
  const sortedFindings = result
    ? [...result.findings].sort((a, b) => b.monthly_cost_usd - a.monthly_cost_usd)
    : [];
  void sortedFindings;

  const groupedFindings: GroupedFinding[] = result ? groupFindings(result.findings) : [];

  useEffect(() => {
    if (status !== 'results' || !result) return;
    const score = calcScore(groupedFindings, result.coverage_summary.total_rules_checked);
    const circumference = 2 * Math.PI * 36;
    const targetOffset = circumference * (1 - score / 100);
    const start = performance.now();
    const duration = 1100;
    let rafId: number;
    function tick(now: number) {
      const raw = Math.min((now - start) / duration, 1);
      const t = 1 - Math.pow(1 - raw, 3); // easeOutCubic
      setAnimScore(Math.round(t * score));
      setAnimOffset(circumference - t * (circumference - targetOffset));
      if (raw < 1) rafId = requestAnimationFrame(tick);
    }
    setAnimScore(0);
    setAnimOffset(circumference);
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [status, result]); // eslint-disable-line react-hooks/exhaustive-deps

  // Severity counts for the summary bar
  const severityCounts = groupedFindings.reduce<Record<string, number>>((acc, g) => {
    const s = g.severity.toLowerCase();
    acc[s] = (acc[s] ?? 0) + g.count;
    return acc;
  }, {});
  const totalSeverityCount = Object.values(severityCounts).reduce((a, b) => a + b, 0);

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
          Select an example or provide a public Git repo to optimize! We&apos;ll run a scan and a cost estimate
          against your code. No setup, no signup.
        </p>

        {/* Example Selection */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}>
          {EXAMPLE_REPOS.map((ex) => (
            <button
              key={ex.id}
              onClick={() => handleExampleSelect(ex)}
              disabled={status === 'loading'}
              style={{
                textAlign: 'left',
                padding: '1.25rem',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (status !== 'loading') {
                  e.currentTarget.style.borderColor = '#f97316';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{ex.icon}</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                  color: '#ea580c',
                  background: '#fff7ed',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                }}>
                  {ex.findings_badge}
                </span>
              </div>
              <div style={{ fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{ex.name}</div>
              <div style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.4 }}>{ex.description}</div>
            </button>
          ))}
        </div>

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
            {/* ── 1. Top summary cards ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Card 1 — Cost Impact */}
              {result.total_monthly_usd > 0 ? (
                <div style={{
                  flex: '1 1 200px',
                  padding: '1.25rem 1.5rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                }}>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#ea580c', lineHeight: 1.1 }}>
                    💸 +${result.total_monthly_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.375rem' }}>
                    estimated waste at {result.daily_call_volume} calls/day
                  </div>
                </div>
              ) : (
                <div style={{
                  flex: '1 1 200px',
                  padding: '1.25rem 1.5rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '0.75rem',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: '#16a34a',
                }}>
                  ✅ No cost waste detected
                </div>
              )}

              {/* Card 2 — Cost Efficiency Score */}
              <div style={{
                flex: '1 1 200px',
                padding: '1.25rem 1.5rem',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
              }}>
                {/* SVG Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  {(() => {
                    const circumference = 2 * Math.PI * 36;
                    const score = calcScore(groupedFindings, result.coverage_summary.total_rules_checked);
                    // Gradient colors based on score
                    const gradStart = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
                    const gradEnd   = score >= 80 ? '#6ee7b7' : score >= 50 ? '#fcd34d' : '#fca5a5';
                    const textColor = score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';
                    return (
                      <svg width="88" height="88" viewBox="0 0 88 88" style={{ display: 'block', overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="score-arc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={gradStart} />
                            <stop offset="100%" stopColor={gradEnd} />
                          </linearGradient>
                          <filter id="score-glow">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        {/* Track */}
                        <circle cx="44" cy="44" r="36" fill="none" stroke="#f1f5f9" strokeWidth="7" />
                        {/* Animated arc */}
                        <circle
                          cx="44" cy="44" r="36"
                          fill="none"
                          stroke="url(#score-arc-grad)"
                          strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={animOffset}
                          transform="rotate(-90 44 44)"
                          filter="url(#score-glow)"
                          style={{ transition: 'none' }}
                        />
                        {/* Score number */}
                        <text
                          x="44" y="50"
                          textAnchor="middle"
                          fontSize="22"
                          fontWeight="800"
                          fill={textColor}
                          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                        >
                          {animScore}
                        </text>
                      </svg>
                    );
                  })()}
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280', marginTop: '0.375rem', textAlign: 'center', fontWeight: 600 }}>
                    Cost Efficiency Score
                  </div>
                </div>
                {/* Right stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#374151' }}>
                    {groupedFindings.length} rule{groupedFindings.length !== 1 ? 's' : ''} triggered
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. Severity summary bar ── */}
            {totalSeverityCount > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                {/* Colored bar */}
                <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.625rem' }}>
                  {SEVERITY_ORDER.map((sev) => {
                    const count = severityCounts[sev] ?? 0;
                    if (count === 0) return null;
                    const pct = (count / totalSeverityCount) * 100;
                    return (
                      <div
                        key={sev}
                        style={{
                          width: `${pct}%`,
                          background: SEVERITY_COLORS[sev],
                        }}
                      />
                    );
                  })}
                </div>
                {/* Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
                  {SEVERITY_ORDER.map((sev) => {
                    const count = severityCounts[sev] ?? 0;
                    if (count === 0) return null;
                    return (
                      <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: SEVERITY_COLORS[sev],
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                          {sev}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 4. Truncation notice (above table) ── */}
            {result.truncated && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '0.5rem',
                padding: '0.625rem 1rem',
                fontSize: '0.8125rem',
                color: '#92400e',
                marginBottom: '0.75rem',
              }}>
                ⚡ Showing top results only — upgrade for unlimited scanning
              </div>
            )}

            {/* ── 3. Findings table (grouped) ── */}
            {groupedFindings.length > 0 && (
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                marginBottom: '1.5rem',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Rule</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Category</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Severity</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Occurrences</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>Est. Monthly Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedFindings.map((g) => {
                      const isExpanded = expandedRules.has(g.rule_id);
                      return (
                        <>
                          <tr
                            key={g.rule_id}
                            onClick={() => toggleRule(g.rule_id)}
                            style={{
                              borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                              cursor: 'pointer',
                              background: isExpanded ? '#fafafa' : undefined,
                            }}
                          >
                            <td style={{ padding: '0.75rem 1rem', maxWidth: '300px' }}>
                              <code style={{
                                fontSize: '0.8125rem',
                                color: '#111827',
                                background: '#f3f4f6',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '0.25rem',
                              }}>
                                {g.rule_id}
                              </code>
                              {g.message && (
                                <div style={{
                                  marginTop: '0.375rem',
                                  fontSize: '0.8125rem',
                                  color: '#6b7280',
                                  lineHeight: 1.45,
                                }}>
                                  {g.message}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '0.125rem 0.5rem',
                                fontSize: '0.75rem',
                                background: '#f3f4f6',
                                color: '#6b7280',
                                borderRadius: '999px',
                                whiteSpace: 'nowrap',
                              }}>
                                {g.category}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '0.125rem 0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                borderRadius: '999px',
                                color: severityColor(g.severity),
                                background: `${severityColor(g.severity)}1a`,
                                textTransform: 'capitalize',
                              }}>
                                {g.severity}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                              {g.count} file{g.count !== 1 ? 's' : ''}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                <span style={{
                                  fontWeight: 700,
                                  color: g.total_monthly_usd > 0 ? '#ea580c' : '#6b7280',
                                }}>
                                  {g.total_monthly_usd > 0
                                    ? `+$${g.total_monthly_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo`
                                    : '—'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', userSelect: 'none' }}>
                                  {isExpanded ? '▲' : '▼'}
                                </span>
                              </div>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr key={`${g.rule_id}-expanded`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td colSpan={5} style={{ padding: 0 }}>
                                <div style={{
                                  background: '#f8fafc',
                                  padding: '0.75rem 1rem',
                                  borderTop: '1px solid #e5e7eb',
                                }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                                    <thead>
                                      <tr>
                                        <th style={{ textAlign: 'left', padding: '0.375rem 0.5rem', color: '#9ca3af', fontWeight: 600 }}>File</th>
                                        <th style={{ textAlign: 'left', padding: '0.375rem 0.5rem', color: '#9ca3af', fontWeight: 600 }}>Line</th>
                                        <th style={{ textAlign: 'left', padding: '0.375rem 0.5rem', color: '#9ca3af', fontWeight: 600 }}>Model</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {g.instances.map((inst, idx) => (
                                        <tr key={`${inst.file}-${inst.line}-${idx}`}>
                                          <td style={{ padding: '0.3125rem 0.5rem', fontFamily: 'monospace', color: '#374151', fontSize: '0.75rem' }}>
                                            {truncatePath(inst.file)}
                                          </td>
                                          <td style={{ padding: '0.3125rem 0.5rem', color: '#9ca3af', fontFamily: 'monospace', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                            :{inst.line}
                                          </td>
                                          <td style={{ padding: '0.3125rem 0.5rem', color: '#374151', fontSize: '0.75rem' }}>
                                            {inst.model_normalized}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── 5. Footer ── */}
            <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem' }}>
              {result.finding_count} issue{result.finding_count !== 1 ? 's' : ''} found
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Findings are real Semgrep matches on your code. Dollar figures are directional
              estimates (the same model the CI product uses).
            </p>

            <button
              onClick={() => {
                setStatus('idle');
                setResult(null);
                setError('');
                setExpandedRules(new Set());
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.625rem 1.5rem',
                background: '#f97316',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.9375rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Scan another repo →
            </button>
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
