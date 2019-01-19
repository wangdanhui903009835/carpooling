import OrderCancel from './../OrderCancel.vue'
import OrderComplaints from './../OrderComplaints.vue'
export default{
  components:{OrderCancel,OrderComplaints},
  data(){
    return{
      phone:'',
      orderCancelInfo:{
        showFlag:0,//0-隐藏，1-显示
      },//订单取消信息
      orderComplaintsInfo:{
        showFlag:0,//0-隐藏，1-显示
      },//订单投诉信息
      orderInfo:{
        orderId: "1547559550695_1552847474",
        status: 2,
        userPhonenum: "1552847474",
        userNum: 3,
        date: "1547559550695",
        type: 0,
        price: 140.5,
        start: "巴中",
        destination: "成都",
        describe: "携带狗狗",
        startLocation:[104.04311,30.64242],
        endLocation:[105.04311,30.64242],
        location: [42.045, 75.654],
        payed: "no"
      },
      amap:{},
    }
  },
  mounted(){
    const that = this;
    that.phone = that.$route.query.phone;
    that.amap = new AMap.Map('mapContainer',{
      resizeEnable:true,
      scrollWheel:true,
      zoom:13
    });
    //测试信息
    that.getInitAmap();
    //获取订单信息
    that.getOrderInfo().then(res=>{
      //初始化地图信息
      that.getInitAmap();
    }).catch(error=>{
    });
  },
  methods:{

    //获取订单行程信息
    getOrderInfo(){
      const that = this;
      return new Promise(function(resolve,reject){
        that.$http({
          url:window.config.apisServer+'/getorder',
          method:'POST',
          data:{
            userPhonenum:that.phone,
            status:0
          }
        }).then(res=>{
          that.orderInfo = res;
          resolve(res)
        }).catch(error=>{
          reject(error)
        })
      })

    },
    //初始化地图信息
    getInitAmap(){
      const that = this;
      let amap = that.amap;
      amap.plugin(['AMap.Driving'],function() {
        var driving = new AMap.Driving({
          policy: AMap.DrivingPolicy.LEAST_TIME,
          map: amap,
          panel: 'mapContainer'
        });
        let startLocation =that.orderInfo.startLocation,
            endLocation = that.orderInfo.endLocation;
        driving.search(startLocation, endLocation,function(status,result){
          if(status === 'complete' && result.info === 'OK'){
          }else{
            console.log('获取驾车路线失败');
          }
        });
      });
    },
    //格式化日期
    formateDate(val){
      const that = this;
      return that.$formateTimeToDate(val);
    },
    //取消订单
    getOrderCancel(){
      const that = this;
      that.orderCancelInfo.showFlag=1;
    },
    //投诉
    getOrderComplaint(){
      const that = this;
      that.orderComplaintsInfo.showFlag=1;
    },
    //关闭，取消订单
    closeCancel(){
      const that = this;
      that.orderCancelInfo.showFlag=0;
    },
    //确认取消订单
    confirmCancel(){
      const that = this;
      that.orderCancelInfo.showFlag=0;
      //刷新订单状态
      that.getOrderInfo();
    },
    //关闭投诉信息
    cancelComplaint(){
      const that = this;
      that.orderComplaintsInfo.showFlag=0;
    },
    //确认投诉
    confirmComplaints(){
      const that = this;
      that.orderComplaintsInfo.showFlag=0;
      //刷新订单状态
      that.getOrderInfo();
    }

  }
}