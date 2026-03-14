import { createContext, useContext } from "react";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

export const THEME_STORAGE_KEY = "ui-theme-mode";

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);

/** useTheme returns the active theme mode and resolved system theme. */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

export const THEME_STORAGE = {
  KEY: THEME_STORAGE_KEY,
};
