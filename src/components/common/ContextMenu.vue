<script setup lang="ts">
import Vector2 from '@/types/Vector2';
import { ref, useTemplateRef } from 'vue';

defineExpose({ open });

const menu = useTemplateRef<HTMLElement>('context-menu')
const showMenu = ref<boolean>(false);
const menuPosition = ref<Vector2>(Vector2.Zero());

function open(e: MouseEvent) {
    showMenu.value = true;
    menuPosition.value = Vector2.PointFrom(e);
    document.addEventListener('pointerdown', close, { once: true, capture: true });
}

function close(e: PointerEvent) {
    if (!menu.value?.contains(e.target as Node))
        e.stopPropagation();
    showMenu.value = false;
}
</script>

<template>
    <Teleport to="body">
        <div ref="context-menu" v-if="showMenu" :style="{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`
        }" class="absolute w-fit h-fit z-10000 rounded-xl border border-gray-100 bg-white shadow-lg">
            <ul class="p-3">
                <slot />
            </ul>
        </div>
    </Teleport>
</template>