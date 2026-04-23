import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useTheme } from "../../contexts/ThemeContextDef";
import { useLearnSQL } from "../../contexts/LearnSQLContext";

/**
 * Navbar Component
 *
 * Clean navigation bar with glassmorphism effect.
 * - Desktop: Full navigation with all links visible
 * - Mobile: Burger menu with collapsible navigation
 */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useTheme();
  const { openPanel, togglePanel, panelOpen } = useLearnSQL();

  const isEditorPage = location.pathname === "/editor" || location.pathname.startsWith("/editor/");
  const isLearnSQLActive = isEditorPage && panelOpen;

  const isActive = (path: string) => {
    if (path === "/editor") {
      return isEditorPage;
    }

    return location.pathname === path;
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const handleLearnSQLClick = () => {
    if (isEditorPage) {
      togglePanel();
    } else {
      openPanel();
      navigate("/editor");
    }
    closeMobileMenu();
  };

  const navLinkClass = (path: string) => `
    px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
    ${
      isActive(path)
        ? "bg-slate-900 text-white dark:bg-blue-500 dark:text-slate-950"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
    }
  `;

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

            <button
              onClick={handleLearnSQLClick}
              className={`
                ml-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-150
                ${
                  isLearnSQLActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                }
              `}
              title={
                isEditorPage
                  ? panelOpen
                    ? "Close Learn SQL panel"
                    : "Open Learn SQL panel"
                  : "Open Learn SQL in the editor"
              }
            >
              <svg
                className="w-4 h-4"
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
              Learn SQL
            </button>
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
            <button
              onClick={handleLearnSQLClick}
              className={`
                block w-full rounded-md px-3 py-1.5 text-left text-sm font-medium transition-colors duration-150
                ${
                  isLearnSQLActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
                }
              `}
              title={
                isEditorPage
                  ? panelOpen
                    ? "Close Learn SQL panel"
                    : "Open Learn SQL panel"
                  : "Open Learn SQL in the editor"
              }
            >
              Learn SQL
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
