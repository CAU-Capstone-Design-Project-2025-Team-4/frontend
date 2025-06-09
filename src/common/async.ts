export function onceAsync<T>(fn: () => Promise<T>): () => Promise<T> {
    let promise: Promise<T> | null = null
    return () => {
        if (!promise) {
            promise = fn()
        }
        return promise
    }
}

export function useSuspendableWait() {
    let isSuspended = false;
    let resolveFn : (() => void) | null = null;
    let timeoutId: number | null = null;

    function wait(timeout: number) {
        return new Promise<void>(resolve => {
            resolveFn = resolve;

            if (isSuspended) {
                resolve();
                return;
            }

            timeoutId = setTimeout(() => {
                timeoutId = null;
                resolve();
            }, timeout)

        })
    }

    function suspend() {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }

        if (resolveFn) {
            resolveFn();
            resolveFn = null;
        }

        isSuspended = true;
    }

    function resume() {
        isSuspended = false;
    }
    
    return { wait, suspend, resume }
}