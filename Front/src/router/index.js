import Vue from 'vue'
import Router from 'vue-router'
import playground from '@/components/playground'
import error from '@/components/error'

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
    }
  ]
})
