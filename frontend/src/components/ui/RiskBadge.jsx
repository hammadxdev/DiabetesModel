// src/components/ui/RiskBadge.jsx
const riskConfig = {
  'Low Risk':    { cls: 'badge-low',    dot: '#22C55E', label: 'Low Risk' },
  'Medium Risk': { cls: 'badge-medium', dot: '#F59E0B', label: 'Medium Risk' },
  'High Risk':   { cls: 'badge-high',   dot: '#EF4444', label: 'High Risk' },
};

export default function RiskBadge({ label, size = 'md' }) {
  const cfg = riskConfig[label] || riskConfig['Low Risk'];
  const sz  = size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs';
  return (
    <span className={`inline-flex items-center gap-2 rounded-full font-semibold ${cfg.cls} ${sz}`}>
      <span className="w-2 h-2 rounded-full animate-pulse2" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}
