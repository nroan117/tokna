import Link from 'next/link';
import HealthGauge from '../../../../components/dashboard/HealthGauge';
import MetricsBar from '../../../../components/dashboard/MetricsBar';

const STATS = [
  { label: 'Avg GPU Utilization', value: '61%',     color: '#f97316' },
  { label: 'VRAM Waste',          value: '34%',     color: '#dc2626' },
  { label: 'Active Pods',         value: '48',      color: '#111827' },
  { label: 'Est. Monthly Waste',  value: '$12,300', color: '#dc2626' },
];

const GPU_CLUSTERS = [
  { name: 'prod-a100-east', util: 87, color: '#dc2626' },
  { name: 'prod-a100-west', util: 52, color: '#f97316' },
  { name: 'prod-h100-east', util: 73, color: '#f97316' },
  { name: 'staging-a100',   util: 21, color: '#2563eb' },
  { name: 'dev-t4-pool',    util: 14, color: '#2563eb' },
  { name: 'batch-a100',     util: 61, color: '#f97316' },
];

const VRAM_MODELS = [
  { model: 'Llama 3.1 70B', vramPct: 91, waste: 9,  color: '#dc2626' },
  { model: 'GPT-J 6B',      vramPct: 23, waste: 77, color: '#2563eb' },
  { model: 'Falcon 40B',    vramPct: 62, waste: 38, color: '#f97316' },
  { model: 'Mistral 7B',    vramPct: 31, waste: 69, color: '#2563eb' },
  { model: 'Llama 3.1 8B',  vramPct: 44, waste: 56, color: '#f97316' },
  { model: 'Yi-34B',        vramPct: 78, waste: 22, color: '#16a34a' },
];

const TIMELINE = [
  { cluster: 'prod-a100-east', blocks: [45, 38, 30, 28, 42, 68, 82, 91, 89, 87, 84, 79] },
  { cluster: 'prod-h100-east', blocks: [51, 48, 44, 40, 55, 70, 75, 78, 80, 74, 71, 68] },
  { cluster: 'staging-a100',   blocks: [22, 18, 15, 12, 19, 24, 22, 21, 24, 20, 18, 21] },
];

const TIME_LABELS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:00'];

const ALERTS = [
  { level: 'crit', title: 'VRAM Over-Provisioning — GPT-J 6B',              desc: '8 pods serving GPT-J 6B each have 80 GB A100 — model fits in 12 GB. 77% VRAM wasted.',                          meta: 'Detected 2h ago · Estimated impact: $4,100/mo' },
  { level: 'crit', title: 'prod-a100-east Approaching Saturation',           desc: 'Avg GPU util hit 91% during peak. P99 inference latency +340 ms. Risk of OOM.',                                meta: 'Detected 45 min ago · Recommended: add 4 replicas or migrate batch jobs' },
  { level: 'warn', title: 'Idle dev-t4-pool — 14% Avg Utilization',         desc: '6 T4 pods running 24/7 with <20% GPU util. No scheduled jobs after 19:00.',                                   meta: 'Detected 6h ago · Estimated waste: $900/mo' },
  { level: 'warn', title: "Mistral 7B on A100 — Over-spec'd",               desc: 'Mistral 7B uses 31% of A100 VRAM. Migrating to T4 would save 65% per-inference cost.',                       meta: 'Detected 1d ago · Estimated savings: $3,200/mo' },
  { level: 'info', title: 'CUDA driver version mismatch on staging-a100',   desc: 'staging-a100 cluster running CUDA 11.8; prod is on 12.4. May affect model portability.',                     meta: 'Detected 3d ago · Low severity' },
];

const RECS = [
  { icon: '💡', title: 'Right-size GPT-J 6B pods → T4 or A10G',      desc: 'GPT-J 6B requires ~12 GB VRAM. Replace 8× A100 (80 GB) pods with T4 (16 GB) or A10G (24 GB).', savings: 'Saves ~$4,100/mo · Low risk',                     difficulty: 'Easy' },
  { icon: '📦', title: 'Enable pod autoscaling on prod-a100-east',    desc: 'Current static allocation peaks at 91% util. HPA with GPU metrics target 75% would prevent saturation.', savings: 'Prevents ~$6,000/mo in SLA penalties · Medium risk', difficulty: 'Medium' },
  { icon: '🌙', title: 'Scale dev-t4-pool to zero after 19:00',       desc: 'No production traffic after 19:00. Implement cron-based scale-to-zero to eliminate overnight idle cost.', savings: 'Saves ~$900/mo · Zero risk',                       difficulty: 'Easy' },
  { icon: '🔄', title: 'Migrate Mistral 7B workloads to T4 cluster',  desc: 'Mistral 7B performs within SLA on T4. A100 is 3× more expensive per hour for equivalent throughput.', savings: 'Saves ~$3,200/mo · Low risk',                     difficulty: 'Easy' },
];

