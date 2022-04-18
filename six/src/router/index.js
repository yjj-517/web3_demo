import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('../views/Game.vue')
  },
  {
    path: '/othergame',
    name: 'OtherGame',
    component: () => import('../components/OtherGame.vue')
  },
  {
    path: '/historyorder',
    name: 'HistoryOrder',
    component: () => import('../components/HistoryOrder.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
