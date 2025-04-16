<script setup lang="ts">
import HandleableCanvas from '@/components/design/HandleableCanvas.vue';
import UnityCanvas from '@/components/design/objects/UnityCanvas.vue';
import PageHeader from '@/components/PageHeader.vue';
import SideBar from '@/components/SideBar.vue';
import { useSelectorStore } from '@/stores/selector';
import { computed, inject, provide, useTemplateRef, type Ref } from 'vue';

const canvas = useTemplateRef<InstanceType<typeof HandleableCanvas>>('canvas');
provide('canvas', canvas);

const selector = useSelectorStore();
selector.deselectAll();

const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;
const isLoading = computed<boolean>(() => unity.value.isCreatingInstance);
// setInterval(() => console.log(isLoading.value), 500);

</script>

<template>
    <div id="editor" class="flex flex-col w-screen h-screen overflow-auto select-none">
        <PageHeader class="max-h-14 border-b border-gray-200" />
        <div class="flex flex-row min-h-64 flex-auto">
            <SideBar class="flex-1/6 min-w-100 border-r border-gray-200" />
            
            <div class="flex-5/6">
                <TransitionGroup name="fade">
                    <HandleableCanvas v-show="!isLoading" key="1" ref="canvas" />
                    <div v-show="isLoading" key="2" class="absolute left-0 top-0 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-70">
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