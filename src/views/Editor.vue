<script setup lang="ts">
import HandleableCanvas from '@/components/design/HandleableCanvas.vue';
import PageHeader from '@/components/PageHeader.vue';
import SideBar from '@/components/SideBar.vue';
import { useUnityStore } from '@/stores/unity';
import { nextTick, provide, useTemplateRef } from 'vue';

const canvas = useTemplateRef<InstanceType<typeof HandleableCanvas>>('canvas');
provide('canvas', canvas);

// if using 3d object...
const unity = useUnityStore();
unity.instantiate()
    .then(() => {
        canvas.value?.handleResize();
        unity.sendMessage('SetPlayMode', 'edit');
    });
</script>

<template>
    <div id="editor" class="absolute left-0 top-0 flex flex-col w-screen h-screen overflow-auto select-none">
        <PageHeader class="max-h-14 border-b border-gray-200" />
        <div class="flex flex-row min-h-64 flex-auto">
            <SideBar class="flex-1/6 min-w-100 border-r border-gray-200" />
            
            <div class="flex-5/6">
                <TransitionGroup name="fade">
                    <HandleableCanvas v-show="unity.hasInstance" key="1" ref="canvas" />
                    <div v-show="!unity.hasInstance" key="2" class="absolute left-0 top-0 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-70">
                        <span class="w-12 h-12 m-2 rounded-full border-4 border-white border-b-teal-400 animate-spin"></span>
                        <!-- <p class="mt-2 text-white text-2xl">Loading</p> -->
                    </div>
                </TransitionGroup>
            </div>
                
        </div>
    </div>
</template>

<style lang="css">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>