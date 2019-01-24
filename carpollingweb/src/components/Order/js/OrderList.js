export default{
  data(){
    return{
      userPhonenum:'',
      orderList:[],//订单列表数据信息
    }
  },
  mounted(){
    const that = this;
    that.userPhonenum = window.utils.storage.getter('userPhone',1);
    that.init();
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
        if(res.status==200){//订单数据获取成功
          that.orderList = res.data;
        }
      }).catch(error=>{

      })
    },
    //格式化日期
    formateDate(val){
      const that = this;
      return that.$formateTimeToDate(val);
    },
  }
}