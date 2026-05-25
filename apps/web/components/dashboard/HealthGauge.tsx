interface HealthGaugeProps {
  score: number;
  maxScore?: number;
  size?: number;
}

export default function HealthGauge({ score, maxScore = 100, size = 140 }: HealthGaugeProps) {
  const r = 58;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;
  const gaugeLen = circ * 0.75;
  const gapLen = circ - gaugeLen;
  const fillLen = gaugeLen * Math.min(Math.max(score / maxScore, 0), 1);

  const color =
    score >= 80 ? '#16a34a' :
    score >= 60 ? '#f97316' :
                  '#dc2626';

  const rotate = `rotate(135 ${cx} ${cy})`;

  return (
    <svg
      viewBox={`0 0 ${cx * 2} ${cy * 2}`}
      width={size}
      height={size}
      aria-label={`Health score ${score} out of ${maxScore}`}
    >
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke="#e2e8f0" strokeWidth="13"
        strokeDasharray={`${gaugeLen} ${gapLen}`}
        strokeLinecap="round"
        transform={rotate}
      />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth="13"
        strokeDasharray={`${fillLen} ${circ}`}
        strokeLinecap="round"
        transform={rotate}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#111827"
        fontSize="22" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
        {score}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill="#6b7280"
        fontSize="10" fontFamily="system-ui, -apple-system, sans-serif">
        / {maxScore}
      </text>
    </svg>
  );
}
