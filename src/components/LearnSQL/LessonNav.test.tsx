import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LearnSQLProvider, useLearnSQL } from "../../contexts/LearnSQLContext";
import { chapters } from "../../data/lessons";
import LessonNav from "./LessonNav";

const firstChapter = chapters[0];
const firstLesson = firstChapter.lessons[0];

function LessonNavTestHarness() {
  const { completeLesson } = useLearnSQL();

  return (
    <>
      <button
        type="button"
        onClick={() => {
          firstChapter.lessons.forEach((lesson) => completeLesson(lesson.id));
        }}
      >
        Complete first chapter
      </button>
      <LessonNav onLessonSelect={() => undefined} />
    </>
  );
}

function renderLessonNav() {
  return render(
    <LearnSQLProvider>
      <LessonNavTestHarness />
    </LearnSQLProvider>
  );
}

describe("LessonNav", () => {
  it("allows individual chapters to be collapsed and expanded", async () => {
    const user = userEvent.setup();
    renderLessonNav();

    const chapterToggle = screen.getByRole("button", {
      name: `Toggle ${firstChapter.title} chapter`,
    });

    expect(screen.getByRole("button", { name: new RegExp(firstLesson.title, "i") })).toBeInTheDocument();
    expect(chapterToggle).toHaveAttribute("aria-expanded", "true");

    await user.click(chapterToggle);

    expect(chapterToggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: new RegExp(firstLesson.title, "i") })).not.toBeInTheDocument();

    await user.click(chapterToggle);

    expect(chapterToggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: new RegExp(firstLesson.title, "i") })).toBeInTheDocument();
  });

  it("automatically collapses a chapter when all of its lessons are completed", async () => {
    const user = userEvent.setup();
    renderLessonNav();

    const chapterToggle = screen.getByRole("button", {
      name: `Toggle ${firstChapter.title} chapter`,
    });

    await user.click(screen.getByRole("button", { name: "Complete first chapter" }));

    await waitFor(() => {
      expect(chapterToggle).toHaveAttribute("aria-expanded", "false");
    });

    expect(screen.queryByRole("button", { name: new RegExp(firstLesson.title, "i") })).not.toBeInTheDocument();
  });

  it("starts completed chapters in a collapsed state", () => {
    localStorage.setItem(
      "learn-sql-progress",
      JSON.stringify(firstChapter.lessons.map((lesson) => lesson.id))
    );

    renderLessonNav();

    const chapterToggle = screen.getByRole("button", {
      name: `Toggle ${firstChapter.title} chapter`,
    });

    expect(chapterToggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: new RegExp(firstLesson.title, "i") })).not.toBeInTheDocument();
  });
});
