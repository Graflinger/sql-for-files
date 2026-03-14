import { useTheme } from "../../contexts/ThemeContextDef";
import type { ThemeMode } from "../../contexts/ThemeContextDef";

interface ThemeOption {
  label: string;
  value: ThemeMode;
}

const THEME_OPTIONS: ThemeOption[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];

function SystemIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4.75 6.75A2.75 2.75 0 017.5 4h9A2.75 2.75 0 0119.25 6.75v6.5A2.75 2.75 0 0116.5 16h-2.75l1 2h1.5a.75.75 0 010 1.5h-8a.75.75 0 010-1.5h1.5l1-2H7.5a2.75 2.75 0 01-2.75-2.75v-6.5zM6.25 7v6h11.5V7H6.25z"
      />
    </svg>
  );
}

function SunIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 3v1.75m0 14.5V21m9-9h-1.75M4.75 12H3m15.364 6.364-1.237-1.237M6.873 6.873 5.636 5.636m12.728 0-1.237 1.237M6.873 17.127l-1.237 1.237M15.25 12a3.25 3.25 0 11-6.5 0 3.25 3.25 0 016.5 0z"
      />
    </svg>
  );
}

function MoonIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 3a6 6 0 009 9 9 9 0 11-9-9Z"
      />
    </svg>
  );
}

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === "system") {
    return <SystemIcon />;
  }

  if (mode === "dark") {
    return <MoonIcon />;
  }

  return <SunIcon />;
}

/** FooterThemeSwitcher renders compact system, light, and dark theme controls. */
export default function FooterThemeSwitcher() {
  const { mode, resolvedTheme, setMode } = useTheme();

  const buttonClass = (selected: boolean) =>
    `flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-150 ${
      selected
        ? "bg-slate-900 text-white shadow-sm dark:bg-blue-400 dark:text-slate-950"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    }`;

  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-full border border-slate-200/80 bg-white/70 p-0.5 shadow-sm shadow-slate-200/50 backdrop-blur-sm dark:border-slate-800/90 dark:bg-slate-900/75 dark:shadow-black/20"
      role="group"
      aria-label="Theme controls"
    >
      {THEME_OPTIONS.map((option) => {
        const isSelected = mode === option.value;
        const title = option.value === "system" ? `System (${resolvedTheme})` : option.label;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setMode(option.value)}
            className={buttonClass(isSelected)}
            aria-label={`Theme ${option.label}`}
            aria-pressed={isSelected}
            title={title}
          >
            <ThemeIcon mode={option.value} />
          </button>
        );
      })}
    </div>
  );
}
