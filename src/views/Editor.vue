<script setup lang="ts">
import HandleableCanvas from '@/components/design/HandleableCanvas.vue';
import UnityCanvas from '@/components/design/objects/UnityCanvas.vue';
import PageHeader from '@/components/PageHeader.vue';
import Profile from '@/components/Profile.vue';
import SideBar from '@/components/SideBar.vue';
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
const isLoading = computed<boolean>(() => unity.value.isCreatingInstance);

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
    design.load(designId).then(_ => {

    }).catch(err => {
        window.alert(err.message);
        router.push('/');
    });
})

// TODO beforeunload
</script>

<template>
    <div id="editor" class="flex flex-col w-screen h-screen overflow-auto select-none">
        <PageHeader>
            <div class="flex mr-4 p-2 items-center justify-center rounded-md bg-gray-200 hover:brightness-95">
                <div class="i-material-symbols:share-outline mr-2 text-xl" />
                <p class="text-sm">공유</p>
            </div>

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
</style>