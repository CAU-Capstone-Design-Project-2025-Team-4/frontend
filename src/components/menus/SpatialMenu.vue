<script setup lang="ts">
import { useDesignStore } from '@/stores/design';
import { ElementRef } from '../design/Element.vue';
import { cameraModeList } from './edit/SpatialEditMenu.vue';
import { useSelectorStore } from '@/stores/selector';
import Vector2 from '@/types/Vector2';
import { instanceOfSpatialRef, type SpatialRef } from '@/types/ObjectRef';
import { nextTick } from 'vue';

const design = useDesignStore();
const selector = useSelectorStore();

function addElement(mode: string) {
    if (design.currentSlide.elements.some(element => instanceOfSpatialRef(element.objectRef))) {
        window.alert("3D 씬은 한 슬라이드에 하나만 추가 가능합니다.");
        return;
    }

    const element = new ElementRef(
        -1,
        new Vector2(960, 540),
        0,
        new Vector2(968, 541),
        0,
        {
            cameraMode: mode,
            cameraTransform: {
                position: { x: 0, y: 0, z: -10 },
                rotation: { x: 0, y: 0, z: 0 }
            },
            modelFile: '',
            models: [],
            backgroundColor: 'skybox',
            borderRef: {
                type: 'none',
                color: '#000000',
                thickness: 1
            }
        } as SpatialRef
    )
    design.addElement(element);

    selector.deselectAll();
    nextTick(() => selector.select(element)); 

    // fetch('/model.fbx')
    // .then(res => {
    //     return res.blob()
    // })
    // .then(blob => {
    //     const element = new ElementRef(-1, new Vector2(960, 540), 0, new Vector2(968, 541), 0, {
    //         cameraMode: mode,
    //         cameraTransform: {
    //             position: { x: 0, y: 0, z: -10 },
    //             rotation: { x: 0, y: 0, z: 0 }
    //         }, 
    //         modelFile: blob,
    //         model: null,
    //         models: [],
    //         backgroundColor: 'skybox',
    //         borderRef: {
    //             type: 'none',
    //             color: '#000000',
    //             thickness: 1
    //         }
    //     } as SpatialRef);
    //     design._addElement(element);

    //     selector.deselectAll();
    //     nextTick(() => selector.select(element));   
    // })

     
}
</script>

<template>
    <div>
        <p class="px-2 mb-2 text-left text-lg font-bold">카메라 모드</p>
        <div v-for="(value, mode) in cameraModeList" class="pl-3">
            <div class="flex w-full h-12 mb-2 p-2 rounded-xl bg-slate-100 hover:bg-slate-200" @pointerdown="addElement(mode)">
                <div class="h-full text-xl mr-2" :class="value.icon"></div>
                <p class="leading-8">{{ value.text }}</p>
                <p class="w-8 h-8 ml-auto text-[32px] leading-7 text-slate-500">+</p>
            </div>
        </div>
    </div>
</template>