<!--行程订单支付页面-->
<style>
    @import "./../../css/Order/OrderPay.css";
</style>
<template>
    <div class="Orderpay">
        <div v-if="orderInfo.isExist">
            <!--订单信息--->
            <div class="boxContents">
                <div class="contents">
                    <div class="addressName">
                        <div class="displayFlex">
                            <div class="destination">
                                <div class="menu"><img src="./../../images/start_address.png" class="menuItemIcon"><span class="label">{{orderInfo.start}}</span></div>
                                <div class="menu"><img src="./../../images/end_address.png" class="menuItemIcon"><span class="label">{{orderInfo.destination}}</span></div>
                                <div class="menu"><img src="./../../images/time_icon.png" class="menuItemIcon">
                                    <span class="label" v-if="orderInfo.seatTime">{{formateDate(orderInfo.seatTime)}}&nbsp;{{orderInfo.userNum}}人拼车</span>
                                    <span class="label" v-else="orderInfo.date">{{formateDate(orderInfo.date)}} &nbsp;{{orderInfo.userNum}}人拼车</span>
                                </div>
                            </div>
                            <div class="price">
                                <div class="priceTile">费用合计</div>
                                <div class="priceNumber">￥{{orderInfo.price}}元</div>
                                <div class="payStatus">等待支付</div>
                            </div>
                        </div>
                        <!--orderAction-->
                        <div class="orderAction displayFlex">
                            <div class="actionItem cancel"><span @click="getOrderCancel">取消订单</span></div>
                            <div class="actionItem complaint"><span @click="getOrderComplaint">投诉</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <!--提示信息-->
            <div class="info"><div class="label">你的行程已经发布司机将在出发前15分钟和你联系</div></div>
            <!--地图显示信息-->
            <div class="mapContainer" id="mapContainer"></div>
            <!--立即支付-->
            <div class="bottomPay">
                <div class="pay" @click="goPay">立即支付</div>
            </div>
        </div>
        <!--订单取消信息-->
        <OrderCancel :orderCancelInfo="orderCancelInfo" :orderInfo="orderInfo" @closeCancel="closeCancel" @confirmCancel="confirmCancel" v-if="orderCancelInfo.showFlag==1"></OrderCancel>
        <!--订单投诉信息-->
        <OrderComplaints :orderComplaintsInfo="orderComplaintsInfo" :orderInfo="orderInfo" @cancelComplaint="cancelComplaint" @confirmComplaints="confirmComplaints" v-if="orderComplaintsInfo.showFlag==1"></OrderComplaints>
    </div>
</template>
<script>
    import OrderPay from './js/OrderPay.js'
    export default OrderPay
</script>