import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'start',
    component: () => import('../views/StartScreen.vue')
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('../views/CharacterCreate.vue')
  },
  {
    path: '/world',
    name: 'world',
    component: () => import('../views/WorldSelect.vue')
  },
  {
    path: '/game',
    name: 'game',
    component: () => import('../views/GameMain.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
