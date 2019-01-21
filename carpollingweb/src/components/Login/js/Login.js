export default{
  data(){
    return{
      phone:'',
      agreeSelectStatue:1,//1-同意agree协议；0-不统一agree协议
      errorInfo:{
        showErrorFlag:false,
        errorMsg:'请输入手机号码'
      }
    }
  },
  mounted(){
    const that = this;
    let openId = window.utils.storage.getter('openId',1)||'54786104';
    that.isLogin(openId);
  },
  methods:{
    //判断用户是否有登录信息
    isLogin(openid){
      const that = this;
      that.$http({
        url:window.config.apisServer+'/phoneNum',
        method:'Get',
        params:{
          openid:openid
        }
      }).then(res=>{
        if(res.status==0){//已存在用户信息
          that.$router.push({name:'Index',query:{phone:res.phoneNum}});
        }
      })
    },
    //协议的同意和不同意
    agreeProtocol(){
      const that = this;
      let agreeSelectStatue=that.agreeSelectStatue;
      that.agreeSelectStatue=(agreeSelectStatue==1)?0:1;
    },
    //登录按钮
    login(){
      const that = this;
      that.$router.push({name:'LoginVerfy',query:{phone:that.phone}})
      if(that.checkForm()){
        that.$http({
          url:window.config.apisServer+'/genCode',
          method:'POST',
          data:{
            nationCode:'86',//固定区号86
            phoneNum:that.phone //电话号码
          }
        }).then(res=>{
          that.$router.push({name:'LoginVerfy',query:{phone:that.phone}})
        })
      }
    },
    checkForm(){
      const that = this;
      let phone=that.phone,
          agreeSelectStatue = that.agreeSelectStatue;
      if(!phone){
        that.errorInfo={
          showErrorFlag:true,
          errorMsg:'手机号码不能为空'
        };
        return false;
      }
      if(phone){
        let myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        if(!myreg.test(phone)){
          that.errorInfo={
            showErrorFlag:true,
            errorMsg:'请输入正确的手机号码'
          };
          return false;
        }
      }
      if(agreeSelectStatue==0){
        that.errorInfo={
          showErrorFlag:true,
          errorMsg:'请先同意服务标准以及违约责任约定协议'
        };
        return false;
      }
      that.errorInfo.showErrorFlag=false;
      return true;
    }
  }
}
