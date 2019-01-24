export default{
  props:['orderComplaintsInfo','orderInfo'],
  data(){
    return{
      complaintsReason:'',//投诉原因
      errorMsg:'',//提示信息
    }
  },
  mounted(){

  },
  methods:{
    //取消，关闭投诉
    cancelComplaint(){
      const that = this;
      that.complaintsReason='';
      that.$emit('cancelComplaint')
    },
    //确认投诉信息
    confirm(){
      const that = this;
      if(!that.complaintsReason){
        that.errorMsg='请填写投诉信息';
        return;
      }else{
        that.$http({
          url:window.config.apisServer+'/complaint',
          method:'POST',
          data:{
            orderId:that.orderInfo.orderId,
            complaint:that.complaintsReason
          }
        }).then(res=>{
          if(res.status==200 && res.data=='success'){
            //投诉成功
            that.complaintsReason='';
            that.$emit('confirmComplaints');
          }else{
            //投诉失败
            that.$message.errorMessage('订单投诉失败');
          }
        }).catch(error=>{
          that.$message.errorMessage('订单投诉失败');
        })
      }
    }
  },
  watch:{
    "complaintsReason":{
      handler(newValue,oldValue){
        const that = this;
        if(newValue){
          that.errorMsg='';
        }
      }
    }
  }
}