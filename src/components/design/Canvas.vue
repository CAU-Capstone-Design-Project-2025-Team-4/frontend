<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import Element from './Element.vue';
import type { Slide } from '@/stores/design';

const { slide } = defineProps<{
    slide: Slide
}>();

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
    <div ref="canvas" class="absolute overflow-hidden bg-white">
        <Element v-for="element in slide.elements" :element="element" :ratio="ratio" />
    </div>
</template>