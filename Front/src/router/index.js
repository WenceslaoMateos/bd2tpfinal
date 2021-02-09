import Vue from 'vue'
import Router from 'vue-router'
import playground from '@/components/playground'
import login from '@/components/login'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'playground',
      component: playground
    },
    {
      path: '/login',
      name: 'login',
      component: login
    }
  ]
})
