export interface WorkerRequest<TPayload = unknown> {
  id: string
  type: string
  payload: TPayload
}

export interface WorkerResponse<TResult = unknown> {
  id: string
  ok: boolean
  result?: TResult
  error?: string
}

/**
 * Generic typed RPC over `postMessage` — every worker in workers/ speaks
 * this same request/response envelope, so business code never touches
 * `postMessage`/`onmessage` directly. Business logic stays out of the
 * worker's message-handling boilerplate and vice versa (see csv.worker.ts).
 */
export function callWorker<TPayload, TResult>(worker: Worker, type: string, payload: TPayload): Promise<TResult> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID()

    function handleMessage(event: MessageEvent<WorkerResponse<TResult>>) {
      if (event.data.id !== id) return
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', handleError)
      if (event.data.ok) resolve(event.data.result as TResult)
      else reject(new Error(event.data.error ?? 'Worker error'))
    }
    function handleError(event: ErrorEvent) {
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', handleError)
      reject(event.error instanceof Error ? event.error : new Error(event.message))
    }

    worker.addEventListener('message', handleMessage)
    worker.addEventListener('error', handleError)
    worker.postMessage({ id, type, payload } satisfies WorkerRequest<TPayload>)
  })
}
