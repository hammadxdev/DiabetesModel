// src/components/ui/SectionHeader.jsx
import { motion } from 'framer-motion';

export default function SectionHeader({ eyebrow, title, sub, centered = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-10 ${centered ? 'text-center' : ''}`}
    >
      {eyebrow && (
        <p className="label-premium mb-3" style={{ color: '#D6B98C' }}>{eyebrow}</p>
      )}
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream tracking-tight leading-tight">
        {title}
      </h2>
      {sub && <p className="mt-2 text-sm text-muted max-w-xl">{sub}</p>}
    </motion.div>
  );
}
