<script setup lang="ts">
import { useSelectorStore } from '@/stores/selector';
import Vector2 from '@/types/Vector2';
import { storeToRefs } from 'pinia';
import { computed, inject, ref, watchEffect, type Ref } from 'vue';
import HandleableCanvas from './HandleableCanvas.vue';
import { instanceOfTextBoxRef } from '@/types/ObjectRef';

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

function isHandlerMatch(handlerMask: HandlerType) {
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
})
</script>

<template>
    <div ref="handler" :class="{ 'invisible': isHandlerMatch(HandlerType.NONE) }" class="absolute pointer-events-none z-100 border-2 border-teal-400" :style="{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.x}px`,
        height: `${size.y}px`
    }">
    </div>
</template>