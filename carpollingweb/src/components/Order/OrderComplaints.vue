<style>
    @import "./../../css/Order/OrderComplaints.css";
</style>
<template>
    <div class="OrderComplaints">
        <div class="contents">
            <!--取消关闭-->
            <div class="closeCancel displayFlex">
                <div class="item"><span @click="cancelComplaint">关闭</span></div>
                <div class="item"><span @click="cancelComplaint">暂不投诉</span></div>
            </div>
            <!--投诉原因-->
            <div class="complaintsReason">
                <textarea placeholder="请输入投诉内容..." v-model="complaintsReason"></textarea>
            </div>
            <!--确认取消-->
            <div class="confirmButton">
                <div class="errorMsg" v-if="errorMsg">提示:{{errorMsg}}</div>
                <span class="btn" @click="confirm">确认投诉</span>
            </div>
        </div>
    </div>
</template>
<script>
    import OrderComplaints from './js/OrderComplaints.js'
    export default OrderComplaints;
</script>