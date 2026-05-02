import { describe, expect, it } from "vitest";

import type { QueryResult } from "../../types/query";
import intro from "./01-intro";

function createQueryResult(overrides?: Partial<QueryResult>): QueryResult {
  return {
    data: [],
    columns: [],
    rowCount: 0,
    displayRowCount: 0,
    executionTime: 0,
    arrowTable: null,
    wasTruncated: false,
    ...overrides,
  };
}

describe("intro lessons", () => {
  it("accepts a complete employees table result for the first challenge", () => {
    const validation = intro.lessons[0].challenge?.validate(
      createQueryResult({
        columns: ["id", "name", "department", "salary", "hire_date"],
        rowCount: 8,
      })
    );

    expect(validation).toEqual({
      passed: true,
      message: "You retrieved all 8 employees with all columns.",
    });
  });

  it("rejects incomplete column selections for the first challenge", () => {
    const validation = intro.lessons[0].challenge?.validate(
      createQueryResult({
        columns: ["name", "department"],
        rowCount: 8,
      })
    );

    expect(validation).toEqual({
      passed: false,
      message: "Make sure you select all columns. Try using SELECT *.",
    });
  });
});
