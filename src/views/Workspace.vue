<script setup lang="ts">
import Dropdown from '@/components/common/Dropdown.vue';
import PageHeader from '@/components/PageHeader.vue';
import Profile from '@/components/Profile.vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { type DesignResponseDTO } from '@/types/DTO';
import Vector2 from '@/types/Vector2';
import axios from 'axios';
import { onMounted, ref, useTemplateRef } from 'vue';

const auth = useAuthStore();
onMounted(() => {
    queryDesignList();
})

function queryDesignList() {
    if (!auth.isAuthenticated()) return;

    axios.get('/api/design', {
        params: {
            userId: auth.id,
        },
        headers: {
            Authorization: `Bearer ${auth.jwtToken}`
        }
    }).then(res => {
        designList.value = res.data.data;
    }).catch(err => {
        const statusCode = err.status;
        switch (statusCode) {
            case 401:
            case 403:
                console.error("JwtToken expired.");
                break;
            default:
                console.error("Unhandled error status:", statusCode);
        }
    })
}

function createNewDesign() {
    if (!auth.isAuthenticated()) return;

    axios.post('/api/design', {
        userId: auth.id,
        sourceId: null,
        isShared: false,
    }, {
        headers: {
            Authorization: `Bearer ${auth.jwtToken}`
        }
    }).then(res => {
        toEditorView(res.data.data.id);
    }).catch(err => {
        const statusCode = err.status;
        switch (statusCode) {
            case 401:
            case 403:
                console.error("JwtToken expired.");
                break;
            default:
                console.error("Unhandled error status:", statusCode);
        }
    })
}

const designList = ref<DesignResponseDTO[]>([]);

const menuSelection = ref<number>(0);

const orderDropdown = useTemplateRef<InstanceType<typeof Dropdown>>('order-dropdown');

const designDropdown = useTemplateRef<InstanceType<typeof Dropdown>>('design-dropdown');
const currentDesign = ref<DesignResponseDTO>();

const designDropdownPosition = ref<Vector2>(Vector2.ZERO);
function openDesignDropdown(e: PointerEvent, _currentDesign: DesignResponseDTO) {
    if (designDropdown.value?.show) return;

    designDropdownPosition.value = Vector2.PointFrom(e);
    currentDesign.value = _currentDesign;
    designDropdown.value?.open();
}

function toEditorView(designId: number) {
    router.push({ name: 'Editor', params: { id: designId } });
}

</script>

