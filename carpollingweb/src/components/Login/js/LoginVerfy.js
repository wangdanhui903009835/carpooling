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
        that.$http({
          url:window.config.apisServer+'/genCode',
          method:'POST',
          data:{
            nationCode:'86',//固定区号86
            phoneNum:that.phone //电话号码
          }
        }).then(res=>{
          if(res.status==200 && res.data=='true'){//验证码发送成功
            that.$message.successMessage('验证码发送成功,请注意查收');
          }else{
            that.$message.errorMessage('验证码发送失败，请稍后再试');
          }
        }).catch(error=>{

        })
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
        window.utils.storage.setter('userPhone',phone,1);
        that.$http({
          url:window.config.apisServer+'/verify',
          method:'POST',
          data:{
            phoneNum:phone,
            verifyCode:that.phoneCode.join('')
          }
        }).then(res=>{
          if(res.status==200 && res.data){//验证成功
            window.utils.storage.setter('userPhone',phone,1);
            //进入首页信息
            that.$router.push({name:'Index'})
          }else{
            that.$message.errorMessage('验证码或手机号码输入错误');
          }
        }).catch(error=>{
          that.$message.errorMessage('验证码或手机号码输入错误');
        })
      }
    }
  }
}
