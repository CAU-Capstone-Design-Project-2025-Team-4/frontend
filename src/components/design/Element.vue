<script lang="ts">
export class ElementRef {
    id: number;
    position: Vector2;
    rotation: number;
    size: Vector2;
    z: number;
    objectRef: ObjectRef;

    constructor(id: number, position: Vector2, rotation: number, size: Vector2, z: number, objectRef: ObjectRef) {
        this.id = id;
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

        return {
            left: this.position.x - width / 2,
            right: this.position.x + width / 2,
            top: this.position.y - height / 2,
            bottom: this.position.y + height / 2
        }
    }
}
</script>

<script setup lang="ts">
import { instanceOfImageRef, instanceOfShapeRef, instanceOfSpatialRef, instanceOfTextBoxRef, type ObjectRef } from '@/types/ObjectRef';
import Vector2 from '@/types/Vector2';
import Shape from '@/components/design/objects/Shape.vue';
import TextBox from '@/components/design/objects/TextBox.vue';
import Image from './objects/Image.vue';
import { useSelectorStore } from '@/stores/selector';
import Spatial from './objects/Spatial.vue';

const { element } = defineProps<{
    element: ElementRef
}>();

const selector = useSelectorStore();
function select(e: PointerEvent) {
    if (!e.ctrlKey) {
        selector.deselectAll();
    }
    selector.select(element);
}
</script>

<template>
    <div class="absolute" @pointerdown.left.stop="select($event)" :style="{
        transformOrigin: 'left top',
        transform: `translate(${element.position.x}px, ${element.position.y}px) rotate(${element.rotation}deg) translate(${-element.size.x / 2}px, ${-element.size.y / 2}px)`,
        width: `${Math.round(element.size.x)}px`,
        height: `${Math.round(element.size.y)}px`,
        zIndex: `${element.z + 1000}`,
    }">
        <Shape v-if="instanceOfShapeRef(element.objectRef)" :element="element" />
        <TextBox v-if="instanceOfTextBoxRef(element.objectRef)" :element="element" />
        <Image v-if="instanceOfImageRef(element.objectRef)" :element="element" />
        <Spatial v-if="instanceOfSpatialRef(element.objectRef)" :element="element" />
    </div>
</template>