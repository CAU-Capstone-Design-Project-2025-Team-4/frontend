<script setup lang="ts">
import type { BorderRef, ImageRef } from '@/types/ObjectRef';
import type { ElementRef } from '@/components/design/Element.vue';
import { computed } from 'vue';

const { element } = defineProps<{
    element: ElementRef
}>();
const imageRef = computed<ImageRef>(() => element.objectRef as ImageRef);
const borderRef = computed<BorderRef>(() => imageRef.value.borderRef);
</script>

<template>
    <div class="w-full h-full">
        <div class="absolute w-full h-full" :style="{
            border: borderRef.type,
            borderColor: borderRef.color,
            borderWidth: `${borderRef.thickness}px`
        }" />
        <img :src="imageRef.url" class="w-full h-full object-fill" draggable="false" />
    </div>
</template>