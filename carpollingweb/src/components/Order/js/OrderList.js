export default{
  data(){
    return{
      userPhonenum:'',
      orderList:[
        {
          "orderId": "1547559550695_1552847474",
          "status": 0,
          "userPhonenum": "1552847474",
          "userNum": 3,
          "date": "1547559550695",
          "type": 0,
          "price": 140.5,
          "start": "巴中",
          "destination": "成都",
          "describe": "携带狗狗",
          "location": [
            42.045,
            75.654
          ],
          "payed": "no"
        },
        {
          "orderId": "1547559550696_1552847475",
          "status": 1,
          "userPhonenum": "1552847474",
          "userNum": 3,
          "date": "1547559550695",
          "type": 0,
          "price": 140.5,
          "start": "巴中",
          "destination": "成都",
          "describe": "携带狗狗",
          "location": [
            42.045,
            75.654
          ],
          "payed": "no"
        },
        {
          "orderId": "1547559550697_1552847476",
          "status": 1,
          "userPhonenum": "1552847474",
          "userNum": 3,
          "date": "1547559550695",
          "type": 0,
          "price": 140.5,
          "start": "巴中",
          "destination": "成都",
          "describe": "携带狗狗",
          "location": [
            42.045,
            75.654
          ],
          "payed": "no"
        }
      ],//订单列表数据信息
    }
  },
  mounted(){
    const that = this;
    that.userPhonenum = that.$route.query.phone;
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
        that.orderList = res;
      })
    },
    //格式化日期
    formateDate(val){
      const that = this;
      return that.$formateTimeToDate(val);
    },
  }
}