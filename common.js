import axios from 'axios'
import {Toast, MessageBox,Indicator} from 'mint-ui'
import common_fun from './common_fun.js'
(function () {
  // API接口
  window.config = {
    /*开发地址*/
    //apisServer: 'http://192.168.0.2:8080/fjjh',
    /*附近酒行测试环境
    apisServer: 'https://test.fjjh.shop/fjjh',
    uploadImageUrl: 'https://toss.fjjh.shop/',
    ossBucket:'test-blueteam-oss' ,   //testOss
    shareLink:'https://testwap.fjjh.shop/#',//分享链接
    projectName:'附近酒行',//项目名称
    wxLoginUrl:'https://testwap.fjjh.shop/getWeChat.html',
    */
    /*附近酒行正式环境*/
    apisServer: 'https://api.fjjh.shop/fjjh',
    uploadImageUrl:'http://fjjh-oss.oss-cn-zhangjiakou.aliyuncs.com/',
    ossBucket:'fjjh-oss' ,   //testOss
    shareLink:'https://wap.fjjh.shop/#',//分享链接
    projectName:'附近酒行',//项目名称
    wxLoginUrl:'https://wap.fjjh.shop/getWeChat.html',

    sharLogo:'https://fjjh-oss.oss-cn-zhangjiakou.aliyuncs.com/fjjh_head_img/icon.png',//分享logo图片
    sharWineCoupon:'https://fjjh-oss.oss-cn-zhangjiakou.aliyuncs.com/fjjh_c/bg.png',//酒券分享图片url地址

    /*正则表达式变量*/
    regular: {
      //数字或者小数点后只能两位小数
      isNumber: '/^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/'
    },
    AMapKey: 'c8d499635271ab4f9d449d35911e2cf1',
    //服务电话4007751788
    serverPhone:"4007751788",
  };

  window.utils = {
    //type：1-sessionStorage,2-localStroage
    /*获取storage*/
    projectName: 'fjjh_c',
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
    },
    /*获取url的值*/
    getUrlName: function (name) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [, ""])[1].replace(/\+/g, '%20')) || null;
    },
    countDown(msg, duration) {
      let timeLength = duration ? duration : 24 * 60
      let that = this,
        date = new Date(msg),//获取当前时间
        noeDate = new Date().getTime(),
        endTime = date.setMinutes(date.getMinutes() + timeLength),//设置分钟
        residue = endTime - noeDate,
        countDowninfo = {};
      if (residue > 0) {
        let hours = parseInt(residue / 1000 / 60 / 60 % 24),
          minutes = parseInt(residue / 1000 / 60 % 60),
          seconds = parseInt(residue / 1000 % 60),
          text = '';
        if (timeLength <= 60) {
          text = (minutes < 10 ? '0' + minutes : minutes) + '分' + (seconds < 10 ? '0' + seconds : seconds) + '秒'
        } else {
          text = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds)
        }
        countDowninfo = {
          countDownText: text,
          isEnd: false
        }
      }
      else {
        countDowninfo = {
          countDownText: '00分00秒',
          isEnd: true
        }
      }
      return countDowninfo
    },
    /*获取登录信息*/
    getloginInfo: function (_this) {
      const that = this
      let WeChatInfo = that.storage.getter('WeChatInfo',1);
      let url = window.config.apisServer + '/user/loginC';
      let cityCode = that.storage.getter('code', 1) ? that.storage.getter('code', 1).cityCode : 'sc_cd';
      return new Promise(function (resolve, reject) {
        _this.$http({
          url: url,
          method: 'POST',
          data: {
            CityCode: cityCode,
            NickName: WeChatInfo.nickname,
            WxOpenId: WeChatInfo.openid,
            HeadImage: WeChatInfo.headimg,
          },
        }).then(res => {
          if (res.data.success) {
            let userInfo = res.data.data.user,
              token = res.data.data.token;
              that.storage.setter('token', token, 1)
              that.storage.setter('userInfo', userInfo, 1)
            resolve({
              isLogin: true,
              userInfo: userInfo
            });
          } else {
            that.storage.remove('token', 1)
            that.storage.remove('userInfo', 1)
            that.affirm(_this)
          }
        }).catch(error => {
        })
      })
    },
    /**绑定电话号码*/
    affirm: function (_this) {
      const that = this;
      common_fun.toast({
        contents:'需要绑定微信账号<br/>查看相关信息',
        cancelText:'取消',
        confirmText:'确定',
        className:'WXPrompt'
      }).then(res=>{
        _this.$router.push({name: 'userSetting',})
      }).catch(error=>{

      })
      //MessageBox.confirm('需要绑定微信账号,查看相关信息').then(() => {
      //  _this.$router.push({name: 'userSetting',})
      //}).catch(() => {
      //
      //})
    },
    /**获取是否登录*/
    getUserInfo(_this){
      const that = this;
      return new Promise(function (resolve, reject){
        let formUrl = window.location.href.replace('?from=singlemessage','');
        let userInfo = that.storage.getter('userInfo', 1);
        if (userInfo) {
          if(userInfo.telephone){
            resolve({
              isLogin: true,
              userInfo: userInfo
            })
          }
          else {
            that.affirm(_this)
          }
        } else {
          let WeChatInfo = that.storage.getter('WeChatInfo',1);
          if (WeChatInfo) {
            that.getloginInfo(_this).then(res=>{
              resolve(res)
            }).catch(error=>{
            })
            return
          }else{
            that.storage.setter('formUrl', formUrl, 1)
            //let url = 'https://wap.fjjh.shop/getWeChat.html'
            window.location.href = window.config.wxLoginUrl;
          }

        }
      })

    },
    /**支付
     * obj为支付请求接口参数、
     * _this为vue对象
     * */
    goPay(obj,_this){

      const that=this;
      let url = window.config.apisServer+"/wechat/order/getForPay";//订单支付接口;
      return new Promise(function (resolve, reject){
        Indicator.open({
          text: '支付中',
          spinnerType: 'fading-circle'
        });
        _this.$http({
          url: url,
          method: 'POST',
          data: obj,
        }).then(res => {
          Indicator.close();
          if (res.data.success) {
            let info=res.data.data
             that.WeChatPay(info).then(res=>{
               return that.updateOrderNo(obj,_this);
             }).then(res=>{
               resolve(res)
             }).catch(Error =>{
               reject(Error)
             })
          } else {
            reject(res.data.message)
          }
        }).catch(error => {

        })
      })
    },
    /**发起微信支付*/
    WeChatPay(info){
      const that=this;
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
    },
    /**更新订单状态*/
    updateOrderNo(obj,_this){
      let url = window.config.apisServer+"/wechat/order/changeOrderStatus",//订单支付接口;
          _data={
            orderNo:obj.orderNo
          }
      return new Promise(function(resolve,reject){
        _this.$http({
          url:url,
          method:'POST',
          data:_data
        }).then(res=>{
          if(res.data.success){
            resolve('订单更新成功');
          }else{
            reject(res.data.message);
          }
        }).catch(error=>{
          reject(error);
        })
      })
    },

  };
  window.scrollToBottom = {
    //禁止滚动条滚动
    stopScroll:function(){
      document.documentElement.style.overflow='hidden';
      document.body.style.position='fixed';
      document.body.style.top='0px';
      document.body.style.width="100%";
    },
    //允许滚动条滚动
    openScroll:function(){
      document.documentElement.style.overflow='scroll';
      document.body.style.position='static';
    },
    getScrollTop: function () {
      var scrollTop = 0, bodyScrollTop = 0, documentScrollTop = 0;
      if (document.body) {
        bodyScrollTop = document.body.scrollTop;
      }
      if (document.documentElement) {
        documentScrollTop = document.documentElement.scrollTop;
      }
      scrollTop = (bodyScrollTop - documentScrollTop > 0) ? bodyScrollTop : documentScrollTop;
      return scrollTop;
    },
    getScrollHeight: function () {
      var scrollHeight = 0, bodyScrollHeight = 0, documentScrollHeight = 0;
      if (document.body) {
        bodyScrollHeight = document.body.scrollHeight;
      }
      if (document.documentElement) {
        documentScrollHeight = document.documentElement.scrollHeight;
      }
      scrollHeight = (bodyScrollHeight - documentScrollHeight > 0) ? bodyScrollHeight : documentScrollHeight;
      return scrollHeight;
    },
    getClientHeight: function () {
      var windowHeight = 0;
      if (document.compatMode == "CSS1Compat") {
        windowHeight = document.documentElement.clientHeight;
      } else {
        windowHeight = document.body.clientHeight;
      }
      return windowHeight;
    },
    onScrollEvent: function (callback, msg) {
      var This = this;
      window.onscroll = function () {
        if (This.getScrollTop() + This.getClientHeight() >= This.getScrollHeight()) {
          if (!window.isAjax) {
            typeof callback == "function" && callback.call(this);
          }
        }
      }
    },
    //出现滚动条
    goToScrollTopEvent:function(callbackUp,callbackDow){
      var This = this;
      window.onscroll=function(){
        if(This.getScrollTop()>0){
         typeof callbackUp=='function' && callbackUp.call(this);
        }else{
          typeof callbackDow=='function' && callbackDow.call(this);
        }
      }
    },
    offScrollEvent: function () {
      if (window.removeEventListerner) {// 标准浏览器
        return function (elem, type, handler) {
          elem.removeEventListerner(type, handler, false);
        }
      } else if (window.detachEvent) {// IE浏览器
        return function (elem, type, handler) {
          elem.detachEvent("on" + type, handler);
        }
      }
    },
    hasClass: function (element, csName) {
      return element.className.match(RegExp('(\\s|^)' + csName + '(\\s|$)')); //使用正则检测是否有相同的class名称
    },
    addClass: function (element, csName) {//添加class名称
      if (!this.hasClass(element, csName)) {
        element.className += " " + csName
      }
    },
    removeClass: function (element, csName, replaceCsName = '') {
      if (this.hasClass(element, csName)) {
        element.className = element.className.replace(csName, replaceCsName);  //利用正则捕获到要删除的样式的名称，然后把他替换成一个空白字符串，就相当于删除了
      }
    }
  };
})()
export function  getBrowser(){
  let userAgent = window.navigator.userAgent.toLowerCase(),
      phoneType='';
}
export function getFetch(url, params) {
  if (typeof params === 'object' && params) {
    var str = '?';
    Object.keys(params).forEach(function (val) {
      str += val + '=' + encodeURIComponent(params[val]) + '&';
    })
  }
  return fetch(url + str, {method: 'GET'})
}
export function postFetch(url, params) {
  var formData = new FormData();
  for (let k in params) {
    formData.append(k, params[k]);
  }
  return fetch(this.url, {method: 'POST', mode: 'cors', body: formData})
}
//比较两个日期的大小
export function compareTime(startDate, endDate) {
  let startTime = new Date(startDate).getTime(),
    endTime = new Date(endDate).getTime();
  if (startTime && endTime) {
    if (startTime <= endTime) {
      return true;
    } else {
      return false;
    }
  } else if (!startTime && !endTime) {
    return true
  } else if ((startTime && !endTime) || (!startTime && endTime)) {
    return false
  }
}
//时间戳转化为日期
export function formateDate(time, formatType) {
  //兼容ios浏览器不识别'-';
  if(typeof time=='string'){
    if(time.indexOf('.')!=-1){
      time=time.substr(0,time.indexOf('.'));
    }
    if(time.indexOf('-')!=-1){
      time=time.replace(/-/g,'/');
    }
  }
  let myDate = new Date(time);
  let year = myDate.getFullYear(),
    month = myDate.getMonth() + 1,
    date = myDate.getDate(),
    hours = myDate.getHours(),
    minutes = myDate.getMinutes(),
    seconds = myDate.getSeconds();
  month = (month.toString().length > 1) ? month : '0' + month;
  date = (date.toString().length > 1) ? date : '0' + date;
  hours = (hours.toString().length > 1) ? hours : '0' + hours;
  minutes = (minutes.toString().length > 1) ? minutes : '0' + minutes;
  seconds = (seconds.toString().length > 1) ? seconds : '0' + seconds;
  let formateDate = '';
  switch (formatType) {
    case 1:
      //yyyy-MM-dd hh:mm:ss
      formateDate = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ":" + seconds;
      break;
    case 2:
      //yyyy/MM/dd hh:mm:ss
      formateDate = year + '/' + month + '/' + date + ' ' + hours + ':' + minutes + ":" + seconds;
      break;
    case 3:
      //yyyy-MM-dd hh:mm:ss
      formateDate = year + '-' + month + '-' + date;
      break;
    case 4:
      //yyyy.MM.dd
      formateDate = year + '.' + month + '.' + date;
      break;
    case 5:
      //yyyy-MM-dd hh:mm
      formateDate = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes ;
      break;
    default:
      formateDate = '' + year + month + date + ' ' + hours + ':' + minutes + ":" + seconds;
      break;
  }
  return formateDate;
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
  //当前日期
  let year = myDate.getFullYear(),
    month = myDate.getMonth() + 1,
    date = myDate.getDate();
  let currentDate = year + '-' + ((month.toString().length > 1) ? month : '0' + month) + '-' + ((date.toString().length > 1) ? date : '0' + date);
  //多少天前(后)的日期
  myDate.setDate(myDate.getDate() + number);
  let bAYear = myDate.getFullYear(),
    bAMonth = myDate.getMonth() + 1,
    bADate = myDate.getDate();
  let beforAfterDate = bAYear + '-' + ((bAMonth.toString().length > 1) ? bAMonth : '0' + bAMonth) + '-' + ((bADate.toString().length > 1) ? bADate : '0' + bADate);
  //获取今天日期
  let actualDate = '';
  if (!dateTime) {
    actualDate = currentDate;
  } else {
    let actualYMD = new Date(),
      actualY = actualYMD.getFullYear(),
      actualM = actualYMD.getMonth() + 1,
      actualD = actualYMD.getDate();
    actualDate = actualY + '-' + ((actualM.toString().length > 1) ? actualM : '0' + actualM) + '-' + ((actualD.toString().length > 1) ? actualD : '0' + actualD);
  }
  //获取昨天日期
  let yesterDay = new Date();
  yesterDay.setTime(yesterDay.getTime() - 24 * 60 * 60 * 1000);
  let yesterYear = yesterDay.getFullYear(),
    yesterMonth = yesterDay.getMonth() + 1,
    yesterDD = yesterDay.getDate(),
    yesterDate = yesterYear + '-' + ((yesterMonth.toString().length > 1) ? yesterMonth : '0' + yesterMonth) + '-' + ((yesterDD.toString().length > 1) ? yesterDD : '0' + yesterDD);
  return {
    currentDate: currentDate,//当前日期（包含指定日期）
    beforAfterDate: beforAfterDate,//多少天前后的日期
    actualDate: actualDate,//今天
    yesterDate: yesterDate//昨天
  }
}
//获取时间区间段
export function getDateSegment(startTime, number) {
  let listArr = [], myDate = '';
  if (!startTime) {
    myDate = new Date();
  } else {
    myDate = new Date(startTime);
  }
  for (var i = 0; i < Math.abs(number); i++) {
    if (number < 0) {
      myDate.setDate(myDate.getDate() - 1);
    } else {
      myDate.setDate(myDate.getDate + 1)
    }
    ;
    let item = {}, year = myDate.getFullYear(), month = myDate.getMonth() + 1, date = myDate.getDate();
    item = year + '-' + ((month < 10) ? '0' + month : month) + '-' + ((date.toString().length == 1) ? '0' + date : date);
    listArr.push(item);
  }
  return (number > 0) ? listArr : listArr.reverse();
}
//格式化金额
export function formateMoney(money) {
  if (money) {
    return (money / 100).toFixed(2)
  } else {
    return 0
  }
}
export function fmoney(s, n) {
  n = n > 0 && n <= 20 ? n : 2;
  s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
  var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1], t = "";
  for (var i = 0; i < l.length; i++) {
    t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
  }
  return t.split("").reverse().join("") + "." + r;
}

