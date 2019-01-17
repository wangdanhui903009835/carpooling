<style>
  @import "./../../css/Login/LoginVerfy.css";
</style>
<template>
  <div class="LoginVerfy">
    <div class="title">输入验证码</div>
    <div class="contentsTime displayFlex">
      <div class="phone">验证码已发送至+86{{phone}}</div>
      <div class="time">{{time}}&nbsp;S</div>
    </div>
    <!--验证码-->
    <div class="verifiyCode displayFlex">
      <div class="codeItem"><input type="text" v-model="phoneCode[0]" :maxlength="1"></div>
      <div class="codeItem"><input type="text" v-model="phoneCode[1]" :maxlength="1"></div>
      <div class="codeItem"><input type="text" v-model="phoneCode[2]" :maxlength="1"></div>
      <div class="codeItem"><input type="text" v-model="phoneCode[3]" :maxlength="1"></div>
    </div>
    <!--重新获取验证码-->
    <div class="againCode" :class="time==0?'codeValiable':''"><span @click="getCode">重新获取验证码</span></div>
    <!--登录信息-->
    <div class="btn">
      <div class="errorMsg" v-if="errorInfo.showErrorFlag">提示:{{errorInfo.errorMsg}}</div>
      <div class="button" @click="login">登录</div>
    </div>
  </div>
</template>
<script>
  import LoginVerfy from './js/LoginVerfy.js'
  export default  LoginVerfy
</script>
