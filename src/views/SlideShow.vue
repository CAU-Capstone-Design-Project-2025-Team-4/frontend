<script setup lang="ts">
import { inject, ref, watch, type Ref } from 'vue';
import router from '@/router';
import type UnityCanvas from '@/components/design/objects/UnityCanvas.vue';
import InteractiveCanvas from '@/components/InteractiveCanvas.vue';
import { useEventListener } from '@vueuse/core';

const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;
const isSlideShowEnded = ref<boolean>(false);

function handleFullscreen() {
    if (document.fullscreenElement) return;

    unity.value.sendMessage('EnableInput', 'false');
    router.back();
}

function exitFullscreen() {
    document.exitFullscreen();
    document.removeEventListener('keydown', onSpace);
}

watch(() => isSlideShowEnded.value, () => {
    if (isSlideShowEnded.value) {
        document.addEventListener('keydown', onSpace);
    }
})

function onSpace(e: KeyboardEvent) {
    if (e.code === 'Space') {
        exitFullscreen();
    }
}

useEventListener(document, 'fullscreenchange', handleFullscreen);
</script>
<template>
    <div v-if="!isSlideShowEnded" class="flex items-center w-full h-full bg-black">
        <!-- <div class="w-full aspect-video bg-white"></div> -->
        <InteractiveCanvas v-if="!isSlideShowEnded" v-model="isSlideShowEnded" class="w-full" />
    </div>
    <div v-else class="w-full h-full bg-black select-none" @pointerup.left="exitFullscreen()">
        <p class="pt-5 text-white text-lg">슬라이드 쇼가 종료되었습니다.</p>
    </div>
</template>