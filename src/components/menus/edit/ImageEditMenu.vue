<script setup lang="ts">
import BorderChevron from '@/components/common/BorderChevron.vue';
import TransformChevron from '@/components/common/TransformChevron.vue';
import type { ElementRef } from '@/components/design/Element.vue';
import { useSelectorStore } from '@/stores/selector';
import type { ImageRef } from '@/types/ObjectRef';
import { ref, watchEffect } from 'vue';

const selector = useSelectorStore();

const elementRef = ref<ElementRef>(selector.selection[0]);
const imageRef = ref<ImageRef>(elementRef.value.objectRef as ImageRef);

watchEffect(() => {
    imageRef.value = selector.selection[0].objectRef as ImageRef;
})
</script>

<template>
    <div class="font-bold text-xl text-left p-2 mb-2">이미지</div>
    <div class="px-3">
        <BorderChevron :border="imageRef.borderRef" class="my-2" />
        <TransformChevron :element="elementRef" />
    </div>
</template>