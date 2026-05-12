// src/components/ui/LoadingOverlay.jsx
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingOverlay({ visible, message = 'Analyzing patient data...' }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(11,11,11,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="card-premium p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4"
          >
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
              <div className="absolute inset-2 rounded-full border border-accent/10" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-cream text-lg">AI Processing</p>
              <p className="text-muted text-sm mt-1">{message}</p>
            </div>
            {/* Animated dots */}
            <div className="flex gap-1.5">
              {[0,1,2].map(i => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
