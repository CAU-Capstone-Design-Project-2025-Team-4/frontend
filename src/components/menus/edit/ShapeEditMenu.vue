<script setup lang="ts">
import BorderChevron from '@/components/design/common/BorderChevron.vue';
import ColorPicker from '@/components/common/ColorPicker.vue';
import TransformChevron from '@/components/design/common/TransformChevron.vue';
import { ElementRef } from '@/components/design/Element.vue';
import { useDesignStore } from '@/stores/design';
import { useSelectorStore } from '@/stores/selector';
import type { ShapeRef } from '@/types/ObjectRef';
import { computed } from 'vue';

const selector = useSelectorStore();

const elementRef = computed<ElementRef>(() => selector.selection[0]);
const shapeRef = computed<ShapeRef>(() => elementRef.value.objectRef as ShapeRef);

const design = useDesignStore();
function updateElement() {
    design.updateObject(elementRef.value);
}
</script>

<template>
    <div>
        <div class="font-bold text-xl text-left p-2 mb-2">모양</div>

        <div class="px-3">
            <div class="flex items-center justify-between w-full h-16 mb-2">
                <p class="text-left">채우기</p>
                <ColorPicker v-model="shapeRef.color" @closed="updateElement()" class="w-12 h-12 rounded-lg border border-slate-400" 
                :style="{ backgroundColor: shapeRef.color }" />
            </div>
            <BorderChevron :element="elementRef" class="my-2" />
            <TransformChevron :element="elementRef" class="my-2" />
        </div>
        
    </div>
</template>