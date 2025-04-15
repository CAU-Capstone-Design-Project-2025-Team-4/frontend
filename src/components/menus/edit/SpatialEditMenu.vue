<script lang="ts">
export const cameraModeList = {
    free: {
        icon: 'i-mdi:cursor-move',
        text: '자유 이동'
    },
    orbit: {
        icon: 'i-mdi:orbit',
        text: '궤도 회전'
    }
}
</script>

<script setup lang="ts">
import Chevron from '@/components/common/Chevron.vue';
// import Dropdown from '@/components/common/Dropdown.vue';
import TransformChevron from '@/components/common/TransformChevron.vue';
import type { ElementRef } from '@/components/design/Element.vue';
import { useSelectorStore } from '@/stores/selector';
import { useUnityStore } from '@/stores/unity';
import type { SpatialRef } from '@/types/ObjectRef';
import { computed, ref, useTemplateRef, watch, watchEffect } from 'vue';
import ColorPicker from '@/components/common/ColorPicker.vue';
import BorderChevron from '@/components/common/BorderChevron.vue';

const unity = useUnityStore();

const showDropdown = ref<boolean>(false);
const selector = useSelectorStore();

const elementRef = computed<ElementRef>(() => selector.selection[0]);
const spatialRef = computed<SpatialRef>(() => elementRef.value.objectRef as SpatialRef);

function selectMode(mode: 'free' | 'orbit') {
    spatialRef.value.cameraMode = mode;
    unity.sendMessage('SetCameraMode', mode);
    showDropdown.value = false;
}

const dropdown = useTemplateRef<HTMLElement>('dropdown');
function openDropdown() {
    showDropdown.value = true;
    document.addEventListener('pointerdown', closeDropdown, { once: true, capture: true });
}

function closeDropdown(e: PointerEvent) {
    if (!dropdown.value?.contains(e.target as Node))
        e.stopPropagation();
    showDropdown.value = false;
}

function uploadModel(e: Event) {
    const input = e.target as HTMLInputElement;

    const fileReader = new FileReader();
    fileReader.readAsDataURL(input.files![0]);

    fileReader.onload = () => {
        spatialRef.value.model = "http://localhost:5173/UFO_Empty.glb";
        unity.sendMessage('LoadModel', spatialRef.value.model);
        console.log(fileReader.result)
    }
}

function changeTransform() {
    // debounce?
    unity.sendMessage('SetCameraPositionAndRotation', JSON.stringify(spatialRef.value.cameraTransform));
}

watch(() => spatialRef.value.backgroundColor, () => {
    // debounce?
    const cameraBackgroudMode = spatialRef.value.backgroundColor === 'skybox' ? 'skybox' : 'solid';
    unity.sendMessage('SetCameraBackgroundMode', cameraBackgroudMode);
    if (cameraBackgroudMode === 'solid') {
        unity.sendMessage('SetCameraBackgroundColor', spatialRef.value.backgroundColor);
    }
})
</script>

