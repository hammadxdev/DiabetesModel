import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const STATS = [
  { value: 101766, suffix: '+', label: 'Patient Records',    decimals: 0 },
  { value: 107,    suffix: '',  label: 'Clinical Features',  decimals: 0 },
  { value: 75.9,   suffix: '%', label: 'High-Risk Recall',  decimals: 1 },
  { value: 0.659,  suffix: '',  label: 'ROC-AUC Score',     decimals: 3 },
];

const FEATURES = [
  {
    icon: '⚡',
    title: 'Stacked Ensemble',
    desc: 'HistGradientBoosting + GradientBoosting + RandomForest with isotonic calibration for reliable probability outputs.',
  },
  {
    icon: '🧠',
    title: 'Explainable AI',
    desc: 'Feature importance and SHAP-proxy analysis reveals exactly which clinical factors drive each individual prediction.',
  },
  {
    icon: '🎯',
    title: 'F2-Optimized Threshold',
    desc: 'Dynamic threshold tuned via precision-recall curves to maximize High Risk recall — no dangerous patients missed.',
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    desc: '13 live analytics APIs expose confusion matrices, ROC curves, calibration data, and model comparisons.',
  },
  {
    icon: '🔒',
    title: 'Bias-Free Predictions',
    desc: 'Protected attributes (race, gender) are removed at ingestion — the model focuses entirely on clinical evidence.',
  },
  {
    icon: '🏥',
    title: '130 US Hospitals',
    desc: 'Trained on the UCI Diabetes dataset from 130 US hospitals — representing real-world clinical diversity.',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22,1,0.36,1] } },
};

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY   = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOp  = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <div className="min-h-screen">

      {/* ── HERO ──────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(214,185,140,0.06) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.04) 0%, transparent 70%)' }} />
          <div className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 70%)' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#D6B98C 1px, transparent 1px), linear-gradient(90deg, #D6B98C 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <motion.div style={{ y: heroY, opacity: heroOp }}
          className="relative z-10 text-center max-w-4xl mx-auto px-6">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-semibold uppercase tracking-widest"
            style={{ background: 'rgba(214,185,140,0.08)', border: '1px solid rgba(214,185,140,0.2)', color: '#D6B98C' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse2" />
            Explainable AI Healthcare Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-bold leading-[1.08] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', color: '#F5E6D3' }}
          >
            Predict Diabetes<br />
            <span style={{ color: '#D6B98C' }}>Readmission Risk</span><br />
            <span className="text-muted" style={{ fontSize: '0.6em', fontWeight: 400, letterSpacing: '0.01em' }}>
              with Clinical Intelligence
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            An enterprise-grade ML system trained on 101K+ real patient records from 130 US hospitals.
            Stacked ensemble models with calibrated probabilities and explainable AI insights.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/predict" className="btn-primary px-8 py-3.5 text-base rounded-xl">
              Start Risk Analysis →
            </Link>
            <Link to="/analytics" className="btn-ghost px-8 py-3.5 text-base rounded-xl">
              View Analytics
            </Link>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 flex flex-col items-center gap-2 text-muted text-xs"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-5 h-8 rounded-full border border-border flex items-start justify-center pt-1.5"
            >
              <div className="w-1 h-1.5 rounded-full bg-muted" />
            </motion.div>
            Scroll to explore
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ────────────────────────────────────── */}
      <section className="py-16 border-y border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {STATS.map(({ value, suffix, label, decimals }) => (
              <motion.div key={label} variants={item} className="text-center">
                <p className="font-display font-bold text-4xl sm:text-5xl text-cream tracking-tight">
                  <AnimatedCounter to={value} suffix={suffix} decimals={decimals} />
                </p>
                <p className="text-muted text-xs mt-2 uppercase tracking-widest">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────── */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <p className="label-premium mb-3" style={{ color: '#D6B98C' }}>Platform Capabilities</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-cream tracking-tight">
            Enterprise clinical intelligence
          </h2>
          <p className="text-muted mt-3 max-w-xl">
            Everything your clinical team needs to understand, trust, and act on readmission risk predictions.
          </p>
        </motion.div>

        <motion.div
          variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {FEATURES.map(({ icon, title, desc }) => (
            <motion.div key={title} variants={item}
              className="card-premium p-6 group cursor-default"
            >
              <div className="text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 inline-block">{icon}</div>
              <h3 className="font-display font-semibold text-cream text-base mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────── */}
      <section className="py-16 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-2xl p-12 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(214,185,140,0.08) 0%, rgba(214,185,140,0.03) 100%)',
            border: '1px solid rgba(214,185,140,0.2)',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(214,185,140,0.08) 0%, transparent 70%)' }} />
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-cream mb-4">
            Ready to analyze patient risk?
          </h2>
          <p className="text-muted mb-8 max-w-lg mx-auto">
            Enter clinical parameters and receive calibrated, explainable readmission risk predictions in seconds.
          </p>
          <Link to="/predict" className="btn-primary px-10 py-4 text-base rounded-xl">
            Launch Prediction Dashboard →
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
