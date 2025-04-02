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
    TEXTBOX      = 1 << 4 | ROTATE,
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

let _position: Vector2 = Vector2.ZERO;
const position = ref<Vector2>(Vector2.ZERO);
const rotation = ref<number>(0);
const size = ref<Vector2>(Vector2.ZERO);
const scale = computed<number>(() => canvas.value?.scale);

const selectionRect = ref<{id: number, position: Vector2, rotation: number, size: Vector2}[]>([]);

watch(() => selector.idSelection, () => {
    if (selection.value.length <= 0) return;

    const rects = selection.value.map(obj => obj.getBoundingRect());

    const left = Math.min(...rects.map(rect => rect.left));
    const right = Math.max(...rects.map(rect => rect.right));
    const top = Math.min(...rects.map(rect => rect.top));
    const bottom = Math.max(...rects.map(rect => rect.bottom));

    // can be utilized

    if (selection.value.length == 1) {
        _position = selection.value[0].position;
        position.value = canvas.value.toScreenPoint(_position);
        rotation.value = selection.value[0].rotation;
        size.value = selection.value[0].size;
    } else {
        _position = new Vector2(left, top);
        position.value = canvas.value.toScreenPoint(_position);
        rotation.value = 0;
        size.value = new Vector2(right - left, bottom - top);  
    }

    selectionRect.value.length = 0;
    selection.value.forEach(element => {
        const rect = element.getBoundingRect();
        selectionRect.value.push({
            id: element.id,
            position: new Vector2(rect.left, rect.top),
            rotation: 0, // TODO
            size: new Vector2(rect.right - rect.left, rect.bottom - rect.top)
        })
    })
}, { deep: true });

watch(() => selection, () => {
    if (selection.value.length != 1) return;
    // position
    rotation.value = selection.value[0].rotation;
    size.value = selection.value[0].size;
}, { deep: true })


watch([() => canvas.value?.position], () => {
    position.value = canvas.value.toScreenPoint(_position);
}, { deep: true })


useDraggable(useTemplateRef<HTMLElement>('move-handler'), 1, (delta) => {
    if (selector.isDragSelecting) return;
    move(delta);
}, { auto: true, stop: true });

['left', 'right', 'top', 'bottom'].forEach(dir => useDraggable(useTemplateRef<HTMLElement>(dir), 1, (delta) => {
    move(delta);
}, { stop: true }));

function move(delta: Vector2) {
    selection.value.forEach(obj => obj.position.add(canvas.value.toCanvasSpace(delta)));
    selectionRect.value.forEach(obj => obj.position.add(canvas.value.toCanvasSpace(delta)));
    position.value.add(delta);
    _position = Vector2.Add(_position, canvas.value.toCanvasSpace(delta));
}


useDraggable(useTemplateRef<HTMLElement>('rotate-handler'), 1, (delta, start) => {
    const end: Vector2 = Vector2.Add(start!, delta);

    const center: Vector2 = Vector2.Add(_position, Vector2.Div(size.value, 2));
    const angle = Vector2.Sub(canvas.value.toCanvasPoint(end), center).angle() - Vector2.Sub(canvas.value.toCanvasPoint(start!), center).angle();
    rotation.value += angle * 180 / Math.PI;
    
    selection.value.forEach(element => {
        const c = Vector2.Div(element.size, 2);
        const v = Vector2.Add(c, element.position).sub(center);

        element.position.x = v.x * Math.cos(angle) - v.y * Math.sin(angle) + center.x - c.x;
        element.position.y = v.x * Math.sin(angle) + v.y * Math.cos(angle) + center.y - c.y;
        element.rotation += angle * 180 / Math.PI;    
    });
}, { stop: true });
</script>

<template>
    <div ref="handler" :class="{ 'invisible': isHandlerMatch(HandlerType.NONE) }" class="absolute pointer-events-none z-100 border-2 border-teal-400" :style="{
        transformOrigin: 'left top',
        transform: `translate(${position.x + size.x * scale / 2}px, ${position.y + size.y * scale / 2}px) rotate(${rotation}deg) translate(${-size.x * scale / 2}px, ${-size.y * scale / 2}px)  scale(${scale})`,
        width: `${size.x}px`,
        height: `${size.y}px`
    }">
        <!-- temp -->
        <div :class="{ 'invisible': !isHandlerMatch(HandlerType.MULTIOBJECT, true) }" v-for="element in selectionRect" class="absolute pointer-events-none border-2 border-teal-400" :style="{
            transform: `rotate(${element.rotation}deg) translate(${canvas.toScreenPoint(element.position).sub(position).div(scale).x - 2}px, ${canvas.toScreenPoint(element.position).sub(position).div(scale).y - 2}px)`,
            width: `${element.size.x}px`,
            height: `${element.size.y}px`
        }" />
        
        <div ref="move-handler" :class="{ 'invisible': !isHandlerMatch(HandlerType.MOVE) }" class="absolute w-full h-full pointer-events-auto" />
        <div :class="{ 'invisible': !isHandlerMatch(HandlerType.TEXTBOX) }" class="absolute w-full h-full pointer-events-none">
            <div ref="top" class="absolute top-0 w-full h-5 -my-4 pointer-events-auto cursor-move" />
            <div ref="bottom" class="absolute bottom-0 w-full h-5 -my-4 pointer-events-auto cursor-move" />
            <div ref="left" class="absolute left-0 w-5 -mx-4 h-full pointer-events-auto cursor-move" />
            <div ref="right" class="absolute right-0 w-5 -mx-4 h-full pointer-events-auto cursor-move" />
        </div>
        <div class="relative flex justify-center top-[100%] p-2">
            <div ref="rotate-handler" :class="{ 'invisible': !isHandlerMatch(HandlerType.ROTATE) }" 
            class="flex justify-center items-center pointer-events-auto rounded-full bg-slate-200 shadow-slate-700 shadow-xs" :style="{ width: `${24 + 8 / scale }px`, height: `${24 + 8 / scale }px` }">
                <div class="i-mdi:rotate-right text-[500%]" />
            </div>
            
        </div>
    </div>
</template>