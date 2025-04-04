<script setup lang="ts">
import { useSelectorStore } from '@/stores/selector';
import Vector2 from '@/types/Vector2';
import { storeToRefs } from 'pinia';
import { computed, inject, onMounted, ref, useTemplateRef, watch, watchEffect, type Ref } from 'vue';
import HandleableCanvas from './HandleableCanvas.vue';
import { instanceOfTextBoxRef } from '@/types/ObjectRef';
import { useDraggable } from '@/common/draggable';
import type { ElementRef } from './Element.vue';

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

let _position: Vector2 = Vector2.Zero();
const position = ref<Vector2>(Vector2.Zero());
const rotation = ref<number>(0);
const size = ref<Vector2>(Vector2.Zero());
const scale = computed<number>(() => canvas.value?.scale);

const selectionRect = ref<{id: number, position: Vector2, rotation: number, size: Vector2}[]>([]);

watch(() => selector.idSelection, () => {
    if (selection.value.length <= 1) return;

    const rects = selection.value.map(obj => obj.getBoundingRect());

    const left = Math.min(...rects.map(rect => rect.left));
    const right = Math.max(...rects.map(rect => rect.right));
    const top = Math.min(...rects.map(rect => rect.top));
    const bottom = Math.max(...rects.map(rect => rect.bottom));

    _position = new Vector2((left + right) / 2, (top + bottom) / 2);
    position.value = canvas.value.toScreenPoint(_position);
    rotation.value = 0;
    size.value = new Vector2(right - left, bottom - top);

    selectionRect.value.length = 0;
    selection.value.forEach(element => {
        const { left: l, right: r, top: t, bottom: b } = element.getBoundingRect();
        selectionRect.value.push({
            id: element.id,
            position: new Vector2(l - left, t - top),
            rotation: 0, // TODO
            size: new Vector2(r - l, b - t)
        });
    })
}, { deep: true });

watch(() => selection, () => {
    if (selection.value.length != 1) return;
    const element: ElementRef = selection.value[0];

    _position = element.position.clone();
    position.value = canvas.value.toScreenPoint(_position);
    rotation.value = element.rotation;
    size.value = element.size;
}, { deep: true })


watch([() => canvas.value?.position], () => {
    position.value = canvas.value.toScreenPoint(_position);
}, { deep: true })


useDraggable(useTemplateRef<HTMLElement>('move-handler'), 1, (delta) => {
    if (selector.isDragSelecting) return;
    move(delta);
}, { auto: true, stop: true });

['textbox-n', 'textbox-w', 'textbox-s', 'textbox-e'].forEach(ref => useDraggable(useTemplateRef<HTMLElement>(ref), 1, (delta) => {
    move(delta);
}, { stop: true }));


useDraggable(useTemplateRef<HTMLElement>('rotate-handler'), 1, (delta, start) => {
    const end: Vector2 = Vector2.Add(start!, delta);

    const center: Vector2 = _position.clone();
    const angle = Vector2.Sub(canvas.value.toCanvasPoint(end), center).angle() - Vector2.Sub(canvas.value.toCanvasPoint(start!), center).angle();
    rotation.value += angle * 180 / Math.PI;
    
    selection.value.forEach(element => {
        const v = Vector2.Sub(element.position, center);

        element.position = v.rotate(angle).add(center);
        element.rotation += angle * 180 / Math.PI;    
    });
}, { stop: true });


['resize-n', 'resize-s', 'resize-w', 'resize-e', 'resize-nw', 'resize-sw', 'resize-ne', 'resize-se']
.forEach(dir => useDraggable(useTemplateRef(dir), 1, (delta) => {
    resize(dir, delta);
}, { stop: true }));

['resize-w', 'resize-e'].forEach(dir => useDraggable(useTemplateRef('textbox-' + dir), 1, (delta) => {
    resize(dir, delta)
}, { stop: true }));


function move(delta: Vector2) {
    selection.value.forEach(obj => obj.position.add(canvas.value.toCanvasSpace(delta)));
    _position = Vector2.Add(_position, canvas.value.toCanvasSpace(delta));
    position.value.add(delta);
}

// use cache?
// rotate / resize function to ElementRef class?
function calcResizeParams(direction: String, element: ElementRef): { normal: Vector2, ratio: Vector2 } {
    const sizeNormal = element.size.normalized();
    const theta = element.rotation / 180 * Math.PI;
    const phi = element.size.angle();
    switch (direction) {    
        case 'resize-n': return { 
            normal: new Vector2(Math.sin(theta), -Math.cos(theta)),
            ratio: Vector2.DOWN
        };
        case 'resize-w': return { 
            normal: new Vector2(-Math.cos(theta), -Math.sin(theta)),
            ratio: Vector2.RIGHT
        };
        case 'resize-s': return { 
            normal: new Vector2(-Math.sin(theta), Math.cos(theta)),
            ratio: Vector2.DOWN
        };
        case 'resize-e': return { 
            normal: new Vector2(Math.cos(theta), Math.sin(theta)),
            ratio: Vector2.RIGHT
        };

        case 'resize-nw': return { 
            normal: new Vector2(-Math.cos(theta + phi), -Math.sin(theta + phi)),
            ratio: sizeNormal.clone()
        };
        case 'resize-ne': return { 
            normal: new Vector2(Math.cos(theta - phi), Math.sin(theta - phi)),
            ratio: sizeNormal.clone()
        };
        case 'resize-sw': return { 
            normal: new Vector2(-Math.cos(theta - phi), -Math.sin(theta - phi)),
            ratio: sizeNormal.clone()
        };
        case 'resize-se': return { 
            normal: new Vector2(Math.cos(theta + phi), Math.sin(theta + phi)),
            ratio: sizeNormal.clone()
        };
        default: return { normal: Vector2.Zero(), ratio: Vector2.Zero() };
    }
}

