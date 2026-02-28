import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import {
  NotificationProvider,
  useNotifications,
} from "./NotificationContext";

function wrapper({ children }: { children: ReactNode }) {
  return <NotificationProvider>{children}</NotificationProvider>;
}

describe("NotificationContext", () => {
  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useNotifications());
    }).toThrow("useNotifications must be used within NotificationProvider");
  });

  it("starts with empty notifications", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });
    expect(result.current.notifications).toEqual([]);
  });

  it("adds a notification and returns an id", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    let id: string;
    act(() => {
      id = result.current.addNotification({
        type: "success",
        title: "Done!",
      });
    });

    expect(id!).toBeDefined();
    expect(typeof id!).toBe("string");
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe("Done!");
    expect(result.current.notifications[0].type).toBe("success");
  });

  it("sets autoClose=true for success notifications", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({ type: "success", title: "OK" });
    });

    expect(result.current.notifications[0].autoClose).toBe(true);
  });

  it("sets autoClose=true for adding notifications", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({ type: "adding", title: "Adding..." });
    });

    expect(result.current.notifications[0].autoClose).toBe(true);
  });

  it("sets autoClose=true for processing notifications", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({
        type: "processing",
        title: "Processing...",
      });
    });

    expect(result.current.notifications[0].autoClose).toBe(true);
  });

  it("does not set autoClose for error notifications", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({ type: "error", title: "Oops" });
    });

    // error notifications should not have autoClose unless explicitly set
    expect(result.current.notifications[0].autoClose).toBe(false);
  });

  it("removes a notification by id", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    let id: string;
    act(() => {
      id = result.current.addNotification({ type: "info", title: "Info" });
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(id!);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it("updates a notification", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    let id: string;
    act(() => {
      id = result.current.addNotification({ type: "info", title: "Loading" });
    });

    act(() => {
      result.current.updateNotification(id!, {
        type: "success",
        title: "Loaded!",
      });
    });

    expect(result.current.notifications[0].type).toBe("success");
    expect(result.current.notifications[0].title).toBe("Loaded!");
  });

  it("handles multiple notifications", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({ type: "info", title: "First" });
      result.current.addNotification({ type: "error", title: "Second" });
      result.current.addNotification({ type: "success", title: "Third" });
    });

    expect(result.current.notifications).toHaveLength(3);
  });

  it("auto-closes notifications after duration", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({
        type: "success",
        title: "Auto close",
        duration: 5000,
      });
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(5001);
    });

    expect(result.current.notifications).toHaveLength(0);
    vi.useRealTimers();
  });

  it("sets default duration of 10000ms", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    act(() => {
      result.current.addNotification({ type: "success", title: "Default" });
    });

    expect(result.current.notifications[0].duration).toBe(10000);
  });

  it("generates unique ids for each notification", () => {
    const { result } = renderHook(() => useNotifications(), { wrapper });

    const ids: string[] = [];
    act(() => {
      ids.push(result.current.addNotification({ type: "info", title: "A" }));
      ids.push(result.current.addNotification({ type: "info", title: "B" }));
    });

    expect(ids[0]).not.toBe(ids[1]);
  });
});
