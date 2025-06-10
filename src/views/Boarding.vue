<script setup lang="ts">
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';

const auth = useAuthStore();
const modal = useModalStore();

function start() {
    if (!auth.isAuthenticated) {
        if (modal.registerModal) {
            modal.registerModal.open();
        }
    } else {
        router.push('/workspace');
    }
}
function toGallery() {
    router.push('/gallery');
}
</script>

<template>
    <div class="select-none">
        <div class="flex justify-between mt-16 px-10">
            <p class=" font-bold text-left text-6xl leading-20">나만의 독특한<br>3D CONTENTS를<br>디자인하세요</p>
        </div>

        <div class="flex items-center justify-left px-10 mt-6 text-lg">
            <button @pointerup.left="start()" class="w-50 h-14 mr-6 rounded-xl bg-teal-500 text-white hover:brightness-105">바로 시작하기</button>
            <div @pointerup.left="toGallery()" class="w-50 h-14 rounded-xl bg-white border-1 border-teal-500 text-teal-500 leading-14 cursor-pointer hover:bg-teal-50">갤러리 구경하기</div>
        </div>

        <p class="mt-30 font-bold text-3xl text-teal-400">PRISM으로 완성되는<br>개성있는 디자인</p>
        <p class="mt-4 font-light text-3xl">간편한 디자인을 위한 다양한 기능들</p>

        
        <div class="flex items-center justify-between mt-10 w-full h-110 px-10 rounded-2xl">
            <div class="w-67.5 mr-10 h-full">
                <div class="w-full h-80 i-mdi:view-dashboard-edit-outline"></div>
                <p class="mt-8 font-bold text-2xl">원하는 템플릿 선택</p>
                <p class="mt-2 text-gray-500">목적에 맞게 준비된<br>다양한 템플릿이 있어요</p>
            </div>
            <div class="w-67.5 mr-10 h-full">
                <div class="w-full h-80 i-mdi:cube-outline"></div>
                <p class="mt-8 font-bold text-2xl">3D 모델 추가</p>
                <p class="mt-2 text-gray-500">자신이 보유한 3D 모델을 추가하고<br>자유롭게 조작할 수 있어요</p>
            </div>
            <div class="w-67.5 mr-10 h-full">
                <div class="w-full h-80 i-material-symbols:animated-images-outline"></div>
                <p class="mt-8 font-bold text-2xl">애니메이션 효과</p>
                <p class="mt-2 text-gray-500">더욱 생동감있는 전달을 위한<br>애니메이션을 손쉽게 적용할 수 있어요</p>
            </div>
            <div class="w-67.5 h-full">
                <div class="w-full h-80 i-mdi:share-outline"></div>
                <p class="mt-8 font-bold text-2xl">다양한 형태로의 활용</p>
                <p class="mt-2 text-gray-500">프레젠테이션, 포트폴리오, 교육 자료 등의<br>원하는 형태로 활용할 수 있어요</p>
            </div>

        </div>

        <div class="h-1 mt-20"></div>

    </div>
</template>