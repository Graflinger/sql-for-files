import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useEffect, useRef } from "react";

import NotificationContainer from "./NotificationContainer";
import {
  NotificationProvider,
  useNotifications,
} from "../../contexts/NotificationContext";

/** Helper that adds notifications once via useEffect. */
function TestHarness({ addTypes }: { addTypes: string[] }) {
  const { addNotification } = useNotifications();
  const added = useRef(false);

  useEffect(() => {
    if (added.current) return;
    added.current = true;
    addTypes.forEach((type) =>
      addNotification({
        type: type as "success" | "error" | "info",
        title: `${type} notification`,
        autoClose: false,
      })
    );
  }, [addTypes, addNotification]);

  return <NotificationContainer />;
}

function renderWithNotifications(types: string[]) {
  let result: ReturnType<typeof render>;
  act(() => {
    result = render(
      <NotificationProvider>
        <TestHarness addTypes={types} />
      </NotificationProvider>
    );
  });
  return result!;
}

describe("NotificationContainer", () => {
  it("renders empty when no notifications", () => {
    render(
      <NotificationProvider>
        <NotificationContainer />
      </NotificationProvider>
    );

    // The container exists but has no notification children
    expect(screen.queryByText(/notification/i)).not.toBeInTheDocument();
  });

  it("renders multiple notifications", () => {
    renderWithNotifications(["success", "error"]);

    expect(screen.getByText("success notification")).toBeInTheDocument();
    expect(screen.getByText("error notification")).toBeInTheDocument();
  });

  it("renders in a fixed position overlay", () => {
    const { container } = render(
      <NotificationProvider>
        <NotificationContainer />
      </NotificationProvider>
    );

    const fixedDiv = container.querySelector(".fixed");
    expect(fixedDiv).toBeInTheDocument();
  });
});
