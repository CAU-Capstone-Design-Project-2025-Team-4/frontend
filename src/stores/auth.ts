import router from "@/router";
import type { LoginResponseDTO } from "@/types/DTO";
import type { AxiosRequestConfig } from "axios";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref<string | null>(null);
    const refreshToken = ref<string | null>(null);
    const id = ref<number | null>(null);
    const name = ref<string | null>(null);
    const email = ref<string | null>(null);

    const isAuthenticated = computed<boolean>(() => accessToken.value != null);
    // const authorization = computed<string>(() => `Bearer ${jwtToken.value}`);

    const config = computed<AxiosRequestConfig>(() => {
        return {
            headers: {
                Authorization: `Bearer ${accessToken.value}`,
                'Refresh-Token': `${refreshToken.value}`,
            }
        }
    })

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

    function handleTokenExpired(): boolean {
        return false;
    }

    function handleCommonError(err: any, retry: () => void) {
        if (!err.status) {
            console.error(err);
            return;
        }

        const statusCode = err.status;
        switch (statusCode) {
            case 401:
            case 403:
                const success = handleTokenExpired()
                if (success) retry();
                else {
                    logout();

                    router.push('/');
                    window.alert('다시 로그인해주세요.');
                }
                break;
            default:
                console.error("Unhandled error status:", statusCode);
                console.error(err.response.data);
        }
    }

    return { jwtToken: accessToken, refreshToken, id, name, email, isAuthenticated, login, logout, handleTokenExpired, handleCommonError, config };
}, { persist: true })