<script setup lang="ts">
import type { ElementRef } from '@/components/design/Element.vue';
import type { TextBoxRef } from '@/types/ObjectRef';
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';

const { element } = defineProps<{
    element: ElementRef
}>();
const textBoxRef = ref<TextBoxRef>(element.objectRef as TextBoxRef);
const textBox = useTemplateRef<HTMLElement>('text-box');

function handleBlur() {
    window.getSelection()?.removeAllRanges();
    textBoxRef.value.text = textBox.value!.innerHTML;
}

let observer: ResizeObserver;
onMounted(() => {
    observer = new ResizeObserver(_ => {
        element.size.y = textBox.value!.clientHeight;
    });
    observer.observe(textBox.value!);
});

onBeforeUnmount(() => {
    observer.disconnect();
});
</script>

<template>
    <div ref="text-box" class="p-1 break-words break-all" :contenteditable="true" spellcheck="false" v-html="textBoxRef.text"
    :style="{ outline: 'none', fontSize: `60px`, textAlign: `left` }" 
    @blur="handleBlur()" />
</template>