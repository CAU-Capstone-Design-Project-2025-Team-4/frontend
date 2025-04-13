<script setup lang="ts">
import { useDesignStore } from '@/stores/design';
import draggable from 'vuedraggable';
import Canvas from '@/components/design/Canvas.vue';
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import Vector2 from '@/types/Vector2';
import ContextMenu from '../common/ContextMenu.vue';

const container = useTemplateRef<HTMLElement>('container');

const design = useDesignStore();
const isSelected = (index: number) => index == design.selection;

function onEnd(e: any) {
    design.selectSlide(e.newIndex);
}

function addSlide() {
    design.newSlide();
    nextTick(() => container.value?.scrollTo(0, container.value.scrollHeight));
}

// function deleteSlide(e: KeyboardEvent) {
//     if (e.key != 'Delete') return;
//     design.removeSlide();
// }

// onMounted(() => {
//     window.addEventListener('keyup', deleteSlide);
// });

// onUnmounted(() => {
//     window.removeEventListener('keyup', deleteSlide);
// });


const menu = useTemplateRef<InstanceType<typeof ContextMenu>>('context-menu');
const slideSelection = ref<number>(-1);

</script>
<template>
    <div ref="container">
        <draggable v-model="design.slides" item-key="'index'" animation="150" ghost-class="ghost" forceFallback="true" @end="onEnd($event)">
            <template #item="{ element: slide, index }">
                <div class="relative flex justify-between w-full mb-2 p-1 aspect-[17.5/9]"
                @pointerdown="design.selectSlide(index)" @contextmenu.prevent="menu?.open($event); slideSelection = index;">
                    <p :class="{ 'text-teal-800 font-bold': isSelected(index) }">{{ index + 1 }}</p>
                    <div class="h-full aspect-video">
                        <div class="h-full aspect-video p-1 rounded-md border border-gray-400 hover:outline-2 hover:outline-solid hover:outline-teal-600"
                        :class="{ 'outline-2 outline-solid outline-teal-700 hover:outline-teal-700': isSelected(index) }">
                            <div class="relative w-full h-full">
                                <Canvas class="" :slide="slide" />
                            </div>  
                        </div>
                    </div>
                </div>
            </template>
        </draggable>
        <div class="flex justify-right w-full mb-2 p-1 aspect-[17.5/9]">
            <div class="grid place-items-center h-full aspect-video rounded-[5%] bg-gray-200 hover:bg-gray-300 text-3xl text-gray-800"
            @pointerdown.left="addSlide()">+</div>
        </div>
    </div>

    <ContextMenu ref="context-menu">
        <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerdown="design.insertSlide(slideSelection)">
            <div class="i-mdi-plus w-6 h-10 font-light" />
            <p class="leading-10 px-2">슬라이드 추가</p>
        </li>
        <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerdown="design.duplicateSlide(slideSelection)">
            <div class="i-mdi:plus-box-multiple-outline w-6 h-10 font-light" />
            <p class="leading-10 px-2">슬라이드 복제</p>
        </li>
        <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerdown="design.removeSlide(slideSelection)">
            <div class="i-material-symbols:delete-outline-rounded w-6 h-10 font-light" />
            <p class="leading-10 px-2">슬라이드 삭제</p>
        </li>
    </ContextMenu>
</template>

<style lang="css">
.ghost {
    visibility: hidden;
    p {
        visibility: hidden;
    }
}

.sortable-fallback {
    p { visibility: hidden; }
}
</style>