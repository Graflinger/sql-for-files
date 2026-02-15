import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0"
            onClick={closeMobileMenu}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4.5 h-4.5 text-white"
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
            <span className="text-base font-semibold text-slate-900 tracking-tight">
              SQL for Files
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/editor"
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
                ${
                  isActive("/editor")
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              Editor
            </Link>
            <Link
              to="/docs"
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
                ${
                  isActive("/docs")
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              Docs
            </Link>
            <Link
              to="/"
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
                ${
                  isActive("/")
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              About
            </Link>

            <span className="w-px h-4 bg-slate-200 mx-2" />

            {/* Feedback Button */}
            <a
              href={feedbackMailto}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150"
            >
              Feedback
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 space-y-1 border-t border-slate-200/60">
            <Link
              to="/editor"
              onClick={closeMobileMenu}
              className={`
                block px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150
                ${
                  isActive("/editor")
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              Editor
            </Link>
            <Link
              to="/docs"
              onClick={closeMobileMenu}
              className={`
                block px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150
                ${
                  isActive("/docs")
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              Docs
            </Link>
            <Link
              to="/"
              onClick={closeMobileMenu}
              className={`
                block px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150
                ${
                  isActive("/")
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }
              `}
            >
              About
            </Link>

            <div className="pt-2 border-t border-slate-100">
              <a
                href={feedbackMailto}
                onClick={closeMobileMenu}
                className="block px-3 py-2.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-150"
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
