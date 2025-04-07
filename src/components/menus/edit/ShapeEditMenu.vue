<script setup lang="ts">
import Chevron from '@/components/common/Chevron.vue';
import ColorPicker from '@/components/common/ColorPicker.vue';
import TransformChevron from '@/components/common/TransformChevron.vue';
import { useSelectorStore } from '@/stores/selector';
import type { ShapeRef } from '@/types/ObjectRef';
import { ref, watchEffect } from 'vue';
import VueSlider from 'vue-slider-component';

const selector = useSelectorStore();

const shapeRef = ref<ShapeRef>(selector.selection[0].objectRef as ShapeRef);

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

            <Chevron :title="'테두리'" class="my-2">
                <div>
                    <div class="flex items-center w-full h-8 rounded-md hover:bg-slate-50" @pointerdown="shapeRef.border = false">
                        <div class="w-4 h-4 mr-2 rounded-full border border-slate-400"
                        :class="{ 'border-3 border-teal-400 outline outline-solid outline-teal-400' : !shapeRef.border }"></div>
                        <p>선 없음</p>
                    </div>
                    <div class="flex items-center w-full h-8 rounded-md hover:bg-slate-50" @pointerdown="shapeRef.border = true">
                        <div class="w-4 h-4 mr-2 rounded-full border border-slate-400"
                        :class="{ 'border-3 border-teal-400 outline outline-solid outline-teal-400' : shapeRef.border }"></div>
                        <p>실선</p>
                    </div>
                    <div v-if="shapeRef.border" class="mt-2 border-t border-slate-200">
                        <div class="flex items-center justify-between w-full h-8 mt-2">
                            <p class="text-left">색</p>
                            <ColorPicker v-model="shapeRef.borderColor" class="w-8 h-8 mr-1" />
                        </div>
                        <div class="flex items-center justify-between w-full h-8 mt-2">
                            <p class="text-left">두께</p>
                            <input v-model="shapeRef.borderThickness" class="w-16 h-8 mr-1 px-2 rounded-md border border-slate-400">
                        </div>
                        <VueSlider v-model="shapeRef.borderThickness" :min="1" :tooltip="'none'" class="w-full h-8 mt-2" />
                    </div>
                </div>
            </Chevron>
            
            <TransformChevron class="my-2" />
        </div>
        
    </div>
</template>