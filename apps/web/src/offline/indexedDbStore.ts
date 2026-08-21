/**
 * Thin native-IndexedDB wrapper — no dependency (`idb` etc.) for what's
 * currently a handful of get/set/delete/getAll calls. Used by syncQueue.ts;
 * available directly for any future offline cache (e.g. a cached product
 * catalogue for the counter-speed lookups mentioned in queryClient.ts).
 */
export class IndexedDbStore {
  constructor(
    private readonly dbName: string,
    private readonly storeName: string,
    private readonly version = 1,
  ) {}

  private openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(this.storeName)) {
          request.result.createObjectStore(this.storeName)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error as DOMException)
    })
  }

  async get<T>(key: string): Promise<T | undefined> {
    const db = await this.openDb()
    return new Promise((resolve, reject) => {
      const req = db.transaction(this.storeName, 'readonly').objectStore(this.storeName).get(key)
      req.onsuccess = () => resolve(req.result as T | undefined)
      req.onerror = () => reject(req.error as DOMException)
    })
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      tx.objectStore(this.storeName).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error as DOMException)
    })
  }

  async delete(key: string): Promise<void> {
    const db = await this.openDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite')
      tx.objectStore(this.storeName).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error as DOMException)
    })
  }

  async getAll<T>(): Promise<T[]> {
    const db = await this.openDb()
    return new Promise((resolve, reject) => {
      const req = db.transaction(this.storeName, 'readonly').objectStore(this.storeName).getAll()
      req.onsuccess = () => resolve(req.result as T[])
      req.onerror = () => reject(req.error as DOMException)
    })
  }
}