<template>
    <div class="w-full h-full flex flex-col">
        <PageHeader>
            <Profile />
        </PageHeader>
        <div class="flex flex-row min-h-0 flex-1">
            <ul class="flex-1/8 min-w-80 px-2 py-3 border-r border-gray-200">
                <li class="flex w-full h-12 p-2 mb-2 rounded-md hover:bg-gray-100 select-none cursor-pointer" @pointerup="menuSelection = 0; queryDesignList()"
                :class="{ 'bg-gray-200 hover:bg-gray-200': menuSelection === 0 }">
                    <div class="i-mdi:view-dashboard-edit-outline mr-2 w-8 h-8" />
                    <div class="leading-8">내 디자인</div>
                </li>

                <li class="flex w-full h-12 p-2 rounded-md hover:bg-gray-100 select-none cursor-pointer" @pointerup="menuSelection = 1"
                :class="{ 'bg-gray-200 hover:bg-gray-200': menuSelection === 1 }">
                    <div class="i-mdi:database-cog-outline mr-2 w-8 h-8" />
                    <div class="leading-8">저장소</div>
                </li>
            </ul>

            <div class="flex-7/8 w-full h-full">
                <div v-if="menuSelection === 0" class="flex flex-col h-full p-4 select-none">
                    <div class="flex h-10 mb-8">
                        <p class="text-left text-3xl font-bold">내 디자인</p>

                        <button @pointerup="createNewDesign()" class="w-40 h-10 p-2 ml-auto mr-2 rounded-md border-0 bg-teal-500 focus:brightness-110 hover:brightness-110" :style="{ outline: 'none' }">
                            <p class="text-white">디자인 만들기</p>
                        </button>

                        <div class="relative">
                            <div class="flex items-center w-36 h-10 p-2 rounded-md border border-gray-400"
                            :class="{ 'border-teal-400': orderDropdown?.show }" @pointerup="orderDropdown?.open()">
                                <p class="text-sm">수정일</p>
                                <div class="i-mdi-chevron-down ml-auto text-2xl" />
                            </div>

                            <Dropdown ref="order-dropdown" class="w-36">
                                <ul class="">
                                    <li class="h-8 leading-8 px-2 text-left text-sm text-teal-500 cursor-pointer hover:bg-gray-200">수정일</li>
                                    <li class="h-8 leading-8 px-2 text-left text-sm cursor-pointer hover:bg-gray-200">이름</li>
                                </ul>
                                <div class="my-1.5 border-b border-gray-200" />
                                <ul class="">
                                    <li class="h-8 leading-8 px-2 text-left text-sm cursor-pointer hover:bg-gray-200">오름차순</li>
                                    <li class="h-8 leading-8 px-2 text-left text-sm text-teal-500 cursor-pointer hover:bg-gray-200">내림차순</li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>

                    
                    <div class="flex-1 min-h-0 flex flex-col">
                        <ul class="flex w-full h-10 text-left text-gray-500 text-sm leading-6 border-b border-gray-400 overflow-auto [scrollbar-gutter:stable]">
                            <li class="grow px-4">이름</li>
                            <!-- <li class="w-2/16 ml-auto px-4">소유자</li> -->
                            <li class="w-2/16 px-4">수정일</li>
                            <li class="w-10 mr-4"></li>
                        </ul>
                        <ol class="flex-1 min-h-0 text-left overflow-auto [scrollbar-gutter:stable]">
                            <li v-for="design in designList" class="flex items-center w-full h-20 cursor-pointer hover:bg-gray-100"
                            @pointerup="toEditorView(design.id)">
                                <div class="grow flex items-center px-4">
                                    <!-- <button class="i-mdi:checkbox-blank-outline w-5 h-5 p-0 mr-4" /> -->
                                    <div class="h-14 aspect-video mr-4 rounded-md bg-gray-200"></div>
                                    <p>design.title</p>
                                </div>
                                <!-- <p class="w-2/16 ml-auto px-4">design.author</p> -->
                                <p class="w-2/16 px-4">design.editedAt</p>
                                <div class="w-10 mr-4">
                                    <button class="w-8 h-8 mr-4 p-2 rounded-md border-0 hover:bg-gray-300" :style="{ outline: 'none' }" @pointerup.stop="openDesignDropdown($event, design)">
                                        <div class="i-mdi:dots-horizontal w-4 h-4"></div>
                                    </button>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
        <Dropdown ref="design-dropdown" :style="{
            transform: `translate(${designDropdownPosition.x - 320}px, ${designDropdownPosition.y}px)`
        }">
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex flex-col justify-center w-auto h-12">
                    <p class="mb-1 text-left text-xl font-bold">design.title</p>
                    <p class="text-left text-xs text-gray-500">수정일: design.editedAt</p>
                    <p class="text-left text-xs text-gray-500">{{ currentDesign?.shared ? '공개됨' : '비공개' }}</p>
                </div>
            </div>
            <button @pointerup="" class="flex w-80 h-12 p-3 px-6 border-0 hover:bg-gray-200" :style="{ outline: 'none' }">
                <div class="w-6 h-6 mr-2 i-mdi:content-copy" />
                <p class="leading-6">사본 만들기</p>
            </button>
            <button @pointerup="" class="flex w-80 h-12 p-3 px-6 border-0 hover:bg-gray-200" :style="{ outline: 'none' }">
                <div class="w-6 h-6 mr-2 i-mdi:rename" />
                <p class="leading-6">이름 바꾸기</p>
            </button>
            <button @pointerup="" class="flex w-80 h-12 p-3 px-6 border-0 hover:bg-gray-200" :style="{ outline: 'none' }">
                <div class="w-6 h-6 mr-2 i-mdi:share-variant-outline" />
                <p class="leading-6">공유하기</p>
            </button>
            <button @pointerup="" class="flex w-80 h-12 p-3 px-6 border-0 hover:bg-gray-200" :style="{ outline: 'none' }">
                <div class="w-6 h-6 mr-2 i-material-symbols:delete-outline-rounded" />
                <p class="leading-6">삭제하기</p>
            </button>
        </Dropdown>
    </div>
</template>