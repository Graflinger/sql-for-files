import { describe, expect, it } from "vitest";

import { lessonByRoute, lessonPath } from "./index";

describe("lesson routes", () => {
  it("builds a shareable path for the execution-order chapter after window functions", () => {
    expect(lessonPath("execution-order-logical-order")).toBe("/editor/chapter8/01");
  });

  it("resolves a lesson from the execution-order chapter route", () => {
    expect(lessonByRoute("chapter8", "01")?.id).toBe("execution-order-logical-order");
  });

  it("builds a shareable lesson path", () => {
    expect(lessonPath("intro-order-by")).toBe("/editor/chapter1/03");
  });

  it("resolves a lesson from chapter and lesson segments", () => {
    expect(lessonByRoute("chapter1", "03")?.id).toBe("intro-order-by");
  });

  it("accepts zero-padded chapter segments", () => {
    expect(lessonByRoute("chapter01", "3")?.id).toBe("intro-order-by");
  });

  it("returns null for invalid lesson routes", () => {
    expect(lessonByRoute("chapter99", "01")).toBeNull();
    expect(lessonByRoute("intro", "01")).toBeNull();
  });
});
