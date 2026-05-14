import { motion, AnimatePresence } from 'framer-motion';

/* ── Helpers ───────────────────────────────────────────── */
const RISK_META = {
  'Not Urgent': { color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', textClass: 'text-emerald-400' },
  'Urgent — Readmission <30 Days': { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', textClass: 'text-rose-400' },
};

/* Entropy as uncertainty proxy: H = -sum(p * log2(p)) */
function shannonEntropy(p0, p1) {
  const safe = (p) => (p > 0 ? -p * Math.log2(p) : 0);
  return safe(p0) + safe(p1);
}

/* ── Animated Probability Bar ─────────────────────────── */
function ProbBar({ label, value, color, dominant }) {
  const pct = (value * 100).toFixed(1);
  return (
    <div className={`rounded-xl p-3 transition-all ${dominant ? 'ring-1' : ''}`}
      style={{ background: dominant ? `${color}0D` : 'transparent', ringColor: color }}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-sm font-medium text-cream">{label}</span>
          {dominant && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: `${color}20`, color }}>PREDICTED</span>
          )}
        </div>
        <span className="text-lg font-bold font-display" style={{ color: dominant ? color : '#A1A1AA' }}>
          {pct}%
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </div>
    </div>
  );
}

/* ── Confidence Meter ─────────────────────────────────── */
function ConfidenceMeter({ confidence, color }) {
  const pct = confidence * 100;
  const label = pct >= 75 ? 'High' : pct >= 50 ? 'Moderate' : 'Low';
  const labelColor = pct >= 75 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-muted uppercase tracking-wider">Model Confidence</span>
        <span className="text-xs font-semibold" style={{ color: labelColor }}>{label}</span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1 px-0.5">
        <span>0%</span><span>{pct.toFixed(1)}%</span><span>100%</span>
      </div>
    </div>
  );
}

