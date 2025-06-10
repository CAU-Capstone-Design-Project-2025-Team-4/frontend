import { defineStore } from "pinia";
import { ref } from "vue";

export const useModalStore = defineStore('modal', () => {
    const registerModal = ref<any>();

    return { registerModal };
})