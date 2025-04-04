<script setup lang="ts">
import { ref } from 'vue';

const { title } = defineProps<{
    title: String
}>();

const opened = ref<boolean>(false);
</script>

<template>
    <div>
        <div class="flex items-center justify-between w-full h-10 p-3 rounded-md hover:bg-slate-50" @pointerdown="opened = !opened">
            <p class="text-left">{{ title }}</p>
            <div :class="[ opened ? 'i-mdi:chevron-up' : 'i-mdi:chevron-down' ]" />
        </div>
        <Transition name="down-fade">
            <div v-if="opened">
                <slot />
            </div>
        </Transition>
    </div>
</template>

<style>
.down-fade-enter-active,
.down-fade-leave-active {
  transition: all 0.1s ease-out;
}


.down-fade-enter-from,
.down-fade-leave-to {
  transform: translateY(-5px);
  opacity: 0;
}
</style>