// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios';
import './css/Common.css'
import qs from 'qs'
Vue.config.productionTip = false
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.interceptors.request.use(config => {
    //post 提交时，应该params改为data
    if (config.method == "post") {
      config.data = config.data ? config.data : qs.stringify(config.params)
      config.params = null;
      /*config.headers['Content-Type'] = 'application/x-www-form-urlencoded';*/
    }
    return config
  },(error) => {
    return Promise.reject(error);
  }
)
/*设置标题*/
router.beforeEach((to,from,next)=>{
  document.title=to.meta.title;
  next();
})
Vue.prototype.$http=axios;
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
