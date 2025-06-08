<script setup lang="ts">
import { type BorderRef, type SpatialRef } from '@/types/ObjectRef';
import type { ElementRef } from '@/components/design/Element.vue';
import { computed, inject, onBeforeUnmount, onMounted, watch, type Ref } from 'vue';
import type UnityCanvas from './UnityCanvas.vue';

const { element } = defineProps<{
    element: ElementRef
}>();
const spatialRef = computed<SpatialRef>(() => element.objectRef as SpatialRef);
const borderRef = computed<BorderRef>(() => spatialRef.value.borderRef);

const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;
onMounted(() => {
    unity.value.render(spatialRef.value);
})

watch(() => element.id, () => {
    unity.value.render(spatialRef.value);
})

onBeforeUnmount(() => {
    unity.value.unmount();
})

// TODO: spatial element size with canvas scale... (rounding problem)
</script>

<template>
    <div id="spatial-element" class="w-full h-full" :style="{
        border: borderRef.type,
        borderColor: borderRef.color,
        borderWidth: `${borderRef.thickness}px`
    }">
    </div>    
</template>