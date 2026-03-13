import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  ThemeContext,
  THEME_STORAGE_KEY,
} from "./ThemeContextDef";
import type { ThemeMode, ResolvedTheme } from "./ThemeContextDef";

const THEME_MODE_ORDER: ThemeMode[] = ["system", "light", "dark"];
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";
const LIGHT_THEME_COLOR = "#f8fafc";
const DARK_THEME_COLOR = "#020617";

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "light";
  }

  try {
    return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  try {
    const storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeMode(storedMode) ? storedMode : "system";
  } catch (error) {
    console.error("Failed to read theme mode from localStorage:", error);
    return "system";
  }
}

function syncDocumentTheme(mode: ThemeMode, resolvedTheme: ResolvedTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.style.colorScheme = resolvedTheme;

  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  themeColorMeta?.setAttribute(
    "content",
    resolvedTheme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR
  );
}

/** ThemeProvider manages system-aware light and dark theme selection. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => getStoredThemeMode());
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() =>
    getSystemTheme()
  );

  const resolvedTheme = mode === "system" ? systemTheme : mode;

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    let mediaQueryList: MediaQueryList;

    try {
      mediaQueryList = window.matchMedia(DARK_MEDIA_QUERY);
    } catch {
      return undefined;
    }

    const handleChange = (event?: MediaQueryListEvent) => {
      setSystemTheme(
        event?.matches ?? mediaQueryList.matches ? "dark" : "light"
      );
    };

    handleChange();

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);

      return () => mediaQueryList.removeEventListener("change", handleChange);
    }

    mediaQueryList.addListener?.(handleChange);

    return () => mediaQueryList.removeListener?.(handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore write errors (e.g. quota exceeded, private mode)
    }
  }, [mode]);

  useEffect(() => {
    syncDocumentTheme(mode, resolvedTheme);
  }, [mode, resolvedTheme]);

  const setMode = useCallback((nextMode: ThemeMode) => {
    setModeState(nextMode);
  }, []);

  const cycleMode = useCallback(() => {
    setModeState((currentMode) => {
      const currentIndex = THEME_MODE_ORDER.indexOf(currentMode);
      return THEME_MODE_ORDER[(currentIndex + 1) % THEME_MODE_ORDER.length];
    });
  }, []);

  const value = useMemo(
    () => ({ mode, resolvedTheme, setMode, cycleMode }),
    [cycleMode, mode, resolvedTheme, setMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
