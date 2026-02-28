// Classification column category based on Arrow field type
export type ColumnCategory = "numeric" | "date" | "string" | "boolean" | "other";

// Stats for numeric columns (Int*, Uint*, Float*, Decimal)
export interface NumericStats {
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  mode: number | null;
  nullCount: number;
}

// Stats for date/timestamp columns (Date*, Timestamp*)
export interface DateStats {
  min: string | null;
  max: string | null;
  mean: string | null;
  median: string | null;
  mode: string | null;
  nullCount: number;
}

// Stats for string columns (Utf8, LargeUtf8)
export interface StringStats {
  minLength: number | null;
  maxLength: number | null;
  nullCount: number;
}

// Stats for boolean columns (Bool)
export interface BooleanStats {
  trueCount: number;
  falseCount: number;
  nullCount: number;
}

// Classification result for a single column
export interface ColumnClassification {
  columnName: string;
  category: ColumnCategory;
  arrowTypeName: string;
  stats: NumericStats | DateStats | StringStats | BooleanStats | null;
}

// Full classification result for a query
export interface ClassificationResult {
  columns: ColumnClassification[];
  totalRows: number;
  computationTime: number;
}
