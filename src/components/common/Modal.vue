<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { ref, useTemplateRef } from 'vue';

defineExpose({ open, close });
const emit = defineEmits<{
    closed: []
}>();

const modal = useTemplateRef<HTMLElement>('modal');
const show = ref<boolean>(false);
onClickOutside(modal, _e => {
    close();
})

function open() {
    show.value = true;
}

function close() {
    show.value = false;
    emit('closed');
}

</script>

<template>
    <Teleport to="body">
        <div v-if="show" class="absolute z-999">
            <div class="flex items-center justify-center w-screen h-screen bg-black bg-opacity-20">
                <div ref="modal" class="w-fit h-fit p-4 rounded-xl bg-white">
                    <div class="w-full h-8 mb-2">
                        <div class="float-right p-1.5 rounded-md hover:bg-gray-100" @pointerup="close()">
                            <div class="i-mdi:window-close text-xl " />
                        </div>
                    </div>
                    <div class="px-6 mb-6">
                        <slot />
                    </div>
                </div>
            </div>
        </div> 
    </Teleport>
</template>