// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios';
import './css/Common.css'
import Mint from 'mint-ui'
import 'mint-ui/lib/style.min.css'
import qs from 'qs'
Vue.use(Mint);
Vue.config.productionTip = false
axios.defaults.headers.post['Content-Type'] = 'text/plain';
axios.interceptors.request.use(config => {
    //添加token
    let token = window.utils.storage.getter('token',1);
    if(token!=null){
      config.headers['token'] = access_token
    }
    //post 提交时，应该params改为data
    if (config.method == "post") {
      config.data = config.data ? config.data : qs.stringify(config.params)
      config.params = null;
    }
    return config
  },(error) => {
    return Promise.reject(error);
  }
)
  //token拦截
  axios.interceptors.response.use(function(res){
    if(res.data.tokenFailed=='failed'){
      Mint.Toast({
        message:'登录已过期，请重新登录',
        position:'top'
      });
      //清除缓存数据
      window.utils.storage.remove('token',1);
      window.utils.storage.remove('userPhone',1);
      router.push({name:'Login'});
    }
    return res;
  },function(error){
    return Promise.reject(error);
  })
/*设置标题*/
router.beforeEach((to,from,next)=>{
  document.title=to.meta.title;
  next();
})
//日期格式的统一
Vue.prototype.$formatDateLength=function(val){
  if(val.toString().length!=2){
    return '0'+val;
  }else{
    return val
  }
}
//格式化日期信息
Vue.prototype.$formateTimeToDate=function(val){
  let currentDate = new Date();//今天日期
  let tomorrowDate = new Date(currentDate.getTime()+24*60*60*1000);
  val = parseInt(val,10);
  if(val<=0 || isNaN(val)){
    return '';
  }else{
    let msg='';//页面显示信息
    let orderDate = new Date(val),//订单日期
    //今天的日期
      currentYYYYMMDD = currentDate.getFullYear()+'-'+this.$formatDateLength(currentDate.getMonth()+1)+'-'+this.$formatDateLength(currentDate.getDate()),
    //明天日期
      tomorrowYYYYMMDD = tomorrowDate.getFullYear()+'-'+this.$formatDateLength(tomorrowDate.getMonth()+1)+'-'+this.$formatDateLength(tomorrowDate.getDate()),
    //订单日期
      orderYYYYMMDD=orderDate.getFullYear()+'-'+this.$formatDateLength(orderDate.getMonth()+1)+'-'+this.$formatDateLength(orderDate.getDate()),
    //小时
      hours = orderDate.getHours(),
    //分钟
      minutes = orderDate.getMinutes();
    if(currentYYYYMMDD==orderYYYYMMDD){//今天日期
      msg='今天 '+this.$formatDateLength(hours)+':'+this.$formatDateLength(minutes);
    }else if(tomorrowYYYYMMDD==orderYYYYMMDD){//明天日期
      msg='明天 '+this.$formatDateLength(hours)+':'+this.$formatDateLength(minutes);
    }else{
      msg=orderYYYYMMDD+' '+this.$formatDateLength(hours)+':'+this.$formatDateLength(minutes);
    }
    return msg;
  }
}
Vue.prototype.$http=axios;
//消息提示框
Vue.prototype.$message={
  successMessage:function(contents){
    let instance = Mint.Toast({
      message:contents,
      position:'top'
    })
    setTimeout(function () {
      instance.close();
    },2000)
  },
  errorMessage:function(contents){
    let instance = Mint.Toast({
      message:contents,
      position:'top'
    })
    setTimeout(function () {
      instance.close();
    },2000)
  }
}
//消息弹出框
Vue.prototype.$initLoading={
  open:function(){
    Mint.Indicator.open();
  },
  close:function(){
    Mint.Indicator.close();
  }
}
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