function resize(dir: string, delta: Vector2) {
    const element = selection.value[0];

    const { normal, ratio } = calcResizeParams(dir, element);
    const magnitude = canvas.value.toCanvasSpace(delta).dot(normal);

    element.size.add(Vector2.Mult(ratio, magnitude));
    element.position.add(Vector2.Mult(normal, magnitude / 2));
}

</script>

<template>
    <div ref="handler" :class="{ 'invisible': isHandlerMatch(HandlerType.NONE) }" class="absolute pointer-events-none z-100 outline-2 outline-solid outline-teal-400" :style="{
        transform: `translate(${position.x - size.x / 2}px, ${position.y - size.y / 2}px) rotate(${rotation}deg) scale(${scale})`,
        width: `${size.x}px`,
        height: `${size.y}px`
    }">
        <!-- temp -->
        <div :class="{ 'invisible': !isHandlerMatch(HandlerType.MULTIOBJECT, true) }" v-for="element in selectionRect" class="absolute  pointer-events-none outline-2 outline-solid outline-teal-400" :style="{
            transform: `translate(${element.position.x}px, ${element.position.y}px) rotate(${element.rotation})`,
            width: `${element.size.x}px`,
            height: `${element.size.y}px`
        }" />
        
        <div ref="move-handler" :class="{ 'invisible': !isHandlerMatch(HandlerType.MOVE) }" class="absolute w-full h-full pointer-events-auto" />

        <div :class="{ 'invisible': !isHandlerMatch(HandlerType.RESIZE) }" class="absolute w-full h-full pointer-events-none ">
            <div ref="resize-n" class="absolute top-0 w-full h-8 -my-4 pointer-events-auto cursor-n-resize" />
            <div ref="resize-s" class="absolute bottom-0 w-full h-8 -my-4 pointer-events-auto cursor-s-resize" />
            <div ref="resize-w" class="absolute left-0 w-8 h-full -mx-4 pointer-events-auto cursor-w-resize" />
            <div ref="resize-e" class="absolute right-0 w-8 h-full -mx-4 pointer-events-auto cursor-e-resize" />

            <div ref="resize-nw" class="absolute top-0 left-0 w-8 h-8 -m-4 p-2 pointer-events-auto cursor-nw-resize">
                <div class="w-4 h-4 rounded-full bg-white border-2 border-teal-400" />
            </div>
            <div ref="resize-sw" class="absolute bottom-0 left-0 w-8 h-8 -m-4 p-2 pointer-events-auto cursor-sw-resize">
                <div class="w-4 h-4 rounded-full bg-white border-2 border-teal-400" />
            </div>
            <div ref="resize-ne" class="absolute top-0 right-0 w-8 h-8 -m-4 p-2 pointer-events-auto cursor-ne-resize">
                <div class="w-4 h-4 rounded-full bg-white border-2 border-teal-400" />
            </div>
            <div ref="resize-se" class="absolute bottom-0 right-0 w-8 h-8 -m-4 p-2 pointer-events-auto cursor-se-resize">
                <div class="w-4 h-4 rounded-full bg-white border-2 border-teal-400" />
            </div>
        </div>

        <div :class="{ 'invisible': !isHandlerMatch(HandlerType.TEXTBOX, true) }" class="absolute w-full h-full pointer-events-none">
            <div ref="textbox-n" class="absolute top-0 w-full h-6 -my-4 pointer-events-auto cursor-move" />
            <div ref="textbox-s" class="absolute bottom-0 w-full h-6 -my-4 pointer-events-auto cursor-move" />
            <div ref="textbox-w" class="absolute left-0 w-6 -mx-4 h-full pointer-events-auto cursor-move flex justify-center items-center">
                <div ref="textbox-resize-w" class="w-3 h-8 ml-1.5 rounded-full bg-white border-2 border-teal-400 cursor-w-resize" />
            </div>
            <div ref="textbox-e" class="absolute right-0 w-6 -mx-4 h-full pointer-events-auto cursor-move flex justify-center items-center">
                <div ref="textbox-resize-e" class="w-3 h-8 mr-1.5 rounded-full bg-white border-2 border-teal-400 cursor-e-resize" />
            </div>
        </div>

        <div class="relative flex justify-center top-[100%] p-4">
            <div ref="rotate-handler" :class="{ 'invisible': !isHandlerMatch(HandlerType.ROTATE) }" 
            class="flex justify-center items-center pointer-events-auto rounded-full bg-slate-200 shadow-slate-700 shadow-xs" :style="{ width: `${24 + 8 / scale }px`, height: `${24 + 8 / scale }px` }">
                <div class="i-mdi:rotate-right text-[500%]" />
            </div>
        </div>
    </div>
</template>