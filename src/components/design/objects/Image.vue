<script setup lang="ts">
import type { ImageRef } from '@/types/ObjectRef';
import type { ElementRef } from '@/components/design/Element.vue';
import { ref } from 'vue';
import axios from 'axios';

const { element } = defineProps<{
    element: ElementRef
}>();
const imageRef = ref<ImageRef>(element.objectRef as ImageRef);
</script>

<template>
    <img :src="imageRef.url" class="w-full h-full object-fill" />
</template>