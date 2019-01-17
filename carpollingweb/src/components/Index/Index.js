import {getCurrentLocation} from './../../common/common.js';
export default{
  data(){
    return{
      phone:'15528478472',//电话号码
      userInfo:{
        showFlag:0,
        phone:'188****7869'
      },
      selectStatus:'1',//选中状态：1-拼车；2-包车；3-预约
      startAddress:'',//开始位置
      endAddress:'',//结束位置
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
          // 创建一个 Icon
          var currentIcon = new AMap.Icon({
            // 图标尺寸
            size: new AMap.Size(26, 42),
            // 图标的取图地址
            image: require("./../../images/currentLocation.png"),
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
          that.getAddressInfo(latng.longitude+','+latng.latitude).then(res=>{
            console.log(res);
          })
        }
      })
    },
    //微信经纬度换算高德地址信息
    getAddressInfo(location){
      const that = this;
      let url = "https://restapi.amap.com/v3/geocode/regeo?output=json&radius=1000&extensions=all&key="
        +window.config.AMapKey
        +"&location="+location;
      return new Promise(function(resolve,reject){
        that.$http({
          url:url,
          method:'GET',
        }).then(res=>{
          resolve(res);
        }).catch(error=>{
          alert(JSON.stringify(error));
          reject(error);
        })
      })
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
    }
  }
}