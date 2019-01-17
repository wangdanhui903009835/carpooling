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
          "status":0,
          userPhonenum:that.userPhonenum
        }
      }).then(res=>{
        that.orderList = res;
      })
    },
    //格式化日期
    formateDate(val){
      const that = this;
      let currentDate = new Date();//今天日期
      let tomorrowDate = new Date(currentDate.getTime()+24*60*60*1000);
      val = parseInt(val,10);
      if(val<=0 || isNaN(val)){
        return '';
      }else{
        let msg='';//页面显示信息
        let orderDate = new Date(val),//订单日期
        //今天的日期
        currentYYYYMMDD = currentDate.getFullYear()+'/'+that.getDateLength(currentDate.getMonth()+1)+'/'+that.getDateLength(currentDate.getDate()),
        //明天日期
        tomorrowYYYYMMDD = tomorrowDate.getFullYear()+'/'+that.getDateLength(tomorrowDate.getMonth()+1)+'/'+that.getDateLength(tomorrowDate.getDate()),
        //订单日期
        orderYYYYMMDD=orderDate.getFullYear()+'/'+that.getDateLength(orderDate.getMonth()+1)+'/'+that.getDateLength(orderDate.getDate()),
        //小时
        hours = orderDate.getHours(),
        //分钟
        minutes = orderDate.getMinutes();
        if(currentYYYYMMDD==orderYYYYMMDD){//今天日期
          msg='今天 '+hours+':'+minutes;
        }else if(tomorrowYYYYMMDD==orderYYYYMMDD){//明天日期
          msg='明天 '+hours+':'+minutes;
        }else{
          msg=orderYYYYMMDD+' '+hours+':'+minutes;
        }
        return msg;
      }
    },
    //日期格式统一
    getDateLength(val){
      if(val.toString().length!=2){
        val='0'+val
      }
      return val;
    }
  }
}