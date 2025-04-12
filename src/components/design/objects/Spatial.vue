<script setup lang="ts">
import { type BorderRef, type SpatialRef } from '@/types/ObjectRef';
import type { ElementRef } from '@/components/design/Element.vue';
import { computed, inject, onMounted, useTemplateRef } from 'vue';
import { useUnityStore } from '@/stores/unity';

const { element } = defineProps<{
    element: ElementRef
}>();
const spatialRef = computed<SpatialRef>(() => element.objectRef as SpatialRef);
const borderRef = computed<BorderRef>(() => spatialRef.value.borderRef);


const unity = useUnityStore();

const body = useTemplateRef<HTMLElement>('body');

onMounted(() => {
    if (handleable || slideShow) {
        unity.render(body.value!, spatialRef.value)
    }
})

const handleable = inject<boolean>('handleable', false);
const slideShow = inject<boolean>('slide-show', false);
</script>

<template>
    <div id="unity-element" v-if="handleable || slideShow" class="w-full h-full" :style="{
        border: borderRef.type,
        borderColor: borderRef.color,
        borderWidth: `${borderRef.thickness}px`
    }">
        <div ref="body" class="w-full h-full" />
    </div>    
    <div v-else class="w-full h-full bg-black"></div>
</template>