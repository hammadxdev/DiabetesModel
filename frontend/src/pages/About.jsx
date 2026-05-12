import { motion } from 'framer-motion';
import SectionHeader from '../components/ui/SectionHeader';

const PIPELINE = [
  { step: '01', title: 'Data Ingestion',       desc: 'UCI Diabetes 130-US Hospitals dataset — 101,766 patient records, 50 raw features from real clinical encounters.', icon: '🗄️' },
  { step: '02', title: 'Bias Removal',          desc: 'Protected attributes (race, gender) removed at ingestion. 9 non-clinical columns dropped. Focus stays on clinical evidence.', icon: '🔒' },
  { step: '03', title: 'ICD-9 Feature Mapping', desc: 'Diagnoses mapped to granular clinical categories: Circ_Hypertension, Diabetes_Type2, Resp_COPD — preserving medical signal.', icon: '🏥' },
  { step: '04', title: 'Feature Engineering',   desc: '17 derived features added: total_visits, medication_density, chronic_complexity, interaction terms, quantile bins.', icon: '⚗️' },
  { step: '05', title: 'Outlier Handling',      desc: 'IQR clipping at 1st/99th percentiles. Log1p transforms on skewed distributions. VarianceThreshold filtering.', icon: '📐' },
  { step: '06', title: 'SMOTEENN Balancing',    desc: 'Synthetic Minority Oversampling + Edited Nearest Neighbors produced 67,518 balanced training samples across 3 classes.', icon: '⚖️' },
  { step: '07', title: 'Stacked Ensemble',      desc: 'HistGradientBoosting + GradientBoosting + RandomForest base models stacked via LogisticRegression meta-learner.', icon: '🧠' },
  { step: '08', title: 'Isotonic Calibration',  desc: 'CalibratedClassifierCV (isotonic) applied on the full stack to ensure probabilities are statistically meaningful.', icon: '📊' },
  { step: '09', title: 'F2 Threshold Optimization', desc: 'Optimal threshold (0.2181) found from precision-recall curves to maximize recall for High Risk patients.', icon: '🎯' },
];

const TECH = [
  { cat: 'Data & ML',    items: ['Python 3.13','scikit-learn 1.6','pandas 2.2','NumPy 2.2','imbalanced-learn','scipy'] },
  { cat: 'Backend',      items: ['FastAPI 0.136','Uvicorn','Pydantic v2','joblib','pickle'] },
  { cat: 'Frontend',     items: ['React 19','Vite','TailwindCSS 3','Framer Motion','Recharts','Sonner'] },
  { cat: 'ML Pipeline',  items: ['HistGradientBoosting','GradientBoosting','RandomForest','Stacking','Isotonic Calibration','SMOTEENN'] },
];

const MODELS = [
  { name: 'Calibrated Stacked Ensemble', type: 'Meta-Ensemble', cv: '0.693', recall: '75.9%', auc: '0.659', active: true },
  { name: 'HistGradientBoosting',        type: 'Boosting',      cv: '0.693', recall: '—',     auc: '0.659', active: false },
  { name: 'RandomForest',                type: 'Bagging',       cv: '0.677', recall: '—',     auc: '—',     active: false },
  { name: 'GradientBoosting',            type: 'Boosting',      cv: '0.655', recall: '—',     auc: '—',     active: false },
];

const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22,1,0.36,1] } },
};
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function About() {
  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-5xl mx-auto px-6 space-y-20">
        <SectionHeader
          eyebrow="Project Documentation"
          title="About the System"
          sub="Complete technical overview of the Explainable AI Healthcare Analytics Platform v2.0"
          centered
        />

        {/* ML Pipeline Timeline */}
        <section>
          <p className="label-premium mb-8" style={{ color: '#D6B98C' }}>ML Pipeline</p>
          <div className="relative">
            <div className="absolute left-8 top-6 bottom-6 w-px bg-border" />
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="space-y-4">
              {PIPELINE.map(({ step, title, desc, icon }) => (
                <motion.div key={step} variants={item} className="flex gap-6 group">
                  <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                    style={{ background: 'rgba(214,185,140,0.08)', border: '1px solid rgba(214,185,140,0.2)' }}>
                    <span className="text-xl">{icon}</span>
                  </div>
                  <div className="card-premium p-4 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono" style={{ color: '#D6B98C' }}>{step}</span>
                      <h3 className="font-display font-semibold text-cream text-sm">{title}</h3>
                    </div>
                    <p className="text-muted text-sm leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Model Performance Table */}
        <section>
          <p className="label-premium mb-6" style={{ color: '#D6B98C' }}>Model Performance</p>
          <div className="card-premium overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Model','Type','CV F1-macro','HR Recall','ROC-AUC'].map(h=>(
                    <th key={h} className="py-3.5 px-5 text-left label-premium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODELS.map((m, i) => (
                  <motion.tr
                    key={m.name}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className={`border-b border-border/40 transition-colors ${m.active ? '' : 'hover:bg-surface'}`}
                    style={m.active ? { background: 'rgba(214,185,140,0.05)' } : {}}
                  >
                    <td className="py-3.5 px-5 text-cream font-medium flex items-center gap-2">
                      {m.active && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(214,185,140,0.15)', color: '#D6B98C', border: '1px solid rgba(214,185,140,0.3)' }}>Production</span>}
                      {m.name}
                    </td>
                    <td className="py-3.5 px-5 text-muted">{m.type}</td>
                    <td className="py-3.5 px-5 font-mono text-cream">{m.cv}</td>
                    <td className="py-3.5 px-5 text-danger font-semibold">{m.recall}</td>
                    <td className="py-3.5 px-5 text-success font-semibold">{m.auc}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tech Stack */}
        <section>
          <p className="label-premium mb-6" style={{ color: '#D6B98C' }}>Technology Stack</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TECH.map(({ cat, items }) => (
              <div key={cat} className="card-premium p-5">
                <p className="text-xs font-semibold text-cream mb-3">{cat}</p>
                <div className="flex flex-wrap gap-1.5">
                  {items.map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-lg text-muted transition-colors hover:text-cream"
                      style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Developer */}
        <section>
          <p className="label-premium mb-6" style={{ color: '#D6B98C' }}>Developer</p>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="card-premium p-8 flex items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(214,185,140,0.1)', border: '1px solid rgba(214,185,140,0.2)' }}>
              🧑‍💻
            </div>
            <div>
              <h3 className="font-display font-bold text-cream text-xl">Muhammad Hammad</h3>
              <p className="text-sm mt-0.5" style={{ color: '#D6B98C' }}>Fa-2023/BSCS/514</p>
              <p className="text-muted text-sm mt-1.5 leading-relaxed">
                CCP Project — Explainable AI Healthcare Analytics Platform.<br />
                Built an enterprise-grade ML system from data ingestion to calibrated predictions and a full analytics API layer.
              </p>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
