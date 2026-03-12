export function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

export function quoteStringLiteral(value: string): string {
  return `'${escapeSqlString(value)}'`;
}

export function quoteIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}
