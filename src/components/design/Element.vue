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
        return {
            left: this.position.x,
            right: this.position.x + this.size.x,
            top: this.position.y,
            bottom: this.position.y + this.size.y
        }
    }
}
</script>

<script setup lang="ts">
import { instanceOfImageRef, instanceOfShapeRef, instanceOfTextBoxRef, type ObjectRef } from '@/types/ObjectRef';
import Vector2 from '@/types/Vector2';
import { computed } from 'vue';
import Shape from '@/components/design/objects/Shape.vue';
import TextBox from '@/components/design/objects/TextBox.vue';
import Image from './objects/Image.vue';

const { element, ratio } = defineProps<{
    element: ElementRef,
    ratio: number
}>();

const position = computed<Vector2>(() => Vector2.Mult(element.position, ratio));
</script>

<template>
    <div class="absolute" :style="{
        transformOrigin: 'left top',
        transform: `translate(${position.x}px, ${position.y}px) scale(${ratio})`,
        width: `${element.size.x}px`,
        height: `${element.size.y}px`,
        zIndex: `${element.z}`
    }">
        <Shape v-if="instanceOfShapeRef(element.objectRef)" :element="element" />
        <TextBox v-if="instanceOfTextBoxRef(element.objectRef)" :element="element" />
        <Image v-if="instanceOfImageRef(element.objectRef)" :element="element" />
    </div>
</template>