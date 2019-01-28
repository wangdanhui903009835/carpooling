export default{
  data(){
    return{
      userPhonenum:'',
      orderList:[],//订单列表数据信息
    }
  },
  mounted(){
    const that = this;
    //loading开始加载
    that.$indicator.open();
    that.userPhonenum = window.utils.storage.getter('userPhone',1);
    that.init();
    //判断页面是否从取消订单页面跳转过来
    let orderCancel = that.$route.query.pageForm;
    if(orderCancel){//10秒速之后再次刷新页面
      setTimeout(function(){
        that.init();
      },10000)
    }
  },
  methods:{
    //获取订单信息
    init(){
      const that = this;
      that.$http({
        url:window.config.apisServer+'/getorder',
        method:'POST',
        data:{
          userPhonenum:that.userPhonenum
        }
      }).then(res=>{
        that.$indicator.close();
        if(res.status==200){//订单数据获取成功
          that.orderList = res.data;
        }
      }).catch(error=>{
        that.$indicator.close();
      })
    },
    //格式化日期
    formateDate(val){
      const that = this;
      return that.$formateTimeToDate(val);
    },
    //获取订单状态
    getStatus(type){
      switch (type){
        case 0:return '未接单';break;
        case 1:return '司机指派中';break;
        case 2:return '已接单';break;
        case 3:return '乘客已上车';break;
        case 4:return '行程中';break;
        case 5:return '到达';break;
        case 6:return '支付完成';break;
        case 7:return '取消订单';break;
        default:return '订单异常';break
      }
    },
    //查看订单详情
    goToDetail(index){
      const that = this;
      let item = that.orderList[index];
      if(item.status==7){
        that.$message.errorMessage('订单已取消');
        return;
      }else{
        that.$router.push({name:'OrderPay',query:{orderCode:item.orderCode}});
      }
    }
  }
}
