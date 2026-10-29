import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../App";

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

describe("NotFound route", () => {
  it("renders a noindex not-found page for unknown URLs", async () => {
    renderApp("/this-page-does-not-exist");

    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeInTheDocument();
    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    });
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(screen.getByRole("link", { name: /Learn SQL Interactive lessons/i })).toHaveAttribute(
      "href",
      "/learn-sql"
    );
  });

  it("does not replace known public pages", () => {
    renderApp("/learn-sql");

    expect(screen.queryByRole("heading", { level: 1, name: "Page not found" })).toBeNull();
  });
});
