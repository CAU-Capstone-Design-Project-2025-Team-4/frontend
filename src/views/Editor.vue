<script setup lang="ts">
import HandleableCanvas from '@/components/design/HandleableCanvas.vue';
import UnityCanvas from '@/components/design/objects/UnityCanvas.vue';
import PageHeader from '@/components/PageHeader.vue';
import Profile from '@/components/Profile.vue';
import SideBar from '@/components/SideBar.vue';
import Modal from '@/components/common/Modal.vue';
import router from '@/router';
import { useDesignStore } from '@/stores/design';
import { useSelectorStore } from '@/stores/selector';
import { computed, inject, onMounted, provide, ref, useTemplateRef, type Ref } from 'vue';
import { useRoute } from 'vue-router';

const canvas = useTemplateRef<InstanceType<typeof HandleableCanvas>>('canvas');
provide('canvas', canvas);

const selector = useSelectorStore();
selector.deselectAll();

const unity = inject('unity') as Ref<InstanceType<typeof UnityCanvas>>;
const isLoading = computed<boolean>(() => unity.value.isCreatingInstance ?? false);

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

const shareModal = useTemplateRef<InstanceType<typeof Modal>>('share-modal');
const title = ref<string>('제목을 입력해주세요');
const description = ref<string>('');

// TODO beforeunload
</script>

<template>
    <div id="editor" class="flex flex-col w-screen h-screen overflow-auto select-none">
        <PageHeader>
            <template #left-panel>
                <div class="p-2">
                    <input v-model="title" spellcheck="false" @blur="design.updateTitle(title)" class="leading-8 outline-teal-500 hover:border-teal-500" >
                </div>
            </template>

            <button @pointerup.left="shareModal?.open()" class="flex mr-4 p-2 items-center justify-center rounded-md bg-gray-200 hover:brightness-95">
                <div class="i-material-symbols:share-outline mr-2 text-xl" />
                <p class="text-sm">공유</p>
            </button>

            <button @pointerup.left="design.shareTemplate()" class="flex mr-4 p-2 items-center justify-center rounded-md bg-gray-200 hover:brightness-95">
                <div class="i-material-symbols:share-outline mr-2 text-xl" />
                <p class="text-sm">템플릿 공유</p>
            </button>

            <Modal ref="share-modal">
                <p class="font-bold text-xl mb-8 select-none">디자인 공유하기</p>

                <form @submit.prevent="design.share(title, description); shareModal?.close()">
                    <div class="relative w-160 mb-4">
                        <p class="mb-1 select-none">제목</p>
                        <input v-model="title"  :placeholder="title" 
                        class="block w-full h-10 px-2 text-sm rounded-md border border-gray-300 outline-teal-500 hover:border-teal-500" />
                    </div>

                    <div class="relative w-160 mb-8">
                        <p class="mb-1 select-none">작품 설명</p>
                        <textarea v-model="description" placeholder="작품 설명을 입력해주세요." rows="10"
                        class="block resize-none w-full h-80 p-2 text-sm rounded-md border border-gray-300 outline-teal-500 hover:border-teal-500" /> 
                    </div>

                    <button type="submit" class="w-160 h-10 rounded-md bg-teal-500 focus:brightness-110 hover:brightness-110">
                        <p class="text-sm text-white font-bold leading-10">공유</p>
                    </button>
                </form>
            </Modal>

            <div class="flex mr-4 p-2 items-center justify-center rounded-md bg-teal-500 hover:brightness-110" @click="enterSlideShow()">
                <div class="i-mdi:presentation-play mr-2 text-xl text-white" />
                <p class="text-sm text-white">슬라이드 쇼</p>
            </div>

            <Profile />
        </PageHeader>

        <div class="flex flex-row min-h-64 flex-auto">
            <SideBar class="flex-1/6 min-w-100 border-r border-gray-200" />
            
            <div class="flex-5/6">
                <TransitionGroup name="fade">
                    <HandleableCanvas v-show="!isLoading" key="1" ref="canvas" />
                    <div v-show="isLoading" key="2" class="absolute left-0 top-0 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-70">
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

button {
    border: 0;
    padding: 0;
}
button:focus {
    outline: none;
}
</style>