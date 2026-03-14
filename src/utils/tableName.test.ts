import { describe, it, expect } from "vitest";
import { sanitizeTableName, defaultTableNameFromFile } from "./tableName";

describe("sanitizeTableName", () => {
  it("returns alphanumeric names unchanged", () => {
    expect(sanitizeTableName("users")).toBe("users");
    expect(sanitizeTableName("my_table")).toBe("my_table");
  });

  it("replaces special characters with underscores", () => {
    expect(sanitizeTableName("my-table")).toBe("my_table");
    expect(sanitizeTableName("my table")).toBe("my_table");
    expect(sanitizeTableName("my.table")).toBe("my_table");
    expect(sanitizeTableName("my@table!")).toBe("my_table_");
  });

  it("prepends table_ when name starts with a digit", () => {
    expect(sanitizeTableName("123data")).toBe("table_123data");
    expect(sanitizeTableName("0_metrics")).toBe("table_0_metrics");
  });

  it("does not prepend table_ when name starts with a letter", () => {
    expect(sanitizeTableName("data123")).toBe("data123");
  });

  it("handles names that start with underscores", () => {
    expect(sanitizeTableName("_private")).toBe("_private");
  });

  it("handles empty string", () => {
    expect(sanitizeTableName("")).toBe("");
  });

  it("handles names with only special characters", () => {
    expect(sanitizeTableName("---")).toBe("___");
  });

  it("handles unicode characters", () => {
    expect(sanitizeTableName("café")).toBe("caf_");
    expect(sanitizeTableName("über")).toBe("_ber");
  });

  it("handles names with multiple consecutive special chars", () => {
    expect(sanitizeTableName("a--b..c")).toBe("a__b__c");
  });
});

describe("defaultTableNameFromFile", () => {
  it("strips .csv extension", () => {
    expect(defaultTableNameFromFile("users.csv")).toBe("users");
  });

  it("strips .json extension", () => {
    expect(defaultTableNameFromFile("data.json")).toBe("data");
  });

  it("strips .parquet extension", () => {
    expect(defaultTableNameFromFile("metrics.parquet")).toBe("metrics");
  });

  it("strips only the last extension", () => {
    expect(defaultTableNameFromFile("my.data.csv")).toBe("my_data");
  });

  it("sanitizes the resulting name", () => {
    expect(defaultTableNameFromFile("my-file.csv")).toBe("my_file");
    expect(defaultTableNameFromFile("2024-data.csv")).toBe("table_2024_data");
  });

  it("handles file names with no extension", () => {
    expect(defaultTableNameFromFile("noext")).toBe("noext");
  });

  it("handles file names with spaces", () => {
    expect(defaultTableNameFromFile("my file.csv")).toBe("my_file");
  });

  it("handles file names that are just an extension", () => {
    expect(defaultTableNameFromFile(".csv")).toBe("");
  });
});
