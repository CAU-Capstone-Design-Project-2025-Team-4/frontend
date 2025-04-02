<script lang="ts">
export class ElementRef {
    id: number;
    position: Vector2;
    rotation: number;
    size: Vector2;
    z: number;
    objectRef: ObjectRef;

    static tempId: number = 0;
    constructor(position: Vector2, rotation: number, size: Vector2, z: number, objectRef: ObjectRef) {
        this.id = ElementRef.tempId++;
        this.position = position;
        this.rotation = rotation;
        this.size = size;
        this.z = z;
        this.objectRef = objectRef;
    }

    getBoundingRect(): { left: number, right: number, top: number, bottom: number } {
        const { x: w, y: h } = this.size;
        const angle = this.rotation / 180 * Math.PI;
        const width = Math.abs(w * Math.cos(angle)) + Math.abs(h * Math.sin(angle));
        const height = Math.abs(w * Math.sin(angle)) + Math.abs(h * Math.cos(angle));

        const paddingX = (width - w) / 2;
        const paddingY = (height - h) / 2;

        return {
            left: this.position.x - paddingX,
            right: this.position.x - paddingX + width,
            top: this.position.y - paddingY,
            bottom: this.position.y - paddingY + height
        }
    }
}
</script>

<script setup lang="ts">
import { instanceOfImageRef, instanceOfShapeRef, instanceOfTextBoxRef, type ObjectRef } from '@/types/ObjectRef';
import Vector2 from '@/types/Vector2';
import { computed, inject, onBeforeUnmount, onMounted, useTemplateRef } from 'vue';
import Shape from '@/components/design/objects/Shape.vue';
import TextBox from '@/components/design/objects/TextBox.vue';
import Image from './objects/Image.vue';
import { useSelectorStore } from '@/stores/selector';

const { element, ratio } = defineProps<{
    element: ElementRef,
    ratio: number
}>();

const position = computed<Vector2>(() => Vector2.Mult(element.position, ratio));
const center = computed<Vector2>(() => Vector2.Mult(element.size, -ratio / 2));

const elementDiv = useTemplateRef<HTMLElement>('element');
const handleable = inject<boolean>('handleable', false);

const selector = useSelectorStore();
function select(e: PointerEvent) {
    e.stopPropagation();
    if (e.button != 0) return

    if (!e.ctrlKey) {
        selector.deselectAll();
    }
    selector.select(element);
}

onMounted(() => {
    if (handleable) elementDiv.value?.addEventListener('pointerdown', select);
})

onBeforeUnmount(() => {
    if (handleable) elementDiv.value?.removeEventListener('pointerdown', select);
})

</script>

<template>
    <div ref="element" class="absolute" :style="{
        transformOrigin: 'left top',
        transform: `translate(${position.x - center.x}px, ${position.y - center.y}px) rotate(${element.rotation}deg) translate(${center.x}px, ${center.y}px)  scale(${ratio})`,
        width: `${element.size.x}px`,
        height: `${element.size.y}px`,
        zIndex: `${element.z}`,
    }">
        <Shape v-if="instanceOfShapeRef(element.objectRef)" :element="element" />
        <TextBox v-if="instanceOfTextBoxRef(element.objectRef)" :element="element" />
        <Image v-if="instanceOfImageRef(element.objectRef)" :element="element" />
    </div>
</template>