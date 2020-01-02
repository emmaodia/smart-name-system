import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/registry',
    name: 'registry',
    component: () => import('../views/Registry.vue')
  },
  {
    path: '/my-smart-names',
    name: 'my-smart-names',
    component: () => import('../views/MySmartNames.vue')
  },
  {
    path: '/market',
    name: 'market',
    component: () => import('../views/Market.vue')
  },
  {
    path: '/banking',
    name: 'banking',
    component: () => import('../views/Banking.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
