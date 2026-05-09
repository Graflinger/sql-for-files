import { describe, expect, it } from "vitest";

import { guides } from "./guides";
import { validLessonIds } from "./lessons";

describe("guides", () => {
  it("uses unique slugs", () => {
    const slugs = guides.map((guide) => guide.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has complete metadata and visible content", () => {
    guides.forEach((guide) => {
      expect(guide.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(guide.title).toBeTruthy();
      expect(guide.description.length).toBeGreaterThan(80);
      expect(guide.summary.length).toBeGreaterThan(40);
      expect(guide.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(guide.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(guide.keywords.length).toBeGreaterThanOrEqual(3);
      expect(guide.sections.length).toBeGreaterThanOrEqual(4);

      guide.sections.forEach((section) => {
        expect(section.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
        expect(section.title).toBeTruthy();
        expect(section.blocks.length).toBeGreaterThan(0);
      });
    });
  });

  it("references existing related guides and lessons", () => {
    const guideSlugs = new Set(guides.map((guide) => guide.slug));

    guides.forEach((guide) => {
      guide.relatedGuideSlugs.forEach((slug) => {
        expect(guideSlugs.has(slug)).toBe(true);
        expect(slug).not.toBe(guide.slug);
      });

      guide.relatedLessonIds.forEach((lessonId) => {
        expect(validLessonIds.has(lessonId)).toBe(true);
      });
    });
  });
});
