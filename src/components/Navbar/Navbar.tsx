import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccess } from "../../contexts/AccessContext";

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
  const [loginOpen, setLoginOpen] = useState(false);
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const loginMenuRef = useRef<HTMLDivElement>(null);
  const { level, setLevel } = useAccess();

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const levelBadge = {
    guest: {
      label: "Free",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    },
    user: {
      label: "User",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    paid: {
      label: "Paid",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
  } as const;

  useEffect(() => {
    if (!loginOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (loginMenuRef.current?.contains(target)) return;
      if (loginButtonRef.current?.contains(target)) return;
      setLoginOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLoginOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [loginOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      setLoginOpen(false);
    }
  }, [mobileMenuOpen]);

  const handleLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLevel = event.target.value as "guest" | "user" | "paid";
    setLevel(nextLevel);
    setLoginOpen(false);
  };

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
              <span className="block text-base sm:text-xl font-bold text-slate-800 truncate">
                SQL for Files
              </span>
              <p className="text-xs text-slate-500 hidden sm:block">
                Query data in your browser
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
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
            </div>

            {/* Login Button */}
            <div className="relative">
              <button
                ref={loginButtonRef}
                type="button"
                onClick={() => setLoginOpen((prev) => !prev)}
                aria-label="Login"
                aria-expanded={loginOpen}
                className="px-2 sm:px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors duration-200 border border-slate-300 text-slate-700 hover:bg-slate-100"
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
                    d="M5.121 17.804A9 9 0 1118 9a9 9 0 01-12.879 8.804z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.5 19.5a6.5 6.5 0 00-11 0"
                  />
                </svg>
                <span className="hidden sm:inline">Login</span>
                <span
                  className={`hidden md:inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border ${
                    levelBadge[level].className
                  }`}
                >
                  {levelBadge[level].label}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                    loginOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {loginOpen && (
                <div
                  ref={loginMenuRef}
                  className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white shadow-xl p-3 z-50"
                >
                  <select
                    aria-label="Select access level"
                    value={level}
                    onChange={handleLevelChange}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="guest">Free (no login)</option>
                    <option value="user">User (logged in)</option>
                    <option value="paid">Paid (subscriber)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Feedback Button */}
            <a
              href={feedbackMailto}
              className="hidden lg:flex px-4 py-2 rounded-lg text-sm font-semibold items-center gap-2 transition-all duration-200 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
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
