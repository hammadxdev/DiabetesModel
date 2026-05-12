// src/components/ui/ProbabilityGauge.jsx
// SVG radial gauge for high-risk probability
export default function ProbabilityGauge({ value = 0, label = 'High Risk Probability', size = 160 }) {
  const r = 52, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - value / 100);
  const color = value >= 60 ? '#EF4444' : value >= 35 ? '#F59E0B' : '#22C55E';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2A2A2A" strokeWidth={10} />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1), stroke 0.4s ease' }}
        />
      </svg>
      <div style={{ marginTop: -(size / 2 + 32), textAlign: 'center' }}>
        <p className="font-display font-bold text-3xl" style={{ color }}>{value.toFixed(1)}%</p>
        <p className="text-xs text-muted mt-1">{label}</p>
      </div>
      <div style={{ height: size / 2 - 32 }} />
    </div>
  );
}
