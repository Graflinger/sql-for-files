import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Layout from "./Layout";
import { ThemeProvider } from "../../contexts/ThemeContext";

function renderLayout() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Layout>
          <div>Page content</div>
        </Layout>
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe("Layout", () => {
  it("renders the footer theme controls", () => {
    renderLayout();

    expect(screen.getByRole("group", { name: "Theme controls" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theme System" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theme Light" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theme Dark" })).toBeInTheDocument();
  });

  it("switches theme mode from the footer controls", async () => {
    const user = userEvent.setup();
    renderLayout();

    const lightButton = screen.getByRole("button", { name: "Theme Light" });
    const darkButton = screen.getByRole("button", { name: "Theme Dark" });

    await user.click(lightButton);
    expect(lightButton).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.themeMode).toBe("light");

    await user.click(darkButton);
    expect(darkButton).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dataset.themeMode).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("renders feedback link in the footer", () => {
    renderLayout();

    const feedbackLink = screen.getByRole("link", { name: "Feedback" });
    expect(feedbackLink).toBeInTheDocument();
    expect(feedbackLink).toHaveAttribute("href");
    expect(feedbackLink.getAttribute("href")).toContain("mailto:info@sqlforfiles.app");
  });
});
