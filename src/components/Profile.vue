<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import Dropdown from './common/Dropdown.vue';
import { useAuthStore } from '@/stores/auth';
import router from '@/router';

const dropdown = useTemplateRef<InstanceType<typeof Dropdown>>('dropdown');
const name = ref<string>("");
const email = ref<string>("");

const colors = [
  '#4285F4',
  '#EA4335',
  '#FB8C00',
  '#34A853',
  '#A142F4',
  '#F4B400',
  '#DB4437',
  '#00ACC1',
]

const color = computed<string>(() => {
    return colors[name.value.charCodeAt(0) % colors.length];
})

const auth = useAuthStore();
onMounted(() => {
    if (!auth.isAuthenticated()) return;
    name.value = auth.name!;
    email.value = auth.email!;
})

function toWorkspaceView() {
    router.push('/workspace');
}
</script>


<template>
    <div class="relative">
        <button @pointerup="dropdown?.open()" class="w-12 h-12 p-1 overflow-hidden rounded-md border-0 hover:brightness-90" 
        :style="{ outline: 'none', backgroundColor: color }">
            <p class="text-white text-sm w-full h-full leading-10">{{ name }}</p>
        </button>

        <Dropdown ref="dropdown" class="right-0">
            <div class="flex px-6 py-4">
                <div class="w-12 h-12 p-1 mr-4 overflow-hidden rounded-md" 
                :style="{ outline: 'none', backgroundColor: color }">
                    <p class="text-white text-sm w-full h-full leading-10">{{ name }}</p>
                </div>
                <div class="flex flex-col justify-center w-auto h-12">
                    <p class="text-left font-bold">{{ name }}</p>
                    <p class="text-left text-xs text-gray-500">{{ email }}</p>
                </div>
            </div>
            <button @pointerup="toWorkspaceView()" class="flex w-80 h-12 p-3 px-6 border-0 hover:bg-gray-200" :style="{ outline: 'none' }">
                <div class="w-6 h-6 mr-2 i-mdi:folder-edit-outline" />
                <p class="leading-6.5">워크스페이스</p>
            </button>
            <button @pointerup="auth.logout()" class="flex w-80 h-12 p-3 px-6 border-0 hover:bg-gray-200" :style="{ outline: 'none' }">
                <div class="w-6 h-6 mr-2 i-mdi:logout" />
                <p class="leading-6">로그아웃</p>
            </button>
        </Dropdown>
    </div>
    
</template>