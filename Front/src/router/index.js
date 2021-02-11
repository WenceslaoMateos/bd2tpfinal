import Vue from 'vue'
import Router from 'vue-router'
import playground from '@/components/playground'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'playground',
      component: playground
    }
  ]
})
