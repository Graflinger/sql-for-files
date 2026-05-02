import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { Lesson } from "../../types/learn";
import type { QueryResult } from "../../types/query";
import LessonContent from "./LessonContent";

const queryResult: QueryResult = {
  data: [{ value: 1 }],
  columns: ["value"],
  rowCount: 1,
  displayRowCount: 1,
  executionTime: 1,
  arrowTable: {},
  wasTruncated: false,
};

const firstLesson: Lesson = {
  id: "first-lesson",
  title: "First Lesson",
  content: "First lesson content.",
  challenge: {
    prompt: "Solve the first challenge.",
    validate: () => ({
      passed: true,
      message: "First answer is correct.",
    }),
  },
};

const secondLesson: Lesson = {
  id: "second-lesson",
  title: "Second Lesson",
  content: "Second lesson content.",
  challenge: {
    prompt: "Solve the second challenge.",
    validate: () => ({
      passed: true,
      message: "Second answer is correct.",
    }),
  },
};

function renderLessonContent(lesson: Lesson) {
  return (
    <LessonContent
      lesson={lesson}
      lessonNumber="01.01"
      chapterLabel="Getting started"
      lastResult={queryResult}
      onLoadData={vi.fn()}
      canLoadData={true}
      dataLoadUnavailableMessage="Database is not ready."
      isDataLoaded={false}
      onOpenInEditor={vi.fn()}
      onCompleteLesson={vi.fn()}
      onNext={vi.fn()}
      onPrevious={vi.fn()}
      hasNext={true}
      hasPrevious={false}
      isCompleted={false}
      onBack={vi.fn()}
    />
  );
}

describe("LessonContent", () => {
  it("resets challenge validation when the lesson changes", () => {
    const { rerender } = render(renderLessonContent(firstLesson));

    fireEvent.click(screen.getByRole("button", { name: "Check Answer" }));

    expect(screen.getByText("First answer is correct.")).toBeInTheDocument();

    rerender(renderLessonContent(secondLesson));

    expect(screen.queryByText("First answer is correct.")).not.toBeInTheDocument();
    expect(screen.getByText("Solve the second challenge.")).toBeInTheDocument();
  });
});
