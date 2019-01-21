export default{
  data(){
    return{

    }
  },
  mounted(){

  },
  methods:{
    //查看订单
    goToOrderList(){
      const that = this;
      that.$router.push({name:'OrderList'})
    },
    //回到首页
    goToIndex(){
      const that = this;
      that.$router.push({name:'Index'});
    }
  }
}