<script setup lang="ts">
import HandleableCanvas from '@/components/design/HandleableCanvas.vue';
import UnityCanvas from '@/components/design/objects/UnityCanvas.vue';
import PageHeader from '@/components/PageHeader.vue';
import Profile, { profileColor } from '@/components/Profile.vue';
import SideBar from '@/components/SideBar.vue';
import Modal from '@/components/common/Modal.vue';
import router from '@/router';
import { useDesignStore } from '@/stores/design';
import { useSelectorStore } from '@/stores/selector';
import { computed, inject, onMounted, provide, ref, useTemplateRef, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const canvas = useTemplateRef<InstanceType<typeof HandleableCanvas>>('canvas');
provide('canvas', canvas);

const selector = useSelectorStore();
selector.deselectAll();

const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;
const isLoading = computed<boolean>(() => unity.value?.isCreatingInstance ?? false);

function enterSlideShow() {
    selector.deselectAll();
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
    router.push('/show');
}

const design = useDesignStore();
const isLoadingDesign = ref<boolean>(false);
onMounted(async () => {
    const route = useRoute();
    const designId = Number(route.params.id);

    isLoadingDesign.value = true;
    design.load(designId).then(_title => {
        title.value = _title;
    }).catch(err => {
        window.alert(err.message);
        router.push('/');
    });
})

const postModal = useTemplateRef<InstanceType<typeof Modal>>('post-modal');
const title = ref<string>('제목을 입력해주세요');
const description = ref<string>('');

const modalTitle = ref<string>('');

function openPostModal() {
    modalTitle.value = title.value;
    postModal.value?.open();
}

const auth = useAuthStore();

const shareModal = useTemplateRef<InstanceType<typeof Modal>>('share-modal');
</script>

<template>
    <div id="editor" class="flex flex-col w-screen h-screen overflow-auto select-none">
        <PageHeader>
            <template #left-panel>
                <div class="p-2">
                    <input v-model="title" spellcheck="false" @blur="design.updateTitle(title)" class="leading-8 outline-teal-500 hover:border-teal-500" >
                </div>
            </template>

            <button v-if="!design.inPost" @pointerup.left="openPostModal()" class="flex w-32 mr-4 p-2 items-center justify-center rounded-md bg-gray-200 hover:brightness-95">
                <div class="i-mdi:pencil-outline mr-2 text-xl" />
                <p class="text-sm">게시글 작성</p>
            </button>

            <div v-else class="flex w-32 mr-4 p-2 items-center justify-center rounded-md bg-teal-50">
                <div class="i-mdi:pencil-outline mr-2 text-xl bg-teal-800" />
                <p class="text-sm text-teal-800 font-semibold">게시글 작성됨</p>
            </div>

            <Modal ref="post-modal">
                <p class="font-bold text-xl mb-8 select-none">게시글 작성하기</p>

                <form @submit.prevent="design.share(title, description); postModal?.close()">
                    <div class="relative w-160 mb-4">
                        <p class="mb-1 select-none">제목</p>
                        <input v-model="modalTitle"  :placeholder="title" 
                        class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300 outline-teal-500 hover:border-teal-500" />
                    </div>

                    <div class="relative w-160 mb-8">
                        <p class="mb-1 select-none">작품 설명</p>
                        <textarea v-model="description" placeholder="작품 설명을 입력해주세요." rows="10"
                        class="block resize-none w-full h-80 p-2 text-sm rounded-md border border-gray-300 outline-teal-500 hover:border-teal-500" /> 
                    </div>

                    <button type="submit" class="w-160 h-10 rounded-md bg-teal-500 focus:brightness-110 hover:brightness-110">
                        <p class="text-sm text-white font-bold leading-10">작성</p>
                    </button>
                </form>
            </Modal>

            <button v-if="!design.shared" @pointerup.left="shareModal?.open()" class="flex w-32 mr-4 p-2 items-center justify-center rounded-md bg-gray-200 hover:brightness-95">
                <div class="i-material-symbols:share-outline mr-2 text-xl" />
                <p class="text-sm">템플릿 공유</p>
            </button>

            <div v-else class="flex w-32 mr-4 p-2 items-center justify-center rounded-md bg-teal-50">
                <div class="i-material-symbols:share-outline mr-2 text-xl bg-teal-800" />
                <p class="text-sm text-teal-800 font-semibold">템플릿 공유됨</p>
            </div>

            <Modal ref="share-modal">
                <p class="font-bold text-xl mb-8 select-none">템플릿 공유하기</p>

                <form @submit.prevent="design.shareTemplate(); shareModal?.close()">
                    <div class="w-200 h-120 p-2 mb-2 text-sm rounded-md border border-gray-300 overflow-y-auto select-none">
                        <p class="p-1.5 font-bold text-lg mb-2">미리보기</p>

                        <div class="flex h-42">
                            <div class="aspect-video h-full ml-3">
                                <img :src="design.slides[0].thumbnail" class="rounded-md border border-gray-200" />
                            </div>
                            <div class="w-100 ml-8">    
                                <p class=" text-xl">{{ title }}</p>
                                <div class="flex h-8 mt-1">
                                    <div class="w-8 h-8  p-0.67 overflow-hidden rounded-md" :style="{ backgroundColor: profileColor(auth.name!) }">
                                        <p class="text-white text-[9.34px] text-center w-full h-full leading-[27px] break-all">{{ auth.name! }}</p>
                                    </div>
                                    <p class="ml-2 text-left text-sm text-gray-700 leading-8 break-all">{{ auth.name! }}</p>
                                </div>
                                <!-- <p class="h-24 mt-2 overflow-y-auto">템플릿 설명을 입력해주세요<br>여러 줄...</p> -->
                            </div>
                        </div>

                        <div class="grid gap-0 grid-cols-4 ml-1 mt-3">
                            <div v-for="slide in design.slides" class="w-full h-fit p-2 rounded-md">
                                <div class="w-full aspect-video rounded-md">
                                    <img :src="slide.thumbnail" class="rounded-md border border-gray-200" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <p class="p-0.5 font-light text-sm mb-6">주의: 3D 모델은 같이 공유되지 않습니다.</p>

                    <button type="submit" class="w-200 h-10 rounded-md bg-teal-500 focus:brightness-110 hover:brightness-110">
                        <p class="text-sm text-white font-bold leading-10">공유</p>
                    </button>
                </form>
            </Modal>

            <button @pointerup.left="enterSlideShow()" class="flex mr-4 p-2 items-center justify-center rounded-md bg-teal-500 hover:brightness-110">
                <div class="i-mdi:presentation-play mr-2 text-xl text-white" />
                <p class="text-sm text-white">슬라이드 쇼</p>
            </button>

            <Profile />
        </PageHeader>

        <div class="flex flex-row min-h-64 flex-auto">
            <SideBar class="flex-1/6 min-w-100 border-r border-gray-200" />
            
            <div class="flex-5/6">
                <TransitionGroup name="fade">
                    <HandleableCanvas v-show="!isLoading" key="1" ref="canvas" />
                    <div v-if="isLoading" key="2" class="absolute left-0 top-0 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-70">
                        <span class="w-12 h-12 m-2 rounded-full border-4 border-white border-b-teal-400 animate-spin"></span>
                    </div>
                </TransitionGroup>
            </div>        
        </div>

    </div>
</template>

<style lang="css">
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>