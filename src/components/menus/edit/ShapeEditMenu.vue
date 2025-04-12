<script setup lang="ts">
import BorderChevron from '@/components/common/BorderChevron.vue';
import ColorPicker from '@/components/common/ColorPicker.vue';
import TransformChevron from '@/components/common/TransformChevron.vue';
import { ElementRef } from '@/components/design/Element.vue';
import { useSelectorStore } from '@/stores/selector';
import type { ShapeRef } from '@/types/ObjectRef';
import { ref, watchEffect } from 'vue';

const selector = useSelectorStore();

const elementRef = ref<ElementRef>(selector.selection[0]);
const shapeRef = ref<ShapeRef>(elementRef.value.objectRef as ShapeRef);

watchEffect(() => {
    shapeRef.value = selector.selection[0].objectRef as ShapeRef;
})
</script>

<template>
    <div>
        <div class="font-bold text-xl text-left p-2 mb-2">모양</div>

        <div class="px-3">
            <div class="flex items-center justify-between w-full h-16 mb-2">
                <p class="text-left">채우기</p>
                <ColorPicker v-model="shapeRef.color" class="w-12 h-12" />
            </div>
            <BorderChevron :border="elementRef.objectRef.borderRef" class="my-2" />
            <TransformChevron :element="elementRef" class="my-2" />
        </div>
        
    </div>
</template>