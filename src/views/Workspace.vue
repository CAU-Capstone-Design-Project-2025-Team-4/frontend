<script setup lang="ts">
import api from '@/api/api';
import { encodeThumbnail } from '@/common/encode';
import Dropdown from '@/components/common/Dropdown.vue';
import Modal from '@/components/common/Modal.vue';
import PageHeader from '@/components/PageHeader.vue';
import Profile, { profileColor } from '@/components/Profile.vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import type { DetailedTemplateDTO, DesignListResponseDTO, TemplateDTO } from '@/types/DTO';
import Vector2 from '@/types/Vector2';
import { computed, onMounted, ref, useTemplateRef } from 'vue';

const auth = useAuthStore();
onMounted(() => {
    queryDesignList();
})

function queryDesignList() {
    if (!auth.isAuthenticated) return;

    api.get('/design', {
        params: {
            userId: auth.id,
        }
    }).then(res => {
        designList.value = res.data.data;
        designList.value.forEach(design => {
            design.thumbnail = encodeThumbnail(design.thumbnail);
        });
    });
}

function createNewDesign() {
    if (!auth.isAuthenticated) return;

    const source: number | null = selectedTemplate.value?.id ?? null;

    api.post('/design', {
        userId: auth.id,
        sourceId: source,
        isShared: false,
        name: title.value === '' ? '제목을 입력해주세요' : title.value
    }).then(res => {
        toEditorView(res.data.data.id);
    });
}

function deleteDesign(id: number) {
    if (!auth.isAuthenticated) return;

    // TODO: show Confirm Modal

    api.delete('/design', {
        params: {
            userId: auth.id,
            designId: id
        }
    }).then(_res => {
        designDropdown.value?.close();
        queryDesignList();
    });
}

const designList = ref<DesignListResponseDTO[]>([]);

const menuSelection = ref<number>(0);

const orderDropdown = useTemplateRef<InstanceType<typeof Dropdown>>('order-dropdown');

const designDropdown = useTemplateRef<InstanceType<typeof Dropdown>>('design-dropdown');
const currentDesign = ref<DesignListResponseDTO>();

const designDropdownPosition = ref<Vector2>(Vector2.ZERO);
function openDesignDropdown(e: PointerEvent, _currentDesign: DesignListResponseDTO) {
    if (designDropdown.value?.show) return;

    designDropdownPosition.value = Vector2.PointFrom(e);
    currentDesign.value = _currentDesign;
    designDropdown.value?.open();
}

function toEditorView(designId: number) {
    router.push({ name: 'Editor', params: { id: designId } });
}

const createDesignModal = useTemplateRef<InstanceType<typeof Modal>>('create-design-modal');
const title = ref<string>('');
const templateKeyword = ref<string>('');

const templateList = ref<TemplateDTO[]>([]);

async function openCreateDesignDropdown() {
    if (!auth.isAuthenticated) return;

    const res = await api.get('/template');
    templateList.value = res.data.data;

    templateList.value.forEach(template => {
        template.thumbnail = encodeThumbnail(template.thumbnail);
    });

    createDesignModal.value?.open();
}
const selectedTemplate = ref<TemplateDTO | null>(null);
const detailedTemplate = ref<DetailedTemplateDTO | null>(null);

async function selectTemplate(template: TemplateDTO) {
    if (!auth.isAuthenticated) return;

    const res = await api.get(`/template/${template.id}`);
    detailedTemplate.value = res.data.data;

    detailedTemplate.value!.thumbnail = encodeThumbnail(detailedTemplate.value?.thumbnail!);
    detailedTemplate.value!.slideThumbnails = Object.values(detailedTemplate.value?.slideThumbnails!).map(thumbnail => encodeThumbnail(thumbnail));
    
    selectedTemplate.value = template;
}

