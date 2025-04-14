<script setup lang="ts">
import Vector2 from '@/types/Vector2';
import { ref, useTemplateRef } from 'vue';

defineExpose({ open });

const menu = useTemplateRef<HTMLElement>('context-menu')
const show = ref<boolean>(false);
const position = ref<Vector2>(Vector2.Zero());

function open(e: MouseEvent) {
    show.value = true;
    position.value = Vector2.PointFrom(e);
    document.addEventListener('pointerdown', close, { once: true, capture: true });
}

function close(e: PointerEvent) {
    if (!menu.value?.contains(e.target as Node))
        e.stopPropagation();
    show.value = false;
}
</script>

<template>
    <Teleport to="body">
        <div ref="context-menu" v-if="show" :style="{
            left: `${position.x}px`,
            top: `${position.y}px`
        }" class="absolute w-fit h-fit z-10000 rounded-xl border border-gray-100 bg-white shadow-lg">
            <ul class="p-3">
                <slot />
            </ul>
        </div>
    </Teleport>
</template>