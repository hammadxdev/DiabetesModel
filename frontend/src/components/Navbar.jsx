import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineBars3 } from 'react-icons/hi2';

const links = [
  { to: '/',          label: 'Home' },
  { to: '/predict',   label: 'Predict' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/about',     label: 'About' },
];

export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-surface shadow-2xl border-b border-border/60' : 'bg-transparent border-b border-transparent'
        }`}
        style={scrolled ? { backdropFilter: 'blur(24px)' } : {}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-lg group-hover:shadow-accent/30 transition-shadow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <span className="font-display font-bold text-cream text-base tracking-tight">
                Diabetes<span style={{ color: '#D6B98C' }}>Guard</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded"
                style={{ background: 'rgba(214,185,140,0.12)', color: '#D6B98C', border: '1px solid rgba(214,185,140,0.25)' }}>
                AI
              </span>
            </Link>

            {/* Desktop links — centred */}
            <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {links.map(({ to, label }) => {
                const active = pathname === to;
                return (
                  <Link key={to} to={to}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                      ${active ? 'text-cream' : 'text-muted hover:text-cream'}`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: 'rgba(214,185,140,0.1)', border: '1px solid rgba(214,185,140,0.2)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* CTA + Hamburger */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link to="/predict"
                className="hidden md:inline-flex items-center gap-2 btn-primary py-2 px-4 text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Run Analysis
              </Link>
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2 rounded-lg text-muted hover:text-cream hover:bg-white/5 transition-all"
              >
                {open ? <HiOutlineXMark size={20} /> : <HiOutlineBars3 size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 glass-surface border-b border-border md:hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {links.map(({ to, label }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={to}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${pathname === to ? 'text-cream bg-accent/10' : 'text-muted hover:text-cream hover:bg-white/5'}`}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
              <div className="pt-2 pb-1">
                <Link to="/predict" className="btn-primary w-full py-3">Run Analysis</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
