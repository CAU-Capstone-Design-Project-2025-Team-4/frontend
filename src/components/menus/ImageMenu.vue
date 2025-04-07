<script setup lang="ts">
import { useDesignStore } from '@/stores/design';
import { ElementRef } from '../design/Element.vue';
import Vector2 from '@/types/Vector2';

const design = useDesignStore();

function addImage(e: Event) {
    const input = e.target as HTMLInputElement;

    const fileReader = new FileReader();
    fileReader.readAsDataURL(input.files![0]);

    fileReader.onload = () => {
        const image = new Image();
        image.src = fileReader.result as string;

        image.onload = () => {
            const element = new ElementRef(new Vector2(960, 540), 0, new Vector2(image.width, image.height), 0, { url: fileReader.result });
            design.addElement(element);
        }
    }
}
</script>

<template>
    <div>
        <div class="pl-3">
            <input type="file" id="upload-image" accept="image/png, image/jpeg" hidden @change="addImage($event)" >
            <label for="upload-image">
                <div class="w-full h-12 rounded-xl bg-teal-500 hover:bg-teal-600">
                    <p class="text-white leading-12">이미지 업로드</p>
                </div>
            </label>
        </div>
    </div>
</template>