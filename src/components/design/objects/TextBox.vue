<script setup lang="ts">
import type { ElementRef } from '@/components/design/Element.vue';
import { useDesignStore } from '@/stores/design';
import { useSelectorStore } from '@/stores/selector';
import type { BorderRef, TextBoxRef } from '@/types/ObjectRef';
import Vector2 from '@/types/Vector2';
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue';

const { element } = defineProps<{
    element: ElementRef
}>();
const textBoxRef = computed<TextBoxRef>(() => element.objectRef as TextBoxRef);
const borderRef = computed<BorderRef>(() => textBoxRef.value.borderRef);

const textBox = useTemplateRef<HTMLElement>('text-box');

const selector = useSelectorStore();

const editable = ref<boolean>(false);
watch(() => selector.isSelected(element), () => {
    if (!selector.isSelected(element)) window.getSelection()?.removeAllRanges();
    setTimeout(() => {
        const isSelected = selector.isSelected(element);
        editable.value = isSelected;
    }, 100);
});

const design = useDesignStore();
function handleBlur() {
    textBoxRef.value.text = textBox.value!.innerHTML;
    design.updateObject(element);
}

let observer: ResizeObserver;
onMounted(() => {
    observer = new ResizeObserver(_ => {
        const delta = textBox.value!.clientHeight - element.size.y;

        const theta = element.rotation / 180 * Math.PI;
        const normal = new Vector2(-Math.sin(theta), Math.cos(theta));
        const magnitude = new Vector2(0, delta).rotate(theta).dot(normal);

        element.position.add(Vector2.Mult(normal, magnitude / 2));
        element.size.y = textBox.value!.clientHeight;
    });
    observer.observe(textBox.value!);
    //textShadow: `-${borderRef.thickness}px 0px ${borderRef.color} ${borderRef.thickness}px 0px ${borderRef.color} 0px -${borderRef.thickness}px ${borderRef.color} 0px -${borderRef.thickness}px ${borderRef.color}`
});

onBeforeUnmount(() => {
    observer.disconnect();
});
</script>

<template>
    <div ref="text-box" class="p-1 break-words break-all" 
    :contenteditable="editable" spellcheck="false" v-html="textBoxRef.text" :style="{
        outline: 'none',
        fontSize: `${textBoxRef.size}pt`,
        fontWeight: `${textBoxRef.weight}`,
        fontFamily: `${textBoxRef.fontFamily}`,
        textAlign: `${textBoxRef.align}`     
    }" @blur="handleBlur()" />
</template>