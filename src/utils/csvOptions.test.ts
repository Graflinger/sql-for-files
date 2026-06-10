import { describe, expect, it } from "vitest";

import { buildCsvOptionsSql } from "./csvOptions";

describe("buildCsvOptionsSql", () => {
  it("uses safe CSV auto type candidates by default", () => {
    expect(buildCsvOptionsSql()).toBe(
      ", auto_type_candidates=['NULL', 'BOOLEAN', 'BIGINT', 'DOUBLE', 'TIME', 'DATE', 'TIMESTAMP', 'VARCHAR']"
    );
  });

  it("generates timestamp formats and column type overrides", () => {
    expect(
      buildCsvOptionsSql({
        timestampformat: "%Y-%m-%dT%H:%M:%SZ",
        types: {
          "Due Month": "TIMESTAMP",
        },
      })
    ).toContain(
      "timestampformat='%Y-%m-%dT%H:%M:%SZ', types={'Due Month': 'TIMESTAMP'}"
    );
  });
});
