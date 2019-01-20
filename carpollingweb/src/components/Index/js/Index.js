import {getCurrentLocation} from './../../../common/common.js';
import DateTimeComponent from './../DateTimeComponent.vue'
export default{
  components:{DateTimeComponent},
  data(){
    return{
      phone:'15528478472',//电话号码
      userInfo:{
        showFlag:0,
        phone:'188****7869'
      },
      selectStatus:'0',//选中状态：0-拼车；1-包车；3-预约
      amap:{},//高德地图信息
      addressInfo:{
        infoObj:'',
        startAddress:'',
        startInfoObj:{},
        endAddress:'',
        endInfoObj:{}
      },
      showDateTimeInfo:{
        showFlag:false,
        appointFlag:0,//0-未预约，1：预约
        time:'',//预约时间
        defaultSelect:[0,0,0],//默认选中状态
      },
      person:0,//乘车人数
      remarks:'',//备注
      inputFoucs:false,
      errorInfoMsg:{
        errorMsg:null
      }
    }

  },
  mounted(){
    const that = this;
    //初始化数据信息
    that.init();
    //获取当前位置信息
  },
  methods:{
    //init数据信息
    init(){
      const that = this;
      //获取当前经纬度信息
      getCurrentLocation().then(res=>{
        if(res.code==200){//获取经纬度成功
          let latng = res.data;
          var map = new AMap.Map('container',{
            resizeEnable:true,
            center:[latng.longitude,latng.latitude],
            zoom:16,
            scrollWheel:true
          })
          that.amap = map;
          // 创建一个 Icon
          var currentIcon = new AMap.Icon({
            // 图标尺寸
            size: new AMap.Size(26, 42),
            // 图标的取图地址
            image: require("./../../../images/currentLocation.png"),
            // 图标所用图片大小
            imageSize: new AMap.Size(26, 42),
            // 图标取图偏移量
            imageOffset: new AMap.Pixel(0, 0)
          });
          //将icon传入marke位置处
          // 将 icon 传入 marker
          var currentIconMaker = new AMap.Marker({
            position: new AMap.LngLat(latng.longitude,latng.latitude),
            icon: currentIcon,
            offset: new AMap.Pixel(-13, -30)
          });
          // 将 markers 添加到地图
          map.add([currentIconMaker]);
          //获取地址信息
          that.geocoder(latng.longitude+','+latng.latitude);

        }
      })
    },
    //获取地理位置信息
    geocoder(location){
      const that = this;
      let amap = that.amap, mgeocoder;
      amap.plugin(["AMap.Geocoder"], function () {
        mgeocoder = new AMap.Geocoder({});
        //获取详细地址信息
        mgeocoder.getAddress(location,function(status,result){
          //获取地址成功
          if (status === 'complete' && result.info === 'OK'){
            let addressInfo = result.regeocode;
            that.addressInfo={
              infoObj:addressInfo,
              startAddress:addressInfo.addressComponent.neighborhood,
              endAddress:''
            }
          }else{//获取地址失败
            console.log('根据经纬度获取地址失败');
          }
        });
      });
    },
    //重新定位
    getReposition(){
      const that = this;
      that.addressInfo={
        infoObj:{},
        startAddress:'',
        endAddress:''
      }
      //获取定位信息
      that.init();
    },
    //显示用户中心 1:显示；2：隐藏
    showUserInfo(type){
      const that = this;
      that.userInfo.showFlag=type;
    },
    //获取订单详情
    goTOrderList(){
      const that = this;
      that.$router.push({name:'OrderList',query:{phone:that.phone}})
    },
    //改变拼车方式
    changeSelect(type){
      const that = this;
      that.selectStatus=type;
    },
    //选择是否预约
    changeAppoint(){
      const that = this;
      that.showDateTimeInfo.appointFlag=(that.showDateTimeInfo.appointFlag==0)?1:0;
      that.showDateTimeInfo.time = '';
    },
    //选择弹出层样式
    showSelectTime(){
      const that = this;
      that.showDateTimeInfo={
        showFlag:true
      }
    },
    //取消预约
    cancelShow(){
      const that = this;
      that.showDateTimeInfo={
        showFlag:false,
        appointFlag:1,
        time:'',
        defaultSelect:[0,0,0]
      }
    },
    //确定日期选择
    confirmShow(obj){
      const that = this;
      that.showDateTimeInfo={
        showFlag:false,
        appointFlag:1,
        time:obj.time,
        defaultSelect:obj.defaultSelect
      }
    },
    //订单确认页面
    goTOrderConfirm(){
      const that = this;
      that.$router.push({name:'OrderPay',query:{phone:that.phone}})
    },
    //input 输入框获取焦点事件
    getFocus(){
      const that = this;
      that.inputFoucs=true;
    },
    //通过地址获取经纬度信息
    getAddressToLngt(address){
      const that = this;
      let amap = that.amap,mgeocoder;
      return new Promise(function (resolve,reject) {
        amap.plugin(["AMap.Geocoder"], function () {
          mgeocoder = new AMap.Geocoder({});
          //获取详细地址信息
          mgeocoder.getLocation(address,function(status,result){
            //获取地址成功
            if (status === 'complete' && result.info === 'OK'){
              resolve(result)
            }else{//获取地址失败
              reject([]);
            }
          });
        });
      })
    }
  },
  watch:{
    "addressInfo.startAddress":{
      handler(newValue,oldValue){
        const that = this;
        if(!newValue){
          that.errorInfoMsg.errorMsg=null;
          return;
        }
        that.getAddressToLngt(newValue).then(res=>{
          that.errorInfoMsg.errorMsg=null;
          that.addressInfo.startInfoObj = res.geocodes[0];//开始地址对象
        }).catch(error=>{
          that.errorInfoMsg.errorMsg='你输入的地址未能在地图上找到，请输入正确的地址'
        })
      },
      deep:true
    },
    "addressInfo.endAddress":{
      handler(newValue,oldValue){
        const that = this;
        if(!newValue){
          that.errorInfoMsg.errorMsg=null;
          return;
        }
        that.getAddressToLngt(newValue).then(res=>{
            let cityCode=res.geocodes[0].addressComponent.citycode;
            if(cityCode!=window.config.cityCode){
              that.errorInfoMsg.errorMsg='目的地只能设置为巴中，其他地区暂未开放，敬请期待'
            }else{
              that.addressInfo.endInfoObj=res.geocodes[0];//结束地址信息
              that.errorInfoMsg.errorMsg=null;
            }
        }).catch(error=>{
           that.errorInfoMsg.errorMsg='你输入的地址未能在地图上找到，请输入正确的地址'
        })
      },
      deep:true
    }
  }
}