function alertColor(level: string) {
  return level === 'crit' ? '#ef4444' : level === 'warn' ? '#f97316' : '#3b82f6';
}

function blockOpacity(util: number): string {
  const clamped = Math.max(0.12, util / 100);
  return `rgba(249, 115, 22, ${clamped})`;
}

const card: React.CSSProperties = {
  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
  padding: '1.375rem', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.06)',
};

export default function InferenceInfra() {
  return (
    <>
      <MetricsBar />
      <div style={{ padding: '1.75rem 2rem' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <Link href="/dashboard" style={{ color: '#f97316', textDecoration: 'none' }}>Dashboard</Link>
          <span style={{ color: '#9ca3af' }}>›</span>
          <span style={{ color: '#374151' }}>Inference Infra</span>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.375rem' }}>
            Inference Infrastructure
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            GPU clusters · VRAM utilization · Cost waste detection · Updated 5 min ago
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color, lineHeight: 1.1, marginBottom: '0.375rem' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* 2-col: GPU clusters + Health gauge */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={card}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              GPU Cluster Utilization
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>24h avg</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {GPU_CLUSTERS.map((c) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', width: '110px', flexShrink: 0, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.name}
                  </div>
                  <div style={{ flex: 1, height: '18px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${c.util}%`, background: c.color, borderRadius: '4px', boxShadow: `0 0 6px ${c.color}60` }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: c.color, width: '38px', textAlign: 'right' }}>
                    {c.util}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Inference Infra Health
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>58 / 100</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <HealthGauge score={58} maxScore={100} size={170} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: 'Active Alerts', value: '5', color: '#dc2626' },
                { label: 'At Risk Pods',  value: '14', color: '#f97316' },
                { label: 'Recommendations', value: '4', color: '#2563eb' },
                { label: 'Pods Healthy', value: '34', color: '#16a34a' },
              ].map((item) => (
                <div key={item.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.375rem', fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#6b7280', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VRAM utilization */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            VRAM Utilization by Model
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>⚠ Models below 40% are over-provisioned</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem' }}>
            {VRAM_MODELS.map((m) => (
              <div key={m.model} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.625rem', padding: '0.875rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {m.model}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: m.color, lineHeight: 1, marginBottom: '0.375rem' }}>
                  {m.vramPct}%
                </div>
                <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.375rem' }}>
                  <div style={{ height: '100%', width: `${m.vramPct}%`, background: m.color, borderRadius: '3px', boxShadow: `0 0 4px ${m.color}80` }} />
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#6b7280' }}>{m.waste}% idle VRAM</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            GPU Utilization — 24h Timeline
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>Darker = higher utilization</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {TIMELINE.map((row) => (
              <div key={row.cluster} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 44px', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>{row.cluster}</div>
                <div style={{ display: 'flex', gap: '2px', height: '24px' }}>
                  {row.blocks.map((val, idx) => (
                    <div key={idx} title={`${val}%`} style={{ flex: 1, borderRadius: '2px', background: blockOpacity(val) }} />
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textAlign: 'right' }}>
                  {row.blocks[row.blocks.length - 1]}%
                </div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 44px', gap: '0.75rem', alignItems: 'center' }}>
              <div />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', color: '#9ca3af', padding: '0 1px' }}>
                {TIME_LABELS.map((t) => <span key={t}>{t}</span>)}
              </div>
              <div />
            </div>
          </div>
        </div>

        {/* Alerts + Recommendations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div style={card}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              🚨 Active Alerts
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>{ALERTS.length} open</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.875rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: alertColor(a.level), flexShrink: 0, marginTop: '0.25rem' }} />
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '0.1875rem' }}>{a.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{a.desc}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#9ca3af', marginTop: '0.25rem' }}>{a.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={card}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              💡 Recommendations
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>~$12,300/mo savings available</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {RECS.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', marginBottom: '0.1875rem' }}>{r.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.375rem' }}>{r.desc}</div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>{r.savings}</span>
                      <span style={{ fontSize: '0.6875rem', color: '#9ca3af', marginLeft: '0.75rem' }}>· {r.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
