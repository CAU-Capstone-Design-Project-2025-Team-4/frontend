<script setup lang="ts">
import api from '@/api/api';
import { encodeThumbnail } from '@/common/encode';
import { profileColor } from '@/components/Profile.vue';
import type { PostContentDTO } from '@/types/DTO';
import { computed, onMounted, ref } from 'vue';

const maxPage = ref<number>(20);
const currentPage = ref<number>(1);

const PAGE_SIZE = 20;

const postList = ref<PostContentDTO[]>([]);
function loadPage(index: number) {
    currentPage.value = index;
    api.get('/post', {
        params: {
            pageNumber: currentPage.value - 1,
            pageSize: PAGE_SIZE
        }
    }).then(res => {
        postList.value = res.data.data.content;
        postList.value.forEach(post => {
            post.thumbnail = encodeThumbnail(post.thumbnail);
        });
        maxPage.value = res.data.data.totalPages;
    });
}

const pageList = computed<number[]>(() => {
    let left = currentPage.value - 2;
    let right = currentPage.value + 2;

    right += Math.max(1 - left, 0);
    left -= Math.max(right - maxPage.value, 0);

    left = Math.max(left, 1);
    right = Math.min(right, maxPage.value);

    return Array.from({ length: Math.min(5, maxPage.value) }, (_, i) => i + left);
})

onMounted(() => loadPage(currentPage.value))
</script>

<template>
    <div>
        <div class="grid grid-cols-5 gap-x-6 gap-y-10 mt-12 select-none">
            <router-link v-for="post in postList" :to="`/gallery/${post.id}`" class="group w-full h-fit pb-2 mb-4 rounded-md cursor-pointer">
                <div class="w-full aspect-video rounded-md border border-gray-300 overflow-hidden">
                    <img :src="post.thumbnail" class="w-full h-full object-fill rounded-md transition-transform duration-300 ease-in-out group-hover:scale-115" />
                </div>

                <div class="mt-2 p-0.5">
                    <p class="text-left text-lg font-bold text-gray-900 break-all">{{ post.title }}</p>

                    <div class="flex h-8 mt-1">
                        <div class="w-8 h-8  p-0.67 overflow-hidden rounded-md" :style="{ backgroundColor: profileColor(post.username) }">
                            <p class="text-white text-[9.34px] w-full h-full leading-[26.64px] break-all">{{ post.username }}</p>
                        </div>
                        <p class="ml-2 text-left text-sm text-gray-700 leading-8 break-all">{{ post.username }}</p>
                    </div>
                </div>
            </router-link>
        </div>

        <div class="mt-6">
            <button @pointerup.left="loadPage(1)" class="pageButton hover:bg-gray-100"><<</button>
            <button v-for="index in pageList" @pointerup.left="loadPage(index)"
                class="pageButton hover:bg-gray-100" :class="{ 'font-bold text-teal-500 hover:bg-white': currentPage === index }">{{ index }}</button>
            <button @pointerup.left="loadPage(maxPage)" class="pageButton hover:bg-gray-100">>></button>
        </div>
        <div class="mt-6 h-0.1" />
    </div>
</template>

<style>
.pageButton {
    width: 40px;
    height: 40px;
    line-height: 40px;
    border-radius: 6px;
}
</style>