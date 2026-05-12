import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '../services/api';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import SectionHeader from '../components/ui/SectionHeader';
import ResultPanel from './ResultPanel';

/* ── Constants ─────────────────────────────────── */
const AGE_OPTS  = ['[0-10)','[10-20)','[20-30)','[30-40)','[40-50)','[50-60)','[60-70)','[70-80)','[80-90)','[90-100)'];
const DIAG_OPTS = ['Circ_Hypertension','Circ_HeartDisease','Circ_Other','Resp_COPD','Resp_Other','Digestive','Diabetes_Type2','Endocrine_Other','Injury','Musculoskeletal','Genitourinary','Neoplasms','Skin','Mental','Infectious','Blood','Nervous','External','Other'];
const INSULIN_OPTS = ['No','Up','Down','Steady'];

const DEFAULTS = {
  age: '[60-70)', admission_type_id: 1, discharge_disposition_id: 1, admission_source_id: 7,
  time_in_hospital: 4, num_lab_procedures: 40, num_procedures: 1, num_medications: 12,
  number_outpatient: 0, number_emergency: 0, number_inpatient: 1,
  number_diagnoses: 5, diag_1_cat: 'Circ_Hypertension', insulin: 'No', diabetesMed: 'Yes',
};

/* ── Sub-components ─────────────────────────────── */
const FieldLabel = ({ children, hint }) => (
  <div className="flex items-center justify-between mb-1.5">
    <label className="label-premium">{children}</label>
    {hint && <span className="text-xs text-muted">{hint}</span>}
  </div>
);

const FormSelect = ({ name, value, onChange, options, labels }) => (
  <select name={name} value={value} onChange={onChange} className="select-premium">
    {options.map((o, i) => <option key={o} value={o}>{labels ? labels[i] : o}</option>)}
  </select>
);

const FormInput = ({ name, value, onChange, min, max }) => (
  <div className="space-y-1">
    <input type="number" name={name} value={value} min={min} max={max}
      onChange={onChange} className="input-premium" />
    {(min !== undefined || max !== undefined) && (
      <div className="flex justify-between text-xs text-muted px-1">
        <span>{min}</span><span>{max}</span>
      </div>
    )}
  </div>
);

/* ── Sections config ─────────────────────────────── */
const sections = [
  {
    title: 'Patient Profile', icon: '👤',
    fields: [
      { key: 'age', label: 'Age Group', type: 'select', options: AGE_OPTS },
      { key: 'diag_1_cat', label: 'Primary Diagnosis', type: 'select', options: DIAG_OPTS, labels: DIAG_OPTS.map(d => d.replace(/_/g, ' ')) },
      { key: 'admission_type_id', label: 'Admission Type', type: 'input', min: 1, max: 8, hint: '1–8' },
      { key: 'discharge_disposition_id', label: 'Discharge Disposition', type: 'input', min: 1, max: 30, hint: '1–30' },
    ],
  },
  {
    title: 'Hospital Stay', icon: '🏥',
    fields: [
      { key: 'time_in_hospital', label: 'Days in Hospital', type: 'input', min: 1, max: 14, hint: '1–14 days' },
      { key: 'num_lab_procedures', label: 'Lab Procedures', type: 'input', min: 0, max: 132, hint: 'count' },
      { key: 'num_procedures', label: 'Procedures', type: 'input', min: 0, max: 6, hint: '0–6' },
      { key: 'num_medications', label: 'Medications', type: 'input', min: 0, max: 81, hint: 'count' },
    ],
  },
  {
    title: 'Prior Utilization', icon: '📊',
    fields: [
      { key: 'number_inpatient',  label: 'Prior Inpatient Visits',  type: 'input', min: 0, max: 21, hint: 'past year' },
      { key: 'number_outpatient', label: 'Prior Outpatient Visits', type: 'input', min: 0, max: 42, hint: 'past year' },
      { key: 'number_emergency',  label: 'Emergency Visits',        type: 'input', min: 0, max: 76, hint: 'past year' },
      { key: 'number_diagnoses',  label: 'Number of Diagnoses',     type: 'input', min: 1, max: 16, hint: '1–16' },
    ],
  },
  {
    title: 'Medications', icon: '💊',
    fields: [
      { key: 'insulin',     label: 'Insulin Status',      type: 'select', options: INSULIN_OPTS },
      { key: 'diabetesMed', label: 'Diabetes Medication', type: 'select', options: ['Yes', 'No'] },
    ],
  },
];

