import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Notification from "./Notification";
import {
  NotificationProvider,
} from "../../contexts/NotificationContext";
import type { Notification as NotificationType } from "../../contexts/NotificationContext";

function renderNotification(
  overrides: Partial<NotificationType> = {}
) {
  const notification: NotificationType = {
    id: "test-id",
    type: "success",
    title: "Test Notification",
    ...overrides,
  };

  return render(
    <NotificationProvider>
      <Notification notification={notification} />
    </NotificationProvider>
  );
}

describe("Notification", () => {
  it("renders the title", () => {
    renderNotification({ title: "Hello World" });
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders the message when provided", () => {
    renderNotification({
      title: "Title",
      message: "This is a message",
    });
    expect(screen.getByText("This is a message")).toBeInTheDocument();
  });

  it("does not render message when not provided", () => {
    renderNotification({ title: "Title Only" });
    expect(screen.queryByText("This is a message")).not.toBeInTheDocument();
  });

  it("renders a close button", () => {
    renderNotification();
    expect(screen.getByLabelText("Close notification")).toBeInTheDocument();
  });

  it("shows 'Show details' button when error is present", () => {
    renderNotification({
      type: "error",
      title: "Error occurred",
      error: "Stack trace here",
    });
    expect(screen.getByText("Show details")).toBeInTheDocument();
  });

  it("toggles error details on click", async () => {
    const user = userEvent.setup();
    renderNotification({
      type: "error",
      title: "Error",
      error: "Detailed error info",
    });

    // Details should not be visible initially
    expect(screen.queryByText("Detailed error info")).not.toBeInTheDocument();

    // Click "Show details"
    await user.click(screen.getByText("Show details"));
    expect(screen.getByText("Detailed error info")).toBeInTheDocument();
    expect(screen.getByText("Hide details")).toBeInTheDocument();

    // Click "Hide details"
    await user.click(screen.getByText("Hide details"));
    expect(screen.queryByText("Detailed error info")).not.toBeInTheDocument();
  });

  it("renders success notification with green styling", () => {
    const { container } = renderNotification({ type: "success" });
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("bg-green-50");
  });

  it("renders error notification with red styling", () => {
    const { container } = renderNotification({ type: "error" });
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("bg-red-50");
  });

  it("renders info notification with blue styling", () => {
    const { container } = renderNotification({ type: "info" });
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("bg-blue-50");
  });

  it("renders progress bar when autoClose is true", () => {
    const { container } = renderNotification({
      autoClose: true,
      duration: 5000,
    });
    // Look for the progress bar's animated div
    const progressBars = container.querySelectorAll('[style*="animation"]');
    expect(progressBars.length).toBeGreaterThanOrEqual(1);
  });

  it("does not render progress bar when autoClose is false", () => {
    const { container } = renderNotification({
      type: "error",
      autoClose: false,
    });
    const shrinkAnimation = container.querySelector('[style*="shrink"]');
    expect(shrinkAnimation).toBeNull();
  });
});
