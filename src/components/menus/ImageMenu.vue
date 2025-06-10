<script setup lang="ts">
import { useDesignStore } from '@/stores/design';
import { ElementRef } from '../design/Element.vue';
import Vector2 from '@/types/Vector2';
import type { ImageRef } from '@/types/ObjectRef';

const design = useDesignStore();

function addImage(e: Event) {
    const input = e.target as HTMLInputElement;

    const fileReader = new FileReader();
    fileReader.readAsDataURL(input.files![0]);

    fileReader.onload = () => {
        const image = new Image();
        image.src = fileReader.result as string;

        image.onload = () => {
            const element = new ElementRef(-1, new Vector2(960, 540), 0, new Vector2(image.width, image.height), 0, { 
                imageFile: input.files![0],
                url: fileReader.result,
                borderRef: {
                    type: 'none',
                    color: '#000000',
                    thickness: 1
                } 
            } as ImageRef);
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
                <div class="w-full h-10 text-white leading-10 rounded-lg bg-teal-500 hover:brightness-110 cursor-pointer">
                    <p>이미지 업로드</p>
                </div>
            </label>
        </div>
    </div>
</template>