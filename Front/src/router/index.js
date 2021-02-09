import Vue from 'vue'
import Router from 'vue-router'
import playground from '@/components/playground'
import error from '@/components/error'
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
      path: '/error',
      name: 'error',
      component: error
    },
    {
      path: '/login',
      name: 'login',
      component: login
    }
  ]
})
