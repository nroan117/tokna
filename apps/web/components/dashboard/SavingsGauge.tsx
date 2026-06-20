'use client';

interface SavingsGaugeProps {
  savedUsd: number;
  targetUsd: number;
  size?: number;
}

export default function SavingsGauge({ savedUsd, targetUsd, size = 160 }: SavingsGaugeProps) {
  const r = 62;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const gaugeLen = circ * 0.75;
  const gapLen = circ - gaugeLen;
  const pct = Math.min(Math.max(savedUsd / (targetUsd || 1), 0), 1);
  const fillLen = gaugeLen * pct;
  const rotate = `rotate(135 ${cx} ${cy})`;
  const svgSize = cx * 2;

  const color =
    pct >= 0.75 ? '#16a34a' :
    pct >= 0.4  ? '#f97316' :
                  '#dc2626';

  const displaySaved = savedUsd >= 1000
    ? `$${(savedUsd / 1000).toFixed(1)}k`
    : `$${savedUsd.toFixed(0)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        width={size}
        height={size}
        aria-label={`Monthly savings: ${displaySaved} of ${targetUsd >= 1000 ? `$${(targetUsd / 1000).toFixed(1)}k` : `$${targetUsd}`} target`}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id="savingsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c2410c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke="#e2e8f0" strokeWidth="14"
          strokeDasharray={`${gaugeLen} ${gapLen}`}
          strokeLinecap="round"
          transform={rotate}
        />

        {/* Fill */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={`${fillLen} ${circ}`}
          strokeLinecap="round"
          transform={rotate}
          style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }}
        />

        {/* Center: $ saved */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#111827"
          fontSize="21" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
          {displaySaved}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" fill="#6b7280"
          fontSize="9.5" fontFamily="system-ui, -apple-system, sans-serif">
          saved / mo
        </text>
        <text x={cx} y={cy + 23} textAnchor="middle" fill={color}
          fontSize="9" fontWeight="600" fontFamily="system-ui, -apple-system, sans-serif">
          {Math.round(pct * 100)}%
        </text>
      </svg>
    </div>
  );
}
