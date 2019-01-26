<style>
    @import "./../../css/Order/OrderCancel.css";
</style>
<template>
    <div class="orderCancel" v-if="orderCancelInfo.showFlag==1">
        <div class="contents">
           <!--取消关闭-->
           <div class="closeCancel displayFlex">
               <div class="item"><span @click="closeCancel">关闭</span></div>
               <div class="item"><span @click="closeCancel">暂不取消</span></div>
           </div>
           <!--取消原因-->
           <div class="reason">
               <div class="title">请选择取消原因</div>
               <div class="reasonItem" v-for="(item,index) in reasonList" @click="selectReason(index)">
                   <img src="./../../images/reason_select_in.png" class="selectImage" v-if="index==currentSelect">
                   <img src="./../../images/reason_select_out.png" class="selectImage" v-else>
                   <span>{{item.name}}</span>
               </div>
           </div>
           <!--其他原因-->
           <div class="otherReason">
               <div class="title">其他原因</div>
               <textarea placeholder="请输入取消原因..." v-model="reasonMarks"></textarea>
           </div>
           <!--确认取消-->
           <div class="confirmButton">
               <div class="errorMsg" v-if="errorMsg">提示:{{errorMsg}}</div>
               <span class="btn" @click="confirmCancel">确认取消</span>
           </div>
        </div>
    </div>
</template>
<script>
    import OrderCancel from './js/OrderCancel.js'
    export default OrderCancel;
</script>