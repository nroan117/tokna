'use client';

/**
 * Token Efficiency & ROI — the remote view of a user's Tokna telemetry.
 *
 * Auth: a personal Tokna API key (issued via POST /v1/keys/issue) is sent as
 * X-Tokna-API-Key. The backend derives the user from the key, so no email is
 * needed. The key lives only in this browser's localStorage.
 *
 * Visual design mirrors the plugin's local dashboard (tokna-skill/dashboard):
 * a single dark surface, four stat tiles, projects & sessions table, savings
 * by rule + audit activity, and the optimization event feed.
 */

import { useState, useEffect, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Breakdown { count: number; tokens_avoided: number; usd_saved: number }
interface ProjectRow { events: number; usd_saved: number; audits: number; blocked: number; sessions: number }

interface ROISummary {
  email: string;
  total_events: number;
  total_tokens_avoided: number;
  total_usd_saved: number;
  session_count: number;
  audits_run?: number;
  audits_blocked?: number;
  event_breakdown_by_type?: Record<string, Breakdown>;
  by_rule?: Record<string, Breakdown>;
  by_project?: Record<string, ProjectRow>;
}

interface ROIEvent {
  id: number | string;
  session_id: string | null;
  project: string | null;
  type: string;
  rule_id: string | null;
  tokens_avoided: number | null;
  usd_saved: number | null;
  summary: string | null;
  ts: string | null;
}

// ── Data fetching ─────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_TOKNA_API_BASE || 'https://cost-api-gqiljr3w4q-uc.a.run.app';
const KEY_STORAGE = 'tokna_api_key';
const REFRESH_MS = 15000;

function loadStoredKey(): string {
  if (typeof window === 'undefined') return '';
  try { return window.localStorage.getItem(KEY_STORAGE) || ''; } catch { return ''; }
}
function storeKey(key: string) {
  try {
    if (key) window.localStorage.setItem(KEY_STORAGE, key);
    else window.localStorage.removeItem(KEY_STORAGE);
  } catch { /* ignore */ }
}

async function apiGet<T>(path: string, apiKey: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Tokna-API-Key': apiKey },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Formatting ────────────────────────────────────────────────────────────────

const usd = (n: number | null | undefined, d = 2) => '$' + (n || 0).toFixed(d);
const fmtDay = (ts: string | null) => { try { return ts ? new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''; } catch { return ''; } };
const fmtTime = (ts: string | null) => { try { return ts ? new Date(ts).toLocaleTimeString() : ''; } catch { return ts || ''; } };
const shortProject = (p: string | null | undefined) => (p && p !== '(unknown)' ? p : null);

// ── Component ────────────────────────────────────────────────────────────────

export default function ROIDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [keyLoaded, setKeyLoaded] = useState(false);
  const [summary, setSummary] = useState<ROISummary | null>(null);
  const [events, setEvents] = useState<ROIEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [projectFilter, setProjectFilter] = useState('');

  useEffect(() => { setApiKey(loadStoredKey()); setKeyLoaded(true); }, []);

  const refresh = useCallback(async (key: string) => {
    try {
      const [s, e] = await Promise.all([
        apiGet<ROISummary>('/v1/roi/summary', key),
        apiGet<{ events: ROIEvent[] }>('/v1/roi/events?limit=200', key),
      ]);
      setSummary(s);
      setEvents(e.events || []);
      setError(null);
      setUpdatedAt(new Date());
    } catch (err: any) {
      setError(err?.message === 'HTTP 401' ? 'Key rejected (401). Check the key or ask an admin to issue a new one.' : `Could not reach the Tokna API (${err?.message || 'network'})`);
    }
  }, []);

  useEffect(() => {
    if (!keyLoaded || !apiKey) return;
    refresh(apiKey);
    const t = setInterval(() => refresh(apiKey), REFRESH_MS);
    return () => clearInterval(t);
  }, [apiKey, keyLoaded, refresh]);

  // ── Derived views (respect the project filter) ─────────────────────────────
  const projects = Object.entries(summary?.by_project || {})
    .map(([name, r]) => ({ name, ...r }))
    .sort((a, b) => b.usd_saved - a.usd_saved || b.events - a.events);

  const visibleEvents = projectFilter
    ? events.filter(e => (e.project || '(unknown)') === projectFilter)
    : events;

  const guideEvents = visibleEvents.filter(e => e.type === 'guide_applied' || (!String(e.type).startsWith('audit')));
  const findingEvents = visibleEvents.filter(e => e.type === 'audit_finding');
  const outcomeEvents = visibleEvents.filter(e => e.type === 'audit_pass' || e.type === 'audit_blocked');
  const feedEvents = visibleEvents.filter(e => e.type !== 'audit_pass' && e.type !== 'audit_blocked'); // guide + findings

  // Savings-by-rule spans both stages (Guide injections + Audit catches).
  const byRule: Record<string, { count: number; usd: number; stage: 'guide' | 'audit' }> = {};
  for (const e of [...guideEvents, ...findingEvents]) {
    const k = e.rule_id || e.type || 'unknown';
    byRule[k] = byRule[k] || { count: 0, usd: 0, stage: e.type === 'audit_finding' ? 'audit' : 'guide' };
    byRule[k].count += 1;
    byRule[k].usd += e.usd_saved || 0;
  }
  const ruleRows = Object.entries(byRule).sort((a, b) => b[1].usd - a[1].usd || b[1].count - a[1].count);
  const maxRuleUsd = Math.max(...ruleRows.map(([, r]) => r.usd), 0.0001);

  const guideUsd = guideEvents.reduce((t, e) => t + (e.usd_saved || 0), 0);
  const auditUsd = findingEvents.reduce((t, e) => t + (e.usd_saved || 0), 0);

  const totals = {
    usd: projectFilter ? guideUsd + auditUsd : (summary?.total_usd_saved || 0),
    tokens: projectFilter
      ? [...guideEvents, ...findingEvents].reduce((t, e) => t + (e.tokens_avoided || 0), 0)
      : (summary?.total_tokens_avoided || 0),
    guideUsd, auditUsd,
    opts: guideEvents.length + findingEvents.length,
    audits: projectFilter ? outcomeEvents.length : (summary?.audits_run || 0),
    blocked: projectFilter ? outcomeEvents.filter(e => e.type === 'audit_blocked').length : (summary?.audits_blocked || 0),
    sessions: projectFilter ? new Set(visibleEvents.map(e => e.session_id)).size : (summary?.session_count || 0),
  };

  return (
    <div className="tk">
      <style>{CSS}</style>

      <header className="tk-head">
        <h1><span className="bolt">⚡</span> Tokna <span className="sub">· Token Efficiency &amp; ROI</span></h1>
        {apiKey ? (
          <>
            <span className="live"><span className={'dot' + (error ? ' bad' : '')} />
              {error ? 'disconnected' : updatedAt ? `live · updated ${updatedAt.toLocaleTimeString()}` : 'connecting…'}
            </span>
            {summary && <span className="sub">{summary.email} · {API_BASE.replace('https://', '')}</span>}
            <span className="spacer" />
            <select className="tk-select" value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
              <option value="">All projects</option>
              {projects.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
            <button className="tk-btn ghost" onClick={() => { storeKey(''); setApiKey(''); setSummary(null); setEvents([]); }}>Disconnect</button>
          </>
        ) : (
          <>
            <span className="spacer" />
            <form className="tk-connect" onSubmit={e => { e.preventDefault(); const k = keyInput.trim(); if (k) { storeKey(k); setApiKey(k); setKeyInput(''); } }}>
              <input type="password" value={keyInput} onChange={e => setKeyInput(e.target.value)}
                placeholder="paste your Tokna API key" autoComplete="off" />
              <button type="submit" className="tk-btn">Connect</button>
            </form>
          </>
        )}
      </header>

      {!apiKey && keyLoaded && (
        <div className="card empty-state">
          <h2>Connect your Tokna account</h2>
          <p>Paste the personal API key from <code>~/.tokna/config.json</code> (issued by your admin via <code>/v1/keys/issue</code>). It is stored only in this browser and sent as <code>X-Tokna-API-Key</code> — the backend derives who you are from the key.</p>
        </div>
      )}

      {error && apiKey && <div className="card error">{error}</div>}

      {apiKey && (
        <>
          <div className="tiles">
            <div className="tile"><div className="label">Est. Savings</div><div className="value good">{usd(totals.usd)}</div><div className="hint">guide (input) {usd(totals.guideUsd)} · audit (output) {usd(totals.auditUsd)}</div></div>
            <div className="tile"><div className="label">Tokens Saved</div><div className="value">{totals.tokens.toLocaleString()}</div><div className="hint">{totals.opts} optimizations applied</div></div>
            <div className="tile"><div className="label">Audits Run</div><div className="value">{totals.audits}</div><div className="hint">{totals.blocked} blocked for self-correction</div></div>
            <div className="tile"><div className="label">Sessions</div><div className="value">{totals.sessions}</div><div className="hint">{projects.length} project{projects.length === 1 ? '' : 's'}</div></div>
          </div>

          <div className="card">
            <h2>Projects &amp; sessions</h2>
            <div className="tablewrap">
              <table>
                <thead><tr><th>Project</th><th className="r">Sessions</th><th className="r">Optimizations</th><th className="r">Audits</th><th className="r">Blocked</th><th className="r">Est. saved</th></tr></thead>
                <tbody>
                  {projects.length ? projects.map(p => (
                    <tr key={p.name} className={projectFilter === p.name ? 'sel' : ''} onClick={() => setProjectFilter(projectFilter === p.name ? '' : p.name)}>
                      <td className="ink">{p.name}</td>
                      <td className="num">{p.sessions || '—'}</td>
                      <td className="num">{p.events - p.audits}</td>
                      <td className="num">{p.audits}</td>
                      <td className="num" style={{ color: p.blocked ? 'var(--critical)' : undefined }}>{p.blocked}</td>
                      <td className="num good">{usd(p.usd_saved)}</td>
                    </tr>
                  )) : <tr><td colSpan={6} className="empty">No activity yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid2">
            <div className="card">
              <h2>Savings by rule (USD) <span className="sub">· guide + audit</span></h2>
              {ruleRows.length ? ruleRows.map(([rule, r]) => (
                <div className="barrow" key={rule} title={`${rule} (${r.stage} stage): ${usd(r.usd, 4)} across ${r.count} event(s)`}>
                  <div className="name"><span className={'stagedot ' + r.stage} />{rule}</div>
                  <div className="track"><div className={'bar ' + r.stage} style={{ width: `${Math.max(2, (r.usd / maxRuleUsd) * 100)}%` }} /></div>
                  <div className="val">{usd(r.usd)}</div>
                </div>
              )) : <div className="empty">No optimization events yet.</div>}
            </div>
            <div className="card">
              <h2>Audit activity (Stop hook)</h2>
              {outcomeEvents.length ? outcomeEvents.slice(0, 12).map(a => (
                <div className="audit" key={a.id}>
                  <span className={'badge ' + (a.type === 'audit_blocked' ? 'blocked' : 'pass')}>{a.type === 'audit_blocked' ? '✗ BLOCKED' : '✓ PASS'}</span>
                  <span className="files">{shortProject(a.project) ? <b>{a.project} · </b> : null}{a.summary || '—'}</span>
                  <span className="when">{fmtDay(a.ts)} {fmtTime(a.ts)}</span>
                </div>
              )) : <div className="empty">No audits recorded yet.</div>}
            </div>
          </div>

          <div className="card">
            <h2>Optimization event feed (Guide + Audit stages)</h2>
            <div className="tablewrap">
              <table>
                <thead><tr><th>Time</th><th>Stage</th><th>Project</th><th>Rule</th><th>Summary</th><th className="r">Tokens</th><th className="r">USD</th></tr></thead>
                <tbody>
                  {feedEvents.length ? feedEvents.slice(0, 50).map(e => {
                    const isAudit = e.type === 'audit_finding';
                    return (
                    <tr key={e.id}>
                      <td>{fmtDay(e.ts)} {fmtTime(e.ts)}</td>
                      <td><span className={'badge ' + (isAudit ? 'blocked' : 'pass')} style={{ fontSize: '10px' }}>{isAudit ? 'AUDIT' : 'GUIDE'}</span></td>
                      <td>{shortProject(e.project) || <span className="muted">—</span>}</td>
                      <td><span className="rulechip">{e.rule_id || e.type}</span></td>
                      <td>{e.summary || ''}</td>
                      <td className="num">{(e.tokens_avoided || 0).toLocaleString()}</td>
                      <td className="num">{usd(e.usd_saved, 4)}</td>
                    </tr>);
                  }) : <tr><td colSpan={7} className="empty">No events yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <footer>Data from the Tokna Cost API · refreshes every {REFRESH_MS / 1000}s · privacy-safe metadata only (rule ids, savings, project name) — never prompts or code</footer>
        </>
      )}
    </div>
  );
}

// ── Styles (mirrors tokna-skill/dashboard/index.html) ────────────────────────

const CSS = `
.tk {
  --page: #0d0d0d; --surface: #1a1a19; --ink: #ffffff; --ink-2: #c3c2b7; --muted: #898781;
  --grid: #2c2c2a; --border: rgba(255,255,255,0.10); --series: #3987e5;
  --good: #0ca30c; --warning: #fab219; --critical: #d03b3b;
  background: var(--page); color: var(--ink); min-height: 100vh;
  font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; padding: 20px; box-sizing: border-box;
}
.tk *, .tk *::before, .tk *::after { box-sizing: border-box; }
.tk .tk-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
.tk h1 { font-size: 18px; font-weight: 700; margin: 0; }
.tk h1 .bolt { color: var(--series); }
.tk .sub { color: var(--muted); font-size: 12.5px; font-weight: 400; }
.tk .spacer { flex: 1; }
.tk .live { display: inline-flex; align-items: center; gap: 6px; color: var(--ink-2); font-size: 12.5px; }
.tk .live .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--good); }
.tk .live .dot.bad { background: var(--critical); }
.tk .tk-select, .tk .tk-connect input { background: var(--surface); color: var(--ink); border: 1px solid var(--border); border-radius: 8px; padding: 5px 9px; font: inherit; font-size: 12.5px; }
.tk .tk-connect { display: flex; gap: 8px; align-items: center; }
.tk .tk-connect input { width: 22rem; }
.tk .tk-btn { background: var(--series); color: #fff; border: none; border-radius: 8px; padding: 6px 12px; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.tk .tk-btn.ghost { background: transparent; color: var(--ink-2); border: 1px solid var(--border); font-weight: 500; }
.tk .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
.tk .tile { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; }
.tk .tile .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
.tk .tile .value { font-size: 26px; font-weight: 700; margin-top: 2px; }
.tk .tile .hint { color: var(--ink-2); font-size: 12px; margin-top: 2px; }
.tk .good { color: var(--good); }
.tk .grid2 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; margin-bottom: 16px; }
@media (max-width: 860px) { .tk .grid2 { grid-template-columns: 1fr; } }
.tk .card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; }
.tk .grid2 .card { margin-bottom: 0; }
.tk .card h2 { font-size: 13px; font-weight: 600; color: var(--ink-2); margin: 0 0 12px; }
.tk .card.error { color: var(--warning); }
.tk .empty-state p { color: var(--ink-2); font-size: 13px; margin: 0; max-width: 60ch; }
.tk code { font: 12px ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--ink); background: var(--page); padding: 1px 5px; border-radius: 4px; }
.tk .barrow { display: grid; grid-template-columns: 220px 1fr 70px; gap: 10px; align-items: center; padding: 5px 0; }
.tk .barrow .name { color: var(--ink-2); font-size: 12.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tk .barrow .track { height: 14px; position: relative; }
.tk .barrow .bar { position: absolute; inset: 0 auto 0 0; background: var(--series); border-radius: 0 4px 4px 0; min-width: 2px; }
.tk .barrow:hover .bar { filter: brightness(1.15); }
.tk .barrow .val { color: var(--ink); font-size: 12.5px; text-align: right; font-variant-numeric: tabular-nums; }
.tk .audit { display: flex; gap: 10px; padding: 7px 0; border-bottom: 1px solid var(--grid); font-size: 12.5px; align-items: baseline; }
.tk .audit:last-child { border-bottom: none; }
.tk .badge { font-size: 11px; font-weight: 700; padding: 1px 8px; border-radius: 999px; border: 1px solid; white-space: nowrap; }
.tk .badge.pass { color: var(--good); border-color: var(--good); }
.tk .badge.blocked { color: var(--critical); border-color: var(--critical); }
.tk .audit .files { color: var(--ink-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
.tk .audit .when { color: var(--muted); white-space: nowrap; }
.tk .tablewrap { overflow-x: auto; }
.tk table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.tk th { text-align: left; color: var(--muted); font-weight: 600; padding: 6px 10px; border-bottom: 1px solid var(--grid); white-space: nowrap; }
.tk th.r { text-align: right; }
.tk td { padding: 6px 10px; border-bottom: 1px solid var(--grid); color: var(--ink-2); }
.tk td.num { text-align: right; font-variant-numeric: tabular-nums; color: var(--ink); }
.tk td.ink { color: var(--ink); }
.tk td.empty, .tk .empty { color: var(--muted); font-size: 12.5px; padding: 8px 0; }
.tk .muted { color: var(--muted); }
.tk tbody tr { cursor: default; }
.tk tbody tr:hover td { background: rgba(255,255,255,0.03); }
.tk tbody tr.sel td { background: rgba(57,135,229,0.10); }
.tk .rulechip { display: inline-flex; align-items: center; gap: 6px; }
.tk .rulechip::before { content: ""; width: 8px; height: 8px; border-radius: 2px; background: var(--series); }
.tk .stagedot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 7px; vertical-align: middle; }
.tk .stagedot.guide { background: var(--series); }
.tk .stagedot.audit { background: var(--warning); }
.tk .barrow .bar.audit { background: var(--warning); }
.tk footer { color: var(--muted); font-size: 11.5px; margin-top: 14px; }
`;
