<script setup lang="ts">
import router from '@/router';


</script>

<template>
    <div class="flex w-screen h-16 px-4 py-2 justify-between border-b border-gray-200">
        <button @pointerup="router.push('/')" class="p-0 text-2xl leading-12 border-0" :style="{ outline: 'none' }">P R I S M</button>

        <div class="flex ml-auto">
            <slot />
        </div>
        
    </div>
</template>