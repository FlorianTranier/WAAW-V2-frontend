import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/reset.css'
import './assets/styles/overlay.css'
import './assets/styles/colors.css'
import router from './router'

createApp(App).use(router).mount('#app')