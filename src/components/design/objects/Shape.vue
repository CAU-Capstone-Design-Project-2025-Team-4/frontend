<script setup lang="ts">
import type { ShapeRef } from '@/types/ObjectRef';
import type { ElementRef } from '@/components/design/Element.vue';
import { ref } from 'vue';

const { element } = defineProps<{
    element: ElementRef
}>();
const shapeRef = ref<ShapeRef>(element.objectRef as ShapeRef);
</script>

<template>
    <svg :width="element.size.x" :height="element.size.y" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path :d="shapeRef.path" :fill="shapeRef.color" />
    </svg>
</template>