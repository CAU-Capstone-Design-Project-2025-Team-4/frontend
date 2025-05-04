<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref, useTemplateRef } from 'vue';

const dropdown = useTemplateRef<HTMLElement>('dropdown');
const show = ref<boolean>(false);
onClickOutside(dropdown, (_e) => {
    close();
})

function open() {
    if (show.value === true) return;  
    show.value = true;
}

function close() {
    show.value = false;
}

defineExpose({ open, close, show });
</script>

<template>
    <Transition>
        <div ref="dropdown" v-if="show" class="absolute z-999 py-1.5 rounded-lg bg-white shadow-md">
            <slot />
        </div>
    </Transition>
    
</template>

<style lang="css">
.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>