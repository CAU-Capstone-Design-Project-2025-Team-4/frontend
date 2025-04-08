<script setup lang="ts">
import TransformChevron from '@/components/common/TransformChevron.vue';
import { useSelectorStore } from '@/stores/selector';
import type { TextBoxRef } from '@/types/ObjectRef';
import { ref, watchEffect } from 'vue';
import ColorPicker from '@/components/common/ColorPicker.vue';
import Chevron from '@/components/common/Chevron.vue';


const selector = useSelectorStore();

const textRef = ref<TextBoxRef>(selector.selection[0].objectRef as TextBoxRef);
const color = ref<string>("rbg(0, 0, 0)");
watchEffect(() => {
    textRef.value = selector.selection[0].objectRef as TextBoxRef;
})
</script>

<template>
    <div class="font-bold text-xl text-left p-2 mb-2">텍스트</div>
    <div class="px-3">
        <div class="grid grid-cols-7 gap-3">
            <div class="col-span-7 flex items-center justify-between w-full h-10 p-2 rounded-lg border border-gray-400 hover:border-teal-400">
                <p ckass="text-xs">Pretendard</p>
                <div class="i-mdi-chevron-down text-2xl" />
            </div>

            <div class="col-span-3 flex items-center justify-between h-10 rounded-lg border border-gray-400">
                <div class="w-8 h-full leading-9 text-2xl rounded-tl-lg rounded-bl-lg border-r border-gray-400 hover:bg-gray-100">-</div>
                <div class="text-sm border-gray-400 hover:border-teal-400">{{ textRef.size }}</div>
                <div class="w-8 h-full leading-9 text-2xl rounded-tr-lg rounded-br-lg border-l border-gray-400 hover:bg-gray-100">+</div>
            </div>
            <div class="col-span-4 flex items-center justify-between h-10 rounded-lg border border-gray-400">
                <div class="w-1/4 h-full p-1.5 text-2xl rounded-tl-lg rounded-bl-lg hover:bg-gray-100">
                    <div class="i-mdi:format-bold w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl border-x  border-gray-400 hover:bg-gray-100">
                    <div class="i-mdi:format-italic w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl border-r border-gray-400 hover:bg-gray-100">
                    <div class="i-mdi:format-underline w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl rounded-tr-lg rounded-br-lg hover:bg-gray-100">
                    <div class="i-mdi:format-strikethrough w-full h-full text-center leading-10" />
                </div>
            </div>

            <div class="col-span-4 flex items-center justify-between h-10 rounded-lg border border-gray-400">
                <div class="w-1/4 h-full p-1.5 text-2xl rounded-tl-lg rounded-bl-lg hover:bg-gray-100">
                    <div class="i-mdi:format-align-left w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl border-x  border-gray-400 hover:bg-gray-100">
                    <div class="i-mdi:format-align-center w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl border-r border-gray-400 hover:bg-gray-100">
                    <div class="i-mdi:format-align-right w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/4 h-full p-1.5 text-2xl rounded-tr-lg rounded-br-lg hover:bg-gray-100">
                    <div class="i-mdi:format-align-justify w-full h-full text-center leading-10" />
                </div>
            </div>

            <div class="col-span-3 flex items-center justify-between h-10 mb-2 rounded-lg border border-gray-400">
                <div class="w-1/3 h-full p-1.5 text-2xl rounded-tl-lg rounded-bl-lg hover:bg-gray-100">
                    <div class="i-mdi:format-align-top w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/3 h-full p-1.5 text-2xl border-x border-gray-400 hover:bg-gray-100">
                    <div class="i-mdi:format-align-middle w-full h-full text-center leading-10" />
                </div>
                <div class="w-1/3 h-full p-1.5 text-2xl rounded-tr-lg rounded-br-lg hover:bg-gray-100">
                    <div class="i-mdi:format-align-bottom w-full h-full text-center leading-10" />
                </div>
            </div>
        </div>

        <div class="flex items-center justify-between w-full h-12 mb-2">
            <p class="text-left">텍스트 색</p>
            <ColorPicker v-model="color" class="w-8 h-8" />
        </div>

        <div class="flex items-center justify-between w-full h-12 mb-4">
            <p class="text-left">배경 색</p>
            <ColorPicker v-model="color" class="w-8 h-8" />
        </div>

        <Chevron :title="'테두리'" class="my-2">
            <div>

                </div>
        </Chevron>


        

        <TransformChevron :disable-y="true" />
    </div>
</template>