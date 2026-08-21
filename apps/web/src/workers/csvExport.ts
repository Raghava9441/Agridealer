import { callWorker } from './workerBus'
import type { CsvExportPayload } from './csv.worker'

/** Used by DataTable's export action — see shared/components/ui/DataTable.tsx. */
export async function exportToCsv(filename: string, payload: CsvExportPayload): Promise<void> {
  const worker = new Worker(new URL('./csv.worker.ts', import.meta.url), { type: 'module' })
  try {
    const csv = await callWorker<CsvExportPayload, string>(worker, 'csv-export', payload)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  } finally {
    worker.terminate()
  }
}
