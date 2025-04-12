<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { SketchPicker } from 'vue-color';

const color = defineModel<string>({
    required: true
});

const colorPicker = useTemplateRef<HTMLElement>('color-picker');
const opened = ref(false);

function open() {
    opened.value = true;
    document.addEventListener('pointerdown', close, { capture: true });
}

function close(e: PointerEvent) {
    if (colorPicker.value?.contains(e.target as Node)) {
        return;
    } 

    e.stopPropagation();
    opened.value = false;

    document.removeEventListener('pointerdown', close, { capture: true });
}
</script>
<template>
    <div class="rounded-lg border border-slate-400" :style="{ backgroundColor: color }" @pointerdown="open()">
        <div ref="color-picker" v-show="opened" class="absolute z-1000 mx-16">
            <SketchPicker v-model="color" @pointerdown.stop="" />
        </div>
    </div>
</template>