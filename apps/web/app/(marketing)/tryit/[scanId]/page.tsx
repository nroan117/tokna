'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

// ── Types ────────────────────────────────────────────────────────────────────

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

interface ScanStatus {
  scan_id: string;
  repo_url: string;
  daily_call_volume: number;
  status: 'queued' | 'cloning' | 'scanning' | 'complete' | 'failed';
  progress: number; // 0-100
  findings: Finding[];
  error: string | null;
  total_monthly_usd: number;
  finding_count: number;
  coverage_summary: CoverageSummary;
  truncated: boolean;
  created_at: string;
  finished_at: string | null;
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

// ── Constants ────────────────────────────────────────────────────────────────

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

const STATUS_LABELS: Record<string, string> = {
  queued: 'Queued — waiting to start…',
  cloning: 'Cloning repository…',
  scanning: 'Running cost analysis…',
  complete: 'Scan complete!',
  failed: 'Scan failed',
};

const POLL_INTERVAL_MS = 2500;

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  const maxPenalty = totalRulesChecked * 3;
  if (maxPenalty === 0) return 100;
  const actualPenalty = grouped.reduce(
    (sum, g) => sum + (SEVERITY_WEIGHT[g.severity.toLowerCase()] ?? 0.5),
    0,
  );
  return Math.round(Math.max(0, 100 - (actualPenalty / maxPenalty) * 100));
}

