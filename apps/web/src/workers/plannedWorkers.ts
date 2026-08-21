/**
 * Extension points for heavy client-side work that doesn't have a real
 * requirement yet — payload contracts are sketched so the shape of a
 * future worker is decided, but nothing here is implemented (a fake
 * do-nothing .worker.ts file would be worse than no file: it'd look real).
 * Build the same way csv.worker.ts + csvExport.ts was built: a `self.onmessage`
 * handler speaking the `WorkerRequest`/`WorkerResponse` envelope from
 * workerBus.ts, plus a thin main-thread wrapper that spawns the worker and
 * calls `callWorker()`.
 */

/** Excel (.xlsx) export — would need a real library (e.g. `exceljs`) inside the worker; not installed since nothing needs it yet. */
export interface ExcelExportPayload {
  sheetName: string
  columns: { key: string; header: string }[]
  rows: Record<string, unknown>[]
}

/** PDF generation (e.g. an invoice printout) — would need a real library (e.g. `pdf-lib`) inside the worker. */
export interface PdfGeneratePayload {
  templateId: string
  data: Record<string, unknown>
}

/** Client-side encryption of a payload before it's cached in IndexedDB (see workers/../offline). No crypto library chosen yet — Web Crypto API (native, no dependency) is the obvious first choice. */
export interface EncryptPayload {
  plaintext: string
}
