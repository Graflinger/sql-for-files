import { createContext } from "react";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  cycleMode: () => void;
}

export const THEME_STORAGE_KEY = "ui-theme-mode";

export const THEME_STORAGE = {
  KEY: THEME_STORAGE_KEY,
} as const;

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);
