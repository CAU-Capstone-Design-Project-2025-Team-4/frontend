import Vector2 from "@/types/Vector2";
import { onBeforeUnmount, onMounted, type ShallowRef } from "vue";

interface DraggableOptions {
    onEnd?: () => void,
    auto?: boolean,
    cursor?: string,
    stop?: boolean
}

let isDraggingOthers: boolean = false;
export function useDraggable(
    target: Readonly<ShallowRef<HTMLElement | null>>, 
    button: number, 
    onMove: (delta: Vector2, start?: Vector2) => void, 
    options?: DraggableOptions
) {
    // const delta = ref<Vector2>(Vector2.Zero());
    let lastPoint: Vector2 = Vector2.Zero();
    let currentPoint: Vector2 = Vector2.Zero();
    let isDragging = false;
    function start(e: PointerEvent) {
        if (isDraggingOthers) return;
        if (e.buttons != button) return;
        e.preventDefault();
        if (options?.stop) e.stopPropagation();
        isDraggingOthers = true;

        document.body.style.cursor = options?.cursor ?? 'auto';

        lastPoint = Vector2.PointFrom(e);
        isDragging = true;
    }

    function move(e: PointerEvent) {
        if (options?.auto && !isDragging && e.buttons == button) {
            if (e.target instanceof HTMLElement && e.target === target.value) {
                start(e);
                return;
            }
        }
        
        if (!isDragging) return;
        document.body.style.cursor = options?.cursor ?? 'auto';
        
        currentPoint = Vector2.PointFrom(e);
        onMove(Vector2.Sub(currentPoint, lastPoint), currentPoint);

        lastPoint = currentPoint;
    }

    function end(e: PointerEvent) {
        if (!isDragging) return;

        if (options?.onEnd) options.onEnd();

        isDraggingOthers = false;
        document.body.style.cursor = 'auto';
        isDragging = false;
    }

    onMounted(() => {
        target.value!.addEventListener('pointerdown', start);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
    });

    onBeforeUnmount(() => {
        target.value!.removeEventListener('pointerdown', start);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', end);
    });
}