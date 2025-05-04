<script setup lang="ts">
import BorderChevron from '@/components/design/common/BorderChevron.vue';
import TransformChevron from '@/components/design/common/TransformChevron.vue';
import type { ElementRef } from '@/components/design/Element.vue';
import { useSelectorStore } from '@/stores/selector';
import type { ImageRef } from '@/types/ObjectRef';
import { computed } from 'vue';

const selector = useSelectorStore();

const elementRef = computed<ElementRef>(() => selector.selection[0]);
const imageRef = computed<ImageRef>(() => elementRef.value.objectRef as ImageRef);
</script>

<template>
    <div class="font-bold text-xl text-left p-2 mb-2">이미지</div>
    <div class="px-3">
        <BorderChevron :element="elementRef" class="my-2" />
        <TransformChevron :element="elementRef" />
    </div>
</template>