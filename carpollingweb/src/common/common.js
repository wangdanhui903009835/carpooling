import axios from 'axios';
(function(){
  window.config={
    //拼车接口
    apisServer: 'http://47.106.117.215:8888',
    //高德key值
    AMapKey: '4afba4f0fbf8de22a8934e4d00c8e5ad',
    //巴中城市区域citycode的值
    cityCode:'0827',
    //AMapKey:'c8d499635271ab4f9d449d35911e2cf1'
  }
})();
export  function getCurrentLocation(){
  let defaultCurrentLocation = {
    latitude:30.64242,
    longitude:104.04311
  };
  return new Promise(function(resolve,reject){
    if(isWeiXin()){//判断是微信浏览器
      WxSign().then(res=>{
        wx.ready(function(){
          wx.getLocation({
            type:'wgs84',
            success: result => {
              let currentLocation={
                latitude:result.latitude?result.latitude:30.64242,
                longitude:result.longitude?result.longitude:104.04311
              };
              resolve({code:200,data:currentLocation});
            },
            fail:error=>{
              resolve({code:200,data:defaultCurrentLocation});
            }
          })
        })
      }).catch(err=>{
        resolve({code:200,data:defaultCurrentLocation})
      })
    }else{//不是微信浏览器
      resolve({code:200,data:defaultCurrentLocation});
    }
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