/* ── Main Page ─────────────────────────────────── */
export default function Predict() {
  const [form,    setForm]    = useState({ ...DEFAULTS });
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nums = ['admission_type_id','discharge_disposition_id','admission_source_id',
                  'time_in_hospital','num_lab_procedures','num_procedures','num_medications',
                  'number_outpatient','number_emergency','number_inpatient','number_diagnoses'];
    setForm(p => ({ ...p, [name]: nums.includes(name) ? parseInt(value) || 0 : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tid = toast.loading('AI analyzing patient risk profile…');
    try {
      const data = await api.predict(form);
      setResult(data);
      toast.success('Prediction generated', { id: tid });
    } catch {
      toast.error('Backend unreachable. Is the server running?', { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setForm({ ...DEFAULTS }); setResult(null); };

  return (
    <div className="min-h-screen pt-20 pb-20">
      <LoadingOverlay visible={loading} message="Calibrated ensemble analyzing patient risk…" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeader
          eyebrow="Clinical Risk Engine"
          title="Patient Risk Assessment"
          sub="Enter clinical parameters to generate a calibrated, explainable readmission risk prediction."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

          {/* ── Left: Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {sections.map(({ title, icon, fields }, si) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="card-premium p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-base">{icon}</span>
                  <p className="label-premium !mb-0" style={{ color: '#D6B98C' }}>{title}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fields.map(({ key, label, type, options, labels: lbls, min, max, hint }) => (
                    <div key={key}>
                      <FieldLabel hint={hint}>{label}</FieldLabel>
                      {type === 'select'
                        ? <FormSelect name={key} value={form[key]} onChange={handleChange} options={options} labels={lbls} />
                        : <FormInput  name={key} value={form[key]} onChange={handleChange} min={min} max={max} />
                      }
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={loading}
                className="btn-primary flex-1 py-4 text-base rounded-xl">
                {loading ? 'Analyzing…' : 'Generate Prediction →'}
              </button>
              <button type="button" onClick={handleReset}
                className="btn-ghost px-6 py-4 rounded-xl">
                Reset
              </button>
            </div>
          </form>

          {/* ── Right: Results ── */}
          <div className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
            <AnimatePresence mode="wait">
              {result ? (
                <ResultPanel key="result" result={result} />
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="card-premium p-10 flex flex-col items-center justify-center text-center gap-5 min-h-[480px]"
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(214,185,140,0.08)', border: '1px solid rgba(214,185,140,0.15)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D6B98C" strokeWidth="1.5">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-cream text-lg mb-2">Awaiting Analysis</p>
                    <p className="text-muted text-sm leading-relaxed">
                      Fill in patient details and click<br />"Generate Prediction" to begin.
                    </p>
                  </div>

                  {/* Preview of what will appear */}
                  <div className="w-full space-y-2 opacity-30 pointer-events-none select-none">
                    <div className="h-2 rounded-full bg-emerald-500/40 w-3/4 mx-auto" />
                    <div className="h-2 rounded-full bg-amber-500/40 w-1/2 mx-auto" />
                    <div className="h-2 rounded-full bg-rose-500/40 w-1/4 mx-auto" />
                  </div>

                  <div className="flex gap-2 flex-wrap justify-center text-xs text-muted">
                    <span className="px-2 py-1 rounded bg-surface border border-border">Calibrated ML</span>
                    <span className="px-2 py-1 rounded bg-surface border border-border">Argmax Prediction</span>
                    <span className="px-2 py-1 rounded bg-surface border border-border">SHAP Insights</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
