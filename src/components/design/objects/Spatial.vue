<script setup lang="ts">
import type { SpatialRef } from '@/types/ObjectRef';
import type { ElementRef } from '@/components/design/Element.vue';
import { computed, inject, onMounted, useTemplateRef } from 'vue';
import UnityWebgl from 'unity-webgl';
import UnityVue from 'unity-webgl/vue';

const { element } = defineProps<{
    element: ElementRef
}>();
const spatialRef = computed<SpatialRef>(() => element.objectRef as SpatialRef);


const unity = new UnityWebgl({
    loaderUrl: "unity.loader.js",
    dataUrl: "unity.data.br",
    frameworkUrl: "unity.framework.js.br",
    codeUrl: "unity.wasm.br",
})


const handleable = inject<boolean>('handleable', false);


</script>

<template>
    <keep-alive>
        <UnityVue v-if="handleable" :unity="unity" />
        <div v-else class="w-full h-full bg-black"></div>
    </keep-alive>
</template>