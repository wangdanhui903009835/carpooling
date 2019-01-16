<style>
    @import "./../../css/Login/Login.css";
</style>
<template>
    <div class="login">
        <div class="container">
            <div class="title">巴蜀行</div>
            <div class="detail">
                <div class="phoneNumber displayFlex">
                    <div class="label">+86</div>
                    <div class="phone"><input type="text" v-model="phone" placeholder="请输入手机号" :maxlength="11"/></div>
                </div>
                <div class="waringInfoDetail">未注册的手机号验证后自动创建巴蜀行账户</div>
                <div class="waringInfoDetail">为了方便联系请输入您常用的手机号码</div>
                <div class="agree displayFlex">
                    <div class="agreeItem imageIcon" @click="agreeProtocol()">
                        <img class="icon" src="./../../images/agreeSelectOut.png" v-if="agreeSelectStatue==0">
                        <img class="icon" src="./../../images/agreeSelectIn.png" v-if="agreeSelectStatue==1">
                    </div>
                    <div class="agreeItem" @click="agreeProtocol()">同意</div>
                    <div class="agreeItem contentsDetail" @click="agreeProtocol()">《服务标准以及违约责任约定》</div>
                </div>
            </div>
            <div class="loginBtn">
                <div class="errorMsg" v-if="errorInfo.showErrorFlag">提示:{{errorInfo.errorMsg}}</div>
                <div class="button" @click="login">获取验证码</div>
            </div>
        </div>
    </div>
</template>
<script>
    import Login from './js/Login.js'
    export default Login
</script>