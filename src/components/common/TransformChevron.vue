<script setup lang="ts">
import Chevron from '@/components/common/Chevron.vue';
import { ref } from 'vue';
import type { ElementRef } from '../design/Element.vue';

const { element, disableY } = defineProps<{
    element: ElementRef
    disableY?: boolean
}>();

const sizeLock = ref<boolean>(true);
let ratio: number = element.size.x / element.size.y;

function move() {
    if (element.position.x.toString() === '') element.position.x = 0;
    if (element.position.y.toString() === '') element.position.y = 0;
}

function restricRotation() {
    if (element.rotation.toString() === '') element.rotation = 0;
    element.rotation = element.rotation % 360;
    if (element.rotation < 0) element.rotation + 360;
}

function toggleLock() {
    sizeLock.value = !sizeLock.value;
    if (sizeLock) ratio = element.size.x / element.size.y;
}

function resizeWidth() {
    if (element.size.x.toString() === '') element.size.x = 0;
    if (sizeLock.value || disableY === false) element.size.y = element.size.x / ratio;
}

function resizeHeight() {
    if (element.size.y.toString() === '') element.size.y = 0;
    if (sizeLock.value) element.size.x = element.size.y * ratio;
}
</script>

<template>
    <Chevron :title="'위치 & 회전 & 크기'">
        <div>  
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
                <form @submit.prevent="" class="col-span-2 relative" :class="{ 'bg-slate-100' : disableY }">
                    <input :disabled="disableY" v-model.number="element.size.y" @input="resizeHeight()" class="block w-full h-10 pr-7 px-2 text-sm border border-slate-400 rounded-md" />
                    <p class="absolute right-2 bottom-2">px</p>   
                </form>
                <div class="h-10 w-10 col-span-1 justify-self-end p-2 rounded-md bg-gray-200 hover:bg-gray-300" @pointerdown="toggleLock()">
                    <div class="text-2xl" :class="[ sizeLock ? 'i-mdi:lock' : 'i-mdi:lock-open']" />
                </div>
            </div>
        </div>
    </Chevron>
</template>