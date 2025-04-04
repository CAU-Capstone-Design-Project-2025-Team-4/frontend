<script setup lang="ts">
import { useDesignStore } from '@/stores/design';
import draggable from 'vuedraggable';
import Canvas from '@/components/design/Canvas.vue';
import { nextTick, onMounted, onUnmounted, useTemplateRef } from 'vue';

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

function deleteSlide(e: KeyboardEvent) {
    if (e.key != 'Delete') return;
    design.removeSlide();
}

onMounted(() => {
    window.addEventListener('keyup', deleteSlide);
});

onUnmounted(() => {
    window.removeEventListener('keyup', deleteSlide);
});
</script>
<template>
    <div ref="container" class="pt-1">
        <draggable v-model="design.slides" item-key="'index'" animation="150" ghost-class="ghost" forceFallback="true" @end="onEnd($event)">
            <template #item="{ element: slide, index }">
                <div class="relative flex justify-between w-full mb-2 p-1 aspect-[17.5/9]"
                @pointerdown.left="design.selectSlide(index)">
                    <p :class="{ 'text-teal-800 font-bold': isSelected(index) }">{{ index + 1 }}</p>
                    <div class="relative h-full aspect-video">
                        <Canvas :slide="slide" class="h-full aspect-video rounded-md border border-gray-400 hover:outline-2 hover:outline-solid hover:outline-teal-600"
                        :class="{ 'outline-2 outline-solid outline-teal-700 hover:outline-teal-700': isSelected(index) }" />
                    </div>
                </div>
            </template>
        </draggable>
        <div class="flex justify-right w-full mb-2 p-1 aspect-[17.5/9]">
            <div class="grid place-items-center h-full aspect-video rounded-[5%] bg-gray-200 hover:bg-gray-300 text-3xl text-gray-800"
            @pointerdown.left="addSlide()">+</div>
        </div>
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