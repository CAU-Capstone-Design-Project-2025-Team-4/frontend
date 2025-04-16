<script setup lang="ts">
import { type BorderRef, type SpatialRef } from '@/types/ObjectRef';
import type { ElementRef } from '@/components/design/Element.vue';
import { computed, inject, onBeforeUnmount, onMounted, useTemplateRef, type Ref } from 'vue';
import type UnityCanvas from './UnityCanvas.vue';

const { element } = defineProps<{
    element: ElementRef
}>();
const spatialRef = computed<SpatialRef>(() => element.objectRef as SpatialRef);
const borderRef = computed<BorderRef>(() => spatialRef.value.borderRef);


// const unity = useUnityStore();
const body = useTemplateRef<HTMLElement>('body');

const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;

// onMounted(() => {
//     if (handleable || slideShow) {
//         if (unity.hasInstance) {
//             unity.render(body.value!, spatialRef.value)
//         } else {
//             unity.addInstantiatedListener(() => {
//                 unity.render(body.value!, spatialRef.value);
//             })
//         }
//         // unity.render(body.value!, spatialRef.value)
//     }
// })

const handleable = inject<boolean>('handleable', false);
const slideShow = inject<boolean>('slide-show', false);

onMounted(() => {
    if (handleable || slideShow) {
        unity.value.render(spatialRef.value);
    }
})

onBeforeUnmount(() => {
    if (handleable || slideShow) {
        unity.value.unmount();
    }
})
</script>

<template>
    <div id="spatial-element" v-if="handleable || slideShow" class="w-full h-full" :style="{
        border: borderRef.type,
        borderColor: borderRef.color,
        borderWidth: `${borderRef.thickness}px`
    }">
    </div>    
    <div v-else class="w-full h-full bg-black"></div>
</template>