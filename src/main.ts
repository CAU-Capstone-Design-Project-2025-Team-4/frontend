import { createApp } from 'vue'
import './style.css'
import 'virtual:uno.css'
import 'vue-color/style.css'
import 'vue-slider-component/theme/default.css'
import App from '@/App.vue'
import router from '@/router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
// app.config.globalProperties.axios = axios

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate);

app.use(router).use(pinia).mount('#app')

const auth = useAuthStore();
router.beforeEach((to, from) => {
    if (!auth.isAuthenticated && !to.matched.some(record => record.name === 'Main')) {
        return { name: 'Main' }
    }
})