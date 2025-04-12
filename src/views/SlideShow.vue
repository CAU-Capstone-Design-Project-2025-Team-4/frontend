<script setup lang="ts">
import { useDesignStore } from '@/stores/design';
import Canvas from '@/components/design/Canvas.vue';
import { onMounted, onUnmounted, provide, ref } from 'vue';
import router from '@/router';
import { useUnityStore } from '@/stores/unity';

const design = useDesignStore();
const current = ref<number>(0);

const unity = useUnityStore();
unity.sendMessage('SetPlayMode', 'show');

function handleFullscreen() {
    if (document.fullscreenElement) return;
    router.back();
}


let focusUnity: boolean =  false;
function nextSlide(e: PointerEvent) {
    if (focusUnity) return;

    const target = e.target as HTMLElement;
    if (target.id === 'unity-canvas') {
        focusUnity = true;
        unity.sendMessage('EnableInput', 'true');
        document.addEventListener('keydown', removeFocus);
        return;
    }

    if (current.value < design.slides.length) {
        current.value++;
        return;
    } 
    document.exitFullscreen();
}

function removeFocus(e: KeyboardEvent) {
    if (e.key.toLowerCase() === 'q') {
        e.preventDefault();

        focusUnity = false;
        unity.sendMessage('EnableInput', 'false');
        document.removeEventListener('keydown', removeFocus);
    }
}

onMounted(() => {
    // if (document.documentElement.requestFullscreen) {
    //     document.documentElement.requestFullscreen();
    // }
    document.addEventListener('fullscreenchange', handleFullscreen);
    document.addEventListener('pointerup', nextSlide);
    // space key bidning
});

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreen);
    document.removeEventListener('pointerup', nextSlide);
});

provide('slide-show', true);
</script>
<template>
    <Canvas v-if="current < design.slides.length" class="w-full h-full select-none" :slide="design.slides[current]" />
    <div v-else class="w-full h-full bg-black select-none">
        <p class="pt-5 text-white text-lg">슬라이드 쇼가 종료되었습니다.</p>
    </div>
</template>