//消息框共通化提出
export function notify(object, type, title, message) {
  object.$notify[type]({
    title: title,
    message: message,
    type: type
  })
}
//loading加载框
export function loading(object, opt = {}) {
  let options = {};
  options.lock = opt.lock || true;
  options.text = opt.text || '正在提交';
  options.spinner = opt.spinner || 'el-icon-loading';
  options.background = opt.background || 'rgba(0, 0, 0, 0.7)';
  let loading = object.$loading(options);
  return loading;
}
//objec对象的深度拷贝,克隆
export function clone(obj) {
  if (null == obj || 'object' != typeof obj) {
    return obj;
  }
  //日期拷贝
  if (obj instanceof Date) {
    var copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }
  //数组拷贝
  if (obj instanceof Array) {
    var copy = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy[i] = clone(obj[i])
    }
    return copy;
  }
  //对象的拷贝
  if (obj instanceof Object) {
    var copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) {
        copy[attr] = clone(obj[attr]);
      }
    }
    return copy
  }
  throw new Error("unable to copy obj! its type isn't support");
}
/**
 * 阿里云图像信息配置
 * @returns {OSS.Wrapper}
 */
export function getAliyunClient() {
  var client = new OSS.Wrapper({
    accessKeyId: 'rgBGhs03VupDUUGB',
    accessKeySecret: 'UFZDDSBq6qCsNmZv7HXUgGyLEqkhfn',
    endpoint: 'https://oss-cn-zhangjiakou.aliyuncs.com',
    //线上地址
    bucket: window.config.ossBucket,
    secure:true
  })
  return client;
}
/**生成唯一的uuid  len为长度，radix为进制8 10 16*/
export function createUUid(len, radix) {
  const that = this;
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
    uuid = [], i;
  radix = radix || chars.length;
  if (len) {
    for (i = 0; i < len; i++) {
      uuid[i] = chars[0 | Math.random() * radix];
    }
  } else {
    let r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }
  return uuid.join('') + (new Date()).getTime();
}
/**
 * 上传至阿里云图像
 * @param _fileList
 * @param  event(enven对象) filePath(文件上传的路径)
 * @returns {Array}
 */