const searchedTemplateList = computed<TemplateDTO[]>(() => {
    if (templateKeyword.value === '') return templateList.value;
    return templateList.value.filter(template => template.name.match(templateKeyword.value));
})
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

                        <button @pointerup.left="openCreateDesignDropdown()" class="w-40 h-10 p-2 ml-auto mr-2 rounded-md bg-teal-500 focus:brightness-110 hover:brightness-110">
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
                            @pointerup.left="toEditorView(design.id)">
                                <div class="grow flex min-w-0 items-center px-4">
                                    <!-- <button class="i-mdi:checkbox-blank-outline w-5 h-5 p-0 mr-4" /> -->
                                    <div class="h-14 aspect-video mr-4 rounded-md bg-gray-200">
                                        <img :src="design.thumbnail" class="rounded-md border border-gray-200" />
                                    </div>
                                    <p class="w-120 truncate">{{ design.name }}</p>
                                </div>
                                <!-- <p class="w-2/16 ml-auto px-4">design.author</p> -->
                                <p class="w-2/16 px-4 text-sm">{{ design.updatedAt?.split('T')[0] }}</p>
                                <div class="w-10 mr-4">
                                    <button class="w-8 h-8 mr-4 p-2 rounded-md hover:bg-gray-300" :style="{ outline: 'none' }" @pointerup.stop="openDesignDropdown($event, design)">
                                        <div class="i-mdi:dots-horizontal w-4 h-4"></div>
                                    </button>
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <Modal ref="create-design-modal">
            <p class="font-bold text-xl mb-8 select-none">디자인 만들기</p>

            <form @submit.prevent="createDesignModal?.close()">
                <div class="relative w-200 mb-4">
                    <p class="mb-1 select-none">제목</p>
                    <input v-model="title"  placeholder="제목을 입력해주세요" 
                    class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300 outline-teal-500 hover:border-teal-500" />
                </div>

                <div class="relative w-200 mb-8">
                    <p class="mb-1 select-none">템플릿</p>

                    <input v-model="templateKeyword"  placeholder="템플릿 검색" 
                    class="block w-full h-10 pl-10 pr-2 mb-2 text-sm rounded-md border border-gray-300 outline-teal-500 hover:border-teal-500" />
                    <div class="absolute left-2 top-9 w-6 h-6 p-1 i-mdi:magnify rounded-md bg-gray-500" />

                    <div class="w-full h-120 p-2 text-sm rounded-md border border-gray-300 overflow-y-auto select-none">
                        <div v-if="selectedTemplate === null" class="grid gap-2 grid-cols-4">
                            <div class="w-full h-fit p-2 rounded-md bg-gray-100">
                                <div class="w-full aspect-video rounded-md border border-gray-300 bg-white" />
                                <p class="text-center mt-1 truncate">새 템플릿</p>
                            </div>
                            <div v-for="template in searchedTemplateList" class="w-full h-fit p-2 rounded-md hover:bg-gray-100 cursor-pointer" @pointerup.left="selectTemplate(template)">
                                <div class="w-full aspect-video">
                                    <img :src="template.thumbnail" class="rounded-md border border-gray-200" />
                                </div>
                                <p class="text-center mt-1 truncate">{{ template.name }}</p>
                            </div>
                        </div>

                        <div v-else class="select-none">
                            <button class="float-right p-1.5 rounded-md hover:bg-gray-100" @pointerup.left="selectedTemplate = null">
                                <div class="i-mdi:window-close text-xl" />
                            </button>

                            <p class="p-1.5 font-bold text-lg mb-2">미리보기</p>

                            <div class="flex h-42">
                                <div class="aspect-video h-full ml-3">
                                    <img :src="detailedTemplate!.thumbnail" class="rounded-md border border-gray-200" />
                                </div>
                                <div class="w-100 ml-8">    
                                    <p class=" text-xl">{{ detailedTemplate?.name }}</p>
                                    <div class="flex h-8 mt-1">
                                        <div class="w-8 h-8  p-0.67 overflow-hidden rounded-md" :style="{ backgroundColor: profileColor(detailedTemplate!.creator) }">
                                            <p class="text-white text-[9.34px] text-center w-full h-full leading-[27px] break-all">{{ detailedTemplate!.creator }}</p>
                                        </div>
                                        <p class="ml-2 text-left text-sm text-gray-700 leading-8 break-all">{{ detailedTemplate!.creator }}</p>
                                    </div>
                                    <!-- <p class="h-24 mt-2 overflow-y-auto">템플릿 설명을 입력해주세요<br>여러 줄...</p> -->
                                </div>
                            </div>

                            <div class="grid gap-0 grid-cols-4 ml-1 mt-3">
                                <div v-for="thumbnail in detailedTemplate?.slideThumbnails" class="w-full h-fit p-2 rounded-md">
                                    <div class="w-full aspect-video rounded-md">
                                        <img :src="thumbnail" class="rounded-md border border-gray-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button @pointerup.left="createNewDesign()" class="w-200 h-10 rounded-md bg-teal-500 focus:brightness-110 hover:brightness-110">
                    <p class="text-sm text-white font-bold leading-10">만들기</p>
                </button>
            </form>
        </Modal>

        <Dropdown ref="design-dropdown" :style="{
            transform: `translate(${designDropdownPosition.x - 320}px, ${designDropdownPosition.y}px)`
        }">
            <div class="px-6 py-4 border-b border-gray-200">
                <div class="flex flex-col justify-center w-auto h-12">
                    <p class="mb-1 text-left text-xl font-bold">{{ currentDesign?.name }}</p>
                    <p class="text-left text-xs text-gray-500">수정일: {{ currentDesign?.updatedAt.split('.')[0].replace('T', ' ') }}</p>
                    <p class="text-left text-xs text-gray-500">{{ currentDesign?.shared ? '공개됨' : '비공개' }}</p>
                </div>
            </div>
            <button @pointerup="" class="flex w-80 h-12 p-3 px-6 hover:bg-gray-200">
                <div class="w-6 h-6 mr-2 i-mdi:content-copy" />
                <p class="leading-6">사본 만들기</p>
            </button>
            <button @pointerup="" class="flex w-80 h-12 p-3 px-6 hover:bg-gray-200">
                <div class="w-6 h-6 mr-2 i-mdi:rename" />
                <p class="leading-6">이름 바꾸기</p>
            </button>
            <button @pointerup="" class="flex w-80 h-12 p-3 px-6 hover:bg-gray-200">
                <div class="w-6 h-6 mr-2 i-mdi:share-variant-outline" />
                <p class="leading-6">공유하기</p>
            </button>
            <button @pointerup="deleteDesign(currentDesign!.id)" class="flex w-80 h-12 p-3 px-6 hover:bg-gray-200">
                <div class="w-6 h-6 mr-2 i-material-symbols:delete-outline-rounded" />
                <p class="leading-6">삭제하기</p>
            </button>
        </Dropdown>
    </div>
</template>

<style lang="css">
button {
    border: 0;
    padding: 0;
}
button:focus {
    outline: none;
}
</style>