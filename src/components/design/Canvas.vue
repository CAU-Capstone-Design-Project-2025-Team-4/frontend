<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import Element, { ElementRef } from './Element.vue';
import { useDesignStore, type Slide } from '@/stores/design';
import ContextMenu from '../common/ContextMenu.vue';
import { useSelectorStore } from '@/stores/selector';


const { slide } = defineProps<{
    slide: Slide
}>();

const canvas = useTemplateRef<HTMLElement>('canvas');
const handleable = inject<boolean>('handleable', false);



let _width = ref<number>(0);
const ratio = computed<number>(() => {
    if (handleable) return 1;
    return _width.value / 1920;
});

let observer: ResizeObserver;
onMounted(() => {
    observer = new ResizeObserver(_ => {
        _width.value = canvas.value!.clientWidth;
    });
    observer.observe(canvas.value!);
})

onBeforeUnmount(() => observer.disconnect());

const design = useDesignStore();
const selector = useSelectorStore();
const menu = useTemplateRef<InstanceType<typeof ContextMenu>>('context-menu');
function openMenu(e: MouseEvent, element: ElementRef) {
    e.preventDefault();
    if (!handleable) return;

    if (!e.ctrlKey) {
        selector.deselectAll();
    }
    selector.select(element);

    menu.value?.open(e);
}
</script>

<template>
    <div>
        <div ref="canvas" class="absolute w-full h-full overflow-hidden" :style="{backgroundColor: 'white'}">
            <Element v-for="element in slide.elements" :element="element" :ratio="ratio" @contextmenu="openMenu($event, element)" />
        </div>

        <ContextMenu v-if="handleable" ref="context-menu">
            <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerdown="design.bringFront(selector.selection)">
                <div class="i-mdi:arrange-bring-to-front w-6 h-10 font-light" />
                <p class="leading-10 px-2">맨 앞으로 가져오기</p>
            </li>
            <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerdown="design.bringForward(selector.selection)">
                <div class="i-mdi:arrange-bring-forward w-6 h-10 font-light" />
                <p class="leading-10 px-2">앞으로 가져오기</p>
            </li>
            <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerdown="design.sendBackward(selector.selection)">
                <div class="i-mdi:arrange-send-backward w-6 h-10 font-light" />
                <p class="leading-10 px-2">뒤로 보내기</p>
            </li>
            <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerdown="design.sendBack(selector.selection)">
                <div class="i-mdi:arrange-send-to-back w-6 h-10 font-light" />
                <p class="leading-10 px-2">맨 뒤로 보내기</p>
            </li>
        </ContextMenu>
    </div>
    
</template>