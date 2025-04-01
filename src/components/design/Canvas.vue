<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import Element, { ElementRef } from './Element.vue';
import Vector2 from '@/types/Vector2';

const elements = ref<ElementRef[]>([
    new ElementRef(new Vector2(0, 0), 0, new Vector2(200, 200), 0, { path: 'M 50 0 A 50 50 0 1 1 49 0', color: 'oklch(0.91 0.096 180.426)' }),
    new ElementRef(new Vector2(500, 100), 0, new Vector2(200, 200), 0, { path: 'M 0 0 L 100 0 L 100 100 L 0 100 L 0 0', color: 'oklch(0.777 0.152 181.912)' }),
    new ElementRef(new Vector2(200, 200), 0, new Vector2(200, 200), 0, { text: '제목을 입력하세요.' }),
]);

const canvas = useTemplateRef<HTMLElement>('canvas');
const handleable = inject<boolean>('handleable', false);

let _width = ref<number>(0);
const ratio = computed<number>(() => {
    if (handleable) return 1;
    return _width.value / 1920;
});

let observer: ResizeObserver;
onMounted(() => {
    observer = new ResizeObserver(_ => {
        _width.value = canvas.value!.clientWidth;
    });
    observer.observe(canvas.value!);
})

onBeforeUnmount(() => observer.disconnect());
</script>

<template>
    <div ref="canvas" class="w-full h-full bg-white">
        <Element v-for="element in elements" :element="element" :ratio="ratio" />
    </div>
</template>