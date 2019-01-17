<style>
    @import "./../../css/Order/OrderList.css";
</style>
<template>
    <div class="OrderList">
        <div class="orderItem" v-for="(item,index) in orderList">
            <div class="contents">
                <div class="title displayFlex">
                    <div class="status">
                       <span v-if="item.status==0">已取消</span>
                       <span v-if="item.status==1">已完成</span>
                       <span v-if="item.status==2">已结束</span>
                    </div>
                    <div class="time">{{formateDate(item.date)}}</div>
                </div>
                <div class="addressName displayFlex">
                    <div :class="item.status==0?'orderCancel':'orderGoing'">
                        <div class="start"><img src="./../../images/start_address.png" class="startIcon"><span>{{item.start}}</span></div>
                        <div class="end"><img src="./../../images/end_address.png" class="endIcon"><span>{{item.destination}}</span></div>
                        <div class="number" v-if="item.status==1"><img src="./../../images/time_icon.png" class="timeIcon">
                            <span>{{formateDate(item.date)}} &nbsp;{{item.userNum}}人拼车</span>
                        </div>
                    </div>
                    <div class="price" v-if="item.status==1">
                        <div class="priceTile">费用合计</div>
                        <div class="priceNumber">￥{{item.price}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import OrderList from './js/OrderList.js'
    export default OrderList
</script>