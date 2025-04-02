<script setup lang="ts">
import { useSelectorStore } from '@/stores/selector';
import Vector2 from '@/types/Vector2';
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, ref, useTemplateRef, watch, watchEffect, type Ref } from 'vue';
import HandleableCanvas from './HandleableCanvas.vue';
import { instanceOfTextBoxRef } from '@/types/ObjectRef';
import { useDraggable } from '@/common/draggable';

enum HandlerType {
    NONE         = 1 << 0,
    MOVE         = 1 << 1,
    RESIZE       = 1 << 2,
    ROTATE       = 1 << 3,

    OBJECT       = MOVE | RESIZE | ROTATE,
    TEXTBOX      = 1 << 4,
    MULTIOBJECT  = MOVE | ROTATE
}

const type = computed<HandlerType>(() => {
    if (selection.value.length <= 0) return HandlerType.NONE;
    if (selection.value.length > 1) return HandlerType.MULTIOBJECT;
    if (instanceOfTextBoxRef(selection.value[0].objectRef)) return HandlerType.TEXTBOX;
    return HandlerType.OBJECT;
});

function isHandlerMatch(handlerMask: HandlerType, exact?: boolean) {
    if (exact !== undefined) return type.value === handlerMask;
    return type.value & handlerMask;
}

const selector = useSelectorStore();
const { selection } = storeToRefs(selector);

const canvas = inject('canvas') as Ref<InstanceType<typeof HandleableCanvas>>;

const position = ref<Vector2>(Vector2.ZERO);
const rotation = ref<number>(0);
const size = ref<Vector2>(Vector2.ZERO);
watchEffect(() => {
    if (selection.value.length <= 0) return;

    const rects = selection.value.map(obj => obj.getBoundingRect());

    const left = Math.min(...rects.map(rect => rect.left));
    const right = Math.max(...rects.map(rect => rect.right));
    const top = Math.min(...rects.map(rect => rect.top));
    const bottom = Math.max(...rects.map(rect => rect.bottom));

    // can be utilized
    position.value = canvas.value.toScreenPoint(new Vector2(left, top));
    rotation.value = 0;
    size.value = canvas.value.toScreenSpace(new Vector2(right - left, bottom - top));
});


const moveHandler = useTemplateRef<HTMLElement>('move-handler');
useDraggable(moveHandler, 1, (delta) => {
    if (selector.isDragSelecting) return;
    selection.value.forEach(element => element.position.add(canvas.value.toCanvasSpace(delta)));
    console.log('click')
}, { auto: true, stop: true });

['left', 'right', 'top', 'bottom'].forEach(dir => useDraggable(useTemplateRef<HTMLElement>(dir), 1, (delta) => {
    selection.value.forEach(obj => obj.position.add(canvas.value.toCanvasSpace(delta)));
}, { stop: true }));



const padding = ref<number>(0);
const length = ref<number>(0);

watch(() => canvas.value?.scale, () => {
    length.value = canvas.value.scale * 8;
    padding.value = length.value * 4 / 5;
});


</script>

<template>
    <div ref="handler" :class="{ 'invisible': isHandlerMatch(HandlerType.NONE) }" class="absolute pointer-events-none z-100 border-2 border-teal-400" :style="{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.x}px`,
        height: `${size.y}px`
    }">
        <!-- temp -->
        <div :class="{ 'invisible': !isHandlerMatch(HandlerType.MULTIOBJECT, true) }" v-for="element in selection" class="absolute pointer-events-none border-2 border-teal-400" :style="{
            transform: `translate(${canvas.toScreenPoint(element.position).x - position.x - 2}px, ${canvas.toScreenPoint(element.position).y - position.y - 2}px)`,
            width: `${canvas.toScreenSpace(element.size).x}px`,
            height: `${canvas.toScreenSpace(element.size).y}px`
        }" />
        
        <div ref="move-handler" :class="{ 'invisible' : !isHandlerMatch(HandlerType.MOVE) }" class="absolute w-full h-full pointer-events-auto" />
        <div :class="{ 'invisible': !isHandlerMatch(HandlerType.TEXTBOX) }" class="absolute w-full h-full pointer-events-none">
            <div ref="top" class="absolute top-0 w-full pointer-events-auto cursor-move" :style="{ transform:`translateY(${-padding}px)`, height: `${length}px` }" />
            <div ref="bottom" class="absolute bottom-0 w-full pointer-events-auto cursor-move" :style="{ transform:`translateY(${padding}px)`, height: `${length}px` }" />
            <div ref="left" class="absolute left-0 h-full pointer-events-auto cursor-move" :style="{ transform:`translateX(${-padding}px)`, width: `${length}px` }">
                <!-- <div class="w-[200%] bg-white border-2 border-teal-600" :style="{ transform:`translateX(${padding * 0.3}px)`, height: `${length * 5}px`}"></div> -->
            </div>
            <div ref="right" class="absolute right-0 h-full pointer-events-auto cursor-move" :style="{ transform:`translateX(${padding}px)`, width: `${length}px` }" />
        </div>
    </div>
</template>