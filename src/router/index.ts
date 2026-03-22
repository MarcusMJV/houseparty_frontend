import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import RoomView from '@/views/RoomView.vue'
import SpotifyCallbackView from '@/views/SpotifyCallbackView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/about', component: AboutView },
    { path: '/room/:roomCode', component: RoomView },
    { path: '/spotify/callback', component: SpotifyCallbackView },
  ],
})

export default router
