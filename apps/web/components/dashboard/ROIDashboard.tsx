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

const API_BASE = 'https://cost-api-706230423289.us-central1.run.app';

async function fetchSummary(email: string): Promise<ROISummary> {
  const res = await fetch(`${API_BASE}/v1/roi/summary?email=${encodeURIComponent(email)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchEvents(email: string): Promise<ROIEvent[]> {
  const res = await fetch(`${API_BASE}/v1/roi/events?email=${encodeURIComponent(email)}&limit=20`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  
  // Map backend model to frontend ROIEvent
  return (data.events || []).map((ev: any) => ({
    id: String(ev.id),
    type: ev.type?.toUpperCase().includes('GUIDE') ? 'GUIDE' : 'AUDIT',
    timestamp: ev.ts,
    summary: ev.summary || 'Optimization applied',
    savings_usd: ev.usd_saved || 0,
    tokens_saved: ev.tokens_avoided || 0,
    rule_id: ev.rule_id || 'unknown',
    status: ev.type?.toLowerCase().includes('hit') ? 'flagged' : 'applied',
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
  const email = userEmail ?? 'demo@tokna.ai';

  const [summary, setSummary] = useState<ROISummary | null>(null);
  const [events, setEvents] = useState<ROIEvent[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Fetch summary
    setLoadingSummary(true);
    fetchSummary(email)
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
    fetchEvents(email)
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
  }, [email]);

    const totalSaved = s.total_usd_saved;
    const monthlyTarget = s.monthly_savings_target_usd || 100.0; // Dynamic target or default
    const monthlySaved = s.monthly_savings_usd || totalSaved; // Placeholder for now

    const totalSavingsDisplay = totalSaved >= 1000
      ? `$${(totalSaved / 1000).toFixed(1)}k`
      : `$${totalSaved.toFixed(2)}`;

    const guideCount = s.guide_runs || s.event_breakdown_by_type?.guide_applied?.count || 0;
    const auditCount = s.audit_runs || s.event_breakdown_by_type?.audit_hit?.count || 0;

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
          {usingMockData && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 0.875rem',
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.25)',
              borderRadius: '0.5rem',
              fontSize: '0.75rem', color: '#f97316', fontWeight: 600,
            }}>
              📊 Demo data — connect your account to see real savings
            </div>
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
