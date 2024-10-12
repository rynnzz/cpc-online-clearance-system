import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore';

import './assets/main.css'
import '@fortawesome/fontawesome-free/css/all.css';


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

const authStore = useAuthStore();
authStore.initializeAuth();

app.mount('#app')
