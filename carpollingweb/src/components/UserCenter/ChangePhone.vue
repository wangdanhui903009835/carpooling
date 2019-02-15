<style>
    @import "./../../css/UserCenter/ChangePhone.css";
</style>
<template>
    <div class="changePhone">
        <div class="ErrorMsg"></div>
        <div class="contents">
            <div class="item displayFlex">
                <div class="label">原手机号码:</div>
                <div class="value"><input type="text" :maxlength="11" placeholder="请输入11位手机号码" v-model="oldPhone"></div>
            </div>
            <div class="item displayFlex">
                <div class="label">新手机号码:</div>
                <div class="value"><input type="text" :maxlength="11" placeholder="请输入11位手机号码" v-model="newPhone"></div>
            </div>
            <div class="item displayFlex">
                <div class="label">确认手机号:</div>
                <div class="value"><input type="text" :maxlength="11" placeholder="请输入11位手机号码" v-model="confirmNewPhone"></div>
            </div>
            <div class="errorMsg displayFlex" v-if="errorMsg">
              <img src="./../../images/error_msg.png"/>
              <div>{{errorMsg}}</div>
            </div>
            <div class="button" @click="changePhone()">提交</div>
        </div>
    </div>
</template>
<script>
    import ChangPhone from './js/ChangePhone.js'
    export default ChangPhone
</script>
