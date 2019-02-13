export default{
  data(){
    return{
      type:1
    }
  },
  mounted(){
    const that = this;
    that.type=that.$route.query.type;
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