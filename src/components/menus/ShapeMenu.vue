<script setup lang="ts">
import { inject, type Ref } from 'vue';
import HandleableCanvas from '../design/HandleableCanvas.vue';
import Vector2 from '@/types/Vector2';
import { useDesignStore } from '@/stores/design';
import { ElementRef } from '../design/Element.vue';
import type { ShapeRef } from '@/types/ObjectRef';

interface Shape {
    path: string, 
    size: Vector2
}

interface ShapeGroup {
    name: string,
    shapes: Shape[]
}

const groups: ShapeGroup[] = [
    {
        name: '기본 도형',
        shapes: [
            { path: 'M 0 0 L 100 0 L 100 100 L 0 100 Z', size: new Vector2(200, 200) },
            { path: 'M 50 0 A 50 50 0 1 1 49.9 0', size: new Vector2(200, 200) },
            { path: 'M 0 100 L 100 100 L 50 0 Z', size: new Vector2(200, 200) },
            { path: 'M 50 0 L 0 36.33 L 20.69 100 L 79.31 100 L 100 36.33 Z',  size: new Vector2(200, 200) },   
        ]
    },
    {
        name: '화살표',
        shapes: [     
            { path: 'M 0 50 L 40 0 V35 H100 V65 H40 V100 Z', size: new Vector2(200, 160) },
        ]
    }
]

const design = useDesignStore();
const canvas = inject('canvas') as Ref<InstanceType<typeof HandleableCanvas>>;
    
function addElement(shape: Shape, point?: Vector2) {
    const position = point !== undefined ? canvas.value.toCanvasPoint(point) : new Vector2(960, 540);
    if (canvas.value.containPoint(position)) {
        design.addElement(new ElementRef(-1, position, 0, shape.size.clone(), 0, 
        { 
            path: shape.path, 
            color: 'rgb(200, 200, 200)', 
            borderRef: {
                type: 'none',
                color: '#000000',
                thickness: 1
            }
        } as ShapeRef));
    }
}
</script>

<template>
    <div>
        <div v-for="group in groups" class="mb-4 pl-3">
            <p class="text-left mb-2">{{ group.name }}</p>
            <div class="w-full h-full grid grid-cols-[repeat(5,_20%)] p-2 bg-slate-100 rounded-xl">
                <div v-for="shape in group.shapes" draggable="true" class="group w-full aspect-square bg-slate-100 flex items-center justify-center"
                @dblclick="addElement(shape)" @draover.prevent="" @dragend="addElement(shape, Vector2.PointFrom($event))">
                    <svg class="w-[70%] h-[70%] fill-slate-400 hover:fill-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path :d="shape.path" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>