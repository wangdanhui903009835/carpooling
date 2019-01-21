let timeInter=null;
export  default{
  data(){
    return{
      phone:'',
      phoneCode:[],
      time:60,
      errorInfo:{
        showErrorFlag:false,
        errorMsg:''
      }
    }
  },
  mounted(){
    const that = this;
    let query = that.$route.query;
    that.phone=query.phone;
    //计算倒计时
    that.cutDownTime();
  },
  methods:{
    //倒计时显示
    cutDownTime(){
      const that = this;
      let time = that.time;
      timeInter=setInterval(function(){
        time--;
        that.time=time;
        if(time==0){
          clearInterval(timeInter)
        }
      },1000)
    },
    //重新获取验证码
    getCode(){
      const that = this;
      if(that.time>0){
        return
      }else{
        that.time=60;
        that.cutDownTime();
      }
    },
    //登录信息
    login(){
      const that = this;
      let phone = that.phone,
          phoneCode = that.phoneCode;
      if(phoneCode.length!=4){
        that.errorInfo={
          showErrorFlag:true,
          errorMsg:'请输入4位验证码'
        }
        return;
      }else{
        //清除错误信息
        that.errorInfo={
          showErrorFlag:false,
          errorMsg:''
        }
        clearInterval(timeInter);
        that.$http({
          url:window.config.apisServer+'/verify',
          method:'POST',
          data:{
            phoneNum:phone,
            verifyCode:that.phoneCode.join('')
          }
        }).then(res=>{
          if(res){
            //进入首页信息
            that.$router.push({name:'Index'})
          }
        })
      }
    }
  }
}
