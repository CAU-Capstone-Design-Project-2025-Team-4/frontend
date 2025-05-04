import { useDebounceFn } from "@vueuse/core"
import { ref } from "vue"

// https://github.com/vueuse/vueuse/issues/3375
export function useDebounceFnFlushable<T extends (...args: any) => any>(fn: T, ms: number) {
	const stopping = ref<boolean>(false)
    const params = ref<any | null>(null);

	const debounce = useDebounceFn((...args) => {
		if (!stopping.value)
			return fn.apply(null, args)
	}, ms)

	return {
		debounced: (...args: Parameters<T>) => {
			stopping.value = false
            params.value = args;
			return debounce.call(null, ...params.value)
		},
		flush: () => {
            if (params.value === null) return;

            fn.apply(null, params.value);
            stopping.value = true
        }
	}
}