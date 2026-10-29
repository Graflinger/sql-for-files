import { describe, expect, it } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import SEO from "./SEO";

function renderSEO(props: Partial<Parameters<typeof SEO>[0]> = {}, path = "/docs") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SEO title="Test Page" description="A test page description." {...props} />
    </MemoryRouter>
  );
}

describe("SEO", () => {
  it("writes a canonical URL without a trailing slash", async () => {
    renderSEO({ canonicalPath: "/docs/" });

    await waitFor(() => {
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://sqlforfiles.app/docs"
      );
    });
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "https://sqlforfiles.app/docs"
    );
  });

  it("falls back to the current path for the canonical URL", async () => {
    renderSEO({}, "/guides/");

    await waitFor(() => {
      expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://sqlforfiles.app/guides"
      );
    });
  });

  it("omits canonical and og:url when canonicalPath is null", async () => {
    renderSEO({ canonicalPath: null, robots: "noindex" });

    await waitFor(() => {
      expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    });
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.querySelector('meta[property="og:url"]')).toBeNull();
  });

  it("uses the name attribute for Twitter card tags", async () => {
    renderSEO();

    await waitFor(() => {
      expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image"
      );
    });
    expect(document.querySelector('meta[property="twitter:card"]')).toBeNull();
  });
});
