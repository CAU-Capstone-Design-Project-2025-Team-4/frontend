<script setup lang="ts">
import HandleableCanvas from '@/components/HandleableCanvas.vue';
import PageHeader from '@/components/PageHeader.vue';
import SideBar from '@/components/SideBar.vue';
</script>

<template>
    <div class="absolute left-0 top-0 flex flex-col w-screen h-screen overflow-auto select-none">
        <PageHeader class="max-h-14 border-b border-gray-200" />
        <div class="flex flex-row min-h-64 flex-auto">
            <SideBar class="flex-1/6 min-w-84 border-r border-gray-200" />
            <HandleableCanvas />
        </div>
    </div>
</template>