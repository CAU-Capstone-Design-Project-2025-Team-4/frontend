<script setup lang="ts">
import { useDesignStore } from '@/stores/design';
import draggable from 'vuedraggable';
import Canvas from '@/components/design/Canvas.vue';
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';
import Vector2 from '@/types/Vector2';

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

const menu = useTemplateRef<HTMLElement>('context-menu')
const showMenu = ref<boolean>(false);
const menuPosition = ref<Vector2>(Vector2.Zero());
const slideSelection = ref<number>(-1);

function openMenu(e: MouseEvent, index: number) {
    showMenu.value = true;
    menuPosition.value = Vector2.PointFrom(e);
    slideSelection.value = index;
    document.addEventListener('pointerdown', closeMenu, { once: true, capture: true });
}

function closeMenu(e: PointerEvent) {
    if (!menu.value?.contains(e.target as Node))
        e.stopPropagation();
    showMenu.value = false;
}

</script>
<template>
    <div ref="container">
        <draggable v-model="design.slides" item-key="'index'" animation="150" ghost-class="ghost" forceFallback="true" @end="onEnd($event)">
            <template #item="{ element: slide, index }">
                <div class="relative flex justify-between w-full mb-2 p-1 aspect-[17.5/9]"
                @pointerdown="design.selectSlide(index)" @contextmenu.prevent="openMenu($event, index)">
                    <p :class="{ 'text-teal-800 font-bold': isSelected(index) }">{{ index + 1 }}</p>
                    <div class="relative h-full aspect-video">
                        <Canvas :slide="slide" class="h-full aspect-video rounded-md border border-gray-400 hover:outline-2 hover:outline-solid hover:outline-teal-600"
                        :class="{ 'outline-2 outline-solid outline-teal-700 hover:outline-teal-700': isSelected(index) }" />
                        <!-- <div class="absolute top-2 right-2 w-8 h-6 rounded-md border border-gray-400 shadow-sm leading-3.5">...</div> -->
                    </div>
                </div>
            </template>
        </draggable>
        <div class="flex justify-right w-full mb-2 p-1 aspect-[17.5/9]">
            <div class="grid place-items-center h-full aspect-video rounded-[5%] bg-gray-200 hover:bg-gray-300 text-3xl text-gray-800"
            @pointerdown.left="addSlide()">+</div>
        </div>
    </div>

    <div ref="context-menu" v-if="showMenu" :style="{
        left: `${menuPosition.x}px`,
        top: `${menuPosition.y}px`
    }" class="absolute w-fit h-fit z-900 rounded-xl border border-gray-100 bg-white shadow-lg">
        <ul class="p-3">
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
        </ul>
    </div>
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