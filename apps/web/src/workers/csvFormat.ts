/**
 * Pure CSV-building logic, extracted from csv.worker.ts so it's testable
 * without a real Worker/jsdom worker polyfill — the worker file itself is
 * just message-handling glue around these two functions.
 */
export interface CsvExportPayload {
  columns: string[]
  rows: Record<string, unknown>[]
}

export function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export function toCsv({ columns, rows }: CsvExportPayload): string {
  const header = columns.map(escapeCsvCell).join(',')
  const body = rows.map((row) => columns.map((col) => escapeCsvCell(row[col])).join(',')).join('\n')
  return `${header}\n${body}`
}
