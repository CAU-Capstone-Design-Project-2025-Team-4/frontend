import type { LoginResponseDTO } from "@/types/DTO";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore('auth', () => {
    const jwtToken = ref<string | null>(null);
    const id = ref<number | null>(null);
    const name = ref<string | null>(null);
    const email = ref<string | null>(null);

    function isAuthenticated() {
        return jwtToken.value != null;
    }

    function login(loginResponseDTO: LoginResponseDTO) {
        jwtToken.value = loginResponseDTO.jwtToken;
        id.value = loginResponseDTO.id;
        name.value = loginResponseDTO.name;
        email.value = loginResponseDTO.email;
    }

    function logout() {
        jwtToken.value = null;
        id.value = null;
        name.value = null;
        email.value = null;
    }

    return { jwtToken, id, name, email, isAuthenticated, login, logout };
}, { persist: true })