import React from "react";
import { HiOutlineCheckCircle, HiOutlineExclamationTriangle, HiOutlineXCircle,
         HiOutlineArrowPath, HiOutlineBeaker } from "react-icons/hi2";

const config = {
  "Low Risk":    { icon: HiOutlineCheckCircle,       border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-400",  bar: "#34d399" },
  "Medium Risk": { icon: HiOutlineExclamationTriangle, border: "border-amber-500/40",  bg: "bg-amber-500/10",  text: "text-amber-400",   bar: "#fbbf24" },
  "High Risk":   { icon: HiOutlineXCircle,            border: "border-rose-500/40",    bg: "bg-rose-500/10",   text: "text-rose-400",    bar: "#f87171" },
};

const ProbBar = ({ label, value, color }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs text-slate-400 mb-1">
      <span>{label}</span>
      <span className="font-semibold">{(value * 100).toFixed(1)}%</span>
    </div>
    <div className="w-full bg-slate-700 rounded-full h-2.5">
      <div className="h-2.5 rounded-full transition-all duration-700"
        style={{ width: `${value * 100}%`, background: color }} />
    </div>
  </div>
);

export default function ResultCard({ result, onReset }) {
  if (!result) return null;

  const label = result.risk_label || "Low Risk";
  const cfg   = config[label] || config["Low Risk"];
  const Icon  = cfg.icon;
  const probs = result.probabilities || {};
  const topFeatures = result.top_risk_features || [];

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-6 space-y-5`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Icon className={`w-8 h-8 ${cfg.text}`} />
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Prediction Result</p>
          <h2 className={`text-2xl font-bold ${cfg.text}`}>{label}</h2>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-slate-500">Confidence</p>
          <p className="text-xl font-bold text-white">{((result.confidence || 0) * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Risk Score */}
      {result.risk_score != null && (
        <div className="bg-slate-800/60 rounded-xl p-4 flex items-center gap-3">
          <HiOutlineBeaker className="w-5 h-5 text-cyan-400 flex-shrink-0"/>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>High-Risk Probability Score</span>
              <span className="text-rose-400 font-bold">{result.risk_score?.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                style={{ width: `${Math.min(result.risk_score, 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Probability Bars */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Calibrated Probabilities</p>
        <ProbBar label="Low Risk"    value={probs.low_risk    ?? 0} color="#34d399" />
        <ProbBar label="Medium Risk" value={probs.medium_risk ?? 0} color="#fbbf24" />
        <ProbBar label="High Risk"   value={probs.high_risk   ?? 0} color="#f87171" />
        <p className="text-xs text-slate-600 mt-2">Threshold used: {result.threshold_used?.toFixed(4)}</p>
      </div>

      {/* Top Risk Features */}
      {topFeatures.length > 0 && (
        <div className="bg-slate-800/40 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Top Influencing Features</p>
          <div className="space-y-2">
            {topFeatures.map(({ feature, value }) => (
              <div key={feature} className="flex justify-between text-sm">
                <span className="text-slate-300 font-mono text-xs truncate max-w-[70%]">{feature}</span>
                <span className="text-cyan-400 font-semibold">{typeof value === 'number' ? value.toFixed(3) : value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Explanation */}
      {result.clinical_explanation && (
        <div className="bg-slate-800/40 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Clinical Explanation</p>
          <p className="text-sm text-slate-300 leading-relaxed">{result.clinical_explanation}</p>
        </div>
      )}

      {/* Recommendation */}
      <div className={`rounded-xl p-4 border ${cfg.border} bg-black/20`}>
        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Clinical Recommendation</p>
        <p className="text-sm text-white leading-relaxed">{result.recommendation}</p>
      </div>

      {/* Reset */}
      <button onClick={onReset}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-medium border border-white/10 transition-all">
        <HiOutlineArrowPath className="w-4 h-4" />
        New Prediction
      </button>
    </div>
  );
}