export function aliYunUpLoadImage(event, filePath) {
  return new Promise(function (resolve, reject) {
    let maxsize = 8 * 1024 * 1024,//2M
      upLoadImage = event.target.files[0],
      data = createUUid(8, 16),
      successUploadInfo = [],
      reg = /\.(?:jpg|png|gif|jpeg)$/;
    if (!upLoadImage) return false;
    //判断上传的类型是否为图片
    if (upLoadImage.type.indexOf('image') == -1 || !reg.test(upLoadImage.name)) {
      Toast({
        message: '图片格式不正确',
        duration: 3000
      })
      reject('图片格式不正确')
      return false;
    }
    if (upLoadImage.size > maxsize) {
      Toast({
        message: '图片上传最大不能超过8M',
        duration: 3000
      })
      reject('图片上传最大不能超过8M')
    } else {
      let client = getAliyunClient(),
        name = upLoadImage.name.substr(upLoadImage.name.indexOf(".")),
        storeAs = filePath + '/' + data + name;
      Indicator.open({
        text: '图片上传中',
        spinnerType: 'fading-circle'
      });
      client.multipartUpload(storeAs, upLoadImage).then((result) => {
        Indicator.close()
        let httpUrl =window.config.uploadImageUrl ;
        result.useUrl = httpUrl + result.name;
        resolve(result)
      }).catch((err) => {
        Indicator.close()
        successUploadInfo = [];
        reject(successUploadInfo)
        Toast({
          message: '图片上传错误，请稍后再试',
          duration: 3000
        })
      })
    }
  })

}
export function WxSign() {
  let jsApiListArr = ['getLocation', 'previewImage', 'openLocation', 'chooseWXPay','scanQRCode',
                      'onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareWeibo','onMenuShareQZone'];
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
export function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }
      obj.fail = function (res) {
        reject(res)
      }
      fn(obj)
    })
  }
}
//网页信息分享
export function fjjhWxShare(obj){
  //设置默认分享信息
  let defaultObj = {
    title:'附近酒行',
    link:window.config.shareLink,
    imgUrl:window.config.sharLogo
  }
  if(!obj){
    obj = defaultObj
  };
  wx.ready(function(){
    //分享朋友圈
    wx.onMenuShareTimeline({
      title: obj.title, // 分享标题
      link: obj.friendCircleLink||obj.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
      imgUrl: obj.imgUrl, // 分享图标
      success: function () {
      },
    })
    //发送给朋友
    wx.onMenuShareAppMessage({
      title: obj.title, // 分享标题
      desc:obj.desc||'' , // 分享描述
      link: obj.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
      imgUrl: obj.imgUrl, // 分享图标
      success: function () {}
    });
    //分享到QQ
    wx.onMenuShareQQ({
      title: obj.title, // 分享标题
      desc:obj.desc||'', // 分享描述
      link: obj.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
      imgUrl: obj.imgUrl, // 分享图标
      success: function () {}
    });
    //分享到QQ空间
    wx.onMenuShareQQ({
      title: obj.title, // 分享标题
      desc:obj.desc||'', // 分享描述
      link: obj.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
      imgUrl: obj.imgUrl, // 分享图标
      success: function () {}
    });
  })
  wx.error(function(error){
    alert(JSON.stringify(error))
  })
}
export function toastMessage(obj) {
  Toast({
    message: obj.contents,
    duration: 1500
  })
}
//判断当前信息是否有经纬度和城市信息
export function hasCurrentLocation(){
  let defaultCurrentLocation = {
    latitude:30.64242,
    longitude:104.04311
  };
  return new Promise(function(resolve,reject){
    let currentLocation = window.utils.storage.getter('currentLocation',1);
    if(!currentLocation || JSON.stringify(currentLocation)=='{}'){//不存在经纬度信息
      if(common_fun.isWeiXin()){//微信浏览器
        WxSign().then(res=>{
          wx.ready(function(){
            wx.getLocation({
              type:'wgs84',
              success: result => {
                let currentLocation={
                  latitude:result.latitude?result.latitude:30.64242,
                  longitude:result.longitude?result.longitude:104.04311
                };
                window.utils.storage.setter('currentLocation',currentLocation,1);
                resolve({code:200,data:currentLocation});
              },
              fail:error=>{
                window.utils.storage.setter('currentLocation',defaultCurrentLocation,1);
                resolve({code:200,data:defaultCurrentLocation});
              }
            })
          })
        }).catch(err=>{
          resolve({code:200,data:defaultCurrentLocation})
        })
      }else{//普通浏览器信息
        resolve({code:200,data:defaultCurrentLocation});
      }

    }else{//存在经纬度信息
      resolve({code:200,data:currentLocation});
    }
  })
}
//获取cityCode信息
export function  hasCityCode(){
  //设置默认城市信息
  let defaultObj={
    cityName:'成都市',
    cityCode:'sc_cd',
    countyName:'武侯区',
    countyCode:'sc_cd_wh'
  };
  return new Promise(function(resolve,reject){
    let code = window.utils.storage.getter('code',1);
    if(!code || JSON.stringify(code)=='{}'){//缓存中不存在citycode的值
      hasCurrentLocation().then(res=>{
        let currentLocation=res.data;
        axios.get(
          window.config.apisServer+'/user/Cityaddr',
          {
            params: {
              longitude:currentLocation.longitude,
              latitude:currentLocation.latitude
            }
          }
        ).then(res=>{
          let obj={};
          if(res.data.success && res.data.data){
            obj = {
              cityName: res.data.data.cityName,
              cityCode: res.data.data.cityCode,
              countyName: res.data.data.countyName,
              countyCode: res.data.data.county
            }
            window.utils.storage.setter('code',obj,1);//存入缓存中
            resolve(obj);//获取城市code成功
          }else{
            window.utils.storage.setter('code',defaultObj,1);//存入缓存中
            resolve(defaultObj)
          }
        }).catch(error=>{
          window.utils.storage.setter('code',defaultObj,1);//存入缓存中
          resolve(defaultObj)
        })
      })
    }else{//缓存中存在citycode的值
      resolve(code);
    }
  })
}

