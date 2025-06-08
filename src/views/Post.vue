<script setup lang="ts">
import api from '@/api/api';
import { profileColor } from '@/components/Profile.vue';
import Canvas from '@/components/design/Canvas.vue';
import router from '@/router';
import { useDesignStore } from '@/stores/design';
import type { PostContentDTO } from '@/types/DTO';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const title = ref<string>('나의 첫 포트폴리오');
const description = ref<string>('포트폴리오 소개입니다...<br>여러 줄 작성가능합니다');
const name = ref<string>('이름 1234');
const email = ref<string>('example@gmail.com');
const createdAt = ref<string>('');

const currentSlide = ref<number>(1);
const maxSlide = ref<number>(3);

const design = useDesignStore();
const hasLoaded = ref<boolean>(false);

onMounted(async () => {
    const postId = useRoute().params.id;
    const designId = await api.get(`/post/${postId}`).then(res => {
        const data: PostContentDTO = res.data.data;

        title.value = data.title;
        description.value = data.content;
        name.value = data.username;
        email.value = data.userEmail;
        createdAt.value = data.createdAt;

        return data.designId;
    });

    await design.load(designId);
    hasLoaded.value = true;

    currentSlide.value = 1;
    maxSlide.value = design.slides.length;
})

watch(() => currentSlide.value, () => {
    design.selectSlide(currentSlide.value - 1);
})

function toFirst() {
    currentSlide.value = 1;
}

function toPrevious() {
    if (currentSlide.value > 1) currentSlide.value -= 1;
}

function toNext() {
    if (currentSlide.value < maxSlide.value) currentSlide.value += 1;
}

function toLast() {
    currentSlide.value = maxSlide.value;
}
</script>

<template>
    <div v-if="hasLoaded">
        <div class="mt-12">
            <p class="text-left text-5xl font-bold">{{ title }}</p>

            <div class="flex mt-5">
                <div class="w-12 h-12 p-1 overflow-hidden rounded-md select-none" 
                :style="{ backgroundColor: profileColor(name) }">
                    <p class="text-white text-sm w-full h-full leading-10 break-all">{{ name }}</p>
                </div>
                <div class="flex flex-col justify-center w-auto h-12 ml-4">
                    <p class="text-left font-semibold">{{ name }}</p>
                    <p class="text-left font-light text-xs text-gray-500">{{ email }}</p>
                </div>

                <p class="mt-6 ml-12 leading-6 text-gray-500">{{ createdAt.split('T')[0] }}</p>
            </div>

            <div class="w-full aspect-video overflow-hidden mt-10 select-none">
                <div class="relative" :style="{
                    transformOrigin: `left top`,
                    transform: `scale(${2/3})`,
                    width: `${1920}px`,
                    height: `${1080}px`
                }">
                    <Canvas :slide="design.currentSlide" class="w-full aspect-video" />
                </div>
            </div>
            

            <div class="relative w-full h-12 p-2 bg-gray-100 select-none">
                <button @pointerup.left="toFirst()" class="absolute left-[40%] mr-4 w-8 h-8 rounded-md hover:bg-gray-300" >
                    <div class="w-full h-full i-mdi:skip-previous-outline" />
                </button>

                <button @pointerup.left="toPrevious()" class="absolute left-[44%] mr-4 w-8 h-8 rounded-md hover:bg-gray-300">
                    <div class="w-full h-full i-mdi:chevron-left" />
                </button>

                <p class="absolute left-[48%] mr-4 w-8 h-8 text-xl font-bold leading-8">{{ currentSlide }}</p>
                <p class="absolute left-[50%] mr-4 w-8 h-8 text-xl font-extrabold leading-8">/</p>
                <p class="absolute left-[52%] mr-4 w-8 h-8 text-xl font-bold leading-8">{{ maxSlide }}</p>

                <button @pointerup.left="toNext()" class="absolute left-[56%] mr-4 w-8 h-8 rounded-md hover:bg-gray-300">
                    <div class="w-full h-full i-mdi:chevron-right" />
                </button>

                <button @pointerup.left="toLast()" class="absolute left-[60%] mr-4 w-8 h-8 rounded-md hover:bg-gray-300">
                    <div class="w-full h-full i-mdi:skip-next-outline" />
                </button>

                <button class="absolute right-2 w-8 h-8 rounded-md hover:bg-gray-300">
                    <div class="w-full h-full i-mdi:fullscreen" />
                </button>
            </div>

            <div class="mt-10">
                <p class="text-xl text-left font-bold select-none">작품 소개</p>
                <p v-html="description" class="mt-2 text-left" />
            </div>

            <!-- <div class="mt-10">
                <div class="flex select-none">
                    <p class="text-teal-500 text-left text-xl font-bold">{{ name }}</p>
                    <p class="ml-1 text-xl">님의 다른 포트폴리오</p>
                </div>
                <div class="flex flex-nowrap space-x-6 w-full h-54 mt-1 py-2 overflow-x-auto">
                    <div v-for="_ in 10" class="group aspect-video h-full bg-gray-200 rounded-md cursor-pointer ">
                        <div class="w-full h-full rounded-md overflow-hidden">
                            <img src="/thumb.jpg" class="w-full h-full object-fill rounded-md transition-transform duration-300 ease-in-out group-hover:scale-115" />
                        </div>
                    </div>
                </div>
            </div> -->

            <div class="flex justify-end mt-10 pb-20">
                <div @pointerup.left="router.push('/gallery')" class="flex justify-center w-28 h-10 p-2 rounded-md border-1 border-gray-400 
                select-none cursor-pointer hover:bg-gray-100">
                    <div class="w-6 h-6 i-mdi:menu" />
                    <p class="ml-2">목록보기</p>
                </div>
            </div>
        </div>

    </div>
</template>