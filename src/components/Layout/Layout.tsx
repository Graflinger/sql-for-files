import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

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
      <footer className="pb-8">
        {/* Privacy Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm">
            <svg
              className="w-4 h-4 text-green-600"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-sm text-slate-600 font-medium">
              Your data never leaves your device. All processing happens in your
              browser.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-slate-600">
            <Link
              to="/privacy"
              className="hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/legal" className="hover:text-blue-600 transition-colors">
              Legal Notice
            </Link>
            <span className="text-slate-300">•</span>
            <a
              href="mailto:info@sqlforfiles.app"
              className="hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="https://github.com/graflinger/sql-for-files"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
              title="View source code on GitHub (AGPL v3)"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Source Code
            </a>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">© 2026 SQL for Files</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
