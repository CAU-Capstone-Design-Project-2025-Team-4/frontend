<script setup lang="ts">
import router from '@/router';
import { useSelectorStore } from '@/stores/selector';

const selector = useSelectorStore();
function enterSlideShow() {
    selector.deselectAll();
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
    setTimeout(() => router.push('/show'), 10);
    
}
</script>

<template>
    <div class="flex w-full h-full px-4 py-2 justify-between">
        <h1 class="pl-2 text-2xl leading-10">P R I S M</h1>

        <div class="flex ml-auto mr-4 p-2 items-center justify-center rounded-lg shadow-sm bg-teal-100 hover:bg-teal-200">
            <div class="i-material-symbols:share-outline mr-2 text-xl text-teal-800" />
            <p class="text-sm text-teal-800">공유</p>
        </div>
        <div class="flex mr-4 p-2 items-center justify-center rounded-lg shadow-sm bg-teal-100 hover:bg-teal-200">
            <div class="i-material-symbols:download-rounded mr-2 text-xl text-teal-800" />
            <p class="text-sm text-teal-800">저장</p>
        </div>
        <div class="flex p-2 items-center justify-center rounded-lg shadow-sm bg-teal-100 hover:bg-teal-200" @click="enterSlideShow()">
            <div class="i-mdi:presentation-play mr-2 text-xl text-teal-800" />
            <p class="text-sm text-teal-800">슬라이드 쇼</p>
        </div>
    </div>
</template>