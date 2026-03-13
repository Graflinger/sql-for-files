import { useContext } from "react";
import { ThemeContext, THEME_STORAGE } from "./ThemeContextDef";

export { THEME_STORAGE };

/** useTheme returns the active theme mode and resolved system theme. */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
