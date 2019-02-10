let timeInter=null;
export default{
  data(){
    return{
      phone:'',
      agreeSelectStatue:1,//1-同意agree协议；0-不统一agree协议
      code:'',
      time:'获取验证码'
    }
  },
  mounted(){
    const that = this;
    //let openId = window.utils.storage.getter('openId',1)||'54786104';
  },
  methods:{
    //判断用户是否有登录信息
    isLogin(){
      const that = this;
      return new Promise(function (resolve,reject) {
        that.$http({
          url:window.config.apisServer+'/phoneNum/'+that.phone,
          method:'Get',
          params:{}
        }).then(res=>{
          if(res.status==200 && res.data.phoneNum){//已存在用户信息
            resolve(true)
          }else{
            resolve(false)
          }
        }).catch(error=>{
          resolve(false)
        })
      })

    },
    //协议的同意和不同意
    agreeProtocol(){
      const that = this;
      let agreeSelectStatue=that.agreeSelectStatue;
      that.agreeSelectStatue=(agreeSelectStatue==1)?0:1;
    },
    //获取验证码
    getCode(){
      const that = this;
      if(parseInt(that.time.replace('s',''))>0){
        that.$message.errorMessage('请稍后重试');
        return;
      }
      if(that.checkForm()){
          //调用验证码接口
          that.$http({
            url:window.config.apisServer+'/genCode',
            method:'POST',
            data:{
              nationCode:'86',//固定区号86
              phoneNum:that.phone //电话号码
            }
          }).then(res=>{
            that.time='60s';
            window.utils.storage.setter('userPhone',that.phone,1);
            if(res.status==200 && res.data!='fail'){//验证码发送成功
              let token =res.data;
              //存储同肯值
              window.utils.storage.setter('token',token,1);
              that.cutDownTime();
              that.isLogin().then(res=>{
                if(res){//已存在该用户
                  that.$router.push({name:'Index',query:{phone:res.phoneNum}});
                }else{//不存在该用户
                  that.$message.errorMessage('验证码发送成功，请注意查收');
                }
              })
            }else{
              that.$message.errorMessage('验证码发送失败，请稍后重试');
            }
          }).catch(error=>{
            that.$message.errorMessage('验证码发送失败，请稍后重试');
          })
      }
    },
    //倒计时显示
    cutDownTime(){
      const that = this;
      let time = that.time;
      time=time.replace('s','');
      timeInter=setInterval(function(){
        time--;
        that.time=time+'s';
        if(time==0){
          clearInterval(timeInter);
          time='重新获取';
          that.time = time;
        }
      },1000)
    },
    //登录信息
    login(){
      const that = this;
      let phone = that.phone,
          phoneCode = that.code;
      if(!phone){
        that.$message.errorMessage('请输入电话号码');
        return;
      }
      if(that.agreeSelectStatue==0){
        that.$message.errorMessage('请先同意服务标准以及违约责任约定协议');
        return false;
      }
      if(!phoneCode){
        that.$message.errorMessage('请输入验证码');
        return;
      }
      clearInterval(timeInter);
      that.$http({
        url:window.config.apisServer+'/verify',
        method:'POST',
        data:{
          phoneNum:phone,
          verifyCode:that.code
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



    },
    checkForm(){
      const that = this;
      let phone=that.phone,
          agreeSelectStatue = that.agreeSelectStatue;
      if(!phone){
        that.$message.errorMessage('手机号码不能为空');
        return false;
      }
      if(phone){
        let myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        if(!myreg.test(phone)){
          that.$message.errorMessage('请输入正确的手机号码');
          return false;
        }
      }
      if(that.agreeSelectStatue==0){
        that.$message.errorMessage('请先同意服务标准以及违约责任约定协议');
        return false;
      }
      return true;
    }
  }
}
