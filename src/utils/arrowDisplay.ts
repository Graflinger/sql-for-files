function getArrowTypeName(typeName: unknown): string {
  if (typeof typeName === "string") {
    return typeName.toLowerCase();
  }

  if (typeName && typeof typeName === "object" && "toString" in typeName) {
    return String(typeName).toLowerCase();
  }

  return "";
}

function toEpochMilliseconds(value: unknown): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  return null;
}

function formatDateValue(value: unknown): string | unknown {
  const epochMs = toEpochMilliseconds(value);
  if (epochMs === null) return value;

  return new Date(epochMs).toISOString().slice(0, 10);
}

function formatTimestampValue(value: unknown): string | unknown {
  const epochMs = toEpochMilliseconds(value);
  if (epochMs === null) return value;

  const iso = new Date(epochMs).toISOString();
  const base = iso.slice(0, 19).replace("T", " ");
  const milliseconds = iso.slice(19, 23);

  return milliseconds === ".000" ? base : `${base}${milliseconds}`;
}

/** Format Arrow date/timestamp values for user-facing display and CSV export. */
export function formatArrowValueForDisplay(
  value: unknown,
  typeName: unknown
): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  const arrowTypeName = getArrowTypeName(typeName);

  if (arrowTypeName.startsWith("date")) {
    return formatDateValue(value);
  }

  if (arrowTypeName.startsWith("timestamp")) {
    return formatTimestampValue(value);
  }

  return value;
}
