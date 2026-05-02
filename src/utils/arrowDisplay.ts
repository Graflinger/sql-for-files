function getArrowTypeName(typeName: unknown): string {
  if (typeof typeName === "string") {
    return typeName.toLowerCase();
  }

  if (typeName && typeof typeName === "object" && "toString" in typeName) {
    return String(typeName).toLowerCase();
  }

  return "";
}

function getDecimalScale(typeName: unknown, arrowTypeName: string): number | null {
  if (
    typeName &&
    typeof typeName === "object" &&
    "scale" in typeName &&
    typeof typeName.scale === "number"
  ) {
    return typeName.scale;
  }

  const scaleMatch = arrowTypeName.match(/^decimal\[\d+e\+?(\d+)\]$/);
  if (!scaleMatch) return null;

  return Number(scaleMatch[1]);
}

function getUnscaledDecimalString(value: unknown): string | null {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && Number.isInteger(value)
      ? value.toString()
      : null;
  }

  if (typeof value === "string") {
    return /^-?\d+$/.test(value) ? value : null;
  }

  if (value && typeof value === "object" && "toString" in value) {
    const stringValue = String(value);
    return /^-?\d+$/.test(stringValue) ? stringValue : null;
  }

  return null;
}

function formatDecimalValue(value: unknown, scale: number): string | unknown {
  const unscaled = getUnscaledDecimalString(value);
  if (unscaled === null || scale < 0) return value;
  if (scale === 0) return unscaled;

  const sign = unscaled.startsWith("-") ? "-" : "";
  const digits = sign ? unscaled.slice(1) : unscaled;
  const padded = digits.padStart(scale + 1, "0");
  const integerPart = padded.slice(0, -scale);
  const fractionalPart = padded.slice(-scale);

  return `${sign}${integerPart}.${fractionalPart}`;
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

  if (arrowTypeName.startsWith("decimal")) {
    const scale = getDecimalScale(typeName, arrowTypeName);
    return scale === null ? value : formatDecimalValue(value, scale);
  }

  return value;
}
