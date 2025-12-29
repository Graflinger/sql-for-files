import type { ReactNode } from 'react';
import Navbar from '../Navbar/Navbar';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout Component
 *
 * Wraps all pages with consistent navigation and footer
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Navbar />
      <main>{children}</main>
      <footer className="mt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
          <svg className="w-4 h-4 text-green-600" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="text-sm text-slate-600 font-medium">
            Your data never leaves your device. All processing happens in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
