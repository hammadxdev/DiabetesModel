// src/components/ui/GlassCard.jsx
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`card-premium p-6 ${hover ? 'cursor-default' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
