<script setup lang="ts">
import { useStackingUtils } from '@/common/stacking';
import { useSelectorStore } from '@/stores/selector';

const stackingUtils = useStackingUtils();
const selector = useSelectorStore();
</script>
<template>
    <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerup.left="stackingUtils.bringFront(selector.selection)">
        <div class="i-mdi:arrange-bring-to-front w-6 h-10 font-light" />
        <p class="leading-10 px-2">맨 앞으로 가져오기</p>
    </li>
    <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerup.left="stackingUtils.bringForward(selector.selection)">
        <div class="i-mdi:arrange-bring-forward w-6 h-10 font-light" />
        <p class="leading-10 px-2">앞으로 가져오기</p>
    </li>
    <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerup.left="stackingUtils.sendBackward(selector.selection)">
        <div class="i-mdi:arrange-send-backward w-6 h-10 font-light" />
        <p class="leading-10 px-2">뒤로 보내기</p>
    </li>
    <li class="flex h-10 px-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerup.left="stackingUtils.sendBack(selector.selection)">
        <div class="i-mdi:arrange-send-to-back w-6 h-10 font-light" />
        <p class="leading-10 px-2">맨 뒤로 보내기</p>
    </li>
</template>