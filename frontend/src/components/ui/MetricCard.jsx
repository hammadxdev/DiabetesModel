// src/components/ui/MetricCard.jsx
import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

export default function MetricCard({ label, value, suffix = '', decimals = 0, sub, color = '#D6B98C', icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="card-premium p-5 group"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="label-premium">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: `${color}14` }}>
            <Icon size={16} style={{ color }} />
          </div>
        )}
      </div>
      <p className="metric-value" style={{ color }}>
        <AnimatedCounter to={typeof value === 'number' ? value : 0} suffix={suffix} decimals={decimals} />
      </p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </motion.div>
  );
}
