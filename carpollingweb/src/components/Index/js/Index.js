import DateTimeComponent from './../DateTimeComponent.vue'
let areaList =['成都','巴中','巴州区','恩阳区','平昌县','通江县','南江县'],
    chCityCode='028',bzCityCode = '0827';
let count = 0;
export default{
  components:{DateTimeComponent},
  data(){
    return{
      phone:'',//电话号码
      userInfo:{
        showFlag:0,
        phone:'',
      },
      selectStatus:'0',//选中状态：0-拼车；1-包车；
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
      userNum:1,//乘车人数
      remarks:'',//备注
      inputFoucs:false,
      errorInfoMsg:{
        errorMsg:'起点和终点只能在成都,巴州区,恩阳区,平昌县,通江县,南江县这几个区域，其他区域暂未开放'
      },
      //点标注信息
      markerInfo:{
        startMaker:null,
        startTextMaker:null,
        endMarker:null,
        endTextMarker:null
      },
      price:0,
    }

  },
  mounted(){
    const that = this;
    let phone = window.utils.storage.getter('userPhone',1)||'18208193702';
    //获取电话号码
    that.phone = phone;
    //设置电话号码隐藏
    that.userInfo.phone = phone.substr(0,3)+'****'+phone.substr(7,4);
    //初始化数据信息
    that.init();
  },
  methods:{
    init(){
      const that = this;
      let latng = {
        latitude:30.572269,
        longitude:104.066541
      };
      AMap.plugin('AMap.Geolocation', function() {
        var geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,//是否使用高精度定位，默认:true
          timeout: 10000,          //超过10秒后停止定位，默认：5s
          buttonPosition:'RB',    //定位按钮的停靠位置
          buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
        });
        geolocation.getCurrentPosition(function(status,result){
          console.log(result);
          if(status=='complete'){
            latng.latitude = result.position.lat;
            latng.longitude = result.position.lng;
          }
          //设置地图显示信息
          var map = new AMap.Map('container',{
            resizeEnable:true,
            center:[latng.longitude,latng.latitude],
            scrollWheel:true,
          })
          that.amap = map;
          //marker标记
          that.setMarker(latng,1);
          //获取地址信息
          that.geocoder(latng.longitude+','+latng.latitude);
        });
      });
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
              startAddress:addressInfo.addressComponent.city.replace('市',''),
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
    //input 输入框获取焦点事件
    getFocus(index){
      const that = this;
      that.inputFoucs=true;
      that.watchSetterMarker(that.addressInfo.startAddress,2);
      count++;
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
    },
    //标注信息
    setMarker(latng,type){
      const that = this;
      let amap = that.amap,
          imgUrl = "",
          markerInfo=that.markerInfo,
          contents="<div class='marker-route marker-marker-bus-from'>",
          addressInfo = that.addressInfo;
      if(type==1){//初始化值显示
        imgUrl = require("./../../../images/end_location.png");
        contents+="在这里上车"+"</div>";
        if(markerInfo.startMaker){
          amap.remove(markerInfo.startMaker);
          amap.remove(markerInfo.startTextMaker);
        }
      }else if(type==2){//开始值设置
        imgUrl = require("./../../../images/start_location.png");
        contents+=addressInfo.startAddress+"</div>";
        if(markerInfo.startMaker){
          amap.remove(markerInfo.startMaker);
          amap.remove(markerInfo.startTextMaker);
        }
      }else if(type==3){//结束值设置
        imgUrl = require("./../../../images/end_location.png");
        contents+=addressInfo.endAddress+"</div>";
        if(markerInfo.endMarker){
          amap.remove(markerInfo.endMarker);
          amap.remove(markerInfo.endTextMarker);
        }
      }
      //创建标记icon
      var currentImageIcon = new AMap.Icon({
        // 图标尺寸
        size: new AMap.Size(13, 21),
        // 图标的取图地址
        image: imgUrl,
        // 图标所用图片大小
        imageSize: new AMap.Size(13, 21),
        // 图标取图偏移量
        imageOffset: new AMap.Pixel(0, 0),
        visible:true
      });
      // 将 icon 传入 marker
      var currentIconMaker = new AMap.Marker({
        position: new AMap.LngLat(latng.longitude,latng.latitude),
        icon: currentImageIcon,
        offset: new AMap.Pixel(-13, -30)
      });
      //设置文本标记
      let textMarker = that.setTextMarker(latng,contents);
      //将 markers 添加到地图
      amap.add([currentIconMaker,textMarker]);
      amap.setFitView();

      //设置点标记的存储
      if(type==1||type==2){
        markerInfo.startMaker = currentIconMaker;
        markerInfo.startTextMaker=textMarker;
      }else if(type==3){
        markerInfo.endMarker = currentIconMaker;
        markerInfo.endTextMarker=textMarker;
      }
      //动态获取价格
      that.getPrice();
    },
    //设置文本标记
    setTextMarker(latng,contents){
      const that = this;
      let amap = that.amap;
      let textMarker = new AMap.Text({
        text:contents,
        textAlign:'center',
        verticalAlign:'middle',
        position:[latng.longitude,latng.latitude],
        offset: new AMap.Pixel(-13, -50),
        style:{
        "font-size":"0.24rem",
          height:"0.66rem",
          "line-height":"0.66rem",
          padding:"0rem 0.6rem",
          "text-align":"center",
          "border-radius":"0.33rem"
        }
      })
      return textMarker;
    },
    //获取价格
    getPrice(){
      const that = this;
      let addressInfo=that.addressInfo,
          url = window.config.apisServer+'/getprice',
          params = {
            start:addressInfo.startAddress,
            end:addressInfo.endAddress
          };
      if(!addressInfo.endAddress){
        return
      }else{
        that.$http({
          url:url,
          method:'POST',
          data:params
        }).then(res=>{
          if(res.status==200){//请求成功
            that.price = res.data;
          }
        }).catch(error=>{
        })
      }
    },
    //确认发布信息
    confirmPublish(){
      const that = this;
      let addressInfo=that.addressInfo,showDateTimeInfo=that.showDateTimeInfo;
      if(!addressInfo.startAddress){
        that.$message.errorMessage('请输入开始地址');
      }
      if(!addressInfo.endAddress){
        that.$message.errorMessage('请输入目的地址');
        return;
      }
      //预约信息
      if(showDateTimeInfo.appointFlag==1 && !showDateTimeInfo.time){
        that.$message.errorMessage('请选择预约时间');
        return;
      }
      let params={
        status:'0',
        userPhonenum:that.phone,
        userNum:that.userNum,
        orderType:that.selectStatus,
        price:that.price,
        start:addressInfo.startAddress,
        destination:addressInfo.endAddress,
        describe:that.remarks,
        startLocation:[addressInfo.startInfoObj.location.lng,addressInfo.startInfoObj.location.lat],
        endLocation:[addressInfo.endInfoObj.location.lng,addressInfo.endInfoObj.location.lat],
        payed:'no',
        payType:0,//0-线下支付，1-微信支付,默认设置线下支付，线上支付还未开通
        date:new Date().getTime()
      };
      //判断是否存在预约时间,预约上线
      if(showDateTimeInfo.time){
        params.seatTime=showDateTimeInfo.time;
        params.seatTye=1;//0-实时，1-预约
      }else{
        params.seatTime=null;
        params.seatTye = 0;//0-实时，1-预约
      }
      if(Number.isNaN(parseFloat(params.price))){
        return;
      }
      that.$http({
        url:window.config.apisServer+'/ordering',
        method:'POST',
        data:params
      }).then(res=>{
        if(res.status==200 && res.data!='failed'){
          that.$router.push({name:'OrderPay',query:{orderCode:res.data}});
        }else{
          that.$message.errorMessage('订单发布失败');
        }
      }).catch(error=>{

      })
    },
    getAreaLimit(info){
      const that = this;
      let level = info.level,addressComponent= info.addressComponent;
      let contents={
        addressName:'',
        flag:false
      };
      if(addressComponent.citycode==chCityCode){
        //成都所有区县
        contents.flag=true;
        return contents
      }else if(addressComponent.citycode==bzCityCode && level=='市'){
        contents.flag=true;
        return contents
      }else if(areaList.indexOf(addressComponent.district)>-1){
        contents.flag=true;
        return contents;
      }else{
        //不在配送范围之内
        return contents;
      }
    },
    //标记信息
    watchSetterMarker(value,type){
      const that = this;
      that.getAddressToLngt(value).then(res=>{
        let info = res.geocodes[0],areaLimitContents = that.getAreaLimit(info);
        if(areaLimitContents.flag){//输入的地址有效
          if(type==2){
            that.addressInfo.startInfoObj = info;//开始地址对象
          }else if(type==3){
            that.addressInfo.endInfoObj=info;//结束地址信息
          }
          let latng={
            longitude:info.location.lng,
            latitude:info.location.lat
          };
          that.setMarker(latng,type);
       }else{
          that.price='--';
        }
      }).catch(error=>{
        that.price='--';

      })
    },
  },
  watch:{
    "addressInfo.startAddress":{
      handler(newValue,oldValue){
        const that = this;
        if(count==0){
          return;
        }
        let timer = null;
        clearTimeout(timer);
        timer = setTimeout(function(){
          if(!newValue){
            that.price=0;
            return;
          }
          that.watchSetterMarker(newValue,2);
        },500);
      },
      deep:true,

    },
    "addressInfo.endAddress":{
      handler(newValue,oldValue){
        const that = this;
        let timer = null;
        clearTimeout(timer);
        timer = setTimeout(function(){
          if(!newValue){
            that.price=0;
            return;
          }
          that.watchSetterMarker(newValue,3);
        },500);
      },
      deep:true
    }
  }
}
