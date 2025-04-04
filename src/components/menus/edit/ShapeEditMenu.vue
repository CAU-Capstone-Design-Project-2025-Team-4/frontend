<script setup lang="ts">
import Chevron from '@/components/common/Chevron.vue';
import ColorPicker from '@/components/common/ColorPicker.vue';
import { ElementRef } from '@/components/design/Element.vue';
import { useSelectorStore } from '@/stores/selector';
import type { ShapeRef } from '@/types/ObjectRef';
import { ref, watchEffect } from 'vue';
import VueSlider from 'vue-slider-component';

const selector = useSelectorStore();

const element = ref<ElementRef>(selector.selection[0]);
const shapeRef = ref<ShapeRef>(selector.selection[0].objectRef as ShapeRef);

const sizeLock = ref<boolean>(true);
let ratio: number = element.value.size.x / element.value.size.y;

watchEffect(() => {
    element.value = selector.selection[0];
    shapeRef.value = selector.selection[0].objectRef as ShapeRef;
})

function move() {
    if (element.value.position.x.toString() === '') element.value.position.x = 0;
    if (element.value.position.y.toString() === '') element.value.position.y = 0;
}

function restricRotation() {
    if (element.value.rotation.toString() === '') element.value.rotation = 0;
    element.value.rotation = element.value.rotation % 360;
    if (element.value.rotation < 0) element.value.rotation + 360;
}

function toggleLock() {
    sizeLock.value = !sizeLock.value;
    if (sizeLock) ratio = element.value.size.x / element.value.size.y;
}

function resizeWidth() {
    if (element.value.size.x.toString() === '') element.value.size.x = 0;
    if (sizeLock.value) element.value.size.y = element.value.size.x / ratio;
}

function resizeHeight() {
    if (element.value.size.y.toString() === '') element.value.size.y = 0;
    if (sizeLock.value) element.value.size.x = element.value.size.y * ratio;
}
</script>

<template>
    <div>
        <div class="font-bold text-xl text-left p-2">모양</div>
        <div class="flex items-center justify-between w-full h-16 px-3 mb-2">
            <p class="text-left">채우기</p>
            <ColorPicker v-model="shapeRef.color" class="w-12 h-12" />
        </div>

        <Chevron :title="'테두리'" class="my-2" :key="1">
            <div class="w-full px-3">
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
         
        <Chevron :title="'위치 & 회전 & 크기'" class="my-2" :key="2">
            <div class="w-full px-3">
                
                <div class="grid grid-rows-2 grid-cols-3 gap-x-2 py-2">
                    <p class="text-left p-1 leading-8">X</p>
                    <p class="text-left p-1 leading-8">Y</p>
                    <p class="text-left p-1 leading-8">회전</p>

                    <form @submit.prevent="" class="relative">
                        <input v-model.number="element.position.x" @input="move()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" />
                    </form>
                    <form @submit.prevent="" class="relative">
                        <input v-model.number="element.position.y" @input="move()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" /> 
                    </form>
                    <form @submit.prevent="" class="relative">
                        <input v-model.number="element.rotation" @input="restricRotation()" class="block w-full h-10 pr-6 px-2 text-sm border border-slate-400 rounded-md" /> 
                        <p class="absolute right-2 bottom-2">°</p>
                    </form>
                </div>

                <div class="grid grid-rows-2 grid-cols-5 gap-x-2 py-2">
                    <p class="col-span-2 text-left p-1 leading-8">가로</p>
                    <p class="col-span-2 text-left p-1 leading-8">세로</p>

                    <form @submit.prevent="" class="col-span-2 relative">
                        <input v-model.number="element.size.x" @input="resizeWidth()" class="block w-full h-10 pr-7 px-2 text-sm border border-slate-400 rounded-md" />
                        <p class="absolute right-2 bottom-2">px</p>   
                    </form>
                    <form @submit.prevent="" class="col-span-2 relative">
                        <input v-model.number="element.size.y" @input="resizeHeight()" class="block w-full h-10 pr-7 px-2 text-sm border border-slate-400 rounded-md" />
                        <p class="absolute right-2 bottom-2">px</p>   
                    </form>
                    <div class="h-10 w-10 col-span-1 justify-self-end p-2 rounded-md bg-gray-200 hover:bg-gray-300" @pointerdown="toggleLock()">
                        <div class="text-2xl" :class="[ sizeLock ? 'i-mdi:lock' : 'i-mdi:lock-open']" />
                    </div>
                </div>
                
            </div>
        </Chevron>
    </div>
</template>