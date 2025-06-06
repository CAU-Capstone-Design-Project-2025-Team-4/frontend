<script setup lang="ts">
import MainPageHeader from '@/components/MainPageHeader.vue';
</script>


<template>
    <div class="flex flex-col w-full h-full">
        <MainPageHeader />
        <div class="flex justify-center items-center h-full overflow-y-auto">
            <router-view class="w-screen-xl h-full" /> <!-- TODO: keep alive -->
        </div>
    </div>
</template>