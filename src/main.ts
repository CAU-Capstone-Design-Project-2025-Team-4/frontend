import { createApp } from 'vue'
import './style.css'
import 'virtual:uno.css'
import App from '@/App.vue'
import axios from 'axios'
import router from '@/router'
import { createPinia } from 'pinia'

// axios.defaults.baseURL = import.meta.env.VITE_API_URL

const app = createApp(App)
app.config.globalProperties.axios = axios

const pinia = createPinia()
app.use(router).use(pinia).mount('#app')