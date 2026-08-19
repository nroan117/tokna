'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MetricsBar from './MetricsBar';
import SavingsGauge from './SavingsGauge';
import OptimizationTimeline, { ROIEvent } from './OptimizationTimeline';

// ── Types ────────────────────────────────────────────────────────────────────

interface ROISummary {
  email: string;
  total_events: number;
  total_tokens_avoided: number;
  total_usd_saved: number;
  session_count: number;
  event_breakdown_by_type: Record<string, {
    count: number;
    tokens_avoided: number;
    usd_saved: number;
  }>;
  audits_run?: number;
  audits_blocked?: number;
  by_rule?: Record<string, { count: number; tokens_avoided: number; usd_saved: number }>;
  by_project?: Record<string, { events: number; usd_saved: number; audits: number; blocked: number; sessions: number }>;
  // Computed fields (can be added by frontend)
  monthly_savings_usd?: number;
  monthly_savings_target_usd?: number;
  efficiency_gain_pct?: number;
  guide_runs?: number;
  audit_runs?: number;
  top_rule?: string | null;
}

// ── Mock data (fallback when API is unavailable) ─────────────────────────────

function mockSummary(email: string): ROISummary {
  return {
    email,
    total_events: 34,
    total_tokens_avoided: 125000,
    total_usd_saved: 3.75,
    session_count: 8,
    event_breakdown_by_type: {},
    monthly_savings_usd: 2840,
    monthly_savings_target_usd: 5000,
    guide_runs: 18,
    audit_runs: 16,
    top_rule: 'volatile-prefix-alignment',
    efficiency_gain_pct: 23.4,
  };
}

const MOCK_EVENTS: ROIEvent[] = [
  {
    id: '1',
    type: 'GUIDE',
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    summary: 'Cache alignment applied — system prompt pinned to 512-token boundary',
    savings_usd: 140,
    tokens_saved: 18500,
    rule_id: 'cache-alignment',
    status: 'applied',
  },
  {
    id: '2',
    type: 'AUDIT',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    summary: 'max_tokens set to 4096 on simple classify call — frontier model overkill',
    savings_usd: 320,
    tokens_saved: 42000,
    rule_id: 'naive-max-tokens',
    status: 'flagged',
  },
  {
    id: '3',
    type: 'GUIDE',
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    summary: 'Tool pruning applied — removed 3 unused tools from agent context',
    savings_usd: 85,
    tokens_saved: 11200,
    rule_id: 'skill-gating',
    status: 'applied',
  },
  {
    id: '4',
    type: 'AUDIT',
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    summary: 'Redundant retrieval loop detected — 14 RAG calls for 1 semantic query',
    savings_usd: 210,
    tokens_saved: 28000,
    rule_id: 'unbound-rag-loop',
    status: 'flagged',
  },
  {
    id: '5',
    type: 'GUIDE',
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
    summary: 'Keep-warm heartbeat scheduled — maintaining cache across idle periods',
    savings_usd: 0,
    tokens_saved: 0,
    rule_id: 'keep-warm',
    status: 'applied',
  },
  {
    id: '6',
    type: 'AUDIT',
    timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
    summary: 'GPT-4o used for intent classification — Haiku equivalent at 95% accuracy',
    savings_usd: 480,
    tokens_saved: 63000,
    rule_id: 'overweight-model',
    status: 'flagged',
  },
  {
    id: '7',
    type: 'GUIDE',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    summary: 'Deterministic prefix lock applied — prefix hash pinned for 24h',
    savings_usd: 95,
    tokens_saved: 12500,
    rule_id: 'deterministic-prefix',
    status: 'applied',
  },
  {
    id: '8',
    type: 'AUDIT',
    timestamp: new Date(Date.now() - 30 * 3600000).toISOString(),
    summary: 'Vision image auto-downscale skipped — image already under 800px threshold',
    savings_usd: 0,
    tokens_saved: 0,
    rule_id: 'vision-downscale',
    status: 'skipped',
  },
];

// ── Data fetching ─────────────────────────────────────────────────────────────
//
// Auth: a personal Tokna API key (issued via POST /v1/keys/issue) is sent as
// X-Tokna-API-Key. The backend derives the user from the key, so no email is
// needed. The key is kept only in this browser's localStorage.

