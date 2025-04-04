<script setup lang="ts">
import { ref, shallowRef, type Component, type ShallowRef } from 'vue';
import SlideMenu from '@/components/menus/SlideMenu.vue';
import TemplateMenu from '@/components/menus/TemplateMenu.vue';
import ShapeMenu from '@/components/menus/ShapeMenu.vue';
import ImageMenu from '@/components/menus/ImageMenu.vue';
import TextMenu from '@/components/menus/TextMenu.vue';
import SpatialMenu from '@/components/menus/SpatialMenu.vue';

interface Menu {
    name: string,
    icon: string,
    component: ShallowRef<Component>
}
const menuList: Menu[] = [
    {
        name: '슬라이드',
        icon: 'i-mdi:card-multiple-outline',
        component: shallowRef(SlideMenu)
    },
    {
        name: '템플릿',
        icon: 'i-mdi:view-dashboard-edit-outline',
        component: shallowRef(TemplateMenu)
    },
    {
        name: '모양',
        icon: 'i-mdi:shape-plus-outline',
        component: shallowRef(ShapeMenu)
    },
    {
        name: '이미지',
        icon: 'i-mdi:image-outline',
        component: shallowRef(ImageMenu)
    },
    {
        name: '텍스트',
        icon: 'i-mdi:format-text',
        component: shallowRef(TextMenu)
    },
    {
        name: '3D',
        icon: 'i-mdi:cube-outline',
        component: shallowRef(SpatialMenu)
    },
];

const selection = ref<number>(2);
const select = (index: number) => selection.value = index;
const isSelected = (index: number) => selection.value === index;

</script>


<template>
    <div class="flex">
        <div class="w-20 p-2 border-r border-gray-200">
            <div v-for="(menu, index) in menuList" class="flex flex-col w-16 h-16 p-1 mb-2 items-center justify-center rounded-[15%] hover:bg-teal-100"
            :class="{ 'bg-teal-100' : isSelected(index) }" @pointerdown="select(index)">
                <div class="w-6 h-6" :class="[ { 'text-teal-800' : isSelected(index) }, menu.icon ]"></div>
                <div class="text-sm" :class="{ 'text-teal-800' : isSelected(index) }">
                    {{ menu.name }}
                </div>
            </div>
        </div>
        <div class="w-full px-2 py-4 overflow-auto [scrollbar-gutter:stable]">
            <component :is="menuList[selection].component.value" />

        </div>
    </div>
</template>