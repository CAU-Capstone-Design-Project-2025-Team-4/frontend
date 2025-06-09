import type { LoginResponseDTO } from "@/types/DTO";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);
    const id = ref<number | null>(null);
    const name = ref<string | null>(null);
    const email = ref<string | null>(null);

    const isAuthenticated = computed<boolean>(() => accessToken.value != null);

    function login(loginResponseDTO: LoginResponseDTO) {
        accessToken.value = loginResponseDTO.jwtToken;
        refreshToken.value = loginResponseDTO.refreshToken;
        id.value = loginResponseDTO.id;
        name.value = loginResponseDTO.name;
        email.value = loginResponseDTO.email;
    }

    function logout() {
        accessToken.value = null;
        id.value = null;
        name.value = null;
        email.value = null;
    }

    return { jwtToken: accessToken, refreshToken, id, name, email, isAuthenticated, login, logout };
}, { persist: true })