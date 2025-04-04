<script setup lang="ts">
import { ref } from 'vue';
import { SketchPicker } from 'vue-color';

const color = defineModel<string>({
    required: true
});

const opened = ref(false);
</script>
<template>
    <div class="rounded-lg border border-slate-400" :style="{ backgroundColor: color }" @pointerdown="opened = !opened">
        <div v-if="opened" class="absolute z-1000 px-16">
            <SketchPicker v-model="color" @pointerdown.stop="" />
        </div>
    </div>
</template>