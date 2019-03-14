<!--行程订单支付页面-->
<style>
    @import "./../../css/Order/OrderPay.css";
</style>
<template>
    <div class="Orderpay">
        <div>
            <!--订单信息--->
            <div class="boxContents">
                <div class="addressBox" :class="orderInfo.status>=2&&orderInfo.status<=4?'noPaddingAddressBox':''" id="addressBox">
                    <div class="contents" >
                        <div class="addressName">
                            <div class="displayFlex" v-if="orderInfo.status<=2||orderInfo.status==5||orderInfo.status==6">
                                <div class="destination">
                                    <div class="menu"><img src="./../../images/start_address_1.png" class="menuItemIcon"><span class="label">{{orderInfo.start}}</span></div>
                                    <div class="menu"><img src="./../../images/end_address_1.png" class="menuItemIcon"><span class="label">{{orderInfo.destination}}</span></div>
                                    <div class="menu"><img src="./../../images/time_icon.png" class="menuItemIcon">
                                        <span class="label" v-if="orderInfo.seatTime">{{formateDate(orderInfo.seatTime)}}&nbsp;{{orderInfo.userNum}}人乘车</span>
                                        <span class="label" v-else="orderInfo.date">{{formateDate(orderInfo.date)}} &nbsp;{{orderInfo.userNum}}人拼车</span>
                                    </div>
                                    <div class="menu detail_address" @click="showDetailAddress"><img src="./../../images/detail_address.png" class="menuItemIcon"><span class="label">地址详情</span></div>
                                    <!--圈定点-->
                                    <div class="dotDiv" id="dotDiv"><img src="./../../images/icon_menu.png"></div>
                                </div>
                                <div class="price">
                                    <div class="priceTile">费用合计</div>
                                    <div class="priceNumber">￥{{orderInfo.price}}元</div>
                                    <div class="payStatus">{{orderInfo.status<=5?'等待支付':'支付完成'}}</div>
                                </div>
                            </div>
                            <!--orderAction 取消投诉-->
                            <div class="orderAction displayFlex" v-if="orderInfo.status<=2||orderInfo.status==5">
                                <div class="actionItem cancel"><span @click="getOrderCancel" v-if="orderInfo.status<=1||orderInfo.receiptCancel">取消订单</span></div>
                                <div class="actionItem complaint"><span @click="getOrderComplaint" v-if="orderInfo.status==5">投诉</span></div>
                            </div>
                            <!--再次下单提示-->
                            <div class="orderAginOrder" v-if="orderInfo.status==6" @click="goToIndex"><span>订单已完成，点击可再次发布行程</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <!--提示信息-->
            <div class="info" id="driverInfo" v-if="orderInfo.status<=1"><div class="label">你的行程已经发布司机将在出发前15分钟和你联系</div></div>
            <!--地图显示信息-->
            <div class="mapBox" id="mapBox">
                <div class="mapContainer" id="mapContainer"></div>
            </div>
            <!--显示司机的信息-->
            <div class="driverInfo displayFlex" v-if="orderInfo.status>=2 && orderInfo.status<=4">
                <div class="driverLogo"><img src="./../../images/defaultHeadImage.png"></div>
                <div class="driverContents">
                    <div class="name">{{driverInfo.driverFirstName}}师傅·{{driverInfo.carNum}}</div>
                    <div class="contentsBox">
                        <div class="carInfo">{{driverInfo.carColor}}·{{driverInfo.carType}}</div>
                        <div class="evaluate">
                            <img src="./../../images/star_full.png">
                            <img src="./../../images/star_full.png">
                            <img src="./../../images/star_full.png">
                            <img src="./../../images/star_harf.png">
                            <img src="./../../images/star_null.png">
                        </div>
                        <!--电话号码--->
                        <div class="telphone" @click="takePhone"><img src="./../../images/telphone.png"></div>
                    </div>
                </div>
            </div>
            <!--立即支付-->
            <div class="bottomPay displayFlex" id="payButton" v-if="orderInfo.status==5">
                <div class="pay" @click="wxPay">立即支付</div>
                <div class="pay" @click="goPay(2)">线下支付</div>
            </div>
        </div>
        <!--详细地址-->
        <div class="detailAddress" v-if="showDetailAddressFlag">
          <div class="contents">
            <div class="addreessItem">起始地址:{{orderInfo.start}}({{orderInfo.startFormateAddress}})</div>
            <div class="addreessItem">结束地址:{{orderInfo.destination}}({{orderInfo.destinationFormateAddress}}) </div>
          </div>
        </div>
        <!--订单取消信息-->
        <OrderCancel :orderCancelInfo="orderCancelInfo" :orderInfo="orderInfo" @closeCancel="closeCancel" @confirmCancel="confirmCancel" v-if="orderCancelInfo.showFlag==1"></OrderCancel>
        <!--订单投诉信息-->
        <OrderComplaints :orderComplaintsInfo="orderComplaintsInfo" :orderInfo="orderInfo" @cancelComplaint="cancelComplaint" @confirmComplaints="confirmComplaints" v-if="orderComplaintsInfo.showFlag==1"></OrderComplaints>
        <!--回到首页-->
        <img src="./../../images/return_index.png" class="returnBack" @click="goToIndex"/>
    </div>
</template>
<script>
    import OrderPay from './js/OrderPay.js'
    export default OrderPay
</script>
