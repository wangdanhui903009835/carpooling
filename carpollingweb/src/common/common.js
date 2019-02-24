import axios from 'axios';
import Mint from 'mint-ui'
(function(){
  window.config={
    //拼车接口
    //apisServer: 'https://47.106.117.215:443',
    //apisServer:'https://www.bashuxing.cn',
    apisServer:'https://bsx.faguikeji.com',
    //高德key值
    AMapKey: '4afba4f0fbf8de22a8934e4d00c8e5ad',
    //巴中城市区域citycode的值
    cityCode:'0827',
    //AMapKey:'c8d499635271ab4f9d449d35911e2cf1'
  };
  window.utils={
    projectName:'car_c',
    storage: {
      getter: function (key, type) {
        if (type == 1) {
          return JSON.parse(sessionStorage.getItem(utils.projectName + '_' + key));
        }
        else {
          return JSON.parse(localStorage.getItem(utils.projectName + '_' + key));
        }
      },
      setter: function (key, val, type) {
        val = JSON.stringify(val);
        if (type == 1) {
          return sessionStorage.setItem(utils.projectName + '_' + key, val);

        } else {
          return localStorage.setItem(utils.projectName + '_' + key, val);
        }
      },
      remove: function (key, type) {
        if (type == 1) {
          return sessionStorage.removeItem(utils.projectName + '_' + key);
        }
        else {
          return localStorage.removeItem(utils.projectName + '_' + key);
        }
      }
    }
  }
})();
export  function getCurrentLocation(){
  let defaultCurrentLocation = {
    latitude:30.572269,
    longitude:104.066541
  };
  return new Promise(function(resolve,reject){
    var map = new AMap.Map('container', {
      resizeEnable: true
    });
    AMap.plugin('AMap.Geolocation', function() {
      var geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,//是否使用高精度定位，默认:true
        timeout: 10000,          //超过10秒后停止定位，默认：5s
        buttonPosition:'RB',    //定位按钮的停靠位置
        buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点

      });
      map.addControl(geolocation);
      geolocation.getCurrentPosition(function(status,result){
        if(status=='complete'){
        }else{
          resolve(defaultCurrentLocation);
        }
      });
    });
  })
}
//判断是否是微信浏览器
export function isWeiXin(){
  let brower = navigator.userAgent.toLowerCase();
  let isWX = brower.indexOf('micromessenger')!=-1;
  return isWX;
}
//微信签名
export function WxSign(){
  let jsApiListArr = ['getLocation',  'openLocation'];
  return new Promise(function (resolve, reject) {
    axios.get(
      window.config.apisServer + "/user/wechatSign",
      {
        params: {
          url: window.location.href.split('#')[0]
          /* url:'http://wap.fjjh.shop'*/
        }
      }
    ).then(res => {
      wx.config({
        debug: false,
        appId: res.data.appId,
        timestamp: res.data.timestamp,
        nonceStr: res.data.nonceStr,
        signature: res.data.signature,
        jsApiList: jsApiListArr
      });
      resolve({code: 200, info: '微信接口入驻成功'});
    }).catch(error => {
      reject({code: -1, info: '微信接口入驻失败'})
    })
  })
}
/**发起微信支付*/
export function WeChatPay(info){
  return new Promise(function (resolve, reject){
    WeixinJSBridge.invoke(
      'getBrandWCPayRequest', {
        "appId":info.appId,     //公众号名称，由商户传入
        "timeStamp":info.timeStamp,         //时间戳，自1970年以来的秒数
        "nonceStr":info.nonceStr, //随机串
        "package":info.package,
        "signType":info.signType,         //微信签名方式：
        "paySign":info.paySign //微信签名
      },
      function(res){
        console.log('支付信息');
        console.log(res);
        alert(JSON.stringify(res));
        // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
        if(res.err_msg == "get_brand_wcpay_request:ok" ) {
          resolve('支付成功')
        }
        else {
           if(res.err_msg=='get_brand_wcpay_request:cancel'){
            reject('支付失败:用户取消支付')
          }
          else if(res.err_msg=='get_brand_wcpay_request:fail'){
            reject('支付失败:请稍后重试')
          }else {
            reject('支付失败:请联系客服人员')
          }
          //Toast('支付失败'+res.err_msg)
        }
      }
    );
  })
}
//获取当前时间前后多少天的时间
export function getDateByNumber(dateTime, number) {
  let myDate = '';
  if (!dateTime) {
    //获取今天的时间
    myDate = new Date();
  } else {
    myDate = new Date(dateTime);
  }
  //多少天前(后)的日期
  myDate.setDate(myDate.getDate() + number);
  let bAYear = myDate.getFullYear(),
    bAMonth = myDate.getMonth() + 1,
    bADate = myDate.getDate();
  let baDate = bAYear + '-' + ((bAMonth.toString().length > 1) ? bAMonth : '0' + bAMonth) + '-' + ((bADate.toString().length > 1) ? bADate : '0' + bADate);
  return {
    baDate:baDate
  }
}
