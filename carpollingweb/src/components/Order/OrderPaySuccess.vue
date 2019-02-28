<style>
@import "./../../css/Order/OrderPaySuccess.css";
</style>
<template>
    <div class="orderPaySuccess">
        <div class="contents">
            <div class="payIcon"><img src="./../../images/pay_success.png"></div>
            <div class="info" v-if="type==1">该订单仅支持线下支付</div>
            <div class="info" v-if="type==2">请同司机确认现金收付款</div>
            <div class="button displayFlex">
                <div class="buttonItem"><span @click="goToOrderList">查看订单</span></div>
                <div class="buttonItem"><span @click="goToIndex">返回首页</span></div>
            </div>
        </div>
    </div>
</template>
<script>
    import OrderPaySuccess from './js/OrderPaySuccess.js'
    export default OrderPaySuccess
</script>
