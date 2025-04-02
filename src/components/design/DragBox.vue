<script setup lang="ts">
import Vector2 from '@/types/Vector2';
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect, type Ref } from 'vue';
import type { ElementRef } from './Element.vue';
import type HandleableCanvas from './HandleableCanvas.vue';
import { useDesignStore } from '@/stores/design';
import { useSelectorStore } from '@/stores/selector';

const { container } = defineProps<{
    container: HTMLElement | null
}>();
const canvas = inject('canvas') as Ref<InstanceType<typeof HandleableCanvas>>;
const design = useDesignStore();
const selector = useSelectorStore();

const startPoint = ref<Vector2>(Vector2.ZERO);
const endPoint = ref<Vector2>(Vector2.ZERO);
const isDragging = ref<boolean>(false);

const position = ref<Vector2>(Vector2.ZERO);
const size = ref<Vector2>(Vector2.ZERO);

let _position: Vector2;

watchEffect(() => {
    const x = Math.min(startPoint.value.x, endPoint.value.x);
    const y = Math.min(startPoint.value.y, endPoint.value.y);

    const width = startPoint.value.x + endPoint.value.x - x * 2; // Math.max
    const height = startPoint.value.y + endPoint.value.y - y * 2; // Math.max

    // Vector2.PositionFrom(container) need to be utilized
    _position = new Vector2(x, y);
    position.value = Vector2.Sub(_position, Vector2.PositionFrom(container));
    size.value = new Vector2(width, height);
})

function getIntersection(element: ElementRef) {
    const start = canvas.value.toCanvasPoint(_position);
    const end = canvas.value.toCanvasPoint(Vector2.Add(_position, size.value));

    const left: number = element.position.x;
    const right: number = element.position.x + element.size.x;
    const top: number = element.position.y;
    const bottom: number = element.position.y + element.size.y;

    return left < end.x && right > start.x && top < end.y && bottom > start.y;
}


function startDrag(e: PointerEvent) {
    if (e.button != 0) return;
    // e.preventDefault();

    startPoint.value = Vector2.PointFrom(e);
    endPoint.value = startPoint.value;
    isDragging.value = true;
}

function drag(e: PointerEvent) {
    if (!isDragging.value) return;

    endPoint.value = Vector2.PointFrom(e);

    selector.setSelection(design.currentSlide.elements.filter(element => getIntersection(element)));
}

function endDrag(e: PointerEvent) {
    isDragging.value = false;
    endPoint.value = Vector2.ZERO;
}

onMounted(() => {
    nextTick(() => {
        container?.addEventListener('pointerdown', startDrag);
        container?.addEventListener('pointermove', drag);
        window.addEventListener('pointerup', endDrag);
    });
});

onBeforeUnmount(() => {
    container?.removeEventListener('pointerdown', startDrag);
    container?.removeEventListener('pointermove', drag);
    window.removeEventListener('pointerup', endDrag);
})
</script>

<template>
    <div :class="{ 'invisible': !isDragging }" class="absolute bg-teal-400 bg-opacity-5 border border-teal-400"
    :style="{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.x}px`,
        height: `${size.y}px`
    }" />
</template>