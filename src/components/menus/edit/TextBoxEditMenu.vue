<script setup lang="ts">
import TransformChevron from '@/components/design/common/TransformChevron.vue';
import { useSelectorStore } from '@/stores/selector';
import type { TextBoxRef } from '@/types/ObjectRef';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import ColorPicker from '@/components/common/ColorPicker.vue';
import { ElementRef } from '@/components/design/Element.vue';
import { useDesignStore } from '@/stores/design';

const selector = useSelectorStore();

const elementRef = computed<ElementRef>(() => selector.selection[0]);
const textRef = computed<TextBoxRef>(() => elementRef.value.objectRef as TextBoxRef);
const fontColor = ref<string>("#ffffff");
const highlightColor = ref<string>('#000000');


const styles = ref<{ [key: string]: boolean }>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false
});


function applyStyle(style: 'bold' | 'italic' | 'underline' | 'strikethrough') {
    document.execCommand(style);
}

function applyFontColor(type: 'foreColor' | 'backColor', color: string) {
    document.execCommand(type, false, color);
}

onMounted(() => {
    document.addEventListener('selectionchange', getSelectionStyles);
})

onBeforeUnmount(() => {
    document.removeEventListener('selectionchange', getSelectionStyles);
})

let selecionLength: string = '';
function getSelectionStyles() {
    const selection = window.getSelection();
    if (selection === null || selection.rangeCount < 1) return;

    if (selection.getRangeAt(0).toString() === selecionLength) return;
    selecionLength = selection.getRangeAt(0).toString();
    
    for (const style in styles.value) {
        styles.value[style] = document.queryCommandState(style);
    }
    fontColor.value = document.queryCommandValue('foreColor');
    highlightColor.value = document.queryCommandValue('backColor');
}

const design = useDesignStore();
function handleFontSize() {
    if (textRef.value.size.toString() === '') textRef.value.size = 0;
    design.debouncedUpdateObject(elementRef.value);
}

function chnageFontSize(size: number) {
    textRef.value.size = size;
    design.debouncedUpdateObject(elementRef.value);
}

function applyFontAlign(align: "left" | "center" | "right" | "justify") {
    textRef.value.align = align;
    design.updateObject(elementRef.value);
}
</script>

<template>
    <div class="font-bold text-xl text-left p-2 mb-2">텍스트</div>
    <div class="px-3">
        <div class="grid grid-cols-14 gap-3 mb-2">
            <div class="col-span-14 flex items-center justify-between w-full h-10 p-2 rounded-lg border border-gray-400 hover:border-teal-400">
                <p ckass="text-xs">Pretendard</p>
                <div class="i-mdi-chevron-down text-2xl" />
            </div>

            <div class="col-span-6 flex items-center justify-between h-10 rounded-lg border border-gray-400">
                <div class="w-8 h-full leading-9 text-2xl rounded-tl-lg rounded-bl-lg border-r border-gray-400 hover:bg-gray-100" @pointerdown="chnageFontSize(Math.round(textRef.size / 1.1))">-</div>
                <!-- <div class="text-sm border-gray-400 hover:border-teal-400">{{ textRef.size }}</div> -->
                <input v-model.number="textRef.size" class="w-12 h-full text-center" :style="{ outline: 'none' }" @input="handleFontSize()">
                <div class="w-8 h-full leading-9 text-2xl rounded-tr-lg rounded-br-lg border-l border-gray-400 hover:bg-gray-100" @pointerdown="chnageFontSize(Math.round(textRef.size * 1.1))">+</div>
            </div>
            <div class="col-span-8 flex items-center justify-between h-10 rounded-lg border border-gray-400">
                <div class="w-1/4 h-full p-1.5 text-2xl rounded-tl-lg rounded-bl-lg hover:bg-gray-100"
                :class="{ 'bg-gray-200 hover:bg-gray-200': styles['bold'] }" @pointerdown="applyStyle('bold')">
                    <div class="i-mdi:format-bold w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl border-x  border-gray-400 hover:bg-gray-100" 
                :class="{ 'bg-gray-200 hover:bg-gray-200': styles['italic'] }" @pointerdown="applyStyle('italic')">
                    <div class="i-mdi:format-italic w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl border-r border-gray-400 hover:bg-gray-100"
                :class="{ 'bg-gray-200 hover:bg-gray-200': styles['underline'] }" @pointerdown="applyStyle('underline')">
                    <div class="i-mdi:format-underline w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl rounded-tr-lg rounded-br-lg hover:bg-gray-100"
                :class="{ 'bg-gray-200 hover:bg-gray-200': styles['strikethrough'] }" @pointerdown="applyStyle('strikethrough')">
                    <div class="i-mdi:format-strikethrough w-full h-full text-center leading-10" />
                </div>
            </div>

            <div class="col-span-8 flex items-center justify-between h-10 rounded-lg border border-gray-400">
                <div class="w-1/4 h-full p-1.5 text-2xl rounded-tl-lg rounded-bl-lg hover:bg-gray-100" @pointerdown="applyFontAlign('left')"
                :class="{ 'bg-gray-200 hover:bg-gray-200': textRef.align === 'left' }">
                    <div class="i-mdi:format-align-left w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl border-x  border-gray-400 hover:bg-gray-100" @pointerdown="applyFontAlign('center')"
                :class="{ 'bg-gray-200 hover:bg-gray-200': textRef.align === 'center' }">
                    <div class="i-mdi:format-align-center w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl border-r border-gray-400 hover:bg-gray-100" @pointerdown="applyFontAlign('right')"
                :class="{ 'bg-gray-200 hover:bg-gray-200': textRef.align === 'right' }">
                    <div class="i-mdi:format-align-right w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl rounded-tr-lg rounded-br-lg hover:bg-gray-100" @pointerdown="applyFontAlign('justify')"
                :class="{ 'bg-gray-200 hover:bg-gray-200': textRef.align === 'justify' }">
                    <div class="i-mdi:format-align-justify w-full h-full text-center leading-10" />
                </div>
            </div>

            <div class="col-span-6 flex items-center justify-between h-10 mb-2 rounded-lg border border-gray-400">
                <ColorPicker v-model="fontColor" @closed="applyFontColor('foreColor', fontColor)"
                class="relative w-1/2 h-full p-1.5 text-2xl rounded-tl-lg rounded-bl-lg hover:bg-gray-100">
                    <div class="absolute left-[50%] i-mdi:format-color-text w-6 h-6 -ml-3" />
                    <div class="absolute left-[50%] top-7 w-6 h-1 -ml-3 rounded-xl" :style="{ backgroundColor: fontColor }" />
                </ColorPicker>
                <ColorPicker v-model="highlightColor" @closed="applyFontColor('backColor', highlightColor)"
                class="relative w-1/2 h-full p-1.5 text-2xl border-l rounded-tr-lg rounded-br-lg border-gray-400 hover:bg-gray-100">
                    <div class="absolute left-[50%] i-mdi:format-color-highlight w-6 h-6 -ml-3" />
                    <div class="absolute left-[50%] top-7 w-6 h-1 -ml-3 rounded-xl" :style="{ backgroundColor: highlightColor }" />
                </ColorPicker>
            </div>
        </div>

        <!-- <BorderChevron :border="textRef.borderRef" class="my-2" /> -->
        <TransformChevron :element="elementRef" :disable-y="true" />
    </div>
</template>