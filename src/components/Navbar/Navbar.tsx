import { Link, useLocation } from "react-router-dom";

/**
 * Navbar Component
 *
 * Modern navigation bar with links to main pages
 */
export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-white"
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
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                SQL for Files
              </h1>
              <p className="text-xs text-slate-500">
                Query data in your browser
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200
                ${isActive("/")
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
                px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200
                ${isActive("/docs")
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
              to="/about"
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200
                ${isActive("/about")
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
        </div>
      </div>
    </nav>
  );
}
