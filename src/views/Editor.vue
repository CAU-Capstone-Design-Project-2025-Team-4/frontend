<script setup lang="ts">
import HandleableCanvas from '@/components/design/HandleableCanvas.vue';
import PageHeader from '@/components/PageHeader.vue';
import SideBar from '@/components/SideBar.vue';
import { provide, useTemplateRef } from 'vue';

const canvas = useTemplateRef<InstanceType<typeof HandleableCanvas>>('canvas');
provide('canvas', canvas);
</script>

<template>
    <div class="flex flex-col w-screen h-screen overflow-auto select-none">
        <PageHeader class="max-h-14 border-b border-gray-200" />
        <div class="flex flex-row min-h-64 flex-auto">
            <SideBar class="flex-1/6 min-w-84 border-r border-gray-200" />
            <HandleableCanvas ref="canvas" />
        </div>
    </div>
</template>