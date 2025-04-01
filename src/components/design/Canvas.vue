<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import Element, { ElementRef } from './Element.vue';
import Vector2 from '@/types/Vector2';

const elements = ref<ElementRef[]>([
    new ElementRef(new Vector2(0, 0), 0, new Vector2(200, 200), 0, { shape: 'shape' }),
    new ElementRef(new Vector2(200, 200), 0, new Vector2(200, 200), 0, { text: '제목을 입력하세요.' }),
]);

const canvas = useTemplateRef<HTMLElement>('canvas');
const handleable = inject<boolean>('handleable');

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