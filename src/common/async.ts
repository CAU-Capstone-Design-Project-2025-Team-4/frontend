export function onceAsync<T>(fn: () => Promise<T>): () => Promise<T> {
    let promise: Promise<T> | null = null
    return () => {
        if (!promise) {
            promise = fn()
        }
        return promise
    }
}