<template>
    <div class="font-bold text-xl text-left p-2 mb-2">3D</div>
    <div class="px-3">
        <p class="text-left">카메라 모드</p>
        <div class="flex items-center w-full h-10 p-2 rounded-lg border border-gray-400 hover:border-teal-400 my-2" @pointerdown.stop="openDropdown()"> 
            <div class="mr-2" :class="cameraModeList[spatialRef.cameraMode].icon" />
            <p ckass="text-left text-xs">{{ cameraModeList[spatialRef.cameraMode].text }}</p>
            <div class="i-mdi-chevron-down ml-auto text-2xl" />
        </div>

        <div class="relative">
            <div ref="dropdown" v-if="showDropdown" class="absolute w-full h-fit z-10000 my-1 py-1 rounded-lg bg-white shadow-lg">
                <div v-for="(value, mode) in cameraModeList" class="flex items-center w-full h-10 p-2 hover:bg-gray-100" 
                :class="{ 'bg-gray-100': spatialRef.cameraMode === mode }" @pointerdown="selectMode(mode)">
                    <div class="mr-2" :class="value.icon" />
                    <p ckass="text-left text-xs">{{ value.text }}</p>
                </div>
            </div>
        </div>
        
        <!-- <Dropdown ref="dropdown" v-if="show" class="w-full h-fit z-100 my-1 py-1">
            <div v-for="(value, mode) in cameraModeList" class="flex items-center w-full h-10 p-2 hover:bg-gray-100" 
            :class="{ 'bg-gray-100': spatialRef.cameraMode === mode }" @pointerdown="selectMode(mode)">
                <div class="mr-2" :class="value.icon" />
                <p ckass="text-left text-xs">{{ value.text }}</p>
            </div>
        </Dropdown>  -->

        <Chevron :title="'3D 모델'" class="my-2">
            <input type="file" id="upload-image" accept=".fbx,.obj,.stl,.glb,.glt" hidden @change="uploadModel($event)" >
            <label for="upload-image">
                <div class="w-full h-10 my-2 rounded-lg bg-teal-500 hover:bg-teal-600">
                    <p class="text-white leading-10">모델 업로드</p>
                </div>
            </label>
            <div class="flex w-full h-10 mb-2">
                <div class="i-mdi:chevron-left h-full mr-2 leading-10" />
                <div class="w-3/10 border-b-3 border-teal-400">
                    <p class="text-sm px-1 leading-10">전체</p>
                </div>
                <div class="w-3/10 border-b-2 border-gray-200">
                    <p class="text-sm px-1 leading-10">기본 도형</p>
                </div>
                <div class="w-3/10 border-b-2 border-gray-200">
                    <p class="text-sm px-1 leading-10">기계 장치</p>
                </div>
                <div class="i-mdi:chevron-right h-full ml-2 leading-10" />
            </div>
            <div class="grid grid-rows-3 grid-flow-col gap-2 w-full py-2 overflow-x-auto">
                <div v-for="_ in 18" class="min-w-16 min-h-16 rounded-xl bg-slate-200" />



            </div>
        </Chevron>

        <Chevron :title="'카메라 설정'" class="my-2">
            <div class="grid grid-rows-3 grid-cols-4 gap-x-2 py-2">
                <span />
                <p class="text-left p-1 leading-8">X</p>
                <p class="text-left p-1 leading-8">Y</p>
                <p class="text-left p-1 leading-8">Z</p>

                <p class="text-left p-1 leading-8">위치</p>
                <form @submit.prevent="" class="relative mb-2">
                    <input v-model.number="spatialRef.cameraTransform.position.x" @input="changeTransform()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" />
                </form>
                <form @submit.prevent="" class="relative">
                    <input v-model.number="spatialRef.cameraTransform.position.y" @input="changeTransform()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" /> 
                </form>
                <form @submit.prevent="" class="relative">
                    <input v-model.number="spatialRef.cameraTransform.position.z" @input="changeTransform()" class="block w-full h-10 pr-6 px-2 text-sm border border-slate-400 rounded-md" /> 
                </form>

                <p class="text-left p-1 leading-8">회전</p>
                <form @submit.prevent="" class="relative">
                    <input v-model.number="spatialRef.cameraTransform.rotation.x" @input="changeTransform()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" />
                </form>
                <form @submit.prevent="" class="relative">
                    <input v-model.number="spatialRef.cameraTransform.rotation.y" @input="changeTransform()" class="block w-full h-10 px-2 text-sm border border-slate-400 rounded-md" /> 
                </form>
                <form @submit.prevent="" class="relative">
                    <input v-model.number="spatialRef.cameraTransform.rotation.z" @input="changeTransform()" class="block w-full h-10 pr-6 px-2 text-sm border border-slate-400 rounded-md" /> 
                </form>
            </div>
        </Chevron>
        <Chevron :title="'배경 색'" class="my-2">
            <div>
                <div class="flex items-center w-full h-8 rounded-md hover:bg-slate-50" @pointerdown="spatialRef.backgroundColor = 'skybox'">
                    <div class="w-4 h-4 mr-2 rounded-full border border-slate-400"
                    :class="{ 'border-3 border-teal-400 outline outline-solid outline-teal-400' : spatialRef.backgroundColor === 'skybox' }"></div>
                    <p>기본</p>
                </div>
                <div class="flex items-center w-full h-8 rounded-md hover:bg-slate-50" @pointerdown="spatialRef.backgroundColor = '#000000'">
                    <div class="w-4 h-4 mr-2 rounded-full border border-slate-400"
                    :class="{ 'border-3 border-teal-400 outline outline-solid outline-teal-400' : spatialRef.backgroundColor !== 'skybox' }"></div>
                    <p>단색</p>
                </div>
                <div v-if="spatialRef.backgroundColor !== 'skybox'" class="mt-2 border-t border-slate-200">
                    <div class="flex items-center justify-between w-full h-8 mt-2">
                        <p class="text-left">색</p>
                        <ColorPicker v-model="spatialRef.backgroundColor" class="w-8 h-8 mr-1 rounded-lg border border-slate-400"
                        :style="{ backgroundColor: spatialRef.backgroundColor }" />
                    </div>
                </div>
            </div>
        </Chevron>
        <BorderChevron class="my-2" :border="spatialRef.borderRef" />
        <TransformChevron :element="elementRef" />
    </div>
</template>