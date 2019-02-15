<style>
    @import "./../../css/UserCenter/ChangePhone.css";
</style>
<template>
    <div class="changePhone">
        <div class="ErrorMsg"></div>
        <div class="contents">
            <div class="item displayFlex">
                <div class="label">原手机号码</div>
                <div class="value"><input type="text" :maxlength="11"></div>
            </div>
            <div class="item displayFlex">
                <div class="label">新手机号码</div>
                <div class="value"><input type="text" :maxlength="11"></div>
            </div>
            <div class="item displayFlex">
                <div class="label">确认手机号码</div>
                <div class="value"><input type="text" :maxlength="11"></div>
            </div>
        </div>
    </div>
</template>
<script>
    import ChangPhone from './js/ChangePhone.js'
    export default ChangPhone
</script>