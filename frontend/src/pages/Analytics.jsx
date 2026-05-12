import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, AreaChart, Area, Cell,
} from 'recharts';
import { toast } from 'sonner';
import { api } from '../services/api';
import SectionHeader from '../components/ui/SectionHeader';

const C = { accent:'#D6B98C', success:'#22C55E', warning:'#F59E0B', danger:'#EF4444', blue:'#60A5FA', violet:'#A78BFA', muted:'#A1A1AA' };
const CLASS_COLORS = [C.success, C.warning, C.danger];
const Skel = ({ h='h-40' }) => <div className={`skeleton rounded-xl ${h}`} />;

/* ── Stat Pill ── */
const StatPill = ({ label, value, sub, color=C.accent }) => (
  <motion.div className="card-premium p-5 hover:scale-[1.02] transition-transform cursor-default"
    whileHover={{ y: -2 }}>
    <p className="label-premium mb-1">{label}</p>
    <p className="font-display font-bold text-2xl" style={{ color }}>{value ?? '—'}</p>
    {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
  </motion.div>
);

/* ── Custom Tooltip ── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#1A1A1A', border:'1px solid #2A2A2A', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#F5E6D3', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
      {label != null && <p style={{ color:'#A1A1AA', marginBottom:6 }}>{typeof label==='number' ? label.toFixed(4) : label}</p>}
      {payload.map((p,i) => (
        <p key={i} style={{ color: p.color||p.stroke||'#F5E6D3', marginBottom:2 }}>
          {p.name}: <span style={{ fontWeight:700 }}>{typeof p.value==='number' ? p.value.toFixed(4) : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const fadeItem = { hidden:{opacity:0,y:16}, show:{opacity:1,y:0,transition:{duration:0.45,ease:[0.22,1,0.36,1]}} };
const stagger  = { hidden:{}, show:{transition:{staggerChildren:0.07}} };

/* ── Confusion Matrix ── */
const ConfMatrix = ({ data }) => {
  if (!data?.matrix) return <Skel h="h-64" />;
  const { matrix, labels } = data;
  const max = Math.max(...matrix.flat());
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted text-center mb-3">Predicted →</p>
      <div className="grid gap-1.5" style={{ gridTemplateColumns:`auto repeat(${labels.length},1fr)` }}>
        <div />
        {labels.map(l => <div key={l} className="text-center text-xs text-muted pb-1">{l.split(' ')[0]}</div>)}
        {matrix.map((row,i) => (
          <div key={i} className="contents">
            <div className="text-xs text-muted flex items-center justify-end pr-2 whitespace-nowrap">{labels[i].split(' ')[0]}</div>
            {row.map((v,j) => {
              const alpha = max > 0 ? v/max : 0;
              const bg = i===j ? `rgba(214,185,140,${Math.max(alpha*0.8,0.08)})` : `rgba(239,68,68,${Math.max(alpha*0.45,0.04)})`;
              return (
                <motion.div key={j}
                  initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
                  transition={{ delay:(i*3+j)*0.06, type:'spring', stiffness:300, damping:20 }}
                  className="rounded-xl flex flex-col items-center justify-center h-16 font-bold text-sm"
                  style={{ background:bg, border:'1px solid rgba(255,255,255,0.06)', color: alpha>0.4?'#F5E6D3':'#A1A1AA' }}>
                  {v.toLocaleString()}
                  {i===j && <span className="text-[9px] font-normal opacity-60 mt-0.5">✓</span>}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted text-center mt-3">← Actual</p>
    </div>
  );
};

/* ── ROC Multi-line ── */
const RocChart = ({ roc }) => {
  const classes = Object.keys(roc);
  const clsColors = [C.success, C.warning, C.danger];
  const sampled = {};
  classes.forEach(cls => {
    const { fpr, tpr } = roc[cls];
    const step = Math.max(1, Math.floor(fpr.length/60));
    sampled[cls] = [];
    for (let i=0; i<fpr.length; i+=step) sampled[cls].push({ fpr:+fpr[i].toFixed(4), tpr:+tpr[i].toFixed(4) });
  });
  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart margin={{ top:8, right:12, bottom:24, left:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="fpr" type="number" domain={[0,1]} tick={{ fontSize:10, fill:'#A1A1AA' }} tickCount={6}
            label={{ value:'False Positive Rate', position:'insideBottom', offset:-14, fill:'#A1A1AA', fontSize:10 }}/>
          <YAxis type="number" domain={[0,1]} tick={{ fontSize:10, fill:'#A1A1AA' }} tickCount={6}
            label={{ value:'TPR', angle:-90, position:'insideLeft', offset:10, fill:'#A1A1AA', fontSize:10 }}/>
          <Tooltip content={<Tip />} />
          <Line data={[{fpr:0,tpr:0},{fpr:1,tpr:1}]} dataKey="tpr" stroke="#2A2A2A" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Random" legendType="none"/>
          {classes.map((cls,ci) => (
            <Line key={cls} data={sampled[cls]} dataKey="tpr" stroke={clsColors[ci]} strokeWidth={2.5} dot={false} name={cls} type="monotone"/>
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 flex-wrap mt-2 text-xs">
        {classes.map((cls,i) => (
          <span key={cls} className="flex items-center gap-2 text-muted">
            <span className="w-4 h-1 rounded-full inline-block" style={{ background:clsColors[i] }}/>
            {cls} <span className="font-bold text-cream">AUC {roc[cls].auc?.toFixed(3)}</span>
          </span>
        ))}
      </div>
    </>
  );
};

/* ── PR Multi-line (all 3 classes) ── */
const PrChart = ({ pr }) => {
  const classes = Object.keys(pr);
  const clsColors = [C.success, C.warning, C.danger];
  const sampled = {};
  classes.forEach(cls => {
    const d = pr[cls];
    if (!d) return;
    const step = Math.max(1, Math.floor(d.recall.length/60));
    sampled[cls] = [];
    for (let i=0; i<d.recall.length; i+=step)
      sampled[cls].push({ recall:+d.recall[i].toFixed(4), precision:+d.precision[i].toFixed(4) });
  });
  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart margin={{ top:8, right:12, bottom:24, left:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="recall" type="number" domain={[0,1]} tick={{ fontSize:10, fill:'#A1A1AA' }} tickCount={6}
            label={{ value:'Recall', position:'insideBottom', offset:-14, fill:'#A1A1AA', fontSize:10 }}/>
          <YAxis type="number" domain={[0,1]} tick={{ fontSize:10, fill:'#A1A1AA' }} tickCount={6}
            label={{ value:'Precision', angle:-90, position:'insideLeft', offset:10, fill:'#A1A1AA', fontSize:10 }}/>
          <Tooltip content={<Tip />} />
          {classes.map((cls,ci) => (
            <Line key={cls} data={sampled[cls]} dataKey="precision" stroke={clsColors[ci]} strokeWidth={2.5} dot={false} name={cls} type="monotone"/>
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 flex-wrap mt-2 text-xs">
        {classes.map((cls,i) => (
          <span key={cls} className="flex items-center gap-2 text-muted">
            <span className="w-4 h-1 rounded-full inline-block" style={{ background:clsColors[i] }}/>
            {cls} <span className="font-bold text-cream">AP {pr[cls]?.auc?.toFixed(3)}</span>
          </span>
        ))}
      </div>
    </>
  );
};

/* ══════════════ ANALYTICS PAGE ══════════════════════ */
export default function Analytics() {
  const [metrics,   setMetrics]   = useState(null);
  const [models,    setModels]    = useState(null);
  const [cm,        setCm]        = useState(null);
  const [roc,       setRoc]       = useState(null);
  const [pr,        setPr]        = useState(null);
  const [fi,        setFi]        = useState(null);
  const [cal,       setCal]       = useState(null);
  const [classDist, setClassDist] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const tid = toast.loading('Loading analytics…');
    Promise.all([
      api.metrics(), api.modelComparison(), api.confusionMatrix(),
      api.rocCurve(), api.prCurve(), api.featureImportance(),
      api.calibration(), api.classDistribution(),
    ]).then(([m,mc,c,r,p,f,calD,cd]) => {
      setMetrics(m); setModels(mc); setCm(c); setRoc(r);
      setPr(p); setFi(f); setCal(calD); setClassDist(cd);
      toast.success('Analytics loaded', { id:tid });
    }).catch(() => toast.error('Backend unreachable. Is the server running?', { id:tid }))
      .finally(() => setLoading(false));
  }, []);

  /* derived */
  const featureData = fi?.features?.slice(0,15).map(({ feature, importance }) => ({
    name: feature.length > 22 ? feature.slice(0,20)+'…' : feature,
    value: +(importance*100).toFixed(2),
  })) ?? [];

  const classDistData = classDist
    ? Object.entries(classDist).map(([name, count]) => ({ name, count })) : [];

  /* calibration — support both old (flat) and new (per-class dict) shapes */
  const calData = (() => {
    if (!cal) return [];
    if (cal.prob_pred) {
      return cal.prob_pred.map((x,i) => ({ predicted:+x.toFixed(3), actual:+(cal.prob_true[i]??0).toFixed(3), perfect:+x.toFixed(3) }));
    }
    const hrCal = cal['High Risk'] || cal['Low Risk'];
    if (hrCal?.prob_pred) {
      return hrCal.prob_pred.map((x,i) => ({ predicted:+x.toFixed(3), actual:+(hrCal.prob_true[i]??0).toFixed(3), perfect:+x.toFixed(3) }));
    }
    return [];
  })();

  const modelCompData = models
    ? Object.entries(models).map(([name, m]) => ({
        name: name.replace('CalibratedEnsemble','Ensemble').replace('HistGradientBoosting','HistGB').replace('RandomForest','RF'),
        accuracy: +((m.accuracy??0)*100).toFixed(1),
        f1_macro: +((m.f1_macro??0)*100).toFixed(1),
        roc_auc:  +((m.roc_auc??0)*100).toFixed(1),
      })) : [];

  /* top stat pills */
  const pills = metrics ? [
    { label:'Accuracy',       value:`${(metrics.accuracy*100).toFixed(1)}%`, color:C.accent },
    { label:'Macro F1',       value:`${(metrics.macro_f1*100).toFixed(1)}%`, color:C.violet },
    { label:'Macro Recall',   value:`${((metrics.macro_recall??0)*100).toFixed(1)}%`, color:C.warning },
    { label:'Macro Precision',value:`${((metrics.macro_precision??0)*100).toFixed(1)}%`, color:C.blue },
    { label:'ROC-AUC (OVR)', value:metrics.roc_auc?.toFixed(4), color:C.success },
    { label:'Low Risk AP',   value:metrics.per_class_pr_auc?.['Low Risk']?.toFixed(3)??metrics.pr_auc?.toFixed(3), color:C.success },
    { label:'Medium Risk AP',value:metrics.per_class_pr_auc?.['Medium Risk']?.toFixed(3)??'—', color:C.warning },
    { label:'High Risk AP',  value:metrics.per_class_pr_auc?.['High Risk']?.toFixed(3)??'—', color:C.danger },
  ] : [];

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Real-Time Analytics"
          title="Model Performance Dashboard"
          sub={metrics
            ? `${metrics.dataset_size?.toLocaleString()} patients · ${metrics.feature_count} features · ${metrics.model_name ?? 'CalibratedEnsemble'} · Argmax prediction`
            : 'Loading…'}
        />

        {/* ── Stat Pills ── */}
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {loading
            ? Array(8).fill(0).map((_,i) => <motion.div key={i} variants={fadeItem}><Skel h="h-24"/></motion.div>)
            : pills.map(p => <motion.div key={p.label} variants={fadeItem}><StatPill {...p}/></motion.div>)
          }
        </motion.div>

        {/* ── Row 1: Confusion Matrix + ROC ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div variants={fadeItem} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-premium p-6">
            <p className="label-premium mb-6" style={{ color:C.accent }}>Confusion Matrix</p>
            <ConfMatrix data={cm} />
          </motion.div>
          <motion.div variants={fadeItem} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-premium p-6">
            <p className="label-premium mb-4" style={{ color:C.accent }}>ROC Curves (One-vs-Rest)</p>
            {loading ? <Skel h="h-72"/> : roc ? <RocChart roc={roc}/> : <p className="text-muted text-sm">No ROC data</p>}
          </motion.div>
        </div>

        {/* ── Row 2: Feature Importance + PR Curves ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div variants={fadeItem} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-premium p-6">
            <p className="label-premium mb-4" style={{ color:C.accent }}>Top Feature Importances</p>
            {loading ? <Skel h="h-80"/> : (
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={featureData} layout="vertical" margin={{ top:0, right:24, bottom:0, left:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={false}/>
                  <XAxis type="number" tick={{ fontSize:10, fill:'#A1A1AA' }} tickFormatter={v=>`${v}%`}/>
                  <YAxis type="category" dataKey="name" tick={{ fontSize:9, fill:'#A1A1AA' }} width={130}/>
                  <Tooltip content={<Tip />}/>
                  <Bar dataKey="value" name="Importance %" radius={[0,6,6,0]} barSize={16}>
                    {featureData.map((_,i) => (
                      <Cell key={i} fill={i===0 ? C.accent : `rgba(214,185,140,${0.7-(i*0.04)})`}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div variants={fadeItem} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-premium p-6">
            <p className="label-premium mb-4" style={{ color:C.accent }}>Precision-Recall Curves (All Classes)</p>
            {loading ? <Skel h="h-80"/> : pr ? <PrChart pr={pr}/> : <p className="text-muted text-sm">No PR data</p>}
          </motion.div>
        </div>

        {/* ── Row 3: Model Comparison + Calibration + Class Dist ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div variants={fadeItem} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-premium p-6">
            <p className="label-premium mb-4" style={{ color:C.accent }}>Model Comparison</p>
            {loading ? <Skel h="h-64"/> : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={modelCompData} margin={{ top:4, right:8, bottom:8, left:-16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A"/>
                    <XAxis dataKey="name" tick={{ fontSize:9, fill:'#A1A1AA' }}/>
                    <YAxis tickFormatter={v=>`${v}%`} tick={{ fontSize:10, fill:'#A1A1AA' }}/>
                    <Tooltip content={<Tip />}/>
                    <Legend wrapperStyle={{ fontSize:10, color:'#A1A1AA' }}/>
                    <Bar dataKey="accuracy" name="Accuracy"  fill={C.accent}   radius={[4,4,0,0]}/>
                    <Bar dataKey="f1_macro" name="Macro F1"  fill={C.violet}   radius={[4,4,0,0]}/>
                    <Bar dataKey="roc_auc"  name="ROC-AUC"   fill={C.success}  radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        {['Model','Accuracy','Macro F1','ROC-AUC','CV F1-macro'].map(h => (
                          <th key={h} className="py-2 pr-3 text-left font-medium text-muted">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {models && Object.entries(models).map(([name, m]) => (
                        <tr key={name} className="border-b border-border/40 hover:bg-surface/50 transition-colors">
                          <td className="py-2.5 pr-3 text-cream font-medium truncate max-w-[140px]">{name}</td>
                          <td className="py-2.5 pr-3" style={{ color:C.accent }}>{m.accuracy ? `${(m.accuracy*100).toFixed(1)}%` : '—'}</td>
                          <td className="py-2.5 pr-3" style={{ color:C.violet }}>{m.f1_macro ? `${(m.f1_macro*100).toFixed(1)}%` : '—'}</td>
                          <td className="py-2.5 pr-3" style={{ color:C.success }}>{m.roc_auc ? m.roc_auc.toFixed(4) : '—'}</td>
                          <td className="py-2.5 pr-3" style={{ color:C.muted }}>{m.cv_f1_macro_mean ? `${(m.cv_f1_macro_mean*100).toFixed(1)}%` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>

          <div className="space-y-6">
            {/* Calibration */}
            <motion.div variants={fadeItem} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-premium p-6">
              <p className="label-premium mb-4" style={{ color:C.accent }}>Calibration Curve</p>
              {loading ? <Skel h="h-48"/> : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={calData} margin={{ top:8, right:12, bottom:24, left:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A"/>
                    <XAxis dataKey="predicted" tick={{ fontSize:10, fill:'#A1A1AA' }} tickCount={5}
                      label={{ value:'Predicted Probability', position:'insideBottom', offset:-14, fill:'#A1A1AA', fontSize:10 }}/>
                    <YAxis tick={{ fontSize:10, fill:'#A1A1AA' }} tickCount={5}/>
                    <Tooltip content={<Tip />}/>
                    <Line type="monotone" dataKey="perfect" stroke="#3A3A3A" strokeWidth={1.5} strokeDasharray="6 4" dot={false} name="Perfect"/>
                    <Line type="monotone" dataKey="actual"  stroke={C.accent} strokeWidth={3} dot={{ fill:C.accent, r:4, strokeWidth:0 }} activeDot={{ r:6, fill:'#F5E6D3' }} name="Model"/>
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Class Distribution */}
            <motion.div variants={fadeItem} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-premium p-6">
              <p className="label-premium mb-4" style={{ color:C.accent }}>Training Class Distribution (Post-SMOTE)</p>
              {loading ? <Skel h="h-36"/> : (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={classDistData} margin={{ top:4, right:8, bottom:4, left:-8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A"/>
                    <XAxis dataKey="name" tick={{ fontSize:10, fill:'#A1A1AA' }}/>
                    <YAxis tick={{ fontSize:9, fill:'#A1A1AA' }} tickFormatter={v=>`${(v/1000).toFixed(0)}K`}/>
                    <Tooltip content={<Tip />}/>
                    <Bar dataKey="count" name="Samples" radius={[6,6,0,0]} barSize={48}>
                      {classDistData.map((_,i) => <Cell key={i} fill={CLASS_COLORS[i]||C.accent}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── System Info Banner ── */}
        {metrics && (
          <motion.div initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
            transition={{ duration:0.5 }}
            className="card-premium p-5 flex flex-wrap gap-x-8 gap-y-3 text-xs"
            style={{ background:'rgba(214,185,140,0.03)', borderColor:'rgba(214,185,140,0.15)' }}>
            {[
              ['Dataset Size',   metrics.dataset_size?.toLocaleString()],
              ['Feature Count',  metrics.feature_count],
              ['Train Samples',  metrics.train_samples?.toLocaleString()],
              ['Prediction Mode',metrics.prediction_mode ?? 'argmax'],
              ['Optimization',   'f1_macro'],
              ['Resampling',     'SMOTE'],
              ['Model',          metrics.model_name?.replace('CalibratedStackedEnsemble_','')],
              ['Platform',       'v3.0.0'],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-muted mb-0.5 uppercase tracking-wider" style={{ fontSize:'0.625rem' }}>{k}</p>
                <p className="text-cream font-semibold">{v ?? '—'}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
