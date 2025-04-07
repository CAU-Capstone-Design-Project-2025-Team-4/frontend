<script setup lang="ts">
import TransformChevron from '@/components/common/TransformChevron.vue';
import { useSelectorStore } from '@/stores/selector';
import type { ImageRef } from '@/types/ObjectRef';
import { ref, watchEffect } from 'vue';

const selector = useSelectorStore();

const imageRef = ref<ImageRef>(selector.selection[0].objectRef as ImageRef);

watchEffect(() => {
    imageRef.value = selector.selection[0].objectRef as ImageRef;
})


</script>

<template>
    <div class="font-bold text-xl text-left p-2 mb-2">이미지</div>
    <div class="px-3">
        <TransformChevron />
    </div>
</template>