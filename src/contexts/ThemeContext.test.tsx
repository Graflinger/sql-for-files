import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { ThemeProvider } from "./ThemeContext";
import { THEME_STORAGE, useTheme } from "./ThemeContextDef";

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function strictWrapper({ children }: { children: ReactNode }) {
  return (
    <StrictMode>
      <ThemeProvider>{children}</ThemeProvider>
    </StrictMode>
  );
}

describe("ThemeContext", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-theme-mode");
    document.documentElement.style.colorScheme = "light";

    const themeColorMeta =
      document.querySelector('meta[name="theme-color"]') ?? document.createElement("meta");
    themeColorMeta.setAttribute("name", "theme-color");
    themeColorMeta.setAttribute("content", "#2563eb");

    if (!themeColorMeta.parentElement) {
      document.head.append(themeColorMeta);
    }
  });

  it("throws when used outside provider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within ThemeProvider"
    );
  });

  it("defaults to system mode with light resolved theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.mode).toBe("system");
    expect(result.current.resolvedTheme).toBe("light");
    expect(document.documentElement.dataset.themeMode).toBe("system");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#f8fafc"
    );
  });

  it("reads stored mode from localStorage", () => {
    localStorage.setItem(THEME_STORAGE.KEY, "dark");

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.mode).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#020617"
    );
  });

  it("keeps the stored mode when mounted in StrictMode", () => {
    localStorage.setItem(THEME_STORAGE.KEY, "dark");

    const { result } = renderHook(() => useTheme(), { wrapper: strictWrapper });

    expect(result.current.mode).toBe("dark");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE.KEY)).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("persists explicit mode changes", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setMode("dark");
    });

    expect(localStorage.getItem(THEME_STORAGE.KEY)).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe(
      "#020617"
    );
  });

  it("cycles through system, light, and dark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.cycleMode();
    });
    expect(result.current.mode).toBe("light");

    act(() => {
      result.current.cycleMode();
    });
    expect(result.current.mode).toBe("dark");

    act(() => {
      result.current.cycleMode();
    });
    expect(result.current.mode).toBe("system");
  });

  it("resolves dark mode from system preference", () => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.mode).toBe("system");
    expect(result.current.resolvedTheme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("falls back to addListener for legacy matchMedia implementations", () => {
    const addListener = vi.fn();
    const removeListener = vi.fn();

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn(() => ({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addListener,
        removeListener,
      })),
    });

    renderHook(() => useTheme(), { wrapper });

    expect(addListener).toHaveBeenCalledOnce();
  });

  it("does not crash when localStorage access throws", () => {
    const getItemMock = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.mode).toBe("system");
    getItemMock.mockRestore();
  });
});