const API_BASE = process.env.NEXT_PUBLIC_TOKNA_API_BASE || 'https://cost-api-gqiljr3w4q-uc.a.run.app';
const KEY_STORAGE = 'tokna_api_key';

export function loadStoredKey(): string {
  if (typeof window === 'undefined') return '';
  try { return window.localStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; }
}
export function storeKey(key: string) {
  try {
    if (key) window.localStorage.setItem(KEY_STORAGE, key);
    else window.localStorage.removeItem(KEY_STORAGE);
  } catch { /* ignore */ }
}

async function apiGet(path: string, apiKey: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Tokna-API-Key': apiKey },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchSummary(apiKey: string): Promise<ROISummary> {
  return apiGet('/v1/roi/summary', apiKey);
}

async function fetchEvents(apiKey: string): Promise<ROIEvent[]> {
  const data = await apiGet('/v1/roi/events?limit=25', apiKey);
  return (data.events || []).map((ev: any) => ({
    id: String(ev.id),
    type: String(ev.type || '').startsWith('audit') ? 'AUDIT' : 'GUIDE',
    timestamp: ev.ts,
    summary: (ev.project ? `[${ev.project}] ` : '') + (ev.summary || 'Optimization applied'),
    savings_usd: ev.usd_saved || 0,
    tokens_saved: ev.tokens_avoided || 0,
    rule_id: ev.rule_id || (ev.type || 'unknown'),
    status: ev.type === 'audit_blocked' ? 'flagged' : 'applied',
  }));
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = '#111827' }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
      padding: '1.25rem', textAlign: 'center',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
    }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color, lineHeight: 1.1, marginBottom: '0.25rem' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>{sub}</div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ROIDashboardProps {
  userEmail?: string | null;
}

