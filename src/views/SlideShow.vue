<script setup lang="ts">
import { useDesignStore } from '@/stores/design';
import Canvas from '@/components/design/Canvas.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import router from '@/router';

const design = useDesignStore();
const current = ref<number>(0);

function handleFullscreen() {
    if (document.fullscreenElement) return;
    router.back();
}

function nextSlide() {
    if (current.value < design.slides.length) {
        current.value++;
        return;
    } 
    document.exitFullscreen();
}

onMounted(() => {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
    document.addEventListener('fullscreenchange', handleFullscreen);
    document.addEventListener('pointerup', nextSlide);
});

onUnmounted(() => {
    document.removeEventListener('fullscreenchange', handleFullscreen);
    document.removeEventListener('pointerup', nextSlide);
});
</script>
<template>
    <Canvas v-if="current < design.slides.length" class="w-full h-full select-none" :slide="design.slides[current]" />
    <div v-else class="w-full h-full bg-black select-none">
        <p class="pt-5 text-white text-lg">슬라이드 쇼가 종료되었습니다.</p>
    </div>
</template>