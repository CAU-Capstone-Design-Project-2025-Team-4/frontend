<script setup lang="ts">
import Vector2 from '@/types/Vector2';
import TextBox from '../design/objects/TextBox.vue';
import { useDesignStore } from '@/stores/design';
import { ElementRef } from '../design/Element.vue';
import type { TextBoxRef } from '@/types/ObjectRef';
import { useSelectorStore } from '@/stores/selector';
import { nextTick } from 'vue';

interface TextBox {
    size: number,
    weight: number,
    // text: string,
    ref: TextBoxRef
}

const templates: TextBox[] = [
    {
        size: 24,
        weight: 800,
        ref: {
            text: "제목을 입력하세요.",
            size: 72,
            weight: 800,
            align: 'center'
        }
        
    },
    {
        size: 20,
        weight: 700,
        ref: {
            text: "부제목을 입력하세요.",
            size: 48,
            weight: 700,
            align: 'center'
        }
    },
    {
        size: 16,
        weight: 400,
        ref: {
            text: "내용을 입력하세요.",
            size: 16,
            weight: 400,
            align: 'center'
        }
    },
];

const design = useDesignStore();
const selector = useSelectorStore();
function addElement(template: TextBox) {
    const element = new ElementRef(new Vector2(960, 540), 0, new Vector2(template.ref.text.length * template.ref.size + 100, 200), 0, { text: template.ref.text, size: template.ref.size, weight: template.ref.weight });
    design.addElement(element);

    selector.deselectAll();
    nextTick(() => selector.select(element));
}
</script>

<template>
    <div>
        <div v-for="template in templates" class="pl-3">
            <div class="flex w-full h-12 mb-2 p-2 rounded-xl bg-slate-100 hover:bg-slate-200" @pointerdown="addElement(template)">
                <p class="w-full text-left leading-8" :style="{
                    fontSize: `${template.size}px`,
                    fontWeight: `${template.weight}`
                }">Hello World!</p>
                <p class="w-8 h-8 text-[32px] leading-7 text-slate-500">+</p>
            </div>
        </div>
    </div>
</template>