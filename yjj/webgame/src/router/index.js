import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home.vue'

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
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/Game.vue')
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: () => import('../components/Wallet.vue')
  },
  {
    path: '/query',
    name: 'Query',
    component: () => import('../components/Query.vue')
  },
  {
    path: '/ceshi',
    name: 'Ceshi',
    component: () => import('../components/Ceshi.vue')
  },
]

const router = new VueRouter({
  routes
})

export default router
