<script setup lang="ts">
import { useDraggable } from '@/common/draggable';
import Vector2 from '@/types/Vector2';
import { onBeforeUnmount, onMounted, provide, ref, useTemplateRef } from 'vue';
import Canvas from '@/components/design/Canvas.vue';

const position = ref<Vector2>(Vector2.ZERO);
const scale = ref<number>(1);
const size = ref<Vector2>(new Vector2(1920, 1080));

function toScreenSpace(v: Vector2): Vector2 {
    return Vector2.Mult(v, scale.value);
}

function toCanvasSpace(v: Vector2): Vector2 {
    return Vector2.Mult(v, 1 / scale.value);
}

function toScreenPoint(point: Vector2): Vector2 {
    return toScreenSpace(point).add(position.value);
}

defineExpose({
    position,
    scale,
    size,
    toScreenSpace,
    toCanvasSpace,
    toScreenPoint
});


const container = useTemplateRef<HTMLElement>('container');
let containerRect: DOMRect;

const MIN_PADDING = 80;
function handleResize() {
    containerRect = container.value!.getBoundingClientRect();

    const xScale = (containerRect.width - 2 * MIN_PADDING) / size.value.x;
    const yScale = (containerRect.height - 2 * MIN_PADDING) / size.value.y; 

    if (xScale < yScale) { // apply MIN_PADDING to X-axis
        scale.value = xScale;
        position.value.apply(MIN_PADDING, (containerRect.height - size.value.y * xScale) / 2);
    } else { // apply MIN_PADDING to Y-axis
        scale.value = yScale;
        position.value.apply((containerRect.width - size.value.x * yScale) / 2, MIN_PADDING);
    }
}

const MAX_ZOOM = 5, MIN_ZOOM = 0.2;
function scaleByWheel(e: WheelEvent) {
    if (!e.ctrlKey) return;
    e.preventDefault();

    const point = Vector2.PointFrom(e);
    const at = point.sub(position.value).sub(new Vector2(containerRect.left, containerRect.top));

    let zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    if (scale.value * zoomFactor > MAX_ZOOM) {
        zoomFactor = MAX_ZOOM / scale.value;
    }
    if (scale.value * zoomFactor < MIN_ZOOM) {
        zoomFactor = MIN_ZOOM / scale.value;
    }
    scale.value *= zoomFactor;

    position.value.add(at.mult(1 - zoomFactor));
}

useDraggable(container, 4, (delta) => {
    position.value.add(delta);
}, { cursor: 'move' });

onMounted(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    container.value?.addEventListener('wheel', scaleByWheel);
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    container.value?.removeEventListener('wheel', scaleByWheel);
});

provide<boolean>('handleable', true);
</script>

<template>
    <div ref="container" class="relative flex-5/6 overflow-hidden bg-gray-100">
        <div class="absolute shadow-lg" :style="{
            transformOrigin: `left top`,
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            width: `${size.x}px`,
            height: `${size.y}px`
        }">
            <Canvas />
        </div>
    </div>

</template>