import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import Login from '@/components/Login/Login'
import LoginVerfy from '@/components/Login/LoginVerfy'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login
    },
    {
      path:'/Login/LoginVerfy',
      name:'LoginVerfy',
      component:LoginVerfy
    }
  ]
})
