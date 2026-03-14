import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useTheme } from "../../contexts/ThemeContextDef";

/**
 * Navbar Component
 *
 * Clean navigation bar with glassmorphism effect.
 * - Desktop: Full navigation with all links visible
 * - Mobile: Burger menu with collapsible navigation
 */
export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useTheme();

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinkClass = (path: string) => `
    px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
    ${
      isActive(path)
        ? "bg-slate-900 text-white dark:bg-blue-500 dark:text-slate-950"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
    }
  `;

  const feedbackMailto = `mailto:info@sqlforfiles.app?subject=${encodeURIComponent(
    "SQL for Files - Feedback"
  )}&body=${encodeURIComponent(
    `Hi,

I'd like to share feedback about SQL for Files:

[Please describe your feedback, suggestions, or issues here]

---
Browser: ${navigator.userAgent}
Page: ${window.location.href}
`
  )}`;

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            to="/"
            className="flex flex-shrink-0 items-center gap-2.5"
            onClick={closeMobileMenu}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <svg
                className="h-4.5 w-4.5 text-white"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              SQL for Files
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            <Link to="/editor" className={navLinkClass("/editor")}>
              Editor
            </Link>
            <Link to="/docs" className={navLinkClass("/docs")}>
              Docs
            </Link>
            <Link to="/" className={navLinkClass("/")}>
              About
            </Link>

            <a
              href={feedbackMailto}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Feedback
            </a>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="space-y-1 border-t border-slate-200/60 py-3 lg:hidden dark:border-slate-800/80">
            <Link
              to="/editor"
              onClick={closeMobileMenu}
              className={`${navLinkClass("/editor")} block`}
            >
              Editor
            </Link>
            <Link
              to="/docs"
              onClick={closeMobileMenu}
              className={`${navLinkClass("/docs")} block`}
            >
              Docs
            </Link>
            <Link to="/" onClick={closeMobileMenu} className={`${navLinkClass("/")} block`}>
              About
            </Link>
            <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
              <a
                href={feedbackMailto}
                onClick={closeMobileMenu}
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Feedback
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
