<script setup lang="ts">
import Chevron from '@/components/common/Chevron.vue';
import ColorPicker from '@/components/common/ColorPicker.vue';
import VueSlider from 'vue-slider-component';
import type { BorderRef } from '@/types/ObjectRef';

const { border } = defineProps<{
    border: BorderRef
}>();

</script>


<template>
    <Chevron :title="'테두리'">
        <div>
            <div class="flex items-center w-full h-8 rounded-md hover:bg-slate-50" @pointerdown="border.type = 'none'">
                <div class="w-4 h-4 mr-2 rounded-full border border-slate-400"
                :class="{ 'border-3 border-teal-400 outline outline-solid outline-teal-400' : border.type === 'none' }"></div>
                <p>선 없음</p>
            </div>
            <div class="flex items-center w-full h-8 rounded-md hover:bg-slate-50" @pointerdown="border.type = 'solid'">
                <div class="w-4 h-4 mr-2 rounded-full border border-slate-400"
                :class="{ 'border-3 border-teal-400 outline outline-solid outline-teal-400' : border.type === 'solid' }"></div>
                <p>실선</p>
            </div>
            <div v-if="border.type === 'solid'" class="mt-2 border-t border-slate-200">
                <div class="flex items-center justify-between w-full h-8 mt-2">
                    <p class="text-left">색</p>
                    <ColorPicker v-model="border.color" class="w-8 h-8 mr-1 rounded-lg border border-slate-400"
                    :style="{ backgroundColor: border.color }" />
                </div>
                <div class="flex items-center justify-between w-full h-8 mt-2">
                    <p class="text-left">두께</p>
                    <input v-model="border.thickness" class="w-16 h-8 mr-1 px-2 rounded-md border border-slate-400">
                </div>
                <VueSlider v-model="border.thickness" :min="1" :tooltip="'none'" class="w-full h-8 mt-2" />
            </div>
        </div>
    </Chevron>
</template>