/* ── Uncertainty Badge ────────────────────────────────── */
function UncertaintyBadge({ entropy, maxEntropy }) {
  const ratio = Math.min(entropy / maxEntropy, 1);
  const isBorderline = ratio > 0.55;
  const isUncertain  = ratio > 0.78;

  if (!isBorderline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
      style={{
        background: isUncertain ? 'rgba(245,158,11,0.1)' : 'rgba(96,165,250,0.1)',
        border: `1px solid ${isUncertain ? 'rgba(245,158,11,0.3)' : 'rgba(96,165,250,0.3)'}`,
        color: isUncertain ? '#F59E0B' : '#60A5FA',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      </svg>
      {isUncertain ? 'High uncertainty — borderline prediction' : 'Moderate uncertainty across classes'}
    </motion.div>
  );
}

/* ── SHAP Narrative ───────────────────────────────────── */
function ShapNarrative({ features, riskLabel, probs }) {
  if (!features || features.length === 0) return null;

  // Map raw feature names to human-readable clinical labels
  const featureLabels = {
    'number_inpatient_log':    'prior inpatient admissions',
    'num_medications_log':     'medication burden',
    'number_inpatient':        'prior inpatient admissions',
    'num_medications':         'medication count',
    'time_in_hospital':        'length of hospital stay',
    'chronic_complexity':      'chronic disease complexity',
    'admission_severity_score':'admission severity',
    'utilization_score_log':   'healthcare utilization',
    'utilization_score':       'healthcare utilization',
    'hospital_load_score_log': 'hospital procedure load',
    'hospital_load_score':     'hospital procedure load',
    'num_lab_procedures':      'laboratory test burden',
    'number_emergency_log':    'emergency visit history',
    'number_emergency':        'emergency visit history',
    'number_diagnoses':        'diagnostic complexity',
    'inpatient_x_diagnoses':   'inpatient-diagnosis interaction',
    'age_x_medications':       'age-adjusted medication load',
    'time_x_medications':      'stay-duration medication exposure',
    'medication_density':      'medication density per day',
    'procedure_intensity':     'procedural intensity',
  };

  const topNames = features.slice(0, 3).map(f => {
    const key = Object.keys(featureLabels).find(k => f.feature.includes(k));
    return key ? featureLabels[key] : f.feature.replace(/_/g, ' ').replace(' log', '');
  });

  const dominantProb = Math.max(probs.not_urgent ?? 0, probs.urgent ?? 0);
  const certaintyStr = dominantProb >= 0.7 ? 'strong' : dominantProb >= 0.5 ? 'moderate' : 'weak';

  const narratives = {
    'Not Urgent': `The model shows ${certaintyStr} confidence toward Not Urgent classification. 
      Key stabilising factors include ${topNames[0] || 'clinical parameters'} and 
      ${topNames[1] || 'medication profile'}. ${dominantProb < 0.65 ? 
      'Some overlap with High Risk patterns is present — routine monitoring is advised.' : 
      'Clinical indicators are broadly within expected low-risk ranges.'}`,
    'Urgent — Readmission <30 Days': `Urgent classification is driven by elevated ${topNames[0] || 'clinical indicators'}, 
      compounded by ${topNames[1] || 'utilization history'} and ${topNames[2] || 'diagnostic complexity'}. 
      ${dominantProb < 0.5 ? 
      'Note: probability mass is distributed — this is a borderline Urgent case requiring clinical judgment.' :
      'Immediate care coordination and discharge planning is strongly recommended.'}`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl p-4 space-y-3"
      style={{ background: 'rgba(214,185,140,0.04)', border: '1px solid rgba(214,185,140,0.12)' }}
    >
      <div className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D6B98C" strokeWidth="2">
          <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#D6B98C' }}>
          Clinical Interpretation
        </span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: '#C4C4C4' }}>
        {narratives[riskLabel] || narratives['Not Urgent']}
      </p>
      {topNames.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted mb-2">Primary Contributing Factors</p>
          <div className="flex flex-wrap gap-1.5">
            {topNames.map((name, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg"
                style={{ background: 'rgba(214,185,140,0.1)', color: '#D6B98C', border: '1px solid rgba(214,185,140,0.2)' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ── Risk Distribution Donut (SVG) ───────────────────── */
function RiskDonut({ low, high }) {
  const size = 120;
  const r = 44;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  const segments = [
    { value: low,    color: '#22C55E', label: 'Not Urgent' },
    { value: high,   color: '#EF4444', label: 'Urgent'   },
  ];

  let offset = 0;
  const paths = segments.map((seg) => {
    const dash = seg.value * circ;
    const gap  = circ - dash;
    const path = { ...seg, dash, gap, offset: circ * (1 - offset) };
    offset += seg.value;
    return path;
  });

  const dominant = segments.reduce((a, b) => a.value > b.value ? a : b);

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        <svg width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2A2A2A" strokeWidth="12" />
          {paths.map((seg, i) => (
            <motion.circle
              key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth="12"
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={seg.offset}
              strokeLinecap="butt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.2, duration: 0.6 }}
              style={{ transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted">Max</span>
          <span className="text-sm font-bold font-display" style={{ color: dominant.color }}>
            {(dominant.value * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="space-y-1.5 flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: seg.color }} />
              <span className="text-muted">{seg.label}</span>
            </div>
            <span className="font-semibold tabular-nums" style={{ color: seg.color }}>
              {(seg.value * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════ RESULT PANEL ══════════════════════ */
export default function ResultPanel({ result }) {
  if (!result) return null;

  const label   = result.risk_label || 'Not Urgent';
  const meta    = RISK_META[label] || RISK_META['Not Urgent'];
  const probs   = result.probabilities || {};
  const p0      = probs.not_urgent  ?? 0;
  const p1      = probs.urgent      ?? 0;
  const conf    = result.confidence ?? 0;
  const features = result.top_risk_features || [];

  const entropy    = shannonEntropy(p0, p1);
  const maxEntropy = 1; // 1 bit for 2 classes

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {/* ── Hero: Risk Distribution ── */}
      <div className="card-premium p-5" style={{ borderColor: meta.border }}>
        <p className="text-[10px] uppercase tracking-widest text-muted mb-4">Risk Probability Distribution</p>

        <RiskDonut low={p0} high={p1} />

        <div className="mt-5 space-y-2">
          <ProbBar label="Not Urgent" value={p0} color="#22C55E" dominant={label === 'Not Urgent'} />
          <ProbBar label="Urgent (<30 Days)" value={p1} color="#EF4444" dominant={label === 'Urgent — Readmission <30 Days'} />
        </div>
      </div>

      {/* ── Confidence + Uncertainty ── */}
      <div className="card-premium p-5 space-y-4">
        <ConfidenceMeter confidence={conf} color={meta.color} />
        <UncertaintyBadge entropy={entropy} maxEntropy={maxEntropy} />
      </div>

      {/* ── SHAP Narrative ── */}
      <ShapNarrative features={features} riskLabel={label} probs={probs} />

      {/* ── Top Clinical Signals (SHAP proxy) ── */}
      {features.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="card-premium p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: '#A78BFA' }}>
              Feature Influence (SHAP Proxy)
            </p>
          </div>
          <div className="space-y-2">
            {features.map(({ feature, value }, i) => {
              const absVal = Math.abs(value);
              const maxAbs = Math.abs(features[0]?.value ?? 1) || 1;
              const barPct = (absVal / maxAbs) * 100;
              const barColor = value > 0 ? '#EF4444' : '#22C55E';
              return (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-mono text-cream/80 truncate max-w-[70%] group-hover:text-cream transition-colors">
                      {feature.replace(/_log$/, '').replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: '#D6B98C' }}>
                      {typeof value === 'number' ? value.toFixed(3) : value}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: barColor, opacity: 0.7 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ delay: 0.55 + i * 0.07, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Recommendation ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="rounded-xl p-4"
        style={{ background: `${meta.color}0D`, border: `1px solid ${meta.border}` }}
      >
        <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: meta.color }}>
          Clinical Recommendation
        </p>
        <p className="text-sm text-cream leading-relaxed">{result.recommendation}</p>
      </motion.div>
    </motion.div>
  );
}
