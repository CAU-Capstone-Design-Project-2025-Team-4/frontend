<script setup lang="ts">
import Vector2 from '@/types/Vector2';
import { ref, useTemplateRef } from 'vue';
import { SketchPicker } from 'vue-color';

const emit = defineEmits<{
    closed: []
}>();

const color = defineModel<string>({
    required: true
});

const colorPicker = useTemplateRef<HTMLElement>('color-picker');
const show = ref<boolean>(false);
const position = ref<Vector2>(Vector2.Zero());

function open(e: PointerEvent) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    show.value = true;
    position.value = new Vector2(rect.x + rect.width + 20, rect.y);
    document.addEventListener('pointerdown', close, { capture: true });
}

function close(e: PointerEvent) {
    if (colorPicker.value?.contains(e.target as Node)) {
        e.stopPropagation();
        return;
    } 

    e.stopPropagation();
    show.value = false;
    emit('closed');

    document.removeEventListener('pointerdown', close, { capture: true });
}
</script>
<template>
    <div @pointerdown="open($event)">
        <slot />
        <Teleport to="#editor">
            <div ref="color-picker" v-show="show" class="absolute z-10000" :style="{
                left: `${position.x}px`,
                top: `${position.y}px`
            }">
                <SketchPicker v-model="color" />
            </div>
        </Teleport>
    </div>
    
</template>