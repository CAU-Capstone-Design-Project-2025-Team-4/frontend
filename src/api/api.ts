import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000
});

api.interceptors.request.use(
    config => {
        const auth = useAuthStore();
        if (auth.jwtToken) {
            config.headers.Authorization = `Bearer ${auth.jwtToken}`
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    }
);

api.interceptors.response.use(
    res => res,
    err => {
        // handle refresh
        return err;
    }
)

export default api;