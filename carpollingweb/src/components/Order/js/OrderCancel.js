export default{
  props:['orderCancelInfo','orderInfo'],
  data(){
    return{
      currentSelect:-1,//当前选中状态
      reasonList:[
        {id:0,name:'赶时间，换用其他交通工具',select:false},
        {id:1,name:'行程有变，暂时不需要用车',select:false},
        {id:2,name:'平台派单太远',select:false},
        {id:3,name:'联系不上司机',select:false}
      ],
      reasonMarks:'',//其他理由
      errorMsg:'',
    }
  },
  mounted(){

  },
  methods:{
    //选择取消理由
    selectReason(index){
      const that = this;
      that.currentSelect=index;
    },
    //关闭，暂不齐小订单
    closeCancel(){
      const that = this;
      that.currentSelect=-1;
      that.currentSelect='';
      that.$emit('closeCancel');
    },
    //确认取消订单
    confirmCancel(){
      const that = this;
      let cancelReason = "";
      if(that.currentSelect!=-1){
        cancelReason = that.reasonList[that.currentSelect].name
      }
      if(that.reasonMarks){
        cancelReason+=','+that.reasonMarks
      }
      if(!cancelReason){
        that.errorMsg='请选择或输入取消订单原因';
        return
      }else{
        that.$http({
          url:window.config.apisServer+'/cancelorder',
          method:'POST',
          data:{
            orderId:that.orderInfo.orderId,
            cancelReason:cancelReason
          }
        }).then(res=>{
          if(res.status==200 && res.data=='success'){
            that.$emit('confirmCancel')
          }else{
            that.$message.errorMessage('订单取消失败');
          }
        }).catch(error=>{
            that.$message.errorMessage('订单取消失败');
        })
      }
    }
  },
  watch:{
    'currentSelect':{
      handler(newValue,oldValue){
        if(newValue!=-1){
          this.errorMsg=''
        }
      }
    },
    'reasonMarks':{
      handler(newValue,oldValue){
        if(newValue!=-1){
          this.errorMsg=''
        }
      }
    }
  }
}
