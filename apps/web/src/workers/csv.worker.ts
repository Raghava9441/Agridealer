/// <reference lib="webworker" />
import type { WorkerRequest, WorkerResponse } from './workerBus'
import { toCsv, type CsvExportPayload } from './csvFormat'

export type { CsvExportPayload }

self.onmessage = (event: MessageEvent<WorkerRequest<CsvExportPayload>>) => {
  const { id, type, payload } = event.data
  if (type !== 'csv-export') return

  try {
    const result = toCsv(payload)
    self.postMessage({ id, ok: true, result } satisfies WorkerResponse<string>)
  } catch (err) {
    self.postMessage({
      id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    } satisfies WorkerResponse<string>)
  }
}
