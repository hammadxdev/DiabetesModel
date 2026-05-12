import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="3">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-cream">DiabetesGuard AI</span>
        </div>
        <p>© 2026 · Muhammad Hammad · Fa-2023/BSCS/514 · CCP Project</p>
        <div className="flex gap-4">
          <Link to="/" className="hover:text-cream transition-colors">Home</Link>
          <Link to="/analytics" className="hover:text-cream transition-colors">Analytics</Link>
          <Link to="/about" className="hover:text-cream transition-colors">About</Link>
        </div>
      </div>
    </footer>
  );
}
