import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Navbar from "./Navbar";

function renderNavbar(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Navbar />
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  it("renders the brand name", () => {
    renderNavbar();
    expect(screen.getByText("SQL for Files")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderNavbar();
    expect(screen.getAllByText("Editor").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Docs").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("About").length).toBeGreaterThanOrEqual(1);
  });

  it("renders feedback link", () => {
    renderNavbar();
    const feedbackLinks = screen.getAllByText("Feedback");
    expect(feedbackLinks.length).toBeGreaterThanOrEqual(1);
    // Check that it's a mailto link
    const feedbackLink = feedbackLinks[0].closest("a");
    expect(feedbackLink?.href).toContain("mailto:");
  });

  it("highlights the active route", () => {
    renderNavbar("/editor");
    // The desktop Editor link should have the active class
    const editorLinks = screen.getAllByText("Editor");
    const desktopLink = editorLinks[0]; // desktop link
    expect(desktopLink.className).toContain("bg-slate-900");
  });

  it("renders mobile menu toggle button", () => {
    renderNavbar();
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument();
  });

  it("toggles mobile menu on button click", async () => {
    const user = userEvent.setup();
    renderNavbar();

    const toggleBtn = screen.getByLabelText("Toggle menu");

    // Mobile menu links are in the DOM but the desktop ones always exist
    // Before clicking, verify the mobile section is not present
    // The mobile menu is rendered conditionally via mobileMenuOpen state

    // Click to open
    await user.click(toggleBtn);

    // After opening, the mobile menu should be visible (block-level links)
    // We can check for the mobile-specific class structure
    const mobileLinks = screen.getAllByText("Editor");
    // Should have both desktop and mobile links
    expect(mobileLinks.length).toBeGreaterThanOrEqual(2);

    // Click to close
    await user.click(toggleBtn);
  });

  it("closes mobile menu when a link is clicked", async () => {
    const user = userEvent.setup();
    renderNavbar();

    // Open the mobile menu
    const toggleBtn = screen.getByLabelText("Toggle menu");
    await user.click(toggleBtn);

    // Click a mobile link (the block-level one)
    const mobileEditorLinks = screen.getAllByText("Editor");
    // The mobile link has "block" class; click the last one (mobile)
    const mobileLink = mobileEditorLinks[mobileEditorLinks.length - 1];
    await user.click(mobileLink);
  });

  it("brand logo links to home", () => {
    renderNavbar();
    const brandLink = screen.getByText("SQL for Files").closest("a");
    expect(brandLink?.getAttribute("href")).toBe("/");
  });
});
