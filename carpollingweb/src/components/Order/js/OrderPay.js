import OrderCancel from './../OrderCancel.vue'
import OrderComplaints from './../OrderComplaints.vue';
let pollingTime = null;
export default{
  components:{OrderCancel,OrderComplaints},
  data(){
    return{
      pageFrom:'',
      orderCode:'',
      phone:'',
      orderCancelInfo:{
        showFlag:0,//0-隐藏，1-显示
      },//订单取消信息
      orderComplaintsInfo:{
        showFlag:0,//0-隐藏，1-显示
      },//订单投诉信息
      orderInfo:{},
      amap:{},
      driverRouter:{},//驾车路线
      driverInfo:{},//司机信息
    }
  },
  mounted(){
    const that = this;
    //参数数据的获取
    that.phone = window.utils.storage.getter('userPhone','1');
    that.orderCode = that.$route.query.orderCode;
    //获取订单信息
    that.getOrderInfo().then(res=>{
      that.amap = new AMap.Map('mapContainer',{
        resizeEnable:true,
        scrollWheel:true,
        zoom:13
      });
       //初始化地图信息
      that.getInitAmap();
      //计算地图的高度
      that.setAmapHeight();
    }).catch(error=>{
      console.log(error);
    });
    //轮询获取订单最新状态信息
    pollingTime = setInterval(function(){
      that.getOrderInfo().then(res=>{
        //计算地图的高度
        that.setAmapHeight();
      })
    },30000)
  },
  methods:{
    //获取订单行程信息
    getOrderInfo(){
      const that = this;
      let url = '',params={};
      url = window.config.apisServer+'/getorderbyordercode';
      params={
        orderCode:that.orderCode
      }
      return new Promise(function(resolve,reject){
        that.$http({
          url:url,
          method:'POST',
          data:params
        }).then(res=>{
          if(res.status==200){//订单数据获取成功
            let orderInfo=res.data;
            that.orderInfo = orderInfo;
            //隐藏遮罩层取消订单
            that.orderCancelInfo.showFlag = 0;
            that.orderComplaintsInfo.showFlag = 0;
            if(orderInfo.status==6){//订单已完成
              that.$router.push({name:'Index'});
              clearInterval(pollingTime);
              pollingTime = null;
            }
            //获取司机信息
            if(orderInfo.status==2||orderInfo.status==3 ||orderInfo.status==4){
            }
            resolve(orderInfo)
          }else{
            reject(null)
          }
        }).catch(error=>{
          reject(error)
        })
      })
    },
    //计算地图显示的高度
    setAmapHeight(){
      const that = this;
      that.$nextTick(function(){
        let clientHeight = document.body.clientHeight,
          addressBox = document.getElementById('addressBox'),
          driverInfo = document.getElementById('driverInfo'),
          payButton = document.getElementById('payButton'),
          addressBoxHeight = 0,driverInfoHeight=0,payButtonHeight = 0;
        if(addressBox){
          addressBoxHeight=addressBox.offsetHeight;
        }
        if(driverInfo){
          driverInfoHeight = driverInfo.offsetHeight;
        }
        if(payButton){
          payButtonHeight = payButton.offsetHeight;
        }
        let amapHeight = clientHeight-addressBoxHeight-driverInfoHeight-payButtonHeight;
        let mapBox =  document.getElementById('mapBox');
        if(mapBox){
          mapBox.style.height=amapHeight+'px';
        }
      });
    },
    //初始化地图信息
    getInitAmap(){
      const that = this;
      let amap = that.amap;
      amap.plugin(['AMap.Driving'],function() {
        var driving = new AMap.Driving({
          policy: AMap.DrivingPolicy.LEAST_TIME,
          map: amap,
          panel: 'mapContainer',
        });
        let startLocation =that.orderInfo.startLocation,
            endLocation = that.orderInfo.endLocation;
        driving.search(startLocation, endLocation,function(status,result){
          if(status === 'complete' && result.info === 'OK'){
          }else{
            console.log('获取驾车路线失败');
          }
        });
        //存储路线图
        that.driverRouter = driving;
      });
    },

    //获取司机信息
    getDriverInfo(orderId){
      const that = this;
      that.$http({
        url:window.config.apisServer+'/queryderverinfo',
        method:'POST',
        data:{
          orderId:orderId
        }
      }).then(res=>{

      })
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
      that.$message.successMessage('订单取消成功');
      setTimeout(function(){
        //页面跳转到订单列表页面
        that.$router.push({name:'Index'});
      },3000)
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
    },
    //立即支付
    goPay(){
      const that = this;
      that.$http({
        url:window.config.apisServer+'/payrecord',
        method:'POST',
        data:{
          orderCode:that.orderInfo.orderCode,
          payed:'yes'
        }
      }).then(res=>{
        if(res.status==200 && res.data=='success'){
          that.$router.push({name:'OrderPaySuccess'});
        }else{
          that.$message.errorMessage('支付失败');
        }
      }).catch(error=>{
          that.$message.errorMessage('支付失败');
      })
    }
  }
}
