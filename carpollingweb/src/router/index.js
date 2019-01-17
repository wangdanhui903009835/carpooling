import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/components/Index'
import Login from '@/components/Login/Login'
import LoginVerfy from '@/components/Login/LoginVerfy'
import OrderList from '@/components/Order/OrderList'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
      meta:{
        title:'巴蜀行'
      }
    },
    {
      path:'/Login/LoginVerfy',
      name:'LoginVerfy',
      component:LoginVerfy,
      meta:{
        title:'巴蜀行'
      }
    },
    {
      path:'/Index',
      name:'Index',
      component:Index,
      meta:{
        title:'巴蜀行'
      }
    },
    {
      path:'/Order/OrderList',
      name:'OrderList',
      component:OrderList,
      meta:{
        title:'行程订单'
      }
    }
  ]
})
