<script setup lang="ts">
import { type BorderRef, type ShapeRef } from '@/types/ObjectRef';
import type { ElementRef } from '@/components/design/Element.vue';
import { computed } from 'vue';

const { element } = defineProps<{
    element: ElementRef
}>();
const shapeRef = computed<ShapeRef>(() => element.objectRef as ShapeRef);
const borderRef = computed<BorderRef>(() => shapeRef.value.borderRef);

const width = computed<number>(() => {
    if (element.size.x.toString() === '') return 0;
    return element.size.x;
});

const height = computed<number>(() => {
    if (element.size.y.toString() === '') return 0;
    return element.size.y;
})
</script>

<template>
    <svg :width="width" :height="height" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
	        <path :id="`path-${element.id}`" :d="shapeRef.path" vector-effect="non-scaling-stroke" />
	        <clipPath :id="`clip-${element.id}`">
		        <use :xlink:href="`#path-${element.id}`"/>
	        </clipPath>
        </defs>
        <g>
	        <use :xlink:href="`#path-${element.id}`" 
            :stroke-width="borderRef.type === 'none' ? 0 : borderRef.thickness" 
            :stroke="borderRef.color" 
            :fill="shapeRef.color" 
            :clip-path="`url(#clip-${element.id})`"/>
        </g>
    </svg>
</template>