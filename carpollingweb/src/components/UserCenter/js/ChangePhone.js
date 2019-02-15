import {MessageBox } from 'mint-ui'
export default{
  data(){
    return{
      oldPhone:'',
      newPhone:'',
      confirmNewPhone:'',
      errorMsg:'',
    }
  },
  mounted(){
    const that = this;
  },
  methods:{
    checkPhone(){
      const that = this;
      let myreg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
      if(!that.oldPhone){
        that.errorMsg='请输入原手机号码';
        return false
      }
      if(!myreg.test(that.oldPhone)){
        that.errorMsg='请输入正确的原手机号码';
        return false;
      }
      if(!that.newPhone){
        that.errorMsg='请输入新手机号码';
        return false
      }
      if(!myreg.test(that.newPhone)){
        that.errorMsg='请输入正确的新手机号码';
        return false;
      }
      if(!that.confirmNewPhone){
        that.errorMsg='请输入确认手机号码';
        return false
      }
      if(!myreg.test(that.confirmNewPhone)){
        that.errorMsg='请输入正确的确认手机号码';
        return false;
      }
      if(that.newPhone!=that.confirmNewPhone){
        that.errorMsg="两次输入的新手机号码不一致";
        return false;
      }
      return true
    },
    //更改电话号码
    changePhone(){
      const that = this;
      if(!that.checkPhone()){
        return
      }else{
        that.errorMsg="";
        this.$messagebox.confirm('确认修改电话号码','温馨提示').then(res=>{
          that.$http({
            url:window.config.apisServer+'/changephone',
            method:'POST',
            data:{
              userPhonenum:that.oldPhone,
              newphonenum:that.newPhone
            }
          }).then(res=>{
            if(res.status==200 && res.data=='success'){
              that.oldPhone='';
              that.newPhone = '';
              that.confirmNewPhone = '';
              that.$message.successMessage('电话号码修改成功');
            }else{
              that.$message.errorMessage('电话号码修改失败');
            }
          })
        }).catch(error=>{
        })
      }
      //电话号码变更

    }
  }
}
