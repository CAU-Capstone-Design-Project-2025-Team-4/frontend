<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { ref, useTemplateRef } from 'vue';

defineExpose({ open, close });
const emit = defineEmits<{
    closed: []
}>();

const modal = useTemplateRef<HTMLElement>('modal');
const show = ref<boolean>(false);

function onClickOutside(e: MouseEvent) {
    if (!modal.value?.contains(e.target as Node)) {
        console.log('close')
        close();
    }
}

function open() {
    show.value = true;
    setTimeout(() => document.addEventListener('click', onClickOutside), 1);
    // document.addEventListener('click', (e) => onClickOutside(e));
}

function close() {
    show.value = false;
    document.removeEventListener('click', onClickOutside);
    emit('closed');
}

useEventListener(document, 'keydown', (e) => {
    if (show.value) {
        if (e.key == "Escape") {
            close();
        }
    }
})
</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="absolute z-999">
            <div class="flex items-center justify-center w-screen h-screen bg-black bg-opacity-20">
                <div ref="modal" class="w-fit h-fit p-4 rounded-xl bg-white">
                    <div class="w-full h-8 mb-2">
                        <button class="float-right p-1.5 rounded-md hover:bg-gray-100" @pointerup.left="close()">
                            <div class="i-mdi:window-close text-xl" />
                        </button>
                    </div>
                    <div class="px-6 mb-6">
                        <slot />
                    </div>
                </div>
            </div>
        </div> 
    </Teleport>
</template>