function truncatePath(filePath: string): string {
  const parts = filePath.replace(/\\/g, '/').split('/');
  return parts.slice(-2).join('/');
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ScanResultPage() {
  const params = useParams();
  const scanId = typeof params.scanId === 'string' ? params.scanId : String(params.scanId ?? '');

  const [scan, setScan] = useState<ScanStatus | null>(null);
  const [fetchError, setFetchError] = useState<string>('');
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [animScore, setAnimScore] = useState(0);
  const [animOffset, setAnimOffset] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTerminal = scan?.status === 'complete' || scan?.status === 'failed';

  // Score animation (fires once when scan completes)
  const didAnimateRef = useRef(false);

  // ── Polling ────────────────────────────────────────────────────────────────

  const fetchStatus = async () => {
    try {
      const r = await fetch(`/api/scan/${scanId}`);
      const data = await r.json();
      if (!r.ok) {
        setFetchError(data.error ?? `Failed to fetch scan status (${r.status})`);
        return;
      }
      setScan(data as ScanStatus);
      setSmoothProgress((prev) => Math.max(prev, data.progress ?? 0));
    } catch {
      setFetchError('Could not reach server. Retrying…');
    }
  };

  useEffect(() => {
    if (!scanId) return;

    fetchStatus();

    const schedule = () => {
      pollingRef.current = setTimeout(async () => {
        await fetchStatus();
        // Re-read scan from closure is stale — we rely on the state update
      }, POLL_INTERVAL_MS);
    };

    // Keep polling until terminal
    const interval = setInterval(async () => {
      const r = await fetch(`/api/scan/${scanId}`);
      if (!r.ok) return;
      const data: ScanStatus = await r.json();
      setScan(data);
      setSmoothProgress((prev) => Math.max(prev, data.progress ?? 0));
      if (data.status === 'complete' || data.status === 'failed') {
        clearInterval(interval);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanId]);

  // ── Score animation on completion ─────────────────────────────────────────

  useEffect(() => {
    if (scan?.status !== 'complete' || didAnimateRef.current) return;
    didAnimateRef.current = true;

    const grouped = groupFindings(scan.findings ?? []);
    const score = calcScore(grouped, scan.coverage_summary?.total_rules_checked ?? 0);
    const circumference = 2 * Math.PI * 36;
    const targetOffset = circumference * (1 - score / 100);
    const start = performance.now();
    const duration = 1100;
    let rafId: number;

    function tick(now: number) {
      const raw = Math.min((now - start) / duration, 1);
      const t = 1 - Math.pow(1 - raw, 3);
      setAnimScore(Math.round(t * score));
      setAnimOffset(circumference - t * (circumference - targetOffset));
      if (raw < 1) rafId = requestAnimationFrame(tick);
    }

    setAnimScore(0);
    setAnimOffset(circumference);
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [scan?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ──────────────────────────────────────────────────────────

  const groupedFindings: GroupedFinding[] =
    scan?.status === 'complete' ? groupFindings(scan.findings ?? []) : [];

  const severityCounts = groupedFindings.reduce<Record<string, number>>((acc, g) => {
    const s = g.severity.toLowerCase();
    acc[s] = (acc[s] ?? 0) + g.count;
    return acc;
  }, {});
  const totalSeverityCount = Object.values(severityCounts).reduce((a, b) => a + b, 0);

  function toggleRule(ruleId: string) {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });
  }

  // ── Render: loading skeleton ───────────────────────────────────────────────

  if (!scan && !fetchError) {
    return (
      <main style={{ background: '#ffffff', minHeight: '70vh', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', color: '#6b7280', paddingTop: '4rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: '32px',
              height: '32px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#f97316',
              borderRadius: '50%',
              animation: 'tokna-spin 0.8s linear infinite',
            }}
          />
          <p style={{ marginTop: '1rem', fontSize: '1rem' }}>Loading scan…</p>
          <style>{`@keyframes tokna-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    );
  }

  // ── Render: fetch error ────────────────────────────────────────────────────

  if (fetchError && !scan) {
    return (
      <main style={{ background: '#ffffff', minHeight: '70vh', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            color: '#dc2626',
            fontSize: '0.9375rem',
          }}>
            {fetchError}
          </div>
        </div>
      </main>
    );
  }

  // ── Render: in-progress ────────────────────────────────────────────────────

  const statusLabel = scan ? STATUS_LABELS[scan.status] ?? scan.status : 'Loading…';
  const progress = smoothProgress;

  return (
    <main style={{ background: '#ffffff', minHeight: '70vh', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <h1 style={{
          fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
          fontWeight: 800,
          color: '#111827',
          lineHeight: 1.15,
          marginBottom: '0.5rem',
        }}>
          {scan?.status === 'complete'
            ? 'Scan Results'
            : scan?.status === 'failed'
              ? 'Scan Failed'
              : 'Scan in Progress'}
        </h1>
        {scan?.repo_url && (
          <p style={{ fontSize: '0.9375rem', color: '#6b7280', marginBottom: '2rem' }}>
            <a
              href={scan.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#f97316', textDecoration: 'none', fontWeight: 500 }}
            >
              {scan.repo_url}
            </a>
            {' · '}
            <span style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#9ca3af' }}>
              {scanId}
            </span>
          </p>
        )}

        {/* ── Progress section (shown while not complete) ── */}
        {scan?.status !== 'complete' && (
          <div style={{ marginBottom: '2.5rem' }}>
            {/* Status label */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.875rem',
              fontSize: '1rem',
              fontWeight: 600,
              color: scan?.status === 'failed' ? '#dc2626' : '#374151',
            }}>
              {scan?.status !== 'failed' && (
                <span
                  style={{
                    flexShrink: 0,
                    width: '18px',
                    height: '18px',
                    border: '2px solid #e5e7eb',
                    borderTopColor: '#f97316',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'tokna-spin 0.8s linear infinite',
                  }}
                />
              )}
              {statusLabel}
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '10px',
              background: '#f1f5f9',
              borderRadius: '999px',
              overflow: 'hidden',
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: scan?.status === 'failed'
                    ? '#dc2626'
                    : 'linear-gradient(90deg, #f97316, #fb923c)',
                  borderRadius: '999px',
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.375rem',
              fontSize: '0.8125rem',
              color: '#9ca3af',
            }}>
              <span>{progress}%</span>
              {scan?.status !== 'failed' && (
                <span>This typically takes 10–40 seconds</span>
              )}
            </div>

            {/* Error message */}
            {scan?.status === 'failed' && scan.error && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                color: '#dc2626',
                fontSize: '0.9375rem',
              }}>
                {scan.error}
              </div>
            )}

            {/* Scan another button after failure */}
            {scan?.status === 'failed' && (
              <a
                href="/tryit"
                style={{
                  display: 'inline-flex',
                  marginTop: '1.25rem',
                  alignItems: 'center',
                  padding: '0.625rem 1.5rem',
                  background: '#f97316',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                ← Try another repo
              </a>
            )}
          </div>
        )}

        {/* ── Results (status === complete) ── */}
        {scan?.status === 'complete' && (
          <div>
            {/* 1. Top summary cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              {/* Card 1 — Cost Impact */}
              {scan.total_monthly_usd > 0 ? (
                <div style={{
                  flex: '1 1 200px',
                  padding: '1.25rem 1.5rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                }}>
                  <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#ea580c', lineHeight: 1.1 }}>
                    💸 +${scan.total_monthly_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginTop: '0.375rem' }}>
                    estimated waste at {scan.daily_call_volume} calls/day
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  {(() => {
                    const circumference = 2 * Math.PI * 36;
                    const score = calcScore(groupedFindings, scan.coverage_summary?.total_rules_checked ?? 0);
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
                        <circle cx="44" cy="44" r="36" fill="none" stroke="#f1f5f9" strokeWidth="7" />
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#374151' }}>
                    {groupedFindings.length} rule{groupedFindings.length !== 1 ? 's' : ''} triggered
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                    out of {scan.coverage_summary?.total_rules_checked ?? 0} patterns checked
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Severity summary bar */}
            {totalSeverityCount > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.625rem' }}>
                  {SEVERITY_ORDER.map((sev) => {
                    const count = severityCounts[sev] ?? 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={sev}
                        style={{ width: `${(count / totalSeverityCount) * 100}%`, background: SEVERITY_COLORS[sev] }}
                      />
                    );
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem' }}>
                  {SEVERITY_ORDER.map((sev) => {
                    const count = severityCounts[sev] ?? 0;
                    if (count === 0) return null;
                    return (
                      <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: SEVERITY_COLORS[sev], flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>{sev}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Truncation notice */}
            {scan.truncated && (
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

            {/* 4. Findings table (grouped) */}
            {groupedFindings.length > 0 && (
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                      {['Rule', 'Category', 'Severity', 'Occurrences', 'Est. Monthly Impact'].map((h) => (
                        <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                      ))}
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
                              <code style={{ fontSize: '0.8125rem', color: '#111827', background: '#f3f4f6', padding: '0.125rem 0.375rem', borderRadius: '0.25rem' }}>
                                {g.rule_id}
                              </code>
                              {g.message && (
                                <div style={{ marginTop: '0.375rem', fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.45 }}>
                                  {g.message}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ display: 'inline-block', padding: '0.125rem 0.5rem', fontSize: '0.75rem', background: '#f3f4f6', color: '#6b7280', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                                {g.category}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <span style={{ display: 'inline-block', padding: '0.125rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '999px', color: severityColor(g.severity), background: `${severityColor(g.severity)}1a`, textTransform: 'capitalize' }}>
                                {g.severity}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', color: '#6b7280', whiteSpace: 'nowrap' }}>
                              {g.count} file{g.count !== 1 ? 's' : ''}
                            </td>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                <span style={{ fontWeight: 700, color: g.total_monthly_usd > 0 ? '#ea580c' : '#6b7280' }}>
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
                                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderTop: '1px solid #e5e7eb' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                                    <thead>
                                      <tr>
                                        {['File', 'Line', 'Model'].map((h) => (
                                          <th key={h} style={{ textAlign: 'left', padding: '0.375rem 0.5rem', color: '#9ca3af', fontWeight: 600 }}>{h}</th>
                                        ))}
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

            {/* 5. Footer */}
            <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem' }}>
              {scan.coverage_summary?.total_rules_checked ?? 0} cost patterns checked ·{' '}
              {scan.finding_count} issue(s) found
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Findings are real Semgrep matches on your code. Dollar figures are directional
              estimates (the same model the CI product uses).
            </p>

            {/* Share link */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.25rem',
              padding: '0.75rem 1rem',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
              color: '#6b7280',
            }}>
              <span>🔗 Shareable link:</span>
              <code style={{ flex: 1, fontSize: '0.8125rem', color: '#374151', wordBreak: 'break-all' }}>
                {typeof window !== 'undefined' ? window.location.href : ''}
              </code>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard.writeText(window.location.href).catch(() => {});
                  }
                }}
                style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem', background: '#f97316', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}
              >
                Copy
              </button>
            </div>

            <a
              href="/tryit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.625rem 1.5rem',
                background: '#f97316',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.9375rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
              }}
            >
              Scan another repo →
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes tokna-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