export default function ROIDashboard({ userEmail }: ROIDashboardProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [keyInput, setKeyInput] = useState<string>('');
  const [keyLoaded, setKeyLoaded] = useState(false);
  useEffect(() => { setApiKey(loadStoredKey()); setKeyLoaded(true); }, []);

  const [summary, setSummary] = useState<ROISummary | null>(null);
  const [events, setEvents] = useState<ROIEvent[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    if (!keyLoaded) return;
    let cancelled = false;
    if (!apiKey) {
      // No key: show demo data with the connect prompt.
      setSummary(mockSummary('demo@tokna.ai')); setUsingMockData(true); setLoadingSummary(false);
      setEvents(MOCK_EVENTS); setLoadingEvents(false);
      return () => { cancelled = true; };
    }
    setUsingMockData(false);

    // Fetch summary
    setLoadingSummary(true);
    fetchSummary(apiKey)
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
          setLoadingSummary(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary(mockSummary(email));
          setUsingMockData(true);
          setLoadingSummary(false);
        }
      });

    // Fetch events
    setLoadingEvents(true);
    fetchEvents(apiKey)
      .then((data) => {
        if (!cancelled) {
          setEvents(data);
          setLoadingEvents(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvents(MOCK_EVENTS);
          setLoadingEvents(false);
        }
      });

    return () => { cancelled = true; };
  }, [apiKey, keyLoaded]);

  const email = summary?.email || (apiKey ? '…' : 'not connected');
  const s: ROISummary = summary ?? mockSummary('');

    const totalSaved = s.total_usd_saved;
    const monthlyTarget = s.monthly_savings_target_usd || 100.0; // Dynamic target or default
    const monthlySaved = s.monthly_savings_usd || totalSaved; // Placeholder for now

    const totalSavingsDisplay = totalSaved >= 1000
      ? `$${(totalSaved / 1000).toFixed(1)}k`
      : `$${totalSaved.toFixed(2)}`;

    const guideCount = s.guide_runs || s.event_breakdown_by_type?.guide_applied?.count || 0;
    const auditCount = s.audits_run ?? (s.audit_runs || s.event_breakdown_by_type?.audit_hit?.count || 0);

  return (
    <>
      <MetricsBar />
      <div style={{ padding: '1.75rem 2rem' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <Link href="/dashboard" style={{ color: '#f97316', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ color: '#9ca3af' }}>›</span>
          <span style={{ color: '#374151' }}>Token Efficiency & ROI</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem' }}>
              ⚡ Token Efficiency & ROI
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Savings from Tokna Guide + Audit passes · {email}
            </p>
          </div>
          {apiKey ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#6b7280' }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>● Connected</span>
              <span>key {apiKey.slice(0, 12)}…</span>
              <button onClick={() => { storeKey(''); setApiKey(''); }}
                style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '0.375rem', padding: '0.25rem 0.625rem', cursor: 'pointer', fontSize: '0.75rem' }}>
                Disconnect
              </button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); const k = keyInput.trim(); if (k) { storeKey(k); setApiKey(k); setKeyInput(''); } }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 600 }}>📊 Demo data —</span>
              <input type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)}
                placeholder="paste your Tokna API key" autoComplete="off"
                style={{ border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.375rem 0.625rem', fontSize: '0.8125rem', width: '18rem' }} />
              <button type="submit"
                style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                Connect
              </button>
              <span style={{ fontSize: '0.6875rem', color: '#9ca3af' }}>stored only in this browser · from ~/.tokna/config.json</span>
            </form>
          )}
        </div>

        {/* Stats row: Gauge + 3 stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          {/* Savings Gauge */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid rgba(249,115,22,0.35)',
            borderRadius: '0.75rem',
            padding: '1.375rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 0 0 3px rgba(249,115,22,0.07)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: 'linear-gradient(90deg, #c2410c, #f97316, #fb923c)',
            }} />
            <SavingsGauge
              savedUsd={monthlySaved}
              targetUsd={monthlyTarget}
              size={150}
            />
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.5rem' }}>
              Monthly Savings
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.125rem' }}>
              target ${monthlyTarget.toLocaleString()}/mo
            </div>
          </div>

          <StatCard
            label="Total Savings (all time)"
            value={loadingSummary ? '…' : totalSavingsDisplay}
            sub="since Tokna activated"
            color="#f97316"
          />

          <StatCard
            label="Efficiency Gain"
            value={loadingSummary ? '…' : `${s?.efficiency_gain_pct ?? 15.2}%`}
            sub="vs baseline spend"
            color="#16a34a"
          />

          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
            padding: '1.25rem', textAlign: 'center',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBottom: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#8b5cf6', lineHeight: 1.1 }}>
                  {loadingSummary ? '…' : guideCount}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#6b7280', fontWeight: 500 }}>GUIDE</div>
              </div>
              <div style={{ width: '1px', background: '#e2e8f0' }} />
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f97316', lineHeight: 1.1 }}>
                  {loadingSummary ? '…' : auditCount}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#6b7280', fontWeight: 500 }}>AUDIT</div>
              </div>
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Runs This Month
            </div>
            {s?.top_rule && (
              <div style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: '0.375rem', fontFamily: 'monospace' }}>
                top: {s.top_rule}
              </div>
            )}
          </div>
        </div>

        {/* ROI breakdown bar */}
        {!loadingSummary && s && (
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
            padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
                Monthly Savings Progress
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                ${monthlySaved.toLocaleString()} of ${monthlyTarget.toLocaleString()} target
              </span>
            </div>
            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((monthlySaved / monthlyTarget) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #c2410c, #f97316, #fb923c)',
                borderRadius: '999px',
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.6875rem', color: '#9ca3af' }}>
              <span>$0</span>
              <span style={{ color: '#f97316', fontWeight: 600 }}>
                {Math.round((monthlySaved / monthlyTarget) * 100)}% to target
              </span>
              <span>${monthlyTarget.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Optimization Timeline */}
        <div>
          <div style={{
            fontSize: '0.875rem', fontWeight: 700, color: '#374151',
            marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            Optimization Timeline
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>
              {loadingEvents ? 'loading…' : `${events.length} events`}
            </span>
          </div>
          <div style={{
            background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
            overflow: 'hidden', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr auto',
              gap: '1rem',
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}>
              {['Type', 'Event', 'Status'].map((h) => (
                <div key={h} style={{
                  fontSize: '0.6875rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af',
                }}>
                  {h}
                </div>
              ))}
            </div>

            <OptimizationTimeline events={events} loading={loadingEvents} />
          </div>
        </div>

        {/* Back link */}
        <div style={{ marginTop: '1.5rem' }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.3)',
            borderRadius: '0.5rem',
            padding: '0.625rem 1.25rem',
            color: '#f97316', textDecoration: 'none',
            fontSize: '0.875rem', fontWeight: 600,
          }}>
            ← Back to Overview
          </Link>
        </div>
      </div>
    </>
  );
}
