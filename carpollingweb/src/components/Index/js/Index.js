import DateTimeComponent from './../DateTimeComponent.vue'
import SelecNumber from './../SelecNumber'
import AddressSelect from './../AddressSelect.vue'
let areaListMap = new Map().set('028',  {priceName:'成都市',countyName:'成都市'})
  .set('0827',{priceName:'巴州区',countyName:'巴州区'})
  .set('511902',{priceName:'巴中市巴州区',countyName:'巴州区'})
  .set('511903',{priceName:'巴中市恩阳区',countyName:'恩阳区'})
  .set('511923',{priceName:'巴中市平昌县',countyName:'平昌县'})
  .set('511921',{priceName:'巴中市通江县',countyName:'通江县'})
  .set('511922',{priceName:'巴中市南江县',countyName:'南江县'});
export default{
  components:{DateTimeComponent,SelecNumber,AddressSelect},
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
        startAddress:{
          text:'',
          location:{},
          getPriceText:'',
          city:'',
          countyName:'',
          formateAddress:'',
        },
        endAddress:{
          text:'',
          location:{},
          getPriceText:'',
          city:'',
          countyName:'',
          formateAddress:'',
        }
      },
      showDateTimeInfo:{
        showFlag:false,
        appointFlag:0,//0-未预约，1：预约
        time:'',//预约时间
        defaultSelect:[0,0,0],//默认选中状态
      },
      showTimeText:'预约时间',
      remarks:'',//备注
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
      showSelectNumber:{
        showFlag:false,
        number:1
      },
      //地址下拉页面的弹出
      showSelectAddress:{
        obj:{},
        type:0,
      },
      addressShow:false,
      numberRemarksFlag:false
    }
  },
  mounted(){
    const that = this;
    let phone = window.utils.storage.getter('userPhone',1);
    //获取电话号码
    that.phone=phone;
    //设置电话号码隐藏
    if(phone){
      that.userInfo.phone = phone.substr(0,3)+'****'+phone.substr(7,4);
    }
    that.getOrderStatus0().then(res=>{
      if(res.flag){//存在未完成的订单
        that.$router.push({name:'OrderPay',query:{orderCode:res.orderCode}});
      }else{
        //初始化数据信息
        that.getReposition()
      }
    }).catch(error=>{

    })
  },
  methods:{
    init(){
      const that = this;
      //设置默认地址栏信息
      let latng = {
        latitude:30.572269,
        longitude:104.066541
      };
      var amap = {};
      let sessionInitAddress = window.utils.storage.getter('initAddress',1);
      if(sessionInitAddress){
        that.addressInfo.startAddress=sessionInitAddress;
        let latng=sessionInitAddress.location
        //设置地图显示信息
        amap = new AMap.Map('container',{
          resizeEnable:true,
          center:[latng.longitude,latng.latitude],
          scrollWheel:true,
        })
        that.amap = amap;
        //marker标记
        that.setMarker(latng,1);
      }else{
        AMap.plugin('AMap.Geolocation', function() {
          var geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,//是否使用高精度定位，默认:true
            timeout: 2000,          //超过10秒后停止定位，默认：5s
            buttonPosition:'RB',    //定位按钮的停靠位置
            buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            zoomToAccuracy: true,   //定位成功后是否自动调整地图视野到定位点
            extensions:'all'
          });
          geolocation.getCurrentPosition(function(status,result){
            if(status=='complete'){//定位成功
              let poi = result.pois[0];
              //设置开始地址信息
              //设置开始地址信息
              that.setAddressInfo(result,0,'geo').then(res=>{
                window.utils.storage.setter('initAddress',res,1)
              });
              latng.longitude = poi.location.lng;
              latng.latitude = poi.location.lat;
              //设置地图显示信息
               amap = new AMap.Map('container',{
                resizeEnable:true,
                center:[latng.longitude,latng.latitude],
                scrollWheel:true,
              })
            }else{//定位失败，根据经纬度显示默认地址信息
              let mgeocoder;
              //设置地图显示信息
              amap = new AMap.Map('container',{
                resizeEnable:true,
                center:[latng.longitude,latng.latitude],
                scrollWheel:true,
              })
              amap.plugin(["AMap.Geocoder"], function () {
                mgeocoder = new AMap.Geocoder({
                  extensions:'all'
                });
                //获取详细地址信息
                mgeocoder.getAddress(latng.longitude+','+latng.latitude,function(status,result){
                  //获取地址成功
                  if (status === 'complete' && result.info === 'OK'){
                    //设置开始地址信息
                    that.setAddressInfo(result,0,'regeo').then(res=>{
                      window.utils.storage.setter('initAddress',res,1)
                    });
                  }else{//获取地址失败
                    console.log('根据经纬度获取地址失败');
                  }
                });
              });
            }
            //存储map地址信息
            that.amap = amap;
            //marker标记
            that.setMarker(latng,1);
          });
        });
      }
    },
    //地址信息的设置 type:0-开始位置信息，1-结束位置;geoType:geo-定位获取，regeo-逆地址编码
    setAddressInfo(result,type,geoType){
      const that = this;
      let addressComponent={},poi={},addressInfo={};
      return new Promise(function(resolve,reject){
        if(geoType=='geo'){
          addressComponent = result.addressComponent;
          poi = result.pois[0];
          //结构化地址信息
          addressInfo.formateAddress = result.formattedAddress;
        }else if(geoType=='regeo'){
          addressComponent = result.regeocode.addressComponent;
          poi = result.regeocode.pois[0];
          //结构化地址信息
          addressInfo.formateAddress = result.regeocode.formattedAddress;
        }
        //城市信息
        addressInfo.city=addressComponent.city;
        //地址显示信息
        let city = addressComponent.city.replace('市',''),name = poi.name;
        addressInfo.text=city+'·'+name;
        //经纬度信息
        addressInfo.location={
          longitude:poi.location.lng,
          latitude:poi.location.lat
        }
        //获取价格输入地址
        let code = addressComponent.adcode||addressComponent.citycode;
        if(areaListMap.has(code)){
          addressInfo.getPriceText=areaListMap.get(code).priceName;
          addressInfo.countyName =areaListMap.get(code).countyName;
        }else if(addressComponent.citycode=='028'){
          addressInfo.getPriceText=areaListMap.get('028').priceName;
          addressInfo.countyName =areaListMap.get('028').countyName;
        }else{
          addressInfo.getPriceText='--';
          addressInfo.countyName ='';
        }
        if(type==0){
          that.addressInfo.startAddress = addressInfo
        }else if(type==1){
          that.addressInfo.endAddress = addressInfo
        }
        resolve(addressInfo);
      })

    },
    //重新定位
    getReposition(){
      const that = this;
      window.utils.storage.remove('initAddress',1);
      that.addressInfo={
        startAddress:{
          text:'正在获取地理位置...',
          location:{},
          getPriceText:'',
          city:'',
          countyName:'',
          formateAddress:'',
        },
        endAddress:{
          text:'你要到哪里去?',
          location:{},
          getPriceText:'',
          city:'',
          countyName:'',
          formateAddress:'',
        }
      },
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
      that.showTimeText='预约时间';
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
      that.showTimeText='预约时间';
    },

    //确定日期选择
    confirmShow(obj){
      const that = this;
      that.showDateTimeInfo={
        showFlag:false,
        appointFlag:1,
        time:obj.time,
        defaultSelect:obj.defaultSelect
      };
      //设置显示日期
      that.showTimeText=obj.text;
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
        contents+=addressInfo.startAddress.text.split('·')[1]+"</div>";
        if(markerInfo.startMaker){
          amap.remove(markerInfo.startMaker);
          amap.remove(markerInfo.startTextMaker);
        }
      }else if(type==3){//结束值设置
        imgUrl = require("./../../../images/end_location.png");
        contents+=addressInfo.endAddress.text.split('·')[1]+"</div>";
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
        offset: new AMap.Pixel(-13, -60),
        style:{
        "font-size":"0.26rem",
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
      that.price=0;
      let addressInfo=that.addressInfo,
          url = window.config.apisServer+'/getprice',
          params = {
            start:addressInfo.startAddress.getPriceText,
            end:addressInfo.endAddress.getPriceText
          };
      if(!addressInfo.endAddress.text){
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
    //获取未支付的订单
    getOrderStatus0(){
      const that = this;
      return new Promise(function (resolve,reject) {
        that.$http({
          url:window.config.apisServer+'/getorder',
          method:'POST',
          data:{
            //userPhonenum:that.phone,
            userPhonenum:'18408229155',
            status:0
          }
        }).then(res=>{
          if(res.status==200&&res.data.length>0){
            let contents={
              flag:true,
              orderCode:res.data[0].orderCode
            }
            resolve(contents);
          }else{
            let contents={
              flag:false,
              orderCode:''
            }
            resolve(contents);
          }
        }).catch(error=>{
          let contents={
            flag:false,
            orderCode:''
          }
          resolve(contents);
        })
      })
    },
    //显示下拉人数的选择框
    selectNumber(){
      const that = this;
      that.showSelectNumber.showFlag=true;
    },
    //取消人数选择
    cancelShowSelect(){
      const that = this;
      that.showSelectNumber.showFlag=false;
    },
    //选择下拉人数确定
    confirmShowSelec(number){
      const that = this;
      that.showSelectNumber.showFlag=false;
      that.showSelectNumber.number = number;
    },
    //地址下拉选择 0-开始地址，1-结束地址
    showAddressSelect(type){
      const that = this;
      let showSelectAddress = that.showSelectAddress;
      if(type==0){
        showSelectAddress=that.addressInfo.startAddress
      }else if(type==1){
        showSelectAddress = that.addressInfo.endAddress;
      }
      showSelectAddress.type = type;
      that.showSelectAddress=showSelectAddress;
      that.addressShow=true;
      //显示人数信息和备注信息
      that.numberRemarksFlag=true;
  },
    //地址选择取消
    cancelShowAddressSelect(){
      const that = this;
      that.addressShow=false;
    },
    //地址选择确认
    confirmShowAddressSelect(obj){
      const that = this;
      that.addressShow=false;
      if(obj.type==0){//开始地址
        that.addressInfo.startAddress = obj
      }else if(obj.type==1){//结束地址
        that.addressInfo.endAddress=obj
      }
      //marker标记
      that.setMarker(obj.location,obj.type==0?2:3);
      //获取价格
      that.getPrice();
    },
    //确认发布信息
    confirmPublish(){
      const that = this;
      let addressInfo=that.addressInfo,showDateTimeInfo=that.showDateTimeInfo;
      if(!addressInfo.startAddress.text){
        that.$message.errorMessage('请选择起始位置');
      }
      if(!addressInfo.endAddress.text){
        that.$message.errorMessage('请选择目的地址');
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
        userNum:that.showSelectNumber.number,
        orderType:that.selectStatus,
        price:that.price,
        start:addressInfo.startAddress.text.split('·')[1],
        startFormateAddress:addressInfo.startAddress.formateAddress,
        destination:addressInfo.endAddress.text.split('·')[1],
        destinationFormateAddress:addressInfo.endAddress.formateAddress,
        describe:that.remarks,
        startLocation:[addressInfo.startAddress.location.longitude,addressInfo.startAddress.location.latitude],
        endLocation:[addressInfo.endAddress.location.longitude,addressInfo.endAddress.location.latitude],
        payed:'no',
        payType:0,//0-线下支付，1-微信支付,默认设置线下支付，线上支付还未开通
        date:new Date().getTime()
      };
      //判断是否存在预约时间,预约上线
      if(showDateTimeInfo.time){
        params.seatTime=showDateTimeInfo.time;
        params.seatTye=1;//0-实时，1-预约
      }else{
        params.seatTime=new Date().getTime();
        params.seatTye = 0;//0-实时，1-预约
      }
      if(Number.isNaN(parseFloat(params.price))){
        that.$message.errorMessage('请选择的区域不在运输范围之内');
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
          that.getOrderStatus0().then(res=>{
            if(res.flag){
              that.$message.errorMessage('你有未完成的订单，请先取消之前的订单');
            }else{
              that.$message.errorMessage('订单发布失败');
            }
          })

        }
      }).catch(error=>{
        that.$message.errorMessage('订单发布失败');
      })
    },
    //清除缓存数据信息
    clearCache(){
      const that = this;
      that.userInfo.showFlag=0;
      that.selectStatus='0';
      //清除结束地址信息
      that.addressInfo.endAddress={
        text:'',
        location:{},
        getPriceText:'',
        city:'',
        countyName:'',
        formateAddress:'',
      };
      that.showDateTimeInfo={
        showFlag:false,
        appointFlag:0,//0-未预约，1：预约
        time:'',//预约时间
        defaultSelect:[0,0,0],//默认选中状态
      };
      that.showTimeText='预约时间';
      that.remarks='';//备注
      that.price=0;
      that.showSelectNumber={
        showFlag:false,
        number:1,
      }
      that.showSelectAddress={
        obj:{},
        type:0
      };
      that.addressShow=false;
      that.numberRemarksFlag=false;
      //清除标记点
      let amap=that.amap;
      if(typeof amap.clearMap=='function'){
        amap.clearMap();
        //重新设置标记点
        let sessionInitAddress = window.utils.storage.getter('initAddress',1);
        if(sessionInitAddress){
          that.addressInfo.startAddress=sessionInitAddress;
          let latng=sessionInitAddress.location
          //marker标记
          that.setMarker(latng,1);
        }
      }
    }
  },
  watch:{
    '$route'(to,from){
      const that = this;
      if(to.name=='Index'){
        that.clearCache();//清除缓存数据
      }
    }
  },
}
