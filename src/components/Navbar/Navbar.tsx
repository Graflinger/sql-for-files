import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Navbar Component
 *
 * Modern navigation bar with links to main pages
 * - Desktop: Full navigation with all links visible
 * - Mobile: Burger menu with collapsible navigation
 */
export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Feedback email template
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
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            onClick={closeMobileMenu}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                width="24"
                height="24"
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
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-slate-800 truncate">
                SQL for Files
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Query data in your browser
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/editor"
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors duration-200
                ${
                  isActive("/editor")
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <svg
                className="w-4 h-4"
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
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              SQL Editor
            </Link>
            <Link
              to="/docs"
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors duration-200
                ${
                  isActive("/docs")
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <svg
                className="w-4 h-4"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Docs
            </Link>
            <Link
              to="/"
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors duration-200
                ${
                  isActive("/")
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <svg
                className="w-4 h-4"
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              About
            </Link>

            {/* Feedback Button */}
            <a
              href={feedbackMailto}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
            >
              <svg
                className="w-4 h-4"
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Feedback
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t border-slate-200">
            <Link
              to="/editor"
              onClick={closeMobileMenu}
              className={`
                block px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors duration-200
                ${
                  isActive("/editor")
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              SQL Editor
            </Link>
            <Link
              to="/docs"
              onClick={closeMobileMenu}
              className={`
                block px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors duration-200
                ${
                  isActive("/docs")
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Docs
            </Link>
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`
                block px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-3 transition-colors duration-200
                ${
                  isActive("/")
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }
              `}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              About
            </Link>

            {/* Feedback Button - Mobile */}
            <a
              href={feedbackMailto}
              onClick={closeMobileMenu}
              className="block px-4 py-3 rounded-lg text-sm font-semibold flex items-center gap-3 transition-all duration-200 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send Feedback
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
