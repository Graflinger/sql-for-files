export function sanitizeTableName(name: string): string {
  let sanitized = name.replace(/[^a-zA-Z0-9_]/g, "_");

  if (/^[0-9]/.test(sanitized)) {
    sanitized = `table_${sanitized}`;
  }

  return sanitized;
}

export function defaultTableNameFromFile(fileName: string): string {
  const baseName = fileName.replace(/\.[^/.]+$/, "");
  return sanitizeTableName(baseName